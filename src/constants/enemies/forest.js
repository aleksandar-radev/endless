export const FOREST_ENEMIES = [
  {
    name: 'Mossback',
    element: 'earth',
    image: '/enemies/mossback.jpg',
    tier: 1,
    armor: 20,
    earthResistance: 50,
    materialDropWeights: {},
    tags: ['forest'],
  },
  {
    name: 'Thornling',
    element: 'earth',
    image: '/enemies/thornling.jpg',
    tier: 1,
    multiplier: {
      itemDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['forest'],
  },
  {
    name: 'Barkhide',
    element: 'earth',
    image: '/enemies/barkhide.jpg',
    tier: 1,
    multiplier: {
      materialDrop: 1.1,
    },
    materialDropWeights: {},
    tags: ['forest'],
  },
  {
    name: 'Sylvan Wisp',
    element: 'air',
    image: '/enemies/sylvan-wisp.jpg',
    tier: 1,
    multiplier: {
      life: 0.9,
    },
    materialDropWeights: {},
    tags: ['forest'],
  },
  {
    name: 'Wildfire Spirit',
    element: 'fire',
    image: '/enemies/wildfire-spirit.jpg',
    tier: 1,
    multiplier: {
      damage: 1.2,
    },
    materialDropWeights: {},
    tags: ['forest', 'fire'],
    icon: '🔥',
  },
];
