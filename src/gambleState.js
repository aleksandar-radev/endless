import Item from './item.js';

export default class GambleState {
  constructor(savedData) {
    this.stash = [];

    if (savedData?.stash?.length) {
      this.stash = savedData.stash
        .filter(Boolean)
        .map((item) => {
          const restored = new Item({
            type: item.type,
            subtype: item.subtype,
            level: item.level,
            rarity: item.rarity,
            tier: item.tier,
            existingStats: item.stats,
            metaData: item.metaData,
          });
          restored.id = item.id;
          return restored;
        });
    }
  }
}
