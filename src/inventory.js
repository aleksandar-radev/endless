import Item, { AVAILABLE_STATS } from './item.js';
import { game, hero, statistics, dataManager, crystalShop } from './globals.js';
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

export const ITEM_SLOTS = 200;
export const PERSISTENT_SLOTS = 30;
export const MATERIALS_SLOTS = 100;

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
    this.autoSalvageRarities = savedData?.autoSalvageRarities || [];
    this.salvageUpgradeMaterials = savedData?.salvageUpgradeMaterials || false;

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
    // Auto-consume logic
    const matDef = Object.values(MATERIALS).find((m) => m.id === material.id);
    const hasAutoConsume = crystalShop.crystalUpgrades.autoConsumeMaterials;

    // Only auto-consume if not isCustom and upgrade is owned
    if (
      hasAutoConsume &&
      matDef &&
      (!matDef.isCustom || matDef.isCustom === false) &&
      typeof matDef.onUse === 'function'
    ) {
      matDef.onUse(hero, material.qty || 1);
      statistics.increment('totalMaterialsFound', null, material.qty);
      dataManager.saveGame();
      updateMaterialsGrid();
      return;
    }

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

  showEquippedItemsModal({
    id,
    matDef,
    mat,
    equipped,
    itemRowHtml,
    buttonClass,
    buttonHandler,
    emptyMsg,
    titleExtra = '',
  }) {
    const html = String.raw;
    let content = html`
    <div class="inventory-modal-content">
      <button class="modal-close">&times;</button>
      <h2>${matDef.name || mat.name || ''}</h2>
      <p>${matDef.description || ''}</p>
      <p>You have <b>${mat.qty}</b></p>
      ${titleExtra}
      <div>
        ${equipped.length === 0
    ? `<div style="color:#f55;">${emptyMsg}</div>`
    : equipped.map(itemRowHtml).join('')}
      </div>
      <div class="modal-controls">
        <button id="material-use-cancel">Cancel</button>
      </div>
    </div>
  `;
    const dialog = createModal({
      id,
      className: 'inventory-modal',
      content,
    });
    dialog.querySelector('#material-use-cancel').onclick = () => closeModal(id);
    dialog.querySelectorAll(`.${buttonClass}`).forEach((btn) => {
      btn.onclick = (e) => buttonHandler(e, dialog);
    });
    return dialog;
  }

  handleMaterialUsed(inventory, mat, matDef, qty, dialogId, toastMsg) {
    mat.qty -= qty;
    if (mat.qty <= 0) {
      const idx = inventory.materials.findIndex((m) => m && m.id === mat.id);
      if (idx !== -1) inventory.materials[idx] = null;
    }
    hero.recalculateFromAttributes();
    updateMaterialsGrid();
    updateInventoryGrid();
    dataManager.saveGame();
    updateResources();
    updateStatsAndAttributesUI();
    closeModal(dialogId);
    showToast(toastMsg, 'success');
  }

  openMaterialDialog(mat) {
    // Always get the full definition from MATERIALS
    const matDef = Object.values(MATERIALS).find((m) => m.id === mat.id) || {};

    // Check for upgrade material
    if (matDef.isCustom && matDef.upgradeType) {
      const eligibleSlots = getSlotsByCategory(matDef.upgradeType);
      const eligibleTypes = getTypesByCategory(matDef.upgradeType);
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => eligibleSlots.includes(slot) && item && eligibleTypes.includes(item.type))
        .map(([slot, item]) => ({ slot, item }));

      this.showEquippedItemsModal({
        id: 'material-upgrade-dialog',
        matDef,
        mat,
        equipped,
        itemRowHtml: ({ slot, item }, idx) => `
        <div class="upgrade-item-row" data-slot="${slot}" data-idx="${idx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:1.5em;">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
          <input type="number" class="upgrade-qty-input" data-idx="${idx}" min="1" max="${Math.min(mat.qty, Math.max(0, hero.level - item.level))}" value="1" aria-label="Upgrade quantity" />
          <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">Upgrade</button>
        </div>`,
        buttonClass: 'upgrade-btn',
        buttonHandler: (e, dialog) => {
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          const { slot, item } = equipped[idx];
          const qtyInput = dialog.querySelector(`.upgrade-qty-input[data-idx='${idx}']`);
          let useQty = parseInt(qtyInput.value, 10);
          if (isNaN(useQty) || useQty < 1) useQty = 1;
          // Limit useQty to not exceed hero level - item.level
          const maxUpgrade = Math.max(0, hero.level - item.level);
          if (useQty > mat.qty) useQty = mat.qty;
          if (useQty > maxUpgrade) useQty = maxUpgrade;
          if (useQty < 1) {
            showToast('Item cannot surpass hero level', 'error');
            return;
          } // Prevent upgrading if already at or above hero level
          const oldLevel = item.level;
          item.applyLevelToStats(oldLevel + useQty);
          this.handleMaterialUsed(this, mat, matDef, useQty, 'material-upgrade-dialog', `Upgraded ${item.type} (Lvl ${oldLevel} → ${item.level})`);
        },
        emptyMsg: 'No eligible equipped items.',
        titleExtra: '<div style="margin-bottom:10px;">Select an equipped item to upgrade:</div>',
      });
      return;
    }

    // Enchantment Scroll
    if (matDef.isCustom && matDef.id === 'enchantment_scroll') {
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => item && item.rarity !== 'MYTHIC')
        .map(([slot, item]) => ({ slot, item }));

      this.showEquippedItemsModal({
        id: 'material-enchant-dialog',
        matDef,
        mat,
        equipped,
        itemRowHtml: ({ slot, item }, idx) => `
        <div class="upgrade-item-row" data-slot="${slot}" data-idx="${idx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:1.5em;">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
          <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">Enchant</button>
        </div>`,
        buttonClass: 'upgrade-btn',
        buttonHandler: (e) => {
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          const { item } = equipped[idx];
          const rarities = Object.keys(ITEM_RARITY);
          let currentIdx = rarities.indexOf(item.rarity);
          if (currentIdx < rarities.length - 1) {
            item.rarity = rarities[currentIdx + 1];
            item.applyLevelToStats(item.level);
            // Add a new stat if below max for new rarity
            const maxStats = ITEM_RARITY[item.rarity].totalStats;
            if (Object.keys(item.stats).length < maxStats) {
              item.addRandomStat();
            }
          }
          this.handleMaterialUsed(this, mat, matDef, 1, 'material-enchant-dialog', `Enchanted ${item.type} to ${item.rarity}`);
        },
        emptyMsg: 'No eligible equipped items.',
        titleExtra: '<div style="margin-bottom:10px;">Select an equipped item to enchant (increase rarity):</div>',
      });
      return;
    }

    // Alternation Orb
    if (matDef.isCustom && matDef.id === 'alternation_orb') {
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => item)
        .map(([slot, item]) => ({ slot, item }));

      this.showEquippedItemsModal({
        id: 'material-reroll-dialog',
        matDef,
        mat,
        equipped,
        itemRowHtml: ({ slot, item }, idx) => `
        <div class="upgrade-item-row" data-slot="${slot}" data-idx="${idx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:1.5em;">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
          <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">Re-roll Stat</button>
        </div>`,
        buttonClass: 'upgrade-btn',
        buttonHandler: (e) => {
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          const { item } = equipped[idx];
          const statKeys = Object.keys(item.stats);
          if (statKeys.length === 0) return;
          const statToReroll = statKeys[Math.floor(Math.random() * statKeys.length)];
          const range = AVAILABLE_STATS[statToReroll];
          const baseValue = Math.random() * (range.max - range.min) + range.min;
          const tierBonus = item.getTierBonus();
          const multiplier = item.getMultiplier();
          const scale = item.getLevelScale(statToReroll, item.level);
          item.stats[statToReroll] = item.calculateStatValue({
            baseValue,
            tierBonus,
            multiplier,
            scale,
            stat: statToReroll,
          });
          if (!item.metaData) item.metaData = {};
          item.metaData[statToReroll] = { baseValue };
          this.handleMaterialUsed(this, mat, matDef, 1, 'material-reroll-dialog', `Re-rolled 1 stat on ${item.type}`);
        },
        emptyMsg: 'No equipped items.',
        titleExtra: '<div style="margin-bottom:10px;">Select an equipped item to re-roll one stat:</div>',
      });
      return;
    }

    // Default: show quantity modal
    const html = String.raw;
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
    const qtyInput = dialog.querySelector('#material-use-qty');
    qtyInput.focus();
    qtyInput.select();
    dialog.querySelector('#material-use-btn').onclick = () => {
      let useQty = parseInt(qtyInput.value, 10);
      if (isNaN(useQty) || useQty < 1) useQty = 1;
      if (useQty > mat.qty) useQty = mat.qty;
      if (matDef && typeof matDef.onUse === 'function') {
        matDef.onUse(hero, useQty);
      }
      this.handleMaterialUsed(this, mat, matDef, useQty, 'material-use-dialog', `Used ${useQty} ${matDef.name || mat.name || ''}${useQty > 1 ? 's' : ''}`);
    };
    dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-use-dialog');
  }

  getItemSalvageValue(item) {
    return Math.floor(25 * item.level * (Math.max(RARITY_ORDER.indexOf(item.rarity) / 2 + 1, 1)) * Math.max(item.tier / 2, 1));
  }

  getItemSalvageMaterial(item) {
    const rarityAmounts = {
      NORMAL: 1,
      MAGIC: 1.5,
      RARE: 2,
      UNIQUE: 2.5,
      LEGENDARY: 3,
      MYTHIC: 3.5,
    };
    const weaponTypes = getTypesByCategory('weapon');
    const jewelryTypes = getTypesByCategory('jewelry');
    let id;
    if (weaponTypes.includes(item.type)) {
      id = MATERIALS.weapon_upgrade_core.id;
    } else if (jewelryTypes.includes(item.type)) {
      id = MATERIALS.jewelry_upgrade_gem.id;
    } else {
      id = MATERIALS.armor_upgrade_stone.id;
    }
    const qty = Math.floor(
      (rarityAmounts[item.rarity] || 1) *
      Math.max(item.level / 200, 1) *
      Math.max(item.tier / 3, 1),
    );
    return { id, qty };
  }

  salvageItem(item) {
    let removed = false;
    const invIdx = this.inventoryItems.findIndex((i) => i && i.id === item.id);
    if (invIdx !== -1) {
      this.inventoryItems[invIdx] = null;
      removed = true;
    } else {
      for (const [slot, equipped] of Object.entries(this.equippedItems)) {
        if (equipped && equipped.id === item.id) {
          delete this.equippedItems[slot];
          removed = true;
          break;
        }
      }
    }
    if (!removed) return;

    let crystalsGained = item.rarity === 'MYTHIC' ? 1 : 0;
    let msg = `Salvaged 1 ${item.rarity.toLowerCase()} item`;
    if (this.salvageUpgradeMaterials) {
      const { id, qty } = this.getItemSalvageMaterial(item);
      this.addMaterial({ id, qty });
      msg += `, gained ${qty} ${MATERIALS[id].name}`;
    } else {
      const goldGained = this.getItemSalvageValue(item);
      if (goldGained > 0) {
        hero.gold = (hero.gold || 0) + goldGained;
        msg += `, gained ${goldGained} gold`;
      }
    }
    if (crystalsGained > 0) {
      hero.crystals = (hero.crystals || 0) + crystalsGained;
      msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
    }
    showToast(msg, 'success');
    updateInventoryGrid();
    updateMaterialsGrid();
    dataManager.saveGame();
  }

  salvageItemsByRarity(rarity) {
    let salvagedItems = 0;
    let goldGained = 0;
    let crystalsGained = 0;
    const matsGained = {};

    // Skip first PERSISTENT_SLOTS slots when salvaging
    this.inventoryItems = this.inventoryItems.map((item, index) => {
      if (index < PERSISTENT_SLOTS) return item; // Preserve persistent slots
      if (item && rarity == item.rarity) {
        console.debug('Salvaging item:', item);
        console.debug(rarity, '==', item.rarity);

        salvagedItems++;
        if (this.salvageUpgradeMaterials) {
          const { id, qty } = this.getItemSalvageMaterial(item);
          matsGained[id] = (matsGained[id] || 0) + qty;
        } else {
          goldGained += this.getItemSalvageValue(item);
        }
        if (item.rarity === 'MYTHIC') {
          crystalsGained++;
        }
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      if (this.salvageUpgradeMaterials) {
        Object.entries(matsGained).forEach(([id, qty]) => {
          this.addMaterial({ id, qty });
        });
      } else if (goldGained > 0) {
        hero.gainGold(goldGained);
      }
      if (crystalsGained > 0) hero.gainCrystals(crystalsGained);
      let msg = `Salvaged ${salvagedItems} ${rarity.toLowerCase()} items`;
      if (this.salvageUpgradeMaterials) {
        const parts = Object.entries(matsGained).map(
          ([id, qty]) => {
            return `${qty} ${MATERIALS[id].name}`;
          },
        );
        if (parts.length) msg += `, gained ${parts.join(', ')}`;
      } else if (goldGained > 0) {
        msg += `, gained ${goldGained} gold`;
      }
      if (crystalsGained > 0)
        msg += `, gained ${crystalsGained} crystal${crystalsGained > 1 ? 's' : ''}`;
      showToast(msg, 'success');
      updateInventoryGrid();
      updateMaterialsGrid();
      updateResources(); // <-- update the UI after using a material
      dataManager.saveGame();
    } else {
      showToast(`No ${rarity.toLowerCase()} items to salvage`, 'info');
    }
  }

  // For upgrade materials (scraps/cores/stones), drop amount is variable:
  // For every 25 enemy levels, there is a 50% chance for an additional drop.
  // Instead of rolling for each, we calculate the min (1) and max (1 + rolls),
  // then pick a random integer in that range for efficiency at high stages.
  getScrapPackSize(enemyLevel) {
    const rolls = Math.floor(enemyLevel / 25);
    const min = 1;
    const max = 1 + rolls;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  isUpgradeMaterial(mat) {
    return (
      mat.id === 'armor_upgrade_stone' ||
      mat.id === 'weapon_upgrade_core' ||
      mat.id === 'jewelry_upgrade_gem'
    );
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
    // Auto-salvage logic
    if (this.autoSalvageRarities && this.autoSalvageRarities.length > 0) {
      if (this.autoSalvageRarities.includes(item.rarity)) {
        this.salvageItemsByRarity(item.rarity);
        return;
      }
    }
    updateInventoryGrid();
    dataManager.saveGame();
  }

  setAutoSalvageRarities(rarities) {
    this.autoSalvageRarities = rarities;
    dataManager.saveGame();
  }

  setSalvageUpgradeMaterials(value) {
    this.salvageUpgradeMaterials = value;
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

    // If equipping to the slot it's already in, treat as unequip
    if (this.equippedItems[slot] && this.equippedItems[slot].id === item.id) {
      const emptySlot = this.inventoryItems.findIndex((s) => s === null);
      if (emptySlot !== -1) {
        this.inventoryItems[emptySlot] = item;
        delete this.equippedItems[slot];
      }
      dataManager.saveGame();
      return;
    }

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
    const regionMultiplier = region.multiplier.materialDrop || 1.0;
    const enemyMultiplier = enemy?.baseData?.multiplier.materialDrop || 1.0;
    const multiplier = regionMultiplier * enemyMultiplier;
    // Merge region and enemy weights (additive; default to 1 if none)
    const regionWeights = region.materialDropWeights || {};
    const enemyWeights = enemy?.baseData?.materialDropWeights || {};
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
