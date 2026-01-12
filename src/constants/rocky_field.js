import { ROCKY_FIELD_OUTSKIRTS_ENEMIES } from './rocky_field_enemies/outskirts.js';
import { ROCKY_FIELD_BOULDERS_ENEMIES } from './rocky_field_enemies/boulders.js';
import { ROCKY_FIELD_CAVES_ENEMIES } from './rocky_field_enemies/caves.js';
import { ROCKY_FIELD_CLIFFS_ENEMIES } from './rocky_field_enemies/cliffs.js';
import { ROCKY_FIELD_VALLEY_ENEMIES } from './rocky_field_enemies/valley.js';
import { ROCKY_FIELD_SUMMIT_ENEMIES } from './rocky_field_enemies/summit.js';

export const ROCKY_FIELD_BASE_STATS = {
  life: 380,
  damage: 24,
  armor: 60,
  attackSpeed: 1,
  attackRating: 38,
  evasion: 37,
  xp: 42,
  gold: 122,

  fireResistance: 50,
  coldResistance: 50,
  airResistance: 50,
  earthResistance: 50,
  lightningResistance: 50,
  waterResistance: 50,
};

export const ROCKY_FIELD_ENEMIES = [
  ...ROCKY_FIELD_OUTSKIRTS_ENEMIES,
  ...ROCKY_FIELD_BOULDERS_ENEMIES,
  ...ROCKY_FIELD_CAVES_ENEMIES,
  ...ROCKY_FIELD_CLIFFS_ENEMIES,
  ...ROCKY_FIELD_VALLEY_ENEMIES,
  ...ROCKY_FIELD_SUMMIT_ENEMIES,
];

export default ROCKY_FIELD_ENEMIES;
