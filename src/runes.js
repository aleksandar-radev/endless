import { RUNES } from './constants/runes.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { tp } from './i18n.js';
import { formatStatName } from './format.js';

const EQUIP_SLOTS = 5;
const INVENTORY_SLOTS = 30;

const OFFENSE_SET = new Set(Object.keys(OFFENSE_STATS));
const DEFENSE_SET = new Set(Object.keys(DEFENSE_STATS));
const MISC_SET = new Set(Object.keys(MISC_STATS));
const ALL_STATS = new Set([...OFFENSE_SET, ...DEFENSE_SET, ...MISC_SET]);

export default class Runes {
  constructor(savedData = {}) {
    this.equipped = savedData.equipped || new Array(EQUIP_SLOTS).fill(null);
    this.inventory = savedData.inventory || new Array(INVENTORY_SLOTS).fill(null);
  }

  addRune(id, percentOverride) {
    const rune = RUNES.find((r) => r.id === id);
    if (!rune) return null;
    const idx = this.inventory.findIndex((r) => r === null);
    if (idx === -1) return null;
    const inst = { ...rune, conversion: { ...rune.conversion } };
    if (percentOverride !== undefined) inst.conversion.percent = percentOverride;
    this.inventory[idx] = inst;
    return inst;
  }

  equip(slotIndex, inventoryIndex) {
    const rune = this.inventory[inventoryIndex];
    if (!rune) return;
    const previous = this.equipped[slotIndex];
    this.equipped[slotIndex] = rune;
    this.inventory[inventoryIndex] = previous || null;
  }

  unequip(slotIndex, inventoryIndex) {
    const rune = this.equipped[slotIndex];
    if (!rune) return;
    const dest =
      inventoryIndex !== undefined ? inventoryIndex : this.inventory.findIndex((r) => r === null);
    if (dest === -1) return;
    const previous = this.inventory[dest];
    this.inventory[dest] = rune;
    this.equipped[slotIndex] = previous || null;
  }

  moveInventory(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    [this.inventory[fromIndex], this.inventory[toIndex]] = [
      this.inventory[toIndex],
      this.inventory[fromIndex],
    ];
  }

  moveEquipped(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    [this.equipped[fromIndex], this.equipped[toIndex]] = [
      this.equipped[toIndex],
      this.equipped[fromIndex],
    ];
  }

  salvage(index) {
    if (this.inventory[index]) {
      this.inventory[index] = null;
    }
  }

  sortInventory(shortElementalNames = false) {
    this.inventory.sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return getRuneName(a, shortElementalNames).localeCompare(
        getRuneName(b, shortElementalNames),
      );
    });
  }

  /**
   * Apply equipped rune conversions to the provided flat stat values.
   * @param {Record<string, number>} flatValues
   */
  applyBonuses(flatValues) {
    if (!flatValues) return;
    this.equipped.forEach((rune) => {
      if (!rune?.conversion) return;
      const { from, to, percent } = rune.conversion;
      if (!ALL_STATS.has(from) || !ALL_STATS.has(to)) return;
      const amount = (flatValues[from] || 0) * (percent / 100);
      flatValues[from] = (flatValues[from] || 0) - amount;
      flatValues[to] = (flatValues[to] || 0) + amount;
    });
  }
}

export function getRuneName(rune, shortElementalNames = false) {
  const from = formatStatName(rune.fromKey, shortElementalNames);
  const to = formatStatName(rune.toKey, shortElementalNames);
  return tp('rune.convertName', { from, to });
}

export function getRuneDescription(rune, shortElementalNames = false) {
  const from = formatStatName(rune.fromKey, shortElementalNames);
  const to = formatStatName(rune.toKey, shortElementalNames);
  return tp('rune.convertDesc', {
    percent: rune.conversion.percent,
    from,
    to,
  });
}
