const BASE = (import.meta.env && import.meta.env.VITE_BASE_PATH) || '';

export const ELEMENTS = {
  fire: {
    id: 'fire',
    icon: `<img src="${BASE}/icons/fire.png" alt="fire"/>`,
  },
  cold: {
    id: 'cold',
    icon: `<img src="${BASE}/icons/cold.png" alt="cold"/>`,
  },
  air: {
    id: 'air',
    icon: `<img src="${BASE}/icons/air.png" alt="air"/>`,
  },
  earth: {
    id: 'earth',
    icon: `<img src="${BASE}/icons/earth.png" alt="earth"/>`,
  },
  lightning: {
    id: 'lightning',
    icon: `<img src="${BASE}/icons/lightning.png" alt="lightning"/>`,
  },
  water: {
    id: 'water',
    icon: `<img src="${BASE}/icons/water.png" alt="water"/>`,
  },
};

export const BASE_ITEM_DROP_CHANCE = 2.0;
export const BASE_MATERIAL_DROP_CHANCE = 2.0;

export const BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL = 500;

export const MIN_DEATH_TIMER = 2; // Minimum death timer in seconds
export const MAX_DEATH_TIMER = 30; // Maximum death timer in seconds

// Bow/equipment: how many milliseconds to add to enemy attack interval when a bow is equipped
export const BOW_ENEMY_ATTACK_DELAY_MS = 1500; // ms

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 900,
  DESKTOP: 1024,
};

export const IS_MOBILE_OR_TABLET = () => window.matchMedia(`(max-width: ${BREAKPOINTS.MOBILE}px)`).matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export const SKILL_MANA_SCALING_MAX_MULTIPLIER = 100;
export const SKILL_DAMAGE_SCALING_MAX_INSTANT = 10;
export const SKILL_DAMAGE_SCALING_MAX_TOGGLE = 4;
export const SKILL_EFFECT_SCALING_MAX_BUFF = 2.5;


