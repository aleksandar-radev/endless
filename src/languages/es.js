import { ELEMENTS } from '../constants/common.js';

// Import translation modules
import common from './es/common.js';
import combat from './es/combat.js';
import training from './es/training.js';
import stats from './es/stats.js';
import skills from './es/skills.js';
import options from './es/options.js';
import inventory from './es/inventory.js';
import shops from './es/shops.js';
import buildings from './es/buildings.js';
import prestige from './es/prestige.js';
import quests from './es/quests.js';
import items from './es/items.js';
import classes from './es/classes.js';
import runes from './es/runes.js';
import other from './es/other.js';

// Combine all translation modules
export default {
  ...common,
  ...combat,
  ...training,
  ...stats,
  ...skills,
  ...options,
  ...inventory,
  ...shops,
  ...buildings,
  ...prestige,
  ...quests,
  ...items,
  ...classes,
  ...runes,
  ...other,
};
