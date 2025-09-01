import { hero, dataManager, setGlobals, prestige, ascension as ascensionState, options } from './globals.js';
import { handleSavedData } from './functions.js';
import { showToast } from './ui/ui.js';
import { t } from './i18n.js';
import { ELEMENTS } from './constants/common.js';

const ELEMENT_DAMAGE_STATS = Object.keys(ELEMENTS).map((id) => `${id}Damage`);
const ELEMENT_RESISTANCE_STATS = Object.keys(ELEMENTS).map((id) => `${id}Resistance`);
const ELEMENT_RESISTANCE_PERCENT_STATS = ELEMENT_RESISTANCE_STATS.map((s) => `${s}Percent`);

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
        bonus: 50,
        stat: 'armorPercent',
      },
      evasionPercent: {
        label: t('ascension.upgrade.evasionPercent'),
        bonus: 50,
        stat: 'evasionPercent',
      },
      elementalResistances: {
        label: t('ascension.upgrade.elementalResistances'),
        bonus: 500,
        stats: ELEMENT_RESISTANCE_STATS,
      },
      elementalResistancesPercent: {
        label: t('ascension.upgrade.elementalResistancesPercent'),
        bonus: 50,
        stats: ELEMENT_RESISTANCE_PERCENT_STATS,
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
        bonus: 100,
        stat: 'startingSouls',
      },
      reduceEnemyDamagePercent: {
        label: t('ascension.upgrade.reduceEnemyDamagePercent'),
        bonus: 0.01,
        stat: 'reduceEnemyDamagePercent',
        cost: (lvl) => 5 + lvl,
        maxLevel: 50,
      },
      reduceEnemyHpPercent: {
        label: t('ascension.upgrade.reduceEnemyHpPercent'),
        bonus: 0.01,
        stat: 'reduceEnemyHpPercent',
        cost: (lvl) => 5 + lvl,
        maxLevel: 50,
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
    this.points -= cost;
    this.upgrades[key] = current + 1;
    hero.recalculateFromAttributes();
    if (cfg.stat === 'startingGold') {
      hero.gainGold(cfg.bonus);
    }
    if (cfg.stat === 'startingCrystals') {
      hero.gainCrystals(cfg.bonus);
    }
    if (cfg.stat === 'startingSouls') {
      hero.gainSouls(cfg.bonus);
    }
    dataManager.saveGame();
    if (key === 'arenaBossSkip') {
      options.updateArenaBossSkipOption();
    }
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
    await setGlobals({ reset: true });
    // after reset, ascensionState refers to the new instance
    ascensionState.points = saved.points;
    ascensionState.upgrades = saved.upgrades;
    const ascBonuses = ascensionState.getBonuses();
    hero.gold += ascBonuses.startingGold || 0;
    hero.crystals = (hero.crystals || 0) + 100 + (ascBonuses.startingCrystals || 0);
    hero.souls += ascBonuses.startingSouls || 0;
    hero.recalculateFromAttributes();
    dataManager.saveGame();
    window.location.reload();
  }
}

