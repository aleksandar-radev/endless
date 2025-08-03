import { dataManager, hero, options, skillTree, statistics, inventory } from './globals.js';
import {
  updateResources,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
  showToast,
  updateStageUI,
} from './ui/ui.js';
import { selectBoss } from './ui/bossUi.js';
import { handleSavedData } from './functions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { createModal } from './ui/modal.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  startingStage: {
    label: 'Starting Stage',
    bonus: 1,
    bonusLabel: 'Increases starting stage by 1',
    showLevel: true,
    baseCost: 2,
    costIncrement: 0.02, // 1 per 50 levels
    multiple: true,
    bulkModal: true,
  },
  stageSkip: {
    label: 'Stage Skip',
    bonus: 1,
    bonusLabel: 'Skip +1 stage per kill',
    showLevel: true,
    baseCost: 20,
    costIncrement: 5,
    multiple: true,
    bulkModal: true,
  },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    bonusLabel: 'Auto-continue after death',
    baseCost: 20,
    oneTime: true,
  },
  autoSpellCast: {
    label: 'Auto Spell Cast',
    bonus: 'Automatically casts instant and buff skills',
    bonusLabel: 'Automatically casts instant and buff skills',
    baseCost: 40,
    oneTime: true,
  },
  resetSkillTree: {
    label: 'Reset Skill Tree',
    bonus: 'Refund all skill points and reset path',
    bonusLabel: 'Refund all skill points and reset path',
    baseCost: 50,
    multiple: true,
  },
  resetAttributes: {
    label: 'Reset Attributes',
    bonus: 'Refund all allocated attribute points',
    bonusLabel: 'Refund all allocated attribute points',
    baseCost: 10,
    multiple: true,
  },
  resetArenaLevel: {
    label: 'Reset Arena Level',
    bonus: 'Reset Arena level to 1',
    bonusLabel: 'Reset Arena level to 1',
    baseCost: 50,
    multiple: true,
  },
  autoSalvage: {
    label: 'Auto-Salvage',
    bonus: 'Automatically salvage items of selected rarities',
    bonusLabel: 'Automatically salvage selected rarities',
    baseCost: 10,
    costIncrement: 10,
    showLevel: true,
    multiple: true,
    maxLevel: 6,
  },
  autoConsumeMaterials: {
    label: 'Auto-Consume Materials',
    bonus: 'Automatically uses all consumable materials on pickup',
    bonusLabel: 'Automatically uses all consumable materials on pickup',
    baseCost: 1000,
    oneTime: true,
  },
  salvageMaterials: {
    label: 'Salvage Materials',
    bonus: 'Allows salvaging items for upgrade materials instead of gold',
    bonusLabel: 'Allows salvaging items for upgrade materials instead of gold',
    baseCost: 200,
    oneTime: true,
  },
};

export default class CrystalShop {
  constructor(savedData = null) {
    this.crystalUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = 1;
  }

  resetCrystalShop() {
    this.crystalUpgrades = {};
  }

  async initializeCrystalShopUI() {
    const crystalShopTab = document.getElementById('crystalShop');
    if (!crystalShopTab) return;
    // Create .crystalShop-container and .crystalShop-upgrades-container if not present
    let shopContainer = crystalShopTab.querySelector('.crystalShop-container');
    if (!shopContainer) {
      shopContainer = document.createElement('div');
      shopContainer.className = 'crystalShop-container';
      crystalShopTab.innerHTML = '';
      crystalShopTab.appendChild(shopContainer);
    }
    let upgradesContainer = shopContainer.querySelector('.crystalShop-upgrades-container');
    if (!upgradesContainer) {
      upgradesContainer = document.createElement('div');
      upgradesContainer.className = 'crystalShop-upgrades-container';
      shopContainer.appendChild(upgradesContainer);
    }
    upgradesContainer.innerHTML = `
      <div class="crystal-upgrades-grid">
        ${Object.entries(CRYSTAL_UPGRADE_CONFIG)
    .map(([stat, config]) => this.createCrystalUpgradeButton(stat, config))
    .join('')}
      </div>
    `;
    this.setupCrystalUpgradeHandlers();
    if (!this.modal) this.createUpgradeModal();
  }

  createCrystalUpgradeButton(stat, config) {
    let alreadyPurchased = config.oneTime && this.crystalUpgrades[stat];
    const level = this.crystalUpgrades[stat] || 0;
    const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * level);
    let isMaxed = false;
    if (stat === 'autoSalvage' && config.maxLevel) {
      isMaxed = level >= config.maxLevel;
    }
    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased || isMaxed ? 'purchased' : ''}" data-stat="${stat}" ${
  alreadyPurchased || isMaxed ? 'disabled' : ''
}>
        <span class="upgrade-name">${config.label} ${config.showLevel ? `(Lvl ${level}${isMaxed ? ' / Max' : ''})` : ''}</span>
        <span class="upgrade-bonus">${config.bonusLabel}${isMaxed ? ' <strong>Max</strong>' : ''}</span>
        <span class="upgrade-cost">${alreadyPurchased ? 'Purchased' : isMaxed ? 'Max' : `${cost} Crystals`}</span>
      </button>
    `;
  }

  setupCrystalUpgradeHandlers() {
    const buttons = document.querySelectorAll('.crystal-upgrade-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const stat = button.dataset.stat;
        this.openUpgradeModal(stat);
      });
    });
  }

  createUpgradeModal() {
    const content = html`
      <div class="crystalShop-modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h2 class="modal-title"></h2>
        <div class="modal-fields"></div>
        <div class="modal-controls" style="display:none;"></div>
        <button class="modal-buy">Buy</button>
      </div>
    `;
    this.modal = createModal({
      id: 'crystalShop-modal',
      className: 'crystalShop-modal hidden',
      content,
      onClose: () => this.closeModal(),
    });
    this.modal.querySelector('.modal-close').onclick = () => this.closeModal();
    this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
  }

  /**
   * Handle crystal‐costed resets via confirmation dialogs,
   * instead of opening the bulk‐buy modal.
   */
  async confirmReset(stat) {
    const cost = CRYSTAL_UPGRADE_CONFIG[stat].baseCost;
    if (hero.crystals < cost) {
      showToast(`Need ${cost} crystals for this upgrade`, 'error');
      return;
    }
    let confirmed;
    if (stat === 'resetSkillTree') {
      confirmed = await showConfirmDialog(
        'Are you sure you want to reset your class and refund all skill points?<br>' +
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`,
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      skillTree.resetSkillTree();
      updateSkillTreeValues();
      updateActionBar();
      initializeSkillTreeUI();
      showToast('Class has been reset and all points refunded.', 'success');
    } else if (stat === 'resetAttributes') {
      confirmed = await showConfirmDialog(
        'Are you sure you want to reset all allocated attribute points?<br>' +
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`,
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.resetAttributes();
      updateStatsAndAttributesUI();
      showToast('All attribute points have been refunded.', 'success');
    } else if (stat === 'resetArenaLevel') {
      confirmed = await showConfirmDialog(
        'Are you sure you want to reset your boss level to 1?<br>' +
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`,
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.bossLevel = 1;
      selectBoss();
      updateStageUI();
      showToast('Boss level has been reset to 1.', 'success');
    }
    updateResources();
    dataManager.saveGame();
    this.initializeCrystalShopUI();
  }

  /**
   * Opens the upgrade modal or, for reset buttons, shows confirmation dialogs.
   */
  async openUpgradeModal(stat) {
    if (stat === 'resetSkillTree' || stat === 'resetAttributes' || stat === 'resetArenaLevel') {
      await this.confirmReset(stat);
      return;
    }

    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = config.label;
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    this.selectedQty = 1;

    if (config.bulkModal) {
      fields.innerHTML = `
        <p>Current Level: <span class="modal-level"></span></p>
        <p>Current Bonus: <span class="modal-bonus"></span></p>
        <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
        <p>Total Bonus: <span class="modal-total-bonus"></span></p>
        <p>Total Cost: <span class="modal-total-cost"></span> Crystals (<span class="modal-qty">1</span>)</p>
      `;
      controls.style.display = '';
      controls.innerHTML = `
        <button data-qty="1">+1</button>
        <button data-qty="10">+10</button>
        <button data-qty="50">+50</button>
        <button data-qty="max">Max</button>
      `;
      controls.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          this.selectedQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          this.updateModalDetails();
        };
      });
      buyBtn.style.display = '';
      this.updateModalDetails();
    } else if (config.oneTime) {
      controls.style.display = 'none';
      const purchased = !!this.crystalUpgrades[stat];
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
        <div class="modal-status">${
  purchased ? '<span style="color:#10b981;font-weight:bold;">Purchased</span>' : ''
}</div>
      `;
      buyBtn.style.display = purchased ? 'none' : '';
      buyBtn.disabled = purchased;
    } else if (config.multiple) {
      controls.style.display = 'none';
      // Show current level and next cost for autoSalvage
      if (stat === 'autoSalvage') {
        const level = this.crystalUpgrades[stat] || 0;
        const cap = config.maxLevel || 6;
        const nextCost = config.baseCost + (config.costIncrement || 0) * level;
        const isMaxed = level >= cap;
        fields.innerHTML = `
          <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
          <p>Current Level: <span class="modal-level">${level}</span> / <span class="modal-max-level">${cap}</span></p>
          ${isMaxed ? '<p style="color:#10b981;font-weight:bold;">Maxed</p>' : `<p>Next Level Cost: <span class="modal-total-cost">${nextCost}</span> Crystals</p>`}
        `;
        buyBtn.disabled = isMaxed;
        buyBtn.style.display = isMaxed ? 'none' : '';
      } else {
        fields.innerHTML = `
          <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
          <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
        `;
        buyBtn.style.display = '';
        buyBtn.disabled = false;
      }
    }

    m.classList.remove('hidden');
    if (stat === 'startingStage') this.updateModalDetails();
  }

  updateModalDetails() {
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    const m = this.modal;
    const q = (sel) => m.querySelector(sel);

    if (config.bulkModal) {
      const baseLevel = this.crystalUpgrades[stat] || 0;
      const crystalsAvailable = hero.crystals;
      let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
      let totalCost = 0;

      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let crystals = crystalsAvailable;
        while (true) {
          const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * lvl);
          if (crystals < cost) break;
          crystals -= cost;
          totalCost += cost;
          lvl++;
          qty++;
        }
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * (baseLevel + i));
          totalCost += cost;
        }
      }

      const bonusValue = (config.bonus || 0) * qty;
      if (q('.modal-qty')) q('.modal-qty').textContent = qty;
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = totalCost;
      if (q('.modal-total-bonus')) q('.modal-total-bonus').textContent = `+${bonusValue} ${config.label}`;
      if (q('.modal-level')) q('.modal-level').textContent = baseLevel;
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
      if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);

      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = qty <= 0 || totalCost > crystalsAvailable;
    } else if (stat === 'autoSalvage') {
      const level = this.crystalUpgrades[stat] || 0;
      const cap = config.maxLevel || 6;
      const nextCost = Math.floor(config.baseCost + (config.costIncrement || 0) * level);
      const isMaxed = level >= cap;
      if (q('.modal-level')) q('.modal-level').textContent = level;
      if (q('.modal-max-level')) q('.modal-max-level').textContent = cap;
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = nextCost;
      const buyBtn = q('.modal-buy');
      if (buyBtn) {
        buyBtn.disabled = isMaxed || hero.crystals < nextCost;
        buyBtn.style.display = isMaxed ? 'none' : '';
      }
      // Hide cost if maxed
      const costP = q('.modal-total-cost')?.closest('p');
      if (costP) costP.style.display = isMaxed ? 'none' : '';
    } else if (config.multiple) {
      // For other multiples, show floored cost
      const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * (this.crystalUpgrades[stat] || 0));
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = cost;
    }
  }

  getBonusText(stat, config, level) {
    if (config.oneTime) return '';
    const baseBonus = config.bonus || 0;
    const bonus = baseBonus * level;
    return `+${bonus} ${config.label}`;
  }

  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  /**
   * Generic bulk purchase for any “multiple” upgrade with levels.
   * @private
   * @param {string} stat
   * @param {{ baseCost: number, costIncrement?: number, label: string }} config
   * @param {number|'max'} qty
   */
  async _bulkPurchase(stat, config, qty) {
    const { baseCost, costIncrement = 0, label } = config;
    let level = this.crystalUpgrades[stat] || 0;
    let count = 0,
      totalCost = 0;
    const nextCost = (lvl) => Math.floor(baseCost + costIncrement * lvl);

    if (qty === 'max') {
      while (hero.crystals >= nextCost(level)) {
        const cost = nextCost(level++);
        hero.crystals -= cost;
        totalCost += cost;
        count++;
      }
    } else {
      for (let i = 0; i < qty; i++) {
        const cost = nextCost(level);
        if (hero.crystals < cost) break;
        hero.crystals -= cost;
        totalCost += cost;
        level++;
        count++;
      }
    }

    this.crystalUpgrades[stat] = level;
    this._commitChanges(false);
    this.updateModalDetails();
    showToast(`Upgraded ${label} by ${count} level${count !== 1 ? 's' : ''}!`, count > 0 ? 'success' : 'error');
  }

  /**
   * Handle a single one-time purchase.
   * @private
   * @param {string} stat
   * @param {{ baseCost: number, label: string }} config
   */
  async _handleOneTimePurchase(stat, config) {
    const { baseCost, label } = config;
    if (this.crystalUpgrades[stat]) return;
    if (hero.crystals < baseCost) {
      showToast('Not enough crystals!', 'error');
      return;
    }

    hero.crystals -= baseCost;
    this.crystalUpgrades[stat] = true;
    this._commitChanges();
    showToast(`Purchased ${label}!`, 'success');

    if (stat === 'autoSpellCast') {
      initializeSkillTreeUI();
    }

    if (stat === 'salvageMaterials' && options.salvageMaterialsEnabled) {
      inventory.setSalvageUpgradeMaterials(true);
    }
  }

  /**
   * Handle a simple incremental purchase for “multiple” upgrades without bulk tiers.
   * @private
   * @param {string} stat
   * @param {{ baseCost: number, label: string }} config
   */
  async _handleMultiplePurchase(stat, config) {
    const { baseCost, label } = config;
    if (hero.crystals < baseCost) {
      showToast('Not enough crystals!', 'error');
      return;
    }

    hero.crystals -= baseCost;
    this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
    this._commitChanges();
    showToast(`Purchased ${label}!`, 'success');
  }

  /**
   * Centralize game save, resource/UI updates and optional modal close.
   * @private
   * @param {boolean} [close=true] whether to close the modal
   */
  _commitChanges(close = true) {
    try {
      dataManager.saveGame();
      updateResources();
      this.initializeCrystalShopUI();
      if (close) this.closeModal();
    } catch (err) {
      console.error(err);
      showToast('Error updating shop. Please try again.', 'error');
    }
  }

  /**
   * Main entry-point for all crystal purchases.
   * Routes to resets, bulk, one-time or multiple handlers.
   * @param {string} stat
   * @param {number|'max'} qty
   */
  async buyBulk(stat, qty) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;

    // special resets use confirm dialog
    if (['resetSkillTree', 'resetAttributes', 'resetArenaLevel'].includes(stat)) {
      await this.confirmReset(stat);
      return;
    }

    // tiered/bulk multiple
    if (config.multiple && config.costIncrement != null) {
      if (stat === 'startingStage') {
        const current = this.crystalUpgrades.startingStage || 0;
        const highest = Math.max(...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0));
        const cap = Math.floor(highest * 0.75);
        if (current >= cap) {
          showToast(`Cannot upgrade Starting Stage above ${cap}. Reach a higher stage to unlock more.`, 'error');
          return;
        }
        // adjust qty so we never exceed the cap
        if (qty === 'max') {
          qty = cap - current;
        } else {
          qty = Math.min(qty, cap - current);
        }
      } else if (stat === 'autoSalvage') {
        const current = this.crystalUpgrades.autoSalvage || 0;
        const cap = CRYSTAL_UPGRADE_CONFIG.autoSalvage.maxLevel || 6;
        if (current >= cap) {
          showToast('Auto-Salvage is maxed out.', 'error');
          return;
        }
        if (qty === 'max') {
          qty = cap - current;
        } else {
          qty = Math.min(qty, cap - current);
        }
      }
      await this._bulkPurchase(stat, config, qty);
      if (stat === 'startingStage') options.updateStartingStageOption();
      if (stat === 'stageSkip') options.updateStageSkipOption();
      return;
    }

    // single-use
    if (config.oneTime) {
      await this._handleOneTimePurchase(stat, config);
      return;
    }

    // simple repeated purchase
    if (config.multiple) {
      await this._handleMultiplePurchase(stat, config);
    }
  }

  hasAutoSpellCastUpgrade() {
    return !!this.crystalUpgrades.autoSpellCast;
  }
}
