import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_SUMMIT_ENEMIES = [
  {
    id: 'rock_spirit',
    get name() {
      return t('Rock Spirit');
    },
    image: '/enemies/rock-spirit.jpg',
    multiplier: {
      life: 1.5,
      damage: 0.95,
      armor: 1.3,
      attackSpeed: 1,
      attackRating: 1.3,
      evasion: 1.1,
      xp: 1.3,
      gold: 1.3,
      fireDamage: 0.15,
      coldDamage: 0.12,
      airDamage: 0.25,
      earthDamage: 0.1,
      lightningDamage: 0.35,
      waterDamage: 0.1,
      fireResistance: 1.3,
      coldResistance: 1.1,
      airResistance: 1.7,
      earthResistance: 0.75,
      lightningResistance: 2.2,
      waterResistance: 0.7,
    },
    special: ['thornsAura', 'frenzied', 'alwaysHit', 'lifeSteal'],
    specialData: {
      thornsPercent: 0.7,
      attackSpeedMultiplier: 2,
      lifeStealPercent: 5,
    },
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['summit'],
  },
];
