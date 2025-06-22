// Data for all buildings in the game

export const buildingsData = {
  crystalLab: {
    id: 'crystalLab',
    name: 'Crystal Lab',
    description: 'Generates crystals over time.',
    icon: '💎',
    image: '/buildings/crystal-lab.png',
    effect: '+1 crystal per hour',
    cost: 1000,
    maxLevel: 5,
    bonusType: 'crystal',
    bonusAmount: 1,
    unlockStage: 5,
  },
  goldMine: {
    id: 'goldMine',
    name: 'Gold Mine',
    description: 'Produces gold every few minutes.',
    icon: '⛏️',
    image: '/buildings/gold-mine.png',
    effect: '+10 gold per minute',
    cost: 500,
    maxLevel: 10,
    bonusType: 'gold',
    bonusAmount: 10,
    unlockStage: 2,
  },
  soulForge: {
    id: 'soulForge',
    name: 'Soul Forge',
    description: 'Converts resources into souls.',
    icon: '🔥',
    image: '/buildings/soul-forge.png',
    effect: '+1 soul per 10 minutes',
    cost: 2000,
    maxLevel: 3,
    bonusType: 'soul',
    bonusAmount: 1,
    unlockStage: 10,
  },
  // Add more buildings as needed
};
