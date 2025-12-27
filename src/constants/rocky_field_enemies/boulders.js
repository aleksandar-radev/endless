import { t } from '../../i18n.js';
import { ROCKY_FIELD_COMMON_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_BOULDERS_ENEMIES = [
  {
    id: 'pebble_golem',
    get name() {
      return t('Pebble Golem');
    },
    image: '/enemies/pebble-golem.jpg',
    multiplier: {
      life: 1.4,
      damage: 0.7,
      armor: 1.2,
      attackSpeed: 0.9,
      attackRating: 1,
      evasion: 0.8,
      xp: 1.1,
      gold: 1.1,
      fireDamage: 0.3,
      coldDamage: 0.04,
      airDamage: 0.05,
      earthDamage: 0.25,
      lightningDamage: 0.08,
      waterDamage: 0.03,
      fireResistance: 1.8,
      coldResistance: 0.6,
      airResistance: 0.9,
      earthResistance: 1.5,
      lightningResistance: 0.8,
      waterResistance: 0.5,
    },
    special: ['fortified'],
    specialData: {
      armorMultiplier: 4,
      resistanceMultiplier: 4,
    },
    runeDrop: ROCKY_FIELD_COMMON_RUNES,
    tags: ['boulders'],
  },
];
