import {
  initializeSkillTreeUI,
  initializeUI,
  updateEnemyStats,
  updatePlayerLife,
  updateResources,
  updateStageUI,
  updateTabIndicators,
} from './ui/ui.js';
import { initDebugging } from './functions.js';
import {
  game,
  hero,
  crystalShop,
  statistics,
  setGlobals,
  soulShop,
  options,
  dataManager,
  buildings,
} from './globals.js';
import { initializeRegionSystem, updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { initializeBuildingsUI, renderPurchasedBuildings } from './ui/buildingUi.js';
import { initializePrestigeUI } from './ui/prestigeUi.js';
import Enemy from './enemy.js';
import { setupLeaderboardTabLazyLoad } from './ui/leaderboardUi.js';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;
window.log = console.log;

// Wrap initialization in an async IIFE to avoid top-level await error
(async () => {
  await setGlobals();

  game.stage = game.getStartingStage() || 1;
  game.currentEnemy = new Enemy(game.stage);

  initializeUI();
  crystalShop.initializeCrystalShopUI();
  soulShop.initializeSoulShopUI();
  statistics.initializeStatisticsUI();
  options.initializeOptionsUI();
  initializeSkillTreeUI();
  initializeBuildingsUI();
  initializePrestigeUI();

  updateResources();
  hero.recalculateFromAttributes();
  game.healPlayer(hero.stats.life);
  game.restoreMana(hero.stats.mana);

  updatePlayerLife();
  updateStatsAndAttributesUI();
  updateStageUI();
  updateEnemyStats();
  updateTabIndicators();

  initializeRegionSystem();
  updateRegionUI();

  setupLeaderboardTabLazyLoad();

  if (import.meta.env.VITE_ENV !== 'production') {
    initDebugging();
  }

  let isRunning = false;
  setInterval(() => {
    if (!isRunning) {
      isRunning = true;
      game.gameLoop();
      isRunning = false;
    }
  }, 100);

  setInterval(() => {
    statistics.update();
    dataManager.saveGame();
    // Refresh buildings tab periodically
    renderPurchasedBuildings();
  }, 60000);

  // Sidebar toggle logic for responsive sidebar
  (function () {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    function openSidebar() {
      sidebar.classList.add('sidebar-visible');
      backdrop.classList.add('sidebar-backdrop-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('sidebar-visible');
      backdrop.classList.remove('sidebar-backdrop-visible');
      document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openSidebar);
    backdrop.addEventListener('click', closeSidebar);

    // Optional: close sidebar on resize if > 1100px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1100) {
        closeSidebar();
      }
    });
  })();

  // Collect offline bonuses on load (show modal if any)
  buildings.collectBonuses({ showOfflineModal: true });

  // Periodically collect building bonuses (every 30 seconds, no modal)
  setInterval(async () => {
    await buildings.collectBonuses();
    updateResources();
    renderPurchasedBuildings();
  }, 30000);

  // Conditionally add footer if not production
  if (import.meta.env.VITE_ENV !== 'production') {
    const footer = document.createElement('footer');
    footer.style.display = 'flex';
    footer.style.flexDirection = 'column';
    footer.style.justifyContent = 'center';
    footer.style.alignItems = 'center';
    footer.style.height = '60px';
    footer.innerHTML = `
      <div>Full game on <a href="https://ghost-team.top">ghost-team.top</a></div>
      <div>In this test version, type <span style="color: #007bff; font-size: 1.4em">edev</span> anywhere in the browser to access developer options.</div>
    `;
    document.body.appendChild(footer);
  }
})();
