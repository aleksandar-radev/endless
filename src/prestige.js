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

const LEVEL_REQUIREMENT = 100;
const LEVEL_REQUIREMENT_INCREASE = 50;

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

  getPrestigeRequirementMessage() {
    const levelReq = this.getCurrentLevelRequirement();
    const levelNeeded = levelReq - (hero.level || 0);
    let messages = [];
    if (levelNeeded > 0) {
      messages.push(`Reach level ${levelReq} (${levelNeeded} more level${levelNeeded === 1 ? '' : 's'})`);
    }
    if (messages.length > 0) {
      return messages.join(' and ') + ' to prestige.';
    }
    return 'You do not meet the requirements to prestige.';
  }

  canPrestige() {
    return (
      hero.level >= this.getCurrentLevelRequirement()
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
    const highestBossLevel = statistics?.highestBossLevel || 0;
    const scalingFactor = 1 + highestBossLevel / 2000;

    // If there are pending cards, rescale them and return
    if (
      this.pendingCards &&
      Array.isArray(this.pendingCards) &&
      this.pendingCards.length === count
    ) {
      this.pendingCards.forEach((card) => {
        // Initialize baseBonuses if missing (cards generated before scaling existed)
        if (!card.baseBonuses) {
          card.baseBonuses = { ...card.bonuses };
        }

        card.bonuses = {};
        card.descriptions = [];
        Object.entries(card.baseBonuses).forEach(([stat, baseValue]) => {
          let scaledValue;
          if (stat === STARTING_CRYSTALS_BONUS.stat) {
            scaledValue = Math.floor(baseValue * scalingFactor);
          } else {
            scaledValue = +(baseValue * scalingFactor).toFixed(4);
          }
          card.bonuses[stat] = scaledValue;

          let desc;
          if (stat.endsWith('Percent')) {
            desc = `${formatStatName(stat)}: +${(scaledValue * 100).toFixed(1)}%`;
          } else {
            desc = `${formatStatName(stat)}: +${Math.round(scaledValue)}`;
          }
          card.descriptions.push(desc);
        });
      });
      return this.pendingCards;
    }

    // Otherwise, generate new cards and save them
    const cards = [];
    for (let i = 0; i < count; i++) {
      const startingCrystalsBase = Math.floor(
        Math.random() * (STARTING_CRYSTALS_BONUS.max - STARTING_CRYSTALS_BONUS.min + 1),
      ) + STARTING_CRYSTALS_BONUS.min;
      const startingCrystals = Math.floor(startingCrystalsBase * scalingFactor);
      const shuffled = [...PRESTIGE_BONUSES].sort(() => 0.5 - Math.random());
      const picked = shuffled.slice(0, bonusesPerCard);
      const card = { bonuses: {}, baseBonuses: {}, descriptions: [] };
      picked.forEach((b) => {
        // Pick a random value between min and max (inclusive)
        const baseValue = +(Math.random() * (b.max - b.min) + b.min).toFixed(4);
        const value = +(baseValue * scalingFactor).toFixed(4);
        card.baseBonuses[b.stat] = (card.baseBonuses[b.stat] || 0) + baseValue;
        card.bonuses[b.stat] = (card.bonuses[b.stat] || 0) + value;
        // Update description to show the scaled value
        let desc;
        if (b.stat.endsWith('Percent')) {
          desc = `${formatStatName(b.stat)}: +${(value * 100).toFixed(1)}%`;
        } else {
          desc = `${formatStatName(b.stat)}: +${Math.round(value)}`;
        }
        card.descriptions.push(desc);
      });
      card.baseBonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystalsBase;
      card.bonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystals;
      card.descriptions.push(
        `${formatStatName(STARTING_CRYSTALS_BONUS.stat)}: +${startingCrystals}`,
      );
      cards.push(card);
    }
    this.pendingCards = cards;
    return cards;
  }

  rerollCards(count = 3, bonusesPerCard = 3) {
    this.pendingCards = null;
    return this.generateCards(count, bonusesPerCard);
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

    // Preserve user options that should survive a prestige (exclude numeric options
    // that are upgraded via crystal shop: startingStage, stageSkip)
    const preservedOptions = {
      showEnemyStats: options.showEnemyStats,
      resetRequired: options.resetRequired,
      salvageMaterialsEnabled: options.salvageMaterialsEnabled,
      showAllStats: options.showAllStats,
      showAdvancedTooltips: options.showAdvancedTooltips,
      showAdvancedAttributeTooltips: options.showAdvancedAttributeTooltips,
      showRateCounters: options.showRateCounters,
      rateCountersPeriod: options.rateCountersPeriod,
      // Note: do NOT preserve resetStageSkip, stageSkip or startingStage here —
      // those are either numeric user options that should reset on prestige or
      // are handled via crystal upgrades elsewhere.
      soundVolume: options.soundVolume,
    };

    await setGlobals({ reset: true });

    // persist preserved options back onto the new globals/options instance
    Object.entries(preservedOptions).forEach(([k, v]) => {
      // only set if the option exists on the new options object
      if (k in options) options[k] = v;
    });

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
