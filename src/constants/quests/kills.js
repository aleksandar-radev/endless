import { tp } from '../../i18n.js';
import { RARITY_KEYS } from '../items.js';
const BASE = import.meta.env.VITE_BASE_PATH;
// Kill quests
export const KILL_QUESTS = [
  {
    id: 'kill1_unique_reward',
    category: 'kills',
    get title() {
      return tp('quests.kills.firstBlood.title');
    },
    get description() {
      return tp('quests.kills.firstBlood.description');
    },
    type: 'kill',
    target: 1,
    reward: {
      gold: 150,
      item: {
        uniqueId: 'ribbonweave_vestments', rarity: RARITY_KEYS.UNIQUE, tier: 1, level: 1,
      },
      bonuses: { damagePercent: 1 },
    },
    icon: `<img src="${BASE}/icons/sword.png" alt="kills"/>`,
  },
  {
    id: 'kill10',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 10 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 10 });
    },
    type: 'kill',
    target: 10,
    reward: {
      gold: 500,
      crystals: 1,
      item: {
        rarity: 'rare', type: 'random', tier: 1,
      },
    },
    icon: `<img src="${BASE}/icons/sword.png" alt="kills"/>`,
  },
  {
    id: 'kill50',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 50 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 50 });
    },
    type: 'kill',
    target: 50,
    reward: {
      gold: 1500, crystals: 2, materials: [{ id: 'enchantment_scroll', qty: 1 }],
    },
    icon: `<img src="${BASE}/icons/sword.png" alt="kills"/>`,
  },
  {
    id: 'kill250',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 250 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 250 });
    },
    type: 'kill',
    target: 250,
    reward: {
      gold: 4000,
      item: {
        rarity: 'rare', type: 'random', tier: 1,
      },
      materials: [{ id: 'enchantment_scroll', qty: 2 }],
    },
    icon: `<img src="${BASE}/icons/strength-potion.svg" alt="crit"/>`,
  },
  {
    id: 'kill1000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 1000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 1000 });
    },
    type: 'kill',
    target: 1000,
    reward: {
      gold: 10000, crystals: 1, bonuses: { damagePercent: 1 }, materials: [{ id: 'enchantment_scroll', qty: 3 }],
    },
    icon: `<img src="${BASE}/icons/skull.svg" alt="skull"/>`,
  },
  {
    id: 'kill2500',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 2500 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 2500 });
    },
    type: 'kill',
    target: 2500,
    reward: {
      gold: 30000, crystals: 4, bonuses: { bonusGoldPercent: 2 },
    },
    icon: `<img src="${BASE}/icons/skull.svg" alt="skull"/>`,
  },
  {
    id: 'kill5000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 5000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 5000 });
    },
    type: 'kill',
    target: 5000,
    reward: {
      gold: 60000, crystals: 2, bonuses: { critChance: 1 }, materials: [{ id: 'enchantment_scroll', qty: 5 }],
    },
    icon: `<img src="${BASE}/icons/skull.svg" alt="skull"/>`,
  },
  {
    id: 'kill10000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 10000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 10000 });
    },
    type: 'kill',
    target: 10000,
    reward: {
      gold: 100000, crystals: 3, bonuses: { bonusExperiencePercent: 2 },
    },
    icon: `<img src="${BASE}/icons/skull.svg" alt="skull"/>`,
  },
  {
    id: 'kill25000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 25000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 25000 });
    },
    type: 'kill',
    target: 25000,
    reward: {
      gold: 200000, crystals: 5, bonuses: { life: 50 }, materials: [{ id: 'enchantment_scroll', qty: 10 }],
    },
    icon: `<img src="${BASE}/icons/earth.png" alt="earth"/>`,
  },
  {
    id: 'kill50000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 50000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 50000 });
    },
    type: 'kill',
    target: 50000,
    reward: {
      gold: 400000, crystals: 8, bonuses: { itemRarityPercent: 1 },
    },
    icon: `<img src="${BASE}/icons/earth.png" alt="earth"/>`,
  },
  {
    id: 'kill100000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 100000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 100000 });
    },
    type: 'kill',
    target: 100000,
    reward: {
      gold: 700000, crystals: 12, bonuses: { damagePercent: 2, strength: 10 },
    },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
  {
    id: 'kill250000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 250000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 250000 });
    },
    type: 'kill',
    target: 250000,
    reward: {
      gold: 2000000, crystals: 20, bonuses: { materialQuantityPercent: 3 },
    },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
  {
    id: 'kill500000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 500000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 500000 });
    },
    type: 'kill',
    target: 500000,
    reward: { gold: 6000000, crystals: 30 },
    icon: `<img src="${BASE}/icons/star.svg" alt="star"/>`,
  },
  {
    id: 'kill1000000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 1000000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 1000000 });
    },
    type: 'kill',
    target: 1000000,
    reward: { gold: 15000000, crystals: 50 },
    icon: `<img src="${BASE}/icons/star.svg" alt="star"/>`,
  },
  {
    id: 'kill2500000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 2500000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 2500000 });
    },
    type: 'kill',
    target: 2500000,
    reward: { gold: 25000000, crystals: 70 },
    icon: `<img src="${BASE}/icons/star.svg" alt="star"/>`,
  },
  {
    id: 'kill5000000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 5000000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 5000000 });
    },
    type: 'kill',
    target: 5000000,
    reward: { gold: 60000000, crystals: 100 },
    icon: `<img src="${BASE}/icons/star.svg" alt="star"/>`,
  },
  {
    id: 'kill10000000',
    category: 'kills',
    get title() {
      return tp('Defeat {count} enemies.', { count: 10000000 });
    },
    get description() {
      return tp('Defeat {count} enemies.', { count: 10000000 });
    },
    type: 'kill',
    target: 10000000,
    reward: { gold: 150000000, crystals: 200 },
    icon: `<img src="${BASE}/icons/star.svg" alt="orbit"/>`,
  },
];
