import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_VALLEY_ENEMIES = [
  {
    id: 'valley_sentinel',
    get name() {
      return t('Valley Sentinel');
    },
    image: '/enemies/valley-sentinel.jpg',
    multiplier: {
      life: 1.4,
      damage: 0.7,
      armor: 1.4,
      attackSpeed: 1,
      attackRating: 1.2,
      evasion: 1,
      xp: 1.2,
      gold: 1.2,
      fireDamage: 0.05,
      coldDamage: 0.12,
      airDamage: 0.08,
      earthDamage: 0.22,
      lightningDamage: 0.07,
      waterDamage: 0.28,
      fireResistance: 0.6,
      coldResistance: 1.4,
      airResistance: 0.9,
      earthResistance: 1.6,
      lightningResistance: 0.65,
      waterResistance: 1.8,
    },
    special: ['fortified', 'alwaysHit', 'noLeech'],
    specialData: {
      armorMultiplier: 2,
      resistanceMultiplier: 2,
    },
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['valley'],
  },
];
