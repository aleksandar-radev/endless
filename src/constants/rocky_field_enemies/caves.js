import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_CAVES_ENEMIES = [
  {
    id: 'cave_stalker',
    get name() {
      return t('Cave Stalker');
    },
    image: '/enemies/cave-stalker.jpg',
    multiplier: {
      life: 1,
      damage: 0.75,
      armor: 0.9,
      attackSpeed: 1.2,
      attackRating: 1.2,
      evasion: 1.2,
      xp: 1.1,
      gold: 1,
      fireDamage: 0.05,
      coldDamage: 0.27,
      airDamage: 0.07,
      earthDamage: 0.12,
      lightningDamage: 0.08,
      waterDamage: 0.24,
      fireResistance: 0.6,
      coldResistance: 1.9,
      airResistance: 1,
      earthResistance: 1.3,
      lightningResistance: 0.65,
      waterResistance: 1.7,
    },
    special: ['thornsAura'],
    specialData: { thornsPercent: 1.5 },
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['caves'],
  },
];
