import { dataManager, hero } from './globals.js';
import { updateResources, showToast, updatePlayerLife } from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { closeModal, createModal } from './ui/modal.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';

const html = String.raw;

export const SOUL_UPGRADE_CONFIG = {
  // One-time purchase
  extraLife: {
    label: 'Extra Life',
    bonus: 'Gain 1 resurrection per run',
    baseCost: 1000,
    oneTime: true,
  },
  bonusGold: {
    label: 'Bonus Gold %',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusGoldPercent',
  },
  bonusExperience: {
    label: 'Bonus Experience %',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusExperiencePercent',
  },
  damageBoost: {
    label: 'Damage Boost %',
    bonus: 0.005,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'totalDamagePercent',
  },
  lifeBoost: {
    label: 'Life Boost %',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'lifePercent',
  },
  manaBoost: {
    label: 'Mana Boost %',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.15,
    stat: 'manaPercent',
  },
  /**
   * Extra Material Drop Chance
   * Each level increases the chance to gain an additional material drop.
   */
  extraMaterialDropPercent: {
    label: 'Extra Material Drop Chance %',
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
    label: 'Extra Material Drop Max',
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
    this.selectedQty = 1;
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

  resetSoulShop() {
    this.soulUpgrades = {};
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = 1;
    this.updateSoulShopUI();
  }

  createSoulUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    const isPercent = config.stat?.endsWith('Percent');
    let alreadyPurchased = isOneTime && this.soulUpgrades[stat];
    // For multiple:true, do not show level
    const level = isOneTime || isMultiple ? undefined : this.soulUpgrades[stat] || 0;
    let bonus;
    if (isOneTime || isMultiple) {
      bonus = config.bonus;
    } else if (isMultiLevel) {
      const value = Math.floor(config.bonus * (this.soulUpgrades[stat] || 0) * (isPercent ? 100 : 1));
      bonus = `+${value}${config.suffix || ''} ${config.label}`;
    } else {
      bonus = `+${config.bonus * (this.soulUpgrades[stat] || 0)} ${config.label}`;
    }
    const cost =
      isOneTime || isMultiple
        ? Math.round(config.baseCost)
        : this.getSoulUpgradeCost(config, this.soulUpgrades[stat] || 0);
    return `
      <button class="soul-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}" ${
  alreadyPurchased ? 'disabled' : ''
}>
        <span class="upgrade-name">${config.label} ${isOneTime ? '' : isMultiple ? '' : `(Lvl ${level})`}</span>
        <span class="upgrade-bonus">${bonus}</span>
        <span class="upgrade-cost">${alreadyPurchased ? 'Purchased' : `${cost} Souls`}</span>
      </button>
    `;
  }

  setupSoulUpgradeHandlers() {
    const buttons = document.querySelectorAll('.soul-upgrade-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const stat = button.dataset.stat;
        this.openUpgradeModal(stat);
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
  }

  openUpgradeModal(stat) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return;
    this.currentStat = stat;
    const m = this.modal;
    m.querySelector('.modal-title').textContent = config.label;
    const fields = m.querySelector('.modal-fields');
    const controls = m.querySelector('.modal-controls');
    const buyBtn = m.querySelector('.modal-buy');
    this.selectedQty = 1;
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
      const purchased = !!this.soulUpgrades[stat];
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Souls</p>
        <div class="modal-status">${
  purchased ? '<span style="color:#10b981;font-weight:bold;">Purchased</span>' : ''
}</div>
      `;
      buyBtn.style.display = purchased ? 'none' : '';
      buyBtn.disabled = purchased;
    } else if (config.multiple) {
      controls.style.display = 'none';
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Souls</p>
      `;
      buyBtn.style.display = '';
      buyBtn.disabled = false;
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
      const soulsAvailable = hero.souls;
      let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
      let totalCost = 0;
      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let souls = soulsAvailable;
        while (lvl < maxLevel) {
          const cost = this.getSoulUpgradeCost(config, lvl);
          if (souls < cost) break;
          souls -= cost;
          totalCost += cost;
          lvl++;
          qty++;
        }
      } else {
        if (baseLevel + qty > maxLevel) {
          qty = maxLevel - baseLevel;
        }
        for (let i = 0; i < qty; i++) {
          const cost = this.getSoulUpgradeCost(config, baseLevel + i);
          totalCost += cost;
        }
      }
      let bonus = config.bonus || 0;
      // if stat ends with Percent, bonus should be multiplied by 100 for display
      if (config.stat && config.stat.endsWith('Percent')) {
        bonus *= 100;
      }
      const bonusValue = bonus * qty;

      const decimals = 0;
      if (q('.modal-qty')) q('.modal-qty').textContent = qty;
      if (q('.modal-total-cost')) q('.modal-total-cost').textContent = totalCost;
      if (q('.modal-total-bonus'))
        q('.modal-total-bonus').textContent = `+${bonusValue.toFixed(decimals)} ${config.label}`;
      if (q('.modal-level'))
        q('.modal-level').textContent = baseLevel + (maxLevel !== Infinity ? ` / ${maxLevel}` : '');
      if (q('.modal-bonus')) q('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
      if (q('.modal-next-bonus')) q('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);
      const buyBtn = q('.modal-buy');
      if (buyBtn) buyBtn.disabled = qty <= 0 || totalCost > soulsAvailable || baseLevel >= maxLevel;
    }
  }

  getBonusText(stat, config, level) {
    if (config.oneTime) return ''; // No bonus text for one-time upgrades
    let bonusValue = (config.bonus || 0) * level;
    let decimals = 0;

    // if stat ends with Percent, bonus should be multiplied by 100 for display
    if (config.stat && config.stat.endsWith('Percent')) {
      bonusValue *= 100;
      decimals = 1;
    }

    return `+${bonusValue.toFixed(decimals)} ${config.label}`;
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
        while (level < maxLevel) {
          const cost = this.getSoulUpgradeCost(config, level);
          if (hero.souls < cost) break;
          hero.souls -= cost;
          totalCost += cost;
          level++;
          count++;
        }
        this.soulUpgrades[stat] = level;
      } else {
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
      showToast(`Upgraded ${config.label} by ${count} levels!`, count > 0 ? 'success' : 'error');
    } else if (config.oneTime || config.multiple) {
      if (config.oneTime && this.soulUpgrades[stat]) {
        showToast('Already purchased!', 'error');
        return;
      }
      const cost = config.baseCost;
      if (hero.souls < cost) {
        showToast('Not enough souls!', 'error');
        return;
      }
      hero.souls -= cost;
      this.soulUpgrades[stat] = config.oneTime ? true : (this.soulUpgrades[stat] || 0) + 1;
      showToast(`Purchased ${config.label}!`, 'success');
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
