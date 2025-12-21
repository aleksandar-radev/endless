import { ITEM_IDS } from './items.js';
import { STATS } from './stats/stats.js';

export const UNIQUE_PERCENT_CAP_MULTIPLIER = 2;

export const UNIQUE_ITEMS = [
  {
    id: 'stormlash',
    nameKey: 'items.unique.stormlash',
    type: ITEM_IDS.SWORD,
    stats: [
      { stat: 'damagePercent', min: -9999, max: -9999 },
      { stat: 'lightningDamage', min: STATS.lightningDamage.item.min * 8, max: STATS.lightningDamage.item.max * 20 },
      {
        stat: 'lightningDamagePercent',
        min: STATS.lightningDamagePercent.item.min * 6,
        max: STATS.lightningDamagePercent.item.max * 14,
      },
      { stat: 'attackSpeedPercent', min: STATS.attackSpeedPercent.item.max * 8, max: STATS.attackSpeedPercent.item.max * 11 },
      { stat: 'critChance', min: STATS.critChance.item.min * 2, max: STATS.critChance.item.max * 2 },
      { stat: 'attackRating', min: STATS.attackRating.item.min, max: STATS.attackRating.item.max * 2 },
    ],
  },
  {
    id: 'nightveil_hood',
    nameKey: 'items.unique.nightveilHood',
    type: ITEM_IDS.HELMET,
    stats: [
      { stat: 'dexterity', min: STATS.dexterity.item.min * 4, max: STATS.dexterity.item.max * 7 },
      { stat: 'evasionPercent', min: STATS.evasionPercent.item.min * 2.5, max: STATS.evasionPercent.item.max * 4.5 },
      { stat: 'critChance', min: STATS.critChance.item.min * 3, max: STATS.critChance.item.max * 4 },
      { stat: 'manaRegenPercent', min: STATS.manaRegenPercent.item.min * 3, max: STATS.manaRegenPercent.item.max * 4 },
    ],
  },
  {
    id: 'phoenixheart_mantle',
    nameKey: 'items.unique.phoenixheartMantle',
    type: ITEM_IDS.ARMOR,
    stats: [
      { stat: 'life', min: STATS.life.item.min * 6, max: STATS.life.item.max * 12 },
      { stat: 'lifeRegenPercent', min: STATS.lifeRegenPercent.item.min * 3, max: STATS.lifeRegenPercent.item.max * 5 },
      { stat: 'fireDamagePercent', min: STATS.fireDamagePercent.item.min * 4, max: STATS.fireDamagePercent.item.max * 6 },
      { stat: 'fireResistancePercent', min: STATS.fireResistancePercent.item.min * 3, max: STATS.fireResistancePercent.item.max * 5 },
    ],
  },
  {
    id: 'maelstrom_core',
    nameKey: 'items.unique.maelstromCore',
    type: ITEM_IDS.AMULET,
    stats: [
      {
        stat: 'lightningDamagePercent',
        min: STATS.lightningDamagePercent.item.min * 5,
        max: STATS.lightningDamagePercent.item.max * 9,
      },
      { stat: 'elementalPenetration', min: STATS.elementalPenetration.item.min * 3, max: STATS.elementalPenetration.item.max * 4.5 },
      {
        stat: 'extraDamageFromAttackRatingPercent',
        min: STATS.extraDamageFromAttackRatingPercent.item.min * 2.5,
        max: STATS.extraDamageFromAttackRatingPercent.item.max * 3.5,
      },
      {
        stat: 'manaRegenOfTotalPercent',
        min: STATS.manaRegenOfTotalPercent.item.min * 4,
        max: STATS.manaRegenOfTotalPercent.item.max * 6,
      },
    ],
  },
  {
    id: 'tempestbind_grips',
    nameKey: 'items.unique.tempestbindGrips',
    type: ITEM_IDS.GLOVES,
    stats: [
      { stat: 'attackSpeedPercent', min: STATS.attackSpeedPercent.item.min * 6, max: STATS.attackSpeedPercent.item.max * 9 },
      { stat: 'elementalDamage', min: STATS.elementalDamage.item.min * 4, max: STATS.elementalDamage.item.max * 7 },
      { stat: 'critDamage', min: STATS.critDamage.item.min * 4, max: STATS.critDamage.item.max * 5 },
      { stat: 'chanceToHitPercent', min: STATS.chanceToHitPercent.item.min * 2.5, max: STATS.chanceToHitPercent.item.max * 3.5 },
    ],
  },
  {
    id: 'riftstrider_boots',
    nameKey: 'items.unique.riftstriderBoots',
    type: ITEM_IDS.BOOTS,
    stats: [
      { stat: 'evasion', min: STATS.evasion.item.min * 6, max: STATS.evasion.item.max * 14 },
      { stat: 'allResistancePercent', min: STATS.allResistancePercent.item.min * 2.5, max: STATS.allResistancePercent.item.max * 4 },
      { stat: 'endurance', min: STATS.endurance.item.min * 3, max: STATS.endurance.item.max * 5 },
      { stat: 'omniSteal', min: STATS.omniSteal.item.min * 2.5, max: STATS.omniSteal.item.max * 4 },
    ],
  },
  {
    id: 'ribbonweave_vestments',
    nameKey: 'items.unique.ribbonweaveVestments',
    type: ITEM_IDS.ARMOR,
    stats: [
      { stat: 'allAttributes', min: 10, max: 10 },
      { stat: 'allResistance', min: 20, max: 20 },
      { stat: 'armor', min: 30, max: 30 },
      { stat: 'evasion', min: 30, max: 30 },
      { stat: 'lifeRegen', min: 5, max: 5 },
      { stat: 'manaRegen', min: 2, max: 2 },
      { stat: 'damage', min: 4, max: 4 },
      { stat: 'elementalDamage', min: 1, max: 1 },
      { stat: 'attackRating', min: 50, max: 50 },
    ],
  },
];

export const ITEM_SETS = [
  {
    id: 'arcanist_regalia',
    nameKey: 'items.set.arcanistRegalia.name',
    items: [
      {
        id: 'arcanist_staff',
        nameKey: 'items.set.arcanistRegalia.staff',
        type: ITEM_IDS.STAFF,
        stats: [
          { stat: 'fireDamage', min: STATS.fireDamage.item.min * 2.8, max: STATS.fireDamage.item.max * 1.6 },
          { stat: 'coldDamage', min: STATS.coldDamage.item.min * 2.8, max: STATS.coldDamage.item.max * 1.6 },
          { stat: 'lightningDamage', min: STATS.lightningDamage.item.min * 2.8, max: STATS.lightningDamage.item.max * 1.6 },
          { stat: 'mana', min: STATS.mana.item.min * 1.6, max: STATS.mana.item.max * 0.9 },
        ],
        descriptionKey: 'items.set.arcanistRegalia.staff.desc',
      },
      {
        id: 'arcanist_amulet',
        nameKey: 'items.set.arcanistRegalia.amulet',
        type: ITEM_IDS.AMULET,
        stats: [
          { stat: 'manaRegen', min: STATS.manaRegen.item.min * 1.8, max: STATS.manaRegen.item.max * 1.1 },
          { stat: 'intelligence', min: STATS.intelligence.item.min * 2.3, max: STATS.intelligence.item.max * 1.6 },
          { stat: 'manaPercent', min: STATS.manaPercent.item.min * 0.6, max: STATS.manaPercent.item.max * 0.9 },
          { stat: 'manaRegenPercent', min: STATS.manaRegenPercent.item.min * 1.5, max: STATS.manaRegenPercent.item.max * 0.9 },
        ],
        descriptionKey: 'items.set.arcanistRegalia.amulet.desc',
      },
      {
        id: 'arcanist_gloves',
        nameKey: 'items.set.arcanistRegalia.gloves',
        type: ITEM_IDS.GLOVES,
        stats: [
          { stat: 'attackSpeedPercent', min: STATS.attackSpeedPercent.item.min, max: STATS.attackSpeedPercent.item.max * 0.7 },
          { stat: 'elementalDamagePercent', min: STATS.elementalDamagePercent.item.min * 6, max: STATS.elementalDamagePercent.item.max * 2.6 },
          { stat: 'dexterity', min: STATS.dexterity.item.min * 1.5, max: STATS.dexterity.item.max * 1.2 },
          { stat: 'critChance', min: STATS.critChance.item.min * 2, max: STATS.critChance.item.max * 0.6 },
        ],
        descriptionKey: 'items.set.arcanistRegalia.gloves.desc',
      },
    ],
    setBonuses: [
      {
        pieces: 2,
        nameKey: 'items.set.arcanistRegalia.bonus2',
        stats: [
          { stat: 'intelligence', min: STATS.intelligence.item.min * 2.5, max: STATS.intelligence.item.max * 1.9 },
          { stat: 'manaRegenPercent', min: STATS.manaRegenPercent.item.min * 2, max: STATS.manaRegenPercent.item.max * 1.2 },
        ],
      },
      {
        pieces: 3,
        nameKey: 'items.set.arcanistRegalia.bonus3',
        stats: [
          { stat: 'elementalDamagePercent', min: STATS.elementalDamagePercent.item.min * 8, max: STATS.elementalDamagePercent.item.max * 3.1 },
          { stat: 'elementalPenetration', min: STATS.elementalPenetration.item.min * 1.4, max: STATS.elementalPenetration.item.max * 0.9 },
        ],
      },
    ],
  },
  {
    id: 'wardens_bulwark',
    nameKey: 'items.set.wardensBulwark.name',
    items: [
      {
        id: 'wardens_helm',
        nameKey: 'items.set.wardensBulwark.helm',
        type: ITEM_IDS.HELMET,
        stats: [
          { stat: 'armor', min: STATS.armor.item.min * 3.2, max: STATS.armor.item.max * 1.8 },
          { stat: 'allResistance', min: STATS.allResistance.item.min * 1.8, max: STATS.allResistance.item.max },
          { stat: 'vitality', min: STATS.vitality.item.min * 1.8, max: STATS.vitality.item.max * 1.3 },
          { stat: 'life', min: STATS.life.item.min * 5.3, max: STATS.life.item.max * 2.8 },
        ],
        descriptionKey: 'items.set.wardensBulwark.helm.desc',
      },
      {
        id: 'wardens_plate',
        nameKey: 'items.set.wardensBulwark.plate',
        type: ITEM_IDS.ARMOR,
        stats: [
          { stat: 'life', min: STATS.life.item.min * 6.7, max: STATS.life.item.max * 3.5 },
          { stat: 'armorPercent', min: STATS.armorPercent.item.min * 1.3, max: STATS.armorPercent.item.max * 0.9 },
          { stat: 'endurance', min: STATS.endurance.item.min * 2, max: STATS.endurance.item.max * 1.6 },
          { stat: 'allResistance', min: STATS.allResistance.item.min * 1.5, max: STATS.allResistance.item.max * 0.9 },
        ],
        descriptionKey: 'items.set.wardensBulwark.plate.desc',
      },
      {
        id: 'wardens_bulwark',
        nameKey: 'items.set.wardensBulwark.shield',
        type: ITEM_IDS.SHIELD,
        stats: [
          { stat: 'blockChance', min: STATS.blockChance.item.min * 3, max: STATS.blockChance.item.max * 1.6 },
          { stat: 'armor', min: STATS.armor.item.min * 3.6, max: STATS.armor.item.max * 2 },
          { stat: 'allResistancePercent', min: STATS.allResistancePercent.item.min * 2.5, max: STATS.allResistancePercent.item.max * 1.1 },
          { stat: 'thornsDamage', min: STATS.thornsDamage.item.min * 1.7, max: STATS.thornsDamage.item.max },
        ],
        descriptionKey: 'items.set.wardensBulwark.shield.desc',
      },
      {
        id: 'wardens_boots',
        nameKey: 'items.set.wardensBulwark.boots',
        type: ITEM_IDS.BOOTS,
        stats: [
          { stat: 'evasion', min: STATS.evasion.item.min * 5.3, max: STATS.evasion.item.max * 2.8 },
          { stat: 'dexterity', min: STATS.dexterity.item.min * 2, max: STATS.dexterity.item.max * 1.5 },
          { stat: 'lifePercent', min: STATS.lifePercent.item.min * 0.8, max: STATS.lifePercent.item.max * 0.5 },
          { stat: 'lifeRegen', min: STATS.lifeRegen.item.min * 0.9, max: STATS.lifeRegen.item.max * 0.5 },
        ],
        descriptionKey: 'items.set.wardensBulwark.boots.desc',
      },
    ],
    setBonuses: [
      {
        pieces: 2,
        nameKey: 'items.set.wardensBulwark.bonus2',
        stats: [
          { stat: 'armor', min: STATS.armor.item.min * 2.8, max: STATS.armor.item.max * 1.5 },
          { stat: 'blockChance', min: STATS.blockChance.item.min * 1.3, max: STATS.blockChance.item.max * 0.7 },
        ],
      },
      {
        pieces: 3,
        nameKey: 'items.set.wardensBulwark.bonus3',
        stats: [
          { stat: 'life', min: STATS.life.item.min * 7.3, max: STATS.life.item.max * 3.8 },
          { stat: 'allResistancePercent', min: STATS.allResistancePercent.item.min * 3, max: STATS.allResistancePercent.item.max * 1.3 },
        ],
      },
      {
        pieces: 4,
        nameKey: 'items.set.wardensBulwark.bonus4',
        stats: [
          { stat: 'lifePercent', min: STATS.lifePercent.item.min, max: STATS.lifePercent.item.max * 0.6 },
          { stat: 'armorPercent', min: STATS.armorPercent.item.min * 1.3, max: STATS.armorPercent.item.max * 0.8 },
        ],
      },
    ],
  },
];
