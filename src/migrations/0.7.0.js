export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  data.statistics = data.statistics || {};

  if (!data.statistics.itemsFound) {
    const total = data.statistics.totalItemsFound || 0;
    data.statistics.itemsFound = {
      normal: total,
      magic: 0,
      rare: 0,
      unique: 0,
      legendary: 0,
      mythic: 0,
    };
  } else {
    data.statistics.itemsFound.normal = data.statistics.itemsFound.normal || 0;
    data.statistics.itemsFound.magic = data.statistics.itemsFound.magic || 0;
    data.statistics.itemsFound.rare = data.statistics.itemsFound.rare || 0;
    data.statistics.itemsFound.unique = data.statistics.itemsFound.unique || 0;
    data.statistics.itemsFound.legendary = data.statistics.itemsFound.legendary || 0;
    data.statistics.itemsFound.mythic = data.statistics.itemsFound.mythic || 0;
  }

  return { data, result: true };
}
