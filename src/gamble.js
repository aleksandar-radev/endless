import { hero, inventory, statistics, game, gambleState } from './globals.js';
import { ALL_ITEM_TYPES, ITEM_RARITY, RARITY_ORDER } from './constants/items.js';
import { itemStatScaleFactor } from './constants/stats/stats.js';
import { getCurrentRegion } from './region.js';
import { PERSISTENT_SLOTS, INVENTORY_TAB_SIZE } from './inventory.js';
import { updateResources, formatNumber, showToast, showTooltip, hideTooltip, positionTooltip } from './ui/ui.js';
import { t } from './i18n.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { createRandomUniqueItem, createRandomSetPiece } from './item.js';
import { createModal, closeModal } from './ui/modal.js';

const html = String.raw;

const GAMBLE_COST_MULTIPLIER = 25;
const GAMBLE_STASH_SIZE = 20;

const BASE_SALVAGE_VALUE = 250;
const TIER_SCALE_MODIFIER = 1.5;
const MAX_GAME_TIER = 12;

/**
 * Controls how much of the player's rarity bonuses (itemRarityPercent stat and
 * enemy-based boost) apply when generating a gambled item's rarity.
 *   0   = use base drop chances only (most common outcome: Normal/Magic)
 *   0.5 = half of the player's bonuses apply
 *   1   = full bonuses apply (identical to a regular drop)
 * Increase toward 1 to make higher-rarity gamble results more likely.
 */
const GAMBLE_RARITY_MULTIPLIER = 0.2;

/**
 * Base rarity weights used exclusively for gamble rolls, independent of the
 * global ITEM_RARITY chances used by regular drops.
 * Higher number = more likely. Set a rarity to 0 to disable it entirely.
 * Global base values for reference: NORMAL=130, MAGIC=40, RARE=18, EPIC=6, LEGENDARY=2, MYTHIC=1
 * UNIQUE and SET are disabled in regular drops (chance=0) but can be enabled here.
 */
const GAMBLE_BASE_CHANCES = {
  NORMAL: 260,
  MAGIC:  80,
  RARE:   30,
  EPIC:   10,
  LEGENDARY: 4,
  MYTHIC: 1,
  UNIQUE: 1,
  SET:    1,
};

function generateGambleRarity() {
  const ENEMY_RARITY_ORDER = Object.keys(ENEMY_RARITY);
  const enemy = game.currentEnemy;
  const enemyRank = enemy?.rarity ? ENEMY_RARITY_ORDER.indexOf(enemy.rarity) : 0;
  const maxRank = ENEMY_RARITY_ORDER.length - 1;
  const boostFactor = (enemyRank / maxRank) * GAMBLE_RARITY_MULTIPLIER;

  const rarityBonus = (hero.stats.itemRarityPercent || 0) * GAMBLE_RARITY_MULTIPLIER;

  // Build entries from GAMBLE_BASE_CHANCES directly so UNIQUE/SET are included
  // even though they have chance=0 in the global ITEM_RARITY config.
  const entries = Object.entries(GAMBLE_BASE_CHANCES)
    .filter(([, chance]) => chance > 0)
    .map(([key, baseChance]) => {
      const rarityIndex = RARITY_ORDER.indexOf(key);
      const weight = baseChance * (1 + boostFactor * rarityIndex) * (1 + rarityBonus * rarityIndex);
      return { key, weight };
    });

  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const { key, weight } of entries) {
    if (roll < weight) return key;
    roll -= weight;
  }
  return 'NORMAL';
}

/**
 * Calculate the gold cost to gamble an item at a given max level and tier.
 * Cost = 25x the average salvage value of a NORMAL rarity item between level 1 and maxLevel.
 */
export function getGambleCost(maxLevel, tier) {
  const minSalvageValue = Math.floor(
    BASE_SALVAGE_VALUE * itemStatScaleFactor(1, tier * TIER_SCALE_MODIFIER),
  );
  const maxSalvageValue = Math.floor(
    BASE_SALVAGE_VALUE * itemStatScaleFactor(maxLevel, tier * TIER_SCALE_MODIFIER),
  );

  const avgSalvageValue = (minSalvageValue + maxSalvageValue) / 2;
  return Math.floor(avgSalvageValue * GAMBLE_COST_MULTIPLIER);
}

/**
 * Get the maximum tier the player has reached.
 */
function getMaxUnlockedTier() {
  const highestStages = statistics?.highestStages || {};
  let maxTier = 1;
  for (let tier = 1; tier <= MAX_GAME_TIER; tier++) {
    if ((highestStages[tier] || 0) > 0) {
      maxTier = tier;
    }
  }
  // Also consider current region
  const region = getCurrentRegion();
  if (region && region.tier > maxTier) {
    maxTier = region.tier;
  }
  return maxTier;
}

/**
 * Gamble for a random item at the given tier.
 * Returns true if successful, false if not enough gold or inventory full.
 */
export function gambleItem(tier) {
  const highestStages = statistics?.highestStages || {};
  const maxLevel = highestStages[tier] || 1;
  const cost = getGambleCost(maxLevel, tier);

  if (hero.gold < cost) {
    showToast(t('gamble.notEnoughGold'), 'error');
    return false;
  }

  if (gambleState.stash.length >= GAMBLE_STASH_SIZE) {
    showToast(t('gamble.stashFull'), 'error');
    return false;
  }

  // Deduct gold
  hero.gold -= cost;

  const level = Math.floor(Math.random() * maxLevel) + 1;

  // Create item based on rolled rarity
  const rarity = generateGambleRarity();
  let item;
  if (rarity === 'UNIQUE') {
    item = createRandomUniqueItem(tier, level);
  } else if (rarity === 'SET') {
    item = createRandomSetPiece(tier, level);
  } else {
    const randomType = ALL_ITEM_TYPES[Math.floor(Math.random() * ALL_ITEM_TYPES.length)];
    item = inventory.createItem(randomType, level, rarity, tier);
  }

  gambleState.stash.push(item);

  updateResources();
  renderGambleStash();

  return true;
}

function moveItemToInventory(item) {
  if (selectedStashItem?.id === item.id) clearGambleSelection();
  const limit = PERSISTENT_SLOTS + inventory.getUnlockedTabCount() * INVENTORY_TAB_SIZE;
  const emptySlot = inventory.inventoryItems.findIndex((slot, index) => slot === null && index >= PERSISTENT_SLOTS && index < limit);
  if (emptySlot === -1) {
    showToast(t('gamble.inventoryFull'), 'error');
    return false;
  }
  const idx = gambleState.stash.indexOf(item);
  if (idx !== -1) gambleState.stash.splice(idx, 1);
  inventory.addItemToInventory(item);
  renderGambleStash();
  return true;
}

function sellItem(item) {
  if (selectedStashItem?.id === item.id) clearGambleSelection();
  const idx = gambleState.stash.indexOf(item);
  if (idx === -1) return;
  gambleState.stash.splice(idx, 1);
  const gold = inventory.getItemSalvageValue(item);
  hero.gainGold(gold);
  showToast(`${t('gamble.sell')}: +${formatNumber(gold)} ${t('inventory.gold')}`, 'success');
  updateResources();
  renderGambleStash();
}

function moveAllToInventory() {
  clearGambleSelection();
  const limit = PERSISTENT_SLOTS + inventory.getUnlockedTabCount() * INVENTORY_TAB_SIZE;
  let moved = 0;
  while (gambleState.stash.length > 0) {
    const emptySlot = inventory.inventoryItems.findIndex((slot, index) => slot === null && index >= PERSISTENT_SLOTS && index < limit);
    if (emptySlot === -1) break;
    const item = gambleState.stash.shift();
    inventory.addItemToInventory(item);
    moved++;
  }
  if (moved === 0) {
    showToast(t('gamble.inventoryFull'), 'error');
  }
  renderGambleStash();
}

function sellAll() {
  clearGambleSelection();
  if (gambleState.stash.length === 0) return;
  const totalGold = gambleState.stash.reduce((sum, item) => sum + inventory.getItemSalvageValue(item), 0);
  gambleState.stash = [];
  hero.gainGold(totalGold);
  showToast(`${t('gamble.sellAll')}: +${formatNumber(totalGold)} ${t('inventory.gold')}`, 'success');
  updateResources();
  renderGambleStash();
}

/**
 * Initialize the gamble UI inside the gamble shop tab panel.
 */
export function initializeGambleUI() {
  const gambleTab = document.getElementById('gamble');
  if (!gambleTab) return;

  const maxTier = getMaxUnlockedTier();
  const region = getCurrentRegion();
  const currentTier = region?.tier || 1;
  const highestStages = statistics?.highestStages || {};
  const maxLevel = highestStages[currentTier] || 1;

  gambleTab.innerHTML = html`
    <div class="gamble-container">
      <h3 class="gamble-title">${t('gamble.title')}</h3>
      <p class="gamble-description">${t('gamble.description')}</p>

      <div class="gamble-controls">
        <div class="gamble-control-group">
          <label for="gamble-tier">${t('gamble.tier')}</label>
          <select id="gamble-tier" class="gamble-select">
            ${Array.from({ length: maxTier }, (_, i) => i + 1)
    .map((tier) => `<option value="${tier}" ${tier === currentTier ? 'selected' : ''}>${t('gamble.tier')} ${tier}</option>`)
    .join('')}
          </select>
        </div>
      </div>

      <div class="gamble-cost-display">
        <span>${t('gamble.cost')}: </span>
        <span id="gamble-cost-value" class="gamble-cost-value">${formatNumber(getGambleCost(maxLevel, currentTier))} ${t('inventory.gold')}</span>
      </div>

      <button id="gamble-buy-btn" class="gamble-buy-btn">${t('gamble.buy')}</button>

      <div class="gamble-stash-section">
        <div class="gamble-stash-header">
          <span class="gamble-stash-title">${t('gamble.stash')}</span>
          <div class="gamble-stash-bulk-actions">
            <button id="gamble-selected-move-btn" class="gamble-bulk-btn gamble-selected-btn hidden">${t('gamble.moveToInventory')}</button>
            <button id="gamble-selected-sell-btn" class="gamble-bulk-btn gamble-bulk-btn--sell gamble-selected-btn hidden">${t('gamble.sell')}</button>
            <button id="gamble-move-all-btn" class="gamble-bulk-btn">${t('gamble.moveAll')}</button>
            <button id="gamble-sell-all-btn" class="gamble-bulk-btn gamble-bulk-btn--sell">${t('gamble.sellAll')}</button>
          </div>
        </div>
        <div id="gamble-stash-grid" class="gamble-stash-grid"></div>
      </div>
    </div>
  `;

  setupGambleHandlers();
  renderGambleStash();
}

function renderGambleStash() {
  const grid = document.getElementById('gamble-stash-grid');
  if (!grid) return;

  const selectedId = selectedStashItem?.id || null;

  grid.innerHTML = '';
  for (let i = 0; i < GAMBLE_STASH_SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'gamble-stash-cell';

    const item = gambleState.stash[i];
    if (item) {
      cell.classList.add('gamble-stash-cell--filled');
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = `gamble-stash-item rarity-${item.rarity.toLowerCase()}`;
      if (item.id === selectedId) itemBtn.classList.add('selected');
      itemBtn.dataset.itemId = item.id;
      itemBtn.innerHTML = `<div class="item-icon">${item.getIcon()}</div>`;

      // Desktop tooltip
      itemBtn.addEventListener('mouseenter', (e) => {
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
        showTooltip(`<div class="item-tooltip">${item.getTooltipHTML()}</div>`, e, 'flex-tooltip');
      });
      itemBtn.addEventListener('mousemove', positionTooltip);
      itemBtn.addEventListener('mouseleave', hideTooltip);

      // Tap / click to select
      itemBtn.addEventListener('click', () => {
        hideTooltip();
        closeGambleContextMenu();
        if (selectedStashItem?.id === item.id) {
          clearGambleSelection();
        } else {
          selectGambleItem(item, itemBtn);
        }
      });

      // Right-click context menu (desktop)
      itemBtn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openGambleContextMenu(item, e.clientX, e.clientY);
      });

      // Long-press context menu (mobile)
      let pressTimer;
      itemBtn.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
          const touch = e.touches[0];
          openGambleContextMenu(item, touch.clientX, touch.clientY);
        }, 600);
      });
      itemBtn.addEventListener('touchend', () => clearTimeout(pressTimer));
      itemBtn.addEventListener('touchmove', () => clearTimeout(pressTimer));

      cell.appendChild(itemBtn);
    }

    grid.appendChild(cell);
  }
}

let selectedStashItem = null;

function selectGambleItem(item, itemBtn) {
  selectedStashItem = item;
  document.querySelectorAll('#gamble-stash-grid .gamble-stash-item').forEach((el) => el.classList.remove('selected'));
  itemBtn.classList.add('selected');

  document.querySelectorAll('.gamble-selected-btn').forEach((el) => el.classList.remove('hidden'));

  const moveBtn = document.getElementById('gamble-selected-move-btn');
  const sellBtn = document.getElementById('gamble-selected-sell-btn');
  if (moveBtn) moveBtn.onclick = () => { moveItemToInventory(item); clearGambleSelection(); };
  if (sellBtn) sellBtn.onclick = () => { sellItem(item); clearGambleSelection(); };
}

function clearGambleSelection() {
  selectedStashItem = null;
  document.querySelectorAll('#gamble-stash-grid .gamble-stash-item').forEach((el) => el.classList.remove('selected'));
  document.querySelectorAll('.gamble-selected-btn').forEach((el) => el.classList.add('hidden'));
}

function openGambleContextMenu(item, x, y) {
  closeGambleContextMenu();
  const menu = document.createElement('div');
  menu.id = 'gamble-context-menu';
  menu.className = 'item-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const inspectBtn = document.createElement('button');
  inspectBtn.textContent = t('inventory.inspect');
  inspectBtn.onclick = () => {
    closeGambleContextMenu();
    const goldValue = inventory.getItemSalvageValue(item);
    const inspectContent = item.getTooltipHTML() + `<div class="gamble-inspect-salvage"><b>${t('inventory.salvageValue')}</b> ${goldValue} ${t('inventory.gold').toLowerCase()}</div>`;
    const dialog = createModal({
      id: 'gamble-inspect-item',
      className: 'inventory-modal',
      content: `<div class="inventory-modal-content"><button class="modal-close">&times;</button>${inspectContent.replace('item-tooltip', 'item-preview')}</div>`,
    });
    dialog.querySelector('.modal-close').onclick = () => closeModal('gamble-inspect-item');
  };

  const moveBtn = document.createElement('button');
  moveBtn.textContent = t('gamble.moveToInventory');
  moveBtn.onclick = () => { closeGambleContextMenu(); moveItemToInventory(item); };

  const sellBtn = document.createElement('button');
  sellBtn.textContent = t('gamble.sell');
  sellBtn.onclick = () => { closeGambleContextMenu(); sellItem(item); };

  menu.appendChild(inspectBtn);
  menu.appendChild(moveBtn);
  menu.appendChild(sellBtn);
  document.body.appendChild(menu);

  setTimeout(() => document.addEventListener('click', handleGambleContextOutside));
}

function handleGambleContextOutside(e) {
  if (!e.target.closest('#gamble-context-menu')) closeGambleContextMenu();
}

function closeGambleContextMenu() {
  const menu = document.getElementById('gamble-context-menu');
  if (menu) {
    menu.remove();
    document.removeEventListener('click', handleGambleContextOutside);
  }
}

function setupGambleHandlers() {
  const tierSelect = document.getElementById('gamble-tier');
  const buyBtn = document.getElementById('gamble-buy-btn');
  const moveAllBtn = document.getElementById('gamble-move-all-btn');
  const sellAllBtn = document.getElementById('gamble-sell-all-btn');

  if (!tierSelect || !buyBtn) return;

  const updateCostDisplay = () => {
    const tier = parseInt(tierSelect.value, 10) || 1;
    const highestStages = statistics?.highestStages || {};
    const maxLevel = highestStages[tier] || 1;
    const cost = getGambleCost(maxLevel, tier);
    const costEl = document.getElementById('gamble-cost-value');
    if (costEl) {
      costEl.textContent = `${formatNumber(cost)} ${t('inventory.gold')}`;
      costEl.classList.toggle('unaffordable', hero.gold < cost);
    }
  };

  tierSelect.addEventListener('change', updateCostDisplay);

  buyBtn.addEventListener('click', () => {
    const tier = parseInt(tierSelect.value, 10) || 1;
    gambleItem(tier);
    updateCostDisplay();
  });

  if (moveAllBtn) moveAllBtn.addEventListener('click', moveAllToInventory);
  if (sellAllBtn) sellAllBtn.addEventListener('click', sellAll);

  // Initial affordability check
  updateCostDisplay();
}

/**
 * Update gamble cost affordability display.
 */
export function updateGambleAffordability() {
  const tierSelect = document.getElementById('gamble-tier');
  if (!tierSelect) return;

  const tier = parseInt(tierSelect.value, 10) || 1;
  const highestStages = statistics?.highestStages || {};
  const maxLevel = highestStages[tier] || 1;
  const cost = getGambleCost(maxLevel, tier);
  const costEl = document.getElementById('gamble-cost-value');
  if (costEl) {
    costEl.textContent = `${formatNumber(cost)} ${t('inventory.gold')}`;
    costEl.classList.toggle('unaffordable', hero.gold < cost);
  }
}
