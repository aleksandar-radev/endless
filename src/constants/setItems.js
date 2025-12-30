import { ITEM_IDS } from './items.js';

export const SET_ITEMS = {
  arcanist_regalia: {
    id: 'arcanist_regalia',
    nameKey: 'items.set.arcanistRegalia.name',
    items: [
      {
        id: 'arcanist_staff',
        nameKey: 'items.set.arcanistRegalia.staff',
        type: ITEM_IDS.STAFF,
        stats: {
          fireDamage: { minMultiplier: 2.8, maxMultiplier: 1.6 },
          coldDamage: { minMultiplier: 2.8, maxMultiplier: 1.6 },
          lightningDamage: { minMultiplier: 2.8, maxMultiplier: 1.6 },
          mana: { minMultiplier: 1.6, maxMultiplier: 0.9 },
        },
        descriptionKey: 'items.set.arcanistRegalia.staff.desc',
      },
      {
        id: 'arcanist_amulet',
        nameKey: 'items.set.arcanistRegalia.amulet',
        type: ITEM_IDS.AMULET,
        stats: {
          manaRegen: { minMultiplier: 1.8, maxMultiplier: 1.1 },
          intelligence: { minMultiplier: 2.3, maxMultiplier: 1.6 },
          manaPercent: { minMultiplier: 0.6, maxMultiplier: 0.9 },
          manaRegenPercent: { minMultiplier: 1.5, maxMultiplier: 0.9 },
        },
        descriptionKey: 'items.set.arcanistRegalia.amulet.desc',
      },
      {
        id: 'arcanist_gloves',
        nameKey: 'items.set.arcanistRegalia.gloves',
        type: ITEM_IDS.GLOVES,
        stats: {
          attackSpeedPercent: { minMultiplier: 1, maxMultiplier: 0.7 },
          elementalDamagePercent: { minMultiplier: 6, maxMultiplier: 2.6 },
          dexterity: { minMultiplier: 1.5, maxMultiplier: 1.2 },
          critChance: { minMultiplier: 2, maxMultiplier: 0.6 },
        },
        descriptionKey: 'items.set.arcanistRegalia.gloves.desc',
      },
    ],
    setBonuses: [
      {
        pieces: 2,
        nameKey: 'items.set.arcanistRegalia.bonus2',
        stats: {
          intelligence: { minMultiplier: 2.5, maxMultiplier: 1.9 },
          manaRegenPercent: { minMultiplier: 2, maxMultiplier: 1.2 },
        },
      },
      {
        pieces: 3,
        nameKey: 'items.set.arcanistRegalia.bonus3',
        stats: {
          elementalDamagePercent: { minMultiplier: 8, maxMultiplier: 3.1 },
          elementalPenetration: { minMultiplier: 1.4, maxMultiplier: 0.9 },
        },
      },
    ],
  },
  wardens_bulwark: {
    id: 'wardens_bulwark',
    nameKey: 'items.set.wardensBulwark.name',
    items: [
      {
        id: 'wardens_helm',
        nameKey: 'items.set.wardensBulwark.helm',
        type: ITEM_IDS.HELMET,
        stats: {
          armor: { minMultiplier: 3.2, maxMultiplier: 1.8 },
          allResistance: { minMultiplier: 1.8, maxMultiplier: 2 },
          vitality: { minMultiplier: 1.8, maxMultiplier: 1.3 },
          life: { minMultiplier: 5.3, maxMultiplier: 2.8 },
        },
        descriptionKey: 'items.set.wardensBulwark.helm.desc',
      },
      {
        id: 'wardens_plate',
        nameKey: 'items.set.wardensBulwark.plate',
        type: ITEM_IDS.ARMOR,
        stats: {
          life: { minMultiplier: 6.7, maxMultiplier: 3.5 },
          armorPercent: { minMultiplier: 1.3, maxMultiplier: 0.9 },
          endurance: { minMultiplier: 2, maxMultiplier: 1.6 },
          allResistance: { minMultiplier: 1.5, maxMultiplier: 0.9 },
        },
        descriptionKey: 'items.set.wardensBulwark.plate.desc',
      },
      {
        id: 'wardens_bulwark',
        nameKey: 'items.set.wardensBulwark.shield',
        type: ITEM_IDS.SHIELD,
        stats: {
          blockChance: { minMultiplier: 3, maxMultiplier: 1.6 },
          armor: { minMultiplier: 3.6, maxMultiplier: 2 },
          allResistancePercent: { minMultiplier: 2.5, maxMultiplier: 1.1 },
          thornsDamage: { minMultiplier: 1.7, maxMultiplier: 2 },
        },
        descriptionKey: 'items.set.wardensBulwark.shield.desc',
      },
      {
        id: 'wardens_boots',
        nameKey: 'items.set.wardensBulwark.boots',
        type: ITEM_IDS.BOOTS,
        stats: {
          evasion: { minMultiplier: 5.3, maxMultiplier: 2.8 },
          dexterity: { minMultiplier: 2, maxMultiplier: 1.5 },
          lifePercent: { minMultiplier: 0.8, maxMultiplier: 0.5 },
          lifeRegen: { minMultiplier: 0.9, maxMultiplier: 0.5 },
        },
        descriptionKey: 'items.set.wardensBulwark.boots.desc',
      },
    ],
    setBonuses: [
      {
        pieces: 2,
        nameKey: 'items.set.wardensBulwark.bonus2',
        stats: {
          armor: { minMultiplier: 2.8, maxMultiplier: 1.5 },
          blockChance: { minMultiplier: 1.3, maxMultiplier: 0.7 },
        },
      },
      {
        pieces: 3,
        nameKey: 'items.set.wardensBulwark.bonus3',
        stats: {
          life: { minMultiplier: 7.3, maxMultiplier: 3.8 },
          allResistancePercent: { minMultiplier: 3, maxMultiplier: 1.3 },
        },
      },
      {
        pieces: 4,
        nameKey: 'items.set.wardensBulwark.bonus4',
        stats: {
          lifePercent: { minMultiplier: 1, maxMultiplier: 0.6 },
          armorPercent: { minMultiplier: 1.3, maxMultiplier: 0.8 },
        },
      },
    ],
  },
};