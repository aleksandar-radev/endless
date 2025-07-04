// Item and material drop quests
export const DROP_QUESTS = [
  // Item Drop Quests
  {
    id: 'itemdrop_5',
    category: 'drops',
    title: 'First Find',
    description: 'Find 5 items.',
    type: 'item_drop',
    target: 5,
    reward: { item: { rarity: 'rare', type: 'random', tier: 2 } },
    icon: '🎁',
  },
  {
    id: 'itemdrop_25',
    category: 'drops',
    title: 'Treasure Hunter',
    description: 'Find 25 items.',
    type: 'item_drop',
    target: 25,
    reward: { item: { rarity: 'unique', type: 'random', tier: 2 } },
    icon: '🎁',
  },
  {
    id: 'itemdrop_60',
    category: 'drops',
    title: 'Loot Collector',
    description: 'Find 60 items.',
    type: 'item_drop',
    target: 60,
    reward: { item: { rarity: 'unique', type: 'random', tier: 3 } },
    icon: '🎁',
  },
  {
    id: 'itemdrop_150',
    category: 'drops',
    title: 'Relic Seeker',
    description: 'Find 150 items.',
    type: 'item_drop',
    target: 150,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
    icon: '🎁',
  },
  {
    id: 'itemdrop_300',
    category: 'drops',
    title: 'Epic Hoarder',
    description: 'Find 300 items.',
    type: 'item_drop',
    target: 300,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 4 } },
    icon: '🎁',
  },
  {
    id: 'itemdrop_750',
    category: 'drops',
    title: 'Mythic Collector',
    description: 'Find 750 items.',
    type: 'item_drop',
    target: 750,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 5 } },
    icon: '🎁',
  },
  // Material Drop Quests
  {
    id: 'matdrop_5',
    category: 'drops',
    title: 'First Material',
    description: 'Collect 5 materials.',
    type: 'material_drop',
    target: 5,
    reward: { item: { rarity: 'rare', type: 'random', tier: 1 } },
    icon: '🪨',
  },
  {
    id: 'matdrop_25',
    category: 'drops',
    title: 'Material Gatherer',
    description: 'Collect 25 materials.',
    type: 'material_drop',
    target: 25,
    reward: { item: { rarity: 'unique', type: 'random', tier: 1 } },
    icon: '🪨',
  },
  {
    id: 'matdrop_60',
    category: 'drops',
    title: 'Resourceful',
    description: 'Collect 60 materials.',
    type: 'material_drop',
    target: 60,
    reward: { item: { rarity: 'unique', type: 'random', tier: 2 } },
    icon: '🪨',
  },
  {
    id: 'matdrop_150',
    category: 'drops',
    title: 'Materialist',
    description: 'Collect 150 materials.',
    type: 'material_drop',
    target: 150,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
    icon: '🪨',
  },
  {
    id: 'matdrop_300',
    category: 'drops',
    title: 'Legendary Gatherer',
    description: 'Collect 300 materials.',
    type: 'material_drop',
    target: 300,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
    icon: '🪨',
  },
  {
    id: 'matdrop_750',
    category: 'drops',
    title: 'Mythic Prospector',
    description: 'Collect 750 materials.',
    type: 'material_drop',
    target: 750,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 3 } },
    icon: '🪨',
  },
];
