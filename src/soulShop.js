import { dataManager, hero, options, runes, ascension } from './globals.js';
import { updateResources, showToast, updatePlayerLife, formatNumber } from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { closeModal, createModal } from './ui/modal.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { t } from './i18n.js';
import { SOUL_SHOP_MAX_QTY } from './constants/limits.js';

const html = String.raw;

export const SOUL_UPGRADE_CONFIG = {
  // One-time purchase
  extraLife: {
    label: 'soulShop.upgrade.extraLife.label',
    bonus: 'soulShop.upgrade.extraLife.bonus',
    baseCost: 1000,
    maxLevel: 5000,
    oneTime: true,
  },
  bonusGold: {
    label: 'soulShop.upgrade.bonusGold.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusGoldPercent',
    maxLevel: 2000,
  },
  bonusExperience: {
    label: 'soulShop.upgrade.bonusExperience.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.2,
    stat: 'bonusExperiencePercent',
    maxLevel: 2000,
  },
  damageBoost: {
    label: 'soulShop.upgrade.damageBoost.label',
    bonus: 0.01,
    baseCost: 6,
    costIncrement: 0.4,
    stat: 'totalDamagePercent',
    maxLevel: 6000,
  },
  attackRatingBoost: {
    label: 'soulShop.upgrade.attackRatingBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'attackRatingPercent',
    maxLevel: 5000,
  },
  flatPenetrationBoost: {
    label: 'soulShop.upgrade.flatPenetrationBoost.label',
    bonus: 0.05,
    baseCost: 1,
    costIncrement: 0.1,
    stat: 'flatPenetrationPercent',
  },
  lifeBoost: {
    label: 'soulShop.upgrade.lifeBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.2,
    stat: 'lifePercent',
    maxLevel: 4000,
  },
  manaBoost: {
    label: 'soulShop.upgrade.manaBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.15,
    stat: 'manaPercent',
    maxLevel: 5000,
  },
  armorBoost: {
    label: 'soulShop.upgrade.armorBoost.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.25,
    stat: 'armorPercent',
    maxLevel: 5000,
  },
  evasionBoost: {
    label: 'soulShop.upgrade.evasionBoost.label',
    bonus: 0.01,
    baseCost: 4,
    costIncrement: 0.25,
    stat: 'evasionPercent',
    maxLevel: 5000,
  },
  lifeRegenBoost: {
    label: 'soulShop.upgrade.lifeRegenBoost.label',
    bonus: 0.025,
    baseCost: 4,
    costIncrement: 0.3,
    stat: 'lifeRegenPercent',
    maxLevel: 2000,
  },
  allResistanceBoost: {
    label: 'soulShop.upgrade.allResistanceBoost.label',
    bonus: 0.01,
    baseCost: 3,
    costIncrement: 0.3,
    stat: 'allResistancePercent',
    maxLevel: 5000,
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
    maxLevel: 10,
    ignoreAscensionCap: true,
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
    maxLevel: 100,
    ignoreAscensionCap: true,
  },
};

export default class SoulShop {
  constructor(savedData = null) {
    this.soulUpgrades = {};
    handleSavedData(savedData, this);
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = options.useNumericInputs
      ? Math.min(options.soulShopQty || 1, SOUL_SHOP_MAX_QTY)
      : 1;
    this.quickQty = options.useNumericInputs
      ? Math.min(options.soulShopQuickQty || 1, SOUL_SHOP_MAX_QTY)
      : 1;
    this.bulkBuyBtn = null;
    this.bulkCostEl = null;
  }

  /**
   * Returns the integer cost for a soul shop upgrade at a given level.
   * @param {object} config - The upgrade config object
   * @param {number} level - The current level (0-based)
   * @returns {number} Integer cost
  */
  getSoulUpgradeCost(config, level = 0) {
    const multiplier = this.getCostMultiplier();
    const base = config.baseCost + (config.costIncrement || 0) * level;
    return Math.round(base * multiplier);
  }

  getCostMultiplier() {
    const bonus = runes?.getBonusEffects?.() || {};
    const runeReduction = bonus.soulShopCostReduction || 0;
    const ascRed = ascension?.getBonuses?.()?.soulShopCostReduction || 0;
    const reduction = runeReduction + ascRed;
    const multiplier = 1 - reduction;
    return multiplier <= 0 ? 0 : multiplier;
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
    const existingControls = shopContainer.querySelector('.soulShop-controls');
    if (existingControls) existingControls.remove();
    if (options?.quickBuy || options?.bulkBuy) {
      const controlBar = document.createElement('div');
      controlBar.className = 'soulShop-controls';
      shopContainer.insertBefore(controlBar, upgradesContainer);

      if (options?.quickBuy) {
        const qtyControls = document.createElement('div');
        qtyControls.className = 'soulShop-qty-controls';
        if (options.useNumericInputs) {
          qtyControls.innerHTML = `
            <input type="number" class="soul-qty-input input-number" min="1" max="${SOUL_SHOP_MAX_QTY}" value="${this.quickQty === 'max' ? options.soulShopQuickQty || 1 : this.quickQty}" />
            <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">Max</button>
          `;
          controlBar.appendChild(qtyControls);
          const input = qtyControls.querySelector('.soul-qty-input');
          const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
          input.oninput = () => {
            let val = parseInt(input.value, 10);
            if (Number.isNaN(val) || val < 1) val = 1;
            if (val > SOUL_SHOP_MAX_QTY) val = SOUL_SHOP_MAX_QTY;
            this.quickQty = val;
            options.soulShopQuickQty = val;
            maxBtn.classList.remove('active');
            this.updateSoulShopUI();
            if (options?.bulkBuy) this.updateBulkCost();
            dataManager.saveGame();
          };
          maxBtn.onclick = () => {
            this.quickQty = 'max';
            maxBtn.classList.add('active');
            this.updateSoulShopUI();
            if (options?.bulkBuy) this.updateBulkCost();
            dataManager.saveGame();
          };
        } else {
          qtyControls.innerHTML = `
            <button data-qty="1" class="${this.quickQty === 1 ? 'active' : ''}">1</button>
            <button data-qty="10" class="${this.quickQty === 10 ? 'active' : ''}">10</button>
            <button data-qty="50" class="${this.quickQty === 50 ? 'active' : ''}">50</button>
            <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">Max</button>
          `;
          controlBar.appendChild(qtyControls);
          qtyControls.querySelectorAll('button').forEach((btn) => {
            btn.onclick = () => {
              this.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
              qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
              btn.classList.add('active');
              this.updateSoulShopUI();
              if (options?.bulkBuy) this.updateBulkCost();
            };
          });
        }
      }

      if (options?.bulkBuy) {
        const bulkControls = document.createElement('div');
        bulkControls.className = 'soulShop-bulk-controls';
        bulkControls.innerHTML = `
          <button class="bulk-buy">Bulk Buy</button>
          <span class="soulShop-bulk-cost"></span>
        `;
        controlBar.appendChild(bulkControls);
        this.bulkBuyBtn = bulkControls.querySelector('.bulk-buy');
        this.bulkCostEl = bulkControls.querySelector('.soulShop-bulk-cost');
        this.bulkBuyBtn.onclick = () => this.bulkBuyAll();
      } else {
        this.bulkBuyBtn = null;
        this.bulkCostEl = null;
      }
    } else {
      this.bulkBuyBtn = null;
      this.bulkCostEl = null;
    }
    this.updateSoulShopUI();
    if (options?.bulkBuy) this.updateBulkCost();
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
    if (options?.bulkBuy) this.updateBulkCost();
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
      const maxLevel = isMultiLevel ? this.getUpgradeMaxLevel(config) : Infinity;
      const levelsLeft = Math.max(0, maxLevel - baseLevel);
      let qty = 1;
      let cost = isOneTime || isMultiple
        ? Math.round(config.baseCost)
        : this.getSoulUpgradeCost(config, baseLevel);
      let disabled = alreadyPurchased;
      let unaffordable = false;
      if (options?.quickBuy && !alreadyPurchased) {
        if (isMultiLevel || isMultiple) {
          if (this.quickQty === 'max') {
            const { qty: affordableQty, totalCost } = this.getBulkCost(stat, 'max', hero.souls);
            qty =
              affordableQty > 0
                ? Math.min(affordableQty, SOUL_SHOP_MAX_QTY)
                : Math.min(1, levelsLeft);
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
            qty = Math.min(
              this.quickQty,
              isMultiLevel ? levelsLeft : SOUL_SHOP_MAX_QTY,
              SOUL_SHOP_MAX_QTY,
            );
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
          : `${formatNumber(cost)} ${t('resource.souls.name')}<img style="width: 20px; height: 20px;" src="${BASE}/icons/soul.svg" alt="${t('resource.souls.name')}">(${formatNumber(qty)})`;
        costEl.classList.toggle('unaffordable', unaffordable);
      }
      if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
    });
    if (options?.bulkBuy) this.updateBulkCost();
  }

  resetSoulShop() {
    this.soulUpgrades = {};
    this.modal = null;
    this.currentStat = null;
    this.selectedQty = Math.min(options.soulShopQty || 1, SOUL_SHOP_MAX_QTY);
    this.quickQty = Math.min(options.soulShopQuickQty || 1, SOUL_SHOP_MAX_QTY);
    this.updateSoulShopUI();
  }

  getAscensionLevelCapBonus() {
    return ascension?.getBonuses?.()?.soulShopLevelCap || 0;
  }

  getUpgradeMaxLevel(config) {
    if (!config || typeof config.maxLevel !== 'number') {
      return Infinity;
    }
    if (config.ignoreAscensionCap) {
      return config.maxLevel;
    }
    return config.maxLevel + this.getAscensionLevelCapBonus();
  }

  getLevelsLeft(config, baseLevel) {
    const maxLevel = this.getUpgradeMaxLevel(config);
    if (!Number.isFinite(maxLevel)) return Infinity;
    return Math.max(0, maxLevel - baseLevel);
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
      bonus =
        typeof config.bonus === 'string'
          ? t(config.bonus)
          : `+${formatNumber(config.bonus * (isPercent ? 100 : 1))}${config.suffix || ''} ${label}`;
    } else if (isMultiLevel) {
      const value = Math.floor(config.bonus * (this.soulUpgrades[stat] || 0) * (isPercent ? 100 : 1));
      bonus = `+${formatNumber(value)}${config.suffix || ''} ${label}`;
    } else {
      bonus = `+${formatNumber(config.bonus * (this.soulUpgrades[stat] || 0))} ${label}`;
    }
    let cost =
      isOneTime || isMultiple
        ? Math.round(config.baseCost)
        : this.getSoulUpgradeCost(config, this.soulUpgrades[stat] || 0);
    let bonusClass = '';
    let disabled = alreadyPurchased;
    let qty = 1;
    if (options?.quickBuy && !alreadyPurchased) {
      const baseLevel = this.soulUpgrades[stat] || 0;
      const levelsLeft = isMultiLevel ? this.getLevelsLeft(config, baseLevel) : Infinity;
      if (this.quickQty === 'max') {
        const { qty: affordableQty, totalCost } = this.getBulkCost(stat, 'max', hero.souls);
        qty =
          affordableQty > 0
            ? Math.min(affordableQty, SOUL_SHOP_MAX_QTY)
            : Math.min(1, levelsLeft);
        cost = affordableQty > 0 ? totalCost : this.calculateTotalCost(stat, qty, baseLevel);
        if (affordableQty <= 0 || hero.souls < cost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      } else {
        qty = Math.min(this.quickQty, levelsLeft, SOUL_SHOP_MAX_QTY);
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
        <span class="upgrade-name">${label} ${isOneTime ? '' : isMultiple ? '' : `(${t('common.lvl')} ${formatNumber(level)})`}</span>
        <span class="upgrade-bonus ${bonusClass}">${bonus}</span>
        <span class="upgrade-cost ${bonusClass}">${alreadyPurchased ? t('common.purchased') : `${formatNumber(cost)} ${t('resource.souls.name')}<img style="width: 20px; height: 20px;" src="${BASE}/icons/soul.svg" alt="${t('resource.souls.name')}">(${formatNumber(qty)})`}</span>
      </button>
    `;
  }

  getBulkCost(stat, desiredQty, availableSouls = hero.souls) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return { qty: 0, totalCost: 0 };
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    const baseLevel = this.soulUpgrades[stat] || 0;
    if (isMultiLevel) {
      return this.getMaxPurchasable(stat, desiredQty, baseLevel, availableSouls);
    }
    if (config.multiple) {
      const unitCost = Math.round(config.baseCost);
      if (unitCost <= 0) {
        const qty = desiredQty === 'max' ? SOUL_SHOP_MAX_QTY : Math.min(desiredQty, SOUL_SHOP_MAX_QTY);
        return { qty, totalCost: 0 };
      }
      const maxQty = Math.floor(availableSouls / unitCost);
      const parsedDesired =
        typeof desiredQty === 'number' ? desiredQty : parseInt(desiredQty, 10);
      const qty =
        desiredQty === 'max'
          ? Math.min(maxQty, SOUL_SHOP_MAX_QTY)
          : Math.min(Number.isFinite(parsedDesired) ? parsedDesired : 0, maxQty, SOUL_SHOP_MAX_QTY);
      return { qty, totalCost: qty * unitCost };
    }
    return { qty: 1, totalCost: Math.round(config.baseCost) };
  }

  calculateBulkCostAndPurchases(qtySetting) {
    const entries = Object.entries(SOUL_UPGRADE_CONFIG)
      .filter(([, config]) => typeof config.bonus === 'number' && !config.oneTime)
      .map(([stat, config]) => {
        const baseLevel = this.soulUpgrades[stat] || 0;
        const levelsLeft = this.getLevelsLeft(config, baseLevel);
        return { stat, config, baseLevel, levelsLeft };
      })
      .filter(({ levelsLeft }) => levelsLeft > 0);

    if (entries.length === 0) {
      return { totalCost: 0, purchases: [], affordable: false };
    }

    let totalCost = 0;
    const purchases = [];

    if (qtySetting === 'max') {
      const rawSouls = Number(hero.souls);
      const availableSouls = Number.isFinite(rawSouls) ? Math.max(0, Math.floor(rawSouls)) : Number.MAX_SAFE_INTEGER;
      const perChunk = entries.length > 0 ? Math.floor(availableSouls / entries.length) : 0;
      if (perChunk <= 0) {
        return { totalCost: 0, purchases: [], affordable: false };
      }
      entries.forEach(({ stat, baseLevel }) => {
        const { qty, totalCost: cost } = this.getMaxPurchasable(stat, 'max', baseLevel, perChunk);
        if (qty > 0 && Number.isFinite(cost)) {
          totalCost += cost;
          purchases.push({ stat, qty, cost, baseLevel });
        }
      });
    } else {
      const numericQty = Number(qtySetting);
      const desired = Number.isFinite(numericQty) ? Math.max(0, numericQty) : 0;
      entries.forEach(({ stat, baseLevel, levelsLeft }) => {
        const qty = Math.min(desired, levelsLeft, SOUL_SHOP_MAX_QTY);
        if (qty <= 0) return;
        const cost = this.calculateTotalCost(stat, qty, baseLevel);
        if (!Number.isFinite(cost)) return;
        totalCost += cost;
        purchases.push({ stat, qty, cost, baseLevel });
      });
    }

    const affordable = hero.souls >= totalCost && purchases.length > 0;
    return { totalCost, purchases, affordable };
  }

  updateBulkCost() {
    if (!this.bulkBuyBtn || !this.bulkCostEl) return;
    const { totalCost, purchases, affordable } = this.calculateBulkCostAndPurchases(this.quickQty);
    const costValue = purchases.length > 0 ? totalCost : 0;
    this.bulkCostEl.textContent = `${t('soulShop.cost')}: ${formatNumber(costValue)} ${t('resource.souls.name')}`;
    this.bulkCostEl.classList.toggle('unaffordable', !affordable);
    this.bulkBuyBtn.disabled = purchases.length === 0 || !affordable;
  }

  bulkBuyAll() {
    const { totalCost, purchases, affordable } = this.calculateBulkCostAndPurchases(this.quickQty);
    if (purchases.length === 0) return;
    if (!affordable) {
      showToast(t('soulShop.notEnoughSoulsBulk'), 'error');
      return;
    }
    if (totalCost > 0) hero.souls -= totalCost;
    purchases.forEach(({ stat, qty, baseLevel }) => {
      const startingLevel = baseLevel ?? (this.soulUpgrades[stat] || 0);
      this.soulUpgrades[stat] = startingLevel + qty;
    });
    showToast(t('soulShop.bulkPurchaseSuccess'), 'success');
    dataManager.saveGame();
    updateResources();
    hero.queueRecalculateFromAttributes();
    this.updateModalDetails();
    updateStatsAndAttributesUI();
    updatePlayerLife();
    this.initializeSoulShopUI();
  }

  getMaxPurchasable(stat, desiredQty, baseLevel = this.soulUpgrades[stat] || 0, availableSouls = hero.souls) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config) return { qty: 0, totalCost: 0 };
    const isMultiLevel = typeof config.bonus === 'number' && !config.oneTime;
    if (!isMultiLevel) return { qty: 0, totalCost: 0 };

    const maxLevel = this.getUpgradeMaxLevel(config);
    const levelsLeft = this.getLevelsLeft(config, baseLevel);
    if (levelsLeft <= 0) return { qty: 0, totalCost: 0 };
    const maxQty = Math.min(levelsLeft, SOUL_SHOP_MAX_QTY);
    const targetQty =
      desiredQty === 'max'
        ? maxQty
        : Math.min(typeof desiredQty === 'number' ? desiredQty : parseInt(desiredQty, 10) || 0, maxQty);

    if (targetQty <= 0) return { qty: 0, totalCost: 0 };

    let low = 0;
    let high = targetQty;
    let bestQty = 0;
    let bestCost = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cost = this.calculateTotalCost(stat, mid, baseLevel);
      if (cost <= availableSouls) {
        bestQty = mid;
        bestCost = cost;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return { qty: bestQty, totalCost: bestCost };
  }

  calculateTotalCost(stat, qty, baseLevel = this.soulUpgrades[stat] || 0) {
    const config = SOUL_UPGRADE_CONFIG[stat];
    if (!config || qty <= 0) return 0;
    if (config.oneTime || config.multiple) {
      return Math.round(config.baseCost) * qty;
    }

    const increment = config.costIncrement || 0;
    const multiplier = this.getCostMultiplier();
    if (multiplier === 0) return 0;
    if (increment === 0) {
      const cost = Math.round((config.baseCost + increment * baseLevel) * multiplier);
      return cost * qty;
    }

    const baseCost = config.baseCost;
    const step = increment;
    const EPS = 1e-9;
    let remaining = qty;
    let level = baseLevel;
    let total = 0;

    while (remaining > 0) {
      const baseValue = baseCost + step * level;
      const cost = Math.round(baseValue * multiplier);
      const upperBound = (cost + 0.5 - EPS) / multiplier;
      const spanRaw = (upperBound - baseValue) / step;
      const maxSpan = step > 0 ? Math.max(0, Math.floor(spanRaw + EPS)) : remaining - 1;
      const span = Math.min(remaining, maxSpan + 1);
      total += cost * span;
      remaining -= span;
      level += span;
    }
    return total;
  }

  setupSoulUpgradeHandlers() {
    const buttons = document.querySelectorAll('.soul-upgrade-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const stat = button.dataset.stat;
        if (options?.quickBuy) {
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
        <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
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
    this.modal.querySelector('.modal-buy').onclick = () =>
      this.buyBulk(this.currentStat, this.selectedQty);
    const slider = this.modal.querySelector('.modal-slider');
    slider.addEventListener('input', (e) => {
      this.selectedQty = Math.min(
        parseInt(e.target.value, 10) || 0,
        SOUL_SHOP_MAX_QTY,
      );
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
    this.selectedQty = options.useNumericInputs
      ? Math.min(options.soulShopQty || 1, SOUL_SHOP_MAX_QTY)
      : 1;
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
        <input type="number" class="modal-qty-input input-number" min="1" max="${SOUL_SHOP_MAX_QTY}" value="${this.selectedQty}" />
        <button data-qty="max">Max</button>
      `;
        const qtyInput = controls.querySelector('.modal-qty-input');
        const maxBtn = controls.querySelector('button[data-qty="max"]');
        qtyInput.addEventListener('input', () => {
          let val = parseInt(qtyInput.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > SOUL_SHOP_MAX_QTY) val = SOUL_SHOP_MAX_QTY;
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
      const maxLevel = this.getUpgradeMaxLevel(config);
      const levelsLeft = this.getLevelsLeft(config, baseLevel);
      const { qty: affordableQty, totalCost: maxCost } = this.getMaxPurchasable(
        stat,
        'max',
        baseLevel,
        hero.souls,
      );
      let qty =
        this.selectedQty === 'max'
          ? affordableQty > 0
            ? Math.min(affordableQty, SOUL_SHOP_MAX_QTY)
            : Math.min(1, levelsLeft)
          : Math.min(this.selectedQty, levelsLeft, SOUL_SHOP_MAX_QTY);
      const totalCost =
        this.selectedQty === 'max' && affordableQty > 0
          ? maxCost
          : this.calculateTotalCost(stat, qty, baseLevel);
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
        slider.max = Math.min(levelsLeft, SOUL_SHOP_MAX_QTY);
        slider.value =
          this.selectedQty === 'max'
            ? Math.min(levelsLeft, SOUL_SHOP_MAX_QTY)
            : Math.min(this.selectedQty, levelsLeft, SOUL_SHOP_MAX_QTY);
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
      const baseLevel = this.soulUpgrades[stat] || 0;
      let levelsToBuy = 0;
      let totalCost = 0;
      if (qty === 'max') {
        ({ qty: levelsToBuy, totalCost } = this.getMaxPurchasable(stat, qty, baseLevel, hero.souls));
      } else {
        const levelsLeft = this.getLevelsLeft(config, baseLevel);
        const numericQty = Number(qty);
        const safeQty = Number.isFinite(numericQty) ? numericQty : 0;
        const desired = Math.min(Math.min(safeQty, SOUL_SHOP_MAX_QTY), levelsLeft);
        ({ qty: levelsToBuy, totalCost } = this.getMaxPurchasable(stat, desired, baseLevel, hero.souls));
      }
      if (levelsToBuy > 0) {
        hero.souls -= totalCost;
        this.soulUpgrades[stat] = baseLevel + levelsToBuy;
      }
      showToast(`Upgraded ${t(config.label)} by ${levelsToBuy} levels!`, levelsToBuy > 0 ? 'success' : 'error');
    } else if (config.oneTime || config.multiple) {
      if (config.oneTime && this.soulUpgrades[stat]) {
        showToast(t('common.alreadyPurchased') || 'Already purchased!', 'error');
        return;
      }
      let cost = config.baseCost;
      {
        const ascRed = ascension?.getBonuses?.()?.soulShopCostReduction || 0;
        cost = Math.round(cost * (1 - ascRed));
      }
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
    hero.queueRecalculateFromAttributes();
    this.updateModalDetails();
    updateStatsAndAttributesUI();
    updatePlayerLife();
    this.initializeSoulShopUI();
    // Do NOT close the modal for multi-level upgrades
    if (isMultiLevel) return;
    closeModal('#soulShop-modal');
  }
}
