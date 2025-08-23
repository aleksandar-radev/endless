import { t } from '../i18n.js';
// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    get name() { return t('Crystal Lab'); },
    description: t('Generates crystals over time.'),
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    costStructure: {
      gold: { base: 2000, increment: 150, cap: 15000 },
      crystal: { base: 5, increment: 1, cap: 20 },
    },
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    get name() { return t('Gold Mine'); },
    description: t('Produces gold every few minutes.'),
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    costStructure: {
      gold: { base: 2000, increment: 100, cap: 12000 },
    },
    maxLevel: 1000000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    get name() { return t('Soul Forge'); },
    description: t('Converts resources into souls.'),
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 'hour' },
    costStructure: {
      gold: { base: 10000, increment: 500, cap: 50000 },
      crystal: { base: 12, increment: 1, cap: 30 },
      soul: { base: 10, increment: 2, cap: 50 },
    },
    maxLevel: 30000,
    unlockRequirements: {},
  },
  experienceWorkshop: {
    id: 'experienceWorkshop',
    get name() { return t('Experience Workshop'); },
    description: t('Produces experience potions every hour.'),
    image: '/buildings/experience-workshop.png',
    effect: {
      type: 'material',
      displayName: t('random experience potion'),
      materialIds: ['experience_potion', 'greater_experience_potion', 'huge_experience_potion'],
      amount: 1,
      interval: 'minute',
    },
    costStructure: {
      gold: { base: 4000, increment: 200, cap: 16000 },
      crystal: { base: 3, increment: 1, cap: 25 },
    },
    maxLevel: 40000,
    unlockRequirements: {},
  },
  materialDepot: {
    id: 'materialDepot',
    get name() { return t('Material Depot'); },
    description: t('Generates a random material each hour.'),
    image: '/buildings/material-depot.png',
    effect: {
      type: 'material',
      displayName: t('random material'),
      random: true,
      weighted: true,
      amount: 1,
      interval: 'minute',
    },
    costStructure: {
      gold: { base: 3000, increment: 250, cap: 18000 },
      crystal: { base: 2, increment: 1, cap: 40 },
    },
    maxLevel: 1000,
    unlockRequirements: {},
  },
};
