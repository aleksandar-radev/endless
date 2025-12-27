import { tp } from '../../i18n.js';
const BASE = import.meta.env.VITE_BASE_PATH;
const DROP_ICONS = {
  item_drop: `<img src="${BASE}/icons/armor.svg" class="icon" alt="item drop"/>`,
  material_drop: `<img src="${BASE}/icons/armor-upgrade-stone.svg" class="icon" alt="material drop"/>`,
};
// Item and material drop quests
export const DROP_QUESTS = [
  // Item Drop Quests
  {
    id: 'itemdrop_5',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 5 });
    },
    get description() {
      return tp('Find {count} items.', { count: 5 });
    },
    type: 'item_drop',
    target: 5,
    reward: { item: { rarity: 'rare', type: 'random', tier: 2 } },
  },
  {
    id: 'itemdrop_25',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 25 });
    },
    get description() {
      return tp('Find {count} items.', { count: 25 });
    },
    type: 'item_drop',
    target: 25,
    reward: { item: { rarity: 'epic', type: 'random', tier: 2 } },
  },
  {
    id: 'itemdrop_60',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 60 });
    },
    get description() {
      return tp('Find {count} items.', { count: 60 });
    },
    type: 'item_drop',
    target: 60,
    reward: { item: { rarity: 'epic', type: 'random', tier: 3 } },
  },
  {
    id: 'itemdrop_150',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 150 });
    },
    get description() {
      return tp('Find {count} items.', { count: 150 });
    },
    type: 'item_drop',
    target: 150,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
  },
  {
    id: 'itemdrop_300',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 300 });
    },
    get description() {
      return tp('Find {count} items.', { count: 300 });
    },
    type: 'item_drop',
    target: 300,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 4 } },
  },
  {
    id: 'itemdrop_750',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: 750 });
    },
    get description() {
      return tp('Find {count} items.', { count: 750 });
    },
    type: 'item_drop',
    target: 750,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 5 } },
  },
  {
    id: 'itemdrop_1500',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: '1,500' });
    },
    get description() {
      return tp('Find {count} items.', { count: '1,500' });
    },
    type: 'item_drop',
    target: 1500,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 5 } },
  },
  {
    id: 'itemdrop_3000',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: '3,000' });
    },
    get description() {
      return tp('Find {count} items.', { count: '3,000' });
    },
    type: 'item_drop',
    target: 3000,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 6 } },
  },
  {
    id: 'itemdrop_6000',
    category: 'drops',
    get title() {
      return tp('Find {count} items.', { count: '6,000' });
    },
    get description() {
      return tp('Find {count} items.', { count: '6,000' });
    },
    type: 'item_drop',
    target: 6000,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 7 } },
  },
  // Material Drop Quests
  {
    id: 'matdrop_5',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 5 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 5 });
    },
    type: 'material_drop',
    target: 5,
    reward: { item: { rarity: 'rare', type: 'random', tier: 1 } },
  },
  {
    id: 'matdrop_25',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 25 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 25 });
    },
    type: 'material_drop',
    target: 25,
    reward: { item: { rarity: 'epic', type: 'random', tier: 1 } },
  },
  {
    id: 'matdrop_60',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 60 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 60 });
    },
    type: 'material_drop',
    target: 60,
    reward: { item: { rarity: 'epic', type: 'random', tier: 2 } },
  },
  {
    id: 'matdrop_150',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 150 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 150 });
    },
    type: 'material_drop',
    target: 150,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
  },
  {
    id: 'matdrop_300',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 300 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 300 });
    },
    type: 'material_drop',
    target: 300,
    reward: { item: { rarity: 'legendary', type: 'random', tier: 3 } },
  },
  {
    id: 'matdrop_750',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: 750 });
    },
    get description() {
      return tp('Collect {count} materials.', { count: 750 });
    },
    type: 'material_drop',
    target: 750,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 3 } },
  },
  {
    id: 'matdrop_1500',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: '1,500' });
    },
    get description() {
      return tp('Collect {count} materials.', { count: '1,500' });
    },
    type: 'material_drop',
    target: 1500,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 4 } },
  },
  {
    id: 'matdrop_3000',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: '3,000' });
    },
    get description() {
      return tp('Collect {count} materials.', { count: '3,000' });
    },
    type: 'material_drop',
    target: 3000,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 5 } },
  },
  {
    id: 'matdrop_6000',
    category: 'drops',
    get title() {
      return tp('Collect {count} materials.', { count: '6,000' });
    },
    get description() {
      return tp('Collect {count} materials.', { count: '6,000' });
    },
    type: 'material_drop',
    target: 6000,
    reward: { item: { rarity: 'mythic', type: 'random', tier: 6 } },
  },
].map((q) => {
  const quest = { icon: DROP_ICONS[q.type] };
  Object.defineProperties(quest, Object.getOwnPropertyDescriptors(q));
  return quest;
});
