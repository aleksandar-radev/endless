import { ENEMY_LIST } from './enemies.js';

export const REGIONS = [
  {
    tier: 1,
    id: 'forest',
    unlockLevel: 1,
    name: 'Enchanted Forest',
    description: 'A mystical forest teeming with elemental creatures.',
    allowedTags: ['forest'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('forest')).map((e) => e.name);
    },
    lifeMultiplier: 1.0,
    damageMultiplier: 1.0,
    xpMultiplier: 1.0,
    goldMultiplier: 1.2,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      crystalized_rock: 1.1,
    },
    itemBaseBonus: 0.8,
    hitChanceMultiplier: 1.0,
    armorReductionMultiplier: 1.0,
    evasionReductionMultiplier: 1.0,
  },
  {
    tier: 2,
    id: 'crystal_cave',
    unlockLevel: 25,
    name: 'Crystal Cave',
    description: 'A shimmering cave filled with crystalized rocks.',
    allowedTags: ['cave', 'crystal'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('cave')).map((e) => e.name);
    },
    lifeMultiplier: 1.7,
    damageMultiplier: 1.4,
    xpMultiplier: 2.5,
    goldMultiplier: 1,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 1.8,
    materialDropWeights: {
      crystalized_rock: 5,
    },
    itemBaseBonus: 1.04,
    hitChanceMultiplier: 2.0,
    armorReductionMultiplier: 2.0,
    evasionReductionMultiplier: 2.0,
  },
  {
    tier: 3,
    id: 'tundra',
    unlockLevel: 50,
    name: 'Frozen Tundra',
    description: 'A land of ice and snow, home to cold and air enemies.',
    allowedTags: ['tundra', 'ice'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('tundra')).map((e) => e.name);
    },
    lifeMultiplier: 2.4,
    damageMultiplier: 2.0,
    xpMultiplier: 3,
    goldMultiplier: 2,
    itemDropMultiplier: 1.5,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
    },
    itemBaseBonus: 1.28,
    hitChanceMultiplier: 3.0,
    armorReductionMultiplier: 3.0,
    evasionReductionMultiplier: 3.0,
  },
  {
    tier: 4,
    id: 'desert',
    unlockLevel: 150,
    name: 'Scorching Desert',
    description: 'A vast desert with relentless heat and dangerous creatures.',
    allowedTags: ['desert', 'sand'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('desert')).map((e) => e.name);
    },
    lifeMultiplier: 3,
    damageMultiplier: 3.5,
    xpMultiplier: 4,
    goldMultiplier: 2.5,
    itemDropMultiplier: 1.5,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      elixir: 5,
    },
    canDrop: ['elixir'],
    itemBaseBonus: 1.52,
    hitChanceMultiplier: 4.0,
    armorReductionMultiplier: 4.0,
    evasionReductionMultiplier: 4.0,
  },
  {
    tier: 5,
    id: 'swamp',
    unlockLevel: 350,
    name: 'Murky Swamp',
    description: 'A dark and damp swamp filled with poisonous creatures.',
    allowedTags: ['swamp', 'poison'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('swamp')).map((e) => e.name);
    },
    lifeMultiplier: 6,
    damageMultiplier: 3,
    xpMultiplier: 4.5,
    goldMultiplier: 2,
    itemDropMultiplier: 3,
    materialDropMultiplier: 2.0,
    materialDropWeights: {
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
    itemBaseBonus: 1.76,
    hitChanceMultiplier: 5.0,
    armorReductionMultiplier: 5.0,
    evasionReductionMultiplier: 5.0,
  },
  {
    tier: 6,
    id: 'skyrealm',
    unlockLevel: 660,
    name: 'Skyrealm Peaks',
    description: 'A floating realm high above the clouds, home to air and lightning creatures.',
    allowedTags: ['sky', 'air'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('sky')).map((e) => e.name);
    },
    lifeMultiplier: 7,
    damageMultiplier: 5,
    xpMultiplier: 5,
    goldMultiplier: 3.5,
    itemDropMultiplier: 4,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_dexterity: 5,
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
    },
    itemBaseBonus: 2.0,
    hitChanceMultiplier: 6.0,
    armorReductionMultiplier: 6.0,
    evasionReductionMultiplier: 6.0,
  },
  {
    tier: 7,
    id: 'abyss',
    unlockLevel: 1000,
    name: 'Abyssal Depths',
    description: 'A dark and mysterious region filled with ancient horrors.',
    allowedTags: ['abyss', 'dark'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('abyss')).map((e) => e.name);
    },
    lifeMultiplier: 12,
    damageMultiplier: 6,
    xpMultiplier: 9,
    goldMultiplier: 4,
    itemDropMultiplier: 1.0,
    materialDropMultiplier: 5.0,
    materialDropWeights: {
      freaky_gold_coins: 15,
    },
    itemBaseBonus: 2.24,
    hitChanceMultiplier: 7.0,
    armorReductionMultiplier: 7.0,
    evasionReductionMultiplier: 7.0,
  },
  {
    tier: 8,
    id: 'volcanic_rift',
    unlockLevel: 1400,
    name: 'Volcanic Rift',
    description: 'A searing landscape of molten rock and fire elementals.',
    allowedTags: ['volcano', 'fire'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && (e.tags.includes('volcano') || e.tags.includes('fire'))).map(
        (e) => e.name
      );
    },
    lifeMultiplier: 18,
    damageMultiplier: 12,
    xpMultiplier: 12,
    goldMultiplier: 10,
    itemDropMultiplier: 7.0,
    materialDropMultiplier: 1,
    materialDropWeights: {
      potion_of_strength: 4,
      armor_upgrade_stone: 2.2,
      weapon_upgrade_core: 1.2,
    },
    itemBaseBonus: 2.48,
    hitChanceMultiplier: 8.0,
    armorReductionMultiplier: 8.0,
    evasionReductionMultiplier: 8.0,
  },
  {
    tier: 9,
    id: 'sunken_ruins',
    unlockLevel: 1800,
    name: 'Sunken Ruins',
    description: 'Ancient ruins submerged beneath the waves, teeming with aquatic mysteries.',
    allowedTags: ['ruins', 'water'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && (e.tags.includes('ruins') || e.tags.includes('water'))).map(
        (e) => e.name
      );
    },
    lifeMultiplier: 22,
    damageMultiplier: 16,
    xpMultiplier: 16,
    goldMultiplier: 15,
    itemDropMultiplier: 4,
    materialDropMultiplier: 4,
    materialDropWeights: {
      potion_of_vitality: 3.1,
      crystalized_rock: 2.2,
    },
    itemBaseBonus: 2.72,
    hitChanceMultiplier: 9.0,
    armorReductionMultiplier: 9.0,
    evasionReductionMultiplier: 9.0,
  },
  {
    tier: 10,
    id: 'haunted_moor',
    unlockLevel: 2200,
    name: 'Haunted Moor',
    description: 'A fog-laden moor haunted by restless spirits and lost souls.',
    allowedTags: ['haunted', 'spirit'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && (e.tags.includes('haunted') || e.tags.includes('spirit'))).map(
        (e) => e.name
      );
    },
    lifeMultiplier: 35,
    damageMultiplier: 25,
    xpMultiplier: 25,
    goldMultiplier: 15,
    itemDropMultiplier: 12,
    materialDropMultiplier: 1.0,
    materialDropWeights: {
      potion_of_wisdom: 3.2,
      elixir: 1.3,
    },
    canDrop: ['elixir'],
    itemBaseBonus: 2.96,
    hitChanceMultiplier: 10.0,
    armorReductionMultiplier: 10.0,
    evasionReductionMultiplier: 10.0,
  },
  {
    tier: 11,
    id: 'golden_steppe',
    unlockLevel: 2600,
    name: 'Golden Steppe',
    description: 'Vast golden grasslands where fortune favors the bold.',
    allowedTags: ['steppe', 'gold'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && (e.tags.includes('steppe') || e.tags.includes('gold'))).map(
        (e) => e.name
      );
    },
    lifeMultiplier: 30,
    damageMultiplier: 35,
    xpMultiplier: 25,
    goldMultiplier: 30,
    itemDropMultiplier: 6.0,
    materialDropMultiplier: 6.0,
    materialDropWeights: {
      medium_gold_coins: 3.2,
      large_gold_coins: 1.2,
    },
    itemBaseBonus: 3.22,
    hitChanceMultiplier: 11.0,
    armorReductionMultiplier: 11.0,
    evasionReductionMultiplier: 11.0,
  },
  {
    tier: 12,
    id: 'obsidian_spire',
    unlockLevel: 3000,
    name: 'Obsidian Spire',
    description: 'A towering spire of black glass, pulsing with arcane energy.',
    allowedTags: ['obsidian', 'arcane'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && (e.tags.includes('obsidian') || e.tags.includes('arcane'))).map(
        (e) => e.name
      );
    },
    lifeMultiplier: 60,
    damageMultiplier: 60,
    xpMultiplier: 50,
    goldMultiplier: 50,
    itemDropMultiplier: 10,
    materialDropMultiplier: 10,
    materialDropWeights: {
      jewelry_upgrade_gem: 2.2,
      potion_of_dexterity: 2.1,
      weapon_upgrade_core: 1.3,
    },
    itemBaseBonus: 3.5,
    hitChanceMultiplier: 12.0,
    armorReductionMultiplier: 12.0,
    evasionReductionMultiplier: 12.0,
  },
];

export function getRegionByTier(tier) {
  return REGIONS.find((region) => region.tier === tier);
}
