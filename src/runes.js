import { RUNES } from './constants/runes.js';
const RUNES_BY_ID = new Map(RUNES.map((r) => [r.id, r]));
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { tp, t } from './i18n.js';
import { formatStatName } from './format.js';
import { hero } from './globals.js';

export const BASE_RUNE_SLOTS = 1;
const INVENTORY_SLOTS = 100;

const OFFENSE_SET = new Set(Object.keys(OFFENSE_STATS));
const DEFENSE_SET = new Set(Object.keys(DEFENSE_STATS));
const MISC_SET = new Set(Object.keys(MISC_STATS));
const ALL_STATS = new Set([...OFFENSE_SET, ...DEFENSE_SET, ...MISC_SET]);

export default class Runes {
  constructor(savedData = {}) {
    // Normalize saved data to minimal representation: only id and conversion.percent
    const normalize = (arr = []) =>
      (arr || []).map((r) => {
        if (!r) return null;
        const minimal = { id: r.id };
        if (r.conversion) {
          const percent = typeof r.conversion.percent === 'number'
            ? r.conversion.percent
            : (RUNES_BY_ID.get(r.id)?.conversion?.percent ?? undefined);
          minimal.conversion = typeof percent === 'number' ? { percent } : undefined;
        }
        return minimal;
      });

    this.equipped = normalize(savedData.equipped || []);
    this.inventory = normalize(savedData.inventory || []);
    this.ensureEquipSlots(BASE_RUNE_SLOTS);
    if (this.inventory.length < INVENTORY_SLOTS) {
      this.inventory = [
        ...this.inventory,
        ...new Array(INVENTORY_SLOTS - this.inventory.length).fill(null),
      ];
    } else if (this.inventory.length > INVENTORY_SLOTS) {
      this.inventory.length = INVENTORY_SLOTS;
    }
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
      this.equipped = [
        ...this.equipped,
        ...new Array(count - this.equipped.length).fill(null),
      ];
    }
  }

  addRune(id, percentOverride) {
    const rune = RUNES_BY_ID.get(id);
    if (!rune) return null;
    const idx = this.inventory.findIndex((r) => r === null);
    if (idx === -1) return null;
    const inst = { id: rune.id };
    if (rune.conversion) {
      const percent =
        typeof percentOverride === 'number' ? percentOverride : rune.conversion.percent;
      inst.conversion = { percent };
    }
    this.inventory[idx] = inst;
    return inst;
  }

  equip(slotIndex, inventoryIndex) {
    const rune = this.inventory[inventoryIndex];
    if (!rune) return;
    const base = RUNES_BY_ID.get(rune.id);
    if (base?.unique) {
      const existingIndex = this.equipped.findIndex((r) => r?.id === rune.id);
      if (existingIndex !== -1 && existingIndex !== slotIndex) {
        return;
      }
    }
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
    const rune = this.inventory[index];
    if (!rune) return 0;
    const base = RUNES.find((r) => r.id === rune.id);

    let crystals = 0;
    if (base?.unique) {
      crystals = 200;
    } else if (base?.conversion) {
      const percent = rune.conversion?.percent ?? base.conversion.percent;
      crystals = Math.max(1, Math.floor(percent / 2));
    } else if (base?.bonus) {
      const maxBonus = Math.max(...Object.values(base.bonus));
      crystals = Math.max(1, Math.floor(maxBonus / 2));
    } else {
      crystals = 1;
    }

    this.inventory[index] = null;
    hero.gainCrystals(crystals);
    return crystals;
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
      if (!rune) return;
      const base = RUNES_BY_ID.get(rune.id);
      if (!base?.conversion) return;
      const from = base.conversion.from;
      const to = base.conversion.to;
      const percent = rune.conversion?.percent ?? base.conversion.percent;
      if (!ALL_STATS.has(from) || !ALL_STATS.has(to)) return;
      const amount = (flatValues[from] || 0) * (percent / 100);
      flatValues[from] = (flatValues[from] || 0) - amount;
      flatValues[to] = (flatValues[to] || 0) + amount;
    });
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
  return tp('rune.convertDesc', {
    percent: rune.conversion?.percent ?? base?.conversion?.percent,
    from,
    to,
  });
}

export function getRuneIcon(rune) {
  const base = RUNES_BY_ID.get(rune.id);
  return base?.icon || '';
}
