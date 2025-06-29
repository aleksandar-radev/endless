import { hero, inventory, dataManager } from '../globals.js';
import { ITEM_SLOTS, MATERIALS_SLOTS, PERSISTENT_SLOTS } from '../inventory.js';
import { MATERIALS } from '../constants/materials.js';
import { hideTooltip, positionTooltip, showToast, showTooltip } from '../ui/ui.js';
import { ITEM_RARITY, RARITY_ORDER, SLOT_REQUIREMENTS } from '../constants/items.js';

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
        <button id="items-tab" class="inventory-btn active">Items</button>
        <button id="materials-tab" class="inventory-btn">Materials</button>
      </div>
      <div id="sort-inventory" class="inventory-btn">Sort Items</div>
      <button id="open-salvage-modal" class="inventory-btn">Salvage</button>
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

  const sortBtn = document.getElementById('sort-inventory');
  const itemsTab = document.getElementById('items-tab');
  const materialsTab = document.getElementById('materials-tab');
  const materialsGrid = document.querySelector('.materials-grid');
  const openSalvageModalBtn = document.getElementById('open-salvage-modal');

  // Update button text on tab switch
  function updateSortBtnText() {
    if (itemsTab.classList.contains('active')) {
      sortBtn.textContent = '🔃';
    } else {
      sortBtn.textContent = '🔃';
    }
  }
  updateSortBtnText(inv);

  if (itemsTab && materialsTab && gridContainer && materialsGrid) {
    itemsTab.addEventListener('click', () => {
      itemsTab.classList.add('active');
      materialsTab.classList.remove('active');
      gridContainer.style.display = '';
      materialsGrid.style.display = 'none';
      updateSortBtnText();
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

  // Sort button sorts only the visible tab
  sortBtn.addEventListener('click', () => {
    if (itemsTab.classList.contains('active')) {
      sortInventory();
      showToast(`Sorted items by rarity, then level`, 'success');
    } else {
      sortMaterials();
      showToast(`Sorted materials by quantity, then id`, 'success');
    }
  });

  // Add tooltip for sort button
  sortBtn.addEventListener('mouseenter', (e) => {
    const tooltipText = itemsTab.classList.contains('active') ? 'Sort items by rarity then level' : 'Sort materials';
    const tooltipContent = `<div class="item-tooltip"><b>${tooltipText}</b></div>`;
    showTooltip(tooltipContent, e, 'flex-tooltip');
  });
  sortBtn.addEventListener('mousemove', positionTooltip);
  sortBtn.addEventListener('mouseleave', hideTooltip);

  // Salvage modal logic
  openSalvageModalBtn.addEventListener('click', () => {
    showSalvageModal(inv);
  });
}

// Salvage Modal Implementation
export function showSalvageModal(inv) {
  // Modal content: inventory grid (left), salvage buttons (right), trash area (bottom or right)
  const modalContent = document.createElement('div');
  modalContent.className = 'inventory-modal-content';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'row';
  modalContent.style.gap = '32px';
  modalContent.style.alignItems = 'flex-start';

  // Inventory grid (reuse grid rendering)
  const salvageGrid = document.createElement('div');
  salvageGrid.className = 'salvage-modal-grid';
  salvageGrid.style.display = 'grid';
  salvageGrid.style.gridTemplateColumns = 'repeat(10, 40px)';
  salvageGrid.style.gridTemplateRows = 'repeat(20, 40px)';
  salvageGrid.style.gap = '0';
  salvageGrid.style.background = 'var(--bg-panel)';
  salvageGrid.style.borderRadius = '0.5rem';
  salvageGrid.style.overflowY = 'auto';
  salvageGrid.style.maxHeight = '820px';
  for (let i = 0; i < ITEM_SLOTS; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    if (i < PERSISTENT_SLOTS) cell.classList.add('persistent');
    const item = inv.inventoryItems[i];
    if (item) {
      cell.innerHTML = html`
        <div class="inventory-item rarity-${item.rarity.toLowerCase()}" draggable="true" data-item-id="${item.id}">
          <div class="item-icon">${item.getIcon()}</div>
        </div>
      `;
    }
    salvageGrid.appendChild(cell);
  }

  // Salvage controls (right side)
  const salvageControls = document.createElement('div');
  salvageControls.style.display = 'flex';
  salvageControls.style.flexDirection = 'column';
  salvageControls.style.gap = '16px';
  salvageControls.style.alignItems = 'flex-start';
  salvageControls.innerHTML = html`
    <h3>Salvage Options</h3>
    <div class="salvage-options-modal">
      <button class="salvage-btn-modal" data-rarity="NORMAL">Normal Items</button>
      <button class="salvage-btn-modal" data-rarity="MAGIC">Magic Items & Below</button>
      <button class="salvage-btn-modal" data-rarity="RARE">Rare Items & Below</button>
      <button class="salvage-btn-modal" data-rarity="UNIQUE">Unique Items & Below</button>
      <button class="salvage-btn-modal" data-rarity="LEGENDARY">Legendary Items & Below</button>
      <button class="salvage-btn-modal" data-rarity="MYTHIC">Mythic Items & Below</button>
    </div>
    <div class="inventory-trash" style="margin-top:32px;">
      🗑️
      <div style="font-size:0.9em;">Drag item here</div>
    </div>
    <button class="modal-close" style="margin-top:32px;">Close</button>
  `;

  // Compose modal
  modalContent.appendChild(salvageGrid);
  modalContent.appendChild(salvageControls);

  // Show modal
  const dialog = document.createElement('div');
  dialog.className = 'inventory-modal';
  dialog.style.display = 'flex';
  dialog.style.alignItems = 'center';
  dialog.style.justifyContent = 'center';
  dialog.style.position = 'fixed';
  dialog.style.top = '0';
  dialog.style.left = '0';
  dialog.style.width = '100vw';
  dialog.style.height = '100vh';
  dialog.style.background = 'rgba(0,0,0,0.7)';
  dialog.style.zIndex = '9999';
  dialog.appendChild(modalContent);
  document.body.appendChild(dialog);

  // Salvage button logic
  dialog.querySelectorAll('.salvage-btn-modal').forEach((btn) => {
    btn.onclick = () => {
      const rarity = btn.dataset.rarity;
      inventory.salvageItemsByRarity(rarity);
      // Refresh modal grid after salvage
      dialog.remove();
      showSalvageModal(inv);
    };
  });

  // Trash drag logic (same as before, but scoped to modal)
  const trash = dialog.querySelector('.inventory-trash');
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
      let goldGained = 10 * (item.level + 1) * (RARITY_ORDER.indexOf(item.rarity) + 1);
      let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
      if (goldGained > 0) hero.gold = (hero.gold || 0) + goldGained;
      if (crystalsGained > 0) hero.crystals = (hero.crystals || 0) + crystalsGained;
      let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
      if (goldGained > 0) msg += `, gained ${goldGained} gold`;
      if (crystalsGained > 0) msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
      showToast(msg, 'success');
      updateInventoryGrid();
      dataManager.saveGame();
      dialog.remove();
      showSalvageModal(inv);
    }
  });

  // Drag logic for items in modal grid
  salvageGrid.querySelectorAll('.inventory-item').forEach((item) => {
    item.addEventListener('dragstart', (e) => {
      e.target.classList.add('dragging');
      e.dataTransfer.setData('text/plain', item.dataset.itemId);
    });
    item.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
    });
    // Tooltip events (reuse main logic if needed)
    item.addEventListener('mouseenter', (e) => {
      const itemData = inventory.getItemById(item.dataset.itemId);
      if (!itemData) return;
      let tooltipContent = `<div>${itemData.getTooltipHTML()}</div>`;
      showTooltip(tooltipContent, e, 'flex-tooltip');
    });
    item.addEventListener('mousemove', positionTooltip);
    item.addEventListener('mouseleave', hideTooltip);
  });

  // Close modal
  dialog.querySelector('.modal-close').onclick = () => {
    dialog.remove();
  };
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
  updateMaterialsGrid(inv);
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
        // Salvage logic (reuse your salvage reward logic)
        let goldGained = 10 * (item.level + 1) * (RARITY_ORDER.indexOf(item.rarity) + 1);
        let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
        if (goldGained > 0) hero.gold = (hero.gold || 0) + goldGained;
        if (crystalsGained > 0) hero.crystals = (hero.crystals || 0) + crystalsGained;
        let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
        if (goldGained > 0) msg += `, gained ${goldGained} gold`;
        if (crystalsGained > 0) msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
        showToast(msg, 'success');
        updateInventoryGrid();
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
      ([_, equippedItem]) => equippedItem?.id === item.id
    )?.[0];

    if (currentSlot === slot.dataset.slot) {
      return; // Exit if trying to drop on same slot
    }
    // Special handling for ring slots
    if (slot.dataset.slot === 'ring1' || slot.dataset.slot === 'ring2') {
      inventory.handleRingSlotDrop(item, slot.dataset.slot);
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
  });
}

export function setupItemDragAndTooltip() {
  const items = document.querySelectorAll('.inventory-item');

  items.forEach((item) => {
    // Add double-click handler
    item.addEventListener('dblclick', (e) => {
      const itemData = inventory.getItemById(item.dataset.itemId);
      if (!itemData) return;

      // Check if item is currently equipped
      const equippedSlot = Object.entries(inventory.equippedItems).find(
        ([slot, equippedItem]) => equippedItem?.id === itemData.id
      )?.[0];

      if (equippedSlot) {
        // Unequip item
        const emptySlot = inventory.inventoryItems.findIndex((slot) => slot === null);
        if (emptySlot !== -1) {
          inventory.inventoryItems[emptySlot] = itemData;
          delete inventory.equippedItems[equippedSlot];
          hero.recalculateFromAttributes();
          updateInventoryGrid();
          dataManager.saveGame();
        }
        return;
      }

      // Existing equip logic for inventory items
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

      // Create tooltip content
      let tooltipContent = `<div>${itemData.getTooltipHTML()}</div>`;

      // Check if the item is in the inventory
      const isInInventory = inventory.inventoryItems.some((inventoryItem) => inventoryItem?.id === itemData.id);

      // Find matching equipped items based on type
      const equippedItems = [];
      for (const [slot, equippedItem] of Object.entries(inventory.equippedItems)) {
        if (SLOT_REQUIREMENTS[slot].includes(itemData.type) && isInInventory) {
          equippedItems.push(equippedItem);
        }
      }

      // Add equipped items tooltips
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
  });
}

export function sortMaterials() {
  // Sort by quantity descending, then by sort prop ascending, then by id ascending
  const nonNullMaterials = inventory.materials.filter((mat) => mat !== null);
  nonNullMaterials.sort((a, b) => {
    if (b.qty !== a.qty) return b.qty - a.qty;
    // Get sort prop from MATERIALS definition
    const aDef = Object.values(MATERIALS).find((m) => m.id === a.id);
    const bDef = Object.values(MATERIALS).find((m) => m.id === b.id);
    const aSort = aDef?.sort ?? 9999;
    const bSort = bDef?.sort ?? 9999;
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
    const cell = document.createElement('div');
    cell.classList.add('materials-cell');
    if (mat) {
      // Get full material definition for tooltip
      const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};
      // Show only first 2 digits, and "9+" if >9
      let qtyDisplay = mat.qty > 9 ? '+' : String(mat.qty).padStart(2, ' ');
      cell.innerHTML = `<div class="material-item" data-mat-id="${mat.id}">
          ${mat.icon || '🔹'}
          <span class="mat-qty">${qtyDisplay}</span>
        </div>`;
      const materialItem = cell.querySelector('.material-item');
      // Tooltip on hover (show name and amount)
      materialItem.addEventListener('mouseenter', (e) => {
        let tooltipContent = `<div class="item-tooltip"><b>${matDef.icon || mat.icon || '🔹'} ${
          matDef.name || mat.name || ''
        } &times; ${mat.qty}</b>`;
        if (matDef.description) tooltipContent += `<div style="margin-top:4px;">${matDef.description}</div>`;
        tooltipContent += `</div>`;
        showTooltip(tooltipContent, e, 'flex-tooltip');
      });
      materialItem.addEventListener('mousemove', positionTooltip);
      materialItem.addEventListener('mouseleave', hideTooltip);
      // Click to use
      materialItem.addEventListener('click', () => {
        inventory.openMaterialDialog(mat);
      });
    }
    materialsContainer.appendChild(cell);
  }
}

export function sortInventory() {
  // Separate persistent and non-persistent items
  const persistentItems = inventory.inventoryItems.slice(0, PERSISTENT_SLOTS);
  const nonPersistentItems = inventory.inventoryItems.slice(PERSISTENT_SLOTS).filter((item) => item !== null);

  // Sort only non-persistent items by rarity and level
  nonPersistentItems.sort((a, b) => {
    const rarityA = RARITY_ORDER.indexOf(a.rarity);
    const rarityB = RARITY_ORDER.indexOf(b.rarity);

    if (rarityA !== rarityB) {
      return -(rarityA - rarityB);
    }
    return b.level - a.level;
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
