import Enemy from '../enemy.js';
import { ROCKY_FIELD_REGIONS, RockyFieldEnemy, getRockyFieldEnemies } from '../rockyField.js';
import { formatNamedType, formatStatName as formatStatNameBase } from '../format.js';
import { formatNumber as formatNumberInternal } from '../utils/numberFormatter.js';
import {
  game,
  hero,
  skillTree,
  quests,
  statistics,
  inventory,
  dataManager,
  options,
  crystalShop,
  training,
  soulShop,
} from '../globals.js';
import { t } from '../i18n.js';
import { updateQuestsUI } from './questUi.js';
import { updateStatsAndAttributesUI } from './statsAndAttributesUi.js';
import { TabIndicatorManager } from './tabIndicatorManager.js';
import { initializeBossRegionUI, selectBoss, updateBossUI } from './bossUi.js';
import { ELEMENTS } from '../constants/common.js';
import { calculateArmorReduction, calculateEvasionChance, calculateHitChance, calculateResistanceReduction } from '../combat.js';
import { renderRunesUI } from './runesUi.js';
export {
  initializeSkillTreeUI,
  initializeSkillTreeStructure,
  updateSkillTreeValues,
  updateActionBar,
  updateBuffIndicators,
  showManaWarning,
} from './skillTreeUi.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);

// Tab indicator manager instance
let tabIndicatorManager = null;
let autoClaiming = false;

const html = String.raw;
const BASE = import.meta.env.VITE_BASE_PATH;
let offlineEligibilityStart = null;

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
  document.getElementById('start-btn').addEventListener('click', () => toggleGame());

  // Add tooltips to resource icons
  const resourceTooltips = [
    {
      selector: '.resource-gold',
      tooltip: () => html`
        <div class="tooltip-header">${t('resource.gold.name')} <img src="${BASE}/icons/gold.svg" class="icon" alt="${t('resource.gold.name')}"/></div>
        <div class="tooltip-desc">${t('resource.gold.desc')}</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-crystal',
      tooltip: () => html`
        <div class="tooltip-header">${t('resource.crystal.name')} <img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/></div>
        <div class="tooltip-desc">${t('resource.crystal.desc')}</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-souls',
      tooltip: () => html`
        <div class="tooltip-header">${t('resource.souls.name')} <img src="${BASE}/icons/soul.svg" class="icon" alt="${t('resource.souls.name')}"/></div>
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

  // Setup region tab switching (Explore / Arena)
  document.querySelectorAll('.region-tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const region = btn.dataset.region;
      if (game.fightMode === region) return; // No change needed
      const confirmed = await showConfirmDialog(
        `Are you sure you want to change to ${region}? That will reset your stage progress and will find you a new enemy`,
      );
      if (!confirmed) return;
      // Reset stage progress and enemy as if the hero died
      if (game.gameStarted) {
        toggleGame(); // Stop the game if it's running
      }

      game.fightMode = region;

      // find new enemy/boss based on region
      if (game.fightMode === 'explore') {
        game.currentEnemy = new Enemy(game.stage);
      } else if (game.fightMode === 'arena') {
        selectBoss(); // Select boss based on current level
      } else if (game.fightMode === 'rockyField') {
        game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
      }
      // Toggle active tab class
      document.querySelectorAll('.region-tab').forEach((b) => b.classList.toggle('active', b === btn));
      // Render the appropriate region panel
      renderRegionPanel(region);
      updateStatsAndAttributesUI();
      // Update controls label
      const display = document.getElementById('stage-display');
      const label = display?.querySelector('.stage-label');
      const value = display?.querySelector('.stage-value');
      if (region === 'explore') {
        if (label) {
          const val = t('combat.stage');
          if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
        }
        if (value) value.textContent = formatNumber(game.stage);
      } else if (region === 'arena') {
        if (label) {
          const val = t('combat.bossLevel');
          if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
        }
        if (value) value.textContent = formatNumber(hero.bossLevel);
      } else if (region === 'rockyField') {
        if (label) {
          const val = t('combat.stage');
          if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
        }
        if (value) value.textContent = formatNumber(game.rockyFieldStage);
      }
      // Hide or show region-selector based on region
      const regionSelector = document.getElementById('region-selector');
      regionSelector.style.display = region === 'arena' || region === 'rockyField' ? 'none' : '';
    });
  });
  // Render initial region panel and set region-selector visibility
  renderRegionPanel(game.fightMode);
  const regionSelector = document.getElementById('region-selector');
  regionSelector.style.display = game.fightMode === 'arena' || game.fightMode === 'rockyField' ? 'none' : '';

  // Add offline eligibility indicator at right end of region tabs
  try {
    const tabs = document.querySelector('.region-tabs');
    if (tabs && !tabs.querySelector('.offline-eligibility-indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'offline-eligibility-indicator offline-not-eligible';
      indicator.innerHTML = '<span class="icon">✖</span>';
      indicator.classList.add('tooltip-target');
      indicator.style.marginLeft = 'auto';
      tabs.appendChild(indicator);

      // Baseline for session eligibility (independent from counters reset)
      offlineEligibilityStart = statistics.totalTimeInFights || 0;

      const tooltipDescription = indicator.classList.contains('offline-eligible')
        ? t('counters.offline.tooltipEligible')
        : t('counters.offline.tooltipNotEligible');

      const tooltip = () => html`
        <div class="tooltip-header">${t('counters.offlineProgress')}</div>
        <div class="tooltip-desc">${tooltipDescription}</div>
        <div class="tooltip-note">${t('counters.offline.tooltipCondition')}</div>
      `;
      indicator.addEventListener('mouseenter', (e) => showTooltip(tooltip(), e));
      indicator.addEventListener('mousemove', positionTooltip);
      indicator.addEventListener('mouseleave', hideTooltip);

      // Update icon/color every second
      setInterval(() => {
        const elapsed = (statistics.totalTimeInFights || 0) - (offlineEligibilityStart || 0);
        const eligible = elapsed >= 60;
        indicator.querySelector('.icon').textContent = eligible ? '✔' : '✖';
        indicator.classList.toggle('offline-eligible', eligible);
        indicator.classList.toggle('offline-not-eligible', !eligible);
      }, 1000);
    }
  } catch {}

  // Listen for option toggle to update inline stage controls
  document.addEventListener('updateInlineStageControls', () => {
    updateStageControlsInlineVisibility();
  });
}

export function switchTab(tabName) {
  const previousTab = game.activeTab;

  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  let tabElement = document.getElementById(tabName);
  if (!tabElement) tabElement = document.getElementById('stats');
  tabElement.classList.add('active');

  let tab = document.querySelector(`[data-tab="${tabName}"]`);
  if (!tab) {
    tab = document.querySelector('[data-tab="stats"]');
  }
  tab.classList.add('active');

  if (tabName === 'stats') {
    updateStatsAndAttributesUI();
  }
  if (tabName === 'quests') {
    updateQuestsUI();
  }
  if (tabName === 'inventory') {
    // Clear new items flag when visiting inventory.
    inventory?.clearNewItemsFlag();
  }
  if (tabName === 'runes') {
    renderRunesUI();
  }

  game.activeTab = tabName;

  if (tabName === 'training') {
    training.updateTrainingAffordability('gold-upgrades');
    training.updateTrainingAffordability('crystal-upgrades');
  }

  if (tabName === 'soulShop') {
    soulShop.updateSoulShopAffordability();
  }

  if (tabName === 'options') {
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
}

export function updateEnemyStats() {
  const enemy = game.currentEnemy;
  if (!enemy) {
    return;
  }
  const lifePercentage = (enemy.currentLife / enemy.life) * 100;
  document.getElementById('enemy-life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('enemy-life-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(enemy.currentLife)),
  )} / ${formatNumber(Math.floor(enemy.life))}`;

  // Main stats
  const dmg = document.getElementById('enemy-damage-value');
  if (dmg) dmg.textContent = formatNumber(Math.floor(enemy.damage));
  ELEMENT_IDS.forEach((id) => {
    const dmgEl = document.getElementById(`enemy-${id}-damage-value`);
    if (dmgEl) dmgEl.textContent = formatNumber(Math.floor(enemy[`${id}Damage`] || 0));
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
      : calculateEvasionChance(
        enemy.evasion,
        hero.stats.attackRating,
        undefined,
        hero.stats.chanceToHitPercent || 0,
      );
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
      const reduction = calculateResistanceReduction(
        enemy[`${id}Resistance`],
        hero.stats[`${id}Damage`],
      );
      resEl.textContent = `${formatNumber(Math.floor(enemy[`${id}Resistance`] || 0))} (${Math.floor(reduction)}%)`;
    }
  });

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
}

export function updateEnemyStatLabels() {
  ELEMENT_IDS.forEach((el) => {
    const dmg = document.querySelector(`.enemy-${el}-damage`);
    if (dmg) {
      dmg.innerHTML = `${formatStatName(`${el}Damage`)}: <span id="enemy-${el}-damage-value"></span>`;
    }
    const res = document.querySelector(`.enemy-${el}-resistance`);
    if (res) {
      res.innerHTML = `${formatStatName(`${el}Resistance`)}: <span id="enemy-${el}-resistance-value"></span>`;
    }
  });
  updateEnemyStats();
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
      if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(hero.bossLevel);
    return;
  }
  if (stageDisplay && game.fightMode === 'rockyField') {
    if (label) {
      const val = t('combat.stage');
      if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(game.rockyFieldStage);
    return;
  }
  if (stageDisplay) {
    if (label) {
      const val = t('combat.stage');
      if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
    }
    if (value) value.textContent = formatNumber(game.stage);
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
  const tooltip = document.getElementById('tooltip');
  const tooltipRect = tooltip.getBoundingClientRect();
  const offset = 10; // Offset from the mouse pointer

  let top = event.clientY + offset;
  let left = event.clientX + offset;

  // Adjust position if tooltip goes off-screen
  if (top + tooltipRect.height > window.innerHeight) {
    top = event.clientY - tooltipRect.height - offset;
  }
  if (left + tooltipRect.width > window.innerWidth) {
    left = event.clientX - tooltipRect.width - offset;
  }

  // Ensure tooltip doesn't go off the top or left edge
  if (top < offset) {
    top = offset;
  }
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
export const formatStatName = (stat) =>
  formatStatNameBase(stat, options?.shortElementalNames);

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

export function updateRockyFieldRegionSelector() {
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
        const confirmed = await showConfirmDialog(
          `Are you sure you want to change to ${region.name}? That will reset your stage progress and will find you a new enemy`,
        );
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
        <div class="enemy-name"></div>
        <div class="enemy-life-bar">
          <div id="enemy-life-fill"></div>
          <div id="enemy-life-text"></div>
        </div>
      </div>
    </div>
    <div class="enemy-stats">
      <div class="enemy-damage">${formatStatName('damage')}: <span id="enemy-damage-value"></span></div>
      <div class="enemy-armor">${formatStatName('armor')}: <span id="enemy-armor-value"></span></div>
      <div class="enemy-evasion">${formatStatName('evasion')}: <span id="enemy-evasion-value"></span></div>
      <div class="enemy-attack-rating">${formatStatName('attackRating')}: <span id="enemy-attack-rating-value"></span></div>
      <div class="enemy-attack-speed">${formatStatName('attackSpeed')}: <span id="enemy-attack-speed-value"></span></div>
      <div></div>
      <!-- Empty div for layout -->
      <div>
        ${ELEMENT_IDS.map((id) => `<div class="enemy-${id}-damage">${formatStatName(id + 'Damage')}: <span id="enemy-${id}-damage-value"></span></div>`).join('')}
      </div>
      <div>
        ${ELEMENT_IDS.map((id) => `<div class="enemy-${id}-resistance">${formatStatName(id + 'Resistance')}: <span id="enemy-${id}-resistance-value"></span></div>`).join('')}
      </div>
    </div>
  </div>`;

  container.innerHTML = '';
  if (region === 'arena') {
    const panel = document.createElement('div');
    panel.id = 'arena-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = `
      <div id="boss-region-selector"></div>
      ${baseHtml}
    `;
    container.appendChild(panel);
    initializeBossRegionUI();
    updateBossUI();
  } else if (region === 'rockyField') {
    const panel = document.createElement('div');
    panel.id = 'rocky-field-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = `<div id="rocky-field-region-selector"></div>${baseHtml}`;
    container.appendChild(panel);

    updateRockyFieldRegionSelector();
    updateEnemyStats();
    updateResources();
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

/**
 * Show or hide stage controls inline below the enemy in Explore panel
 */
export function updateStageControlsInlineVisibility() {
  const panel = document.getElementById('explore-panel');
  const existing = document.getElementById('inline-stage-controls');
  const shouldShow = !!options?.showStageControlsInline && game.fightMode === 'explore' && !!panel;
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
    <input type="number" class="starting-stage-input" min="0" max="${startMax}" value="${startVal}" />
    <button class="max-btn" type="button" data-i18n="common.max">${t('common.max')}</button>
    <button class="apply-btn" type="button" data-i18n="common.apply">${t('common.apply')}</button>
  `;
  const startInput = startRow.querySelector('input');
  const startMaxBtn = startRow.querySelector('.max-btn');
  const startApply = startRow.querySelector('.apply-btn');
  startApply.onmouseenter = () => startApply.classList.add('hover');
  startApply.onmouseleave = () => startApply.classList.remove('hover');
  if (startMaxBtn) {
    startMaxBtn.onmouseenter = () => startMaxBtn.classList.add('hover');
    startMaxBtn.onmouseleave = () => startMaxBtn.classList.remove('hover');
    startMaxBtn.onclick = () => {
      const max = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
      startInput.value = max;
      startInput.dispatchEvent(new Event('input'));
    };
  }
  startInput.addEventListener('input', () => {
    let v = parseInt(startInput.value, 10);
    const m = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    startInput.value = v;
  });
  startApply.onclick = () => {
    let v = parseInt(startInput.value, 10);
    const m = 1 + (crystalShop?.crystalUpgrades?.startingStage || 0);
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    options.startingStage = v;
    if (game.fightMode === 'explore') {
      game.stage = game.getStartingStage();
      game.currentEnemy = new Enemy(game.stage);
      updateStageUI();
      game.resetAllLife();
    }
    dataManager.saveGame();
    showToast(t('options.toast.startingStageApplied'), 'success');
  };

  // 2) Stage Skip per Kill
  const skipMax = crystalShop?.crystalUpgrades?.stageSkip || 0;
  const skipVal = options?.stageSkip != null ? options.stageSkip : 0;
  const skipRow = document.createElement('div');
  skipRow.className = 'option-row';
  skipRow.innerHTML = html`
    <label class="stage-skip-label">${t('options.stageSkipPerKill')}:</label>
    <input type="number" class="stage-skip-input" min="0" max="${skipMax}" value="${skipVal}" />
    <button class="max-btn" type="button" data-i18n="common.max">${t('common.max')}</button>
    <button class="apply-btn" type="button" data-i18n="common.apply">${t('common.apply')}</button>
  `;
  const skipInput = skipRow.querySelector('input');
  const skipMaxBtn = skipRow.querySelector('.max-btn');
  const skipApply = skipRow.querySelector('.apply-btn');
  skipApply.onmouseenter = () => skipApply.classList.add('hover');
  skipApply.onmouseleave = () => skipApply.classList.remove('hover');
  if (skipMaxBtn) {
    skipMaxBtn.onmouseenter = () => skipMaxBtn.classList.add('hover');
    skipMaxBtn.onmouseleave = () => skipMaxBtn.classList.remove('hover');
    skipMaxBtn.onclick = () => {
      const max = crystalShop?.crystalUpgrades?.stageSkip || 0;
      skipInput.value = max;
      skipInput.dispatchEvent(new Event('input'));
    };
  }
  skipInput.addEventListener('input', () => {
    let v = parseInt(skipInput.value, 10);
    const m = crystalShop?.crystalUpgrades?.stageSkip || 0;
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    skipInput.value = v;
  });
  skipApply.onclick = () => {
    let v = parseInt(skipInput.value, 10);
    const m = crystalShop?.crystalUpgrades?.stageSkip || 0;
    if (isNaN(v) || v < 0) v = 0;
    if (v > m) v = m;
    options.stageSkip = v;
    dataManager.saveGame();
    showToast(t('options.toast.stageSkipApplied'), 'success');
  };

  // 3) Reset Stage Skip At
  const resetPurchased = !!crystalShop?.crystalUpgrades?.resetStageSkip;
  const resetVal = options?.resetStageSkip != null ? options.resetStageSkip : 0;
  const resetRow = document.createElement('div');
  resetRow.className = 'option-row';
  resetRow.innerHTML = html`
    <label class="reset-stage-skip-label">${t('options.resetStageSkipAt')}:</label>
    <input type="number" class="reset-stage-skip-input" min="0" value="${resetVal}" ${resetPurchased ? '' : 'disabled'} />
    <button class="max-btn" type="button" ${resetPurchased ? '' : 'disabled'} data-i18n="common.max">${t('common.max')}</button>
    <button class="apply-btn" type="button" ${resetPurchased ? '' : 'disabled'} data-i18n="common.apply">${t('common.apply')}</button>
  `;
  const resetInput = resetRow.querySelector('input');
  const resetMaxBtn = resetRow.querySelector('.max-btn');
  const resetApply = resetRow.querySelector('.apply-btn');
  resetApply.onmouseenter = () => resetApply.classList.add('hover');
  resetApply.onmouseleave = () => resetApply.classList.remove('hover');
  if (resetMaxBtn) {
    resetMaxBtn.onmouseenter = () => resetMaxBtn.classList.add('hover');
    resetMaxBtn.onmouseleave = () => resetMaxBtn.classList.remove('hover');
    resetMaxBtn.onclick = () => {
      if (resetMaxBtn.disabled) return;
      const highest = Math.max(
        ...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0),
      );
      resetInput.value = highest || 0;
      resetInput.dispatchEvent(new Event('input'));
    };
  }
  resetInput.addEventListener('input', () => {
    let v = parseInt(resetInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    resetInput.value = v;
  });
  resetApply.onclick = () => {
    if (resetInput.disabled) return;
    let v = parseInt(resetInput.value, 10);
    if (isNaN(v) || v < 0) v = 0;
    options.resetStageSkip = v;
    dataManager.saveGame();
    showToast(t('options.toast.resetStageSkipApplied'), 'success');
  };

  // 4) Stage Lock Value
  const stageLockPurchased = !!crystalShop?.crystalUpgrades?.stageLock;
  const stageLockEnabled = !!options?.stageLockEnabled;
  const stageLockValue = options?.stageLock || 0;
  const stageLockRow = document.createElement('div');
  stageLockRow.className = 'option-row';
  stageLockRow.innerHTML = html`
    <label
      for="inline-stage-lock-input"
      class="stage-lock-label"
      data-i18n="options.stageLockStage"
    >${t('options.stageLockStage')}:</label>
    <input
      type="number"
      id="inline-stage-lock-input"
      class="stage-lock-input"
      min="0"
      value="${stageLockValue}"
      ${stageLockPurchased ? '' : 'disabled'}
    />
    <button
      class="max-btn"
      type="button"
      ${stageLockPurchased ? '' : 'disabled'}
      data-i18n="common.max"
    >${t('common.max')}</button>
    <button
      class="apply-btn"
      type="button"
      ${stageLockPurchased ? '' : 'disabled'}
      data-i18n="common.apply"
    >${t('common.apply')}</button>
  `;
  const stageLockInput = stageLockRow.querySelector('.stage-lock-input');
  const stageLockMaxBtn = stageLockRow.querySelector('.max-btn');
  const stageLockApply = stageLockRow.querySelector('.apply-btn');
  if (stageLockApply) {
    stageLockApply.onmouseenter = () => stageLockApply.classList.add('hover');
    stageLockApply.onmouseleave = () => stageLockApply.classList.remove('hover');
  }
  if (stageLockMaxBtn) {
    stageLockMaxBtn.onmouseenter = () => stageLockMaxBtn.classList.add('hover');
    stageLockMaxBtn.onmouseleave = () => stageLockMaxBtn.classList.remove('hover');
    stageLockMaxBtn.onclick = () => {
      if (stageLockMaxBtn.disabled || !stageLockInput) return;
      const highest = Math.max(
        ...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0),
      );
      stageLockInput.value = highest || 0;
      stageLockInput.dispatchEvent(new Event('input'));
    };
  }
  if (stageLockInput) {
    if (!stageLockPurchased) {
      const tooltip = t('options.stageLock.disabledTooltip');
      stageLockInput.title = tooltip;
      if (stageLockApply) stageLockApply.title = tooltip;
      if (stageLockMaxBtn) stageLockMaxBtn.title = tooltip;
    }
    stageLockInput.addEventListener('input', () => {
      let v = parseInt(stageLockInput.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      stageLockInput.value = v;
    });
  }
  if (stageLockApply) {
    stageLockApply.onclick = () => {
      if (stageLockApply.disabled || !stageLockInput) return;
      let v = parseInt(stageLockInput.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      options.stageLock = v;
      dataManager.saveGame();
      if (typeof options.updateStageLockOption === 'function') {
        options.updateStageLockOption();
      }
      showToast(t('options.toast.stageLockApplied'), 'success');
    };
  }

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
