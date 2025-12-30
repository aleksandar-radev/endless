import { t } from '../i18n.js';
import { ENEMY_LIST } from './enemies.js';

export const REGIONS = [
  {
    tier: 1,
    id: 'enchanted_forest',
    unlockLevel: 1,
    get name() {
      return t('Enchanted Forest');
    },
    get description() {
      return t('enchanted_forest.description');
    },
    allowedTags: ['enchanted_forest'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('enchanted_forest')).map((e) => e.name);
    },
    multiplier: {
      life: 0.7,
      damage: 1,
      xp: 1.0,
      gold: 1.0,
      itemDrop: 1.0,
      materialDrop: 1.0,
      attackRating: 1.0,
      armor: 1.0,
      fireResistance: 1.0,
      coldResistance: 1.0,
      airResistance: 1.0,
      earthResistance: 1.0,
      lightningResistance: 1.0,
      waterResistance: 1.0,
      evasion: 1.0,
      fireDamage: 1,
      coldDamage: 1,
      airDamage: 1,
      earthDamage: 1,
      lightningDamage: 1,
      waterDamage: 1,
    },
    materialDropWeights: { crystalized_rock: 1.1 },
    combatProfile: {
      primaryElement: 'earth',
      averageElements: ['air', 'water', 'cold'],
      weakElements: ['fire', 'lightning'],
      armorBias: 'weak',
      primaryDamage: 'earth',
    },
  },
  {
    tier: 2,
    id: 'crystal_cave',
    unlockLevel: 25,
    get name() {
      return t('Crystal Cave');
    },
    get description() {
      return t('crystal_cave.description');
    },
    allowedTags: ['crystal_cave'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('crystal_cave')).map((e) => e.name);
    },
    multiplier: {
      life: 2,
      damage: 1.4,
      xp: 1.5,
      gold: 1.1,
      itemDrop: 1,
      materialDrop: 1.25,
      attackRating: 1.5,
      armor: 1.5,
      fireResistance: 1.5,
      coldResistance: 1.5,
      airResistance: 1.5,
      earthResistance: 1.5,
      lightningResistance: 1.5,
      waterResistance: 1.5,
      evasion: 1.5,
      fireDamage: 1.5,
      coldDamage: 1.5,
      airDamage: 1.5,
      earthDamage: 1.5,
      lightningDamage: 1.5,
      waterDamage: 1.5,
    },
    materialDropWeights: { crystalized_rock: 5 },
    combatProfile: {
      primaryElement: 'lightning',
      averageElements: ['fire', 'cold', 'air'],
      weakElements: ['water', 'earth'],
      armorBias: 'strong',
      primaryDamage: 'physical',
    },
  },
  {
    tier: 3,
    id: 'frozen_tundra',
    unlockLevel: 50,
    get name() {
      return t('Frozen Tundra');
    },
    get description() {
      return t('frozen_tundra.description');
    },
    allowedTags: ['frozen_tundra'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('frozen_tundra')).map((e) => e.name);
    },
    multiplier: {
      life: 2.5,
      damage: 2,
      xp: 2,
      gold: 1.3,
      itemDrop: 1.2,
      materialDrop: 1.0,
      attackRating: 2,
      armor: 2,
      fireResistance: 2,
      coldResistance: 2,
      airResistance: 2,
      earthResistance: 2,
      lightningResistance: 2,
      waterResistance: 2,
      evasion: 2,
      fireDamage: 2,
      coldDamage: 2,
      airDamage: 2,
      earthDamage: 2,
      lightningDamage: 2,
      waterDamage: 2,
    },
    materialDropWeights: {
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
      potion_of_dexterity: 3,
      potion_of_intelligence: 3,
      potion_of_perseverance: 3,
    },
    combatProfile: {
      primaryElement: 'cold',
      averageElements: ['water', 'air', 'earth'],
      weakElements: ['fire', 'lightning'],
      armorBias: 'average',
      primaryDamage: 'cold',
    },
  },
  {
    tier: 4,
    id: 'scorching_desert',
    unlockLevel: 150,
    get name() {
      return t('Scorching Desert');
    },
    get description() {
      return t('scorching_desert.description');
    },
    allowedTags: ['scorching_desert'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('scorching_desert')).map((e) => e.name);
    },
    multiplier: {
      life: 3,
      damage: 2.7,
      xp: 2.2,
      gold: 1.7,
      itemDrop: 1.2,
      materialDrop: 1.4,
      attackRating: 2.7,
      armor: 2.7,
      fireResistance: 2.7,
      coldResistance: 2.7,
      airResistance: 2.7,
      earthResistance: 2.7,
      lightningResistance: 2.7,
      waterResistance: 2.7,
      evasion: 2.7,
      fireDamage: 2.7,
      coldDamage: 2.7,
      airDamage: 2.7,
      earthDamage: 2.7,
      lightningDamage: 2.7,
      waterDamage: 2.7,
    },
    materialDropWeights: { elixir: 5 },
    canDrop: ['elixir'],
  },
  {
    tier: 5,
    id: 'murky_swamp',
    unlockLevel: 350,
    get name() {
      return t('Murky Swamp');
    },
    get description() {
      return t('murky_swamp.description');
    },
    allowedTags: ['murky_swamp'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('murky_swamp')).map((e) => e.name);
    },
    multiplier: {
      life: 4,
      damage: 3.5,
      xp: 2.5,
      gold: 2.2,
      itemDrop: 1.5,
      materialDrop: 1.1,
      attackRating: 3.5,
      armor: 3.5,
      fireResistance: 3.5,
      coldResistance: 3.5,
      airResistance: 3.5,
      earthResistance: 3.5,
      lightningResistance: 3.5,
      waterResistance: 3.5,
      evasion: 3.5,
      fireDamage: 3.5,
      coldDamage: 3.5,
      airDamage: 3.5,
      earthDamage: 3.5,
      lightningDamage: 3.5,
      waterDamage: 3.5,
    },
    materialDropWeights: {
      gold_coins: 4,
      large_gold_coins: 5,
      enormous_gold_coins: 6,
      FREAKY_GOLD_COINS: 4,
    },
    combatProfile: {
      primaryElement: 'fire',
      averageElements: ['earth', 'air', 'lightning'],
      weakElements: ['water', 'cold'],
      armorBias: 'average',
      primaryDamage: 'fire',
    },
    combatProfile: {
      primaryElement: 'water',
      averageElements: ['earth', 'cold', 'fire'],
      weakElements: ['lightning', 'air'],
      armorBias: 'weak',
      primaryDamage: 'water',
    },
  },
  {
    tier: 6,
    id: 'skyrealm_peaks',
    unlockLevel: 660,
    get name() {
      return t('Skyrealm Peaks');
    },
    get description() {
      return t('skyrealm_peaks.description');
    },
    allowedTags: ['skyrealm_peaks'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('skyrealm_peaks')).map((e) => e.name);
    },
    multiplier: {
      life: 6,
      damage: 5,
      xp: 3.2,
      gold: 2.7,
      itemDrop: 2.0,
      materialDrop: 1,
      attackRating: 5,
      armor: 5,
      fireResistance: 5,
      coldResistance: 5,
      airResistance: 5,
      earthResistance: 5,
      lightningResistance: 5,
      waterResistance: 5,
      evasion: 5,
      fireDamage: 5,
      coldDamage: 5,
      airDamage: 5,
      earthDamage: 5,
      lightningDamage: 5,
      waterDamage: 5,
    },
    materialDropWeights: {
      potion_of_dexterity: 3,
      potion_of_strength: 3,
      potion_of_agility: 3,
      potion_of_vitality: 3,
      potion_of_endurance: 3,
      potion_of_wisdom: 3,
      potion_of_intelligence: 3,
      potion_of_perseverance: 3,
    },
    combatProfile: {
      primaryElement: 'air',
      averageElements: ['fire', 'lightning', 'cold'],
      weakElements: ['earth', 'water'],
      armorBias: 'weak',
      primaryDamage: 'air',
    },
  },
  {
    tier: 7,
    id: 'abyssal_depths',
    unlockLevel: 1000,
    get name() {
      return t('Abyssal Depths');
    },
    get description() {
      return t('abyssal_depths.description');
    },
    allowedTags: ['abyssal_depths'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('abyssal_depths')).map((e) => e.name);
    },
    multiplier: {
      life: 8,
      damage: 7,
      xp: 4,
      gold: 3.5,
      itemDrop: 1.75,
      materialDrop: 1,
      attackRating: 7,
      armor: 7,
      fireResistance: 7,
      coldResistance: 7,
      airResistance: 7,
      earthResistance: 7,
      lightningResistance: 7,
      waterResistance: 7,
      evasion: 7,
      fireDamage: 7,
      coldDamage: 7,
      airDamage: 7,
      earthDamage: 7,
      lightningDamage: 7,
      waterDamage: 7,
    },
    materialDropWeights: {
      enormous_gold_coins: 6,
      freaky_gold_coins: 20,
    },
    combatProfile: {
      primaryElement: 'cold',
      averageElements: ['water', 'air', 'lightning'],
      weakElements: ['fire', 'earth'],
      armorBias: 'strong',
      primaryDamage: 'cold',
    },
  },
  {
    tier: 8,
    id: 'volcanic_rift',
    unlockLevel: 1400,
    get name() {
      return t('Volcanic Rift');
    },
    get description() {
      return t('volcanic_rift.description');
    },
    allowedTags: ['volcanic_rift'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('volcanic_rift')).map((e) => e.name);
    },
    multiplier: {
      life: 9,
      damage: 10,
      xp: 5.5,
      gold: 4,
      itemDrop: 1.5,
      materialDrop: 1.5,
      attackRating: 9,
      armor: 9,
      fireResistance: 9,
      coldResistance: 9,
      airResistance: 9,
      earthResistance: 9,
      lightningResistance: 9,
      waterResistance: 9,
      evasion: 9,
      fireDamage: 9,
      coldDamage: 9,
      airDamage: 9,
      earthDamage: 9,
      lightningDamage: 9,
      waterDamage: 9,
    },
    materialDropWeights: {
      jewelry_upgrade_gem: 5,
      armor_upgrade_stone: 3,
      weapon_upgrade_core: 6,
    },
    combatProfile: {
      primaryElement: 'fire',
      averageElements: ['earth', 'lightning', 'air'],
      weakElements: ['water', 'cold'],
      armorBias: 'average',
      primaryDamage: 'fire',
    },
  },
  {
    tier: 9,
    id: 'sunken_ruins',
    unlockLevel: 1800,
    get name() {
      return t('Sunken Ruins');
    },
    get description() {
      return t('sunken_ruins.description');
    },
    allowedTags: ['sunken_ruins'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('sunken_ruins')).map((e) => e.name);
    },
    multiplier: {
      life: 15,
      damage: 14,
      xp: 7,
      gold: 4,
      itemDrop: 1,
      materialDrop: 2.5,
      attackRating: 12,
      armor: 12,
      fireResistance: 12,
      coldResistance: 12,
      airResistance: 12,
      earthResistance: 12,
      lightningResistance: 12,
      waterResistance: 12,
      evasion: 12,
      fireDamage: 12,
      coldDamage: 12,
      airDamage: 12,
      earthDamage: 12,
      lightningDamage: 12,
      waterDamage: 12,
    },
    canDrop: ['elixir'],
    materialDropWeights: {
      elixir: 3.5,
      crystalized_rock: 6,
    },
    combatProfile: {
      primaryElement: 'water',
      averageElements: ['earth', 'cold', 'air'],
      weakElements: ['lightning', 'fire'],
      armorBias: 'strong',
      primaryDamage: 'water',
    },
  },
  {
    tier: 10,
    id: 'haunted_moor',
    unlockLevel: 2200,
    get name() {
      return t('Haunted Moor');
    },
    get description() {
      return t('haunted_moor.description');
    },
    allowedTags: ['haunted_moor'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('haunted_moor')).map((e) => e.name);
    },
    multiplier: {
      life: 25,
      damage: 25,
      xp: 7,
      gold: 7,
      itemDrop: 2,
      materialDrop: 1.65,
      attackRating: 25,
      armor: 25,
      fireResistance: 25,
      coldResistance: 25,
      airResistance: 25,
      earthResistance: 25,
      lightningResistance: 25,
      waterResistance: 25,
      evasion: 25,
      fireDamage: 25,
      coldDamage: 25,
      airDamage: 25,
      earthDamage: 25,
      lightningDamage: 25,
      waterDamage: 25,
    },
    materialDropWeights: {
      greater_experience_potion: 6,
      huge_experience_potion: 10,
    },
    combatProfile: {
      primaryElement: 'air',
      averageElements: ['cold', 'water', 'lightning'],
      weakElements: ['fire', 'earth'],
      armorBias: 'weak',
      primaryDamage: 'air',
    },
  },
  {
    tier: 11,
    id: 'golden_steppe',
    unlockLevel: 2600,
    get name() {
      return t('Golden Steppe');
    },
    get description() {
      return t('golden_steppe.description');
    },
    allowedTags: ['golden_steppe'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('golden_steppe')).map((e) => e.name);
    },
    multiplier: {
      life: 30,
      damage: 30,
      xp: 7,
      gold: 15,
      itemDrop: 1.75,
      materialDrop: 1.75,
      attackRating: 28,
      armor: 28,
      fireResistance: 28,
      coldResistance: 28,
      airResistance: 28,
      earthResistance: 28,
      lightningResistance: 28,
      waterResistance: 28,
      evasion: 28,
      fireDamage: 30,
      coldDamage: 30,
      airDamage: 30,
      earthDamage: 30,
      lightningDamage: 30,
      waterDamage: 30,
    },
    materialDropWeights: {},
    combatProfile: {
      primaryElement: 'earth',
      averageElements: ['fire', 'air', 'lightning'],
      weakElements: ['water', 'cold'],
      armorBias: 'average',
      primaryDamage: 'physical',
    },
  },
  {
    tier: 12,
    id: 'obsidian_spire',
    unlockLevel: 3000,
    get name() {
      return t('Obsidian Spire');
    },
    get description() {
      return t('obsidian_spire.description');
    },
    allowedTags: ['obsidian_spire'],
    get enemyNames() {
      return ENEMY_LIST.filter((e) => e.tags && e.tags.includes('obsidian_spire')).map((e) => e.name);
    },
    multiplier: {
      life: 50,
      damage: 50,
      xp: 14,
      gold: 9,
      itemDrop: 3,
      materialDrop: 3,
      attackRating: 25,
      armor: 40,
      fireResistance: 40,
      coldResistance: 40,
      airResistance: 40,
      earthResistance: 40,
      lightningResistance: 40,
      waterResistance: 40,
      evasion: 25,
      fireDamage: 50,
      coldDamage: 50,
      airDamage: 50,
      earthDamage: 50,
      lightningDamage: 50,
      waterDamage: 50,
    },
    materialDropWeights: {
      alternation_orb: 5,
      transmutation_orb: 5,
    },
    combatProfile: {
      primaryElement: 'lightning',
      averageElements: ['fire', 'cold', 'air'],
      weakElements: ['water', 'earth'],
      armorBias: 'strong',
      primaryDamage: 'lightning',
    },
  },
];

export function getRegionByTier(tier) {
  return REGIONS.find((region) => region.tier === tier);
}
