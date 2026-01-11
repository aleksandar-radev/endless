import { ELEMENTS } from '../constants/common.js';

// Import translation modules
import common from './en/common.js';
import combat from './en/combat.js';
import training from './en/training.js';
import stats from './en/stats.js';
import skills from './en/skills.js';
import options from './en/options.js';
import inventory from './en/inventory.js';
import shops from './en/shops.js';
import buildings from './en/buildings.js';
import prestige from './en/prestige.js';
import quests from './en/quests.js';
import items from './en/items.js';
import classes from './en/classes.js';
import runes from './en/runes.js';
import { enemies } from './en/enemies.js';
import other from './en/other.js';
import ads from './en/ads.js';
import auth from './en/auth.js';

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
  ...auth,
};
