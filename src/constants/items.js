import { t } from '../i18n.js';
import { STATS } from './stats/stats.js';

export const EQUIPMENT_SLOTS = {
  HEAD: 'head',
  CHEST: 'chest',
  BELT: 'belt',
  LEGS: 'legs',
  BOOTS: 'boots',
  WEAPON: 'weapon',
  OFFHAND: 'offhand',
  GLOVES: 'gloves',
  AMULET: 'amulet',
  RING1: 'ring1',
  RING2: 'ring2',
};

export const SLOT_REQUIREMENTS = {
  head: ['HELMET'],
  chest: ['ARMOR'],
  belt: ['BELT'],
  legs: ['PANTS'],
  boots: ['BOOTS'],
  weapon: ['SWORD', 'AXE', 'MACE', 'WAND', 'STAFF'],
  offhand: ['SHIELD'],
  gloves: ['GLOVES'],
  amulet: ['AMULET'],
  ring1: ['RING'],
  ring2: ['RING'],
};

export const ITEM_TYPES = {
  HELMET: 'HELMET',
  ARMOR: 'ARMOR',
  BELT: 'BELT',
  PANTS: 'PANTS',
  BOOTS: 'BOOTS',
  SWORD: 'SWORD',
  AXE: 'AXE',
  MACE: 'MACE',
  WAND: 'WAND',
  STAFF: 'STAFF',
  SHIELD: 'SHIELD',
  GLOVES: 'GLOVES',
  AMULET: 'AMULET',
  RING: 'RING',
};

export const ITEM_ICONS = {
  HELMET: '<i class="mdi mdi-diving-helmet"></i>',
  ARMOR: '<i class="mdi mdi-tshirt-crew"></i>',
  BELT: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 18 18">
  <!-- Belt strap (slightly brighter for dark bg) -->
  <rect x="2" y="7.5" width="14" height="3" fill="#3b4f5d" stroke="#ffffff" stroke-width="0.45"/>
  
  <!-- Belt buckle (brighter gold, white stroke) -->
  <rect x="12" y="7" width="4" height="4" fill="#e3c16a" stroke="#ffffff" stroke-width="0.45"/>
  <rect x="13" y="8" width="2" height="2" fill="#2c3e50"/>
</svg>`,
  PANTS: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 18 18">
  <path d="M4 1.3 
           L14 1.3 
           L16 17 
           L11 17 
           L9.9 7 
           L8.1 17 
           L3 17 
           Z"
        fill="#4aa3df" stroke="#ffffff" stroke-width="0.5"/>
  
  <rect x="4" y="0.6" width="10" height="0.7" fill="#dbeffb"/>
  
  <line x1="4.3" y1="2" x2="5.8" y2="4" stroke="#ffffff" stroke-width="0.5"/>
  <line x1="13.7" y1="2" x2="12.2" y2="4" stroke="#ffffff" stroke-width="0.5"/>
</svg>`,
  BOOTS: '<i class="mdi mdi-shoe-formal"></i>',
  SWORD: '<i class="mdi mdi-sword"></i>',
  AXE: '<i class="mdi mdi-axe"></i>',
  MACE: '<i class="mdi mdi-hammer"></i>',
  WAND: '<i class="mdi mdi-auto-fix"></i>',
  STAFF: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
  <!-- Staff shaft -->
  <rect x="8.2" y="2" width="1.6" height="14" fill="#8b5a2b" stroke="#000" stroke-width="0.2"/>
  
  <!-- Decorative top (crystal orb) -->
  <circle cx="9" cy="2.5" r="2" fill="#4aa3df" stroke="#000" stroke-width="0.3"/>
</svg>`,
  SHIELD: '<i class="mdi mdi-shield"></i>',
  GLOVES: '<i class="mdi mdi-boxing-glove"></i>',
  AMULET: '<i class="mdi mdi-necklace"></i>',
  RING: '<i class="mdi mdi-ring"></i>',
};

export const ITEM_RARITY = {
  NORMAL: { name: t('NORMAL'), color: '#ffffff', chance: 130, statMultiplier: 1, totalStats: 3 },
  MAGIC: { name: t('MAGIC'), color: '#4287f5', chance: 40, statMultiplier: 1, totalStats: 3 },
  RARE: { name: t('RARE'), color: '#ffd700', chance: 18, statMultiplier: 1, totalStats: 4 },
  UNIQUE: { name: t('UNIQUE'), color: '#ff8c00', chance: 6, statMultiplier: 1, totalStats: 5 },
  LEGENDARY: { name: t('LEGENDARY'), color: '#e65a27', chance: 2, statMultiplier: 1, totalStats: 6 },
  MYTHIC: { name: t('MYTHIC'), color: '#ff0033', chance: 1, statMultiplier: 1, totalStats: 7 },
};

export const RARITY_ORDER = [
  ITEM_RARITY.NORMAL.name,
  ITEM_RARITY.MAGIC.name,
  ITEM_RARITY.RARE.name,
  ITEM_RARITY.UNIQUE.name,
  ITEM_RARITY.LEGENDARY.name,
  ITEM_RARITY.MYTHIC.name,
];

export const ITEM_STAT_POOLS = {
  HELMET: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'helmet'])],
  },
  ARMOR: {
    mandatory: ['armor'],
    possible: [...getStatsByTags(['defense', 'stat', 'armor'])],
  },
  BELT: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'belt', 'misc'])],
  },
  PANTS: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'pants'])],
  },
  BOOTS: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'boots'])],
  },
  SWORD: {
    mandatory: ['attackSpeed'],
    possible: [...getStatsByTags(['offense', 'sword'])],
  },
  AXE: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'axe'])],
  },
  MACE: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'mace'])],
  },
  WAND: {
    mandatory: [],
    possible: [...getStatsByTags(['magic', 'wand', 'elemental'])],
  },
  STAFF: {
    mandatory: [],
    possible: [...getStatsByTags(['magic', 'staff', 'elemental'])],
  },
  SHIELD: {
    mandatory: ['blockChance'],
    possible: [...getStatsByTags(['defense', 'stat', 'shield'])],
  },
  GLOVES: {
    mandatory: [],
    possible: [...getStatsByTags(['gloves'])],
  },
  AMULET: {
    mandatory: [],
    possible: [...getStatsByTags(['jewelry', 'amulet', 'misc'])],
  },
  RING: {
    mandatory: [],
    possible: [...getStatsByTags(['jewelry', 'ring', 'misc'])],
  },
};

/**
 * Get all slot names for a given category: 'armor', 'jewelry', or 'weapon'.
 * @param {'armor'|'jewelry'|'weapon'} category
 * @returns {string[]}
 */
export function getSlotsByCategory(category) {
  switch (category) {
    case 'armor':
      // All slots that are not weapon, amulet, or ring
      return Object.entries(SLOT_REQUIREMENTS)
        .filter(([slot, types]) =>
          types.some((type) => ['HELMET', 'ARMOR', 'BELT', 'PANTS', 'BOOTS', 'SHIELD', 'GLOVES'].includes(type)),
        )
        .map(([slot]) => slot);
    case 'jewelry':
      return Object.entries(SLOT_REQUIREMENTS)
        .filter(([slot, types]) => types.some((type) => ['AMULET', 'RING'].includes(type)))
        .map(([slot]) => slot);
    case 'weapon':
      return Object.entries(SLOT_REQUIREMENTS)
        .filter(([slot, types]) => types.some((type) => ['SWORD', 'AXE', 'MACE'].includes(type)))
        .map(([slot]) => slot);
    default:
      return [];
  }
}

/**
 * Get all item types for a given category: 'armor', 'jewelry', or 'weapon'.
 * @param {'armor'|'jewelry'|'weapon'} category
 * @returns {string[]}
 */
export function getTypesByCategory(category) {
  switch (category) {
    case 'armor':
      return ['HELMET', 'ARMOR', 'BELT', 'PANTS', 'BOOTS', 'SHIELD', 'GLOVES'];
    case 'jewelry':
      return ['AMULET', 'RING'];
    case 'weapon':
      return ['SWORD', 'AXE', 'MACE', 'WAND', 'STAFF'];
    default:
      return [];
  }
}

// Helper to get stats by tag
function getStatsByTag(tag) {
  return Object.entries(STATS)
    .filter(([_, config]) => config.itemTags && config.itemTags.includes(tag) && config.item)
    .map(([stat]) => stat);
}

// Helper to get stats by multiple tags (union)
function getStatsByTags(tags) {
  const stats = new Set();
  tags.forEach((tag) => {
    getStatsByTag(tag).forEach((stat) => stats.add(stat));
  });
  return Array.from(stats);
}
