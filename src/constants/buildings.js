// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    image: '/buildings/crystal-lab.png',
    effect: { type: 'crystal', amount: 1, interval: 'hour' },
    cost: { gold: 3000, crystal: 10 }, // Changed to cost crystals
    costIncrease: { gold: 3000, crystal: 5 },
    maxLevel: 50000,
    unlockRequirements: {},
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
    image: '/buildings/gold-mine.png',
    effect: { type: 'gold', amount: 10, interval: 'minute' },
    cost: { gold: 10000 }, // Changed to cost gold
    costIncrease: { gold: 5000 },
    maxLevel: 100000,
    unlockRequirements: {},
  },
  soulForge: {
    id: 'soulForge',
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    image: '/buildings/soul-forge.png',
    effect: { type: 'soul', amount: 5, interval: 'hour' },
    cost: { gold: 10000, crystal: 20, soul: 20 }, // Changed to cost gold and souls
    costIncrease: { gold: 10000, crystal: 12, soul: 6 },
    maxLevel: 30000,
    unlockRequirements: {},
  },
  // Add more buildings as needed
};
