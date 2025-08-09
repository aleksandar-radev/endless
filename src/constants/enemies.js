import { FOREST_ENEMIES } from './enemies/enchanted_forest.js';
import { CRYSTAL_CAVE_ENEMIES } from './enemies/crystal_cave.js';
import { TUNDRA_ENEMIES } from './enemies/frozen_tundra.js';
import { DESERT_ENEMIES } from './enemies/scorching_desert.js';
import { SWAMP_ENEMIES } from './enemies/murky_swamp.js';
import { SKYREALM_ENEMIES } from './enemies/skyrealm_peaks.js';
import { ABYSS_ENEMIES } from './enemies/abyssal_depths.js';
import { VOLCANIC_RIFT_ENEMIES } from './enemies/volcanic_rift.js';
import { SUNKEN_RUINS_ENEMIES } from './enemies/sunken_ruins.js';
import { HAUNTED_MOOR_ENEMIES } from './enemies/haunted_moor.js';
import { GOLDEN_STEPPE_ENEMIES } from './enemies/golden_steppe.js';
import { OBSIDIAN_SPIRE_ENEMIES } from './enemies/obsidian_spire.js';

export const ENEMY_RARITY = {
  NORMAL: {
    type: 'NORMAL',
    itemDropChance: 2.5,
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
      lightningDamage: 1,
      waterDamage: 1,
    },
  },
  RARE: {
    type: 'RARE',
    itemDropChance: 3,
    color: 'blue',
    threshold: 90,
    multiplier: {
      life: 2,
      damage: 1.3,
      attackSpeed: 0.95,
      xp: 1.8,
      gold: 1.8,
      itemDrop: 1.6,
      materialDrop: 1.6,
      attackRating: 1.4,
      armor: 1.4,
      evasion: 1.4,
      fireDamage: 1.3,
      coldDamage: 1.3,
      airDamage: 1.3,
      earthDamage: 1.3,
      lightningDamage: 1.3,
      waterDamage: 1.3,
    },
  },
  EPIC: {
    type: 'EPIC',
    itemDropChance: 3.5,
    color: 'purple',
    threshold: 96,
    multiplier: {
      life: 3,
      damage: 1.6,
      attackSpeed: 0.9,
      xp: 2.8,
      gold: 2.8,
      itemDrop: 2,
      materialDrop: 2,
      attackRating: 1.7,
      armor: 1.7,
      evasion: 1.7,
      fireDamage: 1.6,
      coldDamage: 1.6,
      airDamage: 1.6,
      earthDamage: 1.6,
      lightningDamage: 1.6,
      waterDamage: 1.6,
    },
  },
  LEGENDARY: {
    type: 'LEGENDARY',
    itemDropChance: 4,
    color: 'orange',
    threshold: 99.5,
    multiplier: {
      life: 4,
      damage: 2.2,
      attackSpeed: 0.9,
      xp: 3.8,
      gold: 3.8,
      itemDrop: 3,
      materialDrop: 3,
      attackRating: 0.9,
      armor: 2.5,
      evasion: 2.5,
      fireDamage: 2.2,
      coldDamage: 2.2,
      airDamage: 2.2,
      earthDamage: 2.2,
      lightningDamage: 2.2,
      waterDamage: 2.2,
    },
  },
  MYTHIC: {
    type: 'MYTHIC',
    itemDropChance: 5,
    color: 'red',
    threshold: 100,
    multiplier: {
      life: 5,
      damage: 2.8,
      attackSpeed: 0.85,
      xp: 6,
      gold: 6,
      itemDrop: 4,
      materialDrop: 4,
      attackRating: 3.4,
      armor: 3.4,
      evasion: 3.4,
      fireDamage: 2.8,
      coldDamage: 2.8,
      airDamage: 2.8,
      earthDamage: 2.8,
      lightningDamage: 2.8,
      waterDamage: 2.8,
    },
  },
};

export function getEnemyStatMultiplier(tier) {
  return tier ** 2;
}

export function applyDefaultEnemyStats(enemy) {
  const tier = enemy.tier ?? 1;

  const multiplier = getEnemyStatMultiplier(tier);

  const defaults = {
    tier: tier,
    life: 20 * multiplier,
    damage: 3 * multiplier,
    attackSpeed: 1,
    attackRating: 5 * multiplier,
    armor: 7 * multiplier,
    evasion: 6 * multiplier,

    xp: 7 * multiplier,
    gold: 7 * multiplier,

    fireDamage: 0 * multiplier,
    coldDamage: 0 * multiplier,
    airDamage: 0 * multiplier,
    earthDamage: 0 * multiplier,
    lightningDamage: 0 * multiplier,
    waterDamage: 0 * multiplier,

    fireResistance: 3 * multiplier,
    coldResistance: 3 * multiplier,
    airResistance: 3 * multiplier,
    earthResistance: 3 * multiplier,
    lightningResistance: 3 * multiplier,
    waterResistance: 3 * multiplier,

    // can be used for balancing
    // example is the damage/ele dmg
    multiplier: {
      life: 1.8,
      damage: 0.4,
      xp: 1.0,
      gold: 1.0,
      itemDrop: 1.0,
      materialDrop: 1.0,
      attackRating: 1.0,
      armor: 1.25,
      evasion: 1.0,
      fireDamage: 0.4,
      coldDamage: 0.4,
      airDamage: 0.4,
      earthDamage: 0.4,
      lightningDamage: 0.4,
      waterDamage: 0.4,
    },
  };

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
