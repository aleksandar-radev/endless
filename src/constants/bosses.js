/**
 * List of boss definitions for the Arena.
 * Each boss has a level, unique id, display name, image path, stats, and rewards.
 */
export const BOSSES = [
  {
    id: 'goblin-king',
    name: 'Goblin King',
    image: 'enemies/goblin-king.jpg',
    attackSpeed: 0.8, // attacks per second
    multiplier: {
      life: 1.0,
      damage: 1.0,
      xp: 1.0,
      gold: 1.0,
      itemDrop: 1.0,
      materialDrop: 1.0,
      attackRating: 1.0,
      armor: 1.0,
      evasion: 1.0,
      fireDamage: 1.0,
      coldDamage: 1.0,
      airDamage: 1.0,
      earthDamage: 1.0,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 500, materials: [{ id: 'experience_potion', qty: 1 }] },
  },
  {
    id: 'stone-golem',
    name: 'Stone Golem',
    image: 'enemies/obsidian-golem.jpg',
    attackSpeed: 1, // attacks per second
    multiplier: {
      life: 1.5,
      damage: 1.3,
      xp: 1.6,
      gold: 1.2,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1.0,
      armor: 1.0,
      evasion: 1.0,
      fireDamage: 1.0,
      coldDamage: 1.0,
      airDamage: 1.0,
      earthDamage: 1.0,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 1000, materials: [{ id: 'potion_of_agility', qty: 1 }] },
  },
  {
    id: 'fire-drake',
    name: 'Fire Drake',
    image: 'enemies/ember-drake.jpg',
    attackSpeed: 1.2, // attacks per second
    multiplier: {
      life: 2.0,
      damage: 1.5,
      xp: 2.5,
      gold: 1.5,
      itemDrop: 1.2,
      materialDrop: 1.2,
      attackRating: 1.0,
      armor: 1.0,
      evasion: 1.0,
      fireDamage: 1.2,
      coldDamage: 1.0,
      airDamage: 1.0,
      earthDamage: 1.0,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 1500, materials: [{ id: 'crystalized_rock', qty: 1 }] },
  },
];
