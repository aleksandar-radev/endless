import Item, { AVAILABLE_STATS } from './item.js';
import { game, hero, statistics, dataManager, crystalShop, options } from './globals.js';
import {
  showToast,
  updateResources,
  formatStatName,
} from './ui/ui.js';
import { t, tp } from './i18n.js';
import { createModal, closeModal } from './ui/modal.js';
import {
  initializeInventoryUI,
  updateInventoryGrid,
  updateMaterialsGrid,
  sortInventory,
  sortMaterials,
} from './ui/inventoryUi.js';
import { getCurrentRegion } from './region.js';
import { MATERIALS } from './constants/materials.js';
import { STATS } from './constants/stats/stats.js';
import {
  ITEM_RARITY,
  RARITY_ORDER,
  SLOT_REQUIREMENTS,
  TWO_HANDED_TYPES,
  getSlotsByCategory,
  getTypesByCategory,
} from './constants/items.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { INVENTORY_MAX_QTY } from './constants/limits.js';

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
    this.materials = savedData?.materials
      ? savedData.materials.map((mat) => (mat ? { id: mat.id, qty: mat.qty } : null))
      : new Array(MATERIALS_SLOTS).fill(null);
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
        ? savedData.materials.map((mat) => (mat ? { id: mat.id, qty: mat.qty } : null))
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
    // material: { id, qty }
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
        this.materials[slot] = { id: material.id, qty: material.qty || 1 };
      }
    }
    this.hasNewItems = true; // Set flag when new material is added
    statistics.increment('totalMaterialsFound', null, material.qty);
    if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
      sortMaterials();
    } else {
      updateMaterialsGrid();
      dataManager.saveGame();
    }
  }

  /**
   * Add multiple materials in bulk with a single UI/save update.
   * counts: Record<materialId, qty>
   */
  bulkAddMaterials(counts) {
    if (!counts || typeof counts !== 'object') return;
    let totalFound = 0;
    const entries = Object.entries(counts).filter(([_, qty]) => (qty || 0) > 0);
    if (!entries.length) return;

    // Process auto-consume first to avoid filling inventory with consumables
    for (const [id, qtyRaw] of entries) {
      const qty = Math.floor(qtyRaw);
      if (qty <= 0) continue;
      const matDef = Object.values(MATERIALS).find((m) => m.id === id);
      const hasAutoConsume = crystalShop.crystalUpgrades.autoConsumeMaterials;
      if (
        hasAutoConsume &&
        matDef &&
        (!matDef.isCustom || matDef.isCustom === false) &&
        typeof matDef.onUse === 'function'
      ) {
        matDef.onUse(hero, qty);
        totalFound += qty;
        counts[id] = 0; // consumed, don't add to inventory below
      }
    }

    // Add remaining materials to inventory slots
    // IMPORTANT: iterate over the updated counts so auto-consumed entries (set to 0)
    // are not added to inventory.
    for (const [id, qtyRaw] of Object.entries(counts)) {
      const qty = Math.floor(qtyRaw);
      if (qty <= 0) continue;
      let slot = this.materials.findIndex((m) => m && m.id === id);
      if (slot !== -1) {
        this.materials[slot].qty += qty;
        totalFound += qty;
      } else {
        const empty = this.materials.findIndex((m) => m === null);
        if (empty !== -1) {
          this.materials[empty] = { id, qty };
          totalFound += qty;
        }
        // If no slot available, silently drop overflow (consistent with single addMaterial behavior)
      }
    }

    if (totalFound > 0) {
      this.hasNewItems = true;
      statistics.increment('totalMaterialsFound', null, totalFound);
    }

    if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
      sortMaterials();
    } else {
      updateMaterialsGrid();
      dataManager.saveGame();
    }
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
      <h2>${t(matDef.name || mat.name || '')}</h2>
      <p>${t(matDef.description || '')}</p>
      <p>${tp('inventory.youHaveAmount', { amount: `<b class="material-qty">${mat.qty}</b>` })}</p>
      ${titleExtra}
      <div>
        ${equipped.length === 0
    ? `<div style="color:#f55;">${emptyMsg}</div>`
    : equipped.map(itemRowHtml).join('')}
      </div>
      <div class="modal-controls">
        <button id="material-use-cancel">${t('common.cancel')}</button>
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

  handleMaterialUsed(
    inventory,
    mat,
    matDef,
    qty,
    dialogId,
    toastMsg,
    closeDialog = true,
  ) {
    mat.qty -= qty;
    if (mat.qty <= 0) {
      const idx = inventory.materials.findIndex((m) => m && m.id === mat.id);
      if (idx !== -1) inventory.materials[idx] = null;
    }
    hero.queueRecalculateFromAttributes();
    updateMaterialsGrid();
    updateInventoryGrid();
    dataManager.saveGame();
    updateResources();
    updateStatsAndAttributesUI();
    if (closeDialog) closeModal(dialogId);
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

      const getMaxUpgradeForItem = (item) => {
        const maxStage = statistics.highestStages[item.tier] || 0;
        const maxLevelsByStage = Math.max(0, maxStage - item.level);
        const maxLevelsByMats = Math.floor(mat.qty / item.tier);
        return Math.min(maxLevelsByStage, maxLevelsByMats, INVENTORY_MAX_QTY);
      };

      const dialog = this.showEquippedItemsModal({
        id: 'material-upgrade-dialog',
        matDef,
        mat,
        equipped,
        itemRowHtml: ({ slot, item }, idx) => {
          return `
        <div class="upgrade-item-row" data-slot="${slot}" data-idx="${idx}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-size:1.5em;">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
          <input type="number" class="upgrade-qty-input" data-idx="${idx}" min="1" max="${getMaxUpgradeForItem(item)}" value="1" aria-label="${t('inventory.upgradeQuantity')}" />
          <button class="upgrade-max-btn" data-slot="${slot}" data-idx="${idx}">${t('options.max')}</button>
          <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">${t('inventory.upgradeAction')}</button>
          <span class="upgrade-cost" data-idx="${idx}"></span>
        </div>`;
        },
        buttonClass: 'upgrade-btn',
        buttonHandler: (e, dialog) => {
          const idx = parseInt(e.currentTarget.dataset.idx, 10);
          const { slot, item } = equipped[idx];
          const qtyInput = dialog.querySelector(`.upgrade-qty-input[data-idx='${idx}']`);
          let useQty = parseInt(qtyInput.value, 10);
          if (isNaN(useQty) || useQty < 1) useQty = 1;
          if (useQty > INVENTORY_MAX_QTY) useQty = INVENTORY_MAX_QTY;
          // Limit useQty to not exceed highest stage reached or available materials
          const maxUpgrade = getMaxUpgradeForItem(item);
          if (useQty > maxUpgrade) useQty = maxUpgrade;
          if (useQty < 1) {
            showToast(t('inventory.notEnoughMaterialsOrMaxStage'), 'error');
            return; // Prevent upgrading if already at or above highest stage or lacking materials
          }
          const oldLevel = item.level;
          item.applyLevelToStats(oldLevel + useQty);
          const matsUsed = useQty * item.tier;
          const toastMsg = tp('inventory.upgradedItemToast', {
            item: item.type,
            from: oldLevel,
            to: item.level,
          });
          this.handleMaterialUsed(
            this,
            mat,
            matDef,
            matsUsed,
            'material-upgrade-dialog',
            toastMsg,
            false,
          );
          if (mat.qty > 0) {
            this.openMaterialDialog(mat);
          } else {
            closeModal('material-upgrade-dialog');
          }
        },
        emptyMsg: t('inventory.noEligibleEquippedItems'),
        titleExtra: `<div style="margin-bottom:10px;">${t('inventory.selectItemToUpgrade')} <div style="font-size:0.9em;color:#ddd;margin-top:6px;">${t('inventory.upgradeInfo')}</div></div>`,
      });

      equipped.forEach(({ item }, idx) => {
        const input = dialog.querySelector(`.upgrade-qty-input[data-idx='${idx}']`);
        const costEl = dialog.querySelector(`.upgrade-cost[data-idx='${idx}']`);
        const updateCost = () => {
          let val = parseInt(input.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > INVENTORY_MAX_QTY) {
            val = INVENTORY_MAX_QTY;
            input.value = val;
          }
          const maxUpgrade = getMaxUpgradeForItem(item);
          if (val > maxUpgrade) {
            val = maxUpgrade;
            input.value = val;
          }
          costEl.textContent = tp('inventory.costValue', { cost: val * item.tier });
        };
        updateCost();
        input.addEventListener('input', updateCost);
        const maxBtn = dialog.querySelector(`.upgrade-max-btn[data-idx='${idx}']`);
        if (maxBtn) {
          maxBtn.addEventListener('click', () => {
            const maxUpgrade = getMaxUpgradeForItem(item);
            const targetValue = Math.max(0, Math.min(maxUpgrade, INVENTORY_MAX_QTY));
            input.value = targetValue;
            updateCost();
          });
        }
      });

      const controls = dialog.querySelector('.modal-controls');
      if (controls) {
        const upgradeAllBtn = document.createElement('button');
        upgradeAllBtn.id = 'material-upgrade-all';
        upgradeAllBtn.textContent = t('inventory.upgradeAllToMax');
        controls.appendChild(upgradeAllBtn);
        upgradeAllBtn.onclick = () => {
          let upgradedAny = false;
          for (const { item } of equipped) {
            const maxUpgrade = getMaxUpgradeForItem(item);
            if (maxUpgrade > 0 && mat.qty >= item.tier) {
              const oldLevel = item.level;
              item.applyLevelToStats(oldLevel + maxUpgrade);
              const matsUsed = maxUpgrade * item.tier;
              const toastMsg = tp('inventory.upgradedItemToast', {
                item: item.type,
                from: oldLevel,
                to: item.level,
              });
              this.handleMaterialUsed(
                this,
                mat,
                matDef,
                matsUsed,
                'material-upgrade-dialog',
                toastMsg,
                false,
              );
              upgradedAny = true;
              if (mat.qty <= 0) break;
            }
          }

          if (!upgradedAny) {
            showToast(t('inventory.notEnoughMaterialsOrMaxStage'), 'error');
            return;
          }

          if (mat.qty > 0) {
            this.openMaterialDialog(mat);
          } else {
            closeModal('material-upgrade-dialog');
          }
        };
      }
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
          <button class="upgrade-btn" data-slot="${slot}" data-idx="${idx}">${t('inventory.enchantAction')}</button>
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
          const rarityName = t(`rarity.${item.rarity.toLowerCase()}`);
          const toastMsg = tp('inventory.enchantedItemToast', {
            item: item.type,
            rarity: rarityName,
          });
          this.handleMaterialUsed(this, mat, matDef, 1, 'material-enchant-dialog', toastMsg);
        },
        emptyMsg: t('inventory.noEligibleEquippedItems'),
        titleExtra: `<div style="margin-bottom:10px;">${t('inventory.selectItemToEnchant')}</div>`,
      });
      return;
    }

    // Transmutation Orb
    if (matDef.isCustom && matDef.id === 'transmutation_orb') {
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => item)
        .map(([slot, item]) => ({ slot, item }));

      const html = String.raw;
      const itemRows = equipped
        .map(
          ({ slot, item }, idx) => `
        <div class="transmutation-item" data-slot="${slot}" data-idx="${idx}">
          <span class="alternation-icon">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
        </div>`,
        )
        .join('');

      const content = html`
        <div class="inventory-modal-content">
          <button class="modal-close">&times;</button>
          <h2>${t(matDef.name || mat.name || '')}</h2>
          <p>${t(matDef.description || '')}</p>
          <p>${tp('inventory.youHaveAmount', { amount: `<b class="material-qty">${mat.qty}</b>` })}</p>
          <p>${t('inventory.selectItemAndStatTransmute')}</p>
          <p>${tp('inventory.selectedItemLabel', { item: `<span id="transmutation-selected-name">${t('common.none')}</span>` })}</p>
          <div id="transmutation-item-list">
            ${equipped.length === 0 ? `<div style="color:#f55;">${t('inventory.noEquippedItems')}</div>` : itemRows}
          </div>
          <div id="transmutation-selected-item" style="margin-top:10px;"></div>
          <div class="modal-controls">
            <button id="material-use-cancel">${t('common.cancel')}</button>
          </div>
        </div>`;

      const dialog = createModal({
        id: 'material-transmute-dialog',
        className: 'inventory-modal',
        content,
      });

      let statOrder = [];
      let currentIdx = null;
      const renderSelected = (idx) => {
        const { item } = equipped[idx];
        dialog.querySelector('#transmutation-selected-name').textContent = item.getDisplayName();

        const statsKeys = Object.keys(item.stats);
        if (currentIdx !== idx) {
          statOrder = [...statsKeys];
          currentIdx = idx;
        }

        const isPercentStat = (stat) =>
          stat.endsWith('Percent') ||
          stat === 'critChance' ||
          stat === 'blockChance' ||
          stat === 'lifeSteal' ||
          stat === 'manaSteal' ||
          stat === 'omniSteal';
        let showAdvanced = false;
        try {
          if (options.showAdvancedTooltips) showAdvanced = true;
        } catch (e) {}
        let statMinMax = {};
        if (showAdvanced) {
          statMinMax = item.getAllStatsMinMax();
        }
        let statsHtml;
        if (statsKeys.length === 0) {
          statsHtml = `<div>${t('inventory.noStatsToTransmute')}</div>`;
        } else {
          statsHtml = statOrder
            .filter((stat) => statsKeys.includes(stat))
            .map((stat) => {
              const value = item.stats[stat];
              const decimals = STATS[stat].decimalPlaces || 0;
              const formattedValue = value.toFixed(decimals);
              let adv = '';
              if (showAdvanced && statMinMax[stat]) {
                const min = statMinMax[stat].min.toFixed(decimals);
                const max = statMinMax[stat].max.toFixed(decimals);
                adv = `<span class="item-ref-range" style="color:#aaa;">${min} - ${max}</span>`;
              }
              return `<div class="stat-row" data-stat="${stat}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="flex:1;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <span>${formatStatName(stat)}: <b>${formattedValue}${isPercentStat(stat) ? '%' : ''}</b></span>
                  ${adv}
                </div>
                <button class="reroll-btn" data-idx="${idx}" data-stat="${stat}">${t('inventory.transmuteAction')}</button>
              </div>`;
            })
            .join('');
        }

        const handedLabel = item.getHandedLabel();
        const levelDetails = `${t('item.level')}: ${item.level}, ${t('item.tier')}: ${item.tier}${handedLabel ? `, ${handedLabel}` : ''}`;

        dialog.querySelector('#transmutation-selected-item').innerHTML = `
          <div class="item-preview">
            <div class="item-name" style="color:${ITEM_RARITY[item.rarity].color};">${item.getDisplayName()}</div>
            <div class="item-level">${levelDetails}</div>
            <div class="item-stats">${statsHtml}</div>
          </div>`;

        dialog.querySelectorAll('.reroll-btn').forEach((btn) => {
          btn.onclick = (e) => {
            if (mat.qty <= 0) return;
            const statToChange = e.currentTarget.dataset.stat;
            const orderIndex = statOrder.indexOf(statToChange);
            delete item.stats[statToChange];
            if (item.metaData) delete item.metaData[statToChange];
            const newStat = item.addRandomStat(statToChange);
            if (newStat) {
              statOrder[orderIndex] = newStat;
            } else {
              statOrder.splice(orderIndex, 1);
            }
            let msg;
            if (newStat) {
              msg = tp('inventory.transmutedStatToast', {
                oldStat: formatStatName(statToChange),
                newStat: formatStatName(newStat),
                item: item.type,
              });
            } else {
              msg = tp('inventory.transmutedStatRemovedToast', {
                stat: formatStatName(statToChange),
                item: item.type,
              });
            }
            this.handleMaterialUsed(
              this,
              mat,
              matDef,
              1,
              'material-transmute-dialog',
              msg,
              false,
            );
            dialog.querySelector('.material-qty').textContent = mat.qty;
            renderSelected(idx);
            if (mat.qty <= 0) {
              dialog.querySelectorAll('.reroll-btn').forEach((b) => {
                b.disabled = true;
              });
            }
          };
        });
      };

      dialog.querySelectorAll('.transmutation-item').forEach((row) => {
        const idx = parseInt(row.dataset.idx, 10);
        row.onclick = () => {
          dialog
            .querySelectorAll('.transmutation-item')
            .forEach((r) => r.classList.remove('selected'));
          row.classList.add('selected');
          renderSelected(idx);
        };
      });

      dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-transmute-dialog');
      return;
    }

    // Alternation Orb
    if (matDef.isCustom && matDef.id === 'alternation_orb') {
      const equipped = Object.entries(this.equippedItems)
        .filter(([slot, item]) => item)
        .map(([slot, item]) => ({ slot, item }));

      const html = String.raw;
      const itemRows = equipped
        .map(
          ({ slot, item }, idx) => `
        <div class="alternation-item" data-slot="${slot}" data-idx="${idx}">
          <span class="alternation-icon">${item.getIcon()}</span>
          <span><b>${item.type}</b> (Lvl ${item.level})</span>
          <span style="color:${ITEM_RARITY[item.rarity].color};">${item.rarity}</span>
        </div>`,
        )
        .join('');

      const content = html`
        <div class="inventory-modal-content">
          <button class="modal-close">&times;</button>
          <h2>${t(matDef.name || mat.name || '')}</h2>
          <p>${t(matDef.description || '')}</p>
          <p>${tp('inventory.youHaveAmount', { amount: `<b class="material-qty">${mat.qty}</b>` })}</p>
          <p>${t('inventory.selectItemAndStatReroll')}</p>
          <p>${tp('inventory.selectedItemLabel', { item: `<span id="alternation-selected-name">${t('common.none')}</span>` })}</p>
          <div id="alternation-item-list">
            ${equipped.length === 0 ? `<div style="color:#f55;">${t('inventory.noEquippedItems')}</div>` : itemRows}
          </div>
          <div id="alternation-selected-item" style="margin-top:10px;"></div>
          <div class="modal-controls">
            <button id="material-use-cancel">${t('common.cancel')}</button>
          </div>
        </div>`;

      const dialog = createModal({
        id: 'material-reroll-dialog',
        className: 'inventory-modal',
        content,
      });

      const renderSelected = (idx) => {
        const { item } = equipped[idx];
        dialog.querySelector('#alternation-selected-name').textContent = item.getDisplayName();

        const statsEntries = Object.entries(item.stats);
        const isPercentStat = (stat) =>
          stat.endsWith('Percent') ||
          stat === 'critChance' ||
          stat === 'blockChance' ||
          stat === 'lifeSteal' ||
          stat === 'manaSteal' ||
          stat === 'omniSteal';
        let showAdvanced = false;
        try {
          if (options.showAdvancedTooltips) showAdvanced = true;
        } catch (e) {}
        let statMinMax = {};
        if (showAdvanced) {
          statMinMax = item.getAllStatsMinMax();
        }
        let statsHtml;
        if (statsEntries.length === 0) {
          statsHtml = `<div>${t('inventory.noStatsToReroll')}</div>`;
        } else {
          statsHtml = statsEntries
            .map(([stat, value]) => {
              const decimals = STATS[stat].decimalPlaces || 0;
              const formattedValue = value.toFixed(decimals);
              let adv = '';
              if (showAdvanced && statMinMax[stat]) {
                const min = statMinMax[stat].min.toFixed(decimals);
                const max = statMinMax[stat].max.toFixed(decimals);
                adv = `<span class="item-ref-range" style="color:#aaa;">${min} - ${max}</span>`;
              }
              return `<div class="stat-row" data-stat="${stat}" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <div style="flex:1;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                  <span>${formatStatName(stat)}: <b>${formattedValue}${isPercentStat(stat) ? '%' : ''}</b></span>
                  ${adv}
                </div>
                <button class="reroll-btn" data-idx="${idx}" data-stat="${stat}">${t('inventory.rerollAction')}</button>
              </div>`;
            })
            .join('');
        }

        const handedLabel = item.getHandedLabel();
        const levelDetails = `${t('item.level')}: ${item.level}, ${t('item.tier')}: ${item.tier}${handedLabel ? `, ${handedLabel}` : ''}`;

        dialog.querySelector('#alternation-selected-item').innerHTML = `
          <div class="item-preview">
            <div class="item-name" style="color:${ITEM_RARITY[item.rarity].color};">${item.getDisplayName()}</div>
            <div class="item-level">${levelDetails}</div>
            <div class="item-stats">${statsHtml}</div>
          </div>`;

        dialog.querySelectorAll('.reroll-btn').forEach((btn) => {
          btn.onclick = (e) => {
            if (mat.qty <= 0) return;
            const statToReroll = e.currentTarget.dataset.stat;
            const range = AVAILABLE_STATS[statToReroll];
            const baseValue = Math.random() * (range.max - range.min) + range.min;
            const tierBonus = item.getTierBonus(statToReroll);
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
            const toastMsg = tp('inventory.rerolledStatToast', {
              stat: formatStatName(statToReroll),
              item: item.type,
            });
            this.handleMaterialUsed(
              this,
              mat,
              matDef,
              1,
              'material-reroll-dialog',
              toastMsg,
              false,
            );
            dialog.querySelector('.material-qty').textContent = mat.qty;
            renderSelected(idx);
            if (mat.qty <= 0) {
              dialog.querySelectorAll('.reroll-btn').forEach((b) => {
                b.disabled = true;
              });
            }
          };
        });
      };

      dialog.querySelectorAll('.alternation-item').forEach((row) => {
        const idx = parseInt(row.dataset.idx, 10);
        row.onclick = () => {
          dialog
            .querySelectorAll('.alternation-item')
            .forEach((r) => r.classList.remove('selected'));
          row.classList.add('selected');
          renderSelected(idx);
        };
      });

      dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-reroll-dialog');
      return;
    }

    // Default: show quantity modal
    const html = String.raw;
    const content = html`
    <div class="inventory-modal-content">
      <button class="modal-close">&times;</button>
      <h2>${t(matDef.name || mat.name || '')}</h2>
      <p>${t(matDef.description || '')}</p>
      <p>${tp('inventory.youHaveAmount', { amount: `<b>${mat.qty}</b>` })}</p>
      <label for="material-use-qty">${t('inventory.quantityLabel')}</label>
      <input
        id="material-use-qty"
        style="padding: 5px; border-radius: 10px;"
        type="number"
        min="1"
        max="${Math.min(mat.qty, INVENTORY_MAX_QTY)}"
        value="${Math.min(mat.qty, INVENTORY_MAX_QTY)}"
      />
      <div class="modal-controls">
        <button class="modal-buy" id="material-use-btn">${t('inventory.use')}</button>
        <button id="material-use-cancel">${t('common.cancel')}</button>
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
    const useBtn = dialog.querySelector('#material-use-btn');
    const useHandler = () => {
      let useQty = parseInt(qtyInput.value, 10);
      if (isNaN(useQty) || useQty < 1) useQty = 1;
      if (useQty > INVENTORY_MAX_QTY) useQty = INVENTORY_MAX_QTY;
      if (useQty > mat.qty) useQty = mat.qty;
      if (matDef && typeof matDef.onUse === 'function') {
        matDef.onUse(hero, useQty);
      }
      const materialName = t(matDef.name || mat.name || '');
      const toastMsg = tp('inventory.usedMaterialsToast', {
        quantity: useQty,
        item: materialName,
      });
      this.handleMaterialUsed(
        this,
        mat,
        matDef,
        useQty,
        'material-use-dialog',
        toastMsg,
      );
    };
    useBtn.onclick = useHandler;
    dialog.querySelector('#material-use-cancel').onclick = () => closeModal('material-use-dialog');
    // Add Enter key handler for usable materials
    if (matDef && typeof matDef.onUse === 'function') {
      qtyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          useHandler();
        }
      });
    }
  }

  getItemSalvageValue(item) {
    return Math.floor(25 * item.level * (Math.max(RARITY_ORDER.indexOf(item.rarity) / 2 + 1, 1)) * Math.max(item.tier * 3, 1));
  }

  getItemSalvageMaterial(item) {
    const rarityAmounts = {
      NORMAL: 1,
      MAGIC: 1.5,
      RARE: 2,
      EPIC: 2.5,
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
      Math.max(item.tier, 1),
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
    const rarityName = t(`rarity.${item.rarity.toLowerCase()}`);
    const messages = [tp('inventory.salvagedItemsOfRarity', { count: 1, rarity: rarityName })];
    if (this.salvageUpgradeMaterials) {
      const { id, qty } = this.getItemSalvageMaterial(item);
      this.addMaterial({ id, qty });
      messages.push(tp('inventory.gainedResource', { amount: qty, resource: t(MATERIALS[id].name) }));
    } else {
      const goldGained = this.getItemSalvageValue(item);
      if (goldGained > 0) {
        hero.gainGold(goldGained);
        messages.push(tp('inventory.gainedResource', { amount: goldGained, resource: t('inventory.gold') }));
      }
    }
    if (crystalsGained > 0) {
      hero.gainCrystals(crystalsGained);
      messages.push(
        tp('inventory.gainedResource', {
          amount: crystalsGained,
          resource: t('resource.crystal.name'),
        }),
      );
    }
    showToast(messages.join(', '), 'success');
    if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
      const sortMode =
        (typeof localStorage !== 'undefined' && localStorage.getItem('inventorySortMode')) ||
        'type-rarity-level';
      sortInventory(sortMode);
    } else {
      updateInventoryGrid();
      dataManager.saveGame();
    }
    updateMaterialsGrid();
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
      const rarityName = t(`rarity.${rarity.toLowerCase()}`);
      const messages = [tp('inventory.salvagedItemsOfRarity', { count: salvagedItems, rarity: rarityName })];
      if (this.salvageUpgradeMaterials) {
        Object.entries(matsGained).forEach(([id, qty]) => {
          this.addMaterial({ id, qty });
          messages.push(tp('inventory.gainedResource', { amount: qty, resource: t(MATERIALS[id].name) }));
        });
      } else if (goldGained > 0) {
        hero.gainGold(goldGained);
        messages.push(tp('inventory.gainedResource', { amount: goldGained, resource: t('inventory.gold') }));
      }
      if (crystalsGained > 0) {
        hero.gainCrystals(crystalsGained);
        messages.push(
          tp('inventory.gainedResource', {
            amount: crystalsGained,
            resource: t('resource.crystal.name'),
          }),
        );
      }
      showToast(messages.join(', '), 'success');
      if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
        const sortMode =
          (typeof localStorage !== 'undefined' && localStorage.getItem('inventorySortMode')) ||
          'type-rarity-level';
        sortInventory(sortMode);
      } else {
        updateInventoryGrid();
        dataManager.saveGame();
      }
      updateMaterialsGrid();
      updateResources(); // <-- update the UI after using a material
    } else {
      const rarityKey = `rarity.${rarity.toLowerCase()}`;
      showToast(tp('inventory.noRarityItemsToSalvage', { rarity: t(rarityKey).toLowerCase() }), 'info');
    }
  }

  salvageAllItems() {
    let salvagedItems = 0;
    let goldGained = 0;
    let crystalsGained = 0;
    const matsGained = {};

    this.inventoryItems = this.inventoryItems.map((item, index) => {
      if (index < PERSISTENT_SLOTS) return item;
      if (item) {
        salvagedItems++;
        if (this.salvageUpgradeMaterials) {
          const { id, qty } = this.getItemSalvageMaterial(item);
          matsGained[id] = (matsGained[id] || 0) + qty;
        } else {
          goldGained += this.getItemSalvageValue(item);
        }
        if (item.rarity === 'MYTHIC') crystalsGained++;
        return null;
      }
      return item;
    });

    if (salvagedItems > 0) {
      const messages = [tp('inventory.salvagedItems', { count: salvagedItems })];
      if (this.salvageUpgradeMaterials) {
        Object.entries(matsGained).forEach(([id, qty]) => {
          this.addMaterial({ id, qty });
          messages.push(tp('inventory.gainedResource', { amount: qty, resource: t(MATERIALS[id].name) }));
        });
      } else if (goldGained > 0) {
        hero.gainGold(goldGained);
        messages.push(tp('inventory.gainedResource', { amount: goldGained, resource: t('inventory.gold') }));
      }
      if (crystalsGained > 0) {
        hero.gainCrystals(crystalsGained);
        messages.push(
          tp('inventory.gainedResource', {
            amount: crystalsGained,
            resource: t('resource.crystal.name'),
          }),
        );
      }
      showToast(messages.join(', '), 'success');
      if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
        const sortMode =
          (typeof localStorage !== 'undefined' && localStorage.getItem('inventorySortMode')) ||
          'type-rarity-level';
        sortInventory(sortMode);
      } else {
        updateInventoryGrid();
        dataManager.saveGame();
      }
      updateMaterialsGrid();
      updateResources();
    } else {
      showToast(t('inventory.noItemsToSalvage'), 'info');
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
    if (!this.canEquipInSlot(draggedRing, targetSlot)) {
      return;
    }
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

    hero.queueRecalculateFromAttributes();
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
      // Item is equipped, only move if target slot is empty
      if (targetItem) {
        return;
      }

      for (const [slot, equippedItem] of Object.entries(this.equippedItems)) {
        if (equippedItem.id === item.id) {
          delete this.equippedItems[slot];
          this.inventoryItems[newPosition] = item;
          break;
        }
      }
    }
    updateInventoryGrid();
    hero.queueRecalculateFromAttributes();
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
    const rarityBonus = hero.stats.itemRarityPercent || 0;
    const entries = Object.entries(ITEM_RARITY).map(([key, config]) => {
      const rarityIndex = RARITY_ORDER.indexOf(config.name);
      const weight =
        config.chance *
        (1 + boostFactor * rarityIndex) *
        (1 + rarityBonus * rarityIndex);
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
    statistics.increment('itemsFound', item.rarity.toLowerCase());
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
    if (
      this.autoSalvageRarities &&
      this.autoSalvageRarities.length > 0 &&
      this.autoSalvageRarities.includes(item.rarity)
    ) {
      this.salvageItemsByRarity(item.rarity);
      return;
    }
    this.hasNewItems = true; // Set flag when new item is added and kept
    if (crystalShop.crystalUpgrades.autoSortInventory && options.autoSortInventory) {
      const sortMode =
        (typeof localStorage !== 'undefined' && localStorage.getItem('inventorySortMode')) ||
        'type-rarity-level';
      sortInventory(sortMode);
    } else {
      updateInventoryGrid();
      dataManager.saveGame();
    }
  }

  setAutoSalvageRarities(rarities) {
    this.autoSalvageRarities = rarities;
    dataManager.saveGame();
  }

  setSalvageUpgradeMaterials(value) {
    this.salvageUpgradeMaterials = value;
    options.salvageMaterialsEnabled = value;
    dataManager.saveGame();
  }

  removeTooltip() {
    const tooltips = document.querySelectorAll('.item-tooltip');
    tooltips.forEach((tooltip) => tooltip.remove());
  }

  isTwoHanded(item) {
    return !!item && TWO_HANDED_TYPES.includes(item.type);
  }

  canEquipInSlot(item, slotName) {
    if (!item || !SLOT_REQUIREMENTS[slotName]?.includes(item.type)) {
      return false;
    }
    if (slotName === 'offhand') {
      if (this.isTwoHanded(item)) return false;
      if (this.isTwoHanded(this.equippedItems.weapon)) return false;
    }
    return true;
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
    if (!item) return false;
    const currentPosition = this.inventoryItems.findIndex((i) => i && i.id === item.id);

    // If equipping to the slot it's already in, treat as unequip
    if (this.equippedItems[slot] && this.equippedItems[slot].id === item.id) {
      const emptySlot = this.inventoryItems.findIndex((s) => s === null);
      if (emptySlot !== -1) {
        this.inventoryItems[emptySlot] = item;
        delete this.equippedItems[slot];
        dataManager.saveGame();
        return true;
      }
      return false;
    }

    if (!this.canEquipInSlot(item, slot)) {
      if (slot === 'offhand' && this.isTwoHanded(this.equippedItems.weapon)) {
        showToast(t('inventory.cannotEquipOffhandTwoHanded'), 'error');
      }
      return false;
    }

    const sourceSlot = Object.entries(this.equippedItems).find(
      ([slotName, equipped]) => equipped && equipped.id === item.id,
    )?.[0];
    const movingBetweenSlots = sourceSlot && sourceSlot !== slot;
    const isTwoHandedWeapon = slot === 'weapon' && this.isTwoHanded(item);

    const itemsToReturn = [];
    if (isTwoHandedWeapon && this.equippedItems.offhand) {
      itemsToReturn.push({ item: this.equippedItems.offhand, sourceSlot: 'offhand' });
    }
    if (this.equippedItems[slot] && this.equippedItems[slot].id !== item.id) {
      itemsToReturn.push({ item: this.equippedItems[slot], sourceSlot: slot });
    }

    const availableSlotsQueue = [];
    if (currentPosition !== -1) {
      availableSlotsQueue.push(currentPosition);
    }
    for (let i = 0; i < this.inventoryItems.length; i++) {
      if (i === currentPosition) continue;
      if (this.inventoryItems[i] === null) {
        availableSlotsQueue.push(i);
      }
    }

    if (itemsToReturn.length > availableSlotsQueue.length) {
      showToast(t('inventory.notEnoughInventorySpace'), 'error');
      return false;
    }

    if (currentPosition !== -1) {
      this.inventoryItems[currentPosition] = null;
    }

    if (movingBetweenSlots) {
      delete this.equippedItems[sourceSlot];
    }

    itemsToReturn.forEach(({ sourceSlot: slotName }) => {
      delete this.equippedItems[slotName];
    });

    itemsToReturn.forEach(({ item: oldItem }) => {
      const index = availableSlotsQueue.shift();
      if (index !== undefined) {
        this.inventoryItems[index] = oldItem;
      }
    });

    const removedOffhand = isTwoHandedWeapon && itemsToReturn.some((entry) => entry.sourceSlot === 'offhand');
    if (removedOffhand) {
      showToast(t('inventory.offhandUnequippedTwoHanded'), 'info');
    }

    // Equip the new item
    this.equippedItems[slot] = item;
    dataManager.saveGame();
    return true;
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
