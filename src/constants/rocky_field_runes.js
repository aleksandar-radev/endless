import { RUNES } from './runes.js';

export const ROCKY_FIELD_ALL_RUNES = RUNES.map((rune) => rune.id);
export const ROCKY_FIELD_COMMON_RUNES = RUNES.filter((rune) => !rune.unique).map((rune) => rune.id);
