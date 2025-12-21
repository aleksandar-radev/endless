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
import { ELEMENTS, BASE_ITEM_DROP_CHANCE } from './common.js';

/**
 * Mob Scaling Constants
 * 
 * Mobs scale based on two factors:
 * 1. Region scaling - multiplicative scaling per region tier
 * 2. Stage scaling - additive percentage scaling per stage from base value
 */

// Multiplier applied to mob stats when moving from one region to the next
// e.g., 5x means region 2 mobs have 5x the stats of region 1 mobs at the same stage
export const MOB_REGION_SCALING_MULTIPLIER = 5;

// Percentage increase per stage based on the base value at stage 1
// e.g., 0.1 means each stage increases mob stats by 10% of the base (stage 1) value
export const MOB_STAGE_SCALING_PERCENT = 0.1;

/**
 * Item Scaling Constants
 * 
 * Items scale based on two factors:
 * 1. Region/tier scaling - multiplicative scaling per item tier
 * 2. Stage scaling - additive percentage scaling per stage from base value
 * 
 * Items have two types of stats:
 * - Flat values (e.g., +100 life, +50 damage)
 * - Percent values (e.g., +10% life, +5% damage)
 */

// Multiplier applied to item flat values when moving from one tier to the next
// e.g., 2x means tier 2 items have 2x the flat stats of tier 1 items at the same level
export const ITEM_FLAT_REGION_SCALING_MULTIPLIER = 2;

// Multiplier applied to item percent values when moving from one tier to the next
// e.g., 1.3x means tier 2 items have 1.3x the percent stats of tier 1 items at the same level
export const ITEM_PERCENT_REGION_SCALING_MULTIPLIER = 1.3;

// Percentage increase per stage for item flat values based on the base value at level 1
// e.g., 0.008 means each level increases flat stats by 0.8% of the base value
export const ITEM_FLAT_STAGE_SCALING_PERCENT = 0.008;

// Percentage increase per stage for item percent values based on the base value at level 1
// e.g., 0.001 means each level increases percent stats by 0.1% of the base value
export const ITEM_PERCENT_STAGE_SCALING_PERCENT = 0.001;

const ELEMENTAL_DAMAGE_STATS = Object.keys(ELEMENTS).map(
  (el) => `${el}Damage`,
);

export const ENEMY_RARITY = {
  NORMAL: {
    type: 'NORMAL',
    itemDropChance: BASE_ITEM_DROP_CHANCE,
    color: 'gray',
    threshold: 800,
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
      fireResistance: 1,
      coldResistance: 1,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 1,
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
    itemDropChance: BASE_ITEM_DROP_CHANCE * 1.2,
    color: 'blue',
    threshold: 900,
    multiplier: {
      life: 2.5,
      damage: 1.2,
      attackSpeed: 0.95,
      xp: 1.8,
      gold: 1.8,
      itemDrop: 1.6,
      materialDrop: 1.6,
      attackRating: 1.4,
      armor: 1.4,
      fireResistance: 1.4,
      coldResistance: 1.4,
      airResistance: 1.4,
      earthResistance: 1.4,
      lightningResistance: 1.4,
      waterResistance: 1.4,
      evasion: 1.4,
      fireDamage: 1.2,
      coldDamage: 1.2,
      airDamage: 1.2,
      earthDamage: 1.2,
      lightningDamage: 1.2,
      waterDamage: 1.2,
    },
  },
  EPIC: {
    type: 'EPIC',
    itemDropChance: BASE_ITEM_DROP_CHANCE * 1.4,
    color: 'purple',
    threshold: 960,
    multiplier: {
      life: 3.5,
      damage: 1.5,
      attackSpeed: 0.9,
      xp: 2.8,
      gold: 2.8,
      itemDrop: 2,
      materialDrop: 2,
      attackRating: 1.7,
      armor: 1.7,
      fireResistance: 1.7,
      coldResistance: 1.7,
      airResistance: 1.7,
      earthResistance: 1.7,
      lightningResistance: 1.7,
      waterResistance: 1.7,
      evasion: 1.7,
      fireDamage: 1.5,
      coldDamage: 1.5,
      airDamage: 1.5,
      earthDamage: 1.5,
      lightningDamage: 1.5,
      waterDamage: 1.5,
    },
  },
  LEGENDARY: {
    type: 'LEGENDARY',
    itemDropChance: BASE_ITEM_DROP_CHANCE * 1.6,
    color: 'orange',
    threshold: 990,
    multiplier: {
      life: 5,
      damage: 1.8,
      attackSpeed: 0.9,
      xp: 3.8,
      gold: 3.8,
      itemDrop: 3,
      materialDrop: 3,
      attackRating: 0.9,
      armor: 2.5,
      fireResistance: 2.5,
      coldResistance: 2.5,
      airResistance: 2.5,
      earthResistance: 2.5,
      lightningResistance: 2.5,
      waterResistance: 2.5,
      evasion: 2.5,
      fireDamage: 1.8,
      coldDamage: 1.8,
      airDamage: 1.8,
      earthDamage: 1.8,
      lightningDamage: 1.8,
      waterDamage: 1.8,
    },
  },
  MYTHIC: {
    type: 'MYTHIC',
    itemDropChance: BASE_ITEM_DROP_CHANCE * 2,
    color: 'red',
    threshold: 1000,
    multiplier: {
      life: 7,
      damage: 2,
      attackSpeed: 0.85,
      xp: 6,
      gold: 6,
      itemDrop: 4,
      materialDrop: 4,
      attackRating: 3.4,
      armor: 3.4,
      fireResistance: 3.4,
      coldResistance: 3.4,
      airResistance: 3.4,
      earthResistance: 3.4,
      lightningResistance: 3.4,
      waterResistance: 3.4,
      evasion: 3.4,
      fireDamage: 2,
      coldDamage: 2,
      airDamage: 2,
      earthDamage: 2,
      lightningDamage: 2,
      waterDamage: 2,
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
    life: 18 * multiplier,
    damage: 1 * multiplier,
    attackSpeed: 1,
    attackRating: 5 * multiplier,
    armor: 7 * multiplier,
    evasion: 5 * multiplier,

    xp: 6 * multiplier,
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
      damage: 0,
      xp: 1.0,
      gold: 1.0,
      itemDrop: 1.0,
      materialDrop: 1.0,
      attackRating: 1.0,
      armor: 1,
      fireResistance: 1,
      coldResistance: 1,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 1,
      evasion: 1.0,
      fireDamage: 0,
      coldDamage: 0,
      airDamage: 0,
      earthDamage: 0,
      lightningDamage: 0,
      waterDamage: 0,
    },
  };

  const merged = { ...defaults, ...enemy };
  // Merge multipliers by adding values instead of replacing
  const incomingMult = enemy.multiplier || {};
  merged.multiplier = { ...defaults.multiplier };
  Object.keys(incomingMult).forEach((key) => {
    const a = merged.multiplier[key] ?? 0;
    const b = incomingMult[key] ?? 0;
    merged.multiplier[key] = a + b;
  });

  const statsToConvert = Object.keys(defaults).filter(
    (stat) => stat !== 'tier' && stat !== 'multiplier',
  );

  for (const stat of statsToConvert) {
    if (enemy[stat] !== undefined) {
      const baseStat = ELEMENTAL_DAMAGE_STATS.includes(stat) ? 'damage' : stat;
      const baseValue = defaults[baseStat] / multiplier; // default base without tier scaling
      const defaultMult = defaults.multiplier[baseStat] ?? 1;
      const rawValue = enemy[stat] / multiplier; // value before tier scaling
      merged.multiplier[stat] = (defaultMult * rawValue) / baseValue;
      delete merged[stat];
    }
  }

  for (const stat of ELEMENTAL_DAMAGE_STATS) {
    if (
      (enemy.multiplier && enemy.multiplier[stat] !== undefined) ||
      enemy[stat] !== undefined
    ) {
      merged[stat] = merged.damage;
    }
  }

  // ensure attack speed is always set
  merged.attackSpeed = defaults.attackSpeed;

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
