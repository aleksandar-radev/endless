import { hero,
  game,
  dataManager,
  setGlobals,
  prestige,
  ascension as ascensionState,
  options,
  runes,
  training,
  crystalShop,
  achievements,
  soulShop } from './globals.js';
import { handleSavedData } from './functions.js';
import { showToast } from './ui/ui.js';
import { t } from './i18n.js';
import { ELEMENTS } from './constants/common.js';
import { BASE_RUNE_SLOTS } from './runes.js';
import { renderRunesUI } from './ui/runesUi.js';

const ELEMENT_DAMAGE_STATS = Object.keys(ELEMENTS).map((id) => `${id}Damage`);
const ELEMENT_RESISTANCE_STATS = Object.keys(ELEMENTS).map((id) => `${id}Resistance`);

export const ASCENSION_CATEGORIES = {
  offense: {
    label: 'ascension.category.offense',
    upgrades: {
      flatDamage: {
        label: 'ascension.upgrade.flatDamage',
        bonus: 200,
        stat: 'damage',
      },
      flatAllDamage: {
        label: 'ascension.upgrade.flatAllDamage',
        bonus: 30,
        stats: ['damage', ...ELEMENT_DAMAGE_STATS],
      },
      totalDamagePercent: {
        label: 'ascension.upgrade.totalDamagePercent',
        bonus: 0.25,
        stat: 'totalDamagePercent',
      },
      resourceDamageCapPerLevel: {
        label: 'ascension.upgrade.resourceDamageCapPerLevel',
        bonus: 10,
        stat: 'extraResourceDamageCapPerLevel',
        cost: 1,
      },
      // New offensive upgrades
      flatThornsDamage: {
        label: 'ascension.upgrade.flatThornsDamage',
        bonus: 300,
        stat: 'thornsDamage',
      },
      critChance: {
        label: 'ascension.upgrade.critChance',
        bonus: 0.5,
        stat: 'critChance',
      },
      critDamagePercent: {
        label: 'ascension.upgrade.critDamagePercent',
        bonus: 1,
        stat: 'critDamagePercent',
        cost: (lvl) => Math.floor(1 + lvl * 0.1),
      },
      attackRating: {
        label: 'ascension.upgrade.attackRating',
        bonus: 2700,
        stat: 'attackRating',
      },
      chanceToHitPercent: {
        label: 'ascension.upgrade.chanceToHitPercent',
        bonus: 0.01,
        stat: 'chanceToHitPercent',
        maxLevel: 20,
        cost: (lvl) => 5 + lvl * 2,
      },
      armorPenetration: {
        label: 'ascension.upgrade.armorPenetration',
        bonus: 0.01, // +1% armor penetration per level
        stat: 'armorPenetrationPercent',
        maxLevel: 50,
        cost: (lvl) => Math.floor(1 + lvl * 0.2),
      },
      elementalPenetration: {
        label: 'ascension.upgrade.elementalPenetration',
        bonus: 0.01, // +1% elemental penetration per level
        stat: 'elementalPenetrationPercent',
        maxLevel: 50,
        cost: (lvl) => Math.floor(1 + lvl * 0.2),
      },
    },
  },
  defense: {
    label: 'ascension.category.defense',
    upgrades: {
      armor: {
        label: 'ascension.upgrade.armor',
        bonus: 2700,
        stat: 'armor',
      },
      evasion: {
        label: 'ascension.upgrade.evasion',
        bonus: 2700,
        stat: 'evasion',
      },
      armorPercent: {
        label: 'ascension.upgrade.armorPercent',
        bonus: 0.25,
        stat: 'armorPercent',
      },
      evasionPercent: {
        label: 'ascension.upgrade.evasionPercent',
        bonus: 0.25,
        stat: 'evasionPercent',
      },
      allResistance: {
        label: 'ascension.upgrade.allResistance',
        bonus: 2000,
        stat: 'allResistance',
      },
      allResistancePercent: {
        label: 'ascension.upgrade.allResistancePercent',
        bonus: 0.25,
        stat: 'allResistancePercent',
      },
      life: {
        label: 'ascension.upgrade.life',
        bonus: 4000,
        stat: 'life',
      },
      mana: {
        label: 'ascension.upgrade.mana',
        bonus: 2000,
        stat: 'mana',
      },
      lifePercent: {
        label: 'ascension.upgrade.lifePercent',
        bonus: 0.2,
        stat: 'lifePercent',
      },
      manaPercent: {
        label: 'ascension.upgrade.manaPercent',
        bonus: 0.25,
        stat: 'manaPercent',
      },
      // New defensive upgrades
      blockChance: {
        label: 'ascension.upgrade.blockChance',
        bonus: 0.25,
        stat: 'blockChance',
      },
      lifeRegen: {
        label: 'ascension.upgrade.lifeRegen',
        bonus: 30,
        stat: 'lifeRegen',
      },
      lifeRegenPercent: {
        label: 'ascension.upgrade.lifeRegenPercent',
        bonus: 0.2,
        stat: 'lifeRegenPercent',
      },
    },
  },
  misc: {
    label: 'ascension.category.misc',
    upgrades: {
      strengthEffectiveness: {
        label: 'ascension.upgrade.strengthEffectiveness',
        bonus: 0.1,
        effect: 'strengthEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      agilityEffectiveness: {
        label: 'ascension.upgrade.agilityEffectiveness',
        bonus: 0.1,
        effect: 'agilityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      vitalityEffectiveness: {
        label: 'ascension.upgrade.vitalityEffectiveness',
        bonus: 0.1,
        effect: 'vitalityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      wisdomEffectiveness: {
        label: 'ascension.upgrade.wisdomEffectiveness',
        bonus: 0.1,
        effect: 'wisdomEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      enduranceEffectiveness: {
        label: 'ascension.upgrade.enduranceEffectiveness',
        bonus: 0.1,
        effect: 'enduranceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      dexterityEffectiveness: {
        label: 'ascension.upgrade.dexterityEffectiveness',
        bonus: 0.1,
        effect: 'dexterityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      intelligenceEffectiveness: {
        label: 'ascension.upgrade.intelligenceEffectiveness',
        bonus: 0.1,
        effect: 'intelligenceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      perseveranceEffectiveness: {
        label: 'ascension.upgrade.perseveranceEffectiveness',
        bonus: 0.1,
        effect: 'perseveranceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      arenaBossSkip: {
        label: 'ascension.upgrade.arenaBossSkip',
        bonus: 1,
        effect: 'arenaBossSkip',
        cost: (lvl) => 50 + 25 * lvl,
      },
      skillPointsPerLevel: {
        label: 'ascension.upgrade.skillPointsPerLevel',
        bonus: 1,
        effect: 'skillPointsPerLevel',
        cost: (lvl) => 100 + 10 * lvl,
      },
      attributesPerLevel: {
        label: 'ascension.upgrade.attributesPerLevel',
        bonus: 1,
        effect: 'attributesPerLevel',
        cost: (lvl) => 50 + 5 * lvl,
      },
      runeSlots: {
        label: 'ascension.upgrade.runeSlots',
        bonus: 1,
        effect: 'runeSlots',
        cost: (lvl) => 20 * (lvl + 1),
        maxLevel: 9,
      },
      runeTabs: {
        label: 'ascension.upgrade.runeTabs',
        bonus: 1,
        effect: 'runeTabUnlocks',
        cost: (lvl) => 2 + lvl,
        maxLevel: 8,
      },
      runeRetention: {
        label: 'ascension.upgrade.runeRetention',
        bonus: 1,
        effect: 'runeRetention',
        cost: 10,
        maxLevel: 1,
      },
      startingGold: {
        label: 'ascension.upgrade.startingGold',
        bonus: 100000,
        stat: 'startingGold',
      },
      startingCrystals: {
        label: 'ascension.upgrade.startingCrystals',
        bonus: 100,
        stat: 'startingCrystals',
      },
      startingSouls: {
        label: 'ascension.upgrade.startingSouls',
        bonus: 300,
        stat: 'startingSouls',
      },
      reduceEnemyDamagePercent: {
        label: 'ascension.upgrade.reduceEnemyDamagePercent',
        bonus: 0.01,
        stat: 'reduceEnemyDamagePercent',
        cost: (lvl) => 5 + lvl * 5,
        maxLevel: 50,
      },
      reduceEnemyHpPercent: {
        label: 'ascension.upgrade.reduceEnemyHpPercent',
        bonus: 0.01,
        stat: 'reduceEnemyHpPercent',
        cost: (lvl) => 5 + lvl * 5,
        maxLevel: 50,
      },
      // Cost reduction upgrades (percent values; combined additively with rune bonuses)
      trainingCostReduction: {
        label: 'ascension.upgrade.trainingCostReduction',
        bonus: 0.01,
        effect: 'trainingCostReduction',
        cost: (lvl) => 10 + 2 * lvl,
        maxLevel: 50,
      },
      buildingCostReduction: {
        label: 'ascension.upgrade.buildingCostReduction',
        bonus: 0.01,
        effect: 'buildingCostReduction',
        cost: (lvl) => 10 + 2 * lvl,
        maxLevel: 50,
      },
      crystalShopCostReduction: {
        label: 'ascension.upgrade.crystalShopCostReduction',
        bonus: 0.01,
        effect: 'crystalShopCostReduction',
        cost: (lvl) => 12 + 3 * lvl,
        maxLevel: 50,
      },
      soulShopCostReduction: {
        label: 'ascension.upgrade.soulShopCostReduction',
        bonus: 0.01,
        effect: 'soulShopCostReduction',
        cost: (lvl) => 12 + 3 * lvl,
        maxLevel: 50,
      },
      soulShopLevelCap: {
        label: 'ascension.upgrade.soulShopLevelCap',
        bonus: 50,
        effect: 'soulShopLevelCap',
      },
      // Cap extension upgrades
      attackSpeedCap: {
        label: 'ascension.upgrade.attackSpeedCap',
        bonus: 0.1,
        effect: 'attackSpeedCap',
        cost: (lvl) => 20 + 5 * lvl,
        maxLevel: 20,
      },
      critChanceCap: {
        label: 'ascension.upgrade.critChanceCap',
        bonus: 2,
        effect: 'critChanceCap',
        cost: (lvl) => 10 + 4 * lvl,
        maxLevel: 20,
      },
      blockChanceCap: {
        label: 'ascension.upgrade.blockChanceCap',
        bonus: 2,
        effect: 'blockChanceCap',
        cost: (lvl) => 20 + 5 * lvl,
        maxLevel: 15,
      },
      // Item % bonus cap extension (affects all percentage bonuses on items)
      itemPercentCapPercent: {
        label: 'ascension.upgrade.itemPercentCapPercent',
        bonus: 0.01, // +1% to item % caps per level
        effect: 'itemPercentCapPercent',
        // Always costs 1 ascension point per level (no scaling)
      },
      // Resource gain
      crystalGainPercent: {
        label: 'ascension.upgrade.crystalGainPercent',
        bonus: 0.1,
        effect: 'crystalGainPercent',
        cost: (lvl) => 10 + lvl,
        maxLevel: 100,
      },
    },
  },
};

export default class Ascension {
  constructor(savedData = null) {
    this.points = 0;
    this.upgrades = {};
    handleSavedData(savedData, this);
  }

  get config() {
    const map = {};
    for (const cat of Object.values(ASCENSION_CATEGORIES)) {
      Object.assign(map, cat.upgrades);
    }
    return map;
  }

  get categories() {
    return ASCENSION_CATEGORIES;
  }

  getBonuses() {
    const bonuses = {};
    for (const [key, lvl] of Object.entries(this.upgrades)) {
      if (!lvl) continue;
      const cfg = this.config[key];
      if (!cfg) continue;
      const value = lvl * cfg.bonus;
      if (cfg.stat) {
        bonuses[cfg.stat] = (bonuses[cfg.stat] || 0) + value;
      } else if (cfg.stats) {
        for (const stat of cfg.stats) {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        }
      } else if (cfg.effect) {
        bonuses[cfg.effect] = (bonuses[cfg.effect] || 0) + value;
      }
    }
    return bonuses;
  }

  canAscend() {
    return prestige.prestigeCount >= 20;
  }

  getEarnedPoints() {
    const totalCrystals = prestige.bonuses?.startingCrystals || 0;
    return Math.floor(totalCrystals / 100);
  }

  spendPoint(key) {
    const cfg = this.config[key];
    if (!cfg) return false;
    const current = this.upgrades[key] || 0;
    const cost = typeof cfg.cost === 'function' ? cfg.cost(current) : cfg.cost || 1;
    const max = cfg.maxLevel || Infinity;
    if (this.points < cost || current >= max) return false;
    const prevLife = hero?.stats?.life || 0;
    const prevMana = hero?.stats?.mana || 0;
    this.points -= cost;
    this.upgrades[key] = current + 1;
    if (cfg.stat === 'startingGold') {
      hero.gainGold(cfg.bonus);
    }
    if (cfg.stat === 'startingCrystals') {
      hero.gainCrystals(cfg.bonus);
    }
    if (cfg.stat === 'startingSouls') {
      hero.gainSouls(cfg.bonus);
    }
    // If max life/mana increased due to this purchase, heal/restore the delta immediately
    if (cfg.stat === 'life' || cfg.stat === 'lifePercent') {
      const delta = Math.max(0, (hero?.stats?.life || 0) - prevLife);
      if (delta > 0) game.healPlayer(delta);
    }
    if (cfg.stat === 'mana' || cfg.stat === 'manaPercent') {
      const deltaM = Math.max(0, (hero?.stats?.mana || 0) - prevMana);
      if (deltaM > 0) game.restoreMana(deltaM);
    }
    dataManager.saveGame();
    if (key === 'arenaBossSkip') {
      options.updateArenaBossSkipOption();
    }
    if (key === 'runeSlots') {
      runes.ensureEquipSlots(BASE_RUNE_SLOTS + this.getBonuses().runeSlots);
    }
    if (key === 'runeTabs') {
      try {
        renderRunesUI();
      } catch {}
    }

    // Recalculate immediately so effects apply right away
    hero.recalculateFromAttributes();

    // Update shop/training UIs to reflect new cost reductions immediately
    try {
      training?.updateTrainingAffordability?.('gold-upgrades');
      crystalShop?.initializeCrystalShopUI?.();
      soulShop?.invalidateDistributedMaxCache?.();
      soulShop?.updateSoulShopUI?.();
    } catch {}
    return true;
  }

  async ascend() {
    if (!this.canAscend()) {
      showToast(t('ascension.needPrestiges'));
      return;
    }
    const earned = this.getEarnedPoints();
    const saved = {
      points: this.points + earned,
      upgrades: this.upgrades,
    };
    // Preserve options just like prestige (except crystal-shop-tied ones)
    const preservedOptions = { ...options };
    ['startingStage', 'stageSkip', 'resetStageSkip', 'stageLockEnabled', 'stageLock'].forEach((k) => {
      delete preservedOptions[k];
    });

    // Preserve runes if the upgrade is purchased
    let preservedRunes = null;
    if (this.getBonuses().runeRetention) {
      preservedRunes = {
        equipped: runes.equipped,
        inventory: runes.inventory,
      };
    }

    // Ensure we lock in any currently met achievements before resetting stats
    achievements.checkForCompletion();

    const preservedAchievements = achievements.toJSON();

    await setGlobals({ reset: true });

    // Restore achievements
    if (achievements && preservedAchievements) {
      Object.entries(preservedAchievements).forEach(([id, data]) => {
        const ach = achievements.achievements.find((a) => a.id === id);
        if (ach) {
          ach.claimed = data.claimed;
          ach.reached = data.reached;
        }
      });
    }
    // Reapply preserved options after reset
    Object.assign(options, preservedOptions);
    // Reapply preserved runes after reset
    if (preservedRunes) {
      runes.equipped = preservedRunes.equipped;
      runes.inventory = preservedRunes.inventory;
    }
    // after reset, ascensionState refers to the new instance
    ascensionState.points = saved.points;
    ascensionState.upgrades = saved.upgrades;
    // Ensure rune slot bonuses from ascension are applied after restore
    try {
      runes.ensureEquipSlots(BASE_RUNE_SLOTS + (ascensionState.getBonuses().runeSlots || 0));
    } catch {}
    const ascBonuses = ascensionState.getBonuses();
    hero.gold += ascBonuses.startingGold || 0;
    hero.crystals = (hero.crystals || 0) + 100 + (ascBonuses.startingCrystals || 0);
    hero.souls += ascBonuses.startingSouls || 0;
    hero.queueRecalculateFromAttributes();
    await dataManager.saveGame({ force: true });
    window.location.reload();
  }
}
