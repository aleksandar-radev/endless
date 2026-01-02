import { formatStatName, updateResources, formatNumber } from './ui/ui.js';

import { showToast } from './ui/ui.js';
import { hero, dataManager, options, runes, ascension } from './globals.js';
import { TRAINING_MAX_QTY } from './constants/limits.js';
import { handleSavedData } from './functions.js';
import { getStatDecimalPlaces, STATS } from './constants/stats/stats.js';
import { createModal } from './ui/modal.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { t, tp } from './i18n.js';
import { calcLinearSum, solveLinear, calcGeometricSum, solveGeometric } from './utils/bulkMath.js';

const html = String.raw;

const SECTION_DEFS = [
  {
    key: 'offense', labelKey: 'stats.offense', stats: Object.keys(OFFENSE_STATS),
  },
  {
    key: 'defense', labelKey: 'stats.defense', stats: Object.keys(DEFENSE_STATS),
  },
  {
    key: 'misc', labelKey: 'stats.misc', stats: Object.keys(MISC_STATS),
  },
];

const ELEMENTAL_TRAINING_STATS = [
  'fireDamage',
  'coldDamage',
  'airDamage',
  'earthDamage',
  'lightningDamage',
  'waterDamage',
];

const DEFAULT_RESOURCE_EXTRA_PHYSICAL_SHARE_PERCENT = 50;

export default class Training {
  constructor(savedData = null) {
    this.upgradeLevels = {};
    this.trainingBonuses = {};
    this.goldSpent = 0;
    this.elementalDistribution = {};
    this.resourceExtraDamagePhysicalSharePercent = DEFAULT_RESOURCE_EXTRA_PHYSICAL_SHARE_PERCENT;
    Object.entries(STATS).forEach(([stat, config]) => {
      if (config.training) {
        this.upgradeLevels[stat] = 0;
        this.trainingBonuses[stat] = 0;
      }
    });

    handleSavedData(savedData, this);
    this.elementalModal = null;
    const hadSavedDistribution = !!savedData?.elementalDistribution;
    this._migrateLegacyElementalTraining(hadSavedDistribution);
    this._ensureElementalDistributionStructure();
    this._ensureResourceExtraDamageSplitStructure();
    if (savedData && savedData.goldSpent === undefined) {
      this.goldSpent = 0;
      Object.entries(this.upgradeLevels).forEach(([stat, lvl]) => {
        if (lvl > 0) {
          const config = STATS[stat].training;
          if (config) {
            this.goldSpent += this.calculateTotalCost(config, lvl, 0);
          }
        }
      });
    }
    this.activeSection = SECTION_DEFS[0].key;
    const initialQty = options.trainingQuickQty || 1;
    this.quickQty = initialQty === 'max' ? 'max' : Math.min(initialQty, TRAINING_MAX_QTY);
  }

  _ensureResourceExtraDamageSplitStructure() {
    const value = Number(this.resourceExtraDamagePhysicalSharePercent);
    if (!Number.isFinite(value)) {
      this.resourceExtraDamagePhysicalSharePercent = DEFAULT_RESOURCE_EXTRA_PHYSICAL_SHARE_PERCENT;
      return;
    }
    this.resourceExtraDamagePhysicalSharePercent = Math.max(0, Math.min(100, value));
  }

  getResourceExtraDamagePhysicalShare() {
    this._ensureResourceExtraDamageSplitStructure();
    return (this.resourceExtraDamagePhysicalSharePercent || 0) / 100;
  }

  reset() {
    Object.keys(this.upgradeLevels).forEach((stat) => {
      this.upgradeLevels[stat] = 0;
    });
    Object.keys(this.trainingBonuses).forEach((stat) => {
      this.trainingBonuses[stat] = 0;
    });
    this.goldSpent = 0;
    this.quickQty = options.useNumericInputs ? Math.min(options.trainingQuickQty || 1, TRAINING_MAX_QTY) : 1;
  }

  initializeTrainingUI() {
    // Create .sub-tab-panel and .training-grid if not present
    const trainingTab = document.getElementById('training');
    let subTabPanel = trainingTab.querySelector('.sub-tab-panel');
    if (!subTabPanel) {
      subTabPanel = document.createElement('div');
      subTabPanel.className = 'sub-tab-panel active';
      subTabPanel.id = 'gold-upgrades';
      trainingTab.innerHTML = '';
      trainingTab.appendChild(subTabPanel);
    }
    let trainingGrid = subTabPanel.querySelector('.training-grid');
    if (!trainingGrid) {
      trainingGrid = document.createElement('div');
      trainingGrid.className = 'training-grid';
      subTabPanel.appendChild(trainingGrid);
    }

    // Section navigation
    let nav = document.querySelector('.training-section-nav');
    if (!nav) {
      nav = document.createElement('div');
      nav.className = 'training-section-nav';
      nav.style.display = 'flex';
      nav.style.gap = '8px';
      nav.style.marginBottom = '12px';
      trainingGrid.parentElement.insertBefore(nav, trainingGrid);
    }
    nav.innerHTML = SECTION_DEFS.map(
      (sec) => `
      <button class="training-section-btn${this.activeSection === sec.key ? ' active' : ''}" data-section="${sec.key}" data-i18n="${sec.labelKey}">
        ${t(sec.labelKey)}
      </button>
    `,
    ).join('');

    const controlsWrapper = document.createElement('div');
    controlsWrapper.className = 'training-controls-wrapper';
    nav.appendChild(controlsWrapper);

    if (options?.quickBuy || options?.bulkBuy) {
      const qtyControls = document.createElement('div');
      qtyControls.className = 'training-qty-controls';
      if (options.useNumericInputs) {
        qtyControls.innerHTML = `
          <input type="number" class="training-qty-input input-number" min="1" max="${TRAINING_MAX_QTY}" value="${this.quickQty === 'max' ? options.trainingQuickQty || 1 : this.quickQty}" />
          <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
        `;
        controlsWrapper.appendChild(qtyControls);
        const input = qtyControls.querySelector('.training-qty-input');
        const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
        input.oninput = () => {
          let val = parseInt(input.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > TRAINING_MAX_QTY) val = TRAINING_MAX_QTY;
          this.quickQty = val;
          options.trainingQuickQty = val;
          maxBtn.classList.remove('active');
          this.updateTrainingUI('gold-upgrades');
          dataManager.saveGame();
        };
        maxBtn.onclick = () => {
          this.quickQty = 'max';
          maxBtn.classList.add('active');
          if (input) input.value = TRAINING_MAX_QTY;
          this.updateTrainingUI('gold-upgrades');
          dataManager.saveGame();
        };
      } else {
        qtyControls.innerHTML = `
          <button data-qty="1" class="${this.quickQty === 1 ? 'active' : ''}">1</button>
          <button data-qty="10" class="${this.quickQty === 10 ? 'active' : ''}">10</button>
          <button data-qty="50" class="${this.quickQty === 50 ? 'active' : ''}">50</button>
          <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
        `;
        controlsWrapper.appendChild(qtyControls);
        qtyControls.querySelectorAll('button').forEach((btn) => {
          btn.onclick = () => {
            this.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
            qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            this.updateTrainingUI('gold-upgrades');
          };
        });
      }
    }

    if (options?.bulkBuy) {
      const bulkControls = document.createElement('div');
      bulkControls.className = 'training-bulk-controls';
      bulkControls.innerHTML = `
        <button class="bulk-buy">${t('common.bulkBuy')}</button>
        <span class="training-bulk-cost"></span>
      `;
      controlsWrapper.appendChild(bulkControls);
      this.bulkBuyBtn = bulkControls.querySelector('.bulk-buy');
      this.bulkCostEl = bulkControls.querySelector('.training-bulk-cost');
      this.bulkBuyBtn.onclick = () => this.bulkBuySection();
    } else {
      this.bulkBuyBtn = null;
      this.bulkCostEl = null;
    }
    nav.querySelectorAll('button[data-section]').forEach((btn) => {
      btn.onclick = () => {
        this.activeSection = btn.dataset.section;
        this.updateTrainingUI('gold-upgrades');
        // Only toggle active state among section buttons so qty controls keep their active state
        nav.querySelectorAll('button[data-section]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    const goldGrid = document.querySelector('#gold-upgrades .training-grid');
    if (goldGrid) this.attachGridListeners(goldGrid);
    this.updateTrainingUI('gold-upgrades');

    // Create modal for bulk upgrades if not exists
    if (!this.modal) {
      // Build markup for bulk-buy modal
      const controlsMarkup = options.useNumericInputs
        ? `<input type="number" class="modal-qty-input input-number" min="1" max="${TRAINING_MAX_QTY}" />
          <button data-qty="max">${t('common.max')}</button>`
        : `<button data-qty="1">+1</button>
            <button data-qty="10">+10</button>
            <button data-qty="50">+50</button>
          <button data-qty="max">${t('common.max')}</button>`;
      const content = html`
        <div class="training-modal-content">
          <button class="modal-close">&times;</button>
          <h2 class="modal-title"></h2>
          <p>
            ${t('ascension.upgrade.currentLevel')}: <span class="modal-level"></span>/<span
              class="modal-max-level"
            ></span>
          </p>
          <p>${t('ascension.upgrade.currentBonus')}: <span class="modal-bonus"></span></p>
          <p>${t('ascension.upgrade.nextLevelBonus')}: <span class="modal-next-bonus"></span></p>
          <p>${t('crystalShop.modal.totalBonus')}: <span class="modal-total-bonus"></span></p>
          <p>
            ${t('training.totalCost')}: <span class="modal-total-cost"></span> ${t('resource.gold.name')} (<span
              class="modal-qty"
              >1</span
            >)
          </p>
          <div class="modal-controls">${controlsMarkup}</div>
          <input type="range" class="modal-slider" min="0" max="1" value="1" step="1" />
          <button class="modal-buy">${t('crystalShop.modal.buy')}</button>
        </div>
      `;
      // Use shared modal helper
      this.modal = createModal({
        id: 'training-modal',
        className: 'training-modal hidden',
        content,
        onClose: () => this.closeModal(),
      });
      if (options.useNumericInputs) {
        const qtyInput = this.modal.querySelector('.modal-qty-input');
        const maxBtn = this.modal.querySelector('.modal-controls button[data-qty="max"]');
        qtyInput.addEventListener('input', () => {
          let val = parseInt(qtyInput.value, 10);
          if (isNaN(val) || val < 1) val = 1;
          if (val > TRAINING_MAX_QTY) val = TRAINING_MAX_QTY;
          this.selectedQty = val;
          options.trainingQty = val;
          this.updateModalDetails();
          dataManager.saveGame();
        });
        maxBtn.onclick = () => {
          this.selectedQty = 'max';
          this.updateModalDetails();
        };
      } else {
        this.modal.querySelectorAll('.modal-controls button').forEach((btn) => {
          btn.onclick = () => {
            this.selectedQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
            this.updateModalDetails();
          };
        });
      }
      // Slider input
      const slider = this.modal.querySelector('.modal-slider');
      slider.addEventListener('input', (e) => {
        this.selectedQty = Math.min(parseInt(e.target.value, 10) || 0, TRAINING_MAX_QTY);
        e.target.value = this.selectedQty;
        const input = this.modal.querySelector('.modal-qty-input');
        if (input) input.value = this.selectedQty;
        if (options.useNumericInputs) {
          options.trainingQty = this.selectedQty;
          dataManager.saveGame();
        }
        this.updateModalDetails();
      });
      // Buy button
      this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
    }
  }

  attachGridListeners(grid) {
    grid.onclick = (e) => {
      const button = e.target.closest('button[data-stat]');
      if (!button) return;
      const stat = button.dataset.stat;
      if (options?.quickBuy) {
        this.buyBulk(stat, this.quickQty);
      } else {
        this.openModal(stat);
      }
    };
  }

  openModal(stat) {
    const trainingConfig = STATS[stat].training;
    if (!trainingConfig) return;
    this.currentStat = stat;
    // Set title and base info
    const m = this.modal;
    m.querySelector('.modal-title').innerHTML = formatStatName(stat);
    m.querySelector('.modal-level').innerHTML = formatNumber(this.upgradeLevels[stat] || 0);
    m.querySelector('.modal-max-level').innerHTML =
      trainingConfig?.maxLevel === Infinity ? '∞' : formatNumber(trainingConfig.maxLevel);
    m.querySelector('.modal-bonus').innerHTML = this.getBonusText(
      stat,
      STATS[stat].training,
      this.upgradeLevels[stat] || 0,
    );
    m.querySelector('.modal-next-bonus').innerHTML = this.getBonusText(
      stat,
      STATS[stat].training,
      (this.upgradeLevels[stat] || 0) + 1,
    );
    // Reset to default quantity
    this.selectedQty = options.useNumericInputs ? Math.min(options.trainingQty || 1, TRAINING_MAX_QTY) : 1;
    const qtyInput = m.querySelector('.modal-qty-input');
    if (qtyInput) qtyInput.value = this.selectedQty;
    this.updateModalDetails();
    m.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  calculateTotalCost(config, qty, baseLevel) {
    if (qty <= 0) return 0;

    // Base parameters
    let currentBase = Number(config.cost);
    let currentInc = Number(config.costIncrease ?? config.cost);
    let currentMult = Number(config.costIncreaseMultiplier ?? 1);

    const thresholds = (config.costThresholds || []).slice().sort((a, b) => a.level - b.level);
    let totalCost = 0;
    let currentLevel = baseLevel;
    let remainingQty = qty;
    let tIdx = 0;
    // State variables
    let simLevel = 0;
    let simCost = Number(config.cost);
    let simInc = Number(config.costIncrease ?? config.cost);
    let simMult = Number(config.costIncreaseMultiplier ?? 1);

    // Helper to apply thresholds at a specific level
    const applyThresholds = (lvl) => {
      while (tIdx < thresholds.length && lvl >= thresholds[tIdx].level) {
        const t = thresholds[tIdx];
        if (t.cost !== undefined) simCost = Number(t.cost);
        if (t.costMultiplier !== undefined) simCost *= Number(t.costMultiplier);
        if (t.costIncrease !== undefined) simInc = Number(t.costIncrease);
        if (t.costIncreaseMultiplier !== undefined) simMult = Number(t.costIncreaseMultiplier);
        tIdx++;
      }
    };

    // 1. Fast-forward to baseLevel
    while (simLevel < baseLevel) {
      applyThresholds(simLevel);
      const nextT = tIdx < thresholds.length ? thresholds[tIdx].level : Infinity;
      const limit = Math.min(baseLevel, nextT);
      const count = limit - simLevel;

      if (count > 0) {
        if (Math.abs(simMult - 1) < 1e-9) {
          simCost += simInc * count;
        } else {

          simCost *= Math.pow(simMult, count);
          simInc *= Math.pow(simMult, count);
        }
        simLevel += count;
      }
    }

    // 2. Calculate cost for requested qty
    currentLevel = baseLevel;
    remainingQty = qty;

    while (remainingQty > 0) {
      applyThresholds(currentLevel);
      const nextT = tIdx < thresholds.length ? thresholds[tIdx].level : Infinity;
      const limit = Math.min(currentLevel + remainingQty, nextT);
      const count = limit - currentLevel;

      if (count > 0) {
        let segmentCost = 0;
        if (Math.abs(simMult - 1) < 1e-9) {
          segmentCost = calcLinearSum(0, count, simCost, simInc);
          simCost += simInc * count;
        } else {
          segmentCost = calcGeometricSum(0, count, simCost, simMult);

          const factor = Math.pow(simMult, count);
          simCost *= factor;
          simInc *= factor;
        }

        totalCost += segmentCost;
        currentLevel += count;
        remainingQty -= count;
      }

      if (!Number.isFinite(totalCost)) return Infinity;
    }

    const bonus = runes?.getBonusEffects?.() || {};
    const runeReduction = bonus.trainingCostReduction || 0;
    const ascRed = ascension?.getBonuses?.()?.trainingCostReduction || 0;
    const reduction = runeReduction + ascRed;
    return Math.floor(totalCost * (1 - reduction) + 1e-9);
  }

  getMaxPurchasable(selectedQty, baseLevel, maxLevel, config, availableGold = hero.gold) {
    const MAX_BULK = TRAINING_MAX_QTY;
    let safeMaxLevel = maxLevel === Infinity || !isFinite(maxLevel) ? baseLevel + MAX_BULK : maxLevel;
    let maxPossible = Math.min(safeMaxLevel - baseLevel, MAX_BULK);
    let targetQty = selectedQty === 'max' ? maxPossible : Math.min(selectedQty, maxPossible);

    if (targetQty <= 0) return { qty: 0, totalCost: 0 };

    // Reduction
    const bonus = runes?.getBonusEffects?.() || {};
    const runeReduction = bonus.trainingCostReduction || 0;
    const ascRed = ascension?.getBonuses?.()?.trainingCostReduction || 0;
    const reduction = runeReduction + ascRed;
    const budget = availableGold / (1 - reduction); // Effective budget before reduction

    // Simulation setup (same as calculateTotalCost)
    let simLevel = 0;
    let simCost = Number(config.cost);
    let simInc = Number(config.costIncrease ?? config.cost);
    let simMult = Number(config.costIncreaseMultiplier ?? 1);
    const thresholds = (config.costThresholds || []).slice().sort((a, b) => a.level - b.level);
    let tIdx = 0;

    const applyThresholds = (lvl) => {
      while (tIdx < thresholds.length && lvl >= thresholds[tIdx].level) {
        const t = thresholds[tIdx];
        if (t.cost !== undefined) simCost = Number(t.cost);
        if (t.costMultiplier !== undefined) simCost *= Number(t.costMultiplier);
        if (t.costIncrease !== undefined) simInc = Number(t.costIncrease);
        if (t.costIncreaseMultiplier !== undefined) simMult = Number(t.costIncreaseMultiplier);
        tIdx++;
      }
    };

    // 1. Fast-forward to baseLevel
    while (simLevel < baseLevel) {
      applyThresholds(simLevel);
      const nextT = tIdx < thresholds.length ? thresholds[tIdx].level : Infinity;
      const limit = Math.min(baseLevel, nextT);
      const count = limit - simLevel;
      if (count > 0) {
        if (Math.abs(simMult - 1) < 1e-9) {
          simCost += simInc * count;
        } else {
          const factor = Math.pow(simMult, count);
          simCost *= factor;
          simInc *= factor;
        }
        simLevel += count;
      }
    }

    // 2. Solve for max qty
    let currentLevel = baseLevel;
    let remainingBudget = budget;
    let totalPurchased = 0;
    let remainingTarget = targetQty;

    while (remainingTarget > 0 && remainingBudget > 0) {
      applyThresholds(currentLevel);
      const nextT = tIdx < thresholds.length ? thresholds[tIdx].level : Infinity;
      // Max we can buy in this segment based on level caps
      const segmentMax = Math.min(remainingTarget, nextT - currentLevel);

      if (segmentMax <= 0) break; // Should not happen if logic is correct

      let count = 0;
      let cost = 0;

      if (Math.abs(simMult - 1) < 1e-9) {
        // Linear
        // Check if we can afford the whole segment
        const segmentCost = calcLinearSum(0, segmentMax, simCost, simInc);
        if (segmentCost <= remainingBudget) {
          count = segmentMax;
          cost = segmentCost;
        } else {
          // Solve for partial
          count = solveLinear(0, remainingBudget, simCost, simInc);
          count = Math.min(count, segmentMax);
          cost = calcLinearSum(0, count, simCost, simInc);
        }
        // Update state
        simCost += simInc * count;
      } else {
        // Geometric
        const segmentCost = calcGeometricSum(0, segmentMax, simCost, simMult);
        if (segmentCost <= remainingBudget) {
          count = segmentMax;
          cost = segmentCost;
          // Update state
          const factor = Math.pow(simMult, count);
          simCost *= factor;
          simInc *= factor;
        } else {
          count = solveGeometric(0, remainingBudget, simCost, simMult);
          count = Math.min(count, segmentMax);
          cost = calcGeometricSum(0, count, simCost, simMult);
        }
      }

      totalPurchased += count;
      remainingBudget -= cost;
      currentLevel += count;
      remainingTarget -= count;

      if (count < segmentMax) break;
    }

    const finalCost = this.calculateTotalCost(config, totalPurchased, baseLevel);
    return { qty: totalPurchased, totalCost: finalCost };
  }

  updateModalDetails() {
    // Guard against missing currentStat
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const config = STATS[stat].training;
    if (!config) {
      this.closeModal();
      return;
    }
    const baseLevel = this.upgradeLevels[stat] || 0;
    const maxLevel = config?.maxLevel ?? Infinity;

    const levelsLeft = maxLevel - baseLevel;
    const { qty: affordableQty } = this.getMaxPurchasable('max', baseLevel, maxLevel, config);
    let qty =
      this.selectedQty === 'max'
        ? affordableQty > 0
          ? Math.min(affordableQty, TRAINING_MAX_QTY)
          : Math.min(1, levelsLeft)
        : Math.min(this.selectedQty, levelsLeft, TRAINING_MAX_QTY);
    const totalCost = this.calculateTotalCost(config, qty, baseLevel);
    const affordable = hero.gold >= totalCost && qty > 0 && qty <= affordableQty;

    // Compute total bonus gained
    const bonusValue = (config.bonus || 0) * qty;
    const decimals = getStatDecimalPlaces(stat);

    // --- Update ALL modal fields ---
    this.modal.querySelector('.modal-qty').innerHTML = formatNumber(qty);
    const totalCostEl = this.modal.querySelector('.modal-total-cost');
    totalCostEl.innerHTML = formatNumber(totalCost);
    totalCostEl.classList.toggle('unaffordable', !affordable);
    const totalBonusEl = this.modal.querySelector('.modal-total-bonus');
    totalBonusEl.innerHTML = `+${formatNumber(bonusValue.toFixed(decimals))} ${formatStatName(stat)}`;
    totalBonusEl.classList.toggle('unaffordable', !affordable);
    this.modal.querySelector('.modal-level').innerHTML = formatNumber(baseLevel);
    this.modal.querySelector('.modal-max-level').innerHTML = maxLevel === Infinity ? '∞' : formatNumber(maxLevel);
    this.modal.querySelector('.modal-bonus').innerHTML = this.getBonusText(stat, config, baseLevel);
    this.modal.querySelector('.modal-next-bonus').innerHTML = this.getBonusText(stat, config, baseLevel + 1);

    const slider = this.modal.querySelector('.modal-slider');
    if (slider) {
      const maxSliderVal = Math.min(levelsLeft, TRAINING_MAX_QTY, affordableQty);
      slider.max = Math.max(0, maxSliderVal);
      slider.disabled = maxSliderVal <= 0;
      if (maxSliderVal <= 0) {
        slider.value = 0;
      } else {
        const val =
          this.selectedQty === 'max'
            ? maxSliderVal
            : Math.min(this.selectedQty, maxSliderVal);
        slider.value = val;
      }
    }
    const input = this.modal.querySelector('.modal-qty-input');
    if (input && this.selectedQty !== 'max') input.value = this.selectedQty;

    // Enable/disable Buy button based on quantity and affordability
    const buyBtn = this.modal.querySelector('.modal-buy');
    buyBtn.disabled = !affordable || baseLevel >= maxLevel;
  }

  updateTrainingUI(subTab) {
    const trainingGrid = document.querySelector(`#${subTab} .training-grid`);
    if (!trainingGrid) return;
    const section = SECTION_DEFS.find((s) => s.key === this.activeSection);
    trainingGrid.innerHTML = Object.entries(STATS)
      .filter(([stat, config]) => config.training && section.stats.includes(stat))
      .map(([stat, config]) => this.createUpgradeButton(stat, config))
      .join('');
    // Elemental allocation button removed from training subtab — the control is now available only in the Stats tab.
    // (Button kept in `statsAndAttributesUi.js`.)
    if (options?.bulkBuy) this.updateBulkCost();
  }

  updateTrainingAffordability(subTab) {
    const trainingGrid = document.querySelector(`#${subTab} .training-grid`);
    if (!trainingGrid) return;
    trainingGrid.querySelectorAll('button[data-stat]').forEach((button) => {
      const stat = button.dataset.stat;
      const config = STATS[stat];
      if (!config?.training) return;
      const level = this.upgradeLevels[stat] || 0;
      const maxLevel = config.training?.maxLevel ?? Infinity;
      const isMaxed = level >= maxLevel;
      let disabled = isMaxed;
      let qty = 1;
      let totalCost = this.calculateTotalCost(config.training, qty, level);
      let unaffordable = hero.gold < totalCost;

      if (options?.quickBuy && !isMaxed) {
        const levelsLeft = maxLevel - level;
        if (this.quickQty === 'max') {
          const { qty: affordableQty } = this.getMaxPurchasable('max', level, maxLevel, config.training);
          qty = affordableQty > 0 ? Math.min(affordableQty, TRAINING_MAX_QTY) : Math.min(1, levelsLeft);
          totalCost = this.calculateTotalCost(config.training, qty, level);
          if (affordableQty <= 0) disabled = true;
        } else {
          qty = Math.min(this.quickQty, levelsLeft, TRAINING_MAX_QTY);
          totalCost = this.calculateTotalCost(config.training, qty, level);
          if (qty <= 0) disabled = true;
        }
        unaffordable = hero.gold < totalCost;
        disabled = disabled || unaffordable;
        const costEl = button.querySelector('.upgrade-cost');
        if (costEl) {
          costEl.textContent = `${t('training.cost')}: ${formatNumber(totalCost)} ${t('resource.gold.name')} (${formatNumber(qty)})`;
          costEl.classList.toggle('unaffordable', unaffordable);
        }
        const bonusEl = button.querySelector('.upgrade-bonus');
        if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
      } else {
        unaffordable = hero.gold < totalCost;
        disabled = disabled || unaffordable;
        const bonusEl = button.querySelector('.upgrade-bonus');
        if (bonusEl) bonusEl.classList.toggle('unaffordable', unaffordable);
        const costEl = button.querySelector('.upgrade-cost');
        if (costEl) costEl.classList.toggle('unaffordable', unaffordable);
      }

      button.disabled = disabled;
    });
    if (options?.bulkBuy) this.updateBulkCost();
  }

  calculateBulkCostAndPurchases(qty) {
    const section = SECTION_DEFS.find((s) => s.key === this.activeSection);
    if (qty !== 'max') qty = Math.min(qty, TRAINING_MAX_QTY);
    let totalCost = 0;
    const purchases = [];

    // Collect eligible stats in the active section
    const eligible = section.stats
      .map((stat) => ({ stat, config: STATS[stat].training }))
      .filter((x) => !!x.config)
      .map(({ stat, config }) => {
        const level = this.upgradeLevels[stat] || 0;
        const maxLevel = config?.maxLevel ?? Infinity;
        const levelsLeft = maxLevel - level;
        return {
          stat, config, level, maxLevel, levelsLeft,
        };
      })
      .filter(({ levelsLeft }) => levelsLeft > 0);

    if (eligible.length === 0) return {
      totalCost: 0, purchases: [], affordable: true,
    };

    if (qty === 'max') {
      // Divide available gold into equal chunks across eligible stats
      const perChunk = Math.floor((hero.gold || 0) / eligible.length);
      if (perChunk <= 0) return {
        totalCost: 0, purchases: [], affordable: false,
      };
      eligible.forEach(({
        stat, config, level, maxLevel,
      }) => {
        const res = this.getMaxPurchasable('max', level, maxLevel, config, perChunk);
        if (res.qty > 0 && res.totalCost > 0) {
          totalCost += res.totalCost;
          purchases.push({
            stat, qty: res.qty, cost: res.totalCost,
          });
        }
      });
    } else {
      // Fixed quantity per stat
      eligible.forEach(({
        stat, config, level, levelsLeft,
      }) => {
        const qtyToBuy = Math.min(qty, levelsLeft);
        if (qtyToBuy <= 0) return;
        const cost = this.calculateTotalCost(config, qtyToBuy, level);
        if (cost > 0) {
          totalCost += cost;
          purchases.push({
            stat, qty: qtyToBuy, cost,
          });
        }
      });
    }

    const affordable = (hero.gold || 0) >= totalCost && totalCost > 0;
    return {
      totalCost, purchases, affordable,
    };
  }

  updateBulkCost() {
    if (!this.bulkCostEl || !this.bulkBuyBtn) return;
    const { totalCost, affordable } = this.calculateBulkCostAndPurchases(this.quickQty);
    this.bulkCostEl.textContent = `${t('training.cost')}: ${formatNumber(totalCost)} ${t('resource.gold.name')}`;
    this.bulkCostEl.classList.toggle('unaffordable', !affordable);
    this.bulkBuyBtn.disabled = totalCost === 0 || !affordable;
  }

  bulkBuySection() {
    const {
      totalCost, purchases, affordable,
    } = this.calculateBulkCostAndPurchases(this.quickQty);
    if (purchases.length === 0) return;
    if (!affordable) {
      showToast(t('training.notEnoughGoldBulk'), 'error');
      return;
    }
    hero.gold -= totalCost;
    this.goldSpent += totalCost;
    purchases.forEach((p) => {
      this.upgradeLevels[p.stat] += p.qty;
    });
    showToast(t('training.bulkPurchaseSuccess'));
    this.updateTrainingUI('gold-upgrades');
    hero.queueRecalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    dataManager.saveGame();
  }

  createUpgradeButton(stat, config) {
    const level = this.upgradeLevels[stat] || 0;
    const maxLevel = config.training?.maxLevel ?? Infinity;
    const isMaxed = level >= maxLevel;
    let bonus = this.getBonusText(stat, config.training, level);
    let disabled = isMaxed;
    let costLine = '';
    let bonusClass = '';

    if (options?.quickBuy && !isMaxed) {
      const levelsLeft = maxLevel - level;
      let desiredQty;
      let totalCost;
      if (this.quickQty === 'max') {
        const { qty: affordableQty } = this.getMaxPurchasable('max', level, maxLevel, config.training);
        desiredQty = affordableQty > 0 ? Math.min(affordableQty, TRAINING_MAX_QTY) : Math.min(1, levelsLeft);
        totalCost = this.calculateTotalCost(config.training, desiredQty, level);
        if (affordableQty <= 0) disabled = true;
        if (hero.gold < totalCost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      } else {
        desiredQty = Math.min(this.quickQty, levelsLeft, TRAINING_MAX_QTY);
        totalCost = this.calculateTotalCost(config.training, desiredQty, level);
        if (desiredQty <= 0 || hero.gold < totalCost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      }
      costLine = `<span class="upgrade-cost ${bonusClass}">${t('training.cost')}: ${formatNumber(totalCost)} ${t('resource.gold.name')} (${formatNumber(desiredQty)})</span>`;
    } else if ((hero?.gold || 0) < this.calculateTotalCost(config.training, 1, level)) {
      bonusClass = 'unaffordable';
    }

    return html`
      <button data-stat="${stat}" ${disabled ? ' disabled' : ''}>
        <span class="upgrade-name"
          >${formatStatName(stat)} (${t('common.lvl')}
          ${formatNumber(level)}${isMaxed ? ' / ' + t('common.max') : ''})</span
        >
        <span class="upgrade-bonus ${bonusClass}"
          >${bonus}${isMaxed ? ' <strong>' + t('common.max') + '</strong>' : ''}</span
        >
        ${costLine}
      </button>
    `;
  }
  getBonusText(stat, config, level) {
    const value = config.bonus * level;
    const decimals = getStatDecimalPlaces(stat);
    const formattedValue = formatNumber(value.toFixed(decimals));
    return `+${formattedValue}${config.suffix || ''} ${formatStatName(stat)}`;
  }

  getTrainingBonuses() {
    // Ensure training bonuses are up-to-date
    this.updateTrainingBonuses();
    return this.trainingBonuses;
  }

  updateTrainingBonuses() {
    // Reset equipment bonuses
    Object.keys(this.trainingBonuses).forEach((stat) => {
      this.trainingBonuses[stat] = 0;
    });

    // Only calculate bonuses for upgrades defined in UPGRADE_CONFIG
    Object.keys(STATS).forEach((upg) => {
      const trainingConfig = STATS[upg]?.training;
      if (
        this.trainingBonuses[upg] !== undefined &&
        this.upgradeLevels[upg] !== undefined &&
        trainingConfig &&
        typeof trainingConfig.bonus === 'number'
      ) {
        this.trainingBonuses[upg] += this.upgradeLevels[upg] * trainingConfig.bonus;
      }
    });
    this._applyElementalTrainingDistribution();
    this.updateElementalDistributionUI();
  }

  _ensureElementalDistributionStructure() {
    if (!this.elementalDistribution || typeof this.elementalDistribution !== 'object') {
      this.elementalDistribution = {};
    }
    if (this.upgradeLevels.elementalDamage === undefined) {
      this.upgradeLevels.elementalDamage = 0;
    }
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      const value = Number(this.elementalDistribution[stat]);
      const sanitized = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
      this.elementalDistribution[stat] = sanitized;
      if (this.trainingBonuses[stat] === undefined) {
        this.trainingBonuses[stat] = 0;
      }
    });
  }

  _migrateLegacyElementalTraining(hadSavedDistribution) {
    let totalLegacy = 0;
    const legacyLevels = {};
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      const lvl = Number(this.upgradeLevels[stat] || 0);
      if (lvl > 0) {
        legacyLevels[stat] = lvl;
        totalLegacy += lvl;
      }
      delete this.upgradeLevels[stat];
    });
    if (totalLegacy > 0) {
      this.upgradeLevels.elementalDamage = (this.upgradeLevels.elementalDamage || 0) + totalLegacy;
      if (!hadSavedDistribution) {
        this.elementalDistribution = {};
        ELEMENTAL_TRAINING_STATS.forEach((stat) => {
          if (legacyLevels[stat]) {
            this.elementalDistribution[stat] = (legacyLevels[stat] / totalLegacy) * 100;
          }
        });
      }
    }
  }

  _getElementalTrainingTotal() {
    const config = STATS.elementalDamage?.training;
    if (!config || typeof config.bonus !== 'number') return 0;
    return (this.upgradeLevels.elementalDamage || 0) * config.bonus;
  }

  _getElementalIntelligenceTotal() {
    if (hero?.attributeElementalDamageFromIntelligence === undefined) return 0;
    const value = Number(hero.attributeElementalDamageFromIntelligence);
    return Number.isFinite(value) ? value : 0;
  }

  _getElementalResourceExtraTotal() {
    if (hero?.elementalDamageFromResources === undefined) return 0;
    const value = Number(hero.elementalDamageFromResources);
    return Number.isFinite(value) ? value : 0;
  }

  _getPhysicalResourceExtraTotal() {
    if (hero?.physicalDamageFromResources === undefined) return 0;
    const value = Number(hero.physicalDamageFromResources);
    return Number.isFinite(value) ? value : 0;
  }

  _getTotalResourceExtraDamage() {
    const total = Number(hero?.totalExtraDamageFromResources);
    if (Number.isFinite(total)) return total;
    return this._getElementalResourceExtraTotal() + this._getPhysicalResourceExtraTotal();
  }

  _getElementalDistributionShares() {
    const shares = {};
    let total = 0;
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      const raw = Number(this.elementalDistribution[stat]);
      if (Number.isFinite(raw) && raw > 0) {
        shares[stat] = raw;
        total += raw;
      } else {
        shares[stat] = 0;
      }
    });
    if (total <= 0) {
      const equal = 1 / ELEMENTAL_TRAINING_STATS.length;
      ELEMENTAL_TRAINING_STATS.forEach((stat) => {
        shares[stat] = equal;
      });
      return shares;
    }
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      shares[stat] = shares[stat] / total;
    });
    return shares;
  }

  getElementalDistributionShares() {
    const shares = this._getElementalDistributionShares();
    return { ...shares };
  }

  _applyElementalTrainingDistribution() {
    if (this.trainingBonuses.elementalDamage === undefined) return;
    const total = this._getElementalTrainingTotal();
    const shares = this._getElementalDistributionShares();
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      this.trainingBonuses[stat] = total * (shares[stat] || 0);
    });
    this.trainingBonuses.elementalDamage = 0;
  }

  openElementalDistributionModal() {
    if (!this.elementalModal || typeof this.elementalModal.querySelector !== 'function') {
      const rowsMarkup = ELEMENTAL_TRAINING_STATS.map(
        (stat) => `
          <div class="elemental-distribution-row" data-stat="${stat}">
            <div class="elemental-row-header">
              <span class="elemental-label">${formatStatName(stat)}</span>
              <span class="elemental-share"></span>
            </div>
            <input type="range" min="0" max="100" step="1" />
            <div class="elemental-row-footer">
              <span class="elemental-allocation"></span>
            </div>
          </div>
        `,
      ).join('');
      const content = html`
        <div class="elemental-distribution-modal-content">
          <button class="modal-close">&times;</button>
          <h2 data-i18n="training.elementalDistributionTitle">${t('training.elementalDistributionTitle')}</h2>
          <p class="elemental-distribution-description" data-i18n="training.elementalDistributionDescription">
            ${t('training.elementalDistributionDescription')}
          </p>
          <div class="elemental-distribution-row elemental-distribution-resource-split" data-stat="damage">
            <div class="elemental-row-header">
              <span class="elemental-label" data-i18n="training.elementalDistributionResourcePhysicalLabel">
                ${t('training.elementalDistributionResourcePhysicalLabel')}
              </span>
              <span class="elemental-share resource-physical-share"></span>
            </div>
            <input class="resource-physical-slider" type="range" min="0" max="100" step="1" />
            <div class="elemental-row-footer">
              <span class="elemental-allocation resource-physical-amount"></span>
            </div>
          </div>
          <div class="elemental-distribution-totals">
            <p class="elemental-total" data-i18n="training.elementalDistributionTrainingTotal">
              ${tp('training.elementalDistributionTrainingTotal', { amount: formatNumber(0) })}
            </p>
            <p class="elemental-intelligence-total" data-i18n="training.elementalDistributionIntelligenceTotal">
              ${tp('training.elementalDistributionIntelligenceTotal', { amount: formatNumber(0) })}
            </p>
            <p class="elemental-extra-total" data-i18n="training.elementalDistributionResourceElementalTotal">
              ${tp('training.elementalDistributionResourceElementalTotal', { amount: formatNumber(0) })}
            </p>
            <p class="physical-extra-total" data-i18n="training.elementalDistributionResourcePhysicalTotal">
              ${tp('training.elementalDistributionResourcePhysicalTotal', { amount: formatNumber(0) })}
            </p>
          </div>
          <div class="elemental-distribution-rows">${rowsMarkup}</div>
          <div class="elemental-distribution-actions">
            <button class="elemental-distribution-even" data-i18n="training.elementalDistributionReset">
              ${t('training.elementalDistributionReset')}
            </button>
          </div>
        </div>
      `;
      this.elementalModal = createModal({
        id: 'elemental-distribution-modal',
        className: 'elemental-distribution-modal hidden',
        content,
      });
      const resetBtn = this.elementalModal.querySelector('.elemental-distribution-even');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.resetElementalDistribution();
        });
      }
      this.elementalModal.querySelectorAll('.elemental-distribution-row input[type="range"]').forEach((input) => {
        const row = input.closest('.elemental-distribution-row');
        const stat = row?.dataset.stat;
        input.addEventListener('input', () => {
          if (!stat) return;
          if (stat === 'damage') {
            this.resourceExtraDamagePhysicalSharePercent = Number(input.value);
            this._ensureResourceExtraDamageSplitStructure();
          } else {
            this.elementalDistribution[stat] = Number(input.value);
          }
          this.updateTrainingBonuses();
          hero?.queueRecalculateFromAttributes?.();
          dataManager.saveGame();
          this.updateElementalDistributionUI();
        });
      });
    }
    this.updateElementalDistributionUI();
    if (this.elementalModal) {
      this.elementalModal.classList.remove('hidden');
    }
  }

  updateElementalDistributionUI() {
    const modal = this.elementalModal;
    if (!modal || typeof modal.querySelector !== 'function') return;
    const trainingTotal = this._getElementalTrainingTotal();
    const intelligenceTotal = this._getElementalIntelligenceTotal();
    const totalResourceExtra = this._getTotalResourceExtraDamage();
    const resourcePhysicalShare = this.getResourceExtraDamagePhysicalShare();
    const resourcePhysicalTotal = totalResourceExtra * resourcePhysicalShare;
    const resourceElementalTotal = totalResourceExtra - resourcePhysicalTotal;
    const combinedTotal = trainingTotal + intelligenceTotal + resourceElementalTotal;
    const shares = this._getElementalDistributionShares();
    const totalEl = modal.querySelector('.elemental-total');
    if (totalEl) {
      totalEl.textContent = tp('training.elementalDistributionTrainingTotal', { amount: formatNumber(Number(trainingTotal.toFixed(2))) });
    }
    const intelligenceEl = modal.querySelector('.elemental-intelligence-total');
    if (intelligenceEl) {
      intelligenceEl.textContent = tp('training.elementalDistributionIntelligenceTotal', { amount: formatNumber(Number(intelligenceTotal.toFixed(2))) });
    }
    const resourceEl = modal.querySelector('.elemental-extra-total');
    if (resourceEl) {
      resourceEl.textContent = tp('training.elementalDistributionResourceElementalTotal', { amount: formatNumber(Number(resourceElementalTotal.toFixed(2))) });
    }

    const physicalEl = modal.querySelector('.physical-extra-total');
    if (physicalEl) {
      physicalEl.textContent = tp('training.elementalDistributionResourcePhysicalTotal', { amount: formatNumber(Number(resourcePhysicalTotal.toFixed(2))) });
    }

    const physicalSlider = modal.querySelector('.resource-physical-slider');
    if (physicalSlider) {
      physicalSlider.value = String(Number(this.resourceExtraDamagePhysicalSharePercent || 0));
    }
    const physicalShareEl = modal.querySelector('.resource-physical-share');
    if (physicalShareEl) {
      physicalShareEl.textContent = tp('training.elementalDistributionShare', { percent: formatNumber(Number(this.resourceExtraDamagePhysicalSharePercent || 0).toFixed(1)) });
    }
    const physicalAmountEl = modal.querySelector('.resource-physical-amount');
    if (physicalAmountEl) {
      const allocation = totalResourceExtra * resourcePhysicalShare;
      physicalAmountEl.textContent = tp('training.elementalDistributionAmount', { amount: formatNumber(Number(allocation.toFixed(2))) });
    }

    modal.querySelectorAll('.elemental-distribution-row').forEach((row) => {
      const stat = row.dataset.stat;
      if (stat === 'damage') return;
      const slider = row.querySelector('input[type="range"]');
      const shareEl = row.querySelector('.elemental-share');
      const amountEl = row.querySelector('.elemental-allocation');
      const weight = Number(this.elementalDistribution[stat]) || 0;
      if (slider) slider.value = weight;
      if (shareEl) {
        const sharePercent = (shares[stat] || 0) * 100;
        shareEl.textContent = tp('training.elementalDistributionShare', { percent: formatNumber(sharePercent.toFixed(1)) });
      }
      if (amountEl) {
        const decimals = getStatDecimalPlaces(stat);
        const displayDecimals = decimals > 0 ? decimals : 2;
        const allocation = combinedTotal * (shares[stat] || 0);
        amountEl.textContent = tp('training.elementalDistributionAmount', { amount: formatNumber(Number(allocation.toFixed(displayDecimals))) });
      }
    });
  }

  resetElementalDistribution() {
    ELEMENTAL_TRAINING_STATS.forEach((stat) => {
      this.elementalDistribution[stat] = 0;
    });
    this.updateTrainingBonuses();
    hero?.queueRecalculateFromAttributes?.();
    dataManager.saveGame();
    this.updateElementalDistributionUI();
  }

  buyBulk(stat, qty) {
    const currency = 'gold';
    let count = 0;
    const config = STATS[stat].training;
    const maxLevel = config?.maxLevel ?? Infinity;
    let currentLevel = this.upgradeLevels[stat] || 0;
    let gold = hero[currency];
    let levelsToBuy = 0;
    let totalCost = 0;
    const levelsLeft = maxLevel - currentLevel;

    if (qty === 'max') {
      ({ qty: levelsToBuy, totalCost } = this.getMaxPurchasable(qty, currentLevel, maxLevel, config));
    } else {
      qty = Math.min(qty, TRAINING_MAX_QTY);
      const desiredLevels = Math.min(qty, levelsLeft);
      ({ qty: levelsToBuy, totalCost } = this.getMaxPurchasable(
        'max',
        currentLevel,
        currentLevel + desiredLevels,
        config,
        gold,
      ));
    }

    if (levelsToBuy > 0) {
      hero[currency] -= totalCost;
      this.goldSpent += totalCost;
      this.upgradeLevels[stat] += levelsToBuy;
      count = levelsToBuy;
      showToast(tp('training.upgraded', { stat: formatStatName(stat), count: formatNumber(count) }));
    } else {
      showToast(tp('training.notEnoughGold', { stat: formatStatName(stat) }), 'error');
    }
    this.updateTrainingUI('gold-upgrades');
    hero.queueRecalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    dataManager.saveGame();

    // Update modal details live
    if (this.modal && !this.modal.classList.contains('hidden') && this.currentStat === stat) {
      this.updateModalDetails();
    }
  }
}
