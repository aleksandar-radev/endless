import { t } from '../i18n.js';
import { STATS } from './stats/stats.js';

const BASE = import.meta.env.VITE_BASE_PATH;

export const ITEM_IDS = {
  HELMET: 'HELMET',
  ARMOR: 'ARMOR',
  BELT: 'BELT',
  PANTS: 'PANTS',
  BOOTS: 'BOOTS',
  SWORD: 'SWORD',
  AXE: 'AXE',
  MACE: 'MACE',
  DAGGER: 'DAGGER',
  WAND: 'WAND',
  STAFF: 'STAFF',
  SHIELD: 'SHIELD',
  BOW: 'BOW',
  ARROWS: 'ARROWS',
  GLOVES: 'GLOVES',
  AMULET: 'AMULET',
  RING: 'RING',
};

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
  head: [ITEM_IDS.HELMET],
  chest: [ITEM_IDS.ARMOR],
  belt: [ITEM_IDS.BELT],
  legs: [ITEM_IDS.PANTS],
  boots: [ITEM_IDS.BOOTS],
  weapon: [ITEM_IDS.SWORD, ITEM_IDS.AXE, ITEM_IDS.MACE, ITEM_IDS.DAGGER, ITEM_IDS.WAND, ITEM_IDS.STAFF, ITEM_IDS.SHIELD, ITEM_IDS.BOW],
  offhand: [ITEM_IDS.SWORD, ITEM_IDS.AXE, ITEM_IDS.DAGGER, ITEM_IDS.WAND, ITEM_IDS.SHIELD, ITEM_IDS.ARROWS, ITEM_IDS.MACE, ITEM_IDS.STAFF],
  gloves: [ITEM_IDS.GLOVES],
  amulet: [ITEM_IDS.AMULET],
  ring1: [ITEM_IDS.RING],
  ring2: [ITEM_IDS.RING],
};

export const TWO_HANDED_TYPES = [ITEM_IDS.MACE, ITEM_IDS.STAFF, ITEM_IDS.BOW];
export const DUAL_WIELD_TYPES = [ITEM_IDS.SWORD, ITEM_IDS.AXE, ITEM_IDS.DAGGER, ITEM_IDS.WAND, ITEM_IDS.SHIELD];


export const ITEM_TYPES = {
  weapon: {
    id: 'weapon',
    items: [
      ITEM_IDS.SWORD,
      ITEM_IDS.AXE,
      ITEM_IDS.MACE,
      ITEM_IDS.DAGGER,
      ITEM_IDS.WAND,
      ITEM_IDS.STAFF,
      ITEM_IDS.SHIELD,
      ITEM_IDS.BOW,
      ITEM_IDS.ARROWS,
    ],
  },
  armor: {
    id: 'armor',
    items: [
      ITEM_IDS.HELMET,
      ITEM_IDS.ARMOR,
      ITEM_IDS.BELT,
      ITEM_IDS.PANTS,
      ITEM_IDS.BOOTS,
      ITEM_IDS.SHIELD,
      ITEM_IDS.GLOVES,
    ],
  },
  jewelry: {
    id: 'jewelry',
    items: [ITEM_IDS.AMULET, ITEM_IDS.RING],
  },
};

export const ALL_ITEM_TYPES = [
  ...new Set([
    ...ITEM_TYPES.weapon.items,
    ...ITEM_TYPES.armor.items,
    ...ITEM_TYPES.jewelry.items,
  ]),
];

export const ITEM_ICONS = {
  HELMET: `<img src="${BASE}/icons/helmet.svg" class="icon" alt="helmet"/>`,
  ARMOR: `<img src="${BASE}/icons/armor.svg" class="icon" alt="armor"/>`,
  BELT: `<img src="${BASE}/icons/belt.svg" class="icon" alt="belt"/>`,
  PANTS: `<img src="${BASE}/icons/pants.svg" class="icon" alt="pants"/>`,
  BOOTS: `<img src="${BASE}/icons/boots.svg" class="icon" alt="boots"/>`,
  SWORD: `<img src="${BASE}/icons/sword.svg" class="icon" alt="sword"/>`,
  AXE: `<img src="${BASE}/icons/axe.svg" class="icon" alt="axe"/>`,
  MACE: `<img src="${BASE}/icons/mace.svg" class="icon" alt="mace"/>`,
  DAGGER: `<img src="${BASE}/icons/dagger.svg" class="icon" alt="dagger"/>`,
  WAND: `<img src="${BASE}/icons/wand.svg" class="icon" alt="wand"/>`,
  STAFF: `<img src="${BASE}/icons/staff.svg" class="icon" alt="staff"/>`,
  SHIELD: `<img src="${BASE}/icons/shield.svg" class="icon" alt="shield"/>`,
  BOW: `<img src="${BASE}/icons/bow.svg" class="icon" alt="bow"/>`,
  ARROWS: `<img src="${BASE}/icons/arrows.svg" class="icon" alt="arrows"/>`,
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
  [ITEM_IDS.HELMET]: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'helmet'])],
  },
  [ITEM_IDS.ARMOR]: {
    mandatory: ['armor'],
    possible: [...getStatsByTags(['defense', 'stat', 'armor'])],
  },
  [ITEM_IDS.BELT]: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'belt', 'misc'])],
  },
  [ITEM_IDS.PANTS]: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'pants'])],
  },
  [ITEM_IDS.BOOTS]: {
    mandatory: [],
    possible: [...getStatsByTags(['defense', 'stat', 'boots'])],
  },
  [ITEM_IDS.SWORD]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'sword'])],
  },
  [ITEM_IDS.AXE]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'axe'])],
  },
  [ITEM_IDS.MACE]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'mace'])],
  },
  [ITEM_IDS.DAGGER]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'dagger'])],
  },
  [ITEM_IDS.WAND]: {
    mandatory: [],
    possible: [...getStatsByTags(['magic', 'wand', 'elemental'])],
  },
  [ITEM_IDS.STAFF]: {
    mandatory: [],
    possible: [...getStatsByTags(['magic', 'staff', 'elemental'])],
  },
  [ITEM_IDS.BOW]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'bow'])],
  },
  [ITEM_IDS.ARROWS]: {
    mandatory: [],
    possible: [...getStatsByTags(['offense', 'arrows'])],
  },
  [ITEM_IDS.SHIELD]: {
    mandatory: ['blockChance'],
    possible: [...getStatsByTags(['defense', 'stat', 'shield'])],
  },
  [ITEM_IDS.GLOVES]: {
    mandatory: [],
    possible: [...getStatsByTags(['gloves'])],
  },
  [ITEM_IDS.AMULET]: {
    mandatory: [],
    possible: [...getStatsByTags(['jewelry', 'amulet', 'misc'])],
  },
  [ITEM_IDS.RING]: {
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
  const itemTypes = getTypesByCategory(category);
  if (itemTypes.length === 0) {
    return [];
  }

  return Object.entries(SLOT_REQUIREMENTS)
    .filter(([, types]) => types.some((type) => itemTypes.includes(type)))
    .map(([slot]) => slot);
}

/**
 * Get all item types for a given category: 'armor', 'jewelry', or 'weapon'.
 * @param {'armor'|'jewelry'|'weapon'} category
 * @returns {string[]}
 */
export function getTypesByCategory(category) {
  if (ITEM_TYPES[category]) {
    return ITEM_TYPES[category].items;
  }
  return [];
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
