import { RUNES, MIN_CONVERSION_PERCENT, MAX_CONVERSION_PERCENT } from './constants/runes.js';
const RUNES_BY_ID = new Map(RUNES.map((r) => [r.id, r]));
const isDamageStat = (stat) => stat === 'damage' || /Damage$/.test(stat);
import { tp, t } from './i18n.js';
import { formatStatName } from './format.js';
import { hero, ascension } from './globals.js';

export const BASE_RUNE_SLOTS = 1;
export const FROZEN_RUNE_SLOTS = 20;
export const INVENTORY_TAB_COUNT = 10;
export const INVENTORY_TAB_SIZE = 80;
export const BASE_UNLOCKED_RUNE_TABS = 2;
const INVENTORY_SLOTS = FROZEN_RUNE_SLOTS + INVENTORY_TAB_COUNT * INVENTORY_TAB_SIZE;

const getConversionMaxPercent = (base) => {
  if (!base?.conversion) return MAX_CONVERSION_PERCENT;
  const { maxPercent } = base.conversion;
  return typeof maxPercent === 'number' ? maxPercent : MAX_CONVERSION_PERCENT;
};

const clampConversionPercent = (base, percent) => {
  if (!base?.conversion) return undefined;
  const max = getConversionMaxPercent(base);
  const min = MIN_CONVERSION_PERCENT;
  if (typeof percent !== 'number') {
    const fallback = typeof base.conversion.percent === 'number' ? base.conversion.percent : min;
    return Math.min(max, Math.max(min, fallback));
  }
  if (percent > max) return max;
  if (percent < min) return min;
  return percent;
};

const resolveRunePercent = (rune, base) => {
  if (!base?.conversion) return undefined;
  return clampConversionPercent(base, rune?.conversion?.percent);
};

export default class Runes {
  constructor(savedData = {}) {
    // Normalize saved data to minimal representation: only id and conversion.percent
    const normalize = (arr = []) =>
      (arr || []).map((r) => {
        if (!r) return null;
        const minimal = { id: r.id };
        const base = RUNES_BY_ID.get(r.id);
        if (base?.conversion) {
          const percent = resolveRunePercent(r, base);
          if (typeof percent === 'number') {
            minimal.conversion = { percent };
          }
        }
        return minimal;
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

  addRune(id, percentOverride) {
    const rune = RUNES_BY_ID.get(id);
    if (!rune) return null;
    const limit = FROZEN_RUNE_SLOTS + this.getUnlockedTabCount() * INVENTORY_TAB_SIZE;
    let idx = this.inventory.findIndex((r, slotIdx) => slotIdx >= FROZEN_RUNE_SLOTS && slotIdx < limit && r === null);
    if (idx === -1) {
      idx = this.inventory.findIndex((r) => r === null);
    }
    if (idx === -1) return null;
    const inst = { id: rune.id };
    if (rune.conversion) {
      const percent = clampConversionPercent(
        rune,
        typeof percentOverride === 'number' ? percentOverride : rune.conversion.percent,
      );
      if (typeof percent === 'number') {
        inst.conversion = { percent };
      }
    }
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

  getInventoryIndexForTabSlot(tabIndex, slotIndex) {
    const { start, end } = this.getTabBounds(tabIndex);
    const offset = Math.min(Math.max(slotIndex, 0), end - start - 1);
    return start + offset;
  }

  equip(slotIndex, inventoryIndex) {
    const rune = this.inventory[inventoryIndex];
    if (!rune) return;
    const base = RUNES_BY_ID.get(rune.id);
    if (base) {
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
    const base = RUNES_BY_ID.get(rune.id);

    let baseValue = 0;
    if (base?.unique) {
      baseValue = 200;
    } else if (base?.conversion) {
      const percent = resolveRunePercent(rune, base) ?? base.conversion.percent;
      baseValue = Math.max(1, Math.floor(percent / 2));
    } else if (base?.bonus) {
      const maxBonus = Math.max(...Object.values(base.bonus));
      baseValue = Math.max(1, Math.floor(maxBonus / 2));
    } else {
      baseValue = 1;
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
      const baseA = RUNES_BY_ID.get(a.id);
      const baseB = RUNES_BY_ID.get(b.id);
      const isUniqueA = !!baseA?.unique;
      const isUniqueB = !!baseB?.unique;
      if (isUniqueA && !isUniqueB) return -1;
      if (!isUniqueA && isUniqueB) return 1;
      if (!isUniqueA && !isUniqueB) {
        const percentA = baseA?.conversion ? (resolveRunePercent(a, baseA) ?? 0) : 0;
        const percentB = baseB?.conversion ? (resolveRunePercent(b, baseB) ?? 0) : 0;
        if (percentA !== percentB) {
          return percentB - percentA;
        }
      }
      return getRuneName(a, shortElementalNames).localeCompare(getRuneName(b, shortElementalNames));
    });
    for (let i = start; i < end; i++) {
      this.inventory[i] = slice[i - start] || null;
    }
  }

  /**
   * Apply equipped rune conversions to the provided flat stat values.
   * @param {Record<string, number>} flatValues
   */
  applyBonuses(flatValues) {
    if (!flatValues) return;
  }

  /**
   * Apply conversions that draw from non-damage stats. Returns a map of
   * damage stat names (e.g. damage, fireDamage) to amounts that should be
   * added later once damage totals are available.
   * @param {Record<string, number>} stats
   * @returns {Record<string, number>}
   */
  applyPreDamageConversions(stats) {
    if (!stats) return {};

    const deltas = {};
    const pendingDamageAdditions = {};
    const consumedFromSource = {};
    const baseValues = {};

    const getBaseValue = (stat) => {
      if (!Object.prototype.hasOwnProperty.call(baseValues, stat)) {
        baseValues[stat] = stats[stat] ?? 0;
      }
      return baseValues[stat];
    };

    const getAvailableFromSource = (stat) => {
      const base = getBaseValue(stat);
      const consumed = consumedFromSource[stat] || 0;
      return Math.max(0, base - consumed);
    };

    this.equipped.forEach((rune) => {
      if (!rune) return;
      const base = RUNES_BY_ID.get(rune.id);
      if (!base?.conversion) return;
      const { from, to } = base.conversion;
      if (isDamageStat(from)) return;
      const percent = resolveRunePercent(rune, base);
      if (!percent) return;

      const baseValue = getBaseValue(from);
      if (!baseValue) return;
      const targetAmount = Math.max(0, baseValue * (percent / 100));
      if (!targetAmount) return;
      const available = getAvailableFromSource(from);
      if (!available) return;
      const move = Math.min(available, targetAmount);
      if (!move) return;

      consumedFromSource[from] = (consumedFromSource[from] || 0) + move;
      deltas[from] = (deltas[from] || 0) - move;
      if (isDamageStat(to)) {
        pendingDamageAdditions[to] = (pendingDamageAdditions[to] || 0) + move;
      } else {
        deltas[to] = (deltas[to] || 0) + move;
      }
    });

    Object.entries(deltas).forEach(([stat, delta]) => {
      if (!delta) return;
      const baseValue = stats[stat] ?? 0;
      const next = baseValue + delta;
      stats[stat] = next > 0 ? next : 0;
    });

    return pendingDamageAdditions;
  }

  /**
   * Apply conversions that draw from damage stats (damage and *Damage).
   * Mutates the stats object directly and returns a map of damage stat deltas.
   * @param {Record<string, number>} stats
   * @returns {Record<string, number>}
   */
  applyPostDamageConversions(stats) {
    if (!stats) return {};

    const deltas = {};
    const damageDeltas = {};
    const consumedFromSource = {};
    const baseValues = {};

    const getBaseValue = (stat) => {
      if (!Object.prototype.hasOwnProperty.call(baseValues, stat)) {
        baseValues[stat] = stats[stat] ?? 0;
      }
      return baseValues[stat];
    };

    const getAvailableFromSource = (stat) => {
      const base = getBaseValue(stat);
      const consumed = consumedFromSource[stat] || 0;
      return Math.max(0, base - consumed);
    };

    this.equipped.forEach((rune) => {
      if (!rune) return;
      const base = RUNES_BY_ID.get(rune.id);
      if (!base?.conversion) return;
      const { from, to } = base.conversion;
      if (!isDamageStat(from)) return;
      const percent = resolveRunePercent(rune, base);
      if (!percent) return;

      const baseValue = getBaseValue(from);
      if (!baseValue) return;
      const targetAmount = Math.max(0, baseValue * (percent / 100));
      if (!targetAmount) return;
      const available = getAvailableFromSource(from);
      if (!available) return;
      const move = Math.min(available, targetAmount);
      if (!move) return;

      consumedFromSource[from] = (consumedFromSource[from] || 0) + move;
      deltas[from] = (deltas[from] || 0) - move;
      damageDeltas[from] = (damageDeltas[from] || 0) - move;

      if (isDamageStat(to)) {
        deltas[to] = (deltas[to] || 0) + move;
        damageDeltas[to] = (damageDeltas[to] || 0) + move;
      } else {
        const baseValue = stats[to] ?? 0;
        stats[to] = Math.max(0, baseValue + move);
      }
    });

    Object.entries(deltas).forEach(([stat, delta]) => {
      if (!delta) return;
      const baseValue = stats[stat] ?? 0;
      const next = baseValue + delta;
      stats[stat] = next > 0 ? next : 0;
    });

    return damageDeltas;
  }

  getBonusEffects() {
    const bonuses = {};
    this.equipped.forEach((rune) => {
      if (!rune) return;
      const base = RUNES_BY_ID.get(rune.id);
      if (!base?.bonus) return;
      Object.entries(base.bonus).forEach(([stat, value]) => {
        bonuses[stat] = (bonuses[stat] || 0) + value;
      });
    });
    return bonuses;
  }
}

export function getRuneName(rune, shortElementalNames = false) {
  const base = RUNES_BY_ID.get(rune.id);
  if (base?.nameKey) return t(base.nameKey);
  const from = formatStatName(base?.fromKey, shortElementalNames);
  const to = formatStatName(base?.toKey, shortElementalNames);
  return tp('rune.convertName', { from, to });
}

export function getRuneDescription(rune, shortElementalNames = false) {
  const base = RUNES_BY_ID.get(rune.id);
  if (base?.descKey) return t(base.descKey);
  const from = formatStatName(base?.fromKey, shortElementalNames);
  const to = formatStatName(base?.toKey, shortElementalNames);
  const percent = base?.conversion ? resolveRunePercent(rune, base) : undefined;
  return tp('rune.convertDesc', {
    percent: percent ?? base?.conversion?.percent,
    from,
    to,
  });
}

export function getRuneIcon(rune) {
  const base = RUNES_BY_ID.get(rune.id);
  return base?.icon || '';
}
