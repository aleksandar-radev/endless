import { ITEM_IDS } from './items.js';

export const UNIQUE_ITEMS = {
  stormlash: {
    id: 'stormlash',
    nameKey: 'items.unique.stormlash',
    type: ITEM_IDS.SWORD,
    stats: {
      damagePercent: { minMultiplier: -9999, maxMultiplier: -9999 },
      lightningDamage: { minMultiplier: 8, maxMultiplier: 20 },
      lightningDamagePercent: { minMultiplier: 6, maxMultiplier: 14 },
      attackSpeedPercent: { minMultiplier: 8, maxMultiplier: 11 },
      critChance: { minMultiplier: 2, maxMultiplier: 2 },
      attackRating: { minMultiplier: 1, maxMultiplier: 2 },
    },
  },
  nightveil_hood: {
    id: 'nightveil_hood',
    nameKey: 'items.unique.nightveilHood',
    type: ITEM_IDS.HELMET,
    stats: {
      dexterity: { minMultiplier: 4, maxMultiplier: 7 },
      evasionPercent: { minMultiplier: 2.5, maxMultiplier: 4.5 },
      critChance: { minMultiplier: 3, maxMultiplier: 4 },
      manaRegenPercent: { minMultiplier: 3, maxMultiplier: 4 },
    },
  },
  phoenixheart_mantle: {
    id: 'phoenixheart_mantle',
    nameKey: 'items.unique.phoenixheartMantle',
    type: ITEM_IDS.ARMOR,
    stats: {
      life: { minMultiplier: 6, maxMultiplier: 12 },
      lifeRegenPercent: { minMultiplier: 3, maxMultiplier: 5 },
      fireDamagePercent: { minMultiplier: 4, maxMultiplier: 6 },
      fireResistancePercent: { minMultiplier: 3, maxMultiplier: 5 },
    },
  },
  maelstrom_core: {
    id: 'maelstrom_core',
    nameKey: 'items.unique.maelstromCore',
    type: ITEM_IDS.AMULET,
    stats: {
      lightningDamagePercent: { maxMultiplier: 1.6 },
      elementalPenetration: { minMultiplier: 3, maxMultiplier: 4.5 },
      extraDamageFromAttackRatingPercent: { minMultiplier: 2.5, maxMultiplier: 3.5 },
      manaRegenOfTotalPercent: { minMultiplier: 4, maxMultiplier: 6 },
    },
  },
  tempestbind_grips: {
    id: 'tempestbind_grips',
    nameKey: 'items.unique.tempestbindGrips',
    type: ITEM_IDS.GLOVES,
    stats: {
      attackSpeedPercent: { minMultiplier: 6, maxMultiplier: 9 },
      elementalDamage: { minMultiplier: 4, maxMultiplier: 7 },
      critDamage: { minMultiplier: 4, maxMultiplier: 5 },
      chanceToHitPercent: { minMultiplier: 2.5, maxMultiplier: 3.5 },
    },
  },
  riftstrider_boots: {
    id: 'riftstrider_boots',
    nameKey: 'items.unique.riftstriderBoots',
    type: ITEM_IDS.BOOTS,
    stats: {
      evasion: { minMultiplier: 6, maxMultiplier: 14 },
      allResistancePercent: { minMultiplier: 2.5, maxMultiplier: 4 },
      endurance: { minMultiplier: 3, maxMultiplier: 5 },
      omniSteal: { minMultiplier: 2.5, maxMultiplier: 4 },
    },
  },
  ribbonweave_vestments: {
    id: 'ribbonweave_vestments',
    nameKey: 'items.unique.ribbonweaveVestments',
    type: ITEM_IDS.ARMOR,
    stats: {
      allAttributes: { minMultiplier: 10, maxMultiplier: 10 },
      allResistance: { minMultiplier: 20, maxMultiplier: 20 },
      armor: { minMultiplier: 30, maxMultiplier: 30 },
      evasion: { minMultiplier: 30, maxMultiplier: 30 },
      lifeRegen: { minMultiplier: 5, maxMultiplier: 5 },
      manaRegen: { minMultiplier: 2, maxMultiplier: 2 },
      damage: { minMultiplier: 4, maxMultiplier: 4 },
      elementalDamage: { minMultiplier: 1, maxMultiplier: 1 },
      attackRating: { minMultiplier: 50, maxMultiplier: 50 },
    },
  },
};
