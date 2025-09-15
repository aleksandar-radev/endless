import { ROCKY_FIELD_OUTSKIRTS_ENEMIES } from './rocky_field_enemies/outskirts.js';
import { ROCKY_FIELD_BOULDERS_ENEMIES } from './rocky_field_enemies/boulders.js';
import { ROCKY_FIELD_CAVES_ENEMIES } from './rocky_field_enemies/caves.js';
import { ROCKY_FIELD_CLIFFS_ENEMIES } from './rocky_field_enemies/cliffs.js';
import { ROCKY_FIELD_VALLEY_ENEMIES } from './rocky_field_enemies/valley.js';
import { ROCKY_FIELD_SUMMIT_ENEMIES } from './rocky_field_enemies/summit.js';
import { RUNES } from '../runes.js';

export const ALL_RUNES = RUNES.map((r) => r.id);
export const COMMON_RUNES = RUNES.filter((r) => !r.unique).map((r) => r.id);

export const ROCKY_FIELD_ENEMIES = [
  ...ROCKY_FIELD_OUTSKIRTS_ENEMIES,
  ...ROCKY_FIELD_BOULDERS_ENEMIES,
  ...ROCKY_FIELD_CAVES_ENEMIES,
  ...ROCKY_FIELD_CLIFFS_ENEMIES,
  ...ROCKY_FIELD_VALLEY_ENEMIES,
  ...ROCKY_FIELD_SUMMIT_ENEMIES,
];

export default ROCKY_FIELD_ENEMIES;
