export const run = (rawData) => {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  const cleanItem = (item) => {
    if (!item) return;

    // Ensure metaData exists
    if (!item.metaData) item.metaData = {};

    // Move properties to metaData if missing there, then delete from item
    const props = ['nameKey', 'descriptionKey', 'uniqueId', 'setId', 'setNameKey'];
    props.forEach((prop) => {
      if (item[prop] !== undefined) {
        if (item.metaData[prop] === undefined) {
          item.metaData[prop] = item[prop];
        }
        delete item[prop];
      }
    });

    // subtypeData should just be deleted, it is re-derived
    if (item.subtypeData) {
      delete item.subtypeData;
    }
  };

  if (data.inventory) {
    if (data.inventory.equippedItems) {
      Object.values(data.inventory.equippedItems).forEach((item) => cleanItem(item));
    }
    if (data.inventory.inventoryItems && Array.isArray(data.inventory.inventoryItems)) {
      data.inventory.inventoryItems.forEach((item) => cleanItem(item));
    }
  }

  return { data, result: true };
};
