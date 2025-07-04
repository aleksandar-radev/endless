/**
 * List of boss definitions for the Arena.
 * Each boss has a level, unique id, display name, image path, stats, and rewards.
 */

function applyDefaultBossStats(boss) {
  const defaults = {
    life: 3000,
    damage: 25,
    attackRating: 135,
    attackSpeed: 1,
    xp: 100,
    gold: 100,
    armor: 180,
    evasion: 200,
    fireDamage: 0,
    coldDamage: 0,
    airDamage: 0,
    earthDamage: 0,
    fireResistance: 0,
    coldResistance: 0,
    airResistance: 0,
    earthResistance: 0,
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
  };
  const merged = { ...defaults, ...boss };
  if (boss.multiplier) {
    merged.multiplier = { ...defaults.multiplier, ...boss.multiplier };
  }
  return merged;
}

const RAW_BOSSES = [
  {
    id: 'goblin-king',
    name: 'Goblin King',
    type: 'boss',
    image: '/enemies/goblin-king.jpg',
    attackSpeed: 1.2,
    coldResistance: 60,
    multiplier: {
      life: 1.2,
      damage: 1.2,
      xp: 1.6,
      gold: 1.6,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 500, materials: [{ id: 'experience_potion', qty: 1 }] },
  },
  {
    id: 'stone-golem',
    name: 'Stone Golem',
    type: 'boss',
    image: '/enemies/obsidian-golem.jpg',
    damage: 15,
    attackSpeed: 1,
    life: 3500,
    fireResistance: 30,
    airResistance: 30,
    earthResistance: 40,
    coldResistance: 30,
    multiplier: {
      life: 1.8,
      damage: 1.3,
      xp: 1.6,
      gold: 3,
      itemDrop: 1,
      materialDrop: 1,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 1000, materials: [{ id: 'potion_of_agility', qty: 1 }] },
  },
  {
    id: 'fire-drake',
    name: 'Fire Drake',
    type: 'boss',
    image: '/enemies/ember-drake.jpg',
    attackSpeed: 0.8,
    damage: 20,
    fireDamage: 10,
    fireResistance: 50,
    airResistance: 30,
    earthResistance: 20,
    multiplier: {
      life: 1.6,
      damage: 1.5,
      xp: 3,
      gold: 1.5,
      itemDrop: 1.2,
      materialDrop: 1.2,
      fireDamage: 1.4,
    },
    materialDropWeights: {},
    reward: { souls: 1, gold: 1500, materials: [{ id: 'crystalized_rock', qty: 1 }] },
  },
];

export const BOSSES = RAW_BOSSES.map(applyDefaultBossStats);