export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  if (data.inventory) {
    if (Array.isArray(data.inventory.inventoryItems)) {
      data.inventory.inventoryItems = data.inventory.inventoryItems.map((item) => {
        if (item?.rarity?.toUpperCase() === 'UNIQUE') {
          return { ...item, rarity: 'EPIC' };
        }
        return item;
      });
    }

    if (data.inventory.equippedItems && typeof data.inventory.equippedItems === 'object') {
      Object.values(data.inventory.equippedItems).forEach((item) => {
        if (item?.rarity?.toUpperCase() === 'UNIQUE') {
          item.rarity = 'EPIC';
        }
      });
    }

    if (Array.isArray(data.inventory.autoSalvageRarities)) {
      data.inventory.autoSalvageRarities = data.inventory.autoSalvageRarities.map((r) =>
        r?.toUpperCase() === 'UNIQUE' ? 'EPIC' : r
      );
    }
  }

  if (data.statistics) {
    if (data.statistics.itemsFound?.unique != null) {
      data.statistics.itemsFound.epic = (data.statistics.itemsFound.epic || 0) + data.statistics.itemsFound.unique;
      delete data.statistics.itemsFound.unique;
    }

    if (data.statistics.enemiesKilled?.unique != null) {
      data.statistics.enemiesKilled.epic =
        (data.statistics.enemiesKilled.epic || 0) + data.statistics.enemiesKilled.unique;
      delete data.statistics.enemiesKilled.unique;
    }
  }

  if (data.options) {
    data.options.version = '0.7.10';
  }

  return { data, result: true };
}
