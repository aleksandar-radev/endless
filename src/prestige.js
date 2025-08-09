import {
  hero,
  dataManager,
  setGlobals,
  prestige as prestigeState,
  options,
  statistics,
} from './globals.js';
import { PRESTIGE_BONUSES, STARTING_CRYSTALS_BONUS } from './constants/prestigeBonuses.js';
import { formatStatName } from './ui/ui.js';

const LEVEL_REQUIREMENT = 300;
const LEVEL_REQUIREMENT_INCREASE = 50;
const BOSSLEVEL_REQUIREMENT = 80;
const BOSSLEVEL_REQUIREMENT_INCREASE = 20;

export default class Prestige {
  constructor(savedData = null) {
    this.prestigeCount = 0;
    this.bonuses = {};
    this.history = [];
    this.pendingCards = null;
    Object.assign(this, savedData);
    this.modal = null;
    if (!Array.isArray(this.history)) {
      this.history = [];
    }
  }

  getCurrentLevelRequirement() {
    return LEVEL_REQUIREMENT + (this.prestigeCount * LEVEL_REQUIREMENT_INCREASE);
  }

  getCurrentBossLevelRequirement() {
    return BOSSLEVEL_REQUIREMENT + (this.prestigeCount * BOSSLEVEL_REQUIREMENT_INCREASE);
  }

  getPrestigeRequirementMessage() {
    const levelReq = this.getCurrentLevelRequirement();
    const bossLevelReq = this.getCurrentBossLevelRequirement();
    const levelNeeded = levelReq - (hero.level || 0);
    const bossLevelNeeded = bossLevelReq - (hero.bossLevel || 0);
    let messages = [];
    if (levelNeeded > 0) {
      messages.push(`Reach level ${levelReq} (${levelNeeded} more level${levelNeeded === 1 ? '' : 's'})`);
    }
    if (bossLevelNeeded > 0) {
      messages.push(`Defeat boss level ${bossLevelReq} (${bossLevelNeeded} more boss level${bossLevelNeeded === 1 ? '' : 's'})`);
    }
    if (messages.length > 0) {
      return messages.join(' and ') + ' to prestige.';
    }
    return 'You do not meet the requirements to prestige.';
  }

  canPrestige() {
    return (
      hero.level >= this.getCurrentLevelRequirement() &&
      hero.bossLevel >= this.getCurrentBossLevelRequirement()
    );
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
    // If there are pending cards, return them
    if (
      this.pendingCards &&
      Array.isArray(this.pendingCards) &&
      this.pendingCards.length === count
    ) {
      return this.pendingCards;
    }
    // Otherwise, generate new cards and save them
    const cards = [];
    for (let i = 0; i < count; i++) {
      const startingCrystals = Math.floor(
        Math.random() * (STARTING_CRYSTALS_BONUS.max - STARTING_CRYSTALS_BONUS.min + 1),
      ) + STARTING_CRYSTALS_BONUS.min;
      const shuffled = [...PRESTIGE_BONUSES].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, bonusesPerCard);
      const card = { bonuses: {}, descriptions: [] };
      picked.forEach((b) => {
        // Pick a random value between min and max (inclusive)
        const value = +(Math.random() * (b.max - b.min) + b.min).toFixed(4);
        card.bonuses[b.stat] = (card.bonuses[b.stat] || 0) + value;
        // Update description to show the actual value
        let desc;
        if (b.stat.endsWith('Percent')) {
          desc = `${formatStatName(b.stat)}: +${(value * 100).toFixed(1)}%`;
        } else {
          desc = `${formatStatName(b.stat)}: +${Math.round(value)}`;
        }
        card.descriptions.push(desc);
      });
      card.bonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystals;
      card.descriptions.push(
        `${formatStatName(STARTING_CRYSTALS_BONUS.stat)}: +${startingCrystals}`,
      );
      cards.push(card);
    }
    this.pendingCards = cards;
    return cards;
  }

  async prestigeWithBonus(card) {
    const combined = { ...this.bonuses };
    Object.entries(card.bonuses).forEach(([stat, val]) => {
      combined[stat] = (combined[stat] || 0) + val;
    });
    const newCount = this.prestigeCount + 1;

    const statsSnapshot = JSON.parse(JSON.stringify(statistics));
    const now = Date.now();
    this.history.push({
      number: newCount,
      timestamp: now,
      statistics: statsSnapshot,
    });

    const showEnemyStats = options.showEnemyStats;
    const resetRequired = options.resetRequired;
    const salvageMaterialsEnabled = options.salvageMaterialsEnabled;

    await setGlobals({ reset: true });

    // persist options
    options.showEnemyStats = showEnemyStats;
    options.resetRequired = resetRequired;
    options.salvageMaterialsEnabled = salvageMaterialsEnabled;

    prestigeState.bonuses = combined;
    prestigeState.prestigeCount = newCount;
    prestigeState.history = this.history;
    Object.entries(combined).forEach(([stat, val]) => {
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) + val;
    });
    if (combined.startingCrystals) {
      hero.crystals = combined.startingCrystals;
    }

    dataManager.saveGame();
    window.location.reload();

    // game.currentEnemy = new Enemy(game.stage);
    // hero.recalculateFromAttributes();
    // updateResources();
    // updateStageUI();
    // updateRegionUI();
    // updateStatsAndAttributesUI();
    // showToast('Prestige complete!');
    // dataManager.saveGame();
    // // Clear pending cards after prestige
    // this.pendingCards = null;
    // this.pendingStartingCrystals = null;
  }
}
