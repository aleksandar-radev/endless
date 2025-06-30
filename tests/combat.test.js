import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as globals from '../src/globals.js';
import Game from '../src/game.js';
import Hero from '../src/hero.js';
import Enemy from '../src/enemy.js';
import Statistics from '../src/statistics.js';
import SkillTree from '../src/skillTree.js';
import CrystalShop from '../src/crystalShop.js';

// Mock all UI modules to avoid DOM requirements
vi.mock('../src/ui/ui.js', () => new Proxy({}, { get: () => vi.fn() }));
vi.mock('../src/ui/statsAndAttributesUi.js', () => ({ updateStatsAndAttributesUI: vi.fn() }));
vi.mock('../src/ui/questUi.js', () => ({ updateQuestsUI: vi.fn() }));
vi.mock('../src/ui/bossUi.js', () => ({ updateBossUI: vi.fn(), selectBoss: vi.fn() }));

vi.mock('../src/dataManager.js', () => ({ DataManager: class { saveGame() {} startSessionMonitor() {} loadGame() { return Promise.resolve(null); } } }));

describe('combat', () => {
  beforeEach(() => {
    globals.game = new Game();
    globals.hero = new Hero();
    globals.skillTree = new SkillTree();
    globals.statistics = new Statistics();
    globals.crystalShop = new CrystalShop();
    globals.inventory = {
      addMaterial: vi.fn(),
      createItem: vi.fn(() => ({})),
      addItemToInventory: vi.fn(),
      getRandomMaterial: vi.fn(() => ({ id: 'mat', icon: 'M', name: 'Mat' })),
    };
    globals.dataManager = { saveGame: vi.fn() };

    globals.game.currentRegionId = 'forest';
    globals.game.stage = 1;
    globals.game.currentEnemy = new Enemy(1);

    // ensure massive damage for instant kills
    globals.hero.stats.damage = 10000;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increments enemy kill count after defeating 10 enemies', async () => {
    for (let i = 0; i < 10; i++) {
      globals.game.damageEnemy(10000);
      await vi.advanceTimersByTimeAsync(600);
    }
    expect(globals.statistics.enemiesKilled.total).toBe(10);
  });
});
