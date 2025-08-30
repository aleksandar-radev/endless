import { hero, dataManager, setGlobals, prestige, ascension as ascensionState } from './globals.js';
import { handleSavedData } from './functions.js';
import { showToast } from './ui/ui.js';
import { t } from './i18n.js';
export const ASCENSION_UPGRADES = {
  strengthEffectiveness: {
    label: t('ascension.upgrade.strengthEffectiveness'),
    bonus: 0.1,
    effect: 'strengthEffectPercent',
    maxLevel: 10,
  },
  agilityEffectiveness: {
    label: t('ascension.upgrade.agilityEffectiveness'),
    bonus: 0.1,
    effect: 'agilityEffectPercent',
    maxLevel: 10,
  },
  vitalityEffectiveness: {
    label: t('ascension.upgrade.vitalityEffectiveness'),
    bonus: 0.1,
    effect: 'vitalityEffectPercent',
    maxLevel: 10,
  },
  wisdomEffectiveness: {
    label: t('ascension.upgrade.wisdomEffectiveness'),
    bonus: 0.1,
    effect: 'wisdomEffectPercent',
    maxLevel: 10,
  },
  enduranceEffectiveness: {
    label: t('ascension.upgrade.enduranceEffectiveness'),
    bonus: 0.1,
    effect: 'enduranceEffectPercent',
    maxLevel: 10,
  },
  dexterityEffectiveness: {
    label: t('ascension.upgrade.dexterityEffectiveness'),
    bonus: 0.1,
    effect: 'dexterityEffectPercent',
    maxLevel: 10,
  },
  intelligenceEffectiveness: {
    label: t('ascension.upgrade.intelligenceEffectiveness'),
    bonus: 0.1,
    effect: 'intelligenceEffectPercent',
    maxLevel: 10,
  },
  perseveranceEffectiveness: {
    label: t('ascension.upgrade.perseveranceEffectiveness'),
    bonus: 0.1,
    effect: 'perseveranceEffectPercent',
    maxLevel: 10,
  },
};

export default class Ascension {
  constructor(savedData = null) {
    this.points = 0;
    this.upgrades = {};
    handleSavedData(savedData, this);
  }

  get config() {
    return ASCENSION_UPGRADES;
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
      } else if (cfg.effect) {
        bonuses[cfg.effect] = (bonuses[cfg.effect] || 0) + value;
      }
    }
    return bonuses;
  }

  canAscend() {
    return prestige.prestigeCount >= 10;
  }

  spendPoint(key) {
    const cfg = this.config[key];
    if (!cfg) return false;
    const cost = cfg.cost || 1;
    const max = cfg.maxLevel || Infinity;
    const current = this.upgrades[key] || 0;
    if (this.points < cost || current >= max) return false;
    this.points -= cost;
    this.upgrades[key] = current + 1;
    hero.recalculateFromAttributes();
    dataManager.saveGame();
    return true;
  }

  async ascend() {
    if (!this.canAscend()) {
      showToast(t('ascension.needPrestiges'));
      return;
    }
    const earned = prestige.prestigeCount;
    const saved = {
      points: this.points + earned,
      upgrades: this.upgrades,
    };
    await setGlobals({ reset: true });
    // after reset, ascensionState refers to the new instance
    ascensionState.points = saved.points;
    ascensionState.upgrades = saved.upgrades;
    dataManager.saveGame();
    window.location.reload();
  }
}

