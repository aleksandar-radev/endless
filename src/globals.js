import CrystalShop from './crystalShop.js';
import { DataManager } from './dataManager.js';
import Game from './game.js';
import Hero from './hero.js';
import Inventory from './inventory.js';
import { Options } from './options.js';
import QuestTracker from './quest.js';
import SkillTree from './skillTree.js';
import SoulShop from './soulShop.js';
import Statistics from './statistics.js';
import Training from './training.js';
import { BuildingManager } from './building.js';
import Prestige from './prestige.js';
import Ascension from './ascension.js';
import Runes from './runes.js';

// Global singletons for the game
export let game = null;
export let hero = null;
export let inventory = null;
export let training = null;
export let skillTree = null;
export let crystalShop = null;
export let statistics = null;
export let quests = null;
export let soulShop = null;
export let options = null;
export let dataManager = null;
export let buildings = null;
export let prestige = null;
export let ascension = null;
export let runes = null;

// Runtime state that persists during resets
export const runtime = {
  prestigeInProgress: false,
};

// Setters for initialization in main.js
export async function setGlobals({ cloud = false, reset = false } = {}) {
  // setup data manager. version not set yet
  const _dataManager = new DataManager();
  _dataManager.startSessionMonitor();
  let savedData = await _dataManager.loadGame({ cloud });

  if (reset) {
    savedData = null;
  }

  const _options = new Options(savedData?.options);
  options = _options;
  const _game = new Game(savedData?.game);
  game = _game;
  const _hero = new Hero(savedData?.hero);
  hero = _hero;
  const _inventory = new Inventory(savedData?.inventory);
  const _skillTree = new SkillTree(savedData?.skillTree);
  const _crystalShop = new CrystalShop(savedData?.crystalShop);
  const _training = new Training(savedData?.training);
  const _statistics = new Statistics(savedData?.statistics);
  _statistics.heroLevel = _hero.level;
  const _quests = new QuestTracker(savedData?.quests);
  const _soulShop = new SoulShop(savedData?.soulShop);
  const _buildings = await BuildingManager.create(savedData?.buildings);
  const _prestige = new Prestige(savedData?.prestige);
  const _ascension = new Ascension(savedData?.ascension);
  const _runes = new Runes(savedData?.runes);

  inventory = _inventory;
  training = _training;
  skillTree = _skillTree;
  crystalShop = _crystalShop;
  statistics = _statistics;
  quests = _quests;
  soulShop = _soulShop;
  buildings = _buildings;
  prestige = _prestige;
  ascension = _ascension;
  runes = _runes;
  dataManager = _dataManager;

  // useful when loading from cloud
  dataManager.saveGame();
}

export function getGlobals() {
  return {
    game,
    hero,
    inventory,
    training,
    skillTree,
    crystalShop,
    statistics,
    quests,
    soulShop,
    buildings,
    options,
    prestige,
    ascension,
    runes,
    dataManager,
  };
}
