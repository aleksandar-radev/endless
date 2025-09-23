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
    multiplier: createMultiplier(),
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
      life: 1,
      damage: 1,
      attackRating: 1.05,
      attackSpeed: 1.1,
      armor: 0.8,
      fireResistance: 2.5,
      coldResistance: 0.4,
      airResistance: 1,
      earthResistance: 1,
      lightningResistance: 1,
      waterResistance: 0.3,
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
      life: 1.5,
      damage: 0.85,
      xp: 1.1,
      armor: 4,
      attackRating: 0.95,
      evasion: 1.1,
      fireResistance: 1.35,
      coldResistance: 1.35,
      airResistance: 1.35,
      earthResistance: 1.35,
      lightningResistance: 1.35,
      waterResistance: 1.35,
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
      life: 1.25,
      damage: 1,
      attackSpeed: 1,
      fireResistance: 0.35,
      earthResistance: 0.65,
      lightningResistance: 0.75,
      waterResistance: 2,
      airResistance: 0.75,
      coldResistance: 2,
      fireDamage: 1.2,
      lightningDamage: 1.2,
      waterDamage: 0.85,
      earthDamage: 0.85,
    }),
  },
];
