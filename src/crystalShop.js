import { dataManager,
  hero,
  options,
  skillTree,
  statistics,
  inventory,
  game,
  training,
  soulShop,
  ascension } from './globals.js';
import { updateResources,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
  showToast,
  updateStageUI,
  formatNumber,
  updatePlayerLife } from './ui/ui.js';
import { t, tp } from './i18n.js';
import { updateAscensionUI } from './ui/ascensionUi.js';
import { initializeInventoryUI } from './ui/inventoryUi.js';
import { selectBoss } from './ui/bossUi.js';
import { handleSavedData } from './functions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { createModal } from './ui/modal.js';
import { CRYSTAL_SHOP_MAX_QTY } from './constants/limits.js';
import { SOUL_UPGRADE_CONFIG } from './soulShop.js';
import { runes } from './globals.js';
import { BASE_RUNE_SLOTS } from './runes.js';
import { calcLinearSum, solveLinear } from './utils/bulkMath.js';

const html = String.raw;

const AUTO_SALVAGE_MAX_LEVEL = 8;

const CRYSTAL_UPGRADE_CONFIG = {
  autoSalvage: {
    label: 'crystalShop.upgrade.autoSalvage.label',
    bonus: 'crystalShop.upgrade.autoSalvage.bonus',
    bonusLabel: 'crystalShop.upgrade.autoSalvage.bonusLabel',
    baseCost: 20,
    costIncrement: 10,
    showLevel: true,
    multiple: true,
    maxLevel: AUTO_SALVAGE_MAX_LEVEL,
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
  stageLock: {
    label: 'crystalShop.upgrade.stageLock.label',
    bonus: 'crystalShop.upgrade.stageLock.bonus',
    bonusLabel: 'crystalShop.upgrade.stageLock.bonusLabel',
    baseCost: 240,
    oneTime: true,
    category: 'stage',
  },
  resetStageSkip: {
    label: 'crystalShop.upgrade.resetStageSkip.label',
    bonus: 'crystalShop.upgrade.resetStageSkip.bonus',
    bonusLabel: 'crystalShop.upgrade.resetStageSkip.bonusLabel',
    baseCost: 480,
    oneTime: true,
    category: 'stage',
  },
  deathTimerReduction: {
    label: 'crystalShop.upgrade.deathTimerReduction.label',
    bonus: 0.5,
    bonusLabel: 'crystalShop.upgrade.deathTimerReduction.bonusLabel',
    showLevel: true,
    baseCost: 50,
    costIncrement: 50,
    multiple: true,
    maxLevel: 56,
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
  resetSkillTree: {
    label: 'crystalShop.upgrade.resetSkillTree.label',
    bonus: 'crystalShop.upgrade.resetSkillTree.bonus',
    bonusLabel: 'crystalShop.upgrade.resetSkillTree.bonusLabel',
    baseCost: 20,
    multiple: true,
    category: 'reset',
  },
  resetSpecialization: {
    label: 'crystalShop.upgrade.resetSpecialization.label',
    bonus: 'crystalShop.upgrade.resetSpecialization.bonus',
    bonusLabel: 'crystalShop.upgrade.resetSpecialization.bonusLabel',
    baseCost: 50,
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
  resetSoulShop: {
    label: 'crystalShop.upgrade.resetSoulShop.label',
    bonus: 'crystalShop.upgrade.resetSoulShop.bonus',
    bonusLabel: 'crystalShop.upgrade.resetSoulShop.bonusLabel',
    baseCost: 300,
    multiple: true,
    category: 'reset',
  },
  resetAscension: {
    label: 'crystalShop.upgrade.resetAscension.label',
    bonus: 'crystalShop.upgrade.resetAscension.bonus',
    bonusLabel: 'crystalShop.upgrade.resetAscension.bonusLabel',
    baseCost: 100000,
    multiple: true,
    category: 'reset',
  },
};

export default class CrystalShop {
  constructor(savedData = null) {
    this.crystalUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = options?.useNumericInputs ? Math.min(options?.crystalShopQty || 1, CRYSTAL_SHOP_MAX_QTY) : 1;
  }

  getCrystalReductionNumerator() {
    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const numerator = Math.round((1 - ascRed) * 100);
    return Math.max(0, Math.min(100, numerator));
  }

  calculateTotalCost(config, qty, baseLevel) {
    if (!qty || qty <= 0) return 0;

    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const multiplier = 1 - ascRed;
    const SCALE = 10000;

    const baseScaled = Math.round(config.baseCost * multiplier * SCALE);
    const incScaled = Math.round((config.costIncrement || 0) * multiplier * SCALE);

    return calcLinearSum(baseLevel, qty, baseScaled, incScaled, SCALE);
  }

  _getAffordablePurchase(config, baseLevel, crystals, desiredQty) {
    if (!desiredQty || desiredQty <= 0) return { qty: 0, totalCost: 0 };
    const maxQty = Math.max(0, Math.min(desiredQty, CRYSTAL_SHOP_MAX_QTY));

    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const multiplier = 1 - ascRed;
    const SCALE = 10000;

    const baseScaled = Math.round(config.baseCost * multiplier * SCALE);
    const incScaled = Math.round((config.costIncrement || 0) * multiplier * SCALE);

    const bestQty = solveLinear(baseLevel, crystals, baseScaled, incScaled, SCALE);
    const finalQty = Math.min(bestQty, Math.floor(maxQty));
    const totalCost = this.calculateTotalCost(config, finalQty, baseLevel);

    return { qty: finalQty, totalCost };
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
      const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
      const cost = Math.round(Math.floor(config.baseCost + (config.costIncrement || 0) * level) * (1 - ascRed));
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
            : `${formatNumber(cost)} ${t('resource.crystal.name')}`;
        costEl.classList.toggle('unaffordable', unaffordable);
      }
      if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
      button.disabled = alreadyPurchased || isMaxed;
    });
  }

  createCrystalUpgradeButton(stat, config) {
    let alreadyPurchased = config.oneTime && this.crystalUpgrades[stat];
    const level = this.crystalUpgrades[stat] || 0;
    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const cost = Math.round(Math.floor(config.baseCost + (config.costIncrement || 0) * level) * (1 - ascRed));
    let isMaxed = false;
    if (config.maxLevel) {
      isMaxed = level >= config.maxLevel;
    }
    const label = t(config.label);
    const bonusLabel = t(config.bonusLabel);
    const levelText = config.showLevel
      ? `(${t('common.lvl')} ${formatNumber(level)}${isMaxed ? ' / ' + t('common.max') : ''})`
      : '';
    const bonusText = `${bonusLabel}${isMaxed ? ' <strong>' + t('common.max') + '</strong>' : ''}`;
    const costText = alreadyPurchased
      ? t('common.purchased')
      : isMaxed
        ? t('common.max')
        : `${formatNumber(cost)} ${t('resource.crystal.name')}`;
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
        <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
        <h2 class="modal-title"></h2>
        <div class="modal-fields"></div>
        <div class="modal-controls" style="display:none;"></div>
        <button class="modal-buy">${t('crystalShop.modal.buy')}</button>
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
    let cost = CRYSTAL_UPGRADE_CONFIG[stat].baseCost;
    {
      const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
      cost = Math.round(cost * (1 - ascRed));
    }
    if (hero.crystals < cost) {
      showToast(tp('crystalShop.needCrystals', { count: cost }), 'error');
      return;
    }
    let confirmed;
    if (stat === 'resetSkillTree') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetClass', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      skillTree.resetSkillTree();
      updateSkillTreeValues();
      updateActionBar();
      initializeSkillTreeUI();
      showToast(t('crystalShop.resetClassSuccess'), 'success');
    } else if (stat === 'resetSpecialization') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetSpecialization', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      skillTree.resetSpecialization();
      // resetSpecialization in skillTree already updates values/actionbar/saves
      // but we might want to refresh UI structure if needed
      initializeSkillTreeUI();
      showToast(t('crystalShop.resetSpecializationSuccess'), 'success');
    } else if (stat === 'resetAttributes') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetAttributes', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.resetAttributes();
      updateStatsAndAttributesUI();
      showToast(t('crystalShop.resetAttributesSuccess'), 'success');
    } else if (stat === 'resetArenaLevel') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetBossLevel', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.bossLevel = 1;
      if (game.fightMode === 'arena') {
        selectBoss();
      }
      updateStageUI();
      showToast(t('crystalShop.resetBossLevelSuccess'), 'success');
    } else if (stat === 'resetTraining') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetTraining', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      const refund = training.goldSpent || 0;
      const prevQty = training.quickQty;
      training.reset();
      training.quickQty = prevQty;
      hero.gold += refund;
      training.updateTrainingUI('gold-upgrades');
      hero.queueRecalculateFromAttributes();
      updateStatsAndAttributesUI();
      showToast(tp('crystalShop.resetTrainingSuccess', { amount: formatNumber(refund) }), 'success');
    } else if (stat === 'resetSoulShop') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetSoulShop', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      const refund = Object.entries(soulShop.soulUpgrades || {}).reduce((total, [key, value]) => {
        const config = SOUL_UPGRADE_CONFIG[key];
        if (!config) return total;
        if (config.oneTime) return total + Math.round(config.baseCost);
        if (config.multiple) return total + Math.round(config.baseCost) * (value || 0);
        let c = 0;
        for (let i = 0; i < (value || 0); i++) {
          c += soulShop.getSoulUpgradeCost(config, i);
        }
        return total + c;
      }, 0);
      const prevSelectedQty = soulShop.selectedQty;
      const prevQuickQty = soulShop.quickQty;
      soulShop.resetSoulShop();
      soulShop.selectedQty = prevSelectedQty;
      soulShop.quickQty = prevQuickQty;
      hero.souls += refund;
      soulShop.updateSoulShopUI();
      hero.queueRecalculateFromAttributes();
      updateStatsAndAttributesUI();
      updatePlayerLife();
      showToast(tp('crystalShop.resetSoulShopSuccess', { amount: formatNumber(refund) }), 'success');
    } else if (stat === 'resetAscension') {
      confirmed = await showConfirmDialog(tp('crystalShop.confirm.resetAscension', { count: cost }));
      if (!confirmed) return;
      hero.crystals -= cost;
      // Calculate total points spent so far and refund them
      const refundPts = Object.entries(ascension.upgrades || {}).reduce((total, [key, lvl]) => {
        const cfg = ascension.config[key];
        if (!cfg || !lvl) return total;
        let spent = 0;
        for (let i = 0; i < lvl; i++) {
          const c = typeof cfg.cost === 'function' ? cfg.cost(i) : cfg.cost || 1;
          spent += c;
        }
        return total + spent;
      }, 0);
      ascension.upgrades = {};
      ascension.points = (ascension.points || 0) + refundPts;
      // Ensure rune slots reflect current ascension bonuses
      try {
        const ascRuneSlots = ascension.getBonuses()?.runeSlots || 0;
        runes?.ensureEquipSlots?.(BASE_RUNE_SLOTS + ascRuneSlots);
      } catch {}
      hero.queueRecalculateFromAttributes();
      updateStatsAndAttributesUI();
      updatePlayerLife();
      updateAscensionUI?.();
      showToast(tp('crystalShop.resetAscensionSuccess', { amount: formatNumber(refundPts) }), 'success');
    }
    updateResources();
    dataManager.saveGame();
    this.initializeCrystalShopUI();
  }

  /**
   * Opens the upgrade modal or, for reset buttons, shows confirmation dialogs.
   */
  async openUpgradeModal(stat) {
    if (
      [
        'resetSkillTree',
        'resetSpecialization',
        'resetAttributes',
        'resetArenaLevel',
        'resetTraining',
        'resetSoulShop',
        'resetAscension',
      ].includes(stat)
    ) {
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
    this.selectedQty = options.useNumericInputs ? Math.min(options.crystalShopQty || 1, CRYSTAL_SHOP_MAX_QTY) : 1;

    if (config.bulkModal) {
      const maxLevelText = config.maxLevel ? ' / <span class="modal-max-level"></span>' : '';
      fields.innerHTML = `
        <p>${t('ascension.upgrade.currentLevel')}: <span class="modal-level"></span>${maxLevelText}</p>
        <p>${t('ascension.upgrade.currentBonus')}: <span class="modal-bonus"></span></p>
        <p>${t('ascension.upgrade.nextLevelBonus')}: <span class="modal-next-bonus"></span></p>
        <p>${t('crystalShop.modal.totalBonus')}: <span class="modal-total-bonus"></span></p>
        <p>${t('ascension.upgrade.totalCost')}: <span class="modal-total-cost"></span> ${t('resource.crystal.name')} (<span class="modal-qty">1</span>)</p>
      `;
      controls.style.display = '';
      if (options.useNumericInputs) {
        controls.innerHTML = `
        <input type="number" class="modal-qty-input input-number" min="1" max="${CRYSTAL_SHOP_MAX_QTY}" value="${this.selectedQty}" />
        <button data-qty="max">${t('common.max')}</button>
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
          <button data-qty="max">${t('common.max')}</button>
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
      const oneTimeBonusText = typeof config.bonus === 'string' ? t(config.bonus) : config.bonus || '';
      const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
      const reduced = Math.round(config.baseCost * (1 - ascRed));
      fields.innerHTML = `
        <p>${oneTimeBonusText}</p>
        <p>${t('ascension.upgrade.cost')}: <span class="modal-total-cost">${reduced}</span> ${t('resource.crystal.name')}</p>
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
        const cap = config.maxLevel ?? AUTO_SALVAGE_MAX_LEVEL;
        const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
        const nextCost = Math.round((config.baseCost + (config.costIncrement || 0) * level) * (1 - ascRed));
        const isMaxed = level >= cap;
        const autoSalvageBonus = typeof config.bonus === 'string' ? t(config.bonus) : config.bonus || '';
        fields.innerHTML = `
          <p>${autoSalvageBonus}</p>
          <p>${t('ascension.upgrade.currentLevel')}: <span class="modal-level">${level}</span> / <span class="modal-max-level">${cap}</span></p>
          ${isMaxed ? '<p style="color:#10b981;font-weight:bold;">' + t('common.max') + '</p>' : `<p>${t('crystalShop.modal.nextLevelCost')}: <span class="modal-total-cost">${nextCost}</span> ${t('resource.crystal.name')}</p>`}
        `;
        buyBtn.disabled = isMaxed;
        buyBtn.style.display = isMaxed ? 'none' : '';
      } else {
        const multipleBonus = typeof config.bonus === 'string' ? t(config.bonus) : config.bonus || '';
        const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
        const reduced = Math.round(config.baseCost * (1 - ascRed));
        fields.innerHTML = `
            <p>${multipleBonus}</p>
            <p>${t('ascension.upgrade.cost')}: <span class="modal-total-cost">${reduced}</span> ${t('resource.crystal.name')}</p>
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
      const limit = Math.min(levelsLeft, CRYSTAL_SHOP_MAX_QTY);
      let qty;
      let totalCost;

      if (this.selectedQty === 'max') {
        const purchase = this._getAffordablePurchase(config, baseLevel, crystalsAvailable, limit);
        qty = purchase.qty;
        totalCost = purchase.totalCost;
      } else {
        qty = Math.min(this.selectedQty, levelsLeft, CRYSTAL_SHOP_MAX_QTY);
        totalCost = this.calculateTotalCost(config, qty, baseLevel);
      }

      const isMaxed = levelsLeft === 0;
      if (q('.modal-max-level')) q('.modal-max-level').textContent = cap;
      if (q('.modal-level')) q('.modal-level').textContent = baseLevel;
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);

      if (isMaxed) {
        if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = t('common.max');
        if (q('.modal-total-bonus')) q('.modal-total-bonus').textContent = this.getBonusText(stat, config, baseLevel);
        if (q('.modal-total-cost')) q('.modal-total-cost').textContent = 0;
        if (q('.modal-qty')) q('.modal-qty').textContent = 0;
      } else {
        const bonusValue = (config.bonus || 0) * qty;
        if (q('.modal-qty')) q('.modal-qty').textContent = formatNumber(qty);
        if (q('.modal-total-cost')) q('.modal-total-cost').textContent = formatNumber(totalCost);
        if (q('.modal-total-bonus')) {
          const bonusLabel = config.bonusLabel ? t(config.bonusLabel) : t(config.label);
          q('.modal-total-bonus').textContent = `+${formatNumber(bonusValue)} ${bonusLabel}`;
        }
        if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);
        const input = q('.modal-qty-input');
        if (input && this.selectedQty !== 'max') input.value = this.selectedQty;
      }

      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = isMaxed || qty <= 0 || totalCost > crystalsAvailable;
    } else if (stat === 'autoSalvage') {
      const level = this.crystalUpgrades[stat] || 0;
      const cap = config.maxLevel ?? AUTO_SALVAGE_MAX_LEVEL;
      const ascRedLocal = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
      const nextCostVal = Math.round(
        Math.floor(config.baseCost + (config.costIncrement || 0) * level) * (1 - ascRedLocal),
      );
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = nextCostVal;
      const isMaxed = level >= cap;
      if (q('.modal-level')) q('.modal-level').textContent = level;
      if (q('.modal-max-level')) q('.modal-max-level').textContent = cap;
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = nextCostVal;
      const buyBtn = q('.modal-buy');
      if (buyBtn) {
        buyBtn.disabled = isMaxed || hero.crystals < nextCostVal;
        buyBtn.style.display = isMaxed ? 'none' : '';
      }
      // Hide cost if maxed
      const costP = q('.modal-total-cost')?.closest('p');
      if (costP) costP.style.display = isMaxed ? 'none' : '';
    } else if (config.multiple) {
      // For other multiples, show floored cost
      const ascRedLocal = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
      const costVal = Math.round(
        Math.floor(config.baseCost + (config.costIncrement || 0) * (this.crystalUpgrades[stat] || 0)) *
          (1 - ascRedLocal),
      );
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = costVal;
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
    const { label } = config;
    const baseLevel = this.crystalUpgrades[stat] || 0;
    const prevLevel = baseLevel;
    const cap = config.maxLevel ?? Infinity;
    const levelsLeft = Math.max(0, cap - baseLevel);
    const desiredQty =
      qty === 'max' ? Math.min(levelsLeft, CRYSTAL_SHOP_MAX_QTY) : Math.min(qty, levelsLeft, CRYSTAL_SHOP_MAX_QTY);
    const { qty: count, totalCost } = this._getAffordablePurchase(config, baseLevel, hero.crystals, desiredQty);

    if (count > 0) {
      hero.crystals -= totalCost;
      this.crystalUpgrades[stat] = baseLevel + count;
    }
    const level = this.crystalUpgrades[stat] || 0;

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
    if (stat === 'autoSalvage') {
      initializeInventoryUI(inventory);
    }
    this._commitChanges(false);
    this.updateModalDetails();
    showToast(tp('crystalShop.upgraded', { label, count }), count > 0 ? 'success' : 'error');
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
    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const cost = Math.round(baseCost * (1 - ascRed));
    if (hero.crystals < cost) {
      showToast(t('crystalShop.notEnoughCrystals'), 'error');
      return;
    }

    hero.crystals -= cost;
    this.crystalUpgrades[stat] = true;
    this._commitChanges();
    showToast(tp('crystalShop.purchased', { label }), 'success');



    if (stat === 'salvageMaterials') {
      if (options.salvageMaterialsEnabled) {
        inventory.setSalvageUpgradeMaterials(true);
      }
      initializeInventoryUI(inventory);
    }

    if (stat === 'resetStageSkip') {
      options.updateResetStageSkipOption();
    }

    if (stat === 'autoSortInventory') {
      options.updateAutoSortInventoryOption();
    }

    if (stat === 'stageLock') {
      options.updateStageLockOption();
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
    const ascRed = ascension?.getBonuses?.()?.crystalShopCostReduction || 0;
    const cost = Math.round(baseCost * (1 - ascRed));
    if (hero.crystals < cost) {
      showToast(t('crystalShop.notEnoughCrystals'), 'error');
      return;
    }

    hero.crystals -= cost;
    this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
    this._commitChanges();
    showToast(tp('crystalShop.purchased', { label }), 'success');
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
      showToast(t('crystalShop.updateError'), 'error');
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
    if (
      [
        'resetSkillTree',
        'resetSpecialization',
        'resetAttributes',
        'resetArenaLevel',
        'resetTraining',
        'resetSoulShop',
        'resetAscension',
      ].includes(stat)
    ) {
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
}
