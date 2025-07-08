import { hero, dataManager, setGlobals, prestige as prestigeState } from './globals.js';
import { PRESTIGE_BONUSES } from './constants/prestigeBonuses.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateResources, showToast } from './ui/ui.js';

export default class Prestige {
  constructor(savedData = null) {
    this.prestigeCount = 0;
    this.bonuses = {};
    Object.assign(this, savedData);
    this.modal = null;
  }

  canPrestige() {
    return hero.level >= 50;
  }

  getBonuses() {
    return this.bonuses;
  }

  addBonuses(b) {
    Object.entries(b).forEach(([stat, val]) => {
      this.bonuses[stat] = (this.bonuses[stat] || 0) + val;
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) + val;
    });
  }

  generateCards(count = 3, bonusesPerCard = 3) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      const shuffled = [...PRESTIGE_BONUSES].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, bonusesPerCard);
      const card = { bonuses: {}, descriptions: [] };
      picked.forEach((b) => {
        card.bonuses[b.stat] = (card.bonuses[b.stat] || 0) + b.value;
        card.descriptions.push(b.description);
      });
      cards.push(card);
    }
    return cards;
  }

  async prestigeWithBonus(card) {
    const combined = { ...this.bonuses };
    Object.entries(card.bonuses).forEach(([stat, val]) => {
      combined[stat] = (combined[stat] || 0) + val;
    });
    const newCount = this.prestigeCount + 1;

    await setGlobals({ reset: true });

    prestigeState.bonuses = combined;
    prestigeState.prestigeCount = newCount;
    Object.entries(combined).forEach(([stat, val]) => {
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) + val;
    });

    hero.recalculateFromAttributes();
    updateResources();
    updateStatsAndAttributesUI();
    showToast('Prestige complete!');
    dataManager.saveGame();
  }
}
