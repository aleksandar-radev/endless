import { ROCKY_FIELD_ALL_RUNES, ROCKY_FIELD_COMMON_RUNES } from './rocky_field_runes.js';
import { ROCKY_FIELD_OUTSKIRTS_ENEMIES } from './rocky_field_enemies/outskirts.js';
import { ROCKY_FIELD_BOULDERS_ENEMIES } from './rocky_field_enemies/boulders.js';
import { ROCKY_FIELD_CAVES_ENEMIES } from './rocky_field_enemies/caves.js';
import { ROCKY_FIELD_CLIFFS_ENEMIES } from './rocky_field_enemies/cliffs.js';
import { ROCKY_FIELD_VALLEY_ENEMIES } from './rocky_field_enemies/valley.js';
import { ROCKY_FIELD_SUMMIT_ENEMIES } from './rocky_field_enemies/summit.js';

export const ROCKY_FIELD_BASE_STATS = {
  life: 5000,
  damage: 375,
  armor: 313,
  attackSpeed: 1,
  attackRating: 625,
  evasion: 313,
  xp: 80,
  gold: 100,

  fireResistance: 100,
  coldResistance: 100,
  airResistance: 100,
  earthResistance: 120,
  lightningResistance: 100,
  waterResistance: 100,
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
