import { dataManager, hero, options, skillTree, statistics, inventory, game, training } from './globals.js';
import {
  updateResources,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
  showToast,
  updateStageUI,
  formatNumber,
} from './ui/ui.js';
import { t } from './i18n.js';
import { selectBoss } from './ui/bossUi.js';
import { handleSavedData } from './functions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { createModal } from './ui/modal.js';
import { CRYSTAL_SHOP_MAX_QTY } from './constants/limits.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  continuousPlay: {
    label: 'crystalShop.upgrade.continuousPlay.label',
    bonus: 'crystalShop.upgrade.continuousPlay.bonus',
    bonusLabel: 'crystalShop.upgrade.continuousPlay.bonusLabel',
    baseCost: 6,
    oneTime: true,
    category: 'auto',
  },
  autoSpellCast: {
    label: 'crystalShop.upgrade.autoSpellCast.label',
    bonus: 'crystalShop.upgrade.autoSpellCast.bonus',
    bonusLabel: 'crystalShop.upgrade.autoSpellCast.bonusLabel',
    baseCost: 40,
    oneTime: true,
    category: 'auto',
  },
  autoSalvage: {
    label: 'crystalShop.upgrade.autoSalvage.label',
    bonus: 'crystalShop.upgrade.autoSalvage.bonus',
    bonusLabel: 'crystalShop.upgrade.autoSalvage.bonusLabel',
    baseCost: 20,
    costIncrement: 10,
    showLevel: true,
    multiple: true,
    maxLevel: 6,
    category: 'auto',
  },
  autoConsumeMaterials: {
    label: 'crystalShop.upgrade.autoConsumeMaterials.label',
    bonus: 'crystalShop.upgrade.autoConsumeMaterials.bonus',
    bonusLabel: 'crystalShop.upgrade.autoConsumeMaterials.bonusLabel',
    baseCost: 600,
    oneTime: true,
    category: 'auto',
  },
  autoClaimQuests: {
    label: 'crystalShop.upgrade.autoClaimQuests.label',
    bonus: 'crystalShop.upgrade.autoClaimQuests.bonus',
    bonusLabel: 'crystalShop.upgrade.autoClaimQuests.bonusLabel',
    baseCost: 400,
    oneTime: true,
    category: 'auto',
  },
  autoSortInventory: {
    label: 'crystalShop.upgrade.autoSortInventory.label',
    bonus: 'crystalShop.upgrade.autoSortInventory.bonus',
    bonusLabel: 'crystalShop.upgrade.autoSortInventory.bonusLabel',
    baseCost: 25,
    oneTime: true,
    category: 'auto',
  },
  startingStage: {
    label: 'crystalShop.upgrade.startingStage.label',
    bonus: 1,
    bonusLabel: 'crystalShop.upgrade.startingStage.bonusLabel',
    showLevel: true,
    baseCost: 2,
    costIncrement: 0.05, // 1 per 20 levels
    multiple: true,
    bulkModal: true,
    category: 'stage',
  },
  stageSkip: {
    label: 'crystalShop.upgrade.stageSkip.label',
    bonus: 1,
    bonusLabel: 'crystalShop.upgrade.stageSkip.bonusLabel',
    showLevel: true,
    baseCost: 20,
    costIncrement: 5,
    multiple: true,
    bulkModal: true,
    category: 'stage',
  },
  resetStageSkip: {
    label: 'crystalShop.upgrade.resetStageSkip.label',
    bonus: 'crystalShop.upgrade.resetStageSkip.bonus',
    bonusLabel: 'crystalShop.upgrade.resetStageSkip.bonusLabel',
    baseCost: 500,
    oneTime: true,
    category: 'stage',
  },
  resetSkillTree: {
    label: 'crystalShop.upgrade.resetSkillTree.label',
    bonus: 'crystalShop.upgrade.resetSkillTree.bonus',
    bonusLabel: 'crystalShop.upgrade.resetSkillTree.bonusLabel',
    baseCost: 20,
    multiple: true,
    category: 'reset',
  },
  resetAttributes: {
    label: 'crystalShop.upgrade.resetAttributes.label',
    bonus: 'crystalShop.upgrade.resetAttributes.bonus',
    bonusLabel: 'crystalShop.upgrade.resetAttributes.bonusLabel',
    baseCost: 20,
    multiple: true,
    category: 'reset',
  },
  resetArenaLevel: {
    label: 'crystalShop.upgrade.resetArenaLevel.label',
    bonus: 'crystalShop.upgrade.resetArenaLevel.bonus',
    bonusLabel: 'crystalShop.upgrade.resetArenaLevel.bonusLabel',
    baseCost: 50,
    multiple: true,
    category: 'reset',
  },
  resetTraining: {
    label: 'crystalShop.upgrade.resetTraining.label',
    bonus: 'crystalShop.upgrade.resetTraining.bonus',
    bonusLabel: 'crystalShop.upgrade.resetTraining.bonusLabel',
    baseCost: 150,
    multiple: true,
    category: 'reset',
  },
  deathTimerReduction: {
    label: 'crystalShop.upgrade.deathTimerReduction.label',
    bonus: 0.5,
    bonusLabel: 'crystalShop.upgrade.deathTimerReduction.bonusLabel',
    showLevel: true,
    baseCost: 50,
    costIncrement: 0,
    multiple: true,
    bulkModal: true,
    category: 'misc',
  },
  salvageMaterials: {
    label: 'crystalShop.upgrade.salvageMaterials.label',
    bonus: 'crystalShop.upgrade.salvageMaterials.bonus',
    bonusLabel: 'crystalShop.upgrade.salvageMaterials.bonusLabel',
    baseCost: 200,
    oneTime: true,
    category: 'misc',
  },
};

export default class CrystalShop {
  constructor(savedData = null) {
    this.crystalUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = options.useNumericInputs
      ? Math.min(options.crystalShopQty || 1, CRYSTAL_SHOP_MAX_QTY)
      : 1;
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

  updateCrystalShopUI() {
    const crystalShopTab = document.getElementById('crystalShop');
    if (!crystalShopTab) return;
    const shopContainer = crystalShopTab.querySelector('.crystalShop-container');
    if (!shopContainer) return;
    const upgradesContainer = shopContainer.querySelector('.crystalShop-upgrades-container');
    if (!upgradesContainer) return;
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

  updateCrystalShopAffordability() {
    const buttons = document.querySelectorAll('.crystal-upgrade-btn');
    buttons.forEach((button) => {
      const stat = button.dataset.stat;
      const config = CRYSTAL_UPGRADE_CONFIG[stat];
      if (!config) return;
      const level = this.crystalUpgrades[stat] || 0;
      const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * level);
      const alreadyPurchased = config.oneTime && this.crystalUpgrades[stat];
      const isMaxed = config.maxLevel ? level >= config.maxLevel : false;
      const costEl = button.querySelector('.upgrade-cost');
      const bonusEl = button.querySelector('.upgrade-bonus');
      const unaffordable = hero.crystals < cost && !alreadyPurchased && !isMaxed;
      if (costEl) {
        costEl.textContent = alreadyPurchased
          ? t('common.purchased')
          : isMaxed
            ? t('common.max')
            : `${cost} ${t('resource.crystal.name')}`;
        costEl.classList.toggle('unaffordable', unaffordable);
      }
      if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
      button.disabled = alreadyPurchased || isMaxed;
    });
  }

  createCrystalUpgradeButton(stat, config) {
    let alreadyPurchased = config.oneTime && this.crystalUpgrades[stat];
    const level = this.crystalUpgrades[stat] || 0;
    const cost = Math.floor(config.baseCost + (config.costIncrement || 0) * level);
    let isMaxed = false;
    if (config.maxLevel) {
      isMaxed = level >= config.maxLevel;
    }
    const label = t(config.label);
    const bonusLabel = t(config.bonusLabel);
    const levelText = config.showLevel
      ? `(${t('common.lvl')} ${level}${isMaxed ? ' / ' + t('common.max') : ''})`
      : '';
    const bonusText = `${bonusLabel}${isMaxed ? ' <strong>' + t('common.max') + '</strong>' : ''}`;
    const costText = alreadyPurchased
      ? t('common.purchased')
      : isMaxed
        ? t('common.max')
        : `${cost} ${t('resource.crystal.name')}`;
    return `
      <button class="crystal-upgrade-btn ${config.category} ${alreadyPurchased || isMaxed ? 'purchased' : ''}" data-stat="${stat}" ${alreadyPurchased || isMaxed ? 'disabled' : ''}>
        <span class="upgrade-name">${label} ${levelText}</span>
        <span class="upgrade-bonus">${bonusText}</span>
        <span class="upgrade-cost">${costText}</span>
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
      if (game.fightMode === 'arena') {
        selectBoss();
      }
      updateStageUI();
      showToast('Boss level has been reset to 1.', 'success');
    } else if (stat === 'resetTraining') {
      confirmed = await showConfirmDialog(
        'Are you sure you want to reset all training upgrades and refund the gold spent?<br>' +
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`,
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      const refund = training.goldSpent || 0;
      const prevQty = training.quickQty;
      training.reset();
      training.quickQty = prevQty;
      hero.gold += refund;
      training.updateTrainingUI('gold-upgrades');
      hero.recalculateFromAttributes();
      updateStatsAndAttributesUI();
      showToast(
        `All training upgrades have been reset. Refunded ${formatNumber(refund)} Gold.`,
        'success',
      );
    }
    updateResources();
    dataManager.saveGame();
    this.initializeCrystalShopUI();
  }

  /**
   * Opens the upgrade modal or, for reset buttons, shows confirmation dialogs.
   */
  async openUpgradeModal(stat) {
    if (['resetSkillTree', 'resetAttributes', 'resetArenaLevel', 'resetTraining'].includes(stat)) {
      await this.confirmReset(stat);
      return;
    }

    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = t(config.label);
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    this.selectedQty = options.useNumericInputs
      ? Math.min(options.crystalShopQty || 1, CRYSTAL_SHOP_MAX_QTY)
      : 1;

    if (config.bulkModal) {
      const maxLevelText = config.maxLevel ? ' / <span class="modal-max-level"></span>' : '';
      fields.innerHTML = `
        <p>Current Level: <span class="modal-level"></span>${maxLevelText}</p>
        <p>Current Bonus: <span class="modal-bonus"></span></p>
        <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
        <p>Total Bonus: <span class="modal-total-bonus"></span></p>
        <p>Total Cost: <span class="modal-total-cost"></span> Crystals (<span class="modal-qty">1</span>)</p>
      `;
      controls.style.display = '';
      if (options.useNumericInputs) {
        controls.innerHTML = `
        <input type="number" class="modal-qty-input input-number" min="1" max="${CRYSTAL_SHOP_MAX_QTY}" value="${this.selectedQty}" />
        <button data-qty="max">Max</button>
      `;
        const qtyInput = controls.querySelector('.modal-qty-input');
        const maxBtn = controls.querySelector('button[data-qty="max"]');
        qtyInput.addEventListener('input', () => {
          let val = parseInt(qtyInput.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > CRYSTAL_SHOP_MAX_QTY) val = CRYSTAL_SHOP_MAX_QTY;
          this.selectedQty = val;
          options.crystalShopQty = val;
          this.updateModalDetails();
          dataManager.saveGame();
        });
        maxBtn.onclick = () => {
          this.selectedQty = 'max';
          this.updateModalDetails();
        };
      } else {
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
      }
      buyBtn.style.display = '';
      this.updateModalDetails();
    } else if (config.oneTime) {
      controls.style.display = 'none';
      const purchased = !!this.crystalUpgrades[stat];
      const oneTimeBonusText = typeof config.bonus === 'string' ? t(config.bonus) : (config.bonus || '');
      fields.innerHTML = `
        <p>${oneTimeBonusText}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
        <div class="modal-status">${
  purchased ? '<span style="color:#10b981;font-weight:bold;">' + t('common.purchased') + '</span>' : ''
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
        const autoSalvageBonus = typeof config.bonus === 'string' ? t(config.bonus) : (config.bonus || '');
        fields.innerHTML = `
          <p>${autoSalvageBonus}</p>
          <p>Current Level: <span class="modal-level">${level}</span> / <span class="modal-max-level">${cap}</span></p>
          ${isMaxed ? '<p style="color:#10b981;font-weight:bold;">' + t('common.max') + '</p>' : `<p>Next Level Cost: <span class="modal-total-cost">${nextCost}</span> Crystals</p>`}
        `;
        buyBtn.disabled = isMaxed;
        buyBtn.style.display = isMaxed ? 'none' : '';
      } else {
        const multipleBonus = typeof config.bonus === 'string' ? t(config.bonus) : (config.bonus || '');
        fields.innerHTML = `
            <p>${multipleBonus}</p>
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
      const cap = config.maxLevel || Infinity;
      const levelsLeft = Math.max(0, cap - baseLevel);
      let qty = this.selectedQty === 'max' ? levelsLeft : this.selectedQty;
      qty = Math.min(qty, levelsLeft, CRYSTAL_SHOP_MAX_QTY);
      let totalCost = 0;

      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let crystals = crystalsAvailable;
        qty = 0;
        while (lvl < cap && qty < CRYSTAL_SHOP_MAX_QTY) {
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

      const isMaxed = levelsLeft === 0;
      if (q('.modal-max-level')) q('.modal-max-level').textContent = cap;
      if (q('.modal-level')) q('.modal-level').textContent = baseLevel;
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);

      if (isMaxed) {
        if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = 'Maxed';
        if (q('.modal-total-bonus')) q('.modal-total-bonus').textContent = this.getBonusText(stat, config, baseLevel);
        if (q('.modal-total-cost')) q('.modal-total-cost').textContent = 0;
        if (q('.modal-qty')) q('.modal-qty').textContent = 0;
      } else {
        const bonusValue = (config.bonus || 0) * qty;
        if (q('.modal-qty')) q('.modal-qty').textContent = qty;
        if (q('.modal-total-cost')) q('.modal-total-cost').textContent = totalCost;
        if (q('.modal-total-bonus')) {
          const bonusLabel = config.bonusLabel ? t(config.bonusLabel) : t(config.label);
          q('.modal-total-bonus').textContent = `+${bonusValue} ${bonusLabel}`;
        }
        if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);
        const input = q('.modal-qty-input');
        if (input && this.selectedQty !== 'max') input.value = this.selectedQty;
      }

      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = isMaxed || qty <= 0 || totalCost > crystalsAvailable;
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
    // If bonus is a translation key (string), return translated bonus text.
    if (typeof config.bonus === 'string') return t(config.bonus);
    const baseBonus = typeof config.bonus === 'number' ? config.bonus : 0;
    const bonus = baseBonus * level;
    const label = config.bonusLabel ? t(config.bonusLabel) : t(config.label);
    return `+${bonus} ${label}`;
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
    const prevLevel = level;
    let count = 0,
      totalCost = 0;
    const nextCost = (lvl) => Math.floor(baseCost + costIncrement * lvl);

    if (qty === 'max') {
      while (hero.crystals >= nextCost(level) && count < CRYSTAL_SHOP_MAX_QTY) {
        const cost = nextCost(level++);
        hero.crystals -= cost;
        totalCost += cost;
        count++;
      }
    } else {
      qty = Math.min(qty, CRYSTAL_SHOP_MAX_QTY);
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

    // If player hasn't customized related options yet, set them to newly unlocked max
    try {
      if (stat === 'stageSkip') {
        const oldMax = prevLevel;
        const newMax = this.crystalUpgrades.stageSkip || 0;
        if (options.stageSkip == null || options.stageSkip === 0 || options.stageSkip === oldMax) {
          options.stageSkip = newMax;
        }
        options.updateStageSkipOption?.();
      }
      if (stat === 'startingStage') {
        const oldMax = 1 + prevLevel;
        const newMax = 1 + (this.crystalUpgrades.startingStage || 0);
        if (options.startingStage == null || options.startingStage === 0 || options.startingStage === oldMax) {
          options.startingStage = newMax;
        }
        options.updateStartingStageOption?.();
      }
    } catch (e) {
      // Non-fatal: keep purchase flow even if UI update fails
      console.warn('Failed to sync options after crystal purchase:', e);
    }
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
      skillTree.enableAutoCastForAllSkills();
      initializeSkillTreeUI();
    }

    if (stat === 'salvageMaterials' && options.salvageMaterialsEnabled) {
      inventory.setSalvageUpgradeMaterials(true);
    }

    if (stat === 'resetStageSkip') {
      options.updateResetStageSkipOption();
    }

    if (stat === 'autoSortInventory') {
      options.updateAutoSortInventoryOption();
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
    if (qty !== 'max') qty = Math.min(qty, CRYSTAL_SHOP_MAX_QTY);

    // special resets use confirm dialog
    if (['resetSkillTree', 'resetAttributes', 'resetArenaLevel', 'resetTraining'].includes(stat)) {
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
      }
      if (config.maxLevel) {
        const current = this.crystalUpgrades[stat] || 0;
        const cap = config.maxLevel;
        if (current >= cap) {
          showToast(`${config.label} is maxed out.`, 'error');
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
