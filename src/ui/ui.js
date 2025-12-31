import Enemy from '../enemy.js';
import { ROCKY_FIELD_REGIONS, RockyFieldEnemy, getRockyFieldEnemies } from '../rockyField.js';
import { formatNamedType, formatStatName as formatStatNameBase } from '../format.js';
import { formatNumber as formatNumberInternal } from '../utils/numberFormatter.js';
import { game,
  hero,
  skillTree,
  quests,
  statistics,
  inventory,
  dataManager,
  options,
  crystalShop,
  training,
  soulShop } from '../globals.js';
import { AILMENTS } from '../constants/ailments.js';
import { t, tp } from '../i18n.js';
import { updateQuestsUI } from './questUi.js';
import { updateStatsAndAttributesUI } from './statsAndAttributesUi.js';
import { updateBuildingAffordability } from './buildingUi.js';
import { TabIndicatorManager } from './tabIndicatorManager.js';
import { initializeBossRegionUI, selectBoss, updateBossUI, updateBossRegionSelector } from './bossUi.js';
import { ELEMENTS, BREAKPOINTS, IS_MOBILE_OR_TABLET } from '../constants/common.js';
import { updateRegionUI, updateRegionSelectorButton } from '../region.js';
import { calculateArmorReduction,
  calculateEvasionChance,
  calculateHitChance,
  calculateResistanceReduction } from '../combat.js';
import { renderRunesUI } from './runesUi.js';
import { createModal, closeModal } from './modal.js';

export function initializeShopUI() {
  document.querySelectorAll('.shop-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchShopSubTab(btn.dataset.shopTab));
  });
}

export function switchShopSubTab(subTabName) {
  document.querySelectorAll('.shop-tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.shop-tab-btn').forEach((btn) => btn.classList.remove('active'));

  const tabElement = document.getElementById(subTabName);
  if (tabElement) {
    tabElement.classList.add('active');
  }

  const tabBtn = document.querySelector(`.shop-tab-btn[data-shop-tab="${subTabName}"]`);
  if (tabBtn) {
    tabBtn.classList.add('active');
  }

  // Update specific shop UI if needed
  if (subTabName === 'training') {
    if (training) {
      training.updateTrainingAffordability('gold-upgrades');
      training.updateTrainingAffordability('crystal-upgrades');
    }
  }

  if (subTabName === 'soulShop') {
    if (soulShop) {
      soulShop.updateSoulShopAffordability();
    }
  }

  if (subTabName === 'buildings') {
    // Update building purchase affordabilities when switching to Buildings subtab
    try {
      updateBuildingAffordability();
    } catch (e) {
      console.warn('Failed to update building affordability:', e);
    }
  }
}

export {
  initializeSkillTreeUI,
  initializeSkillTreeStructure,
  updateSkillTreeValues,
  updateActionBar,
  updateBuffIndicators,
  showLifeWarning,
  showManaWarning,
} from './skillTreeUi.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);

// Tab indicator manager instance
let tabIndicatorManager = null;
let autoClaiming = false;

const html = String.raw;
const BASE = import.meta.env.VITE_BASE_PATH;

// Format numbers with thousands separators or shorthand notation.
// When options.shortNumbers is enabled, large numbers are abbreviated
// using suffixes (e.g., 1.2M for 1,200,000). Otherwise, a thousands
// separator (default comma) is applied to the integer part.
export function formatNumber(value, separator = ',') {
  return formatNumberInternal(value, options?.shortNumbers, separator);
}

export function initializeUI() {
  // Initialize tab indicator manager
  tabIndicatorManager = new TabIndicatorManager();

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  initializeShopUI();
  document.getElementById('start-btn').addEventListener('click', () => toggleGame());

  // Add tooltips to resource icons
  const resourceTooltips = [
    {
      selector: '.resource-gold',
      tooltip: () => html`
        <div class="tooltip-header">
          ${t('resource.gold.name')} <img src="${BASE}/icons/gold.svg" class="icon" alt="${t('resource.gold.name')}" />
        </div>
        <div class="tooltip-desc">${t('resource.gold.desc')}</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-crystal',
      tooltip: () => html`
        <div class="tooltip-header">
          ${t('resource.crystal.name')}
          <img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}" />
        </div>
        <div class="tooltip-desc">${t('resource.crystal.desc')}</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-souls',
      tooltip: () => html`
        <div class="tooltip-header">
          ${t('resource.souls.name')}
          <img src="${BASE}/icons/soul.svg" class="icon" alt="${t('resource.souls.name')}" />
        </div>
        <div class="tooltip-desc">${t('resource.souls.desc')}</div>
        <div class="tooltip-note"></div>
      `,
    },
  ];
  resourceTooltips.forEach(({ selector, tooltip }) => {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('tooltip-target');
      el.addEventListener('mouseenter', (e) => showTooltip(tooltip(), e));
      el.addEventListener('mousemove', positionTooltip);
      el.addEventListener('mouseleave', hideTooltip);
    }
  });

  updateStageUI();
  updateQuestsUI();

  // Setup combat mode dropdown
  const combatModeSelect = document.getElementById('combat-mode-select');
  if (combatModeSelect) {
    combatModeSelect.value = game.fightMode;
    combatModeSelect.addEventListener('change', () => {
      const region = combatModeSelect.value;
      if (game.fightMode === region) return;
      if (game.gameStarted) {
        toggleGame();
      }
      game.fightMode = region;
      if (game.fightMode === 'explore') {
        game.currentEnemy = new Enemy(game.stage);
      } else if (game.fightMode === 'arena') {
        selectBoss();
      } else if (game.fightMode === 'rockyField') {
        game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
      }
      renderRegionPanel(region);
      updateStatsAndAttributesUI();
      updateStageUI();
      updateCombatRegionDropdownVisibility();
    });
  }

  // Render initial region panel
  renderRegionPanel(game.fightMode);
  updateCombatRegionDropdownVisibility();

  // Add offline eligibility indicator and save status
  try {
    const statusGroup = document.querySelector('.session-status-group');
    if (statusGroup && !statusGroup.querySelector('.offline-eligibility-indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'offline-eligibility-indicator offline-not-eligible tooltip-target';
      indicator.innerHTML = '<span class="icon">✖</span>';
      statusGroup.appendChild(indicator);

      const ensureBaseline = () => {
        if (statistics.offlineEligibilityStart == null) {
          statistics.offlineEligibilityStart = statistics.totalTimeInFights || 0;
        }
      };

      const updateIndicator = () => {
        ensureBaseline();
        const baseline = statistics.offlineEligibilityStart || 0;
        const elapsed = (statistics.totalTimeInFights || 0) - baseline;
        const eligible = elapsed >= 60;
        const iconEl = indicator.querySelector('.icon');
        if (iconEl) iconEl.textContent = eligible ? '✔' : '✖';
        indicator.classList.toggle('offline-eligible', eligible);
        indicator.classList.toggle('offline-not-eligible', !eligible);
      };

      const tooltip = () => {
        const eligible = indicator.classList.contains('offline-eligible');
        const tooltipDescription = eligible
          ? t('counters.offline.tooltipEligible')
          : t('counters.offline.tooltipNotEligible');
        return html`
          <div class="tooltip-header">${t('counters.offlineProgress')}</div>
          <div class="tooltip-desc">${tooltipDescription}</div>
          <div class="tooltip-note">${t('counters.offline.tooltipCondition')}</div>
        `;
      };
      indicator.addEventListener('mouseenter', (e) => showTooltip(tooltip(), e));
      indicator.addEventListener('mousemove', positionTooltip);
      indicator.addEventListener('mouseleave', hideTooltip);

      // Baseline for session eligibility (independent from counters reset)
      ensureBaseline();
      updateIndicator();

      // Update icon/color every second
      setInterval(updateIndicator, 1000);

      document.addEventListener('resetRateCounters', () => {
        statistics.offlineEligibilityStart = statistics.totalTimeInFights || 0;
        updateIndicator();
      });

      const saveIndicator = document.createElement('span');
      saveIndicator.className = 'save-status-indicator';
      saveIndicator.innerHTML = '<span class="icon">💾</span><span class="label"></span>';
      statusGroup.appendChild(saveIndicator);

      const saveLabel = saveIndicator.querySelector('.label');
      let lastSaveTimestamp = dataManager?.lastLocalSaveAt || 0;
      let savePulseTimeout = null;

      const formatRelativeSaveTime = () => {
        if (!lastSaveTimestamp) return t('time.pending');
        const diff = Date.now() - lastSaveTimestamp;
        if (diff < 5000) return t('time.justNow');
        if (diff < 60000) {
          const seconds = Math.floor(diff / 1000);
          return tp('time.secondsAgo', { count: seconds });
        }
        if (diff < 3600000) {
          const minutes = Math.floor(diff / 60000);
          return tp('time.minutesAgo', { count: minutes });
        }
        const hours = Math.floor(diff / 3600000);
        return tp('time.hoursAgo', { count: hours });
      };

      const updateSaveLabel = () => {
        const relativeTime = formatRelativeSaveTime();
        const text = tp('counters.lastSave', { time: relativeTime });
        if (text.includes('<')) {
          saveLabel.innerHTML = text;
        } else {
          saveLabel.textContent = text;
        }
      };

      const getSaveTooltip = () => {
        const relativeTime = formatRelativeSaveTime();
        return html`
          <div class="tooltip-header">${t('options.cloud.lastSave')}</div>
          <div class="tooltip-desc">${tp('counters.lastSaveTooltip', { time: relativeTime })}</div>
        `;
      };

      saveIndicator.addEventListener('mouseenter', (e) => showTooltip(getSaveTooltip(), e));
      saveIndicator.addEventListener('mousemove', positionTooltip);
      saveIndicator.addEventListener('mouseleave', hideTooltip);

      updateSaveLabel();
      setInterval(updateSaveLabel, 1000);

      document.addEventListener('dataManager:saved', (event) => {
        lastSaveTimestamp = event.detail?.timestamp || Date.now();
        updateSaveLabel();
        saveIndicator.classList.add('recently-saved');
        if (savePulseTimeout) clearTimeout(savePulseTimeout);
        savePulseTimeout = setTimeout(() => {
          saveIndicator.classList.remove('recently-saved');
        }, 800);
      });
    }
  } catch {}

  // Listen for option toggle to update inline stage controls
  document.addEventListener('updateInlineStageControls', () => {
    updateStageControlsInlineVisibility();
  });
}

export function switchTab(tabName) {
  const previousTab = game.activeTab;

  // Handle Legacy Tabs
  let actualTab = tabName;
  let targetSubTab = null;
  if (['training', 'crystalShop', 'soulShop', 'buildings'].includes(tabName)) {
    actualTab = 'shop';
    targetSubTab = tabName;
  }

  // Handle Mobile Panel Switching
  const combatPanel = document.querySelector('.combat-panel');
  const gamePanel = document.querySelector('.game-panel');

  if (window.innerWidth <= BREAKPOINTS.TABLET) {
    if (actualTab === 'battle') {
      if (combatPanel) combatPanel.classList.add('active');
      if (gamePanel) gamePanel.classList.add('hidden');
    } else {
      if (combatPanel) combatPanel.classList.remove('active');
      if (gamePanel) gamePanel.classList.remove('hidden');
    }
  }

  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));

  if (actualTab !== 'battle') {
    let tabElement = document.getElementById(actualTab);
    if (!tabElement) tabElement = document.getElementById('stats');
    tabElement.classList.add('active');
  }

  let tab = document.querySelector(`[data-tab="${actualTab}"]`);
  if (!tab) {
    // If battle tab is selected but button doesn't exist (e.g. desktop), fallback or just don't select button?
    // Actually battle button exists but is hidden on desktop.
    if (actualTab !== 'battle') {
      tab = document.querySelector('[data-tab="stats"]');
    }
  }
  if (tab) tab.classList.add('active');

  if (actualTab === 'stats') {
    updateStatsAndAttributesUI();
  }
  if (actualTab === 'quests') {
    updateQuestsUI();
  }
  if (actualTab === 'inventory') {
    // Clear new items flag when visiting inventory.
    inventory?.clearNewItemsFlag();
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new Event('inventory:refresh'));
    }
  }
  if (actualTab === 'runes') {
    renderRunesUI();
  }

  // If switching to shop, handle sub-tab
  if (actualTab === 'shop') {
    if (!targetSubTab) {
      // If no specific sub-tab requested, use the currently active one or default to training
      const activeSubTab = document.querySelector('.shop-tab-panel.active');
      targetSubTab = activeSubTab ? activeSubTab.id : 'training';
    }
    switchShopSubTab(targetSubTab);
  }

  game.activeTab = actualTab;

  if (actualTab === 'options') {
    options.refreshSaveSlotSelect();
  }

  // Update indicators after tab switch
  updateTabIndicators(previousTab);
  dataManager.saveGame();
}

export function updateResources() {
  if (!game || typeof game.stage !== 'number') {
    console.error('Game is not initialized properly:', game);
    return;
  }

  // Update ghost icon (total souls)
  document.getElementById('souls').textContent = formatNumber(hero.souls || 0);
  document.getElementById('crystals').textContent = formatNumber(hero.crystals || 0);

  // Update other stats
  document.getElementById('gold').textContent = formatNumber(hero.gold || 0);

  updateBuildingAffordability();
}

export function updatePlayerLife() {
  const stats = hero.stats;
  const lifePercentage = (stats.currentLife / stats.life) * 100;
  document.getElementById('life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('life-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(stats.currentLife)),
  )} / ${formatNumber(Math.floor(stats.life))}`;

  const manaPercentage = (stats.currentMana / stats.mana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(stats.currentMana)),
  )} / ${formatNumber(Math.floor(stats.mana))}`;

  const xpPercentage = (hero.exp / hero.getExpToNextLevel()) * 100;
  document.getElementById('xp-fill').style.width = `${xpPercentage}%`;
  document.getElementById('xp-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(hero.exp)),
  )} / ${formatNumber(Math.floor(hero.getExpToNextLevel()))} XP`;

  updateHeroAilmentIcons();
}

export function updateEnemyStats() {
  const enemy = game.currentEnemy;
  if (!enemy) {
    return;
  }
  const lifePercentage = Math.max(0, (enemy.currentLife / enemy.life) * 100);
  document.getElementById('enemy-life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('enemy-life-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(enemy.currentLife)),
  )} / ${formatNumber(Math.floor(enemy.life))}`;

  // Main stats
  const dmg = document.getElementById('enemy-damage-value');
  if (dmg) dmg.textContent = formatNumber(enemy.damage);
  ELEMENT_IDS.forEach((id) => {
    const dmgEl = document.getElementById(`enemy-${id}-damage-value`);
    if (dmgEl) dmgEl.textContent = formatNumber(enemy[`${id}Damage`] || 0);
  });

  const armor = document.getElementById('enemy-armor-value');
  if (armor) {
    // Use PoE2 formula: reduction = armor / (armor + 10 * damage)
    const reduction = calculateArmorReduction(enemy.armor, hero.stats.damage);
    armor.textContent = `${formatNumber(Math.floor(enemy.armor || 0))} (${Math.floor(reduction)}%)`;
  }
  const evasion = document.getElementById('enemy-evasion-value');
  if (evasion) {
    const alwaysEvade = enemy.special?.includes('alwaysEvade');
    const reduction = alwaysEvade
      ? 100
      : calculateEvasionChance(enemy.evasion, hero.stats.attackRating, undefined, hero.stats.chanceToHitPercent || 0);
    evasion.textContent = `${formatNumber(Math.floor(enemy.evasion || 0))} (${Math.floor(reduction)}%)`;
  }
  const atkRating = document.getElementById('enemy-attack-rating-value');
  if (atkRating) {
    // Show enemy attack rating and their hit chance against the player
    const alwaysHit = enemy.special?.includes('alwaysHit');
    const hitChance = alwaysHit ? 100 : calculateHitChance(enemy.attackRating, hero.stats.evasion);
    atkRating.textContent = `${formatNumber(Math.floor(enemy.attackRating || 0))} (${Math.floor(hitChance)}%)`;
  }
  const atkSpeed = document.getElementById('enemy-attack-speed-value');
  if (atkSpeed) atkSpeed.textContent = formatNumber((enemy.attackSpeed || 0).toFixed(2));
  ELEMENT_IDS.forEach((id) => {
    const resEl = document.getElementById(`enemy-${id}-resistance-value`);
    if (resEl) {
      const reduction = calculateResistanceReduction(enemy[`${id}Resistance`], hero.stats[`${id}Damage`]);
      resEl.textContent = `${formatNumber(Math.floor(enemy[`${id}Resistance`] || 0))} (${Math.floor(reduction)}%)`;
    }
  });

  const xp = document.getElementById('enemy-xp-value');
  if (xp) xp.textContent = formatNumber(Math.floor(enemy.xp || 0));

  const gold = document.getElementById('enemy-gold-value');
  if (gold) gold.textContent = formatNumber(Math.floor(enemy.gold || 0));

  setEnemyName();
  if (game.fightMode === 'explore') {
    game.currentEnemy.setEnemyColor();
  }

  function setEnemyName() {
    const enemyNameElement = document.querySelector('.enemy-name');
    enemyNameElement.textContent = game.currentEnemy.name;
    // Set the enemy image in .enemy-avatar (like hero)
    const enemyAvatar = document.querySelector('.enemy-avatar');
    if (enemyAvatar) {
      let img = enemyAvatar.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        img.alt = game.currentEnemy.name + ' avatar';
        enemyAvatar.innerHTML = '';
        enemyAvatar.appendChild(img);
      }
      // Use Vite's base path if available, else fallback
      let baseUrl = '';
      try {
        baseUrl = import.meta.env.VITE_BASE_PATH || '';
      } catch (e) {}
      img.src = baseUrl + game.currentEnemy.image;
    }
  }
  updateAilmentIcons();
}

function updateAilmentIcons() {
  const ailmentsContainer = document.querySelector('.enemy-ailments');
  if (!ailmentsContainer) return;
  ailmentsContainer.innerHTML = '';

  const enemy = game.currentEnemy;
  if (!enemy) return;

  const basePath = import.meta.env.VITE_BASE_PATH || '';

  const ailments = [
    {
      id: 'bleed',
      isActive: !!enemy.ailments[AILMENTS.bleed.id],
      getTooltip: () =>
        tp('ailment.bleed.tooltip', {
          amount: formatNumber(Math.floor(enemy.ailments[AILMENTS.bleed.id]?.damagePool || 0)),
          duration: ((enemy.ailments[AILMENTS.bleed.id]?.duration || 0) / 1000).toFixed(1),
        }),
    },
    {
      id: 'burn',
      isActive: !!enemy.ailments[AILMENTS.burn.id],
      getTooltip: () =>
        tp('ailment.burn.tooltip', {
          amount: formatNumber(Math.floor(enemy.ailments[AILMENTS.burn.id]?.damagePool || 0)),
          duration: ((enemy.ailments[AILMENTS.burn.id]?.duration || 0) / 1000).toFixed(1),
        }),
    },
    {
      id: 'shock',
      isActive: !!enemy.ailments[AILMENTS.shock.id],
      getTooltip: () => {
        const shockBonusBase = AILMENTS.shock.baseDamageTakenBonus;
        const shockEffectiveness = hero.stats.shockEffectiveness || 0;
        const shockMultiplier = 1 + shockBonusBase * (1 + shockEffectiveness);
        const percent = Math.round((shockMultiplier - 1) * 100);
        return tp('ailment.shock.tooltip', {
          amount: percent,
          duration: ((enemy.ailments[AILMENTS.shock.id]?.duration || 0) / 1000).toFixed(1),
        });
      },
    },
    {
      id: 'freeze',
      isActive: enemy.frozenUntil > Date.now(),
      getTooltip: () => {
        const remainingMs = Math.max(0, enemy.frozenUntil - Date.now());
        return tp('ailment.freeze.tooltip', { duration: (remainingMs / 1000).toFixed(1) });
      },
    },
    {
      id: 'stun',
      isActive: enemy.stunnedUntil > Date.now(),
      getTooltip: () => {
        const remainingMs = Math.max(0, enemy.stunnedUntil - Date.now());
        return tp('ailment.stun.tooltip', { duration: (remainingMs / 1000).toFixed(1) });
      },
    },
    {
      id: 'poison',
      isActive: !!enemy.ailments[AILMENTS.poison.id],
      getTooltip: () =>
        tp('ailment.poison.tooltip', {
          amount: formatNumber(Math.floor(enemy.ailments[AILMENTS.poison.id]?.damagePool || 0)),
          duration: ((enemy.ailments[AILMENTS.poison.id]?.duration || 0) / 1000).toFixed(1),
        }),
    },
  ];

  ailments.forEach((ailment) => {
    if (ailment.isActive) {
      const el = document.createElement('div');
      el.className = `ailment-icon ${ailment.id}`;
      el.style.backgroundImage = `url('${basePath}/icons/${ailment.id}.png')`;
      el.addEventListener('mouseenter', (e) => showTooltip(ailment.getTooltip(), e));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousemove', positionTooltip);
      ailmentsContainer.appendChild(el);
    }
  });
}

function updateHeroAilmentIcons() {
  const ailmentsContainer = document.querySelector('.hero-ailments');
  if (!ailmentsContainer) return;
  ailmentsContainer.innerHTML = '';

  const basePath = import.meta.env.VITE_BASE_PATH || '';

  const ailments = [
    {
      id: 'warmup',
      isActive: !!hero.ailments[AILMENTS.warmup.id],
      getTooltip: () =>
        tp('ailment.warmup.tooltip', { duration: ((hero.ailments[AILMENTS.warmup.id]?.duration || 0) / 1000).toFixed(1) }),
    },
  ];

  ailments.forEach((ailment) => {
    if (ailment.isActive) {
      const el = document.createElement('div');
      el.className = `ailment-icon ${ailment.id}`;
      el.style.backgroundImage = `url('${basePath}/icons/${ailment.id}.png')`;
      el.addEventListener('mouseenter', (e) => showTooltip(ailment.getTooltip(), e));
      el.addEventListener('mouseleave', hideTooltip);
      el.addEventListener('mousemove', positionTooltip);
      ailmentsContainer.appendChild(el);
    }
  });
}

/**
 * Start/stop the game loop
 */
export async function toggleGame() {
  const startBtn = document.getElementById('start-btn');
  // Toggle game loop state
  game.toggle();
  // Update button label and style
  startBtn.textContent = game.gameStarted ? t('combat.stop') : t('combat.fight');
  startBtn.style.backgroundColor = game.gameStarted ? '#DC2626' : '#059669';
}

export function updateStageUI() {
  const stageDisplay = document.getElementById('stage-display');
  const label = stageDisplay?.querySelector('.stage-label');
  const value = stageDisplay?.querySelector('.stage-value');
  if (stageDisplay && game.fightMode === 'arena') {
    if (label) {
      const val = t('combat.bossLevel');
      if (val && val.includes('<')) label.innerHTML = val;
      else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(hero.bossLevel);
    return;
  }
  if (stageDisplay && game.fightMode === 'rockyField') {
    if (label) {
      const val = t('combat.stage');
      if (val && val.includes('<')) label.innerHTML = val;
      else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(game.rockyFieldStage);
    return;
  }
  if (stageDisplay) {
    if (label) {
      const val = t('combat.stage');
      if (val && val.includes('<')) label.innerHTML = val;
      else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(game.stage);
  }
}

function updateCombatRegionDropdownVisibility() {
  const regionSelector = document.getElementById('combat-region-selector');
  if (!regionSelector) return;

  if (game.fightMode === 'explore') {
    regionSelector.style.display = 'flex';
    // Ensure explore region UI is updated
    if (typeof updateRegionUI === 'function') {
      updateRegionUI();
    }
  } else if (game.fightMode === 'arena') {
    regionSelector.style.display = 'flex';
    // Ensure boss region UI is updated
    if (typeof updateBossRegionSelector === 'function') {
      updateBossRegionSelector();
    }
  } else if (game.fightMode === 'rockyField') {
    regionSelector.style.display = 'flex';
    // Ensure rocky field region UI is updated
    updateRockyFieldRegionSelector();
  } else {
    regionSelector.style.display = 'none';
  }
}

export function showToast(message, type = 'normal', duration = 3000) {
  if (!options?.showInfoMessages) return;
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;

  // Add to DOM
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast after duration
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

let deathScreenInterval = null;
export function showDeathScreen(duration = 1, onRevive) {
  if (deathScreenInterval) clearInterval(deathScreenInterval);
  const overlay = document.getElementById('death-screen');
  const countdownElem = document.getElementById('revive-countdown');
  if (!overlay || !countdownElem) {
    if (onRevive) onRevive();
    return;
  }
  const charInfo = document.querySelector('.combat-panel .character-info');
  const actionBar = document.querySelector('.combat-panel .action-bar');
  if (charInfo && actionBar) {
    const top = charInfo.offsetTop;
    const height = actionBar.offsetTop + actionBar.offsetHeight - top;
    overlay.style.top = `${top}px`;
    overlay.style.height = `${height}px`;
  }
  overlay.style.display = 'flex';
  if (duration <= 0) {
    overlay.style.display = 'none';
    if (onRevive) onRevive();
    return;
  }
  let remaining = duration;
  countdownElem.textContent = Math.ceil(remaining);
  deathScreenInterval = setInterval(() => {
    remaining -= 0.5;
    countdownElem.textContent = Math.ceil(remaining);
    if (remaining <= 0) {
      clearInterval(deathScreenInterval);
      overlay.style.display = 'none';
      if (onRevive) onRevive();
    }
  }, 500);
}

export function hideDeathScreen() {
  const overlay = document.getElementById('death-screen');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.style.top = '';
    overlay.style.height = '';
  }
  if (deathScreenInterval) clearInterval(deathScreenInterval);
}

// Function to show the tooltip
export function showTooltip(content, event, classes = '') {
  // Global check: Disable tooltips on mobile/touch devices
  if (IS_MOBILE_OR_TABLET()) return;

  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = content;
  tooltip.className = `tooltip show ${classes}`; // Add custom classes here
  positionTooltip(event);
}

// Function to hide the tooltip
export function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.classList.remove('show');
  tooltip.classList.add('hidden');
}

// Function to position the tooltip
export function positionTooltip(event) {
  // Global check: Disable tooltip positioning on mobile/touch devices
  if (IS_MOBILE_OR_TABLET()) return;

  const tooltip = document.getElementById('tooltip');
  const tooltipRect = tooltip.getBoundingClientRect();
  const offset = 10; // Offset from the mouse pointer

  let top = event.clientY + offset;
  let left = event.clientX + offset;

  // Vertical adjustment
  if (top + tooltipRect.height > window.innerHeight) {
    top = event.clientY - tooltipRect.height - offset;
    // If it now goes off top
    if (top < offset) {
      // Pin to top edge if it doesn't fit
      top = offset;
    }
  }

  // Horizontal adjustment
  // First check if it fits to the right
  if (left + tooltipRect.width > window.innerWidth) {
    // Try to flip to left
    const leftSide = event.clientX - tooltipRect.width - offset;

    // Check if left side fits
    if (leftSide >= offset) {
      left = leftSide;
    } else {
      // Doesn't fit on left either.
      // Pick the side with more space or pin to left edge if it's huge
      if (tooltipRect.width > window.innerWidth - offset * 2) {
        // Too big for screen, pin to left
        left = offset;
      } else {
        // Fits on screen but not relative to mouse?
        // Align to right edge of screen
        left = window.innerWidth - tooltipRect.width - offset;
      }
    }
  }

  // Final safety check for left edge
  if (left < offset) {
    left = offset;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

// ###########################
// Custom Confirm Dialog
// ###########################

export function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    let dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'custom-confirm-dialog';
      dialog.innerHTML = html`
        <div class="confirm-backdrop"></div>
        <div class="confirm-content">
          <div class="confirm-message"></div>
          <div class="confirm-actions">
            <button class="confirm-btn confirm-yes">Yes</button>
            <button class="confirm-btn confirm-no">No</button>
          </div>
        </div>
      `;
      document.body.appendChild(dialog);
    }
    dialog.querySelector('.confirm-message').innerHTML = message.replace(/\n/g, '<br>');
    dialog.style.display = 'flex';
    dialog.classList.add('show');

    const yesBtn = dialog.querySelector('.confirm-yes');
    const noBtn = dialog.querySelector('.confirm-no');
    const cleanup = () => {
      dialog.classList.remove('show');
      setTimeout(() => {
        dialog.style.display = 'none';
      }, 200);
      yesBtn.removeEventListener('click', onYes);
      noBtn.removeEventListener('click', onNo);
      dialog.querySelector('.confirm-backdrop').removeEventListener('click', onNo);
    };
    const onYes = () => {
      cleanup();
      resolve(true);
    };
    const onNo = () => {
      cleanup();
      resolve(false);
    };
    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
    dialog.querySelector('.confirm-backdrop').addEventListener('click', onNo);
  });
}

// Helper function to convert camelCase to Title Case with spaces and translate stat names
export const formatStatName = (stat) => formatStatNameBase(stat, options?.shortElementalNames);

/**
 * Update tab indicators based on current game state.
 * Call this function whenever game state changes that might affect indicators.
 */
export function updateTabIndicators(previousTab = null) {
  if (previousTab) {
    tabIndicatorManager.markTabAsVisited(previousTab);
  }
  tabIndicatorManager.markTabAsVisited(game.activeTab);
  if (crystalShop?.crystalUpgrades?.autoClaimQuests && !autoClaiming) {
    const claimable = quests?.quests?.filter((q) => q.isComplete() && !q.claimed) || [];
    if (claimable.length > 0) {
      autoClaiming = true;
      claimable.forEach((q) => q.claim());
      autoClaiming = false;
      updateQuestsUI();
    }
  }

  // Count claimable quests
  const claimableQuests = quests?.quests?.filter((q) => q.isComplete(statistics) && !q.claimed).length || 0;

  const state = {
    unallocatedStatPoints: hero?.statPoints || 0,
    hasNewInventoryItems: inventory?.hasNewItems || false,
    unallocatedSkillPoints: skillTree?.skillPoints || 0,
    claimableQuests,
    currentTab: game?.activeTab || 'stats',
  };

  tabIndicatorManager.updateAll(state);
}

/**
 * Render the Rocky Field region selector and handle region changes.
 */
function getRockyFieldRegionTooltip(region) {
  const html = String.raw;
  const displayName = formatNamedType(region.name, 'combatMode.subAreaType.region');

  return html`
    <div class="tooltip-header">${displayName}</div>
    ${region.description ? `<div class="tooltip-content">${region.description}</div>` : ''}
    ${region.unlockStage ? `<div><strong>${t('rockyField.unlockStage')}:</strong> ${region.unlockStage}</div>` : ''}
  `;
}

export function openRockyFieldRegionSelectionDialog() {
  const html = String.raw;

  const regionItems = ROCKY_FIELD_REGIONS.map((region) => {
    const hasEnemies = getRockyFieldEnemies(region.id).length > 0;
    const unlocked = !region.unlockStage || game.rockyFieldHighestStage >= region.unlockStage;
    const isUnlocked = hasEnemies && unlocked;
    const isCurrent = region.id === game.rockyFieldRegion;
    const disabledClass = !isUnlocked ? 'disabled' : '';
    const selectedClass = isCurrent ? 'selected' : '';

    return html`
      <div class="region-dialog-item ${disabledClass} ${selectedClass}" data-region-id="${region.id}">
        <div class="region-dialog-item-header">
          <span class="region-dialog-item-name">${region.name}</span>
          ${region.unlockStage
    ? html`<span class="region-dialog-item-unlock">${t('rockyField.unlockStage')}: ${region.unlockStage}</span>`
    : ''}
          ${isCurrent ? html`<span class="region-dialog-item-current">${t('region.current')}</span>` : ''}
          ${!isUnlocked ? html`<span class="region-dialog-item-locked">🔒</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const content = html`
    <div class="modal-content region-selection-modal">
      <button class="modal-close">×</button>
      <h2 class="modal-title">${t('region.selectRegion')}</h2>
      <div class="region-dialog-list">${regionItems}</div>
    </div>
  `;

  createModal({
    id: 'rocky-field-region-selection-dialog',
    className: 'region-selection-dialog',
    content,
    closeOnOutsideClick: true,
  });

  // Add click handlers and tooltips to region items
  document.querySelectorAll('#rocky-field-region-selection-dialog .region-dialog-item').forEach((item) => {
    const regionId = item.dataset.regionId;
    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === regionId);

    if (region) {
      const tooltipContent = getRockyFieldRegionTooltip(region);
      item.classList.add('tooltip-target');
      item.addEventListener('mouseenter', (e) => showTooltip(tooltipContent, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);

      if (!item.classList.contains('disabled')) {
        item.addEventListener('click', async () => {
          if (regionId !== game.rockyFieldRegion) {
            hideTooltip();
            const confirmed = await showConfirmDialog(tp('combat.changeRegionConfirm', { region: region.name }));
            if (!confirmed) return;
            game.rockyFieldRegion = regionId;
            game.rockyFieldStage = 1;
            game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
            updateEnemyStats();
            updateStageUI();
            updateRockyFieldRegionSelector();
            closeModal('rocky-field-region-selection-dialog');
          }
        });
      }
    }
  });
}

export function updateRockyFieldRegionSelector() {
  // Update the region selector button for rocky field mode
  const currentRegion = ROCKY_FIELD_REGIONS.find((r) => r.id === game.rockyFieldRegion);
  if (currentRegion) {
    updateRegionSelectorButton('rockyField', currentRegion.name, openRockyFieldRegionSelectionDialog);
  }

  // Update old button-based selector if it exists
  const container = document.getElementById('rocky-field-region-selector');
  if (!container) return;
  container.innerHTML = '';

  ROCKY_FIELD_REGIONS.forEach((region) => {
    const hasEnemies = getRockyFieldEnemies(region.id).length > 0;
    const unlocked = !region.unlockStage || game.rockyFieldHighestStage >= region.unlockStage;
    const btn = document.createElement('button');
    btn.className = 'region-btn' + (region.id === game.rockyFieldRegion ? ' selected' : '');
    btn.textContent = region.name;
    btn.disabled = !hasEnemies || !unlocked;

    btn.addEventListener('mouseenter', (e) => showTooltip(getRockyFieldRegionTooltip(region), e));
    btn.addEventListener('mousemove', positionTooltip);
    btn.addEventListener('mouseleave', hideTooltip);

    if (hasEnemies && unlocked) {
      btn.onclick = async () => {
        const confirmed = await showConfirmDialog(tp('combat.changeRegionConfirm', { region: region.name }));
        if (!confirmed) return;
        game.rockyFieldRegion = region.id;
        game.rockyFieldStage = 1;
        game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
        updateEnemyStats();
        updateStageUI();
        updateRockyFieldRegionSelector();
      };
    }

    container.appendChild(btn);
  });
}

/**
 * Render the panel for the given region: 'explore' or 'arena'.
 * @param {string} region Active region.
 */
function renderRegionPanel(region) {
  const container = document.getElementById('region-panel-container');
  if (!container) return;

  const baseHtml = html`<div class="enemy-section">
    <div class="enemy-main-row">
      <div class="enemy-avatar"></div>
      <div class="enemy-life-and-stats">
        <div class="enemy-name-row">
          <div class="enemy-name"></div>
          <div class="enemy-name-controls">
            <div class="enemy-ailments"></div>
            <button
              type="button"
              class="enemy-stats-caret"
              aria-label="${t('enemy.stats.toggle')}"
              title="${t('enemy.stats.toggle')}"
            >
              ▾
            </button>
          </div>
        </div>
        <div class="enemy-life-bar">
          <div id="enemy-life-fill"></div>
          <div id="enemy-life-text"></div>
        </div>
      </div>
    </div>

    <div class="enemy-stats">
      <div class="enemy-stats-card enemy-stats-card--offense">
        <div class="enemy-stat-row">
          <div class="enemy-stat-label">${formatStatName('damage')}</div>
          <div class="enemy-stat-value" id="enemy-damage-value"></div>
        </div>
        <div class="enemy-stat-row">
          <div class="enemy-stat-label">${formatStatName('attackSpeed')}</div>
          <div class="enemy-stat-value" id="enemy-attack-speed-value"></div>
        </div>
        <div class="enemy-stat-row">
          <div class="enemy-stat-label">${formatStatName('attackRating')}</div>
          <div class="enemy-stat-value" id="enemy-attack-rating-value"></div>
        </div>
      </div>

      <div class="enemy-stats-card enemy-stats-card--defense">
        <div class="enemy-stat-row">
          <div class="enemy-stat-label">${formatStatName('armor')}</div>
          <div class="enemy-stat-value" id="enemy-armor-value"></div>
        </div>
        <div class="enemy-stat-row">
          <div class="enemy-stat-label">${formatStatName('evasion')}</div>
          <div class="enemy-stat-value" id="enemy-evasion-value"></div>
        </div>
      </div>

      <div class="enemy-stats-card enemy-stats-card--elements enemy-stats-card--full">
        <div class="enemy-elements-table">
          <div class="enemy-elements-header"></div>
          <div class="enemy-elements-header enemy-elements-col">${t('enemy.stats.dmgShort')}</div>
          <div class="enemy-elements-header enemy-elements-col">${t('enemy.stats.resShort')}</div>

          <div class="enemy-elements-element enemy-fire-damage">
            ${ELEMENTS.fire.icon}<span class="enemy-elements-name">${t('fire')}</span>
          </div>
          <div class="enemy-elements-value enemy-fire-damage" id="enemy-fire-damage-value"></div>
          <div class="enemy-elements-value enemy-fire-resistance" id="enemy-fire-resistance-value"></div>

          <div class="enemy-elements-element enemy-cold-damage">
            ${ELEMENTS.cold.icon}<span class="enemy-elements-name">${t('cold')}</span>
          </div>
          <div class="enemy-elements-value enemy-cold-damage" id="enemy-cold-damage-value"></div>
          <div class="enemy-elements-value enemy-cold-resistance" id="enemy-cold-resistance-value"></div>

          <div class="enemy-elements-element enemy-air-damage">
            ${ELEMENTS.air.icon}<span class="enemy-elements-name">${t('air')}</span>
          </div>
          <div class="enemy-elements-value enemy-air-damage" id="enemy-air-damage-value"></div>
          <div class="enemy-elements-value enemy-air-resistance" id="enemy-air-resistance-value"></div>

          <div class="enemy-elements-element enemy-earth-damage">
            ${ELEMENTS.earth.icon}<span class="enemy-elements-name">${t('earth')}</span>
          </div>
          <div class="enemy-elements-value enemy-earth-damage" id="enemy-earth-damage-value"></div>
          <div class="enemy-elements-value enemy-earth-resistance" id="enemy-earth-resistance-value"></div>

          <div class="enemy-elements-element enemy-lightning-damage">
            ${ELEMENTS.lightning.icon}<span class="enemy-elements-name">${t('lightning')}</span>
          </div>
          <div class="enemy-elements-value enemy-lightning-damage" id="enemy-lightning-damage-value"></div>
          <div class="enemy-elements-value enemy-lightning-resistance" id="enemy-lightning-resistance-value"></div>

          <div class="enemy-elements-element enemy-water-damage">
            ${ELEMENTS.water.icon}<span class="enemy-elements-name">${t('water')}</span>
          </div>
          <div class="enemy-elements-value enemy-water-damage" id="enemy-water-damage-value"></div>
          <div class="enemy-elements-value enemy-water-resistance" id="enemy-water-resistance-value"></div>
        </div>
      </div>

      <div class="enemy-stats-card enemy-stats-card--rewards enemy-stats-card--full">
        <div class="enemy-rewards-row">
          <div class="enemy-reward-item">
            <div class="enemy-reward-label">
              <img src="${BASE}/icons/gold.svg" class="icon" alt="${t('resource.gold.name')}" />
              ${t('resource.gold.name')}
            </div>
            <div class="enemy-reward-value" id="enemy-gold-value"></div>
          </div>
          <div class="enemy-reward-item">
            <div class="enemy-reward-label">${t('counters.xp')}</div>
            <div class="enemy-reward-value" id="enemy-xp-value"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  container.innerHTML = '';
  if (region === 'arena') {
    const panel = document.createElement('div');
    panel.id = 'arena-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = baseHtml;
    container.appendChild(panel);
    initializeBossRegionUI();
    updateBossRegionSelector();
    updateBossUI();
    initializeEnemyStatsCaret(panel);
  } else if (region === 'rockyField') {
    const panel = document.createElement('div');
    panel.id = 'rocky-field-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = baseHtml;
    container.appendChild(panel);

    updateRockyFieldRegionSelector();
    updateEnemyStats();
    updateResources();
    updateStageControlsInlineVisibility();
    initializeEnemyStatsCaret(panel);
  } else {
    const panel = document.createElement('div');
    panel.id = 'explore-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = baseHtml;

    container.appendChild(panel);

    // Initialize enemy UI values
    updateEnemyStats();
    updateResources();

    // Render inline stage controls if enabled
    updateStageControlsInlineVisibility();
    initializeEnemyStatsCaret(panel);
  }
  // Set the active class on the correct region tab based on the region prop
  document.querySelectorAll('.region-tab').forEach((b) => {
    if (b.dataset.region === region) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  dataManager.saveGame();
}

function applyEnemyStatsVisibility(visible, panel = null) {
  if (options) {
    options.showEnemyStats = !!visible;
  }
  const scope = panel || document;
  const stats = scope.querySelector('.enemy-stats');
  if (stats) stats.style.display = visible ? '' : 'none';

  const caret = scope.querySelector('.enemy-stats-caret');
  if (caret) {
    caret.classList.toggle('collapsed', !visible);
    caret.setAttribute('aria-expanded', visible ? 'true' : 'false');
  }

  const checkbox = document.getElementById('enemy-stats-toggle');
  if (checkbox) checkbox.checked = !!visible;

  dataManager.saveGame();
}

function initializeEnemyStatsCaret(panel) {
  const caret = panel?.querySelector('.enemy-stats-caret');
  if (!caret) return;

  applyEnemyStatsVisibility(!!options?.showEnemyStats, panel);

  caret.onclick = () => {
    const nextVisible = !options?.showEnemyStats;
    applyEnemyStatsVisibility(nextVisible, panel);
  };
}

/**
 * Show or hide stage controls inline below the enemy for supported regions
 */
export function updateStageControlsInlineVisibility() {
  const isSupportedMode = game.fightMode === 'explore' || game.fightMode === 'rockyField';
  const panelId = game.fightMode === 'rockyField' ? 'rocky-field-panel' : 'explore-panel';
  const panel = isSupportedMode ? document.getElementById(panelId) : null;
  const existing = document.getElementById('inline-stage-controls');
  const shouldShow = !!options?.showStageControlsInline && isSupportedMode && !!panel;
  if (!shouldShow) {
    if (existing) existing.remove();
    return;
  }
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'inline-stage-controls';
  container.style.marginTop = '8px';

  // 1) Starting Stage
  const startMax = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
  const startVal = options?.startingStage != null ? options.startingStage : 0;
  const startRow = document.createElement('div');
  startRow.className = 'option-row';
  startRow.innerHTML = html`
    <label class="starting-stage-label">${t('options.startingStage')}:</label>
    <input type="number" class="starting-stage-input" min="1" max="${startMax}" value="${startVal}" />
    <div class="min-max-btn-group">
      <button class="min-btn" type="button" data-i18n="common.min">${t('common.min')}</button>
      <button class="max-btn" type="button" data-i18n="common.max">${t('common.max')}</button>
    </div>
  `;
  const startInput = startRow.querySelector('input');
  const startMinBtn = startRow.querySelector('.min-btn');
  const startMaxBtn = startRow.querySelector('.max-btn');
  const applyInlineStartingStage = (force = false) => {
    let v = parseInt(startInput.value, 10);
    const m = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    startInput.value = v;

    const changed = options?.startingStage !== v;
    const stageMismatch = game.fightMode === 'explore' && game.stage !== game.getStartingStage();
    const shouldSyncStage = force || changed || stageMismatch;
    if (!changed && !shouldSyncStage) return;

    if (changed) {
      options.startingStage = v;
    }

    if (shouldSyncStage && game.fightMode === 'explore') {
      game.stage = game.getStartingStage();
      game.currentEnemy = new Enemy(game.stage);
      updateStageUI();
      game.resetAllLife();
    }

    if (changed) {
      dataManager.saveGame();
    }
    showToast(t('options.toast.startingStageApplied'), 'success');
    if (typeof options.updateStartingStageOption === 'function') {
      options.updateStartingStageOption();
    }
  };
  if (startMinBtn) {
    startMinBtn.onmouseenter = () => startMinBtn.classList.add('hover');
    startMinBtn.onmouseleave = () => startMinBtn.classList.remove('hover');
    startMinBtn.onclick = () => {
      startInput.value = 1;
      startInput.dispatchEvent(new Event('input'));
      applyInlineStartingStage(true);
    };
  }
  if (startMaxBtn) {
    startMaxBtn.onmouseenter = () => startMaxBtn.classList.add('hover');
    startMaxBtn.onmouseleave = () => startMaxBtn.classList.remove('hover');
    startMaxBtn.onclick = () => {
      const max = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
      startInput.value = max;
      startInput.dispatchEvent(new Event('input'));
      applyInlineStartingStage(true);
    };
  }
  startInput.addEventListener('input', () => {
    let v = parseInt(startInput.value, 10);
    const m = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    startInput.value = v;
  });
  startInput.addEventListener('blur', () => applyInlineStartingStage(false));
  startInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInlineStartingStage(true);
      startInput.blur();
    }
  });

  // 2) Stage Skip per Kill
  const skipMax = crystalShop?.crystalUpgrades?.stageSkip || 0;
  const skipVal = options?.stageSkip != null ? options.stageSkip : 0;
  const skipRow = document.createElement('div');
  skipRow.className = 'option-row';
  skipRow.innerHTML = html`
    <label class="stage-skip-label">${t('options.stageSkipPerKill')}:</label>
    <input type="number" class="stage-skip-input" min="0" max="${skipMax}" value="${skipVal}" />
    <div class="min-max-btn-group">
      <button class="min-btn" type="button" data-i18n="common.min">${t('common.min')}</button>
      <button class="max-btn" type="button" data-i18n="common.max">${t('common.max')}</button>
    </div>
  `;
  const skipInput = skipRow.querySelector('input');
  const skipMinBtn = skipRow.querySelector('.min-btn');
  const skipMaxBtn = skipRow.querySelector('.max-btn');
  const applyInlineStageSkip = () => {
    let v = parseInt(skipInput.value, 10);
    const m = crystalShop?.crystalUpgrades?.stageSkip || 0;
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    skipInput.value = v;

    if (options.stageSkip === v) return;

    options.stageSkip = v;
    dataManager.saveGame();
    showToast(t('options.toast.stageSkipApplied'), 'success');
    if (typeof options.updateStageSkipOption === 'function') {
      options.updateStageSkipOption();
    }
  };
  if (skipMinBtn) {
    skipMinBtn.onmouseenter = () => skipMinBtn.classList.add('hover');
    skipMinBtn.onmouseleave = () => skipMinBtn.classList.remove('hover');
    skipMinBtn.onclick = () => {
      skipInput.value = 0;
      skipInput.dispatchEvent(new Event('input'));
      applyInlineStageSkip();
    };
  }
  if (skipMaxBtn) {
    skipMaxBtn.onmouseenter = () => skipMaxBtn.classList.add('hover');
    skipMaxBtn.onmouseleave = () => skipMaxBtn.classList.remove('hover');
    skipMaxBtn.onclick = () => {
      const max = crystalShop?.crystalUpgrades?.stageSkip || 0;
      skipInput.value = max;
      skipInput.dispatchEvent(new Event('input'));
      applyInlineStageSkip();
    };
  }
  skipInput.addEventListener('input', () => {
    let v = parseInt(skipInput.value, 10);
    const m = crystalShop?.crystalUpgrades?.stageSkip || 0;
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    skipInput.value = v;
  });
  skipInput.addEventListener('blur', applyInlineStageSkip);
  skipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInlineStageSkip();
      skipInput.blur();
    }
  });

  // 3) Reset Stage Skip At
  const resetPurchased = !!crystalShop?.crystalUpgrades?.resetStageSkip;
  const resetVal = options?.resetStageSkip != null ? options.resetStageSkip : 0;
  const resetRow = document.createElement('div');
  resetRow.className = 'option-row';
  resetRow.innerHTML = html`
    <label class="reset-stage-skip-label">${t('options.resetStageSkipAt')}:</label>
    <input
      type="number"
      class="reset-stage-skip-input"
      min="0"
      value="${resetVal}"
      ${resetPurchased ? '' : 'disabled'}
    />
    <div class="min-max-btn-group">
      <button class="min-btn" type="button" ${resetPurchased ? '' : 'disabled'} data-i18n="common.min">
        ${t('common.min')}
      </button>
      <button class="max-btn" type="button" ${resetPurchased ? '' : 'disabled'} data-i18n="common.max">
        ${t('common.max')}
      </button>
    </div>
  `;
  const resetInput = resetRow.querySelector('input');
  const resetMinBtn = resetRow.querySelector('.min-btn');
  const resetMaxBtn = resetRow.querySelector('.max-btn');
  const applyInlineResetStageSkip = () => {
    if (resetInput.disabled) return;
    let v = parseInt(resetInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    resetInput.value = v;

    if (options.resetStageSkip === v) return;

    options.resetStageSkip = v;
    dataManager.saveGame();
    showToast(t('options.toast.resetStageSkipApplied'), 'success');
    if (typeof options.updateResetStageSkipOption === 'function') {
      options.updateResetStageSkipOption();
    }
  };
  if (resetMinBtn) {
    resetMinBtn.onmouseenter = () => resetMinBtn.classList.add('hover');
    resetMinBtn.onmouseleave = () => resetMinBtn.classList.remove('hover');
    resetMinBtn.onclick = () => {
      if (resetMinBtn.disabled) return;
      resetInput.value = 0;
      resetInput.dispatchEvent(new Event('input'));
      applyInlineResetStageSkip();
    };
  }
  if (resetMaxBtn) {
    resetMaxBtn.onmouseenter = () => resetMaxBtn.classList.add('hover');
    resetMaxBtn.onmouseleave = () => resetMaxBtn.classList.remove('hover');
    resetMaxBtn.onclick = () => {
      if (resetMaxBtn.disabled) return;
      const highest = Math.max(...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0));
      resetInput.value = highest || 0;
      resetInput.dispatchEvent(new Event('input'));
      applyInlineResetStageSkip();
    };
  }
  resetInput.addEventListener('input', () => {
    let v = parseInt(resetInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    resetInput.value = v;
  });
  resetInput.addEventListener('blur', applyInlineResetStageSkip);
  resetInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInlineResetStageSkip();
      resetInput.blur();
    }
  });

  // 4) Stage Lock Value
  const stageLockPurchased = !!crystalShop?.crystalUpgrades?.stageLock;
  const stageLockEnabled = !!options?.stageLockEnabled;
  const stageLockValue = options?.stageLock || 0;
  const stageLockRow = document.createElement('div');
  stageLockRow.className = 'option-row';
  stageLockRow.innerHTML = html`
    <label for="inline-stage-lock-input" class="stage-lock-label" data-i18n="options.stageLockStage"
      >${t('options.stageLockStage')}:</label
    >
    <input
      type="number"
      id="inline-stage-lock-input"
      class="stage-lock-input"
      min="0"
      value="${stageLockValue}"
      ${stageLockPurchased ? '' : 'disabled'}
    />
    <div class="min-max-btn-group">
      <button class="min-btn" type="button" ${stageLockPurchased ? '' : 'disabled'} data-i18n="common.min">
        ${t('common.min')}
      </button>
      <button class="max-btn" type="button" ${stageLockPurchased ? '' : 'disabled'} data-i18n="common.max">
        ${t('common.max')}
      </button>
    </div>
  `;
  const stageLockInput = stageLockRow.querySelector('.stage-lock-input');
  const stageLockMinBtn = stageLockRow.querySelector('.min-btn');
  const stageLockMaxBtn = stageLockRow.querySelector('.max-btn');
  const applyInlineStageLock = () => {
    if (!stageLockInput || stageLockInput.disabled) return;
    let v = parseInt(stageLockInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    stageLockInput.value = v;

    if (options.stageLock === v) return;

    options.stageLock = v;
    dataManager.saveGame();
    if (typeof options.updateStageLockOption === 'function') {
      options.updateStageLockOption();
    }
    showToast(t('options.toast.stageLockApplied'), 'success');
  };
  if (stageLockMinBtn) {
    stageLockMinBtn.onmouseenter = () => stageLockMinBtn.classList.add('hover');
    stageLockMinBtn.onmouseleave = () => stageLockMinBtn.classList.remove('hover');
    stageLockMinBtn.onclick = () => {
      if (stageLockMinBtn.disabled || !stageLockInput) return;
      stageLockInput.value = 0;
      stageLockInput.dispatchEvent(new Event('input'));
      applyInlineStageLock();
    };
  }
  if (stageLockMaxBtn) {
    stageLockMaxBtn.onmouseenter = () => stageLockMaxBtn.classList.add('hover');
    stageLockMaxBtn.onmouseleave = () => stageLockMaxBtn.classList.remove('hover');
    stageLockMaxBtn.onclick = () => {
      if (stageLockMaxBtn.disabled || !stageLockInput) return;
      const highest = Math.max(...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0));
      stageLockInput.value = highest || 0;
      stageLockInput.dispatchEvent(new Event('input'));
      applyInlineStageLock();
    };
  }
  if (stageLockInput) {
    if (!stageLockPurchased) {
      const tooltip = t('options.stageLock.disabledTooltip');
      stageLockInput.title = tooltip;
      if (stageLockMinBtn) stageLockMinBtn.title = tooltip;
      if (stageLockMaxBtn) stageLockMaxBtn.title = tooltip;
    }
    stageLockInput.addEventListener('input', () => {
      let v = parseInt(stageLockInput.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      stageLockInput.value = v;
    });
  }
  stageLockInput?.addEventListener('blur', applyInlineStageLock);
  stageLockInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyInlineStageLock();
      stageLockInput.blur();
    }
  });

  container.appendChild(startRow);
  container.appendChild(skipRow);
  container.appendChild(resetRow);
  container.appendChild(stageLockRow);
  stageLockRow.style.display = stageLockEnabled ? '' : 'none';

  // Insert after enemy section inside explore panel
  const enemySection = panel.querySelector('.enemy-section');
  if (enemySection && enemySection.parentNode) {
    enemySection.parentNode.insertBefore(container, enemySection.nextSibling);
  } else {
    panel.appendChild(container);
  }

  if (typeof options.updateStageLockOption === 'function') {
    options.updateStageLockOption();
  }
}
