import { game, hero, skillTree } from './globals.js';
import {
  updateResources,
  initializeSkillTreeUI,
  updateActionBar,
  updateSkillTreeValues,
  showConfirmDialog,
  showToast,
} from './ui/ui.js';
import { handleSavedData } from './functions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { createModal } from './ui/modal.js';

const html = String.raw;

const CRYSTAL_UPGRADE_CONFIG = {
  startingStage: {
    label: 'Starting Stage',
    bonus: 1,
    baseCost: 2,
    costIncrement: 0,
  },
  continuousPlay: {
    label: 'Continuous Play',
    bonus: 'Auto-continue after death',
    baseCost: 20,
    oneTime: true,
  },
  autoSpellCast: {
    label: 'Auto Spell Cast',
    bonus: 'Automatically casts instant and buff skills',
    baseCost: 40,
    oneTime: true,
  },
  resetSkillTree: {
    label: 'Reset Skill Tree',
    bonus: 'Refund all skill points and reset path',
    baseCost: 10,
    multiple: true,
  },
  resetAttributes: {
    label: 'Reset Attributes',
    bonus: 'Refund all allocated attribute points',
    baseCost: 10,
    multiple: true,
  },
  resetBossLevel: {
    label: 'Reset Boss Level',
    bonus: 'Reset boss level to 1',
    baseCost: 10,
    multiple: true,
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
    const crystalShopTab = document.querySelector('#crystalShop');
    if (!crystalShopTab) return;
    const upgradesContainer = crystalShopTab.querySelector('.crystalShop-upgrades-container');
    if (upgradesContainer) {
      upgradesContainer.innerHTML = `
        <div class="crystal-upgrades-grid">
          ${Object.entries(CRYSTAL_UPGRADE_CONFIG)
            .map(([stat, config]) => this.createCrystalUpgradeButton(stat, config))
            .join('')}
        </div>
      `;
    }
    this.setupCrystalUpgradeHandlers();
    if (!this.modal) this.createUpgradeModal();
  }

  createCrystalUpgradeButton(stat, config) {
    const isOneTime = config.oneTime;
    const isMultiple = config.multiple;
    let alreadyPurchased = isOneTime && this.crystalUpgrades[stat];
    const level = isOneTime || isMultiple ? undefined : this.crystalUpgrades[stat] || 0;
    const bonus =
      isOneTime || isMultiple ? config.bonus : `+${config.bonus * (this.crystalUpgrades[stat] || 0)} ${config.label}`;
    const cost =
      isOneTime || isMultiple
        ? config.baseCost
        : config.baseCost + (config.costIncrement || 0) * (this.crystalUpgrades[stat] || 0);

    return `
      <button class="crystal-upgrade-btn ${alreadyPurchased ? 'purchased' : ''}" data-stat="${stat}" ${
      alreadyPurchased ? 'disabled' : ''
    }>
        <span class="upgrade-name">${config.label} ${isOneTime ? '' : isMultiple ? '' : `(Lvl ${level})`}</span>
        <span class="upgrade-bonus">${bonus}</span>
        <span class="upgrade-cost">${alreadyPurchased ? 'Purchased' : `${cost} Crystals`}</span>
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
      <div class="training-modal-content">
        <button class="training-modal-close" aria-label="Close">&times;</button>
        <h2 class="modal-title"></h2>
        <div class="modal-fields"></div>
        <div class="modal-controls" style="display:none;"></div>
        <button class="modal-buy">Buy</button>
      </div>
    `;
    this.modal = createModal({
      id: 'crystalShop-modal',
      className: 'training-modal hidden',
      content,
      onClose: () => this.closeModal(),
    });
    this.modal.querySelector('.training-modal-close').onclick = () => this.closeModal();
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
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`
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
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.resetAttributes();
      updateStatsAndAttributesUI();
      showToast('All attribute points have been refunded.', 'success');
    } else if (stat === 'resetBossLevel') {
      confirmed = await showConfirmDialog(
        'Are you sure you want to reset your boss level to 1?<br>' +
          `This will cost <strong>${cost} crystals</strong> and cannot be undone.`
      );
      if (!confirmed) return;
      hero.crystals -= cost;
      hero.bossLevel = 1;
      showToast('Boss level has been reset to 1.', 'success');
    }
    updateResources();
    game.saveGame();
    this.initializeCrystalShopUI();
  }

  /**
   * Opens the upgrade modal or, for reset buttons, shows confirmation dialogs.
   */
  async openUpgradeModal(stat) {
    if (stat === 'resetSkillTree' || stat === 'resetAttributes' || stat === 'resetBossLevel') {
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

    if (stat === 'startingStage') {
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
      fields.innerHTML = `
        <p>${config.bonus && typeof config.bonus === 'string' ? config.bonus : ''}</p>
        <p>Cost: <span class="modal-total-cost">${config.baseCost}</span> Crystals</p>
      `;
      buyBtn.style.display = '';
      buyBtn.disabled = false;
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

    if (stat === 'startingStage') {
      const baseLevel = this.crystalUpgrades[stat] || 0;
      const crystalsAvailable = hero.crystals;
      let qty = this.selectedQty === 'max' ? 0 : this.selectedQty;
      let totalCost = 0;

      if (this.selectedQty === 'max') {
        let lvl = baseLevel;
        let crystals = crystalsAvailable;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * lvl;
          if (crystals < cost) break;
          crystals -= cost;
          totalCost += cost;
          lvl++;
          qty++;
        }
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = config.baseCost + (config.costIncrement || 0) * (baseLevel + i);
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

  async buyBulk(stat, qty) {
    const config = CRYSTAL_UPGRADE_CONFIG[stat];
    if (!config) return;

    if (stat === 'startingStage') {
      let count = 0;
      let totalCost = 0;

      if (qty === 'max') {
        let level = this.crystalUpgrades[stat] || 0;
        while (true) {
          const cost = config.baseCost + (config.costIncrement || 0) * level;
          if (hero.crystals < cost) break;
          hero.crystals -= cost;
          totalCost += cost;
          level++;
          count++;
        }
        this.crystalUpgrades[stat] = level;
      } else {
        for (let i = 0; i < qty; i++) {
          const cost = config.baseCost + (config.costIncrement || 0) * ((this.crystalUpgrades[stat] || 0) + i);
          if (hero.crystals < cost) break;
          hero.crystals -= cost;
          totalCost += cost;
          this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
          count++;
        }
      }

      game.saveGame();
      updateResources();
      this.updateModalDetails();
      this.initializeCrystalShopUI();
      showToast(`Upgraded ${config.label} by ${count} levels!`, count > 0 ? 'success' : 'error');
      return;
    }

    if (config.oneTime) {
      if (this.crystalUpgrades[stat]) return;
      const cost = config.baseCost;
      if (hero.crystals < cost) {
        showToast('Not enough crystals!', 'error');
        return;
      }
      hero.crystals -= cost;
      this.crystalUpgrades[stat] = true;
      game.saveGame();
      updateResources();
      this.initializeCrystalShopUI();
      this.closeModal();
      showToast(`Purchased ${config.label}!`, 'success');
      return;
    }

    if (config.multiple) {
      const cost = config.baseCost;
      if (hero.crystals < cost) {
        showToast('Not enough crystals!', 'error');
        return;
      }
      if (stat === 'resetBossLevel') {
        hero.crystals -= cost;
        hero.bossLevel = 1;
        game.saveGame();
        updateResources();
        this.initializeCrystalShopUI();
        this.closeModal();
        showToast('Boss level has been reset to 1.', 'success');
        return;
      }
      hero.crystals -= cost;
      this.crystalUpgrades[stat] = (this.crystalUpgrades[stat] || 0) + 1;
      game.saveGame();
      updateResources();
      this.initializeCrystalShopUI();
      this.closeModal();
      showToast(`Purchased ${config.label}!`, 'success');
      return;
    }
  }

  hasAutoSpellCastUpgrade() {
    return !!this.crystalUpgrades.autoSpellCast;
  }
}
