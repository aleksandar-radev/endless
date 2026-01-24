import { RUNES, isChanceStat, getTierMultiplier, getPercentTierMultiplier } from './constants/runes.js';
import { isPercentStat, getStatDecimalPlaces } from './constants/stats/stats.js';
import { tp, t } from './i18n.js';
import { formatStatName } from './format.js';
import { hero, ascension } from './globals.js';

export const BASE_RUNE_SLOTS = 1;
export const FROZEN_RUNE_SLOTS = 20;
export const INVENTORY_TAB_COUNT = 10;
export const INVENTORY_TAB_SIZE = 80;
export const BASE_UNLOCKED_RUNE_TABS = 2;
const INVENTORY_SLOTS = FROZEN_RUNE_SLOTS + INVENTORY_TAB_COUNT * INVENTORY_TAB_SIZE;

/**
 * Roll a value from a stat definition.
 * If the stat is a range [min, max], roll a random value.
 * If it's a fixed value, return it as-is.
 * @param {number|[number, number]} statValue
 * @returns {number}
 */
const rollStatValue = (statValue) => {
  if (Array.isArray(statValue) && statValue.length === 2) {
    const [min, max] = statValue;
    return min + Math.random() * (max - min);
  }
  return statValue;
};

/**
 * Apply tier multiplier to a stat value.
 * - Chance stats: NOT multiplied (capped by nature)
 * - Percent stats: Use smaller 2x per tier multiplier
 * - Flat stats: Use full 20x per tier multiplier
 * @param {string} statKey
 * @param {number} value
 * @param {number} tier
 * @returns {number}
 */
const applyTierMultiplier = (statKey, value, tier) => {
  // Chance stats don't scale with tier
  if (isChanceStat(statKey)) {
    return value;
  }
  // Percent stats use smaller multiplier (2x per tier)
  if (isPercentStat(statKey)) {
    const multiplier = getPercentTierMultiplier(tier);
    return value * multiplier;
  }
  // Flat stats use full multiplier (20x per tier)
  const multiplier = getTierMultiplier(tier);
  return value * multiplier;
};

/**
 * Roll stats for a rune based on its definition.
 * @param {object} base - The base rune definition from RUNES
 * @param {number} tier - The tier to apply
 * @returns {object} The rolled stats
 */
const rollRuneStats = (base, tier = 1) => {
  if (!base?.stats) return {};

  const statKeys = Object.keys(base.stats);
  const attributeCount = base.attributes || 1;

  // If attributes count equals or exceeds stat count, use all stats
  if (attributeCount >= statKeys.length) {
    const rolledStats = {};
    for (const key of statKeys) {
      const rawValue = rollStatValue(base.stats[key]);
      const value = applyTierMultiplier(key, rawValue, tier);
      const isPerLevel = key.endsWith('PerLevel');
      rolledStats[key] = isPerLevel ? value : Math.floor(value);
    }
    return rolledStats;
  }

  // Otherwise, randomly select 'attributes' number of stats
  const shuffled = [...statKeys].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, attributeCount);

  const rolledStats = {};
  for (const key of selected) {
    const rawValue = rollStatValue(base.stats[key]);
    const value = applyTierMultiplier(key, rawValue, tier);
    const isPerLevel = key.endsWith('PerLevel');
    rolledStats[key] = isPerLevel ? value : Math.floor(value);
  }
  return rolledStats;
};

export default class Runes {
  constructor(savedData = {}) {
    // Normalize saved data
    const normalize = (arr = []) =>
      (arr || []).map((r) => {
        if (!r) return null;
        // Only keep id, stats (rolled), and tier
        return {
          id: r.id,
          stats: r.stats || {},
          tier: r.tier || 1,
        };
      });

    this.equipped = normalize(savedData.equipped || []);
    if (this.equipped.length < BASE_RUNE_SLOTS) {
      this.equipped = [...this.equipped, ...new Array(BASE_RUNE_SLOTS - this.equipped.length).fill(null)];
    }
    const normalizedInventory = normalize(savedData.inventory || []);
    this.inventory = new Array(INVENTORY_SLOTS).fill(null);
    normalizedInventory.slice(0, INVENTORY_SLOTS).forEach((rune, idx) => {
      this.inventory[idx] = rune;
    });
  }

  ensureEquipSlots(count) {
    if (this.equipped.length > count) {
      for (let i = count; i < this.equipped.length; i++) {
        const rune = this.equipped[i];
        if (rune) {
          const idx = this.inventory.findIndex((r) => r === null);
          if (idx !== -1) this.inventory[idx] = rune;
        }
      }
      this.equipped.length = count;
    } else if (this.equipped.length < count) {
      this.equipped = [...this.equipped, ...new Array(count - this.equipped.length).fill(null)];
    }
  }

  getUnlockedTabCount() {
    const bonus = ascension?.getBonuses?.()?.runeTabUnlocks || 0;
    const unlocked = BASE_UNLOCKED_RUNE_TABS + bonus;
    return Math.min(INVENTORY_TAB_COUNT, Math.max(BASE_UNLOCKED_RUNE_TABS, unlocked));
  }

  isTabUnlocked(tabIndex) {
    return tabIndex >= 0 && tabIndex < this.getUnlockedTabCount();
  }

  /**
   * Add a new rune to inventory.
   * @param {string} id - The rune ID
   * @param {number} tier - The tier of the rune (affects stat multipliers)
   * @param {number} level - The level of the rune (affects stage scaling)
   * @returns {object|null} The created rune instance, or null if inventory full
   */
  addRune(id, tier = 1, level = 1) {
    const base = RUNES[id];
    if (!base) return null;

    const limit = FROZEN_RUNE_SLOTS + this.getUnlockedTabCount() * INVENTORY_TAB_SIZE;
    let idx = this.inventory.findIndex((r, slotIdx) => slotIdx >= FROZEN_RUNE_SLOTS && slotIdx < limit && r === null);
    if (idx === -1) {
      idx = this.inventory.findIndex((r) => r === null);
    }
    if (idx === -1) return null;

    const rolledStats = rollRuneStats(base, tier);
    const inst = {
      id: base.id,
      stats: rolledStats,
      tier,
      level,
    };

    this.inventory[idx] = inst;
    return inst;
  }

  isValidInventoryIndex(index) {
    return typeof index === 'number' && index >= 0 && index < this.inventory.length;
  }

  isFrozenIndex(index) {
    return this.isValidInventoryIndex(index) && index < FROZEN_RUNE_SLOTS;
  }

  getTabBounds(tabIndex) {
    const safeIndex = Math.min(Math.max(tabIndex, 0), INVENTORY_TAB_COUNT - 1);
    const start = FROZEN_RUNE_SLOTS + safeIndex * INVENTORY_TAB_SIZE;
    const end = Math.min(start + INVENTORY_TAB_SIZE, this.inventory.length);
    return { start, end };
  }

  getTabIndexForSlot(index) {
    if (!this.isValidInventoryIndex(index) || this.isFrozenIndex(index)) return null;
    const normalized = index - FROZEN_RUNE_SLOTS;
    if (normalized < 0 || normalized >= INVENTORY_TAB_COUNT * INVENTORY_TAB_SIZE) return null;
    const tab = Math.floor(normalized / INVENTORY_TAB_SIZE);
    return this.isTabUnlocked(tab) ? tab : null;
  }

  equip(slotIndex, inventoryIndex) {
    const rune = this.inventory[inventoryIndex];
    if (!rune) return;
    const base = RUNES[rune.id];
    if (base?.unique) {
      const existingIndex = this.equipped.findIndex((r) => r?.id === rune.id);
      if (existingIndex !== -1 && existingIndex !== slotIndex) return;
    }
    const previous = this.equipped[slotIndex];
    this.equipped[slotIndex] = rune;
    this.inventory[inventoryIndex] = previous || null;
  }

  unequip(slotIndex, inventoryIndex) {
    const rune = this.equipped[slotIndex];
    if (!rune) return;
    const dest = inventoryIndex !== undefined ? inventoryIndex : this.inventory.findIndex((r) => r === null);
    if (dest === -1) return;
    const previous = this.inventory[dest];
    this.inventory[dest] = rune;
    this.equipped[slotIndex] = previous || null;
  }

  moveInventory(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (!this.isValidInventoryIndex(fromIndex) || !this.isValidInventoryIndex(toIndex)) return;
    const targetTab = this.getTabIndexForSlot(toIndex);
    if (targetTab === null && !this.isFrozenIndex(toIndex)) return;
    [this.inventory[fromIndex], this.inventory[toIndex]] = [this.inventory[toIndex], this.inventory[fromIndex]];
  }

  moveRuneToTab(fromIndex, tabIndex) {
    if (!this.isValidInventoryIndex(fromIndex)) return false;
    if (!this.isTabUnlocked(tabIndex)) return false;
    const { start, end } = this.getTabBounds(tabIndex);
    for (let i = start; i < end; i++) {
      if (this.inventory[i] === null) {
        if (i === fromIndex) return true;
        this.inventory[i] = this.inventory[fromIndex];
        this.inventory[fromIndex] = null;
        return true;
      }
    }
    return false;
  }

  moveEquipped(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    [this.equipped[fromIndex], this.equipped[toIndex]] = [this.equipped[toIndex], this.equipped[fromIndex]];
  }

  salvage(index) {
    const rune = this.inventory[index];
    if (!rune) return 0;
    const base = RUNES[rune.id];

    let baseValue = 1;
    if (base?.unique) {
      baseValue = 200;
    } else if (rune.stats) {
      // Value based on sum of stat values and tier
      const statSum = Object.values(rune.stats).reduce((sum, v) => sum + Math.abs(v), 0);
      baseValue = Math.max(1, Math.floor(statSum / 2)) * (rune.tier || 1);
    }

    const crystals = Math.max(1, Math.floor(baseValue * 0.25));

    this.inventory[index] = null;
    hero.gainCrystals(crystals);
    return crystals;
  }

  sortInventory(shortElementalNames = false) {
    this.sortTab(0, shortElementalNames);
  }

  sortTab(tabIndex, shortElementalNames = false) {
    if (!this.isTabUnlocked(tabIndex)) return;
    const { start, end } = this.getTabBounds(tabIndex);
    const slice = this.inventory.slice(start, end);
    slice.sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      const baseA = RUNES[a.id];
      const baseB = RUNES[b.id];
      const isUniqueA = !!baseA?.unique;
      const isUniqueB = !!baseB?.unique;
      if (isUniqueA && !isUniqueB) return -1;
      if (!isUniqueA && isUniqueB) return 1;
      // Sort by tier (higher first)
      if ((a.tier || 1) !== (b.tier || 1)) {
        return (b.tier || 1) - (a.tier || 1);
      }
      return getRuneName(a, shortElementalNames).localeCompare(getRuneName(b, shortElementalNames));
    });
    for (let i = start; i < end; i++) {
      this.inventory[i] = slice[i - start] || null;
    }
  }

  /**
   * Get the combined bonus effects from all equipped runes.
   * @returns {object} Combined stat bonuses
   */
  getBonusEffects() {
    const bonuses = {};
    this.equipped.forEach((rune) => {
      if (!rune?.stats) return;
      Object.entries(rune.stats).forEach(([stat, value]) => {
        bonuses[stat] = (bonuses[stat] || 0) + value;
      });
    });
    return bonuses;
  }

  /**
   * Apply rune bonuses to flat values.
   * @param {object} flatValues - The flat values object to modify
   */
  applyBonuses(flatValues) {
    const bonuses = this.getBonusEffects();
    Object.entries(bonuses).forEach(([stat, value]) => {
      flatValues[stat] = (flatValues[stat] || 0) + value;
    });
  }
}

/**
 * Get the display name of a rune.
 * @param {object} rune - The rune instance
 * @param {boolean} shortElementalNames - Whether to use short names
 * @returns {string}
 */
export function getRuneName(rune, shortElementalNames = false) {
  const base = RUNES[rune.id];
  if (base?.nameKey) return t(base.nameKey);
  return rune.id || 'Unknown Rune';
}

/**
 * Get the description of a rune, listing its stats.
 * @param {object} rune - The rune instance
 * @param {boolean} shortElementalNames - Whether to use short names
 * @returns {string}
 */
export function getRuneDescription(rune, shortElementalNames = false) {
  const base = RUNES[rune.id];

  // For unique runes with a description key, use it
  // For non-unique runes or those with rolled stats, show the stats
  if (base?.unique && base?.descKey) {
    return t(base.descKey);
  }

  // Build description from actual rolled stats
  if (!rune.stats || Object.keys(rune.stats).length === 0) {
    // Fallback to descKey if no stats
    if (base?.descKey) return t(base.descKey);
    return '';
  }

  const lines = Object.entries(rune.stats).map(([stat, value]) => {
    const statName = formatStatName(stat, shortElementalNames);
    const decimals = getStatDecimalPlaces(stat);
    const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.floor(value);
    return `${statName}: +${displayValue}`;
  });

  return lines.join('\n');
}

/**
 * Get the icon URL for a rune.
 * @param {object} rune - The rune instance
 * @returns {string}
 */
export function getRuneIcon(rune) {
  const base = RUNES[rune.id];
  return base?.icon || '';
}
