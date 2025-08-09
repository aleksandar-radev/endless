import { skillTree } from '../globals.js';

// Material definitions
export const MATERIALS = {
  experience_potion: {
    id: 'experience_potion',
    name: 'Experience Potion',
    icon: '🧪',
    description: 'Grants 1000 experience when used.',
    dropChance: 20,
    sort: 100,
    onUse: (hero, qty = 1) => {
      hero.gainExp(1000 * qty);
    },
  },
  greater_experience_potion: {
    id: 'greater_experience_potion',
    name: 'Greater Experience Potion',
    icon: '🧪',
    description: 'Grants 5% experience when used.',
    dropChance: 3,
    sort: 101,
    onUse: (hero, qty = 1) => {
      const xpGain = Math.floor(hero.getExpToNextLevel() * 0.05);
      hero.gainExp(xpGain * qty);
    },
  },
  huge_experience_potion: {
    id: 'huge_experience_potion',
    name: 'Huge Experience Potion',
    icon: '🧪',
    description: 'Grants 15% experience when used.',
    dropChance: 1,
    sort: 102,
    onUse: (hero, qty = 1) => {
      const xpGain = Math.floor(hero.getExpToNextLevel() * 0.15);
      hero.gainExp(xpGain * qty);
    },
  },
  gold_coins: {
    id: 'gold_coins',
    name: 'Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000} gold per coin to your total.`;
    },
    dropChance: 60,
    sort: 200,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000 * qty);
    },
  },
  large_gold_coins: {
    id: 'large_gold_coins',
    name: 'Large Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${10000} gold per coin to your total.`;
    },
    dropChance: 20,
    sort: 201,
    onUse: (hero, qty = 1) => {
      hero.gainGold(10000 * qty);
    },
  },
  enormous_gold_coins: {
    id: 'enormous_gold_coins',
    name: 'Enormous Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${50000} gold per coin to your total.`;
    },
    dropChance: 1,
    sort: 202,
    onUse: (hero, qty = 1) => {
      hero.gainGold(50000 * qty);
    },
  },
  freaky_gold_coins: {
    id: 'freaky_gold_coins',
    name: 'Freaky Gold Coins',
    icon: '🪙',
    get description() {
      return `Adds ${1000000} gold per coin to your total.`;
    },
    dropChance: 0.01,
    sort: 203,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000000 * qty);
    },
  },
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    icon: '🥤',
    description: 'Grants 1 skill point.',
    dropChance: 2,
    sort: 300,
    exclusive: true, // only drops when region or enemy canDrop includes 'elixir'
    onUse: (hero, qty = 1) => {
      hero.permaStats.skillPoints = hero.permaStats.skillPoints + 1 * qty;
      skillTree.addSkillPoints(1 * qty);
    },
  },
  crystalized_rock: {
    id: 'crystalized_rock',
    name: 'Crystalized Rock',
    icon: '💎',
    description: 'Gives 1 crystal.',
    dropChance: 20,
    sort: 400,
    onUse: (hero, qty = 1) => {
      hero.gainCrystals(1 * qty);
    },
  },
  potion_of_strength: {
    id: 'potion_of_strength',
    name: 'Potion of Strength',
    icon: '💥',
    description: 'Increases strength by 1.',
    dropChance: 12,
    sort: 500,
    onUse: (hero, qty = 1) => {
      hero.permaStats.strength += 1 * qty;
    },
  },
  potion_of_agility: {
    id: 'potion_of_agility',
    name: 'Potion of Agility',
    icon: '🏃',
    description: 'Increases agility by 1.',
    dropChance: 12,
    sort: 501,
    onUse: (hero, qty = 1) => {
      hero.permaStats.agility += 1 * qty;
    },
  },
  potion_of_vitality: {
    id: 'potion_of_vitality',
    name: 'Potion of Vitality',
    icon: '❤️',
    description: 'Increases vitality by 1.',
    dropChance: 12,
    sort: 502,
    onUse: (hero, qty = 1) => {
      hero.permaStats.vitality += 1 * qty;
    },
  },
  potion_of_endurance: {
    id: 'potion_of_endurance',
    name: 'Potion of Endurance',
    icon: '🛡️',
    description: 'Increases endurance by 1.',
    dropChance: 12,
    sort: 503,
    onUse: (hero, qty = 1) => {
      hero.permaStats.endurance += 1 * qty;
    },
  },
  potion_of_wisdom: {
    id: 'potion_of_wisdom',
    name: 'Potion of Wisdom',
    icon: '🧠',
    description: 'Increases wisdom by 1.',
    dropChance: 12,
    sort: 504,
    onUse: (hero, qty = 1) => {
      hero.permaStats.wisdom += 1 * qty;
    },
  },
  potion_of_dexterity: {
    id: 'potion_of_dexterity',
    name: 'Potion of Dexterity',
    icon: '🎯',
    description: 'Increases dexterity by 1.',
    dropChance: 12,
    sort: 505,
    onUse: (hero, qty = 1) => {
      hero.permaStats.dexterity += 1 * qty;
    },
  },
  potion_of_intelligence: {
    id: 'potion_of_intelligence',
    name: 'Potion of Intelligence',
    icon: '🧠',
    description: 'Increases intelligence by 1.',
    dropChance: 12,
    sort: 506,
    onUse: (hero, qty = 1) => {
      hero.permaStats.intelligence += 1 * qty;
    },
  },
  potion_of_perseverance: {
    id: 'potion_of_perseverance',
    name: 'Potion of Perseverance',
    icon: '💪',
    description: 'Increases perseverance by 1.',
    dropChance: 12,
    sort: 507,
    onUse: (hero, qty = 1) => {
      hero.permaStats.perseverance += 1 * qty;
    },
  },
  armor_upgrade_stone: {
    id: 'armor_upgrade_stone',
    name: 'Armor Upgrade Stone',
    icon: '🪨',
    description: "Upgrade the level of an equipped armor item. Requires a quantity equal to the item's tier for each level.",
    dropChance: 20,
    sort: 600,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'armor',
    isCustom: true,
  },
  jewelry_upgrade_gem: {
    id: 'jewelry_upgrade_gem',
    name: 'Jewelry Upgrade Gem',
    icon: '💍',
    description: "Upgrade the level of an equipped jewelry item. Requires a quantity equal to the item's tier for each level.",
    dropChance: 4,
    sort: 601,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'jewelry',
    isCustom: true,
  },
  weapon_upgrade_core: {
    id: 'weapon_upgrade_core',
    name: 'Weapon Upgrade Core',
    icon: '⚡',
    description: "Upgrade the level of an equipped weapon. Requires a quantity equal to the item's tier for each level.",
    dropChance: 3,
    sort: 602,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'weapon',
    isCustom: true,
  },
  enchantment_scroll: {
    id: 'enchantment_scroll',
    name: 'Enchantment Scroll',
    icon: '📜',
    description: 'Increases the rarity of an equipped item. (cannot be used on mythic items)',
    dropChance: 0.5,
    sort: 700,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
  alternation_orb: {
    id: 'alternation_orb',
    name: 'Alternation Orb',
    icon: '🔄',
    description: 'Re-rolls the value of one random stat on an equipped item.',
    dropChance: 2,
    sort: 701,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
};
