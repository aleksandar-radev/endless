import { updatePlayerLife,
  updateEnemyStats,
  updateStageUI,
  updateResources,
  updateBuffIndicators,
  formatNumber } from './ui/ui.js';
import { playerAttack, enemyAttack, playerDeath, defeatEnemy, createDamageNumber, createCombatText } from './combat.js';
import { game, hero, crystalShop, skillTree, statistics, dataManager, setGlobals, options, achievements } from './globals.js';
import { AILMENTS } from './constants/ailments.js';
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
    .map(([type, val]) => `${t(type)} ${formatNumber(Math.floor(val))}`)
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
    this.overkillDamage = 0;
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
    // Rocky Field always increments by 1 - stage skip/lock options only apply to explore mode
    this.rockyFieldStage += 1;

    if (this.rockyFieldStage > statistics.get('rockyFieldHighestStages', this.rockyFieldRegion)) {
      statistics.set('rockyFieldHighestStages', this.rockyFieldRegion, this.rockyFieldStage);
    }
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
    if (activeBuffs && activeBuffs.manaShieldPercent && !(hero.stats.convertManaToLifePercent >= 1)) {
      // If manaShieldPercent is active, apply it
      const manaShieldPercent = activeBuffs.manaShieldPercent;
      const rawReduction = hero.stats.manaShieldDamageTakenReductionPercent || 0;
      const reduction = Math.max(0, Math.min(0.5, rawReduction));
      const costMultiplier = 1 - reduction;

      // Prevent a portion of the incoming damage from hitting life.
      // The prevented portion costs mana, reduced by `manaShieldDamageTakenReductionPercent`.
      let preventedDamage = Math.floor((damage * manaShieldPercent) / 100);
      if (preventedDamage > 0) {
        const currentMana = hero.stats.currentMana || 0;
        const maxPrevented = costMultiplier > 0 ? Math.floor(currentMana / costMultiplier) : preventedDamage;
        preventedDamage = Math.min(preventedDamage, maxPrevented);

        if (preventedDamage > 0) {
          const manaCost = Math.min(currentMana, Math.ceil(preventedDamage * costMultiplier));
          this.restoreMana(-manaCost);
          // special handling of popup when mana is negative:
          createDamageNumber({
            text: `-${Math.floor(manaCost)}`, isPlayer: true, isCritical: false, color: 'blue',
          });
          damage -= preventedDamage;
        }
      }
    }
    if (damage < 1) return;

    hero.stats.currentLife -= damage;
    battleLog.addBattle(
      tp('battleLog.receivedDamage', {
        value: formatNumber(Math.floor(damage)),
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
    const maxLife = hero.stats.life * (1 + (hero.stats.overhealPercent || 0));
    if (hero.stats.currentLife > maxLife) {
      hero.stats.currentLife = maxLife;
    }

    // handle special case for BERSERKER class, where lifePerHit can be negative
    if (hero.stats.currentLife <= 0) {
      if (!hero.willRessurect()) {
        hero.stats.currentLife = 0;
        playerDeath();
      }
    }

    if (heal > 0 && hero.stats.healDamagesEnemiesPercent > 0) {
      const healDmg = heal * hero.stats.healDamagesEnemiesPercent;
      game.damageEnemy(healDmg, false, null, 'healDamage');
    }

    updatePlayerLife();

    if (heal >= 1) {
      battleLog.addBattle(tp('battleLog.healedLife', { value: formatNumber(Math.floor(heal)) }));
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
      battleLog.addBattle(tp('battleLog.restoredMana', { value: formatNumber(Math.floor(mana)) }));
    }
  }

  damageEnemy(damage, isCritical = false, breakdown = null, skillName = null, summonName = null, extraOptions = {}) {
    // bail out if we've already defeated this enemy this tick
    if (this._justDefeated) return;

    if (this.currentEnemy && this.currentEnemy.currentLife === this.currentEnemy.life && damage >= this.currentEnemy.life) {
      achievements.trigger('kill', {
        isOneShot: true,
        sourceType: summonName ? 'summon' : 'player',
      });
    }

    if (damage > 0 && this.currentEnemy?.ailments[AILMENTS.shock.id]?.duration > 0) {
      const shockBonusBase = AILMENTS.shock.baseDamageTakenBonus;
      const shockEffectivenessPercent = hero.stats.shockEffectivenessPercent || 0;
      const shockMultiplier = 1 + shockBonusBase * (1 + shockEffectivenessPercent);
      damage *= shockMultiplier;
    }
    damage = Math.floor(damage); // Ensure damage is an integer
    let message;
    if (summonName) {
      message = tp('battleLog.summonDamage', {
        summon: summonName,
        value: formatNumber(damage),
        breakdown: formatDamageBreakdown(breakdown),
        critical: isCritical ? t('battleLog.critical') : '',
      });
    } else if (skillName) {
      message = tp('battleLog.castDamage', {
        skill: t(skillName),
        value: formatNumber(damage),
        breakdown: formatDamageBreakdown(breakdown),
        critical: isCritical ? t('battleLog.critical') : '',
      });
    } else {
      message =
        tp('battleLog.dealtDamage', {
          value: formatNumber(damage),
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
    createDamageNumber({
      text: damage,
      isPlayer: false,
      isCritical,
      breakdown,
      ...extraOptions,
    });

    if (this.fightMode === 'arena' && this.currentEnemy) {
      const isDead = this.currentEnemy.takeDamage(damage);

      if (isDead) {
        defeatEnemy(skillName);
        this._justDefeated = true;
      }
      updateEnemyStats();
      updateBossUI();
      return;
    }
    // Regular enemy flow
    if (this.currentEnemy) {
      this.currentEnemy.currentLife -= damage;

      updateEnemyStats();

      if (this.currentEnemy.currentLife <= 0) {
        defeatEnemy(skillName);
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
    if (window.perfMon?.enabled) window.perfMon.mark('gameLoop');

    const currentTime = Date.now();

    // Regenerate life and mana every 200 ms, even outside combat
    if (currentTime - this.lastRegen >= this.regenIntervalMs) {
      hero.regenerate(this.regenTicksPerSecond);
      this.lastRegen = currentTime;
    }

    // Process hero ailments (only decay warmup during combat)
    hero.processAilments(100, this.gameStarted);
    hero.updateAdBonuses(100);

    if (!this.gameStarted) {
      if (window.perfMon?.enabled) window.perfMon.measure('gameLoop');
      return;
    }

    // Update buff timers and effects
    skillTree.getActiveBuffEffects();
    skillTree.processSummons();
    updateBuffIndicators();

    playerAttack(currentTime);
    enemyAttack(currentTime);

    // Process DoTs on enemy
    if (this.currentEnemy && this.currentEnemy.currentLife > 0) {
      // gameLoop runs every 100ms (this.loopInterval = 100)
      this.currentEnemy.processDoT(100);
    }

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

    // Ensure ailment UI is updated regularly
    updatePlayerLife();
    updateEnemyStats();

    if (window.perfMon?.enabled) window.perfMon.measure('gameLoop', 5);
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
      const currentTime = Date.now();
      this.lastPlayerAttack = currentTime;
      if (this.currentEnemy) {
        this.currentEnemy.lastAttack = currentTime;
      }

      if (this.explosionDamage > 0 && this.currentEnemy) {
        const dmg = this.explosionDamage;
        this.explosionDamage = 0;
        createCombatText('EXPLOSION!', true);
        this.damageEnemy(dmg, false, null, 'explosion');
      }

      if (this.overkillDamage > 0 && this.currentEnemy) {
        const dmg = this.overkillDamage;
        this.overkillDamage = 0;
        createCombatText('OVERKILL!', true);
        this.damageEnemy(dmg, false, null, 'overkill');
      }

      // Reset life and update resources
      // this.resetAllLife();
      updateResources();
      updateEnemyStats();
    } else {
      this.overkillDamage = 0;
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
