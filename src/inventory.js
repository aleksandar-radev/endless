import Item from './item.js';
import { game, hero, statistics, dataManager } from './globals.js';
import { showToast, updateResources } from './ui/ui.js';
import { createModal, closeModal } from './ui/modal.js';
import { initializeInventoryUI, updateInventoryGrid, updateMaterialsGrid } from './ui/inventoryUi.js';
import { getCurrentRegion } from './region.js';
import { MATERIALS } from './constants/materials.js';
import { STATS } from './constants/stats/stats.js';
import {
  ITEM_RARITY,
  RARITY_ORDER,
  SLOT_REQUIREMENTS,
  getSlotsByCategory,
  getTypesByCategory,
} from './constants/items.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_RARITY } from './constants/enemies.js';

const html = String.raw;

export const ITEM_SLOTS = 200;
export const PERSISTENT_SLOTS = 30;
export const MATERIALS_SLOTS = 50;

export default class Inventory {
  constructor(savedData = null) {
    this.equipmentBonuses = {};
    this.hasNewItems = false; // Flag to track new items for tab indicator

    for (const stat in STATS) {
      this.equipmentBonuses[stat] = 0;
    }

    this.equippedItems = savedData?.equippedItems || {};
    this.inventoryItems = savedData?.inventoryItems || new Array(ITEM_SLOTS).fill(null);
    this.materials = savedData?.materials || new Array(MATERIALS_SLOTS).fill(null);

    if (savedData) {
      // Restore equipped items
      this.equippedItems = {};
      Object.entries(savedData.equippedItems).forEach(([slot, item]) => {
        if (item) {
          // Pass existing stats when creating item
          this.equippedItems[slot] = new Item(item.type, item.level, item.rarity, item.tier, item.stats, item.metaData);
          this.equippedItems[slot].id = item.id;
        }
      });

      // Restore inventory items
      this.inventoryItems = savedData.inventoryItems.map((item) => {
        if (item) {
          // Pass existing stats when creating item
          const restoredItem = new Item(item.type, item.level, item.rarity, item.tier, item.stats, item.metaData);
          restoredItem.id = item.id;
          return restoredItem;
        }
        return null;
      });
      this.materials = savedData.materials
        ? savedData.materials.map((mat) => (mat ? { ...mat } : null))
        : new Array(MATERIALS_SLOTS).fill(null);
    } else {
      this.equippedItems = {};
      this.inventoryItems = new Array(ITEM_SLOTS).fill(null);
      this.materials = new Array(MATERIALS_SLOTS).fill(null);
    }

    initializeInventoryUI(this);

    this.removeTooltip = this.removeTooltip.bind(this);
    window.addEventListener('mouseout', (e) => {
      if (e.relatedTarget === null) this.removeTooltip();
    });
  }
  addMaterial(material) {
    // material: { id, icon, qty }
    let slot = this.materials.findIndex((m) => m && m.id === material.id);
    if (slot !== -1) {
      this.materials[slot].qty += material.qty;
    } else {
      slot = this.materials.findIndex((m) => m === null);
      if (slot !== -1) {
        // Default to qty or 1
        this.materials[slot] = { ...material, qty: material.qty || 1 };
      }
    }
    this.hasNewItems = true; // Set flag when new material is added
    updateMaterialsGrid();
    statistics.increment('totalMaterialsFound', null, material.qty);
    dataManager.saveGame();
  }

  openMaterialDialog(mat) {
    // Always get the full definition from MATERIALS
    const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};

    // Check for upgrade material
    if (matDef.upgradeType) {
      // Use dynamic helpers for eligible slots/types
      const eligibleSlots = getSlotsByCategory(matDef.upgradeType);
      const eligibleTypes = getTypesByCategory(matDef.upgradeType);
      // Find equipped items matching
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => eligibleSlots.includes(slot) && item && eligibleTypes.includes(item.type))
        .map(([slot, item]) => ({ slot, item }));
      const html = String.raw;
      let content = html`
        <div class="inventory-modal-content">
          <button class="modal-close">&times;</button>
          <h2>${matDef.name || mat.name || ''}</h2>
          <p>${matDef.description || ''}</p>
          <p>You have <b>${mat.qty}</b></p>
          <div style="margin-bottom:10px;">Select an equipped item to upgrade:</div>
          <div id="upgrade-item-list">
            ${equipped.length === 0
    ? '<div style="color:#f55;">No eligible equipped items.</div>'
    : equipped
      .map(
        ({ slot, item }, idx) =>
          `<div class="upgrade-item-row" data-slot="${slot}" data-idx="${idx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:1.5em;">${item.getIcon()}</span>
                        <span><b>${item.type}</b> (Lvl ${item.level})</span>
                        <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
                        <input type="number" class="upgrade-qty-input" data-idx="${idx}" min="1" max="${
  mat.qty
}" value="1" aria-label="Upgrade quantity" />
                        <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">Upgrade</button>
                      </div>`,
      )
      .join('')}
          </div>
          <div class="modal-controls">
            <button id="material-use-cancel">Cancel</button>
          </div>
        </div>
      `;
      const dialog = createModal({
        id: 'material-upgrade-dialog',
        className: 'inventory-modal',
        content,
      });
      dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-upgrade-dialog');
      dialog.querySelectorAll('.upgrade-btn').forEach((btn) => {
        btn.onclick = () => {
          const idx = parseInt(btn.dataset.idx, 10);
          const { slot, item } = equipped[idx];
          const qtyInput = dialog.querySelector(`.upgrade-qty-input[data-idx='${idx}']`);
          let useQty = parseInt(qtyInput.value, 10);
          if (isNaN(useQty) || useQty < 1) useQty = 1;
          if (useQty > mat.qty) useQty = mat.qty;
          // Upgrade logic: increase level and update stats for new level
          const oldLevel = item.level;
          const newLevel = oldLevel + useQty;
          item.applyLevelToStats(newLevel);
          mat.qty -= useQty;
          if (mat.qty <= 0) {
            const matIdx = this.materials.findIndex((m) => m && m.id === mat.id);
            if (matIdx !== -1) this.materials[matIdx] = null;
          }
          hero.recalculateFromAttributes();
          updateMaterialsGrid();
          updateInventoryGrid();
          dataManager.saveGame();
          updateResources();
          updateStatsAndAttributesUI();
          closeModal('material-upgrade-dialog');
          showToast(`Upgraded ${item.type} (Lvl ${oldLevel} → ${item.level})`, 'success');
        };
      });
      return;
    }

    // Default: show quantity modal
    const content = html`
      <div class="inventory-modal-content">
        <button class="modal-close">&times;</button>
        <h2>${matDef.name || mat.name || ''}</h2>
        <p>${matDef.description || ''}</p>
        <p>You have <b>${mat.qty}</b></p>
        <label for="material-use-qty">Quantity:</label>
        <input
          id="material-use-qty"
          style="padding: 5px; border-radius: 10px;"
          type="number"
          min="1"
          max="${mat.qty}"
          value="${mat.qty}"
        />
        <div class="modal-controls">
          <button class="modal-buy" id="material-use-btn">Use</button>
          <button id="material-use-cancel">Cancel</button>
        </div>
      </div>
    `;
    const dialog = createModal({
      id: 'material-use-dialog',
      className: 'inventory-modal',
      content,
    });
    // Focus input
    const qtyInput = dialog.querySelector('#material-use-qty');
    qtyInput.focus();
    qtyInput.select();
    // Use
    dialog.querySelector('#material-use-btn').onclick = () => {
      let useQty = parseInt(qtyInput.value, 10);
      if (isNaN(useQty) || useQty < 1) useQty = 1;
      if (useQty > mat.qty) useQty = mat.qty;

      if (matDef && typeof matDef.onUse === 'function') {
        matDef.onUse(hero, useQty);
      }
      mat.qty -= useQty;
      if (mat.qty <= 0) {
        const idx = this.materials.findIndex((m) => m && m.id === mat.id);
        if (idx !== -1) this.materials[idx] = null;
      }
      hero.recalculateFromAttributes();
      updateMaterialsGrid();
      dataManager.saveGame();
      updateResources();
      updateStatsAndAttributesUI();
      closeModal('material-use-dialog');
      showToast(`Used ${useQty} ${matDef.name || mat.name || ''}${useQty > 1 ? 's' : ''}`, 'success');
    };

    // Cancel button handler
    dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-use-dialog');
  }

  salvageItemsByRarity(rarity) {
    let salvagedItems = 0;
    let goldGained = 0;
    let crystalsGained = 0;
    const salvageRarities = RARITY_ORDER.slice(0, RARITY_ORDER.indexOf(rarity) + 1);

    // Skip first PERSISTENT_SLOTS slots when salvaging
    this.inventoryItems = this.inventoryItems.map((item, index) => {
      if (index < PERSISTENT_SLOTS) return item; // Preserve persistent slots
      if (item && salvageRarities.includes(item.rarity)) {
        salvagedItems++;
        // Give gold based on rarity and level (customize as needed)
        goldGained += 10 * (item.level + 1) * (RARITY_ORDER.indexOf(item.rarity) + 1);
        // If mythic, give a crystal
        if (item.rarity === 'MYTHIC') {
          crystalsGained++;
        }
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      if (goldGained > 0) hero.gold = (hero.gold || 0) + goldGained;
      if (crystalsGained > 0) hero.crystals = (hero.crystals || 0) + crystalsGained;
      let msg = `Salvaged ${salvagedItems} ${rarity.toLowerCase()} or lower items`;
      if (goldGained > 0) msg += `, gained ${goldGained} gold`;
      if (crystalsGained > 0) msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
      showToast(msg, 'success');
      updateInventoryGrid();
      updateMaterialsGrid();
      updateResources(); // <-- update the UI after using a material
      dataManager.saveGame();
    } else {
      showToast(`No ${rarity.toLowerCase()} or lower items to salvage`, 'info');
    }
  }

  handleRingSlotDrop(draggedRing, targetSlot) {
    // Find which slot the dragged ring is currently equipped in
    const currentSlot =
      this.equippedItems.ring1?.id === draggedRing.id
        ? 'ring1'
        : this.equippedItems.ring2?.id === draggedRing.id
          ? 'ring2'
          : null;

    if (currentSlot) {
      // Ring is being moved between ring slots
      const targetRing = this.equippedItems[targetSlot];

      if (targetRing) {
        // Swap rings
        this.equippedItems[currentSlot] = targetRing;
        this.equippedItems[targetSlot] = draggedRing;
      } else {
        // Move ring to empty slot
        delete this.equippedItems[currentSlot];
        this.equippedItems[targetSlot] = draggedRing;
      }
    } else {
      // Ring is coming from inventory
      const inventoryIndex = this.inventoryItems.findIndex((item) => item?.id === draggedRing.id);
      if (inventoryIndex !== -1) {
        // Remove from inventory
        this.inventoryItems[inventoryIndex] = this.equippedItems[targetSlot] || null;
        // Equip in target slot
        this.equippedItems[targetSlot] = draggedRing;
      }
    }

    hero.recalculateFromAttributes();
    dataManager.saveGame();
  }

  moveItemToPosition(item, newPosition) {
    // Get current position of item
    const currentPosition = this.inventoryItems.findIndex((i) => i && i.id === item.id);

    // If there's an item in the target position, swap them
    const targetItem = this.inventoryItems[newPosition];

    if (currentPosition !== -1) {
      // Item is in inventory
      this.inventoryItems[currentPosition] = targetItem;
      this.inventoryItems[newPosition] = item;
    } else {
      // Item is equipped, handle unequipping to specific position
      for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
        if (equippedItem.id === item.id) {
          delete this.equippedItems[slot];
          if (targetItem) {
            // If target position has an item, try to equip it
            if (this.canEquipInSlot(targetItem, slot)) {
              this.equippedItems[slot] = targetItem;
              this.inventoryItems[newPosition] = item;
            }
          } else {
            this.inventoryItems[newPosition] = item;
          }
          break;
        }
      }
    }
    updateInventoryGrid();
    hero.recalculateFromAttributes();
    dataManager.saveGame();
  }

  getEquippedItemById(id) {
    for (const [slot, item] of Object.entries(this.equippedItems)) {
      if (item.id === id) return item;
    }
    return null;
  }

  createItem(type, level, rarity, tier) {
    if (!rarity) {
      rarity = this.generateRarity();
    }
    return new Item(type, level, rarity, tier);
  }

  generateRarity() {
    // Determine enemy rarity index to bias item drops
    const ENEMY_RARITY_ORDER = Object.keys(ENEMY_RARITY);
    const enemy = game.currentEnemy;
    const enemyRank = enemy?.rarity ? ENEMY_RARITY_ORDER.indexOf(enemy.rarity) : 0;
    const maxRank = ENEMY_RARITY_ORDER.length - 1;
    const boostFactor = enemyRank / maxRank;

    // Build weighted chances with bias: rarer items get extra weight based on enemy strength
    const entries = Object.entries(ITEM_RARITY).map(([key, config]) => {
      const rarityIndex = RARITY_ORDER.indexOf(config.name);
      const weight = config.chance * (1 + boostFactor * rarityIndex);
      return { key, weight };
    });

    // Sum weights and roll
    const total = entries.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * total;
    for (const { key, weight } of entries) {
      if (roll < weight) return key;
      roll -= weight;
    }
    // fallback
    return ITEM_RARITY.NORMAL.name;
  }
  addItemToInventory(item, specificPosition = null) {
    if (!item) {
      console.error('Attempted to add null item to inventory');
      return;
    }

    statistics.increment('totalItemsFound', null, 1);
    this.hasNewItems = true; // Set flag when new item is added

    if (specificPosition !== null && specificPosition < ITEM_SLOTS && !this.inventoryItems[specificPosition]) {
      this.inventoryItems[specificPosition] = item;
    } else {
      // Find first empty slot after persistent slots (40)
      const emptySlot = this.inventoryItems.findIndex((slot, index) => slot === null && index >= PERSISTENT_SLOTS);
      if (emptySlot !== -1) {
        this.inventoryItems[emptySlot] = item;
      }
    }
    updateInventoryGrid();
    dataManager.saveGame();
  }

  removeTooltip() {
    const tooltips = document.querySelectorAll('.item-tooltip');
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  canEquipInSlot(item, slotName) {
    return SLOT_REQUIREMENTS[slotName].includes(item.type);
  }

  getItemById(id) {
    if (!id) {
      console.error('Attempted to get item with null id');
      return null;
    }

    const inventoryItem = this.inventoryItems.find((item) => item && item.id === id);
    if (inventoryItem) return inventoryItem;

    return Object.values(this.equippedItems).find((i) => i && i.id === id);
  }

  equipItem(item, slot) {
    const currentPosition = this.inventoryItems.findIndex((i) => i && i.id === item.id);

    // Handle existing equipped item
    if (this.equippedItems[slot]) {
      const oldItem = this.equippedItems[slot];
      if (currentPosition !== -1) {
        // Put old item where new item was
        this.inventoryItems[currentPosition] = oldItem;
      } else {
        // Find first empty slot
        const emptySlot = this.inventoryItems.findIndex((slot) => slot === null);
        if (emptySlot !== -1) {
          this.inventoryItems[emptySlot] = oldItem;
        }
      }
    } else if (currentPosition !== -1) {
      // Clear the inventory slot the item came from
      this.inventoryItems[currentPosition] = null;
    }

    // Equip the new item
    this.equippedItems[slot] = item;
    dataManager.saveGame();
  }

  updateItemBonuses() {
    // Reset equipment bonuses
    Object.keys(this.equipmentBonuses).forEach((stat) => {
      this.equipmentBonuses[stat] = 0;
    });

    // Calculate bonuses from all equipped items
    Object.values(this.equippedItems).forEach((item) => {
      Object.entries(item.stats).forEach(([stat, value]) => {
        if (this.equipmentBonuses[stat] !== undefined) {
          this.equipmentBonuses[stat] += value;
        }
      });
    });
  }

  getEquipmentBonuses() {
    // Ensure bonuses are up-to-date
    this.updateItemBonuses();
    return { ...this.equipmentBonuses };
  }

  /* Utility to get a random material (weighted by dropChance) */
  getRandomMaterial() {
    const region = getCurrentRegion();
    const enemy = game.currentEnemy;
    // Determine allowed exclusives from both enemy and region
    const allowedExclusive = [...(enemy?.canDrop || []), ...(region.canDrop || [])];
    // Filter materials by dropChance and exclusivity
    const materials = Object.values(MATERIALS)
      .filter((m) => m.dropChance > 0)
      .filter((m) => !m.exclusive || allowedExclusive.includes(m.id));
    // Combine region and enemy drop multipliers
    const regionMultiplier = region.materialDropMultiplier || 1.0;
    const enemyMultiplier = enemy?.enemyData?.materialDropMultiplier || 1.0;
    const multiplier = regionMultiplier * enemyMultiplier;
    // Merge region and enemy weights (additive; default to 1 if none)
    const regionWeights = region.materialDropWeights || {};
    const enemyWeights = enemy?.enemyData?.materialDropWeights || {};
    const combinedWeights = {};
    materials.forEach((m) => {
      const w = (regionWeights[m.id] || 0) + (enemyWeights[m.id] || 0);
      combinedWeights[m.id] = w > 0 ? w : 1;
    });
    // Calculate total weighted drop chances
    const total = materials.reduce((sum, m) => sum + m.dropChance * multiplier * combinedWeights[m.id], 0);
    let roll = Math.random() * total;
    for (const mat of materials) {
      const weight = mat.dropChance * multiplier * combinedWeights[mat.id];
      if (roll < weight) return mat;
      roll -= weight;
    }
    // fallback
    return materials[0];
  }

  /**
   * Clear the new items flag (called when player visits inventory tab)
   */
  clearNewItemsFlag() {
    this.hasNewItems = false;
  }
}
