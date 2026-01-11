import { ELEMENTS } from '../constants/common.js';

// Import translation modules
import common from './zh/common.js';
import combat from './zh/combat.js';
import training from './zh/training.js';
import stats from './zh/stats.js';
import skills from './zh/skills.js';
import options from './zh/options.js';
import inventory from './zh/inventory.js';
import shops from './zh/shops.js';
import buildings from './zh/buildings.js';
import prestige from './zh/prestige.js';
import quests from './zh/quests.js';
import items from './zh/items.js';
import classes from './zh/classes.js';
import runes from './zh/runes.js';
import { enemies } from './zh/enemies.js';
import other from './zh/other.js';
import ads from './zh/ads.js';

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
  ...enemies,
  ...other,
  ...ads,
};
