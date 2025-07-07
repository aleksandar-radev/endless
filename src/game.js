import { updatePlayerLife, updateEnemyStats, updateStageUI, updateResources, updateBuffIndicators } from './ui/ui.js';
import { playerAttack, enemyAttack, playerDeath, defeatEnemy, createDamageNumber } from './combat.js';
import { game, hero, crystalShop, skillTree, statistics, dataManager, setGlobals, options } from './globals.js';
import Enemy from './enemy.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateBossUI } from './ui/bossUi.js';

class Game {
  constructor() {
    this.activeTab = 'stats';
    this.fightMode = 'explore'; // Default fight mode
    this.gameStarted = false;
    this.currentEnemy = null;
    this.currentRegionId = null;
    this.stage = 1;
    this.resurrectCount = 0; // Track number of resurrections
    this.soulShopResurrectCount = 0; // Track number of resurrections from SoulShop
    this.lastPlayerAttack = Date.now();
    this.lastRegen = Date.now();
  }

  incrementStage() {
    this.stage += 1;
    if (this.stage > hero.highestStage) {
      if (statistics.highestStageReached < this.stage) {
        statistics.set('highestStageReached', null, this.stage);
      }
      hero.highestStage = this.stage;
    }

    updateStageUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  getStartingStage() {
    // if option set, use it. else use crystalShop's startingStage or 0
    return options.startingStage > 0 ? options.startingStage : 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
  }

  damagePlayer(damage) {
    const activeBuffs = skillTree.getActiveBuffEffects();
    if (activeBuffs && activeBuffs.manaShieldPercent) {
      // If manaShieldPercent is active, apply it
      let manaDamage = Math.floor(damage * activeBuffs.manaShieldPercent / 100);
      manaDamage = Math.min(manaDamage, hero.stats.currentMana);
      this.restoreMana(-manaDamage);
      // special handling of popup when mana is negative:
      createDamageNumber({ text: `-${manaDamage}`, isPlayer: true, isCritical: false, color: 'blue' });
      damage -= manaDamage; // Reduce the damage by the mana damage
    }
    if (damage < 1) return;

    hero.stats.currentLife -= damage;
    if (hero.stats.currentLife <= 0) {
      // check if ressurection will proc
      if (!hero.willRessurect()) {
        hero.stats.currentLife = 0;
        playerDeath();
      }
    }
    updatePlayerLife();
    createDamageNumber({ text: `-${Math.floor(damage)}`, isPlayer: true });
  }

  healPlayer(heal) {
    hero.stats.currentLife += heal;
    if (hero.stats.currentLife > hero.stats.life) {
      hero.stats.currentLife = hero.stats.life;
    }

    // handle special case for BERSERKER class, where lifePerHit can be negative
    if (hero.stats.currentLife <= 0) {
      playerDeath();
    }

    updatePlayerLife();

    let color;
    if (heal > 0) {
      color = 'green';
    } else {
      color = 'red';
    }
    if (heal >= 1) {
      createDamageNumber({ text: '+' + Math.floor(heal), isPlayer: true, isCritical: false, color });
    }
  }

  restoreMana(mana) {
    hero.stats.currentMana += mana;
    if (hero.stats.currentMana > hero.stats.mana) {
      hero.stats.currentMana = hero.stats.mana;
    }
    updatePlayerLife();

    let color;
    if (mana > 0) {
      color = 'blue';
    }

    if (mana >= 1) {
      createDamageNumber({ text: mana, isPlayer: true, isCritical: false, color });
    }
  }

  damageEnemy(damage, isCritical = false) {
    damage = Math.floor(damage); // Ensure damage is an integer
    if (this.fightMode === 'arena' && this.currentEnemy) {
      // Boss damage flow
      const isDead = this.currentEnemy.takeDamage(damage);

      // Always show damage number
      createDamageNumber({ text: damage, isPlayer: false, isCritical: false, color: 'red' });

      if (isDead) {
        defeatEnemy();
      }
      updateEnemyStats();
      // Refresh boss UI
      updateBossUI();
      return;
    }
    // Regular enemy flow
    if (this.currentEnemy) {
      // Only update highestDamageDealt if damage is greater than the current value
      if (damage > statistics.highestDamageDealt) {
        statistics.set('highestDamageDealt', null, damage);
      }
      this.currentEnemy.currentLife -= damage;
      if (this.currentEnemy.currentLife < 0) this.currentEnemy.currentLife = 0;

      createDamageNumber({ text: damage, isPlayer: false, isCritical: isCritical, color: 'red' });

      updateEnemyStats();

      if (this.currentEnemy.currentLife <= 0) {
        defeatEnemy();
      }
    }
  }

  resetAllLife() {
    hero.stats.currentLife = hero.stats.life;
    hero.stats.currentMana = hero.stats.mana;
    updatePlayerLife();
    this.currentEnemy.resetLife();
    updateEnemyStats();

    // Reset combat timers
    const currentTime = Date.now();
    this.lastPlayerAttack = currentTime;
    if (this.currentEnemy) {
      this.currentEnemy.lastAttack = currentTime;
    }
  }

  // Add auto-save functionality to gameLoop
  gameLoop() {
    if (!this.gameStarted) return;

    // Update buff timers and effects
    skillTree.getActiveBuffEffects();
    skillTree.processSummons();
    updateBuffIndicators();

    const currentTime = Date.now();
    playerAttack(currentTime);
    enemyAttack(currentTime);

    const deltaSeconds = 0.1; // gameLoop runs every 100ms
    statistics.addFightTime(deltaSeconds);

    // Regenerate life and mana every 100 ms
    if (currentTime - this.lastRegen >= 100) {
      hero.regenerate();
      this.lastRegen = currentTime;
    }

    // Only update CrystalShop UI after stage progression
    if (this.stageChanged) {
      this.stageChanged = false; // Reset flag
      crystalShop.initializeCrystalShopUI(); // Update CrystalShop UI
    }

    if (currentTime % 30000 < 16) {
      dataManager.saveGame();
    }

    // Auto-cast logic: run every game loop
    skillTree.autoCastEligibleSkills();
  }

  toggle() {
    this.gameStarted = !this.gameStarted;

    if (this.gameStarted) {
      this.currentEnemy.lastAttack = Date.now();
      // Reset life and update resources
      this.resetAllLife();
      updateResources();
      updateEnemyStats();
    } else {
      // Stop all active buffs when combat ends
      skillTree.stopAllBuffs();
      updateBuffIndicators();

      // Reset stage and enemy for Explore mode
      this.stage = this.getStartingStage();
      updateStageUI();
      updateStatsAndAttributesUI();
      if (this.fightMode === 'arena' && this.currentEnemy) {
        this.currentEnemy = this.currentEnemy;
      } else {
        this.currentEnemy = new Enemy(this.stage);
      }

      hero.stats.currentLife = hero.stats.life; // Reset player life
      hero.stats.currentMana = hero.stats.mana; // Reset player mana
      this.currentEnemy.resetLife(); // Reset enemy life
      updatePlayerLife();
      updateEnemyStats();
    }
  }

  resetAllProgress() {
    setGlobals({ reset: true });
    // reload to update UI
    window.location.reload();
    // TODO: update all UI, create a method for this, insteafd of reloading. LOW PRIORITY
    dataManager.saveGame();
  }
}

export default Game;
