const BASE = import.meta.env.VITE_BASE_PATH;

export const ELEMENTS = {
  fire: {
    id: 'fire',
    icon: `<img src="${BASE}/icons/fire.png" class="icon" alt="fire"/>`,
  },
  cold: {
    id: 'cold',
    icon: `<img src="${BASE}/icons/cold.png" class="icon" alt="cold"/>`,
  },
  air: {
    id: 'air',
    icon: `<img src="${BASE}/icons/air.png" class="icon" alt="air"/>`,
  },
  earth: {
    id: 'earth',
    icon: `<img src="${BASE}/icons/earth.png" class="icon" alt="earth"/>`,
  },
  lightning: {
    id: 'lightning',
    icon: `<img src="${BASE}/icons/lightning.png" class="icon" alt="lightning"/>`,
  },
  water: {
    id: 'water',
    icon: `<img src="${BASE}/icons/water.png" class="icon" alt="water"/>`,
  },
};

export const BASE_ITEM_DROP_CHANCE = 2.0;
export const BASE_MATERIAL_DROP_CHANCE = 2.0;

export const MIN_DEATH_TIMER = 2; // Minimum death timer in seconds
export const MAX_DEATH_TIMER = 30; // Maximum death timer in seconds
