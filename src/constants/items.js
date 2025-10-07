import { t } from '../i18n.js';
import { STATS } from './stats/stats.js';

const BASE = import.meta.env.VITE_BASE_PATH;

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
  weapon: ['SWORD', 'AXE', 'MACE', 'WAND', 'STAFF', 'SHIELD'],
  offhand: ['SWORD', 'AXE', 'WAND', 'SHIELD'],
  gloves: ['GLOVES'],
  amulet: ['AMULET'],
  ring1: ['RING'],
  ring2: ['RING'],
};

export const TWO_HANDED_TYPES = ['MACE', 'STAFF'];
export const DUAL_WIELD_TYPES = ['SWORD', 'AXE', 'WAND', 'SHIELD'];

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
  HELMET: `<img src="${BASE}/icons/helmet.svg" class="icon" alt="helmet"/>`,
  ARMOR: `<img src="${BASE}/icons/armor.svg" class="icon" alt="armor"/>`,
  BELT: `<img src="${BASE}/icons/belt.svg" class="icon" alt="belt"/>`,
  PANTS: `<img src="${BASE}/icons/pants.svg" class="icon" alt="pants"/>`,
  BOOTS: `<img src="${BASE}/icons/boots.svg" class="icon" alt="boots"/>`,
  SWORD: `<img src="${BASE}/icons/sword.svg" class="icon" alt="sword"/>`,
  AXE: `<img src="${BASE}/icons/axe.svg" class="icon" alt="axe"/>`,
  MACE: `<img src="${BASE}/icons/mace.svg" class="icon" alt="mace"/>`,
  WAND: `<img src="${BASE}/icons/wand.svg" class="icon" alt="wand"/>`,
  STAFF: `<img src="${BASE}/icons/staff.svg" class="icon" alt="staff"/>`,
  SHIELD: `<img src="${BASE}/icons/shield.svg" class="icon" alt="shield"/>`,
  GLOVES: `<img src="${BASE}/icons/gloves.svg" class="icon" alt="gloves"/>`,
  AMULET: `<img src="${BASE}/icons/amulet.svg" class="icon" alt="amulet"/>`,
  RING: `<img src="${BASE}/icons/ring.svg" class="icon" alt="ring"/>`,
};

export const ITEM_RARITY = {
  NORMAL: { name: t('NORMAL'), color: 'var(--item-normal)', chance: 130, statMultiplier: 1, totalStats: 3 },
  MAGIC: { get name() { return t('MAGIC'); }, color: 'var(--item-magic)', chance: 40, statMultiplier: 1, totalStats: 4 },
  RARE: { get name() { return t('RARE'); }, color: 'var(--item-rare)', chance: 18, statMultiplier: 1, totalStats: 5 },
  EPIC: { get name() { return t('EPIC'); }, color: 'var(--item-epic)', chance: 6, statMultiplier: 1, totalStats: 6 },
  LEGENDARY: { get name() { return t('LEGENDARY'); }, color: 'var(--item-legendary)', chance: 2, statMultiplier: 1, totalStats: 7 },
  MYTHIC: { get name() { return t('MYTHIC'); }, color: 'var(--item-mythic)', chance: 1, statMultiplier: 1, totalStats: 8 },
  UNIQUE: { get name() { return t('UNIQUE'); }, color: 'var(--item-unique)', chance: 0, statMultiplier: 1, totalStats: 0 },
  SET: { get name() { return t('SET'); }, color: 'var(--item-set)', chance: 0, statMultiplier: 1, totalStats: 0 },
};

export const RARITY_ORDER = [
  ITEM_RARITY.NORMAL.name,
  ITEM_RARITY.MAGIC.name,
  ITEM_RARITY.RARE.name,
  ITEM_RARITY.EPIC.name,
  ITEM_RARITY.LEGENDARY.name,
  ITEM_RARITY.MYTHIC.name,
  ITEM_RARITY.UNIQUE.name,
  ITEM_RARITY.SET.name,
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
        .filter(([slot, types]) =>
          types.some((type) => ['SWORD', 'AXE', 'MACE', 'WAND', 'STAFF', 'SHIELD'].includes(type)),
        )
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
      return ['SWORD', 'AXE', 'MACE', 'WAND', 'STAFF', 'SHIELD'];
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
