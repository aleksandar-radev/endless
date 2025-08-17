const BASE = import.meta.env.VITE_BASE_PATH;

export const ELEMENTS = {
  fire: {
    id: 'fire',
    icon: `<img src="${BASE}/icons/fire.svg" class="icon" alt="fire"/>`,
  },
  cold: {
    id: 'cold',
    icon: `<img src="${BASE}/icons/cold.svg" class="icon" alt="cold"/>`,
  },
  air: {
    id: 'air',
    icon: `<img src="${BASE}/icons/air.svg" class="icon" alt="air"/>`,
  },
  earth: {
    id: 'earth',
    icon: `<img src="${BASE}/icons/earth.svg" class="icon" alt="earth"/>`,
  },
  lightning: {
    id: 'lightning',
    icon: `<img src="${BASE}/icons/lightning.svg" class="icon" alt="lightning"/>`,
  },
  water: {
    id: 'water',
    icon: `<img src="${BASE}/icons/water.svg" class="icon" alt="water"/>`,
  },
};
