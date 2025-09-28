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
];
