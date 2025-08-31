import { ELEMENTS } from './common.js';

const BASE = import.meta.env.VITE_BASE_PATH;

const TYPE_DATA = {
  damage: {
    stat: 'damage',
    labelKey: 'damage',
    icon: `${BASE}/icons/sword.svg`,
  },
};

Object.values(ELEMENTS).forEach(({ id }) => {
  TYPE_DATA[id] = {
    stat: `${id}Damage`,
    labelKey: `${id}Damage`,
    icon: `${BASE}/icons/${id}.svg`,
  };
});

export const RUNES = Object.keys(TYPE_DATA)
  .flatMap((from) =>
    Object.keys(TYPE_DATA)
      .filter((to) => to !== from)
      .map((to) => {
        const fromInfo = TYPE_DATA[from];
        const toInfo = TYPE_DATA[to];
        return {
          id: `${from}_to_${to}`,
          fromKey: fromInfo.labelKey,
          toKey: toInfo.labelKey,
          conversion: { from: fromInfo.stat, to: toInfo.stat, percent: 10 },
          icon: toInfo.icon,
        };
      }),
  );

export default RUNES;
