import { hero, dataManager, setGlobals, prestige, ascension as ascensionState } from './globals.js';
import { handleSavedData } from './functions.js';
import { showToast } from './ui/ui.js';

export const ASCENSION_UPGRADES = {
  strengthDamage: {
    label: 'Strength Damage %',
    bonus: 0.05, // 5% more damage per Strength
    effect: 'strengthDamagePercent',
  },
  vitalityLife: {
    label: 'Vitality Life %',
    bonus: 0.05, // 5% more life per Vitality
    effect: 'vitalityLifePercent',
  },
  bonusExperience: {
    label: 'Bonus Experience %',
    bonus: 0.5, // 50% more experience
    stat: 'bonusExperiencePercent',
  },
  bonusGold: {
    label: 'Bonus Gold %',
    bonus: 0.5, // 50% more gold
    stat: 'bonusGoldPercent',
  },
  attackNeverMiss: {
    label: 'Attacks Never Miss',
    bonus: 1,
    cost: 50,
    stat: 'attackNeverMiss',
    maxLevel: 1,
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
      showToast('You need at least 10 prestiges to ascend.');
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

