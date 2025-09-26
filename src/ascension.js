import {
  hero,
  game,
  dataManager,
  setGlobals,
  prestige,
  ascension as ascensionState,
  options,
  runes,
  training,
  crystalShop,
  soulShop,
} from './globals.js';
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
    label: t('ascension.category.offense'),
    upgrades: {
      flatDamage: {
        label: t('ascension.upgrade.flatDamage'),
        bonus: 200,
        stat: 'damage',
      },
      flatAllDamage: {
        label: t('ascension.upgrade.flatAllDamage'),
        bonus: 30,
        stats: ['damage', ...ELEMENT_DAMAGE_STATS],
      },
      totalDamagePercent: {
        label: t('ascension.upgrade.totalDamagePercent'),
        bonus: 0.25,
        stat: 'totalDamagePercent',
      },
      elementalDamagePercent: {
        label: t('ascension.upgrade.elementalDamagePercent'),
        bonus: 0.3,
        stat: 'elementalDamagePercent',
      },
      // New offensive upgrades
      critChance: {
        label: t('ascension.upgrade.critChance'),
        bonus: 0.5,
        stat: 'critChance',
      },
      critDamage: {
        label: t('ascension.upgrade.critDamage'),
        bonus: 0.02,
        stat: 'critDamage',
      },
      attackRating: {
        label: t('ascension.upgrade.attackRating'),
        bonus: 1000,
        stat: 'attackRating',
      },
      chanceToHitPercent: {
        label: t('ascension.upgrade.chanceToHitPercent'),
        bonus: 0.01,
        stat: 'chanceToHitPercent',
        maxLevel: 50,
        cost: (lvl) => 5 + lvl * 2,
      },
      armorPenetration: {
        label: t('ascension.upgrade.armorPenetration'),
        bonus: 0.01, // +1% armor penetration per level
        stat: 'armorPenetrationPercent',
        maxLevel: 50,
      },
      elementalPenetration: {
        label: t('ascension.upgrade.elementalPenetration'),
        bonus: 0.01, // +1% elemental penetration per level
        stat: 'elementalPenetrationPercent',
        maxLevel: 50,
      },
    },
  },
  defense: {
    label: t('ascension.category.defense'),
    upgrades: {
      armor: {
        label: t('ascension.upgrade.armor'),
        bonus: 500,
        stat: 'armor',
      },
      evasion: {
        label: t('ascension.upgrade.evasion'),
        bonus: 500,
        stat: 'evasion',
      },
      armorPercent: {
        label: t('ascension.upgrade.armorPercent'),
        bonus: 0.25,
        stat: 'armorPercent',
      },
      evasionPercent: {
        label: t('ascension.upgrade.evasionPercent'),
        bonus: 0.25,
        stat: 'evasionPercent',
      },
      allResistance: {
        label: t('ascension.upgrade.allResistance'),
        bonus: 500,
        stat: 'allResistance',
      },
      allResistancePercent: {
        label: t('ascension.upgrade.allResistancePercent'),
        bonus: 0.25,
        stat: 'allResistancePercent',
      },
      life: {
        label: t('ascension.upgrade.life'),
        bonus: 1000,
        stat: 'life',
        cost: (lvl) => 1 + lvl,
      },
      mana: {
        label: t('ascension.upgrade.mana'),
        bonus: 500,
        stat: 'mana',
        cost: (lvl) => 1 + lvl,
      },
      lifePercent: {
        label: t('ascension.upgrade.lifePercent'),
        bonus: 0.2,
        stat: 'lifePercent',
        cost: (lvl) => 1 + lvl,
      },
      manaPercent: {
        label: t('ascension.upgrade.manaPercent'),
        bonus: 0.25,
        stat: 'manaPercent',
        cost: (lvl) => 1 + lvl,
      },
      // New defensive upgrades
      blockChance: {
        label: t('ascension.upgrade.blockChance'),
        bonus: 0.25,
        stat: 'blockChance',
      },
      lifeRegen: {
        label: t('ascension.upgrade.lifeRegen'),
        bonus: 2.5,
        stat: 'lifeRegen',
      },
      lifeRegenPercent: {
        label: t('ascension.upgrade.lifeRegenPercent'),
        bonus: 0.01,
        stat: 'lifeRegenPercent',
      },
    },
  },
  misc: {
    label: t('ascension.category.misc'),
    upgrades: {
      strengthEffectiveness: {
        label: t('ascension.upgrade.strengthEffectiveness'),
        bonus: 0.1,
        effect: 'strengthEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      agilityEffectiveness: {
        label: t('ascension.upgrade.agilityEffectiveness'),
        bonus: 0.1,
        effect: 'agilityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      vitalityEffectiveness: {
        label: t('ascension.upgrade.vitalityEffectiveness'),
        bonus: 0.1,
        effect: 'vitalityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      wisdomEffectiveness: {
        label: t('ascension.upgrade.wisdomEffectiveness'),
        bonus: 0.1,
        effect: 'wisdomEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      enduranceEffectiveness: {
        label: t('ascension.upgrade.enduranceEffectiveness'),
        bonus: 0.1,
        effect: 'enduranceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      dexterityEffectiveness: {
        label: t('ascension.upgrade.dexterityEffectiveness'),
        bonus: 0.1,
        effect: 'dexterityEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      intelligenceEffectiveness: {
        label: t('ascension.upgrade.intelligenceEffectiveness'),
        bonus: 0.1,
        effect: 'intelligenceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      perseveranceEffectiveness: {
        label: t('ascension.upgrade.perseveranceEffectiveness'),
        bonus: 0.1,
        effect: 'perseveranceEffectPercent',
        cost: (lvl) => 3 + lvl,
      },
      arenaBossSkip: {
        label: t('ascension.upgrade.arenaBossSkip'),
        bonus: 1,
        effect: 'arenaBossSkip',
        cost: (lvl) => 50 + 25 * lvl,
      },
      skillPointsPerLevel: {
        label: t('ascension.upgrade.skillPointsPerLevel'),
        bonus: 1,
        effect: 'skillPointsPerLevel',
        cost: (lvl) => 100 + 10 * lvl,
      },
      runeSlots: {
        label: t('ascension.upgrade.runeSlots'),
        bonus: 1,
        effect: 'runeSlots',
        cost: (lvl) => 20 * (lvl + 1),
        maxLevel: 9,
      },
      runeTabs: {
        label: t('ascension.upgrade.runeTabs'),
        bonus: 1,
        effect: 'runeTabUnlocks',
        cost: (lvl) => 2 + lvl,
        maxLevel: 8,
      },
      startingGold: {
        label: t('ascension.upgrade.startingGold'),
        bonus: 100000,
        stat: 'startingGold',
      },
      startingCrystals: {
        label: t('ascension.upgrade.startingCrystals'),
        bonus: 100,
        stat: 'startingCrystals',
      },
      startingSouls: {
        label: t('ascension.upgrade.startingSouls'),
        bonus: 300,
        stat: 'startingSouls',
      },
      reduceEnemyDamagePercent: {
        label: t('ascension.upgrade.reduceEnemyDamagePercent'),
        bonus: 0.01,
        stat: 'reduceEnemyDamagePercent',
        cost: (lvl) => 5 + lvl * 5,
        maxLevel: 50,
      },
      reduceEnemyHpPercent: {
        label: t('ascension.upgrade.reduceEnemyHpPercent'),
        bonus: 0.01,
        stat: 'reduceEnemyHpPercent',
        cost: (lvl) => 5 + lvl * 5,
        maxLevel: 50,
      },
      reduceEnemyAttackSpeedPercent: {
        label: t('ascension.upgrade.reduceEnemyAttackSpeedPercent'),
        bonus: 0.01,
        stat: 'reduceEnemyAttackSpeedPercent',
        cost: (lvl) => 5 + lvl * 5,
        maxLevel: 50,
      },
      // Cost reduction upgrades (percent values; combined additively with rune bonuses)
      trainingCostReduction: {
        label: t('ascension.upgrade.trainingCostReduction'),
        bonus: 0.01,
        effect: 'trainingCostReduction',
        cost: (lvl) => 10 + 2 * lvl,
        maxLevel: 50,
      },
      buildingCostReduction: {
        label: t('ascension.upgrade.buildingCostReduction'),
        bonus: 0.01,
        effect: 'buildingCostReduction',
        cost: (lvl) => 10 + 2 * lvl,
        maxLevel: 50,
      },
      crystalShopCostReduction: {
        label: t('ascension.upgrade.crystalShopCostReduction'),
        bonus: 0.01,
        effect: 'crystalShopCostReduction',
        cost: (lvl) => 12 + 3 * lvl,
        maxLevel: 50,
      },
      soulShopCostReduction: {
        label: t('ascension.upgrade.soulShopCostReduction'),
        bonus: 0.01,
        effect: 'soulShopCostReduction',
        cost: (lvl) => 12 + 3 * lvl,
        maxLevel: 50,
      },
      // Cap extension upgrades
      attackSpeedCap: {
        label: t('ascension.upgrade.attackSpeedCap'),
        bonus: 0.1,
        effect: 'attackSpeedCap',
        cost: (lvl) => 20 + 5 * lvl,
        maxLevel: 20,
      },
      critChanceCap: {
        label: t('ascension.upgrade.critChanceCap'),
        bonus: 2,
        effect: 'critChanceCap',
        cost: (lvl) => 20 + 5 * lvl,
        maxLevel: 25,
      },
      blockChanceCap: {
        label: t('ascension.upgrade.blockChanceCap'),
        bonus: 2,
        effect: 'blockChanceCap',
        cost: (lvl) => 20 + 5 * lvl,
        maxLevel: 15,
      },
      // Item % bonus cap extension (affects all percentage bonuses on items)
      itemPercentCapPercent: {
        label: t('ascension.upgrade.itemPercentCapPercent'),
        bonus: 0.01, // +1% to item % caps per level
        effect: 'itemPercentCapPercent',
        // Always costs 1 ascension point per level (no scaling)
      },
      // Resource gain
      crystalGainPercent: {
        label: t('ascension.upgrade.crystalGainPercent'),
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

    await setGlobals({ reset: true });
    // Reapply preserved options after reset
    Object.assign(options, preservedOptions);
    // after reset, ascensionState refers to the new instance
    ascensionState.points = saved.points;
    ascensionState.upgrades = saved.upgrades;
    // Ensure rune slot bonuses from ascension are applied after restore
    try { runes.ensureEquipSlots(BASE_RUNE_SLOTS + (ascensionState.getBonuses().runeSlots || 0)); } catch {}
    const ascBonuses = ascensionState.getBonuses();
    hero.gold += ascBonuses.startingGold || 0;
    hero.crystals = (hero.crystals || 0) + 100 + (ascBonuses.startingCrystals || 0);
    hero.souls += ascBonuses.startingSouls || 0;
    hero.queueRecalculateFromAttributes();
    dataManager.saveGame();
    window.location.reload();
  }
}
