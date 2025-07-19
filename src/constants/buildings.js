// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    costStructure: {
      gold: { base: 3000, increment: 150, cap: 15000 },
      crystal: { base: 8, increment: 1, cap: 20 },
    },
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
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
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 'hour' },
    costStructure: {
      gold: { base: 10000, increment: 500, cap: 50000 },
      crystal: { base: 12, increment: 2, cap: 30 },
      soul: { base: 16, increment: 2, cap: 50 },
    },
    maxLevel: 30000,
    unlockRequirements: {},
  },
  // Add more buildings as needed
};
