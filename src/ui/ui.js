import Enemy from '../enemy.js';
import { game, hero, skillTree, quests, statistics, inventory, dataManager, options } from '../globals.js';
import { t } from '../i18n.js';
import { updateQuestsUI } from './questUi.js';
import { updateStatsAndAttributesUI } from './statsAndAttributesUi.js';
import { TabIndicatorManager } from './tabIndicatorManager.js';
import { selectBoss, updateBossUI } from './bossUi.js';
import { ELEMENTS } from '../constants/common.js';
import { calculateArmorReduction, calculateEvasionChance, calculateHitChance, calculateResistanceReduction } from '../combat.js';
export {
  initializeSkillTreeUI,
  initializeSkillTreeStructure,
  updateSkillTreeValues,
  updateActionBar,
  updateBuffIndicators,
  showManaWarning,
} from './skillTreeUi.js';

// Tab indicator manager instance
let tabIndicatorManager = null;

const html = String.raw;

// Format numbers with thousands separators.
// Accepts numbers or numeric strings and returns a string with the given
// separator (default comma) applied to the integer part.
export function formatNumber(value, separator = ',') {
  if (value === null || value === undefined) return value;
  const parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.join('.');
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
        <div class="tooltip-header">Gold <span class="icon"><i class="mdi mdi-currency-usd"></i></span></div>
        <div class="tooltip-desc">Used for training.</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-crystal',
      tooltip: () => html`
        <div class="tooltip-header">Crystals <span class="icon"><i class="mdi mdi-diamond-stone"></i></span></div>
        <div class="tooltip-desc">Rare currency for powerful upgrades and skill resets.</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-souls',
      tooltip: () => html`
        <div class="tooltip-header">Souls <span class="icon"><i class="mdi mdi-ghost"></i></span></div>
        <div class="tooltip-desc">Earned from killing bosses in Arena.</div>
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
        if (value) value.textContent = game.stage;
      } else if (region === 'arena') {
        if (label) {
          const val = t('combat.bossLevel');
          if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
        }
        if (value) value.textContent = hero.bossLevel;
      }
      // Hide or show region-selector based on region
      const regionSelector = document.getElementById('region-selector');
      regionSelector.style.display = region === 'arena' ? 'none' : '';
    });
  });
  // Render initial region panel and set region-selector visibility
  renderRegionPanel(game.fightMode);
  const regionSelector = document.getElementById('region-selector');
  regionSelector.style.display = game.fightMode === 'arena' ? 'none' : '';
}

export function switchTab(tabName) {
  const previousTab = game.activeTab;

  document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

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

  game.activeTab = tabName;

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
  const lifePercentage = (enemy.currentLife / enemy.life) * 100;
  document.getElementById('enemy-life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('enemy-life-text').textContent = `${formatNumber(
    Math.max(0, Math.floor(enemy.currentLife)),
  )} / ${formatNumber(Math.floor(enemy.life))}`;

  // Main stats
  const dmg = document.getElementById('enemy-damage-value');
  if (dmg) dmg.textContent = formatNumber(Math.floor(enemy.damage));
  const fireDmg = document.getElementById('enemy-fire-damage-value');
  if (fireDmg) fireDmg.textContent = formatNumber(Math.floor(enemy.fireDamage || 0));
  const coldDmg = document.getElementById('enemy-cold-damage-value');
  if (coldDmg) coldDmg.textContent = formatNumber(Math.floor(enemy.coldDamage || 0));
  const airDmg = document.getElementById('enemy-air-damage-value');
  if (airDmg) airDmg.textContent = formatNumber(Math.floor(enemy.airDamage || 0));
  const earthDmg = document.getElementById('enemy-earth-damage-value');
  if (earthDmg) earthDmg.textContent = formatNumber(Math.floor(enemy.earthDamage || 0));
  const lightningDmg = document.getElementById('enemy-lightning-damage-value');
  if (lightningDmg) lightningDmg.textContent = formatNumber(Math.floor(enemy.lightningDamage || 0));
  const waterDmg = document.getElementById('enemy-water-damage-value');
  if (waterDmg) waterDmg.textContent = formatNumber(Math.floor(enemy.waterDamage || 0));

  const armor = document.getElementById('enemy-armor-value');
  if (armor) {
  // Use PoE2 formula: reduction = armor / (armor + 10 * damage)
    const reduction = calculateArmorReduction(enemy.armor, hero.stats.damage);
    armor.textContent = `${formatNumber(Math.floor(enemy.armor || 0))} (${Math.floor(reduction)}%)`;
  }
  const evasion = document.getElementById('enemy-evasion-value');
  if (evasion) {
    const reduction = calculateEvasionChance(enemy.evasion, hero.stats.attackRating, undefined, hero.stats.chanceToHitPercent || 0);
    evasion.textContent = `${formatNumber(Math.floor(enemy.evasion || 0))} (${Math.floor(reduction)}%)`;
  }
  const atkRating = document.getElementById('enemy-attack-rating-value');
  if (atkRating) {
    // Show enemy attack rating and their hit chance against the player
    const hitChance = calculateHitChance(enemy.attackRating, hero.stats.evasion);
    atkRating.textContent = `${formatNumber(Math.floor(enemy.attackRating || 0))} (${Math.floor(hitChance)}%)`;
  }
  const atkSpeed = document.getElementById('enemy-attack-speed-value');
  if (atkSpeed) atkSpeed.textContent = formatNumber((enemy.attackSpeed || 0).toFixed(2));
  const fireRes = document.getElementById('enemy-fire-resistance-value');
  if (fireRes) {
    const reduction = calculateResistanceReduction(enemy.fireResistance, hero.stats.fireDamage);
    fireRes.textContent = `${formatNumber(Math.floor(enemy.fireResistance || 0))} (${Math.floor(reduction)}%)`;
  }
  const coldRes = document.getElementById('enemy-cold-resistance-value');
  if (coldRes) {
    const reduction = calculateResistanceReduction(enemy.coldResistance, hero.stats.coldDamage);
    coldRes.textContent = `${formatNumber(Math.floor(enemy.coldResistance || 0))} (${Math.floor(reduction)}%)`;
  }
  const airRes = document.getElementById('enemy-air-resistance-value');
  if (airRes) {
    const reduction = calculateResistanceReduction(enemy.airResistance, hero.stats.airDamage);
    airRes.textContent = `${formatNumber(Math.floor(enemy.airResistance || 0))} (${Math.floor(reduction)}%)`;
  }
  const earthRes = document.getElementById('enemy-earth-resistance-value');
  if (earthRes) {
    const reduction = calculateResistanceReduction(enemy.earthResistance, hero.stats.earthDamage);
    earthRes.textContent = `${formatNumber(Math.floor(enemy.earthResistance || 0))} (${Math.floor(reduction)}%)`;
  }
  const lightningRes = document.getElementById('enemy-lightning-resistance-value');
  if (lightningRes) {
    const reduction = calculateResistanceReduction(enemy.lightningResistance, hero.stats.lightningDamage);
    lightningRes.textContent = `${formatNumber(Math.floor(enemy.lightningResistance || 0))} (${Math.floor(reduction)}%)`;
  }
  const waterRes = document.getElementById('enemy-water-resistance-value');
  if (waterRes) {
    const reduction = calculateResistanceReduction(enemy.waterResistance, hero.stats.waterDamage);
    waterRes.textContent = `${formatNumber(Math.floor(enemy.waterResistance || 0))} (${Math.floor(reduction)}%)`;
  }

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
      // Use Vite's BASE_URL if available, else fallback
      let baseUrl = '';
      try {
        baseUrl = import.meta.env.BASE_URL || '';
      } catch (e) {}
      img.src = baseUrl + game.currentEnemy.image;
    }
  }
}

export function updateEnemyStatLabels() {
  ['fire', 'cold', 'air', 'earth', 'lightning', 'water'].forEach((el) => {
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
  const stage = game.stage;
  const stageDisplay = document.getElementById('stage-display');
  const label = stageDisplay?.querySelector('.stage-label');
  const value = stageDisplay?.querySelector('.stage-value');
  if (stageDisplay && game.fightMode === 'arena') {
    if (label) {
      const val = t('combat.bossLevel');
      if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
    }
    if (value) value.textContent = hero.bossLevel;
    return;
  }
  if (stageDisplay) {
    if (label) {
      const val = t('combat.stage');
      if (val && val.includes('<')) label.innerHTML = val; else label.textContent = val;
    }
    if (value) value.textContent = stage;
  }
}

export function showToast(message, type = 'normal', duration = 3000) {
  // Remove existing toast if any
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

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
export function showDeathScreen(duration = 10, onRevive) {
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
export const formatStatName = (stat) => {
  const match = stat.match(/^(fire|cold|air|earth|lightning|water)(Damage|DamagePercent|Resistance|ResistancePercent|Penetration|PenetrationPercent)$/);
  if (match) {
    const [, element, suffix] = match;
    const icon = ELEMENTS[element]?.icon || '';
    const translation = t(stat);
    const baseMap = {
      Damage: 'Damage',
      DamagePercent: 'Damage %',
      Resistance: 'Res',
      ResistancePercent: 'Res %',
      Penetration: 'Penetration',
      PenetrationPercent: 'Penetration %',
    };
    let base = translation !== stat ? translation.replace(icon, '').trim() : baseMap[suffix];
    if (options?.shortElementalNames) {
      return `${icon} ${base}`.trim();
    }
    const elementName = element.charAt(0).toUpperCase() + element.slice(1);
    return `${icon} ${elementName} ${base}`.trim();
  }

  const translation = t(stat);
  if (translation !== stat) return translation;

  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Percent$/, '%')
    .trim();
};

/**
 * Update tab indicators based on current game state.
 * Call this function whenever game state changes that might affect indicators.
 */
export function updateTabIndicators(previousTab = null) {
  if (previousTab) {
    tabIndicatorManager.markTabAsVisited(previousTab);
  }
  tabIndicatorManager.markTabAsVisited(game.activeTab);

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
      <div class="enemy-damage">Damage: <span id="enemy-damage-value"></span></div>
      <div class="enemy-armor">Armor: <span id="enemy-armor-value"></span></div>
      <div class="enemy-evasion">Evasion: <span id="enemy-evasion-value"></span></div>
      <div class="enemy-attack-rating">Attack Rating: <span id="enemy-attack-rating-value"></span></div>
      <div class="enemy-attack-speed">Attack Speed: <span id="enemy-attack-speed-value"></span></div>
      <div></div>
      <!-- Empty div for layout -->
      <div >
        <div class="enemy-fire-damage">${formatStatName('fireDamage')}: <span id="enemy-fire-damage-value"></span></div>
        <div class="enemy-cold-damage">${formatStatName('coldDamage')}: <span id="enemy-cold-damage-value"></span></div>
        <div class="enemy-air-damage">${formatStatName('airDamage')}: <span id="enemy-air-damage-value"></span></div>
        <div class="enemy-earth-damage">${formatStatName('earthDamage')}: <span id="enemy-earth-damage-value"></span></div>
        <div class="enemy-lightning-damage">${formatStatName('lightningDamage')}: <span id="enemy-lightning-damage-value"></span></div>
        <div class="enemy-water-damage">${formatStatName('waterDamage')}: <span id="enemy-water-damage-value"></span></div>
      </div>
      <div >
        <div class="enemy-fire-resistance">${formatStatName('fireResistance')}: <span id="enemy-fire-resistance-value"></span></div>
        <div class="enemy-cold-resistance">${formatStatName('coldResistance')}: <span id="enemy-cold-resistance-value"></span></div>
        <div class="enemy-air-resistance">${formatStatName('airResistance')}: <span id="enemy-air-resistance-value"></span></div>
        <div class="enemy-earth-resistance">${formatStatName('earthResistance')}: <span id="enemy-earth-resistance-value"></span></div>
        <div class="enemy-lightning-resistance">${formatStatName('lightningResistance')}: <span id="enemy-lightning-resistance-value"></span></div>
        <div class="enemy-water-resistance">${formatStatName('waterResistance')}: <span id="enemy-water-resistance-value"></span></div>
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
    updateBossUI();
  } else {
    const panel = document.createElement('div');
    panel.id = 'explore-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = baseHtml;

    container.appendChild(panel);

    // Initialize enemy UI values
    updateEnemyStats();
    updateResources();
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
