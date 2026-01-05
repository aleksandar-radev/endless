import { t } from '../../i18n.js';
import { ROCKY_FIELD_ALL_RUNES } from '../rocky_field_runes.js';

export const ROCKY_FIELD_CLIFFS_ENEMIES = [
  {
    id: 'cliff_gargoyle',
    get name() {
      return t('enemy.cliffGargoyle');
    },
    image: '/enemies/cliff-gargoyle.jpg',
    multiplier: {
      life: 1.1,
      damage: 0.75,
      armor: 1,
      attackSpeed: 1,
      attackRating: 1.3,
      evasion: 1.3,
      xp: 1.2,
      gold: 1.2,
      fireDamage: 0.08,
      coldDamage: 0.06,
      airDamage: 0.3,
      earthDamage: 0.05,
      lightningDamage: 0.24,
      waterDamage: 0.04,
      fireResistance: 1.1,
      coldResistance: 1,
      airResistance: 1.9,
      earthResistance: 0.6,
      lightningResistance: 1.7,
      waterResistance: 0.65,
    },
    special: ['percentLifeOnHit', 'lifeSteal'],
    specialData: {
      percentLifeOnHit: 10,
      lifeStealPercent: 20,
    },
    runeDrop: ROCKY_FIELD_ALL_RUNES,
    tags: ['cliffs'],
  },
];
