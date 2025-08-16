import { t } from '../i18n.js';
// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: t('Crystal Lab'),
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
    name: t('Gold Mine'),
    description: t('Produces gold every few minutes.'),
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    costStructure: {
      gold: { base: 2000, increment: 100, cap: 12000 },
    },
    maxLevel: 100000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    name: t('Soul Forge'),
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
  // Add more buildings as needed
};
