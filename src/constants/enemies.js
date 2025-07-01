import { ELEMENTS } from './common.js';
import { FOREST_ENEMIES } from './enemies/forest.js';
import { CRYSTAL_CAVE_ENEMIES } from './enemies/crystal_cave.js';
import { TUNDRA_ENEMIES } from './enemies/tundra.js';
import { DESERT_ENEMIES } from './enemies/desert.js';
import { SWAMP_ENEMIES } from './enemies/swamp.js';
import { SKYREALM_ENEMIES } from './enemies/skyrealm.js';
import { ABYSS_ENEMIES } from './enemies/abyss.js';
import { VOLCANIC_RIFT_ENEMIES } from './enemies/volcanic_rift.js';
import { SUNKEN_RUINS_ENEMIES } from './enemies/sunken_ruins.js';
import { HAUNTED_MOOR_ENEMIES } from './enemies/haunted_moor.js';
import { GOLDEN_STEPPE_ENEMIES } from './enemies/golden_steppe.js';
import { OBSIDIAN_SPIRE_ENEMIES } from './enemies/obsidian_spire.js';

export const ENEMY_RARITY = {
  NORMAL: {
    type: 'NORMAL',
    itemDropChance: 1,
    color: 'gray',
    threshold: 80,
    multiplier: {
      life: 1,
      damage: 1,
      attackSpeed: 1,
      xp: 1,
      gold: 1,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1,
      armor: 1,
      evasion: 1,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
    },
  },
  RARE: {
    type: 'RARE',
    itemDropChance: 1,
    color: 'blue',
    threshold: 90,
    multiplier: {
      life: 1.2,
      damage: 1.2,
      attackSpeed: 0.9,
      xp: 2,
      gold: 2,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1,
      armor: 1,
      evasion: 1,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
    },
  },
  EPIC: {
    type: 'EPIC',
    itemDropChance: 2,
    color: 'purple',
    threshold: 96,
    multiplier: {
      life: 1.5,
      damage: 1.5,
      attackSpeed: 0.8,
      xp: 3,
      gold: 3,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1,
      armor: 1,
      evasion: 1,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
    },
  },
  LEGENDARY: {
    type: 'LEGENDARY',
    itemDropChance: 2,
    color: 'orange',
    threshold: 99.5,
    multiplier: {
      life: 2,
      damage: 2,
      attackSpeed: 0.7,
      xp: 5,
      gold: 6,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1,
      armor: 1,
      evasion: 1,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
    },
  },
  MYTHIC: {
    type: 'MYTHIC',
    itemDropChance: 3,
    color: 'red',
    threshold: 100,
    multiplier: {
      life: 3,
      damage: 3,
      attackSpeed: 0.5,
      xp: 8,
      gold: 8,
      itemDrop: 1,
      materialDrop: 1,
      attackRating: 1,
      armor: 1,
      evasion: 1,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
    },
  },
};

export function applyDefaultEnemyStats(enemy) {
  const tier = enemy.tier ?? 1;

  const defaults = {
    tier: tier,
    life: 20,
    damage: 2,
    attackRating: 20,
    attackSpeed: 1,
    xp: 5,
    gold: 5,
    armor: 15,
    evasion: 15,
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

  // | Tier |   life   | damage  |   xp   |  gold  | armor   | evasion |
  // |------|----------|---------|--------|--------|---------|---------|
  // |  1   |  30.00   |  3.00   |  5.00  |  5.00  |   0.00  |   0.00  |
  // |  2   |  74.00   |  8.00   | 11.00  | 11.00  |  15.00  |  15.00  |
  // |  3   | 160.44   | 16.28   | 23.13  | 23.13  |  46.17  |  46.17  |
  // |  4   | 290.72   | 29.93   | 42.17  | 42.17  |  97.80  |  97.80  |
  // |  5   | 467.15   | 48.21   | 68.26  | 68.26  | 160.48  | 160.48  |
  // |  6   | 693.45   | 71.34   | 101.63 | 101.63 | 246.90  | 246.90  |
  // |  7   | 975.33   | 99.56   | 142.34 | 142.34 | 367.07  | 367.07  |
  // |  8   | 1320.00  | 133.19  | 190.56 | 190.56 | 537.00  | 537.00  |
  // |  9   | 1736.72  | 172.62  | 246.44 | 246.44 | 754.90  | 754.90  |
  // | 10   | 2236.47  | 218.29  | 310.29 | 310.29 | 1021.57 | 1021.57 |
  // | 11   | 2832.60  | 270.81  | 382.43 | 382.43 | 1353.04 | 1353.04 |
  // | 12   | 3539.45  | 330.97  | 463.39 | 463.39 | 1764.35 | 1764.35 |

  const merged = { ...defaults, ...enemy };
  if (enemy.multiplier) {
    merged.multiplier = { ...defaults.multiplier, ...enemy.multiplier };
  }

  return merged;
}

const RAW_ENEMY_LIST = [
  ...FOREST_ENEMIES,
  ...CRYSTAL_CAVE_ENEMIES,
  ...TUNDRA_ENEMIES,
  ...DESERT_ENEMIES,
  ...SWAMP_ENEMIES,
  ...SKYREALM_ENEMIES,
  ...ABYSS_ENEMIES,
  ...VOLCANIC_RIFT_ENEMIES,
  ...SUNKEN_RUINS_ENEMIES,
  ...HAUNTED_MOOR_ENEMIES,
  ...GOLDEN_STEPPE_ENEMIES,
  ...OBSIDIAN_SPIRE_ENEMIES,
];

export const ENEMY_LIST = RAW_ENEMY_LIST.map((e) => applyDefaultEnemyStats(e));
