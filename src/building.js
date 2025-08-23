// Game logic and persistent state for buildings
import { buildingsData } from './constants/buildings.js';
import { dataManager, hero, inventory } from './globals.js';
import { updateResources, formatNumber } from './ui/ui.js';
import { showOfflineBonusesModal } from './ui/buildingUi.js';
import { fetchTrustedUtcTime } from './api.js';
import { getTimeNow } from './common.js';
import { t, tp } from './i18n.js';
import { MATERIALS } from './constants/materials.js';
const refundPercent = 0.9;

// Represents a single building instance (with state)
export class Building {
  constructor({ id, level = 0, placedAt = null, lastBonusTime = null, totalEarned = 0 }) {
    const data = buildingsData[id];
    if (!data) throw new Error(`Unknown building id: ${id}`);
    this.id = id;
    this.level = level;
    this.placedAt = placedAt; // index of map placeholder, or null if not placed

    this.icon = data.icon;
    this.image = data.image;
    this.effect = data.effect;
    this.maxLevel = data.maxLevel;
    this.costStructure = data.costStructure;
    this.lastBonusTime = lastBonusTime;
    this.totalEarned = totalEarned;
  }

  get name() {
    return buildingsData[this.id].name;
  }

  get description() {
    return buildingsData[this.id].description;
  }

  static async create({ id, level = 0, placedAt = null, lastBonusTime = null, totalEarned = 0 }) {
    if (!lastBonusTime) {
      lastBonusTime = await getTimeNow();
    }
    return new Building({ id, level, placedAt, lastBonusTime, totalEarned });
  }

  upgrade() {
    if (this.level < this.maxLevel) {
      this.level++;
      return true;
    }
    return false;
  }

  // Returns the current effect value based on level
  getEffectValue() {
    return (this.effect?.amount || 0) * this.level;
  }

  // Returns the effect value after upgrading to the given level
  getNextEffectValue(targetLevel) {
    if (targetLevel <= this.level) return this.getEffectValue();
    return (this.effect?.amount || 0) * targetLevel;
  }

  // Returns a formatted string for the effect at a given level
  formatEffect(level = this.level) {
    if (!this.effect || typeof this.effect !== 'object') return '';
    let interval = '';
    const int = this.effect.interval;
    if (int) {
      if (int === 'minute' || int === 'hour') {
        interval = ` per ${t('time.' + int)}`;
      } else if (int.endsWith('min')) {
        const val = parseInt(int);
        const key = 'time.' + (val === 1 ? 'minute' : 'minutes');
        interval = ` per ${val} ${t(key)}`;
      } else if (int.endsWith('sec')) {
        const val = parseInt(int);
        const key = 'time.' + (val === 1 ? 'second' : 'seconds');
        interval = ` per ${val} ${t(key)}`;
      } else {
        interval = ` per ${int}`;
      }
    }
    const typeName = this.effect.displayName || this.effect.type;
    return `+${this.effect.amount * level} ${typeName}${interval}`;
  }

  // Returns a formatted string for a cost object
  static formatCost(costObj) {
    if (!costObj || typeof costObj !== 'object') return '';
    return Object.entries(costObj)
      .map(([type, value]) => `${formatNumber(value)} ${type}`)
      .join(', ');
  }

  // Returns the cost object for a given upgrade amount (default 1)
  getUpgradeCost(amount = 1) {
    // Returns the total cost for upgrading 'amount' levels from current level
    const costs = {};
    const startLevel = this.level;
    for (const [type, { base, increment, cap }] of Object.entries(this.costStructure)) {
      // Formula: base * amount + increment * (amount * (2 * startLevel + amount - 1) / 2)
      let total = base * amount + increment * (amount * (2 * startLevel + amount - 1) / 2);
      if (cap !== null && cap !== undefined) {
        // Cap applies per level, so max cost for this upgrade is cap * amount
        total = Math.min(total, cap * amount);
      }
      costs[type] = Math.ceil(total);
    }
    return costs;
  }

  // Returns the maximum number of upgrades the player can afford with all resources
  getMaxUpgradeAmount(hero) {
    let maxPossible = this.maxLevel - this.level;
    if (maxPossible <= 0) return 0;
    let affordable = maxPossible;
    for (const type of Object.keys(this.costStructure)) {
      let playerResource = hero[type + 's'] !== undefined ? hero[type + 's'] : hero[type];
      if (playerResource === undefined) continue;
      let low = 0,
        high = maxPossible;
      while (low < high) {
        let mid = Math.ceil((low + high) / 2);
        const totalCost = this.getUpgradeCost(mid);
        if (totalCost[type] > playerResource) {
          high = mid - 1;
        } else {
          low = mid;
        }
      }
      affordable = Math.min(affordable, low);
    }
    return affordable;
  }

  // Returns the refund object for the current level
  getRefund() {
    // Returns the refund for the current level
    const refund = {};
    const n = this.level;
    for (const [type, { base, increment, cap }] of Object.entries(this.costStructure)) {
      // Total spent across all upgrades up to level n
      let totalSpent = base * n + increment * (n * (n - 1) / 2);
      if (cap !== null && cap !== undefined) {
        // Cap applies per level, so max spent is cap * n
        totalSpent = Math.min(totalSpent, cap * n);
      }
      refund[type] = Math.floor(refundPercent * totalSpent);
    }
    return refund;
  }

  // Refunds resources to the hero for this building (used when selling)
  refundToHero() {
    const refund = this.getRefund();
    for (const [type, value] of Object.entries(refund)) {
      if (hero[type + 's'] !== undefined) hero[type + 's'] += value;
      else if (hero[type] !== undefined) hero[type] += value;
    }
    updateResources(); // Update UI after refund
    dataManager.saveGame(); // Save after refund
  }

  // Returns a serializable object
  toJSON() {
    return {
      id: this.id,
      level: this.level,
      placedAt: this.placedAt,
      lastBonusTime: this.lastBonusTime,
      totalEarned: this.totalEarned,
    };
  }
}

// Helper to convert interval string to ms
function intervalToMs(interval) {
  if (!interval) return 0;
  if (interval === 'minute') return 60 * 1000;
  if (interval === 'hour') return 60 * 60 * 1000;
  if (interval.endsWith('min')) return parseInt(interval) * 60 * 1000;
  if (interval.endsWith('sec')) return parseInt(interval) * 1000;
  return 0;
}

export class BuildingManager {
  constructor() {
    throw new Error('Use BuildingManager.create() instead');
  }

  static async create(saved = null) {
    const manager = Object.create(BuildingManager.prototype);
    manager.buildings = {};
    manager.placedBuildings = [null, null, null];
    manager.lastActive = saved?.lastActive || await getTimeNow();
    for (const id in buildingsData) {
      const bSave = saved?.buildings?.[id];
      manager.buildings[id] = await Building.create({
        id,
        level: bSave?.level || 0,
        placedAt: bSave?.placedAt ?? null,
        lastBonusTime: bSave?.lastBonusTime || manager.lastActive,
        totalEarned: bSave?.totalEarned || 0,
      });
      if (manager.buildings[id].placedAt !== null) {
        manager.placedBuildings[manager.buildings[id].placedAt] = id;
      }
    }
    return manager;
  }

  // Place a building at a map placeholder (returns true if successful)
  async placeBuilding(buildingId, placeholderIdx) {
    // Remove any building currently at this spot
    const prevId = this.placedBuildings[placeholderIdx];
    if (prevId) this.buildings[prevId].placedAt = null;
    // Remove this building from any previous spot
    const b = this.buildings[buildingId];
    if (b.placedAt !== null) this.placedBuildings[b.placedAt] = null;
    b.placedAt = placeholderIdx;
    this.placedBuildings[placeholderIdx] = buildingId;
    // Set lastBonusTime to now when placed
    b.lastBonusTime = await getTimeNow();
  }

  // Remove a building from the map
  async unplaceBuilding(buildingId) {
    const b = this.buildings[buildingId];
    if (b.placedAt !== null) {
      this.placedBuildings[b.placedAt] = null;
      b.placedAt = null;
      b.level = 0; // Reset level when unplaced
      b.lastBonusTime = await getTimeNow(); // Optionally reset lastBonusTime
    }
  }

  // Upgrade a building
  upgradeBuilding(buildingId) {
    return this.buildings[buildingId].upgrade();
  }

  // Get building at a map placeholder
  getBuildingAt(placeholderIdx) {
    const id = this.placedBuildings[placeholderIdx];
    return id ? this.buildings[id] : null;
  }

  // Get all placed buildings
  getPlacedBuildings() {
    return this.placedBuildings.map((id, idx) => (id ? this.buildings[id] : null));
  }

  // Get all buildings (array)
  getAllBuildings() {
    return Object.values(this.buildings);
  }

  // --- Bonus collection logic ---
  async collectBonuses({ showOfflineModal = false } = {}) {
    const now = await getTimeNow();
    let offlineBonuses = [];
    const isFirstCollect = showOfflineModal;
    let changed = false;
    for (const b of this.getPlacedBuildings()) {
      if (!b || b.level <= 0) continue;
      const intervalMs = intervalToMs(b.effect?.interval);
      if (!intervalMs) continue;
      let times = Math.floor((now - b.lastBonusTime) / intervalMs);
      if (times > 0) {
        const totalBonus = b.effect.amount * b.level * times;
        if (isFirstCollect) {
          offlineBonuses.push({
            name: b.name,
            type: b.effect.displayName || b.effect.type,
            amount: totalBonus,
            times,
            interval: b.effect.interval,
            icon: b.icon,
            building: b,
            timesRaw: times,
            intervalMs,
            materialId: b.effect.materialId,
            materialIds: b.effect.materialIds,
            random: b.effect.random || false,
            weighted: b.effect.weighted || false,
          });
        } else {
          // Online collection: add instantly
          if (b.effect.type === 'gold') hero.gainGold(totalBonus);
          else if (b.effect.type === 'crystal') hero.gainCrystals(totalBonus);
          else if (b.effect.type === 'soul') hero.gainSouls(totalBonus);
          else if (b.effect.type === 'material') {
            if (b.effect.materialIds) {
              for (let i = 0; i < totalBonus; i++) {
                const ids = b.effect.materialIds;
                const randId = ids[Math.floor(Math.random() * ids.length)];
                inventory.addMaterial({ id: randId, qty: 1 });
              }
            } else if (b.effect.random && b.effect.weighted) {
              for (let i = 0; i < totalBonus; i++) {
                const mat = inventory.getRandomMaterial();
                inventory.addMaterial({ id: mat.id, qty: 1 });
              }
            } else if (b.effect.random) {
              for (let i = 0; i < totalBonus; i++) {
                const ids = Object.keys(MATERIALS);
                const randId = ids[Math.floor(Math.random() * ids.length)];
                inventory.addMaterial({ id: randId, qty: 1 });
              }
            } else if (b.effect.materialId) {
              inventory.addMaterial({ id: b.effect.materialId, qty: totalBonus });
            }
          }
          // Increment total earned for this building
          b.totalEarned += totalBonus;
          b.lastBonusTime += times * intervalMs;
          changed = true;
        }
      }
    }
    if (isFirstCollect && offlineBonuses.length > 0) {
      // Only show modal if there are actual bonuses to collect
      showOfflineBonusesModal(offlineBonuses, async () => {
        // On collect: actually add the bonuses and update lastBonusTime
        for (const b of offlineBonuses) {
          if (b.type === 'gold') hero.gainGold(b.amount);
          else if (b.type === 'crystal') hero.gainCrystals(b.amount);
          else if (b.type === 'soul') hero.gainSouls(b.amount);
          else if (b.building.effect.type === 'material') {
            if (b.materialIds) {
              for (let i = 0; i < b.amount; i++) {
                const ids = b.materialIds;
                const randId = ids[Math.floor(Math.random() * ids.length)];
                inventory.addMaterial({ id: randId, qty: 1 });
              }
            } else if (b.random && b.weighted) {
              for (let i = 0; i < b.amount; i++) {
                const mat = inventory.getRandomMaterial();
                inventory.addMaterial({ id: mat.id, qty: 1 });
              }
            } else if (b.random) {
              for (let i = 0; i < b.amount; i++) {
                const ids = Object.keys(MATERIALS);
                const randId = ids[Math.floor(Math.random() * ids.length)];
                inventory.addMaterial({ id: randId, qty: 1 });
              }
            } else if (b.materialId) {
              inventory.addMaterial({ id: b.materialId, qty: b.amount });
            }
          }
          // Increment total earned for this building
          b.building.totalEarned += b.amount;
          b.building.lastBonusTime += b.timesRaw * b.intervalMs;
        }
        this.lastActive = await fetchTrustedUtcTime();
        updateResources();
        dataManager.saveGame(); // Save after collecting bonuses
      });
      changed = true; // Modal will result in a change
    } else if (!isFirstCollect && changed) {
      this.lastActive = now;
      updateResources();
    }
    if (changed) {
      dataManager.saveGame(); // Save only if there was a change
    }
  }

  // Serialize state for saving
  toJSON() {
    const out = { buildings: {}, placedBuildings: [...this.placedBuildings], lastActive: this.lastActive };
    for (const id in this.buildings) {
      out.buildings[id] = this.buildings[id].toJSON();
    }
    return out;
  }

  // Static: load from JSON
  static fromJSON(json) {
    return new BuildingManager(json);
  }
}

// You can add more helpers for effects, collection, etc. as needed.
