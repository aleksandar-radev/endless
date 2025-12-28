import { tp } from '../../i18n.js';
const BASE = import.meta.env.VITE_BASE_PATH;
const PROGRESSION_ICONS = {
  level: `<img src="${BASE}/icons/experience-potion.svg" class="icon" alt="level"/>`,
  damage: `<img src="${BASE}/icons/strength-potion.svg" class="icon" alt="damage"/>`,
};
// Progression quests
export const PROGRESSION_QUESTS = [
  // Level
  {
    id: 'level_5',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 5 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 5 });
    },
    type: 'level',
    target: 5,
    reward: {
      gold: 200,
      crystals: 1,
      item: {
        rarity: 'rare', type: 'random', tier: 1,
      },
    },
  },
  {
    id: 'level_10',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 10 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 10 });
    },
    type: 'level',
    target: 10,
    reward: {
      gold: 500,
      crystals: 1,
      item: {
        rarity: 'rare', type: 'random', tier: 1,
      },
    },
  },
  {
    id: 'level_25',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 25 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 25 });
    },
    type: 'level',
    target: 25,
    reward: { gold: 1000, crystals: 1 },
  },
  {
    id: 'level_50',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 50 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 50 });
    },
    type: 'level',
    target: 50,
    reward: { gold: 2000, crystals: 2, bonuses: { vitality: 5 } },
  },
  {
    id: 'level_75',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 75 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 75 });
    },
    type: 'level',
    target: 75,
    reward: { gold: 5000, crystals: 2 },
  },
  {
    id: 'level_100',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 100 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 100 });
    },
    type: 'level',
    target: 100,
    reward: { gold: 10000, crystals: 3, bonuses: { allAttributes: 3 } },
  },
  {
    id: 'level_150',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 150 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 150 });
    },
    type: 'level',
    target: 150,
    reward: { gold: 20000, crystals: 5 },
  },
  {
    id: 'level_200',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 200 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 200 });
    },
    type: 'level',
    target: 200,
    reward: { gold: 40000, crystals: 8, bonuses: { allAttributesPercent: 0.01 } },
  },
  {
    id: 'level_300',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 300 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 300 });
    },
    type: 'level',
    target: 300,
    reward: { gold: 80000, crystals: 12 },
  },
  {
    id: 'level_500',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 500 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 500 });
    },
    type: 'level',
    target: 500,
    reward: { gold: 150000, crystals: 20, bonuses: { lifePercent: 0.02 } },
  },
  {
    id: 'level_750',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 750 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 750 });
    },
    type: 'level',
    target: 750,
    reward: { gold: 300000, crystals: 30 },
  },
  {
    id: 'level_1000',
    category: 'progression',
    get title() {
      return tp('Reach level {level}.', { level: 1000 });
    },
    get description() {
      return tp('Reach level {level}.', { level: 1000 });
    },
    type: 'level',
    target: 1000,
    reward: { gold: 600000, crystals: 50 },
  },
  // Damage
  {
    id: 'damage_1000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '1,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '1,000' });
    },
    type: 'damage',
    target: 1000,
    reward: { crystals: 1 },
  },
  {
    id: 'damage_10000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '10,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '10,000' });
    },
    type: 'damage',
    target: 10000,
    reward: { crystals: 2 },
  },
  {
    id: 'damage_100000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '100,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '100,000' });
    },
    type: 'damage',
    target: 100000,
    reward: { crystals: 3, bonuses: { critDamagePercent: 0.05 } },
  },
  {
    id: 'damage_1000000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '1,000,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '1,000,000' });
    },
    type: 'damage',
    target: 1000000,
    reward: { crystals: 5, bonuses: { damagePercent: 0.03 } },
  },
  {
    id: 'damage_5000000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '5,000,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '5,000,000' });
    },
    type: 'damage',
    target: 5000000,
    reward: { crystals: 8 },
  },
  {
    id: 'damage_10000000',
    category: 'progression',
    get title() {
      return tp('Deal {amount} damage in a single hit.', { amount: '10,000,000' });
    },
    get description() {
      return tp('Deal {amount} damage in a single hit.', { amount: '10,000,000' });
    },
    type: 'damage',
    target: 10000000,
    reward: { crystals: 12, bonuses: { attackSpeed: 0.1 } },
  },
].map((q) => {
  const quest = { icon: PROGRESSION_ICONS[q.type] };
  Object.defineProperties(quest, Object.getOwnPropertyDescriptors(q));
  return quest;
});
