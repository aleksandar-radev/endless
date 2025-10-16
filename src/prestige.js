import {
  hero,
  dataManager,
  setGlobals,
  prestige as prestigeState,
  options,
  statistics,
  game,
  runtime,
  ascension,
  runes,
} from './globals.js';
import { BASE_RUNE_SLOTS } from './runes.js';
import { PRESTIGE_BONUSES, STARTING_CRYSTALS_BONUS } from './constants/prestigeBonuses.js';
import { formatStatName } from './ui/ui.js';
import { t, tp } from './i18n.js';

const BASE = import.meta.env.VITE_BASE_PATH;

const LEVEL_REQUIREMENT = 100;
const LEVEL_REQUIREMENT_INCREASE = 25;
const CARD_VALUE_REROLL_BASE_COST = 100;
const CARD_VALUE_REROLL_INCREMENT = 50;

// Compute scaling factor based on highest boss level:
// - 5% bonus for the first 20 levels (interval 1)
// - for each subsequent 20-level interval the per-interval bonus linearly
//   diminishes from 5% down to 1% at level 2500
// - after level 2500 each 20-level interval gives 1%
export function getBossScalingFactor(highestBossLevel) {
  const levelsPerInterval = 20;
  if (!highestBossLevel || highestBossLevel <= 0) return 1;

  const intervals = Math.ceil(highestBossLevel / levelsPerInterval); // 1..n, 1 means levels 1-20
  const firstPercent = 0.08; // 8%
  const finalPercent = 0.01; // 1% at level 2500
  const finalInterval = Math.ceil(2500 / levelsPerInterval); // 50

  let totalPercent = 0;
  for (let i = 1; i <= intervals; i++) {
    let perInterval;
    if (i <= finalInterval) {
      // linear interpolation from firstPercent (i=1) to finalPercent (i=finalInterval)
      if (finalInterval === 1) {
        perInterval = finalPercent;
      } else {
        perInterval = firstPercent - (i - 1) * (firstPercent - finalPercent) / (finalInterval - 1);
      }
    } else {
      perInterval = finalPercent; // beyond level 2500, fixed 1% per interval
    }
    totalPercent += perInterval;
  }

  return 1 + totalPercent;
}

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

  _createCard(bonusesPerCard, scalingFactor) {
    const startingCrystalsBase = Math.floor(
      Math.random() * (STARTING_CRYSTALS_BONUS.max - STARTING_CRYSTALS_BONUS.min + 1),
    ) + STARTING_CRYSTALS_BONUS.min;
    const startingCrystals = Math.floor(startingCrystalsBase * scalingFactor);
    const shuffled = [...PRESTIGE_BONUSES].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, bonusesPerCard);
    const card = { bonuses: {}, baseBonuses: {}, descriptions: [], locked: false, valueRerolls: 0 };
    picked.forEach((b) => {
      const baseValue = +(Math.random() * (b.max - b.min) + b.min).toFixed(4);
      const value = +(baseValue * scalingFactor).toFixed(4);
      card.baseBonuses[b.stat] = (card.baseBonuses[b.stat] || 0) + baseValue;
      card.bonuses[b.stat] = (card.bonuses[b.stat] || 0) + value;
      let refMin = +(b.min * scalingFactor).toFixed(4);
      let refMax = +(b.max * scalingFactor).toFixed(4);
      let desc;
      if (b.stat.endsWith('Percent')) {
        const main = `${formatStatName(b.stat)}: +${(value * 100).toFixed(1)}%`;
        const right = options?.showRollPercentiles
          ? `${Math.round((refMax > refMin) ? ((value - refMin) / (refMax - refMin)) * 100 : 100)}%`
          : `${(refMin * 100).toFixed(1)}% - ${(refMax * 100).toFixed(1)}%`;
        desc = `<span class=\"prestige-main\"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
      } else {
        const main = `${formatStatName(b.stat)}: +${Math.round(value)}`;
        const right = options?.showRollPercentiles
          ? `${Math.round((refMax > refMin) ? ((value - refMin) / (refMax - refMin)) * 100 : 100)}%`
          : `${Math.round(refMin)} - ${Math.round(refMax)}`;
        desc = `<span class=\"prestige-main\"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
      }
      card.descriptions.push(desc);
    });
    card.baseBonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystalsBase;
    card.bonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystals;
    const refStartMin = STARTING_CRYSTALS_BONUS.min;
    const refStartMax = STARTING_CRYSTALS_BONUS.max;
    const main = `${formatStatName(STARTING_CRYSTALS_BONUS.stat)}: +${startingCrystals}`;
    const startMinScaled = Math.floor(refStartMin * scalingFactor);
    const startMaxScaled = Math.floor(refStartMax * scalingFactor);
    const right = options?.showRollPercentiles
      ? `${Math.round(startMaxScaled > startMinScaled ? ((startingCrystals - startMinScaled) / (startMaxScaled - startMinScaled)) * 100 : 100)}%`
      : `${startMinScaled} - ${startMaxScaled}`;
    card.descriptions.push(`<span class=\"prestige-main\"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`);
    return card;
  }

  _refreshCardFromBase(card, scalingFactor) {
    if (!card) return card;
    if (typeof card.valueRerolls !== 'number') {
      card.valueRerolls = 0;
    }
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

      let refMin = null;
      let refMax = null;
      if (stat === STARTING_CRYSTALS_BONUS.stat) {
        refMin = Math.floor(STARTING_CRYSTALS_BONUS.min * scalingFactor);
        refMax = Math.floor(STARTING_CRYSTALS_BONUS.max * scalingFactor);
      } else {
        const def = PRESTIGE_BONUSES.find((p) => p.stat === stat);
        if (def) {
          refMin = +(def.min * scalingFactor).toFixed(4);
          refMax = +(def.max * scalingFactor).toFixed(4);
        }
      }

      let desc;
      if (stat.endsWith('Percent')) {
        const scaledPct = (scaledValue * 100).toFixed(1);
        if (refMin != null && refMax != null) {
          const main = `${formatStatName(stat)}: +${scaledPct}%`;
          const right = options?.showRollPercentiles
            ? `${Math.round((refMax > refMin) ? ((scaledValue - refMin) / (refMax - refMin)) * 100 : 100)}%`
            : `${(refMin * 100).toFixed(1)}% - ${(refMax * 100).toFixed(1)}%`;
          desc = `<span class=\"prestige-main\"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
        } else {
          desc = `${formatStatName(stat)}: +${scaledPct}%`;
        }
      } else {
        if (refMin != null && refMax != null) {
          const main = `${formatStatName(stat)}: +${Math.round(scaledValue)}`;
          const right = options?.showRollPercentiles
            ? `${Math.round((refMax > refMin) ? ((scaledValue - refMin) / (refMax - refMin)) * 100 : 100)}%`
            : `${Math.round(refMin)} - ${Math.round(refMax)}`;
          desc = `<span class=\"prestige-main\"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
        } else {
          desc = `${formatStatName(stat)}: +${Math.round(scaledValue)}`;
        }
      }
      card.descriptions.push(desc);
    });

    return card;
  }

  getCardValueRerollCost(card) {
    const rerolls = card?.valueRerolls || 0;
    return CARD_VALUE_REROLL_BASE_COST + (rerolls * CARD_VALUE_REROLL_INCREMENT);
  }

  rerollCardValues(index) {
    if (!this.pendingCards || !this.pendingCards[index]) {
      return this.pendingCards;
    }

    const highestBossLevel = statistics?.highestBossLevel || 0;
    const scalingFactor = getBossScalingFactor(highestBossLevel);
    const card = this.pendingCards[index];

    if (!card.baseBonuses) {
      card.baseBonuses = { ...card.bonuses };
    }

    Object.keys(card.baseBonuses).forEach((stat) => {
      if (stat === STARTING_CRYSTALS_BONUS.stat) {
        const baseValue = Math.floor(
          Math.random() * (STARTING_CRYSTALS_BONUS.max - STARTING_CRYSTALS_BONUS.min + 1),
        ) + STARTING_CRYSTALS_BONUS.min;
        card.baseBonuses[stat] = baseValue;
      } else {
        const def = PRESTIGE_BONUSES.find((p) => p.stat === stat);
        if (!def) {
          return;
        }
        const baseValue = +(Math.random() * (def.max - def.min) + def.min).toFixed(4);
        card.baseBonuses[stat] = baseValue;
      }
    });

    card.valueRerolls = (card.valueRerolls || 0) + 1;
    this._refreshCardFromBase(card, scalingFactor);
    return this.pendingCards;
  }

  getCurrentLevelRequirement() {
    const req = LEVEL_REQUIREMENT + (this.prestigeCount * LEVEL_REQUIREMENT_INCREASE);
    return Math.min(req, 1000);
  }

  getPrestigeRequirementMessage() {
    const levelReq = this.getCurrentLevelRequirement();
    const levelNeeded = levelReq - (hero.level || 0);
    if (levelNeeded > 0) {
      return tp('prestige.requirement.level', { level: levelReq, needed: levelNeeded });
    }
    return t('prestige.requirement.unmet');
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
    const scalingFactor = getBossScalingFactor(highestBossLevel);

    // If there are pending cards, rescale them and return
    if (
      this.pendingCards &&
      Array.isArray(this.pendingCards) &&
      this.pendingCards.length === count
    ) {
      this.pendingCards.forEach((card) => {
        this._refreshCardFromBase(card, scalingFactor);
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
      const card = { bonuses: {}, baseBonuses: {}, descriptions: [], valueRerolls: 0 };
      picked.forEach((b) => {
        // Pick a random value between min and max (inclusive)
        const baseValue = +(Math.random() * (b.max - b.min) + b.min).toFixed(4);
        const value = +(baseValue * scalingFactor).toFixed(4);
        card.baseBonuses[b.stat] = (card.baseBonuses[b.stat] || 0) + baseValue;
        card.bonuses[b.stat] = (card.bonuses[b.stat] || 0) + value;
        // Update description to show the scaled value
        // Also include the reference min/max scaled to current scalingFactor
        let refMin = +(b.min * scalingFactor).toFixed(4);
        let refMax = +(b.max * scalingFactor).toFixed(4);
        let desc;
        if (b.stat.endsWith('Percent')) {
          const main = `${formatStatName(b.stat)}: +${(value * 100).toFixed(1)}%`;
          const right = `${(refMin * 100).toFixed(1)}% - ${(refMax * 100).toFixed(1)}%`;
          desc = `<span class="prestige-main"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
        } else {
          const main = `${formatStatName(b.stat)}: +${Math.round(value)}`;
          const right = `${Math.round(refMin)} - ${Math.round(refMax)}`;
          desc = `<span class="prestige-main"><img src="${BASE}/icons/star.svg" class="icon" alt=""/>${main}</span><span class=\"prestige-ref\">(${right})</span>`;
        }
        card.descriptions.push(desc);
      });
      card.baseBonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystalsBase;
      card.bonuses[STARTING_CRYSTALS_BONUS.stat] = startingCrystals;
      // Show reference for starting crystals as well
      const refStartMin = STARTING_CRYSTALS_BONUS.min;
      const refStartMax = STARTING_CRYSTALS_BONUS.max;
      {
        const main = `${formatStatName(STARTING_CRYSTALS_BONUS.stat)}: +${startingCrystals}`;
        const startMinScaled = Math.floor(refStartMin * scalingFactor);
        const startMaxScaled = Math.floor(refStartMax * scalingFactor);
        const right = options?.showRollPercentiles
          ? `${Math.round(startMaxScaled > startMinScaled ? ((startingCrystals - startMinScaled) / (startMaxScaled - startMinScaled)) * 100 : 100)}%`
          : `${startMinScaled} - ${startMaxScaled}`;
        card.descriptions.push(`<span class=\"prestige-main\"><img src=\"${BASE}/icons/star.svg\" class=\"icon\" alt=\"\"/>${main}</span><span class=\"prestige-ref\">(${right})</span>`);
      }
      cards.push(card);
    }
    this.pendingCards = cards;
    return cards;
  }

  rerollCards(count = 3, bonusesPerCard = 3) {
    const highestBossLevel = statistics?.highestBossLevel || 0;
    const scalingFactor = getBossScalingFactor(highestBossLevel);
    const current = this.pendingCards || [];
    const cards = [];
    for (let i = 0; i < count; i++) {
      const card = current[i];
      if (card && card.locked) {
        cards[i] = this._refreshCardFromBase(card, scalingFactor);
      } else {
        cards[i] = this._createCard(bonusesPerCard, scalingFactor);
      }
    }
    this.pendingCards = cards;
    return cards;
  }

  async prestigeWithBonus(card) {
    // mark that a prestige is in progress and halt combat
    runtime.prestigeInProgress = true;
    game.gameStarted = false;

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

    // Preserve all user options and restore them after reset, except those tied
    // to crystal-shop purchases which should revert to defaults.
    const preservedOptions = { ...options };
    ['startingStage', 'stageSkip', 'resetStageSkip', 'stageLock', 'stageLockEnabled'].forEach((k) => {
      delete preservedOptions[k];
    });

    // Preserve ascension state across prestige (points and upgrades only)
    const preservedAscension = {
      points: ascension?.points || 0,
      upgrades: ascension?.upgrades || {},
    };

    await setGlobals({ reset: true });

    // Reapply preserved options onto the new options instance
    Object.assign(options, preservedOptions);

    // Restore ascension points and upgrades after reset
    if (preservedAscension) {
      ascension.points = preservedAscension.points;
      ascension.upgrades = preservedAscension.upgrades;
      // Ensure rune slot bonuses from ascension are applied
      try {
        const ascBonusesNow = ascension.getBonuses();
        runes.ensureEquipSlots(BASE_RUNE_SLOTS + (ascBonusesNow.runeSlots || 0));
      } catch {}
    }

    prestigeState.bonuses = combined;
    prestigeState.prestigeCount = newCount;
    prestigeState.history = this.history;
    Object.entries(combined).forEach(([stat, val]) => {
      hero.permaStats[stat] = (hero.permaStats[stat] || 0) + val;
    });
    if (combined.startingCrystals) {
      hero.crystals = combined.startingCrystals;
    }
    const ascBonuses = ascension.getBonuses();
    hero.gold += ascBonuses.startingGold || 0;
    hero.crystals += ascBonuses.startingCrystals || 0;
    hero.souls += ascBonuses.startingSouls || 0;

    // Recalculate attributes to reflect ascension bonuses applied
    try { hero.queueRecalculateFromAttributes(); } catch {}

    await dataManager.saveGame({ force: true });
    window.location.reload();

    // game.currentEnemy = new Enemy(game.stage);
    // hero.queueRecalculateFromAttributes();
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
