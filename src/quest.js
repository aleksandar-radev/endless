import { ITEM_TYPES, ALL_ITEM_TYPES } from './constants/items.js';
import { QUEST_DEFINITIONS } from './constants/quests.js';
import { hero, statistics, dataManager, inventory } from './globals.js';
import { showToast, updateResources, updateTabIndicators } from './ui/ui.js';
import { MATERIALS } from './constants/materials.js';
import { createUniqueItemById } from './uniqueItems.js';
import { t } from './i18n.js';

export class Quest {
  constructor(def, claimed = false) {
    Object.defineProperties(this, Object.getOwnPropertyDescriptors(def));
    this.claimed = claimed;
  }

  // Progress is now computed from statistics, not stored
  getProgress() {
    if (this.type === 'kill') {
      return Math.min(statistics.totalEnemiesKilled, this.target);
    }
    if (this.type === 'kill_rarity' && this.rarity) {
      const rarityKey = this.rarity.toLowerCase();
      return Math.min(statistics.enemiesKilled[rarityKey] || 0, this.target);
    }
    if (this.type === 'resource' && this.resource) {
      // For gold, use statistics.totalGoldEarned; for crystals, use statistics.totalCrystalsEarned
      if (this.resource === 'totalGoldEarned') {
        return Math.min(statistics.totalGoldEarned, this.target);
      }
      if (this.resource === 'crystals') {
        return Math.min(statistics.totalCrystalsEarned, this.target);
      }
    }
    if (this.type === 'level') {
      return Math.min(hero.level, this.target);
    }
    if (this.type === 'stage') {
      // Use tier from quest definition, or from reward (for legacy/compatibility), or sum all if not set
      const tier = this.tier || (this.reward && this.reward.tier);
      if (tier) {
        const stage = statistics.highestStages?.[tier] || 0;
        return Math.min(stage, this.target);
      }
      let totalStages = 0;
      for (let t = 1; t <= 12; t++) {
        totalStages += statistics.highestStages?.[t] || 0;
      }
      return Math.min(totalStages, this.target);
    }
    if (this.type === 'damage') {
      return Math.min(statistics.highestDamageDealt, this.target);
    }
    if (this.type === 'item_drop') {
      return Math.min(statistics.totalItemsFound, this.target);
    }
    if (this.type === 'material_drop') {
      return Math.min(statistics.totalMaterialsFound, this.target);
    }
    return 0;
  }

  isComplete() {
    return this.getProgress() >= this.target;
  }

  claim() {
    if (!this.isComplete() || this.claimed) return null;
    this.claimed = true;

    // apply rewards
    if (this.reward.gold) hero.gainGold(this.reward.gold);
    if (this.reward.exp) hero.gainExp(this.reward.exp);
    if (this.reward.crystals) hero.gainCrystals(this.reward.crystals);
    if (this.reward.item) {
      const rewardItem = this.reward.item;
      if (rewardItem.uniqueId) {
        const tier = rewardItem.tier || 1;
        const level = rewardItem.level || statistics.highestStages?.[tier] || hero.level || 1;
        const uniqueItem = createUniqueItemById(rewardItem.uniqueId, tier, level);
        if (uniqueItem) {
          inventory.addItemToInventory(uniqueItem);
          const itemName = uniqueItem.nameKey ? t(uniqueItem.nameKey) : uniqueItem.type;
          showToast(`You received ${itemName}!`, 'normal');
        }
      } else if (rewardItem.rarity) {
        // Generate a random item of the correct rarity, tier, and player level
        const rarity = rewardItem.rarity.toUpperCase();
        const tier = rewardItem.tier || 1;
        const level = statistics.highestStages?.[tier] || 1;
        // Pick a random item type
        const itemTypes = ALL_ITEM_TYPES;
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const newItem = inventory.createItem(type, level, rarity, tier);
        inventory.addItemToInventory(newItem);
        showToast(`You received a ${rarity} ${type} (Tier ${tier})!`, 'normal');
      }
    }
    if (this.reward.materials && Array.isArray(this.reward.materials)) {
      this.reward.materials.forEach(({ id, qty }) => {
        inventory.addMaterial({ id, qty });
        const matDef = MATERIALS[id] || Object.values(MATERIALS).find((m) => m.id === id);
        if (matDef) {
          showToast(
            `You received ${qty} ${matDef.name}${qty > 1 ? 's' : ''}!`,
            'normal',
          );
        }
      });
    }
    showToast(`Quest "${this.title}" claimed!`, 'normal');
    updateResources();

    // Update tab indicators for claimed quest rewards
    updateTabIndicators();
    dataManager.saveGame();

    return this.reward;
  }

  toJSON() {
    return { claimed: this.claimed };
  }

  static fromJSON(def, data = {}) {
    return new Quest(def, data.claimed || false);
  }
}

export default class QuestTracker {
  constructor(savedData = null) {
    this.quests = QUEST_DEFINITIONS.map((def) => Quest.fromJSON(def, savedData?.[def.id]));
  }

  claim(id) {
    const q = this.quests.find((quest) => quest.id === id);
    return q ? q.claim() : null;
  }

  toJSON() {
    const data = {};
    this.quests.forEach((q) => {
      data[q.id] = q.toJSON();
    });
    return data;
  }

  // Reset all quest claimed status
  reset() {
    this.quests = QUEST_DEFINITIONS.map((def) => Quest.fromJSON(def));
  }
}
