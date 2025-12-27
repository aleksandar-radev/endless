import { ITEM_IDS } from './items.js';

export const ITEM_SUBTYPES = {
  [ITEM_IDS.SWORD]: {
    [ITEM_IDS.SWORD]: {
      id: ITEM_IDS.SWORD,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
      // disabledStats: ['critChance'],
      // additionalStats: ['critChance'],
      // prefferedStats: ['critChance'],
    },
    SHORT_SWORD: {
      id: 'SHORT_SWORD',
      nameKey: 'items.subtypes.shortSword',
      weight: 30,
      statMultipliers: {
        damage: { min: 0.8, max: 0.8 },
        damagePercent: { min: 0.9, max: 0.9 },
        attackSpeedPercent: { min: 1.3, max: 1.3 },
        critChance: { min: 1.1, max: 1.1 },
      },
      additionalStats: ['critChance'],
    },
    LONG_SWORD: {
      id: 'LONG_SWORD',
      nameKey: 'items.subtypes.longSword',
      weight: 25,
      statMultipliers: {
        damage: { min: 1.2, max: 1.2 },
        damagePercent: { min: 1.1, max: 1.1 },
        attackSpeedPercent: { min: 0.9, max: 0.9 },
      },
    },
    RAPIER: {
      id: 'RAPIER',
      nameKey: 'items.subtypes.rapier',
      weight: 20,
      statMultipliers: {
        damage: { min: 0.85, max: 0.85 },
        damagePercent: { min: 0.95, max: 0.95 },
        critChance: { min: 1.25, max: 1.25 },
        critDamage: { min: 1.1, max: 1.1 },
      },
      additionalStats: ['critChance', 'critDamage'],
    },
    GREATSWORD: {
      id: 'GREATSWORD',
      nameKey: 'items.subtypes.greatsword',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        damage: { min: 1.5, max: 1.5 },
        damagePercent: { min: 1.2, max: 1.2 },
        attackSpeedPercent: { min: 0.7, max: 0.7 },
        critDamage: { min: 1.15, max: 1.15 },
      },
    },
  },

  [ITEM_IDS.AXE]: {
    [ITEM_IDS.AXE]: {
      id: ITEM_IDS.AXE,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    HATCHET: {
      id: 'HATCHET',
      nameKey: 'items.subtypes.hatchet',
      weight: 30,
      statMultipliers: {
        damage: { min: 0.9, max: 0.9 },
        attackSpeedPercent: { min: 1.15, max: 1.15 },
      },
    },
    BATTLE_AXE: {
      id: 'BATTLE_AXE',
      nameKey: 'items.subtypes.battleAxe',
      weight: 25,
      statMultipliers: {
        damage: { min: 1.1, max: 1.1 },
        damagePercent: { min: 1.05, max: 1.05 },
      },
    },
    GREATAXE: {
      id: 'GREATAXE',
      nameKey: 'items.subtypes.greataxe',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        damage: { min: 1.3, max: 1.3 },
        damagePercent: { min: 1.15, max: 1.15 },
        attackSpeedPercent: { min: 0.75, max: 0.75 },
      },
    },
  },

  [ITEM_IDS.DAGGER]: {
    [ITEM_IDS.DAGGER]: {
      id: ITEM_IDS.DAGGER,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    KNIFE: {
      id: 'KNIFE',
      nameKey: 'items.subtypes.knife',
      weight: 30,
      statMultipliers: {
        damage: { min: 0.85, max: 0.85 },
        attackSpeedPercent: { min: 1.2, max: 1.2 },
      },
    },
    STILETTO: {
      id: 'STILETTO',
      nameKey: 'items.subtypes.stiletto',
      weight: 20,
      statMultipliers: {
        damage: { min: 0.75, max: 0.75 },
        critChance: { min: 1.3, max: 1.3 },
        critDamage: { min: 1.15, max: 1.15 },
      },
      additionalStats: ['critChance'],
    },
  },

  [ITEM_IDS.MACE]: {
    [ITEM_IDS.MACE]: {
      id: ITEM_IDS.MACE,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    CLUB: {
      id: 'CLUB',
      nameKey: 'items.subtypes.club',
      weight: 30,
      statMultipliers: {
        damage: { min: 0.9, max: 0.9 },
        attackSpeedPercent: { min: 1.1, max: 1.1 },
      },
    },
    WAR_HAMMER: {
      id: 'WAR_HAMMER',
      nameKey: 'items.subtypes.warHammer',
      weight: 20,
      twoHanded: true,
      statMultipliers: {
        damage: { min: 1.4, max: 1.4 },
        damagePercent: { min: 1.1, max: 1.1 },
        attackSpeedPercent: { min: 0.7, max: 0.7 },
        critDamage: { min: 1.2, max: 1.2 },
      },
    },
  },

  [ITEM_IDS.BOW]: {
    [ITEM_IDS.BOW]: {
      id: ITEM_IDS.BOW,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    SHORT_BOW: {
      id: 'SHORT_BOW',
      nameKey: 'items.subtypes.shortBow',
      weight: 30,
      statMultipliers: {
        damage: { min: 0.85, max: 0.85 },
        attackSpeedPercent: { min: 1.25, max: 1.25 },
      },
    },
    LONG_BOW: {
      id: 'LONG_BOW',
      nameKey: 'items.subtypes.longBow',
      weight: 25,
      twoHanded: true,
      statMultipliers: {
        damage: { min: 1.3, max: 1.3 },
        damagePercent: { min: 1.1, max: 1.1 },
        attackSpeedPercent: { min: 0.8, max: 0.8 },
        critDamage: { min: 1.1, max: 1.1 },
      },
    },
    CROSSBOW: {
      id: 'CROSSBOW',
      nameKey: 'items.subtypes.crossbow',
      weight: 20,
      twoHanded: true,
      statMultipliers: {
        damage: { min: 1.4, max: 1.4 },
        damagePercent: { min: 1.15, max: 1.15 },
        attackSpeedPercent: { min: 0.65, max: 0.65 },
        critChance: { min: 1.2, max: 1.2 },
      },
    },
  },

  [ITEM_IDS.WAND]: {
    [ITEM_IDS.WAND]: {
      id: ITEM_IDS.WAND,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    FIRE_WAND: {
      id: 'FIRE_WAND',
      nameKey: 'items.subtypes.fireWand',
      weight: 15,
      statMultipliers: {
        fireDamage: { min: 1.2, max: 1.2 },
        fireDamagePercent: { min: 1.4, max: 1.4 }, // 140% fire dmg%, cap 1680%
      },
      preferredStats: ['fireDamage', 'fireDamagePercent'], // Higher roll chance
    },
    FROST_WAND: {
      id: 'FROST_WAND',
      nameKey: 'items.subtypes.frostWand',
      weight: 15,
      statMultipliers: {
        coldDamage: { min: 1.2, max: 1.2 },
        coldDamagePercent: { min: 1.4, max: 1.4 },
      },
      preferredStats: ['coldDamage', 'coldDamagePercent'],
    },
    STORM_WAND: {
      id: 'STORM_WAND',
      nameKey: 'items.subtypes.stormWand',
      weight: 15,
      statMultipliers: {
        lightningDamage: { min: 1.2, max: 1.2 },
        lightningDamagePercent: { min: 1.4, max: 1.4 },
      },
      preferredStats: ['lightningDamage', 'lightningDamagePercent'],
    },
    EARTH_WAND: {
      id: 'EARTH_WAND',
      nameKey: 'items.subtypes.earthWand',
      weight: 15,
      statMultipliers: {
        earthDamage: { min: 1.2, max: 1.2 },
        earthDamagePercent: { min: 1.4, max: 1.4 },
      },
      preferredStats: ['earthDamage', 'earthDamagePercent'],
    },
  },

  [ITEM_IDS.STAFF]: {
    [ITEM_IDS.STAFF]: {
      id: ITEM_IDS.STAFF,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
    FIRE_STAFF: {
      id: 'FIRE_STAFF',
      nameKey: 'items.subtypes.fireStaff',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        fireDamage: { min: 1.25, max: 1.25 },
        fireDamagePercent: { min: 1.5, max: 1.5 },
      },
      preferredStats: ['fireDamage', 'fireDamagePercent'],
    },
    FROST_STAFF: {
      id: 'FROST_STAFF',
      nameKey: 'items.subtypes.frostStaff',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        coldDamage: { min: 1.25, max: 1.25 },
        coldDamagePercent: { min: 1.5, max: 1.5 },
      },
      preferredStats: ['coldDamage', 'coldDamagePercent'],
    },
    STORM_STAFF: {
      id: 'STORM_STAFF',
      nameKey: 'items.subtypes.stormStaff',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        lightningDamage: { min: 1.25, max: 1.25 },
        lightningDamagePercent: { min: 1.5, max: 1.5 },
      },
      preferredStats: ['lightningDamage', 'lightningDamagePercent'],
    },
    EARTH_STAFF: {
      id: 'EARTH_STAFF',
      nameKey: 'items.subtypes.earthStaff',
      weight: 15,
      twoHanded: true,
      statMultipliers: {
        earthDamage: { min: 1.25, max: 1.25 },
        earthDamagePercent: { min: 1.5, max: 1.5 },
      },
      preferredStats: ['earthDamage', 'earthDamagePercent'],
    },
  },

  [ITEM_IDS.HELMET]: {
    [ITEM_IDS.HELMET]: {
      id: ITEM_IDS.HELMET,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.ARMOR]: {
    [ITEM_IDS.ARMOR]: {
      id: ITEM_IDS.ARMOR,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.BELT]: {
    [ITEM_IDS.BELT]: {
      id: ITEM_IDS.BELT,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.PANTS]: {
    [ITEM_IDS.PANTS]: {
      id: ITEM_IDS.PANTS,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.BOOTS]: {
    [ITEM_IDS.BOOTS]: {
      id: ITEM_IDS.BOOTS,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.SHIELD]: {
    [ITEM_IDS.SHIELD]: {
      id: ITEM_IDS.SHIELD,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.ARROWS]: {
    [ITEM_IDS.ARROWS]: {
      id: ITEM_IDS.ARROWS,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.GLOVES]: {
    [ITEM_IDS.GLOVES]: {
      id: ITEM_IDS.GLOVES,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.AMULET]: {
    [ITEM_IDS.AMULET]: {
      id: ITEM_IDS.AMULET,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },

  [ITEM_IDS.RING]: {
    [ITEM_IDS.RING]: {
      id: ITEM_IDS.RING,
      nameKey: null,
      weight: 50,
      statMultipliers: {},
    },
  },
};

export function getSubtypesForItem(itemType) {
  return ITEM_SUBTYPES[itemType] || {};
}

/**
 * Weighted random selection of subtype based on weight property
 * @param {string} itemType - The ITEM_IDS key
 * @returns {string|null} Subtype ID or null if no subtypes/weights
 */
export function rollRandomSubtype(itemType) {
  const subtypes = Object.values(getSubtypesForItem(itemType));
  if (subtypes.length === 0) return null;

  // Calculate total weight
  const totalWeight = subtypes.reduce((sum, st) => sum + (st.weight || 0), 0);
  if (totalWeight === 0) return null;

  // Random selection based on weight
  let random = Math.random() * totalWeight;
  for (const subtype of subtypes) {
    random -= subtype.weight || 0;
    if (random <= 0) return subtype.id;
  }

  return subtypes[0].id; // Fallback to first subtype
}

/**
 * Get subtype configuration by item type and subtype ID
 * @param {string} itemType - The ITEM_IDS key
 * @param {string} subtypeId - The subtype ID
 * @returns {Object|null} Subtype config or null
 */
export function getSubtypeConfig(itemType, subtypeId) {
  const subtypes = getSubtypesForItem(itemType);
  return subtypes[subtypeId] || null;
}

/**
 * Get all subtype IDs for an item type
 * @param {string} itemType - The ITEM_IDS key
 * @returns {string[]} Array of subtype IDs
 */
export function getSubtypeIds(itemType) {
  const subtypes = getSubtypesForItem(itemType);
  return Object.keys(subtypes);
}
