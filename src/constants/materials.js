import { skillTree } from '../globals.js';

// Material definitions
export const MATERIALS = {
  EXPERIENCE_POTION: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants 1000 experience when used.',
    dropChance: 20,
    sort: 10,
    onUse: (hero, qty = 1) => {
      hero.gainExp(1000 * qty);
    },
  },
  GREATER_EXPERIENCE_POTION: {
    id: 'greater_experience_potion',
    name: 'Greater Experience Potion',
    icon: '🧪',
    description: 'Grants 5000 experience when used.',
    dropChance: 3,
    sort: 10,
    onUse: (hero, qty = 1) => {
      hero.gainExp(5000 * qty);
    },
  },
  GOLD_COINS: {
    id: 'gold_coins',
    name: 'Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000} gold per coin to your total.`;
    },
    dropChance: 60,
    sort: 40,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000 * qty);
    },
  },
  LARGE_GOLD_COINS: {
    id: 'large_gold_coins',
    name: 'Large Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${10000} gold per coin to your total.`;
    },
    dropChance: 20,
    sort: 50,
    onUse: (hero, qty = 1) => {
      hero.gainGold(10000 * qty);
    },
  },
  ENORMOUS_GOLD_COINS: {
    id: 'enormous_gold_coins',
    name: 'Enormous Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${50000} gold per coin to your total.`;
    },
    dropChance: 1,
    sort: 60,
    onUse: (hero, qty = 1) => {
      hero.gainGold(50000 * qty);
    },
  },
  FREAKY_GOLD_COINS: {
    id: 'freaky_gold_coins',
    name: 'Freaky Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000000} gold per coin to your total.`;
    },
    dropChance: 0.01,
    sort: 60,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000000 * qty);
    },
  },
  ELIXIR: {
    id: 'elixir',
    name: 'Elixir',
    icon: '🥤',
    description: 'Grants 1 skill point.',
    dropChance: 2,
    sort: 70,
    exclusive: true, // only drops when region or enemy canDrop includes 'elixir'
    onUse: (hero, qty = 1) => {
      hero.permaStats.skillPoints = hero.permaStats.skillPoints + 1 * qty;
      skillTree.addSkillPoints(1 * qty);
    },
  },
  CRYSTALIZED_ROCK: {
    id: 'crystalized_rock',
    name: 'Crystalized Rock',
    icon: '💎',
    description: 'Gives 1 crystal.',
    dropChance: 20,
    sort: 80,
    onUse: (hero, qty = 1) => {
      hero.gainCrystals(1 * qty);
    },
  },
  POTION_OF_STRENGTH: {
    id: 'potion_of_strength',
    name: 'Potion of Strength',
    icon: '💥',
    description: 'Increases strength by 1.',
    dropChance: 12,
    sort: 90,
    onUse: (hero, qty = 1) => {
      hero.permaStats.strength += 1 * qty;
    },
  },
  POTION_OF_AGILITY: {
    id: 'potion_of_agility',
    name: 'Potion of Agility',
    icon: '🏃',
    description: 'Increases agility by 1.',
    dropChance: 12,
    sort: 100,
    onUse: (hero, qty = 1) => {
      hero.permaStats.agility += 1 * qty;
    },
  },
  POTION_OF_VITALITY: {
    id: 'potion_of_vitality',
    name: 'Potion of Vitality',
    icon: '❤️',
    description: 'Increases vitality by 1.',
    dropChance: 12,
    sort: 110,
    onUse: (hero, qty = 1) => {
      hero.permaStats.vitality += 1 * qty;
    },
  },
  POTION_OF_ENDURANCE: {
    id: 'potion_of_endurance',
    name: 'Potion of Endurance',
    icon: '🛡️',
    description: 'Increases endurance by 1.',
    dropChance: 12,
    sort: 120,
    onUse: (hero, qty = 1) => {
      hero.permaStats.endurance += 1 * qty;
    },
  },
  POTION_OF_WISDOM: {
    id: 'potion_of_wisdom',
    name: 'Potion of Wisdom',
    icon: '🧠',
    description: 'Increases wisdom by 1.',
    dropChance: 12,
    sort: 130,
    onUse: (hero, qty = 1) => {
      hero.permaStats.wisdom += 1 * qty;
    },
  },
  POTION_OF_DEXTERITY: {
    id: 'potion_of_dexterity',
    name: 'Potion of Dexterity',
    icon: '🎯',
    description: 'Increases dexterity by 1.',
    dropChance: 12,
    sort: 140,
    onUse: (hero, qty = 1) => {
      hero.permaStats.dexterity += 1 * qty;
    },
  },
  ARMOR_UPGRADE_STONE: {
    id: 'armor_upgrade_stone',
    name: 'Armor Upgrade Stone',
    icon: '🪨',
    description: 'Upgrade the level of an equipped armor item by 1.',
    dropChance: 20,
    sort: 150,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'armor',
    isCustom: true,
  },
  JEWELRY_UPGRADE_GEM: {
    id: 'jewelry_upgrade_gem',
    name: 'Jewelry Upgrade Gem',
    icon: '💍',
    description: 'Upgrade the level of an equipped jewelry item by 1.',
    dropChance: 4,
    sort: 160,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'jewelry',
    isCustom: true,
  },
  WEAPON_UPGRADE_CORE: {
    id: 'weapon_upgrade_core',
    name: 'Weapon Upgrade Core',
    icon: '⚡',
    description: 'Upgrade the level of an equipped weapon by 1.',
    dropChance: 3,
    sort: 170,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'weapon',
    isCustom: true,
  },
  ENCHANTMENT_SCROLL: {
    id: 'enchantment_scroll',
    name: 'Enchantment Scroll',
    icon: '📜',
    description: 'Increases the rarity of an equipped item. (cannot be used on mythic items)',
    dropChance: 0.5,
    sort: 180,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
  ALTERNATION_ORB: {
    id: 'alternation_orb',
    name: 'Alternation Orb',
    icon: '🔄',
    description: 'Re-rolls the value of one random stat on an equipped item.',
    dropChance: 2,
    sort: 190,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
};
