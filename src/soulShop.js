import { dataManager, hero, options } from './globals.js';
import { updateResources, showToast, updatePlayerLife } from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { closeModal, createModal } from './ui/modal.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { t } from './i18n.js';

const html = String.raw;

export const SOUL_UPGRADE_CONFIG = {
  // One-time purchase
  extraLife: {
    label: 'soulShop.upgrade.extraLife.label',
    bonus: 'soulShop.upgrade.extraLife.bonus',
    baseCost: 1000,
    oneTime: true,
  },
  bonusGold: {
    label: 'soulShop.upgrade.bonusGold.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusGoldPercent',
  },
  bonusExperience: {
    label: 'soulShop.upgrade.bonusExperience.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusExperiencePercent',
  },
  damageBoost: {
    label: 'soulShop.upgrade.damageBoost.label',
    bonus: 0.005,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'totalDamagePercent',
  },
  attackRatingBoost: {
    label: 'soulShop.upgrade.attackRatingBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'attackRatingPercent',
  },
  lifeBoost: {
    label: 'soulShop.upgrade.lifeBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'lifePercent',
  },
  manaBoost: {
    label: 'soulShop.upgrade.manaBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.15,
    stat: 'manaPercent',
  },
  armorBoost: {
    label: 'soulShop.upgrade.armorBoost.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.25,
    stat: 'armorPercent',
  },
  evasionBoost: {
    label: 'soulShop.upgrade.evasionBoost.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.25,
    stat: 'evasionPercent',
  },
  lifeRegenBoost: {
    label: 'soulShop.upgrade.lifeRegenBoost.label',
    bonus: 0.05,
    baseCost: 4,
    costIncrement: 0.3,
    stat: 'lifeRegenPercent',
  },
  allResistanceBoost: {
    label: 'soulShop.upgrade.allResistanceBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.3,
    stat: 'allResistancePercent',
  },
  /**
   * Extra Material Drop Chance
   * Each level increases the chance to gain an additional material drop.
  */
  extraMaterialDropPercent: {
    label: 'soulShop.upgrade.extraMaterialDropPercent.label',
    bonus: 0.01, // 1% per level
    baseCost: 50,
    costIncrement: 50,
    stat: 'extraMaterialDropPercent',
    maxLevel: 10, // Added maximum level
  },
  /**
   * Extra Material Drop Max
   * Each level increases the maximum number of extra material drops per kill.
  */
  extraMaterialDropMax: {
    label: 'soulShop.upgrade.extraMaterialDropMax.label',
    bonus: 1, // +1 max per level
    baseCost: 300,
    costIncrement: 200,
    stat: 'extraMaterialDropMax',
    maxLevel: 100, // Added maximum level
  },
};

export default class SoulShop {
  constructor(savedData = null) {
    this.soulUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = options.useNumericInputs ? Math.min(options.soulShopQty || 1, 10000) : 1;
    this.quickQty = options.useNumericInputs ? Math.min(options.soulShopQuickQty || 1, 10000) : 1;
  }

  /**
   * Returns the integer cost for a soul shop upgrade at a given level.
   * @param {object} config - The upgrade config object
   * @param {number} level - The current level (0-based)
   * @returns {number} Integer cost
   */
  getSoulUpgradeCost(config, level = 0) {
    return Math.round(config.baseCost + (config.costIncrement || 0) * level);
  }

  async initializeSoulShopUI() {
    const soulShopTab = document.querySelector('#soulShop');
    if (!soulShopTab) return;
    // Create .soulShop-container and .soulShop-upgrades-container if not present
    let shopContainer = soulShopTab.querySelector('.soulShop-container');
    if (!shopContainer) {
      shopContainer = document.createElement('div');
      shopContainer.className = 'soulShop-container';
      soulShopTab.innerHTML = '';
      soulShopTab.appendChild(shopContainer);
    }
    let upgradesContainer = shopContainer.querySelector('.soulShop-upgrades-container');
    if (!upgradesContainer) {
      upgradesContainer = document.createElement('div');
      upgradesContainer.className = 'soulShop-upgrades-container';
      shopContainer.appendChild(upgradesContainer);
    }
    let qtyControls = shopContainer.querySelector('.soulShop-qty-controls');
    if (qtyControls) qtyControls.remove();
    if (options?.quickSoulShop) {
      qtyControls = document.createElement('div');
      qtyControls.className = 'soulShop-qty-controls';
      if (options.useNumericInputs) {
        qtyControls.innerHTML = `
          <input type="number" class="soul-qty-input input-number" min="1" max="10000" value="${this.quickQty === 'max' ? options.soulShopQuickQty || 1 : this.quickQty}" />
          <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">Max</button>
        `;
        shopContainer.insertBefore(qtyControls, upgradesContainer);
        const input = qtyControls.querySelector('.soul-qty-input');
        const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
        input.oninput = () => {
          let val = parseInt(input.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > 10000) val = 10000;
          this.quickQty = val;
          options.soulShopQuickQty = val;
          maxBtn.classList.remove('active');
          this.updateSoulShopUI();
          dataManager.saveGame();
        };
        maxBtn.onclick = () => {
          this.quickQty = 'max';
          maxBtn.classList.add('active');
          this.updateSoulShopUI();
          dataManager.saveGame();
        };
      } else {
        qtyControls.innerHTML = `
          <button data-qty="1" class="${this.quickQty === 1 ? 'active' : ''}">1</button>
          <button data-qty="10" class="${this.quickQty === 10 ? 'active' : ''}">10</button>
          <button data-qty="50" class="${this.quickQty === 50 ? 'active' : ''}">50</button>
          <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">Max</button>
        `;
        shopContainer.insertBefore(qtyControls, upgradesContainer);
        qtyControls.querySelectorAll('button').forEach((btn) => {
          btn.onclick = () => {
            this.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
            qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            this.updateSoulShopUI();
          };
        });
      }
    }
    this.updateSoulShopUI();
  }

  updateSoulShopUI() {
    // Ensure the modal is created before updating the UI
    if (!this.modal) this.createUpgradeModal();

    const soulShopTab = document.querySelector('#soulShop');
    if (!soulShopTab) return;
    const shopContainer = soulShopTab.querySelector('.soulShop-container');
    if (!shopContainer) return;
    let upgradesContainer = shopContainer.querySelector('.soulShop-upgrades-container');
    if (!upgradesContainer) return;
    upgradesContainer.innerHTML = `
      <div class="soul-upgrades-grid">
        ${Object.entries(SOUL_UPGRADE_CONFIG)
    .map(([stat, config]) => this.createSoulUpgradeButton(stat, config))
    .join('')}
      </div>
    `;
    this.setupSoulUpgradeHandlers();
  }

  updateSoulShopAffordability() {
    const grid = document.querySelector('#soulShop .soul-upgrades-grid');
    if (!grid) return;
    const BASE = import.meta.env.VITE_BASE_PATH;
    grid.querySelectorAll('.soul-upgrade-btn').forEach((button) => {
      const stat = button.dataset.stat;
      const config = SOUL_UPGRADE_CONFIG[stat];
      if (!config) return;
      const isOneTime = config.oneTime;
      const isMultiple = config.multiple;
      const isMultiLevel = typeof config.bonus === 'number' && !isOneTime;
      const alreadyPurchased = isOneTime && this.soulUpgrades[stat];
      const baseLevel = this.soulUpgrades[stat] || 0;
      const maxLevel = isMultiLevel ? config.maxLevel || Infinity : Infinity;
      const levelsLeft = maxLevel - baseLevel;
      let qty = 1;
      let cost = isOneTime || isMultiple
        ? Math.round(config.baseCost)
        : this.getSoulUpgradeCost(config, baseLevel);
      let disabled = alreadyPurchased;
      let unaffordable = false;
      if (options?.quickSoulShop && !alreadyPurchased) {
        if (isMultiLevel || isMultiple) {
          if (this.quickQty === 'max') {
            const { qty: affordableQty, totalCost } = this.getBulkCost(stat, 'max');
            qty = affordableQty > 0 ? Math.min(affordableQty, 10000) : Math.min(1, levelsLeft);
            cost = affordableQty > 0
              ? totalCost
              : isMultiple
                ? Math.round(config.baseCost) * qty
                : this.calculateTotalCost(stat, qty, baseLevel);
            if (affordableQty <= 0 || hero.souls < cost) {
              disabled = true;
              unaffordable = true;
            }
          } else {
            qty = Math.min(this.quickQty, isMultiLevel ? levelsLeft : 10000, 10000);
            cost = isMultiple
              ? Math.round(config.baseCost) * qty
              : this.calculateTotalCost(stat, qty, baseLevel);
            if (qty <= 0 || hero.souls < cost) {
              disabled = true;
              unaffordable = true;
            }
          }
        } else if (hero.souls < cost) {
          disabled = true;
          unaffordable = true;
        }
      } else if (hero.souls < cost && !alreadyPurchased) {
        unaffordable = true;
      }
      button.disabled = disabled;
      const costEl = button.querySelector('.upgrade-cost');
      const bonusEl = button.querySelector('.upgrade-bonus');
      if (costEl) {
        costEl.innerHTML = alreadyPurchased
          ? t('common.purchased')
          : `${cost} ${t('resource.souls.name')}<img style="width: 20px; height: 20px;" src="${BASE}/icons/soul.svg" alt="Soul Icon">(${qty})`;
        costEl.classList.toggle('unaffordable', unaffordable);
      }
      if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
    });
  }

  resetSoulShop() {
    this.soulUpgrades = {};
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = Math.min(options.soulShopQty || 1, 10000);
    this.quickQty = Math.min(options.soulShopQuickQty || 1, 10000);
    this.updateSoulShopUI();
  }

  createSoulUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    const isPercent = config.stat?.endsWith('Percent');
    let alreadyPurchased = isOneTime && this.soulUpgrades[stat];
    const level = isOneTime || isMultiple ? undefined : this.soulUpgrades[stat] || 0;
    const label = t(config.label);
    let bonus;
    if (isOneTime || isMultiple) {
      bonus = typeof config.bonus === 'string' ? t(config.bonus) : config.bonus;
    } else if (isMultiLevel) {
      const value = Math.floor(config.bonus * (this.soulUpgrades[stat] || 0) * (isPercent ? 100 : 1));
      bonus = `+${value}${config.suffix || ''} ${label}`;
    } else {
      bonus = `+${config.bonus * (this.soulUpgrades[stat] || 0)} ${label}`;
    }
    let cost =
      isOneTime || isMultiple
        ? Math.round(config.baseCost)
        : this.getSoulUpgradeCost(config, this.soulUpgrades[stat] || 0);
    let bonusClass = '';
    let disabled = alreadyPurchased;
    let qty = 1;
    if (options?.quickSoulShop && !alreadyPurchased) {
      const baseLevel = this.soulUpgrades[stat] || 0;
      const levelsLeft = isMultiLevel ? (config.maxLevel || Infinity) - baseLevel : Infinity;
      if (this.quickQty === 'max') {
        const { qty: affordableQty, totalCost } = this.getBulkCost(stat, 'max');
        qty = affordableQty > 0 ? Math.min(affordableQty, 10000) : Math.min(1, levelsLeft);
        cost = affordableQty > 0 ? totalCost : this.calculateTotalCost(stat, qty, baseLevel);
        if (affordableQty <= 0 || hero.souls < cost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      } else {
        qty = Math.min(this.quickQty, levelsLeft, 10000);
        cost = this.calculateTotalCost(stat, qty, baseLevel);
        if (qty <= 0 || hero.souls < cost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      }
    } else if (hero.souls < cost && !alreadyPurchased) {
      bonusClass = 'unaffordable';
    }

    const BASE = import.meta.env.VITE_BASE_PATH;

    return `
      <button class="soul-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}" ${disabled ? 'disabled' : ''}>
        <span class="upgrade-name">${label} ${isOneTime ? '' : isMultiple ? '' : `(${t('common.lvl')} ${level})`}</span>
        <span class="upgrade-bonus ${bonusClass}">${bonus}</span>
        <span class="upgrade-cost ${bonusClass}">${alreadyPurchased ? t('common.purchased') : `${cost} ${t('resource.souls.name')}`}<img style="width: 20px; height: 20px;" src="${BASE}/icons/soul.svg" alt="Soul Icon">(${qty})</span>
      </button>
    `;
  }

  getBulkCost(stat, desiredQty) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return { qty: 0, totalCost: 0 };
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    const baseLevel = this.soulUpgrades[stat] || 0;
    const soulsAvailable = hero.souls;
    if (isMultiLevel) {
      const maxLevel = config.maxLevel || Infinity;
      let maxQty = 0;
      let soulsTemp = soulsAvailable;
      for (let lvl = baseLevel; lvl < maxLevel; lvl++) {
        const c = this.getSoulUpgradeCost(config, lvl);
        if (soulsTemp < c) break;
        soulsTemp -= c;
        maxQty++;
      }
      const qty = desiredQty === 'max' ? Math.min(maxQty, 10000) : Math.min(desiredQty, maxQty, 10000);
      let totalCost = 0;
      for (let i = 0; i < qty; i++) {
        totalCost += this.getSoulUpgradeCost(config, baseLevel + i);
      }
      return { qty, totalCost };
    }
    if (config.multiple) {
      const unitCost = Math.round(config.baseCost);
      const maxQty = Math.floor(soulsAvailable / unitCost);
      const qty = desiredQty === 'max' ? Math.min(maxQty, 10000) : Math.min(desiredQty, maxQty, 10000);
      return { qty, totalCost: qty * unitCost };
    }
    return { qty: 1, totalCost: Math.round(config.baseCost) };
  }

  calculateTotalCost(stat, qty, baseLevel = this.soulUpgrades[stat] || 0) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return 0;
    if (config.oneTime || config.multiple) {
      return Math.round(config.baseCost) * qty;
    }
    let total = 0;
    for (let i = 0; i < qty; i++) {
      total += this.getSoulUpgradeCost(config, baseLevel + i);
    }
    return total;
  }

  setupSoulUpgradeHandlers() {
    const buttons = document.querySelectorAll('.soul-upgrade-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const stat = button.dataset.stat;
        if (options?.quickSoulShop) {
          this.buyBulk(stat, this.quickQty);
        } else {
          this.openUpgradeModal(stat);
        }
      });
    });
  }

  createUpgradeModal() {
    const content = html`
      <div class="soulShop-modal-content">
        <button class="modal-close" aria-label="Close">&times;</button>
        <h2 class="modal-title"></h2>
        <div class="modal-fields"></div>
        <div class="modal-controls" style="display:none;"></div>
        <input type="range" class="modal-slider" min="0" max="1" value="1" step="1" style="display:none;" />
        <button class="modal-buy">Buy</button>
      </div>
    `;
    this.modal = createModal({
      id: 'soulShop-modal',
      className: 'soulShop-modal hidden',
      content,
      onClose: () => closeModal('#soulShop-modal'),
    });
    this.modal.querySelector('.modal-close').onclick = () => closeModal('#soulShop-modal');
    this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
    const slider = this.modal.querySelector('.modal-slider');
    slider.addEventListener('input', (e) => {
      this.selectedQty = Math.min(parseInt(e.target.value, 10) || 0, 10000);
      e.target.value = this.selectedQty;
      const input = this.modal.querySelector('.modal-qty-input');
      if (input) {
        input.value = this.selectedQty;
        options.soulShopQty = this.selectedQty;
        dataManager.saveGame();
      }
      this.updateModalDetails();
    });
  }

  openUpgradeModal(stat) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = t(config.label);
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    const slider = m.querySelector('.modal-slider');
    this.selectedQty = options.useNumericInputs ? Math.min(options.soulShopQty || 1, 10000) : 1;
    // Multi-level (increasing cost): any with numeric bonus and not oneTime
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      fields.innerHTML = `
        <p>Current Level: <span class="modal-level"></span></p>
        <p>Current Bonus: <span class="modal-bonus"></span></p>
        <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
        <p>Total Bonus: <span class="modal-total-bonus"></span></p>
        <p>Total Cost: <span class="modal-total-cost"></span> Souls (<span class="modal-qty">1</span>)</p>
      `;
      controls.style.display = '';
      if (options.useNumericInputs) {
        controls.innerHTML = `
        <input type="number" class="modal-qty-input input-number" min="1" max="10000" value="${this.selectedQty}" />
        <button data-qty="max">Max</button>
      `;
        const qtyInput = controls.querySelector('.modal-qty-input');
        const maxBtn = controls.querySelector('button[data-qty="max"]');
        qtyInput.addEventListener('input', () => {
          let val = parseInt(qtyInput.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > 10000) val = 10000;
          this.selectedQty = val;
          options.soulShopQty = val;
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
      if (slider) {
        slider.style.display = '';
      }
      buyBtn.style.display = '';
      this.updateModalDetails();
    } else if (config.oneTime) {
      controls.style.display = 'none';
      const purchased = !!this.soulUpgrades[stat];
      const oneTimeBonusText = typeof config.bonus === 'string' ? t(config.bonus) : (config.bonus || '');
      fields.innerHTML = `
        <p>${oneTimeBonusText}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> ${t('resource.souls.name')}</p>
        <div class="modal-status">${
  purchased ? '<span style="color:#10b981;font-weight:bold;">' + t('common.purchased') + '</span>' : ''
}</div>
      `;
      buyBtn.style.display = purchased ? 'none' : '';
      buyBtn.disabled = purchased;
      if (slider) slider.style.display = 'none';
    } else if (config.multiple) {
      controls.style.display = 'none';
      const multipleBonusText = typeof config.bonus === 'string' ? t(config.bonus) : (config.bonus || '');
      fields.innerHTML = `
        <p>${multipleBonusText}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> ${t('resource.souls.name')}</p>
      `;
      buyBtn.style.display = '';
      buyBtn.disabled = false;
      if (slider) slider.style.display = 'none';
    }
    m.classList.remove('hidden');
    if (isMultiLevel) this.updateModalDetails();
  }

  updateModalDetails() {
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const config = SOUL_UPGRADE_CONFIG[stat];
    const m = this.modal;
    const q = (sel) => m.querySelector(sel);
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      const baseLevel = this.soulUpgrades[stat] || 0;
      const maxLevel = config.maxLevel || Infinity;
      const levelsLeft = maxLevel - baseLevel;
      const { qty: affordableQty } = this.getBulkCost(stat, 'max');
      let qty =
        this.selectedQty === 'max'
          ? affordableQty > 0
            ? Math.min(affordableQty, 10000)
            : Math.min(1, levelsLeft)
          : Math.min(this.selectedQty, levelsLeft, 10000);
      const totalCost = this.calculateTotalCost(stat, qty, baseLevel);
      const affordable = hero.souls >= totalCost && qty > 0 && qty <= affordableQty;
      let bonus = config.bonus || 0;
      if (config.stat && config.stat.endsWith('Percent')) {
        bonus *= 100;
      }
      const bonusValue = bonus * qty;

      const decimals = 0;
      if (q('.modal-qty')) q('.modal-qty').textContent = qty;
      const costEl = q('.modal-total-cost');
      if (costEl) {
        costEl.textContent = totalCost;
        costEl.classList.toggle('unaffordable', !affordable);
      }
      const bonusEl = q('.modal-total-bonus');
      if (bonusEl) {
        const bonusLabel = config.bonusLabel ? t(config.bonusLabel) : t(config.label);
        bonusEl.textContent = `+${bonusValue.toFixed(decimals)} ${bonusLabel}`;
        bonusEl.classList.toggle('unaffordable', !affordable);
      }
      if (q('.modal-level'))
        q('.modal-level').textContent = baseLevel + (maxLevel !== Infinity ? ` / ${maxLevel}` : '');
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
      if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);
      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = !affordable || baseLevel >= maxLevel;
      const slider = q('.modal-slider');
      if (slider) {
        slider.max = Math.min(levelsLeft, 10000);
        slider.value =
          this.selectedQty === 'max'
            ? Math.min(levelsLeft, 10000)
            : Math.min(this.selectedQty, levelsLeft, 10000);
      }
      const input = q('.modal-qty-input');
      if (input && this.selectedQty !== 'max') input.value = this.selectedQty;
    }
  }

  getBonusText(stat, config, level) {
    if (config.oneTime) return '';
    if (typeof config.bonus === 'string') return t(config.bonus);
    let bonusValue = (config.bonus || 0) * level;
    let decimals = 0;
    if (config.stat && config.stat.endsWith('Percent')) {
      bonusValue *= 100;
      decimals = 1;
    }
    const label = config.bonusLabel ? t(config.bonusLabel) : t(config.label);
    return `+${bonusValue.toFixed(decimals)} ${label}`;
  }

  async buyBulk(stat, qty) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (isMultiLevel) {
      let count = 0;
      let totalCost = 0;
      const maxLevel = config.maxLevel || Infinity;
      if (qty === 'max') {
        let level = this.soulUpgrades[stat] || 0;
        while (level < maxLevel && count < 10000) {
          const cost = this.getSoulUpgradeCost(config, level);
          if (hero.souls < cost) break;
          hero.souls -= cost;
          totalCost += cost;
          level++;
          count++;
        }
        this.soulUpgrades[stat] = level;
      } else {
        qty = Math.min(qty, 10000);
        for (let i = 0; i < qty; i++) {
          let currentLevel = this.soulUpgrades[stat] || 0;
          if (currentLevel >= maxLevel) break;
          const cost = this.getSoulUpgradeCost(config, currentLevel);
          if (hero.souls < cost) break;
          hero.souls -= cost;
          totalCost += cost;
          this.soulUpgrades[stat] = currentLevel + 1;
          count++;
        }
      }
      showToast(`Upgraded ${t(config.label)} by ${count} levels!`, count > 0 ? 'success' : 'error');
    } else if (config.oneTime || config.multiple) {
      if (config.oneTime && this.soulUpgrades[stat]) {
        showToast(t('common.alreadyPurchased') || 'Already purchased!', 'error');
        return;
      }
      const cost = config.baseCost;
      if (hero.souls < cost) {
        showToast(t('common.notEnoughSouls') || 'Not enough souls!', 'error');
        return;
      }
      hero.souls -= cost;
      this.soulUpgrades[stat] = config.oneTime ? true : (this.soulUpgrades[stat] || 0) + 1;
      showToast(`${t(config.label)} ${t('common.purchased') || 'purchased'}!`, 'success');
    }

    dataManager.saveGame();
    updateResources();
    hero.recalculateFromAttributes();
    this.updateModalDetails();
    updateStatsAndAttributesUI();
    updatePlayerLife();
    this.initializeSoulShopUI();
    // Do NOT close the modal for multi-level upgrades
    if (isMultiLevel) return;
    closeModal('#soulShop-modal');
  }
}
