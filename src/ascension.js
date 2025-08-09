import { hero, prestige, options, dataManager, setGlobals } from './globals.js';

export const ASCENSION_UPGRADES = {
  strengthDamage: {
    label: 'Strength → Damage %',
    description: 'Increase damage gained from Strength by 10% per level',
    bonus: 0.10,
  },
  vitalityLife: {
    label: 'Vitality → Life %',
    description: 'Increase life gained from Vitality by 10% per level',
    bonus: 0.10,
  },
  bonusExperience: {
    label: 'Bonus Experience %',
    description: 'Increase experience gained by 50% per level',
    bonus: 0.50,
    stat: 'bonusExperiencePercent',
  },
  bonusGold: {
    label: 'Bonus Gold %',
    description: 'Increase gold gained by 50% per level',
    bonus: 0.50,
    stat: 'bonusGoldPercent',
  },
};

export default class Ascension {
  constructor(savedData = null) {
    this.points = 0;
    this.upgrades = {};
    this.appliedBonuses = {};
    Object.assign(this, savedData);
  }

  getAvailablePoints() {
    return this.points;
  }

  purchaseUpgrade(key) {
    if (this.points <= 0) return false;
    if (!ASCENSION_UPGRADES[key]) return false;
    this.upgrades[key] = (this.upgrades[key] || 0) + 1;
    this.points -= 1;
    this.applyBonuses();
    dataManager.saveGame();
    return true;
  }

  getUpgradeLevel(key) {
    return this.upgrades[key] || 0;
  }

  getAttributeMultiplier(attr, stat) {
    if (attr === 'strength' && stat === 'damage') {
      return 1 + (this.upgrades.strengthDamage || 0) * ASCENSION_UPGRADES.strengthDamage.bonus;
    }
    if (attr === 'vitality' && stat === 'life') {
      return 1 + (this.upgrades.vitalityLife || 0) * ASCENSION_UPGRADES.vitalityLife.bonus;
    }
    return 1;
  }

  applyBonuses() {
    // Remove previously applied bonuses
    Object.entries(this.appliedBonuses).forEach(([stat, val]) => {
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) - val;
    });
    const newBonuses = {};
    if (this.upgrades.bonusExperience) {
      newBonuses.bonusExperiencePercent = this.upgrades.bonusExperience * ASCENSION_UPGRADES.bonusExperience.bonus;
    }
    if (this.upgrades.bonusGold) {
      newBonuses.bonusGoldPercent = this.upgrades.bonusGold * ASCENSION_UPGRADES.bonusGold.bonus;
    }
    Object.entries(newBonuses).forEach(([stat, val]) => {
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) + val;
    });
    this.appliedBonuses = newBonuses;
    hero.recalculateFromAttributes();
  }

  async ascend() {
    const gained = prestige.prestigeCount;
    if (gained <= 0) return;
    this.points += gained;
    const ascensionData = JSON.parse(JSON.stringify({ points: this.points, upgrades: this.upgrades }));
    const showEnemyStats = options.showEnemyStats;
    const resetRequired = options.resetRequired;
    const salvageMaterialsEnabled = options.salvageMaterialsEnabled;

    await setGlobals({ reset: true, ascensionData });

    options.showEnemyStats = showEnemyStats;
    options.resetRequired = resetRequired;
    options.salvageMaterialsEnabled = salvageMaterialsEnabled;

    dataManager.saveGame();
    window.location.reload();
  }
}
