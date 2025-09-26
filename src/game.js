import { updatePlayerLife, updateEnemyStats, updateStageUI, updateResources, updateBuffIndicators } from './ui/ui.js';
import { playerAttack, enemyAttack, playerDeath, defeatEnemy, createDamageNumber } from './combat.js';
import { game, hero, crystalShop, skillTree, statistics, dataManager, setGlobals, options } from './globals.js';
import Enemy from './enemy.js';
import { RockyFieldEnemy } from './rockyField.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateBossUI, selectBoss } from './ui/bossUi.js';
import { getCurrentRegion } from './region.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';

function formatDamageBreakdown(breakdown) {
  if (!breakdown) return '';
  const parts = Object.entries(breakdown)
    .filter(([, val]) => Math.floor(val) > 0)
    .map(([type, val]) => `${t(type)} ${Math.floor(val)}`)
    .join(', ');
  return parts ? ` (${parts})` : '';
}

class Game {
  constructor(savedData = {}) {
    this.activeTab = savedData.activeTab || 'stats';
    this.fightMode = savedData.fightMode || 'explore'; // Default fight mode
    this.gameStarted = false;
    this.currentEnemy = null;
    this.currentRegionId = savedData.currentRegionId || null;
    this.currentBossRegionId = savedData.currentBossRegionId || null;
    this.stage = savedData.stage || 1; // Default to stage 1 if not provided
    this.rockyFieldStage = savedData.rockyFieldStage || 1;
    this.rockyFieldHighestStage = savedData.rockyFieldHighestStage || this.rockyFieldStage;
    this.rockyFieldRegion = savedData.rockyFieldRegion || 'outskirts';
    this.resurrectCount = 0; // Track number of resurrections
    this.soulShopResurrectCount = 0; // Track number of resurrections from SoulShop
    this.lastPlayerAttack = Date.now();
    this.lastRegen = Date.now();
    this.regenIntervalMs = 200;
    this.regenTicksPerSecond = 1000 / this.regenIntervalMs;
    // guard to prevent multiple kills in same tick
    this._justDefeated = false;
  }

  incrementStage() {
    // Use the stageSkip option unless resetStageSkip threshold is reached
    let stageSkip = options.stageSkip || 0;
    const resetAt = options.resetStageSkip || 0;
    if (stageSkip > 0 && resetAt > 0 && this.stage >= resetAt) {
      stageSkip = 0;
    }
    let newStage = this.stage + 1 + stageSkip;

    if (options.stageLockEnabled && options.stageLock > 0) {
      if (this.stage >= options.stageLock) {
        newStage = this.stage;
      } else if (newStage > options.stageLock) {
        newStage = options.stageLock;
      }
    }

    if (newStage !== this.stage) {
      this.stage = newStage;
      const region = getCurrentRegion();
      const tier = region.tier || 1;
      const current = statistics.highestStages?.[tier] || 0;
      if (this.stage > current) {
        statistics.set('highestStages', tier, this.stage);
      }
    }

    updateStageUI();
    updateResources(); // Update resources to reflect new crystal count
  }

  incrementRockyFieldStage() {
    this.rockyFieldStage += 1;
    if (this.rockyFieldStage > this.rockyFieldHighestStage) {
      this.rockyFieldHighestStage = this.rockyFieldStage;
    }
    updateStageUI();
  }

  getStartingStage() {
    // if option set, use it. else use crystalShop's startingStage or 0
    return options.startingStage > 0 ? options.startingStage : 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
  }

  damagePlayer(damage, breakdown) {
    const activeBuffs = skillTree.getActiveBuffEffects();
    if (activeBuffs && activeBuffs.manaShieldPercent) {
      // If manaShieldPercent is active, apply it
      let manaDamage = Math.floor(damage * activeBuffs.manaShieldPercent / 100);
      manaDamage = Math.min(manaDamage, hero.stats.currentMana);
      this.restoreMana(-manaDamage);
      // special handling of popup when mana is negative:
      createDamageNumber({ text: `-${Math.floor(manaDamage)}`, isPlayer: true, isCritical: false, color: 'blue' });
      damage -= manaDamage; // Reduce the damage by the mana damage
    }
    if (damage < 1) return;

    hero.stats.currentLife -= damage;
    battleLog.addBattle(
      tp('battleLog.receivedDamage', {
        value: Math.floor(damage),
        breakdown: formatDamageBreakdown(breakdown),
      }) + t('battleLog.autoAttack'),
    );
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

    if (heal >= 1) {
      battleLog.addBattle(tp('battleLog.healedLife', { value: Math.floor(heal) }));
    }
  }

  restoreMana(mana, { log = true } = {}) {
    hero.stats.currentMana += mana;
    if (hero.stats.currentMana > hero.stats.mana) {
      hero.stats.currentMana = hero.stats.mana;
    }
    if (hero.stats.currentMana < 0) {
      hero.stats.currentMana = 0;
    }
    updatePlayerLife();
    skillTree.updateToggleStates();

    if (log && mana >= 1) {
      battleLog.addBattle(tp('battleLog.restoredMana', { value: Math.floor(mana) }));
    }
  }

  damageEnemy(damage, isCritical = false, breakdown = null, skillName = null, summonName = null) {
    // bail out if we've already defeated this enemy this tick
    if (this._justDefeated) return;
    damage = Math.floor(damage); // Ensure damage is an integer
    let message;
    if (summonName) {
      message = tp('battleLog.summonDamage', {
        summon: summonName,
        value: damage,
        breakdown: formatDamageBreakdown(breakdown),
        critical: isCritical ? t('battleLog.critical') : '',
      });
    } else if (skillName) {
      message = tp('battleLog.castDamage', {
        skill: t(skillName),
        value: damage,
        breakdown: formatDamageBreakdown(breakdown),
        critical: isCritical ? t('battleLog.critical') : '',
      });
    } else {
      message = tp('battleLog.dealtDamage', {
        value: damage,
        breakdown: formatDamageBreakdown(breakdown),
        critical: isCritical ? t('battleLog.critical') : '',
      }) + t('battleLog.autoAttack');
    }
    battleLog.addBattle(message);

    // Only update highestDamageDealt if damage is greater than the current value
    if (damage > statistics.highestDamageDealt) {
      statistics.set('highestDamageDealt', null, damage);
    }
    document.dispatchEvent(new CustomEvent('damageDealt', { detail: damage }));
    createDamageNumber({ text: damage, isPlayer: false, isCritical: isCritical, breakdown: breakdown });

    if (this.fightMode === 'arena' && this.currentEnemy) {
      const isDead = this.currentEnemy.takeDamage(damage);

      if (isDead) {
        defeatEnemy();
        this._justDefeated = true;
      }
      updateEnemyStats();
      updateBossUI();
      return;
    }
    // Regular enemy flow
    if (this.currentEnemy) {
      this.currentEnemy.currentLife -= damage;
      if (this.currentEnemy.currentLife < 0) this.currentEnemy.currentLife = 0;

      updateEnemyStats();

      if (this.currentEnemy.currentLife <= 0) {
        defeatEnemy();
        this._justDefeated = true;
      }
    }
  }

  resetAllLife() {
    hero.stats.currentLife = hero.stats.life;
    hero.stats.currentMana = hero.stats.mana;
    updatePlayerLife();
    if (this.currentEnemy) {
      this.currentEnemy.resetLife();
      updateEnemyStats();
    }

    // Reset combat timers
    const currentTime = Date.now();
    this.lastPlayerAttack = currentTime;
    if (this.currentEnemy) {
      this.currentEnemy.lastAttack = currentTime;
    }
  }

  // Add auto-save functionality to gameLoop
  gameLoop() {
    const currentTime = Date.now();

    // Regenerate life and mana every 200 ms, even outside combat
    if (currentTime - this.lastRegen >= this.regenIntervalMs) {
      hero.regenerate(this.regenTicksPerSecond);
      this.lastRegen = currentTime;
    }

    if (!this.gameStarted) return;

    // Update buff timers and effects
    skillTree.getActiveBuffEffects();
    skillTree.processSummons();
    updateBuffIndicators();

    playerAttack(currentTime);
    enemyAttack(currentTime);

    const deltaSeconds = 0.1; // gameLoop runs every 100ms
    statistics.addFightTime(deltaSeconds);

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
      // starting a new fight, clear kill guard
      this._justDefeated = false;
      if (!this.currentEnemy) {
        if (this.fightMode === 'arena') {
          selectBoss();
        } else if (this.fightMode === 'rockyField') {
          this.currentEnemy = new RockyFieldEnemy(this.rockyFieldRegion, this.rockyFieldStage);
        } else {
          this.currentEnemy = new Enemy(this.stage);
        }
      }
      this.currentEnemy.lastAttack = Date.now();
      // Reset life and update resources
      // this.resetAllLife();
      updateResources();
      updateEnemyStats();
    } else {
      // Stop all active buffs when combat ends
      skillTree.stopAllBuffs();
      updateBuffIndicators();

      if (this.fightMode === 'arena') {
        // Ensure a boss is displayed when stopping in arena
        if (!this.currentEnemy) {
          selectBoss();
        } else {
          this.currentEnemy.resetLife();
          updateBossUI();
        }
      } else if (this.fightMode === 'rockyField') {
        if (!this.currentEnemy) {
          this.currentEnemy = new RockyFieldEnemy(this.rockyFieldRegion, this.rockyFieldStage);
        } else {
          this.currentEnemy.resetLife();
        }
        updateEnemyStats();
      } else {
        // Explore mode: keep existing enemy or generate one if missing
        if (!this.currentEnemy) {
          this.currentEnemy = new Enemy(this.stage);
        } else {
          this.currentEnemy.resetLife();
        }
        updateEnemyStats();
      }

      updatePlayerLife();
      updateStatsAndAttributesUI();
    }
  }

  resetAllProgress() {
    setGlobals({ reset: true });
    options.resetRequired = false; // Reset the flag after resetting progress
    dataManager.saveGame();
    window.location.reload();
  }
}

export default Game;
