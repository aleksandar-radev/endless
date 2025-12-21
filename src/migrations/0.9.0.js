function stripStatRollBounds(statRolls) {
  if (!statRolls || typeof statRolls !== 'object') return;

  for (const [stat, roll] of Object.entries(statRolls)) {
    if (!roll || typeof roll !== 'object') {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(roll, 'min')) {
      delete roll.min;
    }
    if (Object.prototype.hasOwnProperty.call(roll, 'max')) {
      delete roll.max;
    }
    if (Object.keys(roll).length === 0) {
      delete statRolls[stat];
    }
  }
}

function walkAndStrip(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(walkAndStrip);
    return;
  }

  if (node.metaData && typeof node.metaData === 'object') {
    const statRolls = node.metaData.statRolls;
    if (statRolls && typeof statRolls === 'object') {
      stripStatRollBounds(statRolls);
      if (Object.keys(statRolls).length === 0) {
        delete node.metaData.statRolls;
      }
    }
  }

  if (node.statRolls && typeof node.statRolls === 'object') {
    stripStatRollBounds(node.statRolls);
    if (Object.keys(node.statRolls).length === 0) {
      delete node.statRolls;
    }
  }

  for (const value of Object.values(node)) {
    walkAndStrip(value);
  }
}

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

  // Logic from 0.8.18
  walkAndStrip(data);

  // Logic from 0.8.19
  data.inventory = data.inventory || {};

  if (Array.isArray(data.inventory.inventoryItems)) {
    data.inventory.inventoryItems.forEach(markItemScalingSystemLegacy);
  }

  if (data.inventory.equippedItems && typeof data.inventory.equippedItems === 'object') {
    Object.values(data.inventory.equippedItems).forEach(markItemScalingSystemLegacy);
  }

  return { data, result: true };
}
