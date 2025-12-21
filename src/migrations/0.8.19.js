function markItemScalingSystemLegacy(item) {
  if (!item || typeof item !== 'object') return;

  if (!item.metaData || typeof item.metaData !== 'object') {
    item.metaData = {};
  }

  // Treat all existing items as obtained with the legacy scaling system.
  // New items will store the active system at creation time.
  if (!item.metaData.scalingSystem) {
    item.metaData.scalingSystem = 'legacy';
  }
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  data.inventory = data.inventory || {};

  if (Array.isArray(data.inventory.inventoryItems)) {
    data.inventory.inventoryItems.forEach(markItemScalingSystemLegacy);
  }

  if (data.inventory.equippedItems && typeof data.inventory.equippedItems === 'object') {
    Object.values(data.inventory.equippedItems).forEach(markItemScalingSystemLegacy);
  }

  return { data, result: true };
}
