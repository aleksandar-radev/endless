import { formatStatName, updateResources } from './ui/ui.js';

import { showToast } from './ui/ui.js';
import { hero, dataManager } from './globals.js';
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
    `
    ).join('');
    nav.querySelectorAll('button[data-section]').forEach((btn) => {
      btn.onclick = () => {
        this.activeSection = btn.dataset.section;
        this.updateTrainingUI('gold-upgrades');
        nav.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
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
      // Buy button
      this.modal.querySelector('.modal-buy').onclick = () => this.buyBulk(this.currentStat, this.selectedQty);
    }
  }

  attachGridListeners(grid) {
    grid.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-stat]');
      if (button) {
        const stat = button.dataset.stat;
        this.openModal(stat);
      }
    });
  }

  openModal(stat) {
    const trainingConfig = STATS[stat].training;
    if (!trainingConfig) return;
    this.currentStat = stat;
    // Set title and base info
    const m = this.modal;
    m.querySelector('.modal-title').textContent = formatStatName(stat);
    m.querySelector('.modal-level').textContent = this.upgradeLevels[stat] || 0;
    m.querySelector('.modal-max-level').textContent =
      trainingConfig?.maxLevel === Infinity ? '∞' : trainingConfig.maxLevel;
    m.querySelector('.modal-bonus').textContent = this.getBonusText(
      stat,
      STATS[stat].training,
      this.upgradeLevels[stat] || 0
    );
    m.querySelector('.modal-next-bonus').textContent = this.getBonusText(
      stat,
      STATS[stat].training,
      (this.upgradeLevels[stat] || 0) + 1
    );
    // Reset to default quantity
    this.selectedQty = 1;
    this.updateModalDetails();
    m.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  updateModalDetails() {
    // Guard against missing currentStat
    if (!this.currentStat) return;
    const stat = this.currentStat;
    const trainingConfig = STATS[stat].training;
    if (!trainingConfig) {
      this.closeModal();
      return;
    }
    const config = trainingConfig;
    const baseLevel = this.upgradeLevels[stat] || 0;
    const goldAvailable = hero.gold;
    const maxLevel = config?.maxLevel ?? Infinity;
    // Determine numeric qty
    let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
    let totalCost = 0;
    let maxPossible = maxLevel - baseLevel;

    // If max, compute max purchasable without mutating state
    if (this.selectedQty === 'max') {
      let lvl = baseLevel;
      let gold = goldAvailable;
      while (lvl < maxLevel) {
        const cost = config.cost * (lvl + 1);
        if (gold < cost) break;
        gold -= cost;
        totalCost += cost;
        lvl++;
        qty++;
      }
    } else {
      qty = Math.min(qty, maxPossible);
      for (let i = 0; i < qty; i++) {
        const cost = config.cost * (baseLevel + i + 1);
        totalCost += cost;
      }
    }
    // Compute total bonus gained
    const bonusValue = (config.bonus || 0) * qty;
    const decimals = STATS[stat].decimalPlaces || 0;

    // --- Update ALL modal fields ---
    this.modal.querySelector('.modal-qty').textContent = qty;
    this.modal.querySelector('.modal-total-cost').textContent = totalCost;
    this.modal.querySelector('.modal-total-bonus').textContent = `+${bonusValue.toFixed(decimals)} ${formatStatName(
      stat
    )}`;
    this.modal.querySelector('.modal-level').textContent = baseLevel;
    this.modal.querySelector('.modal-max-level').textContent = maxLevel === Infinity ? '∞' : maxLevel;
    this.modal.querySelector('.modal-bonus').textContent = this.getBonusText(stat, config, baseLevel);
    this.modal.querySelector('.modal-next-bonus').textContent = this.getBonusText(stat, config, baseLevel + 1);

    // Enable/disable Buy button based on quantity and affordability
    const buyBtn = this.modal.querySelector('.modal-buy');
    buyBtn.disabled = qty <= 0 || totalCost > goldAvailable || baseLevel >= maxLevel;
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
    const bonus = this.getBonusText(stat, config.training, level);
    const maxLevel = config.training?.maxLevel ?? Infinity;
    const isMaxed = level >= maxLevel;

    return html`
      <button data-stat="${stat}" ${isMaxed ? ' disabled' : ''}>
        <span class="upgrade-name">${formatStatName(stat)} (Lvl ${level}${isMaxed ? ' / Max' : ''})</span>
        <span class="upgrade-bonus">${bonus}${isMaxed ? ' <strong>Max</strong>' : ''}</span>
      </button>
    `;
  }
  getBonusText(stat, config, level) {
    const value = config.bonus * level;
    const decimals = STATS[stat].decimalPlaces || 0;
    const formattedValue = value.toFixed(decimals);
    return `+${formattedValue}${config.suffix || ''} ${formatStatName(stat)}`;
  }

  getUpgradeCost(stat) {
    const level = this.upgradeLevels[stat] || 0;
    const cost = STATS[stat].training ? STATS[stat].training.cost * (level + 1) : 0;
    return cost;
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
    const baseCost = config.cost;
    let gold = hero[currency];
    let levelsToBuy = 0;
    let totalCost = 0;
    const levelsLeft = maxLevel - currentLevel;

    if (qty === 'max') {
      // Use arithmetic progression sum to find max affordable upgrades
      let low = 0,
        high = levelsLeft;
      while (low < high) {
        let mid = Math.ceil((low + high) / 2);
        let cost = (baseCost * (mid * (2 * currentLevel + mid + 1))) / 2;
        if (cost <= gold) {
          low = mid;
        } else {
          high = mid - 1;
        }
      }
      levelsToBuy = low;
      totalCost = (baseCost * (levelsToBuy * (2 * currentLevel + levelsToBuy + 1))) / 2;
    } else {
      levelsToBuy = Math.min(qty, levelsLeft);
      // Calculate total cost for levelsToBuy upgrades
      totalCost = (baseCost * (levelsToBuy * (2 * currentLevel + levelsToBuy + 1))) / 2;
      if (totalCost > gold) {
        // If not enough gold for all, reduce levelsToBuy
        // Find max affordable
        let affordable = 0;
        for (let i = 1; i <= levelsToBuy; i++) {
          let cost = (baseCost * (i * (2 * currentLevel + i + 1))) / 2;
          if (cost > gold) break;
          affordable = i;
        }
        levelsToBuy = affordable;
        totalCost = (baseCost * (levelsToBuy * (2 * currentLevel + levelsToBuy + 1))) / 2;
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
