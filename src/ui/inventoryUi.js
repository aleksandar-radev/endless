import { hero, inventory, dataManager, crystalShop } from '../globals.js';
import { ITEM_SLOTS, MATERIALS_SLOTS, PERSISTENT_SLOTS } from '../inventory.js';
import { MATERIALS } from '../constants/materials.js';
import { hideTooltip, positionTooltip, showToast, showTooltip } from '../ui/ui.js';
import { ITEM_RARITY, RARITY_ORDER, SLOT_REQUIREMENTS, ITEM_TYPES } from '../constants/items.js';
import { closeModal, createModal } from './modal.js';
import { formatStatName } from './ui.js';
import { t } from '../i18n.js';

let selectedItemEl = null;
let awaitingSlot = false;
let currentFilter = '';

const html = String.raw;

export function initializeInventoryUI(inv) {
  // Create all inventory UI structure dynamically
  const inventoryTab = document.getElementById('inventory');
  if (!inventoryTab) return;
  inventoryTab.innerHTML = '';

  // Equipment container
  const equipmentContainer = document.createElement('div');
  equipmentContainer.className = 'equipment-container';
  equipmentContainer.innerHTML = html`
    <div class="equipment-layout">
      <div class="equipment-slots">
        <div class="equipment-slot" data-slot="head"><div class="slot-indicator">🪖</div></div>
        <div class="equipment-slot" data-slot="amulet"><div class="slot-indicator">📿</div></div>
        <div class="equipment-slot" data-slot="chest"><div class="slot-indicator">👕</div></div>
        <div class="equipment-slot" data-slot="belt"><div class="slot-indicator">🎗️</div></div>
        <div class="equipment-slot" data-slot="weapon"><div class="slot-indicator">⚔️</div></div>
        <div class="equipment-slot" data-slot="offhand"><div class="slot-indicator">🛡️</div></div>
        <div class="equipment-slot" data-slot="gloves"><div class="slot-indicator">🧤</div></div>
        <div class="equipment-slot" data-slot="ring1"><div class="slot-indicator">💍</div></div>
        <div class="equipment-slot" data-slot="legs"><div class="slot-indicator">👖</div></div>
        <div class="equipment-slot" data-slot="ring2"><div class="slot-indicator">💍</div></div>
        <div class="equipment-slot" data-slot="boots"><div class="slot-indicator">👢</div></div>
      </div>
      <div class="character-preview">👤</div>
    </div>
    <div class="salvage-container">
      <div class="inventory-tabs">
        <button id="items-tab" class="inventory-btn active" data-i18n="inventory.items">${t('inventory.items')}</button>
        <button id="materials-tab" class="inventory-btn" data-i18n="inventory.materials">${t('inventory.materials')}</button>
      </div>
      <div class="sort-row">
        <select id="sort-mode-select" class="inventory-btn sort-select">
          <option value="type-rarity-level">${t('inventory.typeRarityLevel')}</option>
          <option value="type-level-rarity">${t('inventory.typeLevelRarity')}</option>
          <option value="rarity-level">${t('inventory.rarityLevel')}</option>
          <option value="level-rarity">${t('inventory.levelRarity')}</option>
        </select>
        <div id="sort-inventory" class="inventory-btn sort-btn" aria-label="${t('inventory.sort')}"><span role="img" aria-label="Sort">🔃</span></div>
      </div>
      <button id="open-salvage-modal" class="inventory-btn" data-i18n="inventory.salvage">${t('inventory.salvage')}</button>
      <div class="search-container">
        <input type="text" id="inventory-filter" class="inventory-btn filter-input" placeholder="${t('inventory.searchItems')}" />
        <span class="search-icon">🔍</span>
        <button id="mobile-equip-btn" class="inventory-btn mobile-equip-btn" style="display: none" data-i18n="inventory.equip">${t('inventory.equip')}</button>
      </div>
    </div>
  `;
  inventoryTab.appendChild(equipmentContainer);

  // Inventory grid
  const inventoryGrid = document.createElement('div');
  inventoryGrid.className = 'inventory-grid';
  inventoryGrid.innerHTML = html`
    <div class="materials-grid" style="display: none">
      <div class="materials-container"></div>
    </div>
    <div class="persistent-inventory"></div>
    <div class="grid-container"></div>
  `;
  inventoryTab.appendChild(inventoryGrid);

  // Create ITEM_SLOTS empty cells (10x20 grid)
  const gridContainer = inventoryTab.querySelector('.grid-container');
  for (let i = 0; i < ITEM_SLOTS; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    if (i < PERSISTENT_SLOTS) {
      cell.classList.add('persistent');
    }
    gridContainer.appendChild(cell);
  }
  updateInventoryGrid(inv);

  const mobileEquipBtn = document.getElementById('mobile-equip-btn');

  const sortBtn = document.getElementById('sort-inventory');
  const sortModeSelect = document.getElementById('sort-mode-select');
  const itemsTab = document.getElementById('items-tab');
  const materialsTab = document.getElementById('materials-tab');
  const materialsGrid = document.querySelector('.materials-grid');
  const openSalvageModalBtn = document.getElementById('open-salvage-modal');
  const filterInput = document.getElementById('inventory-filter');

  // Set sort mode from localStorage or default
  let sortMode = localStorage.getItem('inventorySortMode') || 'type-rarity-level';
  sortModeSelect.value = sortMode;

  // Map for full text tooltips
  const sortModeFullText = {
    'type-rarity-level': t('inventory.typeRarityLevel'),
    'type-level-rarity': t('inventory.typeLevelRarity'),
    'rarity-level': t('inventory.rarityLevel'),
    'level-rarity': t('inventory.levelRarity'),
  };
  function updateSortBtnText() {}
  updateSortBtnText();

  if (itemsTab && materialsTab && gridContainer && materialsGrid) {
    itemsTab.addEventListener('click', () => {
      itemsTab.classList.add('active');
      materialsTab.classList.remove('active');
      gridContainer.style.display = '';
      materialsGrid.style.display = 'none';
      updateSortBtnText();
      applyFilter(inv);
    });
    materialsTab.addEventListener('click', () => {
      materialsTab.classList.add('active');
      itemsTab.classList.remove('active');
      gridContainer.style.display = 'none';
      materialsGrid.style.display = '';
      updateMaterialsGrid(inv);
      updateSortBtnText();
    });
  }

  // Sort mode change
  sortModeSelect.addEventListener('change', () => {
    sortMode = sortModeSelect.value;
    localStorage.setItem('inventorySortMode', sortMode);
    updateSortBtnText();
    if (itemsTab.classList.contains('active')) {
      sortInventory(sortMode);
    }
  });

  filterInput.addEventListener('input', () => {
    currentFilter = filterInput.value.toLowerCase();
    applyFilter(inv);
  });

  // Sort button sorts only the visible tab
  sortBtn.addEventListener('click', () => {
    if (itemsTab.classList.contains('active')) {
      sortInventory(sortMode);
      showToast(`${t('inventory.sortedItemsBy')} ${sortModeSelect.options[sortModeSelect.selectedIndex].text}`, 'success');
    } else {
      sortMaterials();
      showToast(t('inventory.sortedMaterials'), 'success');
    }
  });

  // Add tooltip for sort button (custom, shows full text for current sort mode)
  sortBtn.addEventListener('mouseenter', (e) => {
    let tooltipText = '';
    if (itemsTab.classList.contains('active')) {
      tooltipText = `${t('inventory.sortItemsBy')} <b>${sortModeFullText[sortModeSelect.value]}</b>`;
    } else {
      tooltipText = t('inventory.sortMaterials');
    }
    const tooltipContent = `<div class="item-tooltip">${tooltipText}</div>`;
    showTooltip(tooltipContent, e, 'flex-tooltip');
  });
  sortBtn.addEventListener('mousemove', positionTooltip);
  sortBtn.addEventListener('mouseleave', hideTooltip);

  // Salvage modal logic
  openSalvageModalBtn.addEventListener('click', () => {
    showSalvageModal(inv);
  });

  mobileEquipBtn.addEventListener('click', () => {
    if (!selectedItemEl) return;
    const itemData = inventory.getItemById(selectedItemEl.dataset.itemId);

    const equippedSlot = Object.entries(inventory.equippedItems).find(
      ([slot, equipped]) => equipped && equipped.id === itemData.id,
    )?.[0];

    if (equippedSlot) {
      // Unequip when pressing equip on an equipped item
      inventory.equipItem(itemData, equippedSlot);
      hero.recalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
      return;
    }

    if (itemData.type === ITEM_TYPES.RING) {
      awaitingSlot = true;
      highlightEligibleSlots(itemData);
    } else {
      const slot = Object.keys(SLOT_REQUIREMENTS).find((s) =>
        SLOT_REQUIREMENTS[s].includes(itemData.type),
      );
      if (slot) {
        inventory.equipItem(itemData, slot);
        hero.recalculateFromAttributes();
        updateInventoryGrid();
      }
      clearMobileSelection();
    }
  });

  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('.inventory-item') &&
      !e.target.closest('.equipment-slot') &&
      !e.target.closest('#item-context-menu') &&
      e.target.id !== 'mobile-equip-btn'
    ) {
      clearMobileSelection();
    }
  });
}

// Salvage Modal Implementation
export function showSalvageModal(inv) {
  // Always switch to Items tab before showing the modal
  const itemsTab = document.getElementById('items-tab');
  const materialsTab = document.getElementById('materials-tab');
  const gridContainer = document.querySelector('.grid-container');
  const materialsGrid = document.querySelector('.materials-grid');
  if (itemsTab && materialsTab && gridContainer && materialsGrid) {
    itemsTab.classList.add('active');
    materialsTab.classList.remove('active');
    gridContainer.style.display = '';
    materialsGrid.style.display = 'none';
  }

  // Get the inventory tab DOM node
  const inventoryTab = document.getElementById('inventory');
  if (!inventoryTab) return;

  // Create a placeholder to restore the tab later
  const placeholder = document.createElement('div');
  placeholder.id = 'inventory-tab-placeholder';
  inventoryTab.parentNode.insertBefore(placeholder, inventoryTab);

  // Modal content: inventory tab (left), salvage sidebar (right)
  const html = String.raw;
  const autoSalvageLevel = crystalShop.crystalUpgrades.autoSalvage || 0;
  const selectedRarities = inv.autoSalvageRarities || [];
  const modalContent = html`
    <div class="inventory-salvage-modal-content">
      <button class="modal-close" aria-label="Close">&times;</button>
      <div class="inventory-modal-full-content"></div>
      <div class="salvage-modal-sidebar">
        <h3>Salvage Options</h3>
        <div class="salvage-options-modal">
          ${RARITY_ORDER.map(rarity => {
    const isChecked = selectedRarities.includes(rarity);
    const atCap = selectedRarities.length >= autoSalvageLevel;
    const isDisabled = autoSalvageLevel === 0 || (atCap && !isChecked);
    const inputId = `auto-salvage-toggle-${rarity}`;
    return html`
  <div class="salvage-row">
        <button class="salvage-btn-modal" data-rarity="${rarity}">${rarity.charAt(0) + rarity.slice(1).toLowerCase()} Items</button>
        <input id="${inputId}" name="${inputId}" type="checkbox" class="auto-salvage-toggle" data-rarity="${rarity}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} />
        <span class="toggle-btn${isChecked ? ' checked' : ''}${isDisabled ? ' disabled' : ''}"></span>
        <label for="${inputId}" class="auto-salvage-toggle-text">Auto</label>
      </div>
    `;
  }).join('')}
        </div>
        <div class="inventory-trash">
          <span class="inventory-trash-icon">🗑️</span>
          <div class="inventory-trash-label">Drag item here</div>
        </div>
        <div class="salvage-material-row">
          <div>
            <div class="salvage-reward-title">Salvage reward</div>
            <div class="salvage-material-toggle-container">
              Gold<input id="salvage-material-toggle-main" name="salvage-material-toggle-main" type="checkbox" class="salvage-material-toggle" ${inv.salvageUpgradeMaterials ? 'checked' : ''} />
              <span class="toggle-btn${inv.salvageUpgradeMaterials ? ' checked' : ''}${!crystalShop.crystalUpgrades?.salvageMaterials ? ' disabled' : ''}"></span>
              <label for="salvage-material-toggle-main">Upgrade materials</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Use the modal helper
  const overlay = createModal({
    id: 'salvage-modal',
    className: 'inventory-modal',
    content: modalContent,
    closeOnOutsideClick: true,
    onClose: () => {
      // Restore equipment container visibility and move inventory tab back
      if (hiddenEquipment) hiddenEquipment.style.display = '';
      placeholder.parentNode.insertBefore(inventoryTab, placeholder);
      placeholder.remove();
      // Force UI refresh to fix equipped items disappearing
      updateInventoryGrid(inv);
    },
  });

  // Move the inventory tab DOM node into the modal
  overlay.querySelector('.inventory-modal-full-content').appendChild(inventoryTab);

  // Hide the equipment container inside the modal
  const hiddenEquipment = inventoryTab.querySelector('.equipment-container');
  if (hiddenEquipment) hiddenEquipment.style.display = 'none';

  // Salvage button logic
  overlay.querySelectorAll('.salvage-btn-modal').forEach((btn) => {
    btn.onclick = () => {
      const rarity = btn.dataset.rarity;
      inventory.salvageItemsByRarity(rarity);
      closeModal(overlay);
      showSalvageModal(inv);
    };
  });

  // Auto-salvage toggle logic
  overlay.querySelectorAll('.salvage-row').forEach((row) => {
    const input = row.querySelector('.auto-salvage-toggle');
    const toggleBtn = row.querySelector('.toggle-btn');
    // Always sync visual state on open
    syncToggleState();
    // Input change handler
    input.addEventListener('change', () => {
      if (autoSalvageLevel === 0) return;
      let selected = inv.autoSalvageRarities ? [...inv.autoSalvageRarities] : [];
      const rarity = input.dataset.rarity;
      if (input.checked) {
        if (selected.length >= autoSalvageLevel && !selected.includes(rarity)) {
          input.checked = false;
          showToast(`You can only auto-salvage ${autoSalvageLevel} rarit${autoSalvageLevel === 1 ? 'y' : 'ies'}.`, 'info');
          return;
        }
        if (!selected.includes(rarity)) selected.push(rarity);
      } else {
        selected = selected.filter(r => r !== rarity);
      }
      inv.setAutoSalvageRarities(selected);
      syncToggleState();
    });
    // Click handler for toggle-btn
    toggleBtn.addEventListener('click', () => {
      if (input.disabled) return;
      input.checked = !input.checked;
      input.dispatchEvent(new Event('change'));
    });
    // Helper to sync all toggles' state
    function syncToggleState() {
      const selected = inv.autoSalvageRarities ? [...inv.autoSalvageRarities] : [];
      overlay.querySelectorAll('.salvage-row').forEach((otherRow) => {
        const otherInput = otherRow.querySelector('.auto-salvage-toggle');
        const otherBtn = otherRow.querySelector('.toggle-btn');
        const otherRarity = otherInput.dataset.rarity;
        const isChecked = selected.includes(otherRarity);
        const atCap = selected.length >= autoSalvageLevel;
        const isDisabled = autoSalvageLevel === 0 || (atCap && !isChecked);
        otherInput.checked = isChecked;
        otherInput.disabled = isDisabled;
        otherBtn.classList.toggle('checked', isChecked);
        otherBtn.classList.toggle('disabled', isDisabled);
      });
    }
  });

  // Salvage material toggle
  const matToggle = overlay.querySelector('.salvage-material-toggle');
  const matToggleBtn = overlay.querySelector('.salvage-material-toggle + .toggle-btn');
  if (matToggle && matToggleBtn) {
    // Only allow toggle if the crystal upgrade is owned
    const hasUpgrade = crystalShop.crystalUpgrades.salvageMaterials;
    matToggle.disabled = !hasUpgrade;
    if (!hasUpgrade) {
      matToggle.title = 'Unlock this option by purchasing the Salvage Materials upgrade in the Crystal Shop.';
      matToggle.checked = false;
      matToggleBtn.classList.remove('checked');
    }
    function syncMatToggleState() {
      matToggle.checked = inv.salvageUpgradeMaterials && hasUpgrade;
      matToggleBtn.classList.toggle('checked', inv.salvageUpgradeMaterials && hasUpgrade);
      matToggleBtn.classList.toggle('disabled', !hasUpgrade);
    }
    matToggle.addEventListener('change', () => {
      if (!hasUpgrade) {
        matToggle.checked = false;
        return;
      }
      inv.setSalvageUpgradeMaterials(matToggle.checked);
      syncMatToggleState();
    });
    matToggleBtn.addEventListener('click', () => {
      if (!hasUpgrade) return;
      matToggle.checked = !matToggle.checked;
      matToggle.dispatchEvent(new Event('change'));
    });
    // Always sync on open and after modal update
    syncMatToggleState();
  }

  // Trash drag logic (scoped to modal)
  const trash = overlay.querySelector('.inventory-trash');
  trash.addEventListener('dragover', (e) => {
    e.preventDefault();
    trash.classList.add('drag-over');
  });
  trash.addEventListener('dragleave', () => {
    trash.classList.remove('drag-over');
  });
  trash.addEventListener('drop', (e) => {
    e.preventDefault();
    trash.classList.remove('drag-over');
    const itemId = e.dataTransfer.getData('text/plain');
    const item = inventory.getItemById(itemId);
    if (!item) return;
    let removed = false;
    const invIdx = inventory.inventoryItems.findIndex((i) => i && i.id === item.id);
    if (invIdx !== -1) {
      inventory.inventoryItems[invIdx] = null;
      removed = true;
    }
    if (removed) {
      let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
      let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
      if (inventory.salvageUpgradeMaterials) {
        const { id, qty } = inventory.getItemSalvageMaterial(item);
        inventory.addMaterial({ id, qty });
        msg += `, gained ${qty} ${MATERIALS[id].name}`;
      } else {
        let goldGained = inventory.getItemSalvageValue(item);
        if (goldGained > 0) {
          hero.gainGold(goldGained);
          msg += `, gained ${goldGained} gold`;
        }
      }
      if (crystalsGained > 0) {
        hero.gainCrystals(crystalsGained);
        msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
      }
      showToast(msg, 'success');
      updateInventoryGrid();
      updateMaterialsGrid();
      dataManager.saveGame();
      closeModal(overlay);
      showSalvageModal(inv);
    }
  });

  // Tooltip for trash
  trash.addEventListener('mouseenter', (e) => {
    const tooltipContent = html`
      <div class="item-tooltip tooltip-center">
        <div class="tooltip-trash-icon">🗑️</div>
        <b>Salvage Item</b>
        <div class="tooltip-trash-desc">Drag and drop an item here to salvage it.</div>
      </div>
    `;
    showTooltip(tooltipContent, e, 'flex-tooltip');
  });
  trash.addEventListener('mousemove', positionTooltip);
  trash.addEventListener('mouseleave', hideTooltip);
}

export function updateInventoryGrid(inv) {
  if (!inv) {
    inv = inventory;
  }
  cleanupTooltips();

  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell) => (cell.innerHTML = ''));

  const items = document.querySelectorAll('.inventory-item');
  items.forEach((item) => item.remove());

  inv.inventoryItems.forEach((item, index) => {
    const cell = document.querySelector(`.grid-cell:nth-child(${index + 1})`);
    const html = String.raw;
    if (cell && item) {
      cell.innerHTML = html`
        <div class="inventory-item rarity-${item.rarity.toLowerCase()}" draggable="true" data-item-id="${item.id}">
          <div class="item-icon">${item.getIcon()}</div>
        </div>
      `;
    }
  });

  Object.entries(inv.equippedItems).forEach(([slot, item]) => {
    const slotElement = document.querySelector(`[data-slot="${slot}"]`);
    if (slotElement && item) {
      const newItem = document.createElement('div');
      newItem.className = 'inventory-item';
      newItem.draggable = true;
      newItem.dataset.itemId = item.id;
      newItem.style.borderColor = ITEM_RARITY[item.rarity].color;
      newItem.innerHTML = `<div class="item-icon">${item.getIcon()}</div>`;

      const existingItem = slotElement.querySelector('.inventory-item');
      if (existingItem) {
        slotElement.replaceChild(newItem, existingItem);
      } else {
        slotElement.appendChild(newItem);
      }
    }
  });

  setupDragAndDrop();
  applyFilter(inv);
  updateMaterialsGrid(inv);
}

function applyFilter(inv) {
  const filter = currentFilter.trim();
  const items = document.querySelectorAll('.grid-container .inventory-item');
  if (!inv) return;

  // Parse filter into tokens (split by space, ignore empty)
  const tokens = filter
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  items.forEach((el) => {
    const item = inv.getItemById(el.dataset.itemId);
    if (!item) return;

    if (!filter) {
      el.classList.remove('filtered-out', 'filtered-match');
      return;
    }

    // For each token, check if item matches ALL tokens (AND logic)
    let allMatch = true;
    for (const token of tokens) {
      let match = false;
      const [key, ...rest] = token.split(':');
      const value = rest.join(':');
      const valLower = value.toLowerCase();
      if (key.toLowerCase() === 'level') {
        const num = parseInt(value, 10);
        match = !isNaN(num) && item.level === num;
      } else if (key.toLowerCase() === 'tier') {
        const num = parseInt(value, 10);
        match = !isNaN(num) && item.tier === num;
      } else {
        // Free text: match name, formatted stat names, or stat values
        const term = token.toLowerCase();
        // Match item name
        match = (item.name && item.name.toLowerCase().includes(term));
        // Match formatted stat names (e.g., "Crit Damage")
        if (!match && item.stats) {
          match = Object.keys(item.stats).some((s) =>
            formatStatName(s).toLowerCase().includes(term),
          );
        }
        // Match stat values (e.g., "10")
        if (!match && item.stats) {
          match = Object.values(item.stats).some((v) => String(v).toLowerCase().includes(term));
        }
      }
      if (!match) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      el.classList.add('filtered-match');
      el.classList.remove('filtered-out');
    } else {
      el.classList.add('filtered-out');
      el.classList.remove('filtered-match');
    }
  });
}

export function cleanupTooltips() {
  const tooltips = document.querySelectorAll('.item-tooltip');
  tooltips.forEach((tooltip) => tooltip.remove());
}

export function setupDragAndDrop() {
  // Remove existing listeners first
  removeExistingListeners();

  // Setup new listeners
  setupGridCells();
  setupEquipmentSlots();
  setupItemDragAndTooltip();

  // Add trash drop logic
  const trash = document.querySelector('.inventory-trash');
  if (trash) {
    trash.addEventListener('dragover', (e) => {
      e.preventDefault();
      trash.classList.add('drag-over');
    });
    trash.addEventListener('dragleave', () => {
      trash.classList.remove('drag-over');
    });
    trash.addEventListener('drop', (e) => {
      e.preventDefault();
      trash.classList.remove('drag-over');
      const itemId = e.dataTransfer.getData('text/plain');
      const item = inventory.getItemById(itemId);
      if (!item) return;
      // Only allow inventory/equipped items, not materials
      let removed = false;
      const invIdx = inventory.inventoryItems.findIndex((i) => i && i.id === item.id);
      if (invIdx !== -1) {
        inventory.inventoryItems[invIdx] = null;
        removed = true;
      } else {
        for (const [slot, equippedItem] of Object.entries(inventory.equippedItems)) {
          if (equippedItem && equippedItem.id === item.id) {
            delete inventory.equippedItems[slot];
            removed = true;
            break;
          }
        }
      }
      if (removed) {
        let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
        let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
        if (inventory.salvageUpgradeMaterials) {
          const { id, qty } = inventory.getItemSalvageMaterial(item);
          inventory.addMaterial({ id, qty });
          msg += `, gained ${qty} ${MATERIALS[id].name}`;
        } else {
          let goldGained = inventory.getItemSalvageValue(item);
          if (goldGained > 0) {
            hero.gainGold(goldGained);
            msg += `, gained ${goldGained} gold`;
          }
        }
        if (crystalsGained > 0) {
          hero.gainCrystals(crystalsGained);
          msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
        }
        showToast(msg, 'success');
        updateInventoryGrid();
        updateMaterialsGrid();
        dataManager.saveGame();
      }
    });

    // --- ADVANCED TOOLTIP LOGIC ---
    trash.addEventListener('mouseenter', (e) => {
      const tooltipContent = html`
        <div class="item-tooltip" style="text-align:center;">
          <div style="font-size:2em;">🗑️</div>
          <b>Salvage Item</b>
          <div style="margin-top:4px;font-size:0.95em;">Drag and drop an item here to salvage it.</div>
        </div>
      `;
      showTooltip(tooltipContent, e, 'flex-tooltip');
    });
    trash.addEventListener('mousemove', positionTooltip);
    trash.addEventListener('mouseleave', hideTooltip);
  }

  // Add drop logic for material cells
  const materialCells = document.querySelectorAll('.materials-cell');
  materialCells.forEach((cell, targetIdx) => {
    cell.addEventListener('dragover', (e) => {
      // Only allow material drag
      if (e.dataTransfer.types.includes('text/material-id')) {
        e.preventDefault();
        cell.classList.add('drag-over');
      }
    });
    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over');
    });
    cell.addEventListener('drop', (e) => {
      if (!e.dataTransfer.types.includes('text/material-id')) return;
      e.preventDefault();
      cell.classList.remove('drag-over');
      const matId = e.dataTransfer.getData('text/material-id');
      const fromIdx = parseInt(e.dataTransfer.getData('text/material-index'), 10);
      if (isNaN(fromIdx) || fromIdx === targetIdx) return;
      // Swap materials between cells
      const temp = inventory.materials[targetIdx];
      inventory.materials[targetIdx] = inventory.materials[fromIdx];
      inventory.materials[fromIdx] = temp;
      updateMaterialsGrid();
      dataManager.saveGame();
    });
  });
}

export function removeExistingListeners() {
  // Remove grid cell listeners
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell) => {
    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);
  });

  // Remove equipment slot listeners
  const slots = document.querySelectorAll('.equipment-slot');
  slots.forEach((slot) => {
    const newSlot = slot.cloneNode(true);
    slot.parentNode.replaceChild(newSlot, slot);
  });
}

export function setupGridCells() {
  const cells = document.querySelectorAll('.grid-cell');
  cells.forEach((cell) => {
    cell.addEventListener('dragover', handleDragOver.bind(inventory));
    cell.addEventListener('drop', handleDrop.bind(inventory));
  });
}

export function handleDragOver(e) {
  e.preventDefault();
}

export function handleDrop(e) {
  e.preventDefault();
  cleanupTooltips();
  const itemId = e.dataTransfer.getData('text/plain');
  const item = inventory.getItemById(itemId);
  const slot = e.target.closest('.equipment-slot');
  const cell = e.target.closest('.grid-cell');

  if (!item) return;

  if (slot) {
    // Add inventory check to prevent dropping on current slot
    const currentSlot = Object.entries(inventory.equippedItems).find(
      ([_, equippedItem]) => equippedItem?.id === item.id,
    )?.[0];

    if (currentSlot === slot.dataset.slot) {
      return; // Exit if trying to drop on same slot
    }
    // Special handling for ring slots
    if (slot.dataset.slot === 'ring1' || slot.dataset.slot === 'ring2') {
      if (inventory.canEquipInSlot(item, slot.dataset.slot)) {
        inventory.handleRingSlotDrop(item, slot.dataset.slot);
      }
    } else if (inventory.canEquipInSlot(item, slot.dataset.slot)) {
      inventory.equipItem(item, slot.dataset.slot);
    }
  } else if (cell) {
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    inventory.moveItemToPosition(item, cellIndex);
  }

  updateInventoryGrid();
}

export function setupEquipmentSlots() {
  const slots = document.querySelectorAll('.equipment-slot');
  slots.forEach((slot) => {
    slot.addEventListener('dragover', handleDragOver.bind(inventory));
    slot.addEventListener('drop', handleDrop.bind(inventory));
    slot.addEventListener('click', () => {
      handleSlotTap(slot);
    });
  });
}

export function setupItemDragAndTooltip() {
  const items = document.querySelectorAll('.inventory-item');

  items.forEach((item) => {
    // Add double-click handler
    item.addEventListener('dblclick', () => {
      const itemData = inventory.getItemById(item.dataset.itemId);
      if (!itemData) return;

      const equippedSlot = Object.entries(inventory.equippedItems).find(
        ([slot, equippedItem]) => equippedItem?.id === itemData.id,
      )?.[0];

      if (equippedSlot) {
        inventory.equipItem(itemData, equippedSlot);
        hero.recalculateFromAttributes();
        updateInventoryGrid();
        return;
      }

      for (const [slot, requirements] of Object.entries(SLOT_REQUIREMENTS)) {
        if (requirements.includes(itemData.type)) {
          if (!inventory.equippedItems[slot] || inventory.canEquipInSlot(itemData, slot)) {
            inventory.equipItem(itemData, slot);
            hero.recalculateFromAttributes();
            updateInventoryGrid();
            return;
          }
        }
      }
    });

    // Add dragstart event listener
    item.addEventListener('dragstart', (e) => {
      e.target.classList.add('dragging');
      e.dataTransfer.setData('text/plain', item.dataset.itemId);
      cleanupTooltips(); // Also clean tooltips on drag start
    });

    item.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
      document.querySelectorAll('.equipment-slot').forEach((slot) => {
        slot.classList.remove('valid-target', 'invalid-target');
      });
    });

    // Tooltip events
    item.addEventListener('mouseenter', (e) => {
      if (item.classList.contains('dragging')) return;

      const itemData = inventory.getItemById(item.dataset.itemId);
      if (!itemData) return;

      // Create tooltip content for hovered item
      let tooltipContent = `<div>${itemData.getTooltipHTML()}`;

      // --- Add salvage gold value if in salvage modal (for hovered item only) ---
      const inSalvageModal = item.closest('.inventory-salvage-modal-content');
      if (inSalvageModal) {
        if (inventory.salvageUpgradeMaterials) {
          const { id, qty } = inventory.getItemSalvageMaterial(itemData);
          tooltipContent += `<div style="margin-top:8px;
            color:#fff;
            background: rgba(224, 192, 96, 0.6);
            border-top:1px solid #e0c060;
            padding:6px 8px 4px 8px;
            border-radius:0 0 8px 8px;
            font-weight:bold;
            text-shadow: 1px 1px 2px #7a5c1c;">
            <b>Salvage Value:</b> ${qty} ${MATERIALS[id].name}
          </div>`;
        } else {
          let goldGained = inventory.getItemSalvageValue(itemData);
          tooltipContent += `<div style="margin-top:8px;
            color:#fff;
            background: rgba(224, 192, 96, 0.6);
            border-top:1px solid #e0c060;
            padding:6px 8px 4px 8px;
            border-radius:0 0 8px 8px;
            font-weight:bold;
            text-shadow: 1px 1px 2px #7a5c1c;">
            <b>Salvage Value:</b> ${goldGained} gold
          </div>`;
        }
      }
      tooltipContent += '</div>';

      // Check if the item is in the inventory
      const isInInventory = inventory.inventoryItems.some((inventoryItem) => inventoryItem?.id === itemData.id);

      // Find matching equipped items based on type
      const equippedItems = [];
      for (const [slot, equippedItem] of Object.entries(inventory.equippedItems)) {
        if (SLOT_REQUIREMENTS[slot].includes(itemData.type) && isInInventory) {
          equippedItems.push(equippedItem);
        }
      }

      // Add equipped items tooltips (no salvage value for these)
      if (equippedItems.length > 0) {
        equippedItems.forEach((equippedItem) => {
          if (equippedItem && equippedItem.id !== itemData.id) {
            tooltipContent += `<div>${equippedItem.getTooltipHTML(true)}</div>`;
          }
        });
      }

      showTooltip(tooltipContent, e, 'flex-tooltip');
    });

    item.addEventListener('mousemove', positionTooltip);
    item.addEventListener('mouseleave', hideTooltip);

    item.addEventListener('click', () => {
      handleItemTap(item);
    });

    let pressTimer;
    item.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        const touch = e.touches[0];
        openItemContextMenu(item, touch.clientX, touch.clientY);
      }, 600);
    });
    item.addEventListener('touchend', () => {
      clearTimeout(pressTimer);
    });
    item.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openItemContextMenu(item, e.clientX, e.clientY);
    });
  });
}

export function sortMaterials() {
  // Sort by MATERIALS[mat.id]?.sort ascending, then by id ascending
  const nonNullMaterials = inventory.materials.filter((mat) => mat !== null);
  nonNullMaterials.sort((a, b) => {
    const aSort = MATERIALS[a.id]?.sort ?? 9999;
    const bSort = MATERIALS[b.id]?.sort ?? 9999;

    if (aSort !== bSort) return aSort - bSort;
    return a.id.localeCompare(b.id);
  });
  // Fill up to MATERIALS_SLOTS with nulls
  inventory.materials = [...nonNullMaterials, ...new Array(MATERIALS_SLOTS - nonNullMaterials.length).fill(null)];
  updateMaterialsGrid();
  dataManager.saveGame();
}

export function updateMaterialsGrid(inv) {
  if (!inv) {
    inv = inventory;
  }
  const materialsContainer = document.querySelector('.materials-container');
  if (!materialsContainer) return;
  materialsContainer.innerHTML = '';
  for (let i = 0; i < MATERIALS_SLOTS; i++) {
    const mat = inv.materials[i];
    const icon = MATERIALS[mat?.id]?.icon || '🔹';
    const cell = document.createElement('div');
    cell.classList.add('materials-cell');
    if (mat) {
      // Get full material definition for tooltip
      const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};
      // Show only first 2 digits, and "9+" if >9
      let qtyDisplay = mat.qty > 9 ? '+' : String(mat.qty).padStart(2, ' ');
      cell.innerHTML = `<div class="material-item" draggable="true" data-mat-id="${mat.id}" data-mat-index="${i}">
          ${icon}
          <span class="mat-qty">${qtyDisplay}</span>
        </div>`;
      const materialItem = cell.querySelector('.material-item');
      // Tooltip on hover (show name and amount)
      materialItem.addEventListener('mouseenter', (e) => {
        let tooltipContent = `<div class="item-tooltip"><b>${matDef.icon || icon} ${
          matDef.name || mat.name || ''
        } &times; ${mat.qty}</b>`;
        if (matDef.description) tooltipContent += `<div style="margin-top:4px;">${matDef.description}</div>`;
        tooltipContent += '</div>';
        showTooltip(tooltipContent, e, 'flex-tooltip');
      });
      materialItem.addEventListener('mousemove', positionTooltip);
      materialItem.addEventListener('mouseleave', hideTooltip);
      // Click to use
      materialItem.addEventListener('click', () => {
        inventory.openMaterialDialog(mat);
      });
      // Drag events for materials
      materialItem.addEventListener('dragstart', (e) => {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/material-id', mat.id);
        e.dataTransfer.setData('text/material-index', i);
        cleanupTooltips();
      });
      materialItem.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
      });
    }
    // Add drop logic for this material cell
    cell.addEventListener('dragover', (e) => {
      if (e.dataTransfer.types.includes('text/material-id')) {
        e.preventDefault();
        cell.classList.add('drag-over');
      }
    });
    cell.addEventListener('dragleave', () => {
      cell.classList.remove('drag-over');
    });
    cell.addEventListener('drop', (e) => {
      if (!e.dataTransfer.types.includes('text/material-id')) return;
      e.preventDefault();
      cell.classList.remove('drag-over');
      const matId = e.dataTransfer.getData('text/material-id');
      const fromIdx = parseInt(e.dataTransfer.getData('text/material-index'), 10);
      if (isNaN(fromIdx) || fromIdx === i) return;
      // Swap materials between cells
      const temp = inventory.materials[i];
      inventory.materials[i] = inventory.materials[fromIdx];
      inventory.materials[fromIdx] = temp;
      updateMaterialsGrid();
      dataManager.saveGame();
    });
    materialsContainer.appendChild(cell);
  }
}

export function sortInventory(mode = 'type-rarity-level') {
  // Separate persistent and non-persistent items
  const persistentItems = inventory.inventoryItems.slice(0, PERSISTENT_SLOTS);
  const nonPersistentItems = inventory.inventoryItems.slice(PERSISTENT_SLOTS).filter((item) => item !== null);

  // Helper for type order
  const typeOrder = (a, b) => {
    if (a.type < b.type) return -1;
    if (a.type > b.type) return 1;
    return 0;
  };
  // Helper for rarity order
  const rarityOrder = (a, b) => RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
  // Helper for level order
  const levelOrder = (a, b) => b.level - a.level;

  // Sort logic based on mode
  nonPersistentItems.sort((a, b) => {
    switch (mode) {
      case 'type-rarity-level':
        return typeOrder(a, b) || rarityOrder(a, b) || levelOrder(a, b);
      case 'type-level-rarity':
        return typeOrder(a, b) || levelOrder(a, b) || rarityOrder(a, b);
      case 'rarity-level':
        return rarityOrder(a, b) || levelOrder(a, b);
      case 'level-rarity':
        return levelOrder(a, b) || rarityOrder(a, b);
      default:
        return rarityOrder(a, b) || levelOrder(a, b);
    }
  });

  // Combine persistent items with sorted non-persistent items and remaining nulls
  inventory.inventoryItems = [
    ...persistentItems,
    ...nonPersistentItems,
    ...new Array(ITEM_SLOTS - PERSISTENT_SLOTS - nonPersistentItems.length).fill(null),
  ];

  // Update the UI
  updateInventoryGrid();
  dataManager.saveGame();
}

function clearSlotHighlights() {
  document.querySelectorAll('.equipment-slot').forEach((slot) => {
    slot.classList.remove('eligible-slot', 'ineligible-slot');
  });
}

function showEquipButton(show) {
  const btn = document.getElementById('mobile-equip-btn');
  if (btn) btn.style.display = show ? '' : 'none';
}

export function handleItemTap(itemEl) {
  const itemData = inventory.getItemById(itemEl.dataset.itemId);
  if (awaitingSlot) {
    clearMobileSelection();
    return;
  }
  if (selectedItemEl === itemEl) {
    clearMobileSelection();
  } else {
    clearMobileSelection();
    selectedItemEl = itemEl;
    itemEl.classList.add('selected');
    showEquipButton(true);
  }
}

export function handleSlotTap(slotEl) {
  if (awaitingSlot && selectedItemEl) {
    const itemData = inventory.getItemById(selectedItemEl.dataset.itemId);
    if (inventory.canEquipInSlot(itemData, slotEl.dataset.slot)) {
      inventory.equipItem(itemData, slotEl.dataset.slot);
      hero.recalculateFromAttributes();
      updateInventoryGrid();
    }
    clearMobileSelection();
  } else {
    clearMobileSelection();
  }
}

function clearMobileSelection() {
  if (selectedItemEl) selectedItemEl.classList.remove('selected');
  selectedItemEl = null;
  awaitingSlot = false;
  clearSlotHighlights();
  showEquipButton(false);
  closeItemContextMenu();
}

function highlightEligibleSlots(itemData) {
  clearSlotHighlights();
  document.querySelectorAll('.equipment-slot').forEach((slot) => {
    if (inventory.canEquipInSlot(itemData, slot.dataset.slot)) {
      slot.classList.add('eligible-slot');
    } else {
      slot.classList.add('ineligible-slot');
    }
  });
}

function openItemContextMenu(itemEl, x, y) {
  closeItemContextMenu();
  const itemData = inventory.getItemById(itemEl.dataset.itemId);
  const menu = document.createElement('div');
  menu.id = 'item-context-menu';
  menu.className = 'item-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.innerHTML = `
    <button data-action="equip">Equip</button>
    <button data-action="inspect">Inspect</button>
    <button data-action="salvage">Salvage</button>
  `;
  document.body.appendChild(menu);

  menu.querySelector('[data-action="equip"]').onclick = () => {
    const equippedSlot = Object.entries(inventory.equippedItems).find(
      ([slot, equipped]) => equipped && equipped.id === itemData.id,
    )?.[0];

    if (equippedSlot) {
      inventory.equipItem(itemData, equippedSlot);
      hero.recalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
      closeItemContextMenu();
      return;
    }

    if (itemData.type === ITEM_TYPES.RING) {
      clearMobileSelection();
      selectedItemEl = itemEl;
      itemEl.classList.add('selected');
      showEquipButton(true);
      awaitingSlot = true;
      highlightEligibleSlots(itemData);
    } else {
      const slot = Object.keys(SLOT_REQUIREMENTS).find((s) =>
        SLOT_REQUIREMENTS[s].includes(itemData.type),
      );
      if (slot) {
        inventory.equipItem(itemData, slot);
        hero.recalculateFromAttributes();
        updateInventoryGrid();
      }
      clearMobileSelection();
    }
    closeItemContextMenu();
  };
  menu.querySelector('[data-action="inspect"]').onclick = () => {
    const dialog = createModal({
      id: 'inspect-item',
      className: 'inventory-modal',
      content: `<div class="inventory-modal-content"><button class="modal-close">&times;</button>${itemData.getTooltipHTML()}</div>`,
    });
    dialog.querySelector('.modal-close').onclick = () => closeModal('inspect-item');
    closeItemContextMenu();
  };
  menu.querySelector('[data-action="salvage"]').onclick = () => {
    inventory.salvageItem(itemData);
    closeItemContextMenu();
  };

  setTimeout(() => {
    document.addEventListener('click', handleContextOutside);
  });
}

function handleContextOutside(e) {
  if (!e.target.closest('#item-context-menu')) {
    closeItemContextMenu();
  }
}

function closeItemContextMenu() {
  const menu = document.getElementById('item-context-menu');
  if (menu) {
    menu.remove();
    document.removeEventListener('click', handleContextOutside);
  }
}
