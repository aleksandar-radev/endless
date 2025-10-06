import { hero, inventory, dataManager, crystalShop } from '../globals.js';
import { ITEM_SLOTS, MATERIALS_SLOTS, PERSISTENT_SLOTS } from '../inventory.js';
import { MATERIALS } from '../constants/materials.js';
import { hideTooltip, positionTooltip, showToast, showTooltip } from '../ui/ui.js';
import { ITEM_RARITY, RARITY_ORDER, SLOT_REQUIREMENTS, ITEM_TYPES, ITEM_ICONS } from '../constants/items.js';
import { closeModal, createModal } from './modal.js';
import { formatStatName } from './ui.js';
import { t, tp } from '../i18n.js';

let selectedItemEl = null;
let awaitingSlot = false;
let currentFilter = '';
let showingInventoryTargets = false;

const html = String.raw;
const BASE = import.meta.env.VITE_BASE_PATH;

let sortMode = (typeof localStorage !== 'undefined' && localStorage.getItem('inventorySortMode')) || 'type-rarity-level';

const sortModeShortText = {
  'type-rarity-level': t('inventory.typeRarityLevel'),
  'type-level-rarity': t('inventory.typeLevelRarity'),
  'rarity-level': t('inventory.rarityLevel'),
  'level-rarity': t('inventory.levelRarity'),
  'tier-rarity-level': t('inventory.tierRarityLevel'),
  'tier-level-rarity': t('inventory.tierLevelRarity'),
  'type-tier-rarity': t('inventory.typeTierRarity'),
  'type-tier-level': t('inventory.typeTierLevel'),
  'rarity-tier-level': t('inventory.rarityTierLevel'),
  'level-tier-rarity': t('inventory.levelTierRarity'),
};

const sortModeFullText = {
  'type-rarity-level': t('inventory.typeRarityLevelFull'),
  'type-level-rarity': t('inventory.typeLevelRarityFull'),
  'rarity-level': t('inventory.rarityLevelFull'),
  'level-rarity': t('inventory.levelRarityFull'),
  'tier-rarity-level': t('inventory.tierRarityLevelFull'),
  'tier-level-rarity': t('inventory.tierLevelRarityFull'),
  'type-tier-rarity': t('inventory.typeTierRarityFull'),
  'type-tier-level': t('inventory.typeTierLevelFull'),
  'rarity-tier-level': t('inventory.rarityTierLevelFull'),
  'level-tier-rarity': t('inventory.levelTierRarityFull'),
};

function getInventoryTab() {
  if (typeof document === 'undefined') return null;
  return document.getElementById('inventory');
}

if (typeof document !== 'undefined') {
  document.addEventListener('inventory:refresh', () => {
    updateInventoryGrid();
  });
}

function getPreferredSlotForItem(itemData) {
  if (!itemData) return null;
  const eligibleSlots = Object.keys(SLOT_REQUIREMENTS).filter((s) =>
    SLOT_REQUIREMENTS[s].includes(itemData.type),
  );
  if (eligibleSlots.length === 0) return null;
  const emptyValid = eligibleSlots.find(
    (slot) => !inventory.equippedItems[slot] && inventory.canEquipInSlot(itemData, slot),
  );
  if (emptyValid) return emptyValid;
  return eligibleSlots.find((slot) => inventory.canEquipInSlot(itemData, slot)) || null;
}

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
        <div class="equipment-slot" data-slot="head"><div class="slot-indicator">${ITEM_ICONS.HELMET}</div></div>
        <div class="equipment-slot" data-slot="amulet"><div class="slot-indicator">${ITEM_ICONS.AMULET}</div></div>
        <div class="equipment-slot" data-slot="chest"><div class="slot-indicator">${ITEM_ICONS.ARMOR}</div></div>
        <div class="equipment-slot" data-slot="belt"><div class="slot-indicator">${ITEM_ICONS.BELT}</div></div>
        <div class="equipment-slot" data-slot="weapon"><div class="slot-indicator">${ITEM_ICONS.SWORD}</div></div>
        <div class="equipment-slot" data-slot="offhand"><div class="slot-indicator">${ITEM_ICONS.SHIELD}</div></div>
        <div class="equipment-slot" data-slot="gloves"><div class="slot-indicator">${ITEM_ICONS.GLOVES}</div></div>
        <div class="equipment-slot" data-slot="ring1"><div class="slot-indicator">${ITEM_ICONS.RING}</div></div>
        <div class="equipment-slot" data-slot="legs"><div class="slot-indicator">${ITEM_ICONS.PANTS}</div></div>
        <div class="equipment-slot" data-slot="ring2"><div class="slot-indicator">${ITEM_ICONS.RING}</div></div>
        <div class="equipment-slot" data-slot="boots"><div class="slot-indicator">${ITEM_ICONS.BOOTS}</div></div>
      </div>
      <div class="character-preview"><img src="${BASE}/icons/account.svg" class="icon" alt="${t('icon.avatar')}"/></div>
    </div>
    <div class="salvage-container">
      <div class="inventory-tabs">
        <button id="items-tab" class="inventory-btn active" data-i18n="inventory.items">${t('inventory.items')}</button>
        <button id="materials-tab" class="inventory-btn" data-i18n="inventory.materials">${t('inventory.materials')}</button>
      </div>
      <div class="sort-row">
        <div id="sort-inventory" class="inventory-btn sort-btn" aria-label="${t('inventory.sort')}"><span role="img" aria-label="${t('inventory.sort')}"><img src="${BASE}/icons/refresh.svg" class="icon" alt="${t('inventory.sort')}"/></span></div>
      </div>
      <button id="open-salvage-modal" class="inventory-btn" data-i18n="inventory.options">${t('inventory.options')}</button>
      <div class="search-container">
        <input type="text" id="inventory-filter" class="inventory-btn filter-input" data-i18n-placeholder="inventory.searchItems" placeholder="${t('inventory.searchItems')}" />
        <span class="search-icon"><img src="${BASE}/icons/search.svg" class="icon" alt="${t('icon.search')}"/></span>
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
  const itemsTab = document.getElementById('items-tab');
  const materialsTab = document.getElementById('materials-tab');
  const materialsGrid = inventoryTab.querySelector('.materials-grid');
  const openSalvageModalBtn = document.getElementById('open-salvage-modal');
  const filterInput = document.getElementById('inventory-filter');
  function updateSortBtnText() {}
  updateSortBtnText();

  if (itemsTab && materialsTab && gridContainer && materialsGrid) {
    itemsTab.addEventListener('click', () => {
      itemsTab.classList.add('active');
      materialsTab.classList.remove('active');
      gridContainer.style.display = '';
      materialsGrid.style.display = 'none';
      updateSortBtnText();
      applyFilter(inv, inventoryTab);
    });
    materialsTab.addEventListener('click', () => {
      materialsTab.classList.add('active');
      itemsTab.classList.remove('active');
      gridContainer.style.display = 'none';
      materialsGrid.style.display = '';
      updateMaterialsGrid(inv, inventoryTab);
      updateSortBtnText();
    });
  }

  filterInput.addEventListener('input', () => {
    currentFilter = filterInput.value.toLowerCase();
    applyFilter(inv, inventoryTab);
  });

  // Sort button sorts only the visible tab
  sortBtn.addEventListener('click', () => {
    if (itemsTab.classList.contains('active')) {
      sortInventory(sortMode);
      showToast(`${t('inventory.sortedItemsBy')} ${sortModeShortText[sortMode]}`, 'success');
    } else {
      sortMaterials();
      showToast(t('inventory.sortedMaterials'), 'success');
    }
  });

  // Add tooltip for sort button (custom, shows full text for current sort mode)
  sortBtn.addEventListener('mouseenter', (e) => {
    let tooltipText = '';
    if (itemsTab.classList.contains('active')) {
      tooltipText = `${t('inventory.sortItemsBy')} <b>${sortModeFullText[sortMode]}</b>`;
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
      hero.queueRecalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
      return;
    }

    if (itemData.type === ITEM_TYPES.RING) {
      const emptyRingSlots = ['ring1', 'ring2'].filter((s) => !inventory.equippedItems[s]);
      const slot = emptyRingSlots[0] || 'ring1';
      inventory.equipItem(itemData, slot);
      hero.queueRecalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
    } else {
      const slot = getPreferredSlotForItem(itemData);
      if (slot) {
        inventory.equipItem(itemData, slot);
        hero.queueRecalculateFromAttributes();
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
  const inventoryTab = getInventoryTab();
  if (!inventoryTab) return;

  // Always switch to Items tab before showing the modal
  const itemsTab = document.getElementById('items-tab');
  const materialsTab = document.getElementById('materials-tab');
  const gridContainer = inventoryTab.querySelector('.grid-container');
  const materialsGrid = inventoryTab.querySelector('.materials-grid');
  if (itemsTab && materialsTab && gridContainer && materialsGrid) {
    itemsTab.classList.add('active');
    materialsTab.classList.remove('active');
    gridContainer.style.display = '';
    materialsGrid.style.display = 'none';
  }

  // Clear any previous selection and hide salvage button
  clearMobileSelection();

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
      <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
      <div class="salvage-modal-sidebar">
        <h3>${t('inventory.salvage')}</h3>
        <div class="salvage-options-modal">
          ${RARITY_ORDER.map(rarity => {
    const isChecked = selectedRarities.includes(rarity);
    const atCap = selectedRarities.length >= autoSalvageLevel;
    const isDisabled = autoSalvageLevel === 0 || (atCap && !isChecked);
    const inputId = `auto-salvage-toggle-${rarity}`;
    return html`
  <div class="salvage-row">
        <button class="salvage-btn-modal" data-rarity="${rarity}">${tp('inventory.salvageRarityItems', { rarity: t('rarity.' + rarity.toLowerCase()) })}</button>
        <input id="${inputId}" name="${inputId}" type="checkbox" class="auto-salvage-toggle" data-rarity="${rarity}" ${isChecked ? 'checked' : ''} ${isDisabled ? 'disabled' : ''} />
        <span class="toggle-btn${isChecked ? ' checked' : ''}${isDisabled ? ' disabled' : ''}"></span>
        <label for="${inputId}" class="auto-salvage-toggle-text">${t('inventory.auto')}</label>
      </div>
    `;
  }).join('')}
          <div class="salvage-all-row">
            <button id="salvage-all-btn" class="salvage-all-btn">${t('inventory.allItems')}</button>
          </div>
        </div>
        <div class="inventory-trash-row">
          <div class="inventory-trash">
            <span class="inventory-trash-icon"><img src="${BASE}/icons/delete.svg" class="icon" alt="${t('icon.delete')}"/></span>
            <div class="inventory-trash-label">${t('inventory.dragItemHere')}</div>
          </div>
          <button id="salvage-selected-btn" class="inventory-btn" style="display: none;">${t('inventory.salvage')}</button>
        </div>
        <div class="salvage-material-row">
          <div>
            <div class="salvage-reward-title">${t('inventory.salvageReward')}</div>
            <div class="salvage-material-toggle-container">
              ${t('inventory.gold')}<input id="salvage-material-toggle-main" name="salvage-material-toggle-main" type="checkbox" class="salvage-material-toggle" ${inv.salvageUpgradeMaterials ? 'checked' : ''} />
              <span class="toggle-btn${inv.salvageUpgradeMaterials ? ' checked' : ''}${!crystalShop.crystalUpgrades?.salvageMaterials ? ' disabled' : ''}"></span>
              <label for="salvage-material-toggle-main">${t('inventory.upgradeMaterials')}</label>
            </div>
          </div>
        </div>
        <div class="salvage-reward-title">${t('inventory.sortBy')}</div>
        <div class="sort-row">
          <select id="sort-mode-select" class="inventory-btn sort-select">
            <option value="type-rarity-level">${t('inventory.typeRarityLevel')}</option>
            <option value="type-level-rarity">${t('inventory.typeLevelRarity')}</option>
            <option value="rarity-level">${t('inventory.rarityLevel')}</option>
            <option value="level-rarity">${t('inventory.levelRarity')}</option>
            <option value="tier-rarity-level">${t('inventory.tierRarityLevel')}</option>
            <option value="tier-level-rarity">${t('inventory.tierLevelRarity')}</option>
            <option value="type-tier-rarity">${t('inventory.typeTierRarity')}</option>
            <option value="type-tier-level">${t('inventory.typeTierLevel')}</option>
            <option value="rarity-tier-level">${t('inventory.rarityTierLevel')}</option>
            <option value="level-tier-rarity">${t('inventory.levelTierRarity')}</option>
          </select>
        </div>
      </div>
      
      <div class="inventory-modal-full-content"></div>
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

  const sortModeSelect = overlay.querySelector('#sort-mode-select');
  if (sortModeSelect) {
    sortModeSelect.value = sortMode;
    sortModeSelect.addEventListener('change', () => {
      sortMode = sortModeSelect.value;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('inventorySortMode', sortMode);
      }
      sortInventory(sortMode);
    });
  }

  // Salvage button logic for specific rarities
  overlay.querySelectorAll('.salvage-btn-modal[data-rarity]').forEach((btn) => {
    btn.onclick = () => {
      const rarity = btn.dataset.rarity;
      inventory.salvageItemsByRarity(rarity);
      closeModal(overlay);
      showSalvageModal(inv);
    };
  });

  // Salvage all button
  const salvageAllBtn = overlay.querySelector('#salvage-all-btn');
  if (salvageAllBtn) {
    salvageAllBtn.onclick = () => {
      inventory.salvageAllItems();
      closeModal(overlay);
      showSalvageModal(inv);
    };
  }

  // Salvage selected item button
  const salvageSelectedBtn = overlay.querySelector('#salvage-selected-btn');
  if (salvageSelectedBtn) {
    salvageSelectedBtn.addEventListener('click', () => {
      if (!selectedItemEl) return;
      const item = inventory.getItemById(selectedItemEl.dataset.itemId);
      if (item) {
        inventory.salvageItem(item);
        clearMobileSelection();
      }
    });
  }

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
          const key = autoSalvageLevel === 1 ? 'inventory.autoSalvageLimitOne' : 'inventory.autoSalvageLimit';
          showToast(tp(key, { count: autoSalvageLevel }), 'info');
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
      matToggle.title = t('inventory.unlockSalvageMaterials');
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
        msg += `, gained ${qty} ${t(MATERIALS[id].name)}`;
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
        <div class="tooltip-trash-icon"><img src="${BASE}/icons/delete.svg" class="icon" alt="${t('icon.delete')}"/></div>
        <b>${t('inventory.salvageItem')}</b>
        <div class="tooltip-trash-desc">${t('inventory.dragDropToSalvage')}</div>
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
  const inventoryTab = getInventoryTab();
  if (!inventoryTab) return;

  const gridContainer = inventoryTab.querySelector('.grid-container');
  if (!gridContainer) return;

  cleanupTooltips();

  const cells = Array.from(gridContainer.querySelectorAll('.grid-cell'));
  cells.forEach((cell) => {
    cell.innerHTML = '';
    cell.classList.remove('drag-over');
  });

  inventoryTab.querySelectorAll('.equipment-slot').forEach((slot) => {
    slot.classList.remove('has-item');
    const existingItem = slot.querySelector('.inventory-item');
    if (existingItem) existingItem.remove();
    const ghost = slot.querySelector('.two-handed-ghost');
    if (ghost) ghost.remove();
  });

  inv.inventoryItems.forEach((item, index) => {
    if (!item) return;
    const cell = cells[index];
    if (!cell) return;
    const wrapper = document.createElement('button');
    wrapper.type = 'button';
    wrapper.className = `inventory-item rarity-${item.rarity.toLowerCase()}`;
    wrapper.draggable = true;
    wrapper.dataset.itemId = item.id;
    const displayName =
      typeof item.getDisplayName === 'function' ? item.getDisplayName() : item.name || '';
    if (displayName) {
      wrapper.setAttribute('aria-label', displayName);
      wrapper.title = displayName;
    }
    wrapper.innerHTML = `<div class="item-icon">${item.getIcon()}</div>`;
    cell.innerHTML = '';
    cell.appendChild(wrapper);
  });

  Object.entries(inv.equippedItems).forEach(([slot, item]) => {
    if (!item) return;
    const slotElement = inventoryTab.querySelector(`[data-slot="${slot}"]`);
    if (!slotElement) return;
    const newItem = document.createElement('button');
    newItem.type = 'button';
    newItem.className = 'inventory-item';
    newItem.draggable = true;
    newItem.dataset.itemId = item.id;
    const equippedDisplayName =
      typeof item.getDisplayName === 'function' ? item.getDisplayName() : item.name || '';
    if (equippedDisplayName) {
      newItem.setAttribute('aria-label', equippedDisplayName);
      newItem.title = equippedDisplayName;
    }
    newItem.style.borderColor = ITEM_RARITY[item.rarity].color;
    newItem.innerHTML = `<div class="item-icon">${item.getIcon()}</div>`;
    slotElement.appendChild(newItem);
    slotElement.classList.add('has-item');
  });

  const offhandSlot = inventoryTab.querySelector('[data-slot="offhand"]');
  const weaponItem = inv.equippedItems.weapon;
  if (
    offhandSlot &&
    weaponItem &&
    typeof weaponItem.isTwoHanded === 'function' &&
    weaponItem.isTwoHanded() &&
    !inv.equippedItems.offhand
  ) {
    const ghost = document.createElement('div');
    ghost.className = 'two-handed-ghost';
    const icon = typeof weaponItem.getIcon === 'function' ? weaponItem.getIcon() : '';
    ghost.innerHTML = `<div class="item-icon">${icon}</div>`;
    ghost.style.borderColor = ITEM_RARITY[weaponItem.rarity].color;
    offhandSlot.appendChild(ghost);
    offhandSlot.classList.add('has-item');
  }

  setupDragAndDrop(inventoryTab);
  applyFilter(inv, inventoryTab);
  updateMaterialsGrid(inv, inventoryTab);
}

function applyFilter(inv, root = getInventoryTab()) {
  if (!inv || !root) return;
  const filter = currentFilter.trim();
  const items = root.querySelectorAll('.grid-container .inventory-item');

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

export function setupDragAndDrop(root = getInventoryTab()) {
  if (!root) return;

  // Remove existing listeners first
  removeExistingListeners(root);

  // Setup new listeners
  setupGridCells(root);
  setupEquipmentSlots(root);
  setupItemDragAndTooltip(root);

  const modalContainer = root.closest('.inventory-salvage-modal-content');
  const trash =
    root.querySelector('.inventory-trash') ||
    modalContainer?.querySelector('.inventory-trash') ||
    document.querySelector('.inventory-salvage-modal-content .inventory-trash');
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
          msg += `, gained ${qty} ${t(MATERIALS[id].name)}`;
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
          <div style="font-size:2em;"><img src="${BASE}/icons/delete.svg" class="icon" alt="${t('icon.delete')}"/></div>
          <b>${t('inventory.salvageItem')}</b>
          <div style="margin-top:4px;font-size:0.95em;">${t('inventory.dragDropToSalvage')}</div>
        </div>
      `;
      showTooltip(tooltipContent, e, 'flex-tooltip');
    });
    trash.addEventListener('mousemove', positionTooltip);
    trash.addEventListener('mouseleave', hideTooltip);
  }

  // Add drop logic for material cells
  const materialCells = root.querySelectorAll('.materials-cell');
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

export function removeExistingListeners(root = getInventoryTab()) {
  if (!root) return;

  // Remove grid cell listeners
  const cells = root.querySelectorAll('.grid-cell');
  cells.forEach((cell) => {
    const newCell = cell.cloneNode(true);
    cell.parentNode.replaceChild(newCell, cell);
  });

  // Remove equipment slot listeners
  const slots = root.querySelectorAll('.equipment-slot');
  slots.forEach((slot) => {
    const newSlot = slot.cloneNode(true);
    slot.parentNode.replaceChild(newSlot, slot);
  });
}

export function setupGridCells(root = getInventoryTab()) {
  if (!root) return;
  const cells = root.querySelectorAll('.grid-cell');
  cells.forEach((cell) => {
    cell.addEventListener('dragover', handleDragOver.bind(inventory));
    cell.addEventListener('drop', handleDrop.bind(inventory));
    cell.addEventListener('click', (e) => {
      if (e.target.closest('.inventory-item')) return;
      handleCellTap(cell);
    });
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

  hero.queueRecalculateFromAttributes();
  dataManager.saveGame();


  updateInventoryGrid();
}

export function setupEquipmentSlots(root = getInventoryTab()) {
  if (!root) return;
  const slots = root.querySelectorAll('.equipment-slot');
  slots.forEach((slot) => {
    slot.addEventListener('dragover', handleDragOver.bind(inventory));
    slot.addEventListener('drop', handleDrop.bind(inventory));
    slot.addEventListener('click', () => {
      handleSlotTap(slot);
    });
  });
}

export function setupItemDragAndTooltip(root = getInventoryTab()) {
  if (!root) return;
  const items = root.querySelectorAll('.inventory-item');

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
        hero.queueRecalculateFromAttributes();
        updateInventoryGrid();
        return;
      }

      if (itemData.type === ITEM_TYPES.RING) {
        const emptyRingSlots = ['ring1', 'ring2'].filter((s) => !inventory.equippedItems[s]);
        const slot = emptyRingSlots[0] || 'ring1';
        inventory.equipItem(itemData, slot);
        hero.queueRecalculateFromAttributes();
        updateInventoryGrid();
        return;
      }

      const slot = getPreferredSlotForItem(itemData);
      if (slot) {
        inventory.equipItem(itemData, slot);
        hero.queueRecalculateFromAttributes();
        updateInventoryGrid();
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
      root.querySelectorAll('.equipment-slot').forEach((slot) => {
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
            <b>${t('inventory.salvageValue')}</b> ${qty} ${t(MATERIALS[id].name)}
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
            <b>${t('inventory.salvageValue')}</b> ${goldGained} ${t('inventory.gold').toLowerCase()}
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

export function updateMaterialsGrid(inv, root = getInventoryTab()) {
  if (!inv) {
    inv = inventory;
  }
  const materialsContainer = root?.querySelector('.materials-container');
  if (!materialsContainer) return;
  materialsContainer.innerHTML = '';
  for (let i = 0; i < MATERIALS_SLOTS; i++) {
    const mat = inv.materials[i];
    const icon = MATERIALS[mat?.id]?.icon || `<img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('inventory.materials')}"/>`;
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
        let tooltipContent = `<div class="item-tooltip"><b>${
          matDef.icon || icon
        } ${t(matDef.name || mat.name || '')} &times; ${mat.qty}</b>`;
        if (matDef.description)
          tooltipContent += `<div style="margin-top:4px;">${t(matDef.description)}</div>`;
        tooltipContent += '</div>';
        showTooltip(tooltipContent, e, 'flex-tooltip');
      });
      materialItem.addEventListener('mousemove', positionTooltip);
      materialItem.addEventListener('mouseleave', hideTooltip);
      // Click to use
      materialItem.addEventListener('click', () => {
        inventory.openMaterialDialog(mat);
      });
      // Right click / long press context menu
      let pressTimer;
      materialItem.addEventListener('touchstart', (e) => {
        pressTimer = setTimeout(() => {
          const touch = e.touches[0];
          openMaterialContextMenu(mat, touch.clientX, touch.clientY);
        }, 600);
      });
      materialItem.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      });
      materialItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openMaterialContextMenu(mat, e.clientX, e.clientY);
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
  // Helper for tier order
  const tierOrder = (a, b) => b.tier - a.tier;

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
      case 'tier-rarity-level':
        return tierOrder(a, b) || rarityOrder(a, b) || levelOrder(a, b);
      case 'tier-level-rarity':
        return tierOrder(a, b) || levelOrder(a, b) || rarityOrder(a, b);
      case 'type-tier-rarity':
        return typeOrder(a, b) || tierOrder(a, b) || rarityOrder(a, b);
      case 'type-tier-level':
        return typeOrder(a, b) || tierOrder(a, b) || levelOrder(a, b);
      case 'rarity-tier-level':
        return rarityOrder(a, b) || tierOrder(a, b) || levelOrder(a, b);
      case 'level-tier-rarity':
        return levelOrder(a, b) || tierOrder(a, b) || rarityOrder(a, b);
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

function clearSlotHighlights(root = getInventoryTab()) {
  if (!root) return;
  root.querySelectorAll('.equipment-slot').forEach((slot) => {
    slot.classList.remove('eligible-slot', 'ineligible-slot');
  });
}

function showEquipButton(show) {
  const btn = document.getElementById('mobile-equip-btn');
  // Hide equip button only when the salvage modal is actually visible
  const modal = document.getElementById('salvage-modal');
  if (modal && !modal.classList.contains('hidden')) show = false;
  if (btn) btn.style.display = show ? '' : 'none';
}

function showSalvageButton(show) {
  const btn = document.getElementById('salvage-selected-btn');
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
    showSalvageButton(true);
    if (itemEl.closest('.grid-container')) {
      highlightInventoryMoveTargets();
    } else {
      clearInventoryMoveHighlights();
    }
  }
}

export function handleSlotTap(slotEl) {
  if (awaitingSlot && selectedItemEl) {
    const itemData = inventory.getItemById(selectedItemEl.dataset.itemId);
    if (inventory.canEquipInSlot(itemData, slotEl.dataset.slot)) {
      inventory.equipItem(itemData, slotEl.dataset.slot);
      hero.queueRecalculateFromAttributes();
      updateInventoryGrid();
    }
    clearMobileSelection();
  } else {
    clearMobileSelection();
  }
}

function getCellIndex(cellEl) {
  const parent = cellEl?.parentNode;
  if (!parent) return -1;
  return Array.from(parent.children).indexOf(cellEl);
}

function isSelectedItemInInventory() {
  return Boolean(selectedItemEl?.closest('.grid-container'));
}

function handleCellTap(cellEl) {
  if (!selectedItemEl || awaitingSlot) return;
  if (!isSelectedItemInInventory()) return;
  if (cellEl.querySelector('.inventory-item')) return;

  const itemData = inventory.getItemById(selectedItemEl.dataset.itemId);
  if (!itemData) {
    clearMobileSelection();
    return;
  }

  const targetIndex = getCellIndex(cellEl);
  if (targetIndex === -1) return;

  const currentIndex = inventory.inventoryItems.findIndex((i) => i && i.id === itemData.id);
  if (currentIndex === targetIndex) {
    clearMobileSelection();
    return;
  }

  if (inventory.inventoryItems[targetIndex]) return;

  inventory.moveItemToPosition(itemData, targetIndex);
  clearMobileSelection();
}

function clearMobileSelection() {
  if (selectedItemEl) selectedItemEl.classList.remove('selected');
  selectedItemEl = null;
  awaitingSlot = false;
  clearSlotHighlights();
  clearInventoryMoveHighlights();
  showEquipButton(false);
  showSalvageButton(false);
  closeItemContextMenu();
  closeMaterialContextMenu();
}

function highlightEligibleSlots(itemData) {
  const root = getInventoryTab();
  if (!root) return;
  clearSlotHighlights(root);
  root.querySelectorAll('.equipment-slot').forEach((slot) => {
    if (inventory.canEquipInSlot(itemData, slot.dataset.slot)) {
      slot.classList.add('eligible-slot');
    } else {
      slot.classList.add('ineligible-slot');
    }
  });
}

function highlightInventoryMoveTargets() {
  showingInventoryTargets = true;
  document.querySelectorAll('.grid-cell').forEach((cell) => {
    if (!cell.querySelector('.inventory-item')) {
      cell.classList.add('move-target');
    } else {
      cell.classList.remove('move-target');
    }
  });
}

function clearInventoryMoveHighlights() {
  if (!showingInventoryTargets) return;
  document.querySelectorAll('.grid-cell').forEach((cell) => {
    cell.classList.remove('move-target');
  });
  showingInventoryTargets = false;
}

function openItemContextMenu(itemEl, x, y) {
  closeItemContextMenu();
  closeMaterialContextMenu();
  const itemData = inventory.getItemById(itemEl.dataset.itemId);
  const menu = document.createElement('div');
  menu.id = 'item-context-menu';
  menu.className = 'item-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.innerHTML = `
    <button data-action="equip">${t('inventory.equip')}</button>
    <button data-action="inspect">${t('inventory.inspect')}</button>
    <button data-action="salvage">${t('inventory.salvage')}</button>
  `;
  document.body.appendChild(menu);

  menu.querySelector('[data-action="equip"]').onclick = () => {
    const equippedSlot = Object.entries(inventory.equippedItems).find(
      ([slot, equipped]) => equipped && equipped.id === itemData.id,
    )?.[0];

    if (equippedSlot) {
      inventory.equipItem(itemData, equippedSlot);
      hero.queueRecalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
      closeItemContextMenu();
      return;
    }

    if (itemData.type === ITEM_TYPES.RING) {
      const emptyRingSlots = ['ring1', 'ring2'].filter((s) => !inventory.equippedItems[s]);
      const slot = emptyRingSlots[0] || 'ring1';
      inventory.equipItem(itemData, slot);
      hero.queueRecalculateFromAttributes();
      updateInventoryGrid();
      clearMobileSelection();
    } else {
      const slot = getPreferredSlotForItem(itemData);
      if (slot) {
        inventory.equipItem(itemData, slot);
        hero.queueRecalculateFromAttributes();
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
      content: `<div class="inventory-modal-content"><button class="modal-close">&times;</button>${itemData
        .getTooltipHTML()
        .replace('item-tooltip', 'item-preview')}</div>`,
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

function openMaterialContextMenu(mat, x, y) {
  closeMaterialContextMenu();
  closeItemContextMenu();
  const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};
  const menu = document.createElement('div');
  menu.id = 'material-context-menu';
  menu.className = 'item-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.innerHTML = `<button data-action="use">${t('inventory.use')}</button>`;
  document.body.appendChild(menu);

  menu.querySelector('[data-action="use"]').onclick = () => {
    if (matDef.isCustom) {
      inventory.openMaterialDialog(mat);
    } else {
      const qty = mat.qty;
      if (typeof matDef.onUse === 'function') {
        matDef.onUse(hero, qty);
      }
      inventory.handleMaterialUsed(
        inventory,
        mat,
        matDef,
        qty,
        'material-context-menu',
        `Used ${qty} ${t(matDef.name || mat.name || '')}${qty > 1 ? 's' : ''}`,
        false,
      );
    }
    closeMaterialContextMenu();
  };

  setTimeout(() => {
    document.addEventListener('click', handleMaterialContextOutside);
  });
}

function handleMaterialContextOutside(e) {
  if (!e.target.closest('#material-context-menu')) {
    closeMaterialContextMenu();
  }
}

function closeMaterialContextMenu() {
  const menu = document.getElementById('material-context-menu');
  if (menu) {
    menu.remove();
    document.removeEventListener('click', handleMaterialContextOutside);
  }
}
