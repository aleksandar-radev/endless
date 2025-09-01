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

const CONVERSION_RUNES = Object.keys(TYPE_DATA)
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
          icon: `${BASE}/icons/runes/${from}_to_${to}.svg`,
        };
      }),
  );

const UNIQUE_RUNES = [
  {
    id: 'skill_points',
    nameKey: 'rune.skillPoints.name',
    descKey: 'rune.skillPoints.desc',
    bonus: { skillPointsPerLevel: 1 },
    icon: `${BASE}/icons/star.svg`,
    unique: true,
  },
  {
    id: 'training_cost',
    nameKey: 'rune.trainingCost.name',
    descKey: 'rune.trainingCost.desc',
    bonus: { trainingCostReduction: 25 },
    icon: `${BASE}/icons/gold.svg`,
    unique: true,
  },
  {
    id: 'soul_shop_cost',
    nameKey: 'rune.soulShopCost.name',
    descKey: 'rune.soulShopCost.desc',
    bonus: { soulShopCostReduction: 25 },
    icon: `${BASE}/icons/soul.svg`,
    unique: true,
  },
  {
    id: 'arena_boss_skip',
    nameKey: 'rune.bossSkip.name',
    descKey: 'rune.bossSkip.desc',
    bonus: { arenaBossSkip: 1 },
    icon: `${BASE}/icons/skull.svg`,
    unique: true,
  },
  {
    id: 'crystal_gain',
    nameKey: 'rune.crystalGain.name',
    descKey: 'rune.crystalGain.desc',
    bonus: { crystalGainPercent: 100 },
    icon: `${BASE}/icons/crystal.svg`,
    unique: true,
  },
];

export const RUNES = [...CONVERSION_RUNES, ...UNIQUE_RUNES];

export default RUNES;
