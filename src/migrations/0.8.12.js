
import { TWO_HANDED_TYPES } from '../constants/items.js';
import { STATS } from '../constants/stats/stats.js';

const twoHandedSet = new Set(TWO_HANDED_TYPES);

function doubleItemStats(item) {
  if (!item || !twoHandedSet.has(item.type) || !item.stats) return;
  Object.keys(item.stats).forEach((stat) => {
    const value = item.stats[stat];
    if (typeof value !== 'number') return;
    const decimals = STATS[stat]?.decimalPlaces ?? 0;
    const multiplied = value * 2;
    item.stats[stat] = Number(multiplied.toFixed(decimals));
  });
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));
  data.options = data.options || {};
  data.inventory = data.inventory || {};
  data.inventory.equippedItems = data.inventory.equippedItems || {};
  if (!Array.isArray(data.inventory.inventoryItems)) {
    data.inventory.inventoryItems = [];
  }

  const moveToInventory = (item) => {
    if (!item) return;
    const items = data.inventory.inventoryItems;
    const emptyIndex = items.findIndex((slot) => slot === null || slot === undefined);
    if (emptyIndex !== -1) {
      items[emptyIndex] = item;
    } else {
      items.push(item);
    }
  };

  // Double stats for equipped two-handed items and handle off-hand removal.
  const equipped = data.inventory.equippedItems;
  Object.values(equipped).forEach((item) => {
    doubleItemStats(item);
  });

  const weapon = equipped.weapon;
  if (weapon && twoHandedSet.has(weapon.type) && equipped.offhand) {
    moveToInventory(equipped.offhand);
    delete equipped.offhand;
  }

  // Double stats for inventory two-handed items.
  data.inventory.inventoryItems = data.inventory.inventoryItems.map((item) => {
    doubleItemStats(item);
    return item;
  });

  return { data, result: true };
}
