import { ELEMENTS } from './common.js';

const BASE = import.meta.env.VITE_BASE_PATH;

export const MIN_CONVERSION_PERCENT = 10;
export const MAX_CONVERSION_PERCENT = 150;
export const RESOURCE_CONVERSION_MAX_PERCENT = 80;

const TYPE_STYLES = {
  damage: {
    abbr: 'DM', color: '#f2b94b', text: '#241b02',
  },
  life: {
    abbr: 'HP', color: '#d54b4b', text: '#240000',
  },
  mana: {
    abbr: 'MP', color: '#3c73f0', text: '#01153a',
  },
  armor: {
    abbr: 'AR', color: '#9fa6b2', text: '#111417',
  },
  attackRating: {
    abbr: 'AK', color: '#f4d35e', text: '#352400',
  },
  evasion: {
    abbr: 'EV', color: '#2ecc71', text: '#00240f',
  },
  lifeRegen: {
    abbr: 'RG', color: '#1fab5c', text: '#001b0b',
  },
  fireResistance: {
    abbr: 'FR', color: '#ff7a3a', text: '#2a0c00',
  },
  coldResistance: {
    abbr: 'CR', color: '#59a3ff', text: '#001a3d',
  },
  airResistance: {
    abbr: 'AI', color: '#a87bff', text: '#1d0040',
  },
  earthResistance: {
    abbr: 'ER', color: '#c18f58', text: '#271200',
  },
  lightningResistance: {
    abbr: 'LG', color: '#f6d55c', text: '#352200',
  },
  waterResistance: {
    abbr: 'WT', color: '#4fb3bf', text: '#001d1f',
  },
  allResistance: {
    abbr: 'AL', color: '#8681ff', text: '#0a063d',
  },
};

const getTypeStyle = (key) => {
  const fallbackColor = '#7f8c8d';
  return {
    abbr: TYPE_STYLES[key]?.abbr || key.slice(0, 2).toUpperCase(),
    color: TYPE_STYLES[key]?.color || fallbackColor,
    text: TYPE_STYLES[key]?.text || '#ffffff',
  };
};

const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const createConversionIcon = (fromKey, toKey) => {
  const fromStyle = getTypeStyle(fromKey);
  const toStyle = getTypeStyle(toKey);
  const arrowColor = '#f4f6fb';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#11131e" stroke="#2b3045" stroke-width="3"/>
      <circle cx="20" cy="24" r="14" fill="${fromStyle.color}" fill-opacity="0.94" stroke="#090a0f" stroke-width="2"/>
      <circle cx="44" cy="40" r="14" fill="${toStyle.color}" fill-opacity="0.94" stroke="#090a0f" stroke-width="2"/>
      <path d="M28 32H38" stroke="${arrowColor}" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 24L48 32L38 40Z" fill="${arrowColor}" fill-opacity="0.92"/>
      <text x="20" y="24" font-family="'Rubik', 'Roboto', 'Segoe UI', sans-serif" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="${fromStyle.text}">${fromStyle.abbr}</text>
      <text x="44" y="40" font-family="'Rubik', 'Roboto', 'Segoe UI', sans-serif" font-size="12" font-weight="800" text-anchor="middle" dominant-baseline="middle" fill="${toStyle.text}">${toStyle.abbr}</text>
    </svg>
  `;
  return encodeSvg(svg);
};

const TYPE_DATA = {
  damage: {
    stat: 'damage',
    labelKey: 'damage',
    icon: `${BASE}/icons/sword.svg`,
  },
  life: {
    stat: 'life',
    labelKey: 'life',
    icon: `${BASE}/icons/vitality-potion.svg`,
  },
  mana: {
    stat: 'mana',
    labelKey: 'mana',
    icon: `${BASE}/icons/wisdom-potion.svg`,
  },
  armor: {
    stat: 'armor',
    labelKey: 'armor',
    icon: `${BASE}/icons/armor.svg`,
  },
  attackRating: {
    stat: 'attackRating',
    labelKey: 'attackRating',
    icon: `${BASE}/icons/sword.svg`,
  },
  evasion: {
    stat: 'evasion',
    labelKey: 'evasion',
    icon: `${BASE}/icons/boots.svg`,
  },
  lifeRegen: {
    stat: 'lifeRegen',
    labelKey: 'lifeRegen',
    icon: `${BASE}/icons/endurance-potion.svg`,
  },
  fireResistance: {
    stat: 'fireResistance',
    labelKey: 'fireResistance',
    icon: `${BASE}/icons/fire.png`,
  },
  coldResistance: {
    stat: 'coldResistance',
    labelKey: 'coldResistance',
    icon: `${BASE}/icons/cold.png`,
  },
  airResistance: {
    stat: 'airResistance',
    labelKey: 'airResistance',
    icon: `${BASE}/icons/air.png`,
  },
  earthResistance: {
    stat: 'earthResistance',
    labelKey: 'earthResistance',
    icon: `${BASE}/icons/earth.png`,
  },
  lightningResistance: {
    stat: 'lightningResistance',
    labelKey: 'lightningResistance',
    icon: `${BASE}/icons/lightning.png`,
  },
  waterResistance: {
    stat: 'waterResistance',
    labelKey: 'waterResistance',
    icon: `${BASE}/icons/water.png`,
  },
  allResistance: {
    stat: 'allResistance',
    labelKey: 'allResistance',
    icon: `${BASE}/icons/shield.svg`,
  },
};

Object.values(ELEMENTS).forEach(({ id }) => {
  TYPE_DATA[id] = {
    stat: `${id}Damage`,
    labelKey: `${id}Damage`,
    icon: `${BASE}/icons/${id}.png`,
  };
});

const hasElementalIcon = (key) => key === 'damage' || Object.prototype.hasOwnProperty.call(ELEMENTS, key);

const getConversionMaxPercent = (fromKey) => {
  if (fromKey === 'life' || fromKey === 'mana') {
    return RESOURCE_CONVERSION_MAX_PERCENT;
  }
  return MAX_CONVERSION_PERCENT;
};

const CONVERSION_RUNES = Object.keys(TYPE_DATA).flatMap((from) =>
  Object.keys(TYPE_DATA)
    .filter((to) => to !== from)
    .map((to) => {
      const fromInfo = TYPE_DATA[from];
      const toInfo = TYPE_DATA[to];
      const hasPairIcon = hasElementalIcon(from) && hasElementalIcon(to);
      const maxPercent = getConversionMaxPercent(from);
      return {
        id: `${from}_to_${to}`,
        fromKey: fromInfo.labelKey,
        toKey: toInfo.labelKey,
        conversion: {
          from: fromInfo.stat,
          to: toInfo.stat,
          percent: MIN_CONVERSION_PERCENT,
          ...(maxPercent !== MAX_CONVERSION_PERCENT ? { maxPercent } : {}),
        },
        icon: hasPairIcon ? `${BASE}/icons/runes/${from}_to_${to}.svg` : createConversionIcon(from, to),
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
    bonus: { trainingCostReduction: 0.25 },
    icon: `${BASE}/icons/gold.svg`,
    unique: true,
  },
  {
    id: 'soul_shop_cost',
    nameKey: 'rune.soulShopCost.name',
    descKey: 'rune.soulShopCost.desc',
    bonus: { soulShopCostReduction: 0.25 },
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
    bonus: { crystalGainPercent: 1 },
    icon: `${BASE}/icons/crystal.svg`,
    unique: true,
  },
];

export const RUNES = [...CONVERSION_RUNES, ...UNIQUE_RUNES];

export default RUNES;
