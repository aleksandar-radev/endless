import { formatStatName, updateResources, formatNumber } from './ui/ui.js';

import { showToast } from './ui/ui.js';
import { hero, dataManager, options } from './globals.js';
import { handleSavedData } from './functions.js';
import { STATS } from './constants/stats/stats.js';
import { createModal } from './ui/modal.js';
import { MISC_STATS } from './constants/stats/miscStats.js';
import { OFFENSE_STATS } from './constants/stats/offenseStats.js';
import { DEFENSE_STATS } from './constants/stats/defenseStats.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';

const html = String.raw;

const SECTION_DEFS = [
  { key: 'offense', label: 'Offense', stats: Object.keys(OFFENSE_STATS) },
  { key: 'defense', label: 'Defense', stats: Object.keys(DEFENSE_STATS) },
  { key: 'misc', label: 'Misc', stats: Object.keys(MISC_STATS) },
];

export default class Training {
  constructor(savedData = null) {
    this.upgradeLevels = {};
    this.trainingBonuses = {};
    Object.entries(STATS).forEach(([stat, config]) => {
      if (config.training) {
        this.upgradeLevels[stat] = 0;
        this.trainingBonuses[stat] = 0;
      }
    });

    handleSavedData(savedData, this);
    this.activeSection = SECTION_DEFS[0].key;
    this.quickQty = 1;
    this.initializeTrainingUI();
  }

  reset() {
    Object.keys(this.upgradeLevels).forEach((stat) => {
      this.upgradeLevels[stat] = 0;
    });
    Object.keys(this.trainingBonuses).forEach((stat) => {
      this.trainingBonuses[stat] = 0;
    });
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
      <button class="training-section-btn${this.activeSection === sec.key ? ' active' : ''}" data-section="${
  sec.key
}">${sec.label}</button>
    `,
    ).join('');
    if (options?.quickTraining) {
      const qtyControls = document.createElement('div');
      qtyControls.className = 'training-qty-controls';
      qtyControls.innerHTML = `
        <button data-qty="1" class="${this.quickQty === 1 ? 'active' : ''}">1</button>
        <button data-qty="10" class="${this.quickQty === 10 ? 'active' : ''}">10</button>
        <button data-qty="50" class="${this.quickQty === 50 ? 'active' : ''}">50</button>
        <button data-qty="max" class="${this.quickQty === 'max' ? 'active' : ''}">Max</button>
      `;
      nav.appendChild(qtyControls);
      qtyControls.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          this.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.updateTrainingUI('gold-upgrades');
        };
      });
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
      const content = html`
        <div class="training-modal-content">
          <button class="modal-close">&times;</button>
          <h2 class="modal-title"></h2>
          <p>Current Level: <span class="modal-level"></span>/<span class="modal-max-level"></span></p>
          <p>Current Bonus: <span class="modal-bonus"></span></p>
          <p>Next Level Bonus: <span class="modal-next-bonus"></span></p>
          <p>Total Bonus: <span class="modal-total-bonus"></span></p>
          <p>Total Cost: <span class="modal-total-cost"></span> Gold (<span class="modal-qty">1</span>)</p>
          <div class="modal-controls">
            <button data-qty="1">+1</button>
            <button data-qty="10">+10</button>
            <button data-qty="50">+50</button>
            <button data-qty="max">Max</button>
          </div>
          <input type="range" class="modal-slider" min="0" max="1" value="1" step="1" />
          <button class="modal-buy">Buy</button>
        </div>
      `;
      // Use shared modal helper
      this.modal = createModal({
        id: 'training-modal',
        className: 'training-modal hidden',
        content,
        onClose: () => this.closeModal(),
      });
      // Attach quantity buttons
      this.modal.querySelectorAll('.modal-controls button').forEach((btn) => {
        btn.onclick = () => {
          this.selectedQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          this.updateModalDetails();
        };
      });
      // Slider input
      const slider = this.modal.querySelector('.modal-slider');
      slider.addEventListener('input', (e) => {
        this.selectedQty = parseInt(e.target.value, 10) || 0;
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
      if (options?.quickTraining) {
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
    m.querySelector('.modal-title').textContent = formatStatName(stat);
    m.querySelector('.modal-level').textContent = formatNumber(this.upgradeLevels[stat] || 0);
    m.querySelector('.modal-max-level').textContent =
      trainingConfig?.maxLevel === Infinity ? '∞' : formatNumber(trainingConfig.maxLevel);
    m.querySelector('.modal-bonus').textContent = this.getBonusText(
      stat,
      STATS[stat].training,
      this.upgradeLevels[stat] || 0,
    );
    m.querySelector('.modal-next-bonus').textContent = this.getBonusText(
      stat,
      STATS[stat].training,
      (this.upgradeLevels[stat] || 0) + 1,
    );
    // Reset to default quantity
    this.selectedQty = 1;
    this.updateModalDetails();
    m.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  calculateTotalCost(config, qty, baseLevel) {
    let cost = Number(config.cost);
    let increase = Number(config.costIncrease ?? config.cost);
    let rate = Number(config.costIncreaseMultiplier ?? 1);
    const thresholds = (config.costThresholds || []).slice().sort((a, b) => a.level - b.level);
    let idx = 0;

    const applyThresholds = (level) => {
      while (idx < thresholds.length && level >= thresholds[idx].level) {
        const t = thresholds[idx];
        if (t.cost !== undefined) cost = Number(t.cost);
        if (t.costMultiplier !== undefined) cost *= Number(t.costMultiplier);
        if (t.costIncrease !== undefined) increase = Number(t.costIncrease);
        if (t.costIncreaseMultiplier !== undefined) rate = Number(t.costIncreaseMultiplier);
        idx++;
      }
    };

    applyThresholds(0);
    for (let lvl = 0; lvl < baseLevel; lvl++) {
      cost += increase;
      increase *= rate;
      applyThresholds(lvl + 1);
    }

    let total = 0;
    for (let i = 0; i < qty; i++) {
      if (!isFinite(cost)) return Infinity;
      total += cost;
      cost += increase;
      increase *= rate;
      baseLevel++;
      applyThresholds(baseLevel);
    }
    return Math.floor(total);
  }

  getMaxPurchasable(selectedQty, baseLevel, maxLevel, config) {
    // Limit max upgrades per call to 100,000
    const MAX_BULK = 100000;
    let safeMaxLevel = maxLevel === Infinity || !isFinite(maxLevel) ? baseLevel + MAX_BULK : maxLevel;
    let maxPossible = Math.min(safeMaxLevel - baseLevel, MAX_BULK);
    let qty = selectedQty === 'max' ? 0 : selectedQty;
    let totalCost = 0;

    if (selectedQty === 'max') {
      let gold = hero.gold;
      let low = 0;
      let high = maxPossible;
      let best = 0;
      while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let cost = this.calculateTotalCost(config, mid, baseLevel);
        if (!isFinite(cost)) {
          high = mid - 1;
          continue;
        }
        if (cost <= gold) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      qty = best;
      totalCost = this.calculateTotalCost(config, qty, baseLevel);
    } else {
      qty = Math.min(qty, maxPossible);
      totalCost = this.calculateTotalCost(config, qty, baseLevel);
    }

    return { qty, totalCost };
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
          ? affordableQty
          : Math.min(1, levelsLeft)
        : Math.min(this.selectedQty, levelsLeft);
    const totalCost = this.calculateTotalCost(config, qty, baseLevel);
    const affordable = hero.gold >= totalCost && qty > 0 && qty <= affordableQty;

    // Compute total bonus gained
    const bonusValue = (config.bonus || 0) * qty;
    const decimals = STATS[stat].decimalPlaces || 0;

    // --- Update ALL modal fields ---
    this.modal.querySelector('.modal-qty').textContent = formatNumber(qty);
    const totalCostEl = this.modal.querySelector('.modal-total-cost');
    totalCostEl.textContent = formatNumber(totalCost);
    totalCostEl.classList.toggle('unaffordable', !affordable);
    const totalBonusEl = this.modal.querySelector('.modal-total-bonus');
    totalBonusEl.textContent = `+${formatNumber(bonusValue.toFixed(decimals))} ${formatStatName(stat)}`;
    totalBonusEl.classList.toggle('unaffordable', !affordable);
    this.modal.querySelector('.modal-level').textContent = formatNumber(baseLevel);
    this.modal.querySelector('.modal-max-level').textContent = maxLevel === Infinity ? '∞' : formatNumber(maxLevel);
    this.modal.querySelector('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
    this.modal.querySelector('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);

    const slider = this.modal.querySelector('.modal-slider');
    if (slider) {
      slider.max = levelsLeft;
      slider.value = this.selectedQty === 'max' ? levelsLeft : Math.min(this.selectedQty, levelsLeft);
    }

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
  }

  createUpgradeButton(stat, config) {
    const level = this.upgradeLevels[stat] || 0;
    const maxLevel = config.training?.maxLevel ?? Infinity;
    const isMaxed = level >= maxLevel;
    let bonus = this.getBonusText(stat, config.training, level);
    let disabled = isMaxed;
    let costLine = '';
    let bonusClass = '';

    if (options?.quickTraining && !isMaxed) {
      const levelsLeft = maxLevel - level;
      let desiredQty;
      let totalCost;
      if (this.quickQty === 'max') {
        const { qty: affordableQty } = this.getMaxPurchasable('max', level, maxLevel, config.training);
        desiredQty = affordableQty > 0 ? affordableQty : Math.min(1, levelsLeft);
        totalCost = this.calculateTotalCost(config.training, desiredQty, level);
        if (affordableQty <= 0) disabled = true;
        if (hero.gold < totalCost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      } else {
        desiredQty = Math.min(this.quickQty, levelsLeft);
        totalCost = this.calculateTotalCost(config.training, desiredQty, level);
        if (desiredQty <= 0 || hero.gold < totalCost) {
          disabled = true;
          bonusClass = 'unaffordable';
        }
      }
      costLine = `<span class="upgrade-cost ${bonusClass}">Cost: ${formatNumber(totalCost)} Gold (${formatNumber(desiredQty)})</span>`;
    } else if ((hero?.gold || 0) < this.calculateTotalCost(config.training, 1, level)) {
      bonusClass = 'unaffordable';
    }

    return html`
      <button data-stat="${stat}" ${disabled ? ' disabled' : ''}>
        <span class="upgrade-name">${formatStatName(stat)} (Lvl ${formatNumber(level)}${isMaxed ? ' / Max' : ''})</span>
        <span class="upgrade-bonus ${bonusClass}">${bonus}${isMaxed ? ' <strong>Max</strong>' : ''}</span>
        ${costLine}
      </button>
    `;
  }
  getBonusText(stat, config, level) {
    const value = config.bonus * level;
    const decimals = STATS[stat].decimalPlaces || 0;
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
      if (this.trainingBonuses[upg] !== undefined && this.upgradeLevels[upg] !== undefined) {
        this.trainingBonuses[upg] += this.upgradeLevels[upg] * STATS[upg].training?.bonus;
      }
    });
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
      levelsToBuy = Math.min(qty, levelsLeft);
      // Calculate total cost for levelsToBuy upgrades
      totalCost = this.calculateTotalCost(config, levelsToBuy, currentLevel);
      if (totalCost > gold) {
        // If not enough gold for all, reduce levelsToBuy
        // Find max affordable
        let affordable = 0;
        for (let i = 1; i <= levelsToBuy; i++) {
          let cost = this.calculateTotalCost(config, i, currentLevel);
          if (cost > gold) break;
          affordable = i;
        }
        levelsToBuy = affordable;
        totalCost = this.calculateTotalCost(config, levelsToBuy, currentLevel);
      }
    }

    if (levelsToBuy > 0) {
      hero[currency] -= totalCost;
      this.upgradeLevels[stat] += levelsToBuy;
      count = levelsToBuy;
      showToast(`Upgraded ${formatStatName(stat)} by ${count} levels!`);
    } else {
      showToast(`Not enough gold to upgrade ${formatStatName(stat)}!`, 'error');
    }
    this.updateTrainingUI('gold-upgrades');
    hero.recalculateFromAttributes();
    updateStatsAndAttributesUI();
    updateResources();
    dataManager.saveGame();

    // Update modal details live
    if (this.modal && !this.modal.classList.contains('hidden') && this.currentStat === stat) {
      this.updateModalDetails();
    }
  }
}
