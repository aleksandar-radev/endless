import { ITEM_TYPES } from './constants/items.js';
import { QUEST_DEFINITIONS } from './constants/quests.js';
import { hero, statistics, dataManager, inventory } from './globals.js';
import { showToast, updateResources, updateTabIndicators } from './ui/ui.js';

export class Quest {
  constructor({ id, title, description, type, target, reward, icon, category, rarity, resource }, claimed = false) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.target = target;
    this.reward = reward;
    this.icon = icon;
    this.category = category;
    this.rarity = rarity;
    this.resource = resource;
    this.claimed = claimed;
  }

  // Progress is now computed from statistics, not stored
  getProgress() {
    if (this.type === 'kill') {
      return Math.min(statistics.enemiesKilled.total, this.target);
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
      const tier = this.tier || 1;
      const stage = statistics.highestStages?.[tier] || 0;
      return Math.min(stage, this.target);
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
      // Generate a random item of the correct rarity, tier, and player level
      const rarity = this.reward.item.rarity.toUpperCase();
      const tier = this.reward.item.tier || 1;
      const level = statistics.highestStages?.[tier] || 1;
      // Pick a random item type
      const itemTypes = Object.keys(ITEM_TYPES);
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const newItem = inventory.createItem(type, level, rarity, tier);
      inventory.addItemToInventory(newItem);
      showToast(`You received a ${rarity} ${type} (Tier ${tier})!`, 'normal');
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
