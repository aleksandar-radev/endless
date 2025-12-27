import { t } from '../i18n.js';
// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    get name() {
      return t('Crystal Lab');
    },
    get description() {
      return t('Generates crystals over time.');
    },
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 60 * 60 },
    costStructure: {
      gold: { base: 2000, increment: 150, cap: 15000 },
      crystal: { base: 5, increment: 1, cap: 20 },
    },
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    get name() {
      return t('Gold Mine');
    },
    get description() {
      return t('Produces gold every few minutes.');
    },
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 60 },
    costStructure: {
      gold: { base: 2000, increment: 100, cap: 12000 },
    },
    maxLevel: 1000000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    get name() {
      return t('Soul Forge');
    },
    get description() {
      return t('Converts resources into souls.');
    },
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 60 * 60 },
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
    get name() {
      return t('Experience Workshop');
    },
    get description() {
      return t('buildings.experienceWorkshop.description');
    },
    image: '/buildings/experience-workshop.png',
    effect: {
      type: 'level',
      displayName: t('level'),
      amount: 1,
      interval: 2 * 60 * 60,
    },
    costStructure: {
      gold: { base: 5000, increment: 5000 },
      crystal: { base: 0, increment: 5 },
    },
    maxLevel: 500,
    unlockRequirements: {},
  },
  materialDepot: {
    id: 'materialDepot',
    get name() {
      return t('Material Depot');
    },
    get description() {
      return t('Generates a random material every 10 minutes.');
    },
    image: '/buildings/material-depot.png',
    effect: {
      type: 'material',
      displayName: t('random material'),
      random: true,
      weighted: true,
      amount: 1,
      interval: 10 * 60,
    },
    costStructure: {
      gold: { base: 500, increment: 1000, cap: 70000 },
      crystal: { base: 1, increment: 1, cap: 50 },
    },
    maxLevel: 2000,
    unlockRequirements: {},
  },
};
