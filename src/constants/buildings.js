// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    cost: { gold: 3000, crystal: 8 }, // Changed to cost crystals
    costIncrease: { gold: 500, crystal: 1 },
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    cost: { gold: 2000 }, // Changed to cost gold
    costIncrease: { gold: 100 },
    maxLevel: 100000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 'hour' },
    cost: { gold: 10000, crystal: 12, soul: 16 }, // Changed to cost gold and souls
    costIncrease: { gold: 2000, crystal: 2, soul: 2 },
    maxLevel: 30000,
    unlockRequirements: {},
  },
  // Add more buildings as needed
};
