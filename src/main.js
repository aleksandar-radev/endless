import { initializeSkillTreeUI,
  initializeUI,
  switchTab,
  switchShopSubTab,
  updateEnemyStats,
  updatePlayerLife,
  updateResources,
  updateStageUI,
  switchJournalSubTab,
  updateTabIndicators } from './ui/ui.js';
import { switchSkillTreeTab } from './ui/skillTreeUi.js';
import { switchStatsSubTab } from './ui/statsAndAttributesUi.js';
import { initDebugging } from './functions.js';
import { game,
  hero,
  crystalShop,
  statistics,
  setGlobals,
  soulShop,
  options,
  dataManager,
  buildings,
  training,
  inventory } from './globals.js';
import { updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { initializeBuildingsUI, renderPurchasedBuildings } from './ui/buildingUi.js';
import { initializePrestigeUI } from './ui/prestigeUi.js';
import { initializeBattleLogUI } from './ui/battleLogUi.js';
import { initializeAscensionUI } from './ui/ascensionUi.js';
import { initializeRunesUI } from './ui/runesUi.js';
import Enemy from './enemy.js';
import Boss from './boss.js';
import { RockyFieldEnemy } from './rockyField.js';
import { applyTranslations, setLanguage, t } from './i18n.js';
import { getGameInfo } from './api.js';
import { createModal, closeModal } from './ui/modal.js';
import { collectOfflineFightRewards } from './offlineFight.js';
import { ensureDevAccessRuntimeState } from './migrations/0.8.15.js';
import { initializeInventoryUI } from './ui/inventoryUi.js';
import { performanceMonitor } from './performanceMonitor.js';
import { navigationManager } from './utils/navigationManager.js';
import { registerSW } from 'virtual:pwa-register';
import './css/performanceMonitor.css';

window.qwe = console.log;
window.qw = console.log;
window.qq = console.log;
window.q = console.log;
window.log = console.log;
window.setLanguage = setLanguage;

const updatePwaServiceWorker = registerSW({
  immediate: true,
  onNeedRefresh() {
    updatePwaServiceWorker(true);
  },
});

// Wrap initialization in an async IIFE to avoid top-level await error
(async () => {
  await setGlobals();
  setLanguage(options.language);

  // Enable performance monitoring (after options are loaded)
  performanceMonitor.enable();
  window.perfMon = performanceMonitor;
  console.log('💡 Performance monitoring enabled! Use window.perfMon in console for controls.');

  // Enable visual overlay if option is set
  if (options.showPerformanceMonitor) {
    performanceMonitor.enableVisual();
  }

  const { active: devAccessActive, changed: devAccessChanged } = ensureDevAccessRuntimeState(options);

  if (devAccessChanged) {
    dataManager.saveGame();
  }

  const shouldEnableDebugging = devAccessActive || import.meta.env.VITE_ENV !== 'production';

  // Only set stage if not loaded from save data (undefined or null)
  if (!game.stage || game.stage == null) {
    game.stage = game.getStartingStage() || 1;
  }

  if (!game.rockyFieldStage || game.rockyFieldStage == null) {
    game.rockyFieldStage = 1;
  }

  if (!game.rockyFieldHighestStage || game.rockyFieldHighestStage < game.rockyFieldStage) {
    game.rockyFieldHighestStage = game.rockyFieldStage;
  }

  const rockyFieldRegion = game.rockyFieldRegion || 'outskirts';
  const recordedRegionalHighest = statistics.get('rockyFieldHighestStages', rockyFieldRegion);
  const regionStageFloor = Math.max(game.rockyFieldStage || 1, 1);
  if (recordedRegionalHighest < regionStageFloor) {
    statistics.set('rockyFieldHighestStages', rockyFieldRegion, regionStageFloor);
  }

  if (game.fightMode === 'explore') {
    game.currentEnemy = new Enemy(game.stage);
  } else if (game.fightMode === 'arena') {
    game.currentEnemy = new Boss();
  } else if (game.fightMode === 'rockyField') {
    game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
  }

  initializeUI();
  crystalShop.initializeCrystalShopUI();
  soulShop.initializeSoulShopUI();
  options.initializeOptionsUI();
  training.initializeTrainingUI();
  initializeSkillTreeUI();
  initializeBuildingsUI();
  initializePrestigeUI();
  initializeAscensionUI();
  initializeBattleLogUI();
  initializeRunesUI();
  initializeInventoryUI(inventory);

  // Apply translations after UI components are initialized
  applyTranslations();

  // Poll remote game info (version) every 10 seconds and notify player if a newer version exists
  (function setupVersionPolling() {
    let notified = false; // avoid spamming the player with multiple modals
    let lastSeenServerVersion = null;

    const compareVersions = (a, b) => {
      const pa = String(a).split('.').map(Number);
      const pb = String(b).split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
      }
      return 0;
    };

    async function checkOnce() {
      try {
        const info = await getGameInfo();
        const serverVersion = info?.version;
        const localVersion = options?.version;
        window.q(`Local version: ${localVersion}, server version: ${serverVersion}`);
        if (!serverVersion || !localVersion) return;

        // If server version changed since last check, clear notified flag so user gets a modal for a new release
        if (lastSeenServerVersion && serverVersion !== lastSeenServerVersion) {
          notified = false;
        }
        lastSeenServerVersion = serverVersion;

        if (!notified && compareVersions(serverVersion, localVersion) > 0) {
          notified = true;
          const isDesktopApp = navigator.userAgent.includes('Electron');
          const promptKey = isDesktopApp ? 'versionModal.desktopPrompt' : 'versionModal.refreshPrompt';
          const actionKey = isDesktopApp ? 'versionModal.closeApp' : 'versionModal.refreshNow';
          const contentHtml = `
            <div class="modal-content">
              <span class="modal-close">&times;</span>
              <h2>${t('versionModal.title')}</h2>
              <p>${t('versionModal.serverVersion')}: ${serverVersion} &nbsp; — &nbsp; ${t('versionModal.yourVersion')}: v${localVersion}</p>
              ${t(promptKey)}<div style="text-align:center; margin-top: 24px; display:flex; gap:12px; justify-content:center;">
                    <button id="new-version-modal-action" style="padding: 8px 24px; font-size: 1.1em;">${t(actionKey)}</button>
                    <button id="new-version-modal-ok" style="padding: 8px 24px; font-size: 1.1em;">${t('versionModal.ok')}</button>
                  </div>
            </div>
          `;
          createModal({
            id: 'new-version-modal',
            className: 'new-version-modal',
            content: contentHtml,
            onClose: () => {},
          });
          setTimeout(() => {
            const okBtn = document.getElementById('new-version-modal-ok');
            const actionBtn = document.getElementById('new-version-modal-action');
            if (okBtn)
              okBtn.addEventListener('click', () => {
                const modal = document.getElementById('new-version-modal');
                if (modal) modal.remove();
              });
            if (actionBtn)
              actionBtn.addEventListener('click', () => {
                if (isDesktopApp) {
                  try {
                    window.close();
                  } catch (e) {
                    // ignore; user can close manually
                  }
                } else {
                  // Try to perform a normal reload; this will refresh the page and pick up the new version
                  try {
                    window.location.reload();
                  } catch (e) {
                    // Fallback: set href to force navigation
                    window.location.href = window.location.href;
                  }
                }
              });
          }, 0);
        }
      } catch (e) {
        // ignore network/errors silently
      }
    }

    // schedule first check after 1 hour, then poll every 1 hour
    const versionCheckInterval = 60 * 60 * 1000;
    window.q('Starting version check interval...');
    setTimeout(() => {
      window.q('Checking for game updates...');

      // then run every hour
      setInterval(checkOnce, versionCheckInterval);
    }, versionCheckInterval);
  })();

  updateResources();
  hero._recalcScheduled = false;
  hero.queueRecalculateFromAttributes();
  game.healPlayer(hero.stats.life);
  game.restoreMana(hero.stats.mana);

  updatePlayerLife();
  // Preserve offline rates before any UI initialization that might reset them
  statistics.preserveOfflineRates = true;
  updateStatsAndAttributesUI();
  updateStageUI();
  updateEnemyStats();
  updateTabIndicators();

  updateRegionUI();

  // Initialize navigation manager
  navigationManager.init({
    switchTab,
    switchShopSubTab,
    switchSkillTreeTab,
    switchJournalSubTab,
    switchStatsSubTab,
    switchOptionsSubTab: (subTab, opts) => options.switchOptionsSubTab(subTab, opts),
    closeModal,
  });

  if (game.activeTab === 'battle' && window.innerWidth > 1200) {
    game.activeTab = 'stats';
  }

  // Try to sync from URL, otherwise fallback to saved activeTab
  navigationManager.syncFromUrl();
  if (!navigationManager.currentTab) {
    switchTab(game.activeTab);
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

    // Close sidebar when a tab is clicked (mobile/dialog mode)
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 1200) {
          // Match the media query breakpoint for sidebar visibility
          closeSidebar();
        }
      });
    });

    // Optional: close sidebar on resize if > 1200px
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1200) {
        closeSidebar();
      }
    });
  })();

  // Collect offline bonuses after the game has rendered.
  // This prevents a slow trusted-time API call from blocking startup.
  setTimeout(() => {
    (async () => {
      const fightRewards = await collectOfflineFightRewards();
      await buildings.collectBonuses({
        showOfflineModal: true,
        extraBonuses: fightRewards?.bonuses || [],
        offlineTime: fightRewards?.timeInfo,
        xpLevelsGained: fightRewards?.levelsGained,
        extraCollectFn: async () => {
          if (fightRewards?.apply) await fightRewards.apply();
          // Clear the preserve flag after offline rewards have been applied
          statistics.preserveOfflineRates = false;
        },
      });
    })().catch((e) => {
      console.warn('Offline bonus collection failed:', e);
    });
  }, 1000);

  // Safety: ensure preserve flag is cleared even if collection didn't happen
  statistics.preserveOfflineRates = false;

  // Keep combat activity timestamp up to date while the game is open
  setInterval(() => {
    const nowLocal = Date.now();
    statistics.lastFightActive = nowLocal;
    statistics.lastFightActiveLocal = nowLocal;
  }, 1000);

  // Periodically collect building bonuses (every 30 seconds, no modal)
  setInterval(async () => {
    await buildings.collectBonuses();
    updateResources();
    renderPurchasedBuildings();
  }, 30000);

  if (shouldEnableDebugging) {
    initDebugging();
  }
})();
