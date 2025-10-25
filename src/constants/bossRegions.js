import { t } from '../i18n.js';

const DEFAULT_MULTIPLIER = {
  life: 1,
  damage: 1,
  xp: 1,
  gold: 1,
  itemDrop: 1,
  materialDrop: 1,
  attackRating: 1,
  armor: 1,
  evasion: 1,
  attackSpeed: 1,
  fireDamage: 1,
  coldDamage: 1,
  airDamage: 1,
  earthDamage: 1,
  lightningDamage: 1,
  waterDamage: 1,
  fireResistance: 1,
  coldResistance: 1,
  airResistance: 1,
  earthResistance: 1,
  lightningResistance: 1,
  waterResistance: 1,
};

function createMultiplier(overrides = {}) {
  return { ...DEFAULT_MULTIPLIER, ...overrides };
}

const ASCENDED_BOSS_IDS = [
  'void-harbinger',
  'ember-sovereign',
  'tempest-titan',
  'sandstorm-emperor',
  'radiant-phoenix',
  'abyssal-leviathan',
  'arcane-overseer',
  'glacial-tyrant',
];

export const BOSS_REGIONS = [
  {
    id: 'balanced_grounds',
    unlockLevel: 1,
    get name() {
      return t('bossRegion.balancedGrounds.name');
    },
    get description() {
      return t('bossRegion.balancedGrounds.desc');
    },
    bosses: ['goblin-king', 'ogre-chieftain'],
    multiplier: createMultiplier({
      life: 1.1,
      damage: 1.15,
      attackRating: 1.18,
      evasion: 1.12,
      armor: 0.82,
      fireDamage: 1.22,
      earthDamage: 1.18,
      fireResistance: 1.85,
      earthResistance: 1.75,
      coldResistance: 0.45,
      airResistance: 0.55,
      lightningResistance: 0.5,
      waterResistance: 0.45,
    }),
  },
  {
    id: 'shattered_bulwark',
    unlockLevel: 30,
    get name() {
      return t('bossRegion.shatteredBulwark.name');
    },
    get description() {
      return t('bossRegion.shatteredBulwark.desc');
    },
    bosses: ['fire-drake'],
    multiplier: createMultiplier({
      life: 1.05,
      damage: 1.18,
      attackRating: 1.22,
      evasion: 1.2,
      armor: 0.78,
      airDamage: 1.23,
      lightningDamage: 1.27,
      airResistance: 1.8,
      lightningResistance: 1.95,
      fireResistance: 0.5,
      coldResistance: 0.4,
      earthResistance: 0.48,
      waterResistance: 0.46,
    }),
  },
  {
    id: 'iron_vanguard',
    unlockLevel: 60,
    get name() {
      return t('bossRegion.ironVanguard.name');
    },
    get description() {
      return t('bossRegion.ironVanguard.desc');
    },
    bosses: ['stone-golem'],
    multiplier: createMultiplier({
      life: 1.35,
      damage: 0.95,
      xp: 1.1,
      armor: 3.6,
      attackRating: 1.05,
      evasion: 0.9,
      fireResistance: 0.95,
      coldResistance: 0.95,
      airResistance: 0.95,
      earthResistance: 1.15,
      lightningResistance: 0.9,
      waterResistance: 0.9,
    }),
  },
  {
    id: 'elemental_nexus',
    unlockLevel: 90,
    get name() {
      return t('bossRegion.elementalNexus.name');
    },
    get description() {
      return t('bossRegion.elementalNexus.desc');
    },
    bosses: ['ancient-serpent'],
    multiplier: createMultiplier({
      life: 1.18,
      damage: 1.08,
      attackRating: 1.12,
      evasion: 1.05,
      armor: 0.8,
      coldDamage: 1.24,
      waterDamage: 1.2,
      coldResistance: 1.9,
      waterResistance: 1.82,
      fireResistance: 0.38,
      airResistance: 0.52,
      earthResistance: 0.55,
      lightningResistance: 0.5,
    }),
  },
  {
    id: 'twilight_frontier',
    unlockLevel: 1,
    unlockBossLevel: 500,
    bossSkipBonus: 1,
    get name() {
      return t('bossRegion.twilightFrontier.name');
    },
    get description() {
      return t('bossRegion.twilightFrontier.desc');
    },
    bosses: ASCENDED_BOSS_IDS,
    multiplier: createMultiplier({
      life: 2.4,
      damage: 2.05,
      xp: 2,
      gold: 2,
      itemDrop: 1.4,
      materialDrop: 1.4,
      attackRating: 2.1,
      evasion: 1.85,
      armor: 1.55,
      lightningDamage: 2.3,
      coldDamage: 2.05,
      airDamage: 1.6,
      lightningResistance: 2.15,
      coldResistance: 1.95,
      airResistance: 1.65,
      fireResistance: 1.25,
      earthResistance: 1.35,
      waterResistance: 1.7,
    }),
  },
  {
    id: 'voidscarred_wastes',
    unlockLevel: 1,
    unlockBossLevel: 2500,
    bossSkipBonus: 2,
    get name() {
      return t('bossRegion.voidscarredWastes.name');
    },
    get description() {
      return t('bossRegion.voidscarredWastes.desc');
    },
    bosses: ASCENDED_BOSS_IDS,
    multiplier: createMultiplier({
      life: 3.8,
      damage: 3.1,
      xp: 2.6,
      gold: 2.4,
      itemDrop: 1.5,
      materialDrop: 1.6,
      attackRating: 2.6,
      evasion: 2.2,
      armor: 2.05,
      fireDamage: 2.8,
      earthDamage: 2.6,
      lightningDamage: 2.4,
      fireResistance: 2.6,
      earthResistance: 2.5,
      lightningResistance: 2.2,
      coldResistance: 1.6,
      airResistance: 1.7,
      waterResistance: 1.9,
    }),
  },
  {
    id: 'celestial_crucible',
    unlockLevel: 1,
    unlockBossLevel: 15000,
    bossSkipBonus: 3,
    get name() {
      return t('bossRegion.celestialCrucible.name');
    },
    get description() {
      return t('bossRegion.celestialCrucible.desc');
    },
    bosses: ASCENDED_BOSS_IDS,
    multiplier: createMultiplier({
      life: 6.5,
      damage: 4.4,
      xp: 3.5,
      gold: 3,
      itemDrop: 1.65,
      materialDrop: 1.75,
      attackRating: 3.2,
      evasion: 2.8,
      armor: 2.7,
      fireDamage: 3.4,
      airDamage: 3,
      lightningDamage: 3.2,
      fireResistance: 3.1,
      airResistance: 2.9,
      lightningResistance: 2.75,
      coldResistance: 2.1,
      earthResistance: 2.2,
      waterResistance: 2.3,
    }),
  },
  {
    id: 'paradox_realm',
    unlockLevel: 1,
    unlockBossLevel: 75000,
    bossSkipBonus: 5,
    get name() {
      return t('bossRegion.paradoxRealm.name');
    },
    get description() {
      return t('bossRegion.paradoxRealm.desc');
    },
    bosses: ASCENDED_BOSS_IDS,
    multiplier: createMultiplier({
      life: 10.5,
      damage: 6.2,
      xp: 5,
      gold: 4.2,
      itemDrop: 1.8,
      materialDrop: 1.9,
      attackRating: 4.1,
      evasion: 3.4,
      armor: 3.2,
      fireDamage: 4.2,
      coldDamage: 3.8,
      airDamage: 3.9,
      earthDamage: 4.1,
      lightningDamage: 4.3,
      waterDamage: 3.7,
      fireResistance: 3.9,
      coldResistance: 3.6,
      airResistance: 3.5,
      earthResistance: 4,
      lightningResistance: 4.1,
      waterResistance: 3.8,
    }),
  },
];
