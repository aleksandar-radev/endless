import Enemy from '../enemy.js';
import { game, hero, crystalShop, skillTree, quests, statistics, inventory } from '../globals.js';
import { updateQuestsUI } from './questUi.js';
import { updateStatsAndAttributesUI } from './statsAndAttributesUi.js';
import { TabIndicatorManager } from './tabIndicatorManager.js';
import { selectBoss, updateBossUI } from './bossUi.js';
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

export function initializeUI() {
  game.currentEnemy = new Enemy(game.stage);
  game.activeTab = 'stats'; // Match the default active tab in HTML

  // Initialize tab indicator manager
  tabIndicatorManager = new TabIndicatorManager();

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(game, btn.dataset.tab));
  });
  document.getElementById('start-btn').addEventListener('click', () => toggleGame());

  // Add tooltips to resource icons
  const resourceTooltips = [
    {
      selector: '.resource-gold',
      tooltip: () => `
        <div class="tooltip-header">Gold <span class="icon">💰</span></div>
        <div class="tooltip-desc">Used to buy upgrades.</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-crystal',
      tooltip: () => `
        <div class="tooltip-header">Crystals <span class="icon">💎</span></div>
        <div class="tooltip-desc">Rare currency for powerful upgrades and skill resets.</div>
        <div class="tooltip-note"></div>
      `,
    },
    {
      selector: '.resource-souls',
      tooltip: () => `
        <div class="tooltip-header">Souls <span class="icon">👻</span></div>
        <div class="tooltip-desc">Earned from killing monsters.</div>
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
  // Set default region
  game.fightMode = 'explore';
  // Initialize boss level for Arena mode
  game.bossLevel = game.bossLevel || 1;
  // Setup region tab switching (Explore / Arena)
  document.querySelectorAll('.region-tab').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const region = btn.dataset.region;
      if (game.fightMode === region) return; // No change needed
      const confirmed = await showConfirmDialog(
        `Are you sure you want to change to ${region}? That will reset your stage progress and will find you a new enemy`
      );
      if (!confirmed) return;
      // Reset stage progress and enemy as if the hero died
      if (game.gameStarted) {
        toggleGame(); // Stop the game if it's running
      }

      game.fightMode = region;
      updateStatsAndAttributesUI();

      // find new enemy/boss based on region
      if (game.fightMode === 'explore') {
        game.currentEnemy = new Enemy(game.stage);
      } else if (game.fightMode === 'arena') {
        selectBoss(game); // Select boss based on current level
      }
      // Toggle active tab class
      document.querySelectorAll('.region-tab').forEach((b) => b.classList.toggle('active', b === btn));
      // Render the appropriate region panel
      renderRegionPanel(region);
      updateStatsAndAttributesUI();
      // Update controls label
      const display = document.getElementById('stage-display');
      if (region === 'explore') {
        display.textContent = `Stage: ${game.stage}`;
      } else if (region === 'arena') {
        display.textContent = `Boss Level: ${hero.bossLevel}`;
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

  // ...existing code...
}

export function switchTab(game, tabName) {
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
    // Clear new items flag when visiting inventory
    inventory?.clearNewItemsFlag();
  }

  game.activeTab = tabName;

  // Update tab indicator manager - mark this tab as visited
  if (tabIndicatorManager) {
    tabIndicatorManager.markTabAsVisited(tabName);
  }

  // Update indicators after tab switch
  updateTabIndicators();
}

export function updateResources() {
  if (!game || typeof game.stage !== 'number') {
    console.error('Game is not initialized properly:', game);
    return;
  }

  // Update ghost icon (total souls)
  document.getElementById('souls').textContent = hero.souls || 0;
  document.getElementById('crystals').textContent = hero.crystals || 0;

  // Update other stats
  document.getElementById('gold').textContent = hero.gold || 0;
}

export function updatePlayerLife() {
  const stats = hero.stats;
  const lifePercentage = (stats.currentLife / stats.life) * 100;
  document.getElementById('life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('life-text').textContent = `${Math.max(0, Math.floor(stats.currentLife))}/${Math.floor(
    stats.life
  )}`;

  const manaPercentage = (stats.currentMana / stats.mana) * 100;
  document.getElementById('mana-fill').style.width = `${manaPercentage}%`;
  document.getElementById('mana-text').textContent = `${Math.max(0, Math.floor(stats.currentMana))}/${Math.floor(
    stats.mana
  )}`;
}

export function updateEnemyStats() {
  const enemy = game.currentEnemy;
  const lifePercentage = (enemy.currentLife / enemy.life) * 100;
  document.getElementById('enemy-life-fill').style.width = `${lifePercentage}%`;
  document.getElementById('enemy-life-text').textContent = `${Math.max(0, Math.floor(enemy.currentLife))}/${Math.floor(
    enemy.life
  )}`;

  const dmg = document.getElementById('enemy-damage-value');
  if (dmg) dmg.textContent = Math.floor(enemy.damage);
  if (game.fightMode === 'arena') {
    // Update boss UI ?
  } else if (game.fightMode === 'explore') {
    game.currentEnemy.setEnemyColor();
    game.currentEnemy.setEnemyName();
  }
}

/**
 * Start/stop the game loop
 */
export async function toggleGame() {
  const startBtn = document.getElementById('start-btn');
  // Toggle game loop state
  game.toggle();
  // Update button label and style
  startBtn.textContent = game.gameStarted ? 'Stop' : 'Fight';
  startBtn.style.backgroundColor = game.gameStarted ? '#DC2626' : '#059669';
}

export function updateStageUI() {
  const stage = game.stage;
  const stageDisplay = document.getElementById('stage-display');
  if (stageDisplay && game.fightMode === 'arena') {
    // In Arena mode, display boss level instead of stage
    stageDisplay.textContent = `Boss Level: ${hero.bossLevel}`;
    return;
  }
  if (stageDisplay) {
    stageDisplay.textContent = `Stage: ${stage}`;
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

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

// Example usage: Attach event listeners to elements that need tooltips
document.querySelectorAll('.tooltip-target').forEach((element) => {
  element.addEventListener('mouseenter', (e) => showTooltip('Your tooltip content here', e));
  element.addEventListener('mousemove', positionTooltip);
  element.addEventListener('mouseleave', hideTooltip);
});

// ###########################
// Custom Confirm Dialog
// ###########################

export function showConfirmDialog(message, options = {}) {
  return new Promise((resolve) => {
    let dialog = document.getElementById('custom-confirm-dialog');
    if (!dialog) {
      dialog = document.createElement('div');
      dialog.id = 'custom-confirm-dialog';
      dialog.innerHTML = `
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

// Helper function to convert camelCase to Title Case with spaces
export const formatStatName = (stat) => {
  // Handle special cases first
  if (stat === 'critChance') return 'Crit Chance';
  if (stat === 'critDamage') return 'Crit Damage';
  if (stat === 'lifeSteal') return 'Life Steal';
  if (stat === 'attackSpeed') return 'Attack Speed';
  if (stat === 'attackRating') return 'Attack Rating';
  if (stat === 'attackRatingPercent') return 'Attack Rating';
  if (stat === 'damage') return 'Damage';
  if (stat === 'damagePercent') return 'Damage %';
  if (stat === 'lifePercent') return 'Life %';
  if (stat === 'manaPercent') return 'Mana %';
  if (stat === 'armorPercent') return 'Armor %';
  if (stat === 'elementalDamagePercent') return 'Elemental Damage %';
  if (stat === 'lifeRegen') return 'Life Regeneration';
  if (stat === 'manaRegen') return 'Mana Regeneration';
  if (stat === 'bonusGoldPercent') return 'Bonus Gold';
  if (stat === 'bonusExperiencePercent') return 'Bonus Experience';
  if (stat === 'blockChance') return 'Block Chance';
  if (stat === 'fireDamage') return 'Fire Damage';
  if (stat === 'coldDamage') return 'Cold Damage';
  if (stat === 'airDamage') return 'Air Damage';
  if (stat === 'earthDamage') return 'Earth Damage';
  if (stat === 'fireDamagePercent') return 'Fire Damage %';
  if (stat === 'coldDamagePercent') return 'Cold Damage %';
  if (stat === 'airDamagePercent') return 'Air Damage %';
  if (stat === 'earthDamagePercent') return 'Earth Damage %';
  if (stat === 'strength') return 'Strength';
  if (stat === 'strengthPercent') return 'Strength %';
  if (stat === 'agility') return 'Agility';
  if (stat === 'agilityPercent') return 'Agility %';
  if (stat === 'vitality') return 'Vitality';
  if (stat === 'vitalityPercent') return 'Vitality %';
  if (stat === 'wisdom') return 'Wisdom';
  if (stat === 'wisdomPercent') return 'Wisdom %';
  if (stat === 'endurance') return 'Endurance';
  if (stat === 'endurancePercent') return 'Endurance %';
  if (stat === 'dexterity') return 'Dexterity';
  if (stat === 'dexterityPercent') return 'Dexterity %';
  if (stat === 'lifePerHit') return 'Life Per Hit';
  if (stat === 'lifePerHitPercent') return 'Life Per Hit %';
  if (stat === 'manaPerHit') return 'Mana Per Hit';
  if (stat === 'manaPerHitPercent') return 'Mana Per Hit %';
  if (stat === 'thornsDamage') return 'Thorns Damage';
  if (stat === 'thornsDamagePercent') return 'Thorns Damage %';
  if (stat === 'cooldownReductionPercent') return 'Cooldown Reduction %';
  if (stat === 'manaCostReductionPercent') return 'Mana Cost Reduction %';
  if (stat === 'buffDurationPercent') return 'Buff Duration %';
  if (stat === 'itemBonusesPercent') return 'Item Bonuses %';
  if (stat === 'doubleDamageChance') return 'Double Damage Chance';
  if (stat === 'resurrectionChance') return 'Resurrection Chance';
  if (stat === 'reflectFireDamage') return 'Reflect Fire Damage';
  if (stat === 'skillPoints') return 'Bonus Skill Points';
  if (stat === 'extraMaterialDropPercent') return 'Bonus Material Drop %';

  // Fallback: convert camelCase to Title Case with spaces
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
export function updateTabIndicators() {
  if (!tabIndicatorManager) return;

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
  container.innerHTML = '';
  if (region === 'arena') {
    const panel = document.createElement('div');
    panel.id = 'arena-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = html`<div class="enemy-section">
      <div class="enemy-main-row">
        <div class="enemy-avatar"></div>
        <div class="enemy-life-and-stats">
          <div class="enemy-name"></div>
          <div class="enemy-life-bar">
            <div id="enemy-life-fill"></div>
            <div id="enemy-life-text"></div>
          </div>
          <div class="enemy-stats">
            <div class="enemy-damage">Damage: <span id="enemy-damage-value"></span></div>
          </div>
        </div>
      </div>
    </div>`;
    container.appendChild(panel);
    updateBossUI(game.currentEnemy);
  } else {
    const panel = document.createElement('div');
    panel.id = 'explore-panel';
    panel.classList.add('region-panel');
    panel.innerHTML = html`<div class="enemy-section">
      <div class="enemy-main-row">
        <div class="enemy-avatar"></div>
        <div class="enemy-life-and-stats">
          <div class="enemy-name"></div>
          <div class="enemy-life-bar">
            <div id="enemy-life-fill"></div>
            <div id="enemy-life-text"></div>
          </div>
          <div class="enemy-stats">
            <div class="enemy-damage">Damage: <span id="enemy-damage-value"></span></div>
          </div>
        </div>
      </div>
    </div>`;

    container.appendChild(panel);

    // Initialize enemy UI values
    updateEnemyStats();
    updateResources();
  }
}
