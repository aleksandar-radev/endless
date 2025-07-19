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

// Setters for initialization in main.js
export async function setGlobals({ cloud = false, reset = false } = {}) {
  // setup data manager. version not set yet
  const _dataManager = new DataManager();
  _dataManager.startSessionMonitor();
  let savedData = await _dataManager.loadGame({ cloud });

  if (reset) {
    savedData = null;
  }

  const _game = new Game();
  const _hero = new Hero(savedData?.hero);
  const _inventory = new Inventory(savedData?.inventory);
  const _skillTree = new SkillTree(savedData?.skillTree);
  const _crystalShop = new CrystalShop(savedData?.crystalShop);
  const _training = new Training(savedData?.training);
  const _statistics = new Statistics(savedData?.statistics);
  const _quests = new QuestTracker(savedData?.quests);
  const _soulShop = new SoulShop(savedData?.soulShop);
  const _options = new Options(savedData?.options);
  const _buildings = await BuildingManager.create(savedData?.buildings);
  const _prestige = new Prestige(savedData?.prestige);

  game = _game;
  hero = _hero;
  inventory = _inventory;
  training = _training;
  skillTree = _skillTree;
  crystalShop = _crystalShop;
  statistics = _statistics;
  quests = _quests;
  soulShop = _soulShop;
  buildings = _buildings;
  options = _options;
  prestige = _prestige;
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
    dataManager,
  };
}
