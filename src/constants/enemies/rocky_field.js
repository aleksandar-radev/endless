import { t } from '../../i18n.js';
import { RUNES } from '../runes.js';

const ALL_RUNES = RUNES.map((r) => r.id);
const COMMON_RUNES = RUNES.filter((r) => !r.unique).map((r) => r.id);

export const ROCKY_FIELD_ENEMIES = [
  {
    get name() { return t('Stone Beetle'); },
    image: '/enemies/stone-beetle.jpg',
    region: 'outskirts',
    baseStats: {
      life: 5000,
      damage: 375,
      armor: 313,
      attackSpeed: 1,
      attackRating: 625,
      evasion: 313,
      xp: 500,
      gold: 313,
    },
    special: ['alwaysHit'],
    runeDrop: COMMON_RUNES,
  },
  {
    get name() { return t('Pebble Golem'); },
    image: '/enemies/pebble-golem.jpg',
    region: 'boulders',
    baseStats: {
      life: 15000,
      damage: 1125,
      armor: 938,
      attackSpeed: 0.8,
      attackRating: 1875,
      evasion: 938,
      xp: 1500,
      gold: 938,
    },
    special: ['noLeech'],
    runeDrop: COMMON_RUNES,
  },
  {
    get name() { return t('Cave Stalker'); },
    image: '/enemies/cave-stalker.jpg',
    region: 'caves',
    baseStats: {
      life: 60000,
      damage: 4500,
      armor: 3750,
      attackSpeed: 1,
      attackRating: 7500,
      evasion: 3750,
      xp: 6000,
      gold: 3750,
    },
    special: ['alwaysHit'],
    runeDrop: ALL_RUNES,
  },
  {
    get name() { return t('Cliff Gargoyle'); },
    image: '/enemies/cliff-gargoyle.jpg',
    region: 'cliffs',
    baseStats: {
      life: 240000,
      damage: 18000,
      armor: 15000,
      attackSpeed: 0.9,
      attackRating: 30000,
      evasion: 15000,
      xp: 24000,
      gold: 15000,
    },
    special: ['noLeech'],
    runeDrop: ALL_RUNES,
  },
  {
    get name() { return t('Valley Sentinel'); },
    image: '/enemies/valley-sentinel.jpg',
    region: 'valley',
    baseStats: {
      life: 1440000,
      damage: 108000,
      armor: 90000,
      attackSpeed: 1,
      attackRating: 180000,
      evasion: 90000,
      xp: 144000,
      gold: 90000,
    },
    special: [],
    runeDrop: ALL_RUNES,
  },
  {
    get name() { return t('Rock Spirit'); },
    image: '/enemies/rock-spirit.jpg',
    region: 'summit',
    baseStats: {
      life: 14400000,
      damage: 1080000,
      armor: 900000,
      attackSpeed: 1.2,
      attackRating: 1800000,
      evasion: 900000,
      xp: 1440000,
      gold: 900000,
    },
    special: [],
    runeDrop: ALL_RUNES,
  },
];

export default ROCKY_FIELD_ENEMIES;
