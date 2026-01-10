import { crystalShop,
  dataManager,
  game,
  setGlobals,
  training,
  soulShop,
  statistics,
  ascension,
  runes,
  skillTree } from './globals.js';
import { CLASS_PATHS } from './constants/skills.js';
import { initializeBuildingsUI } from './ui/buildingUi.js';
import { crypt } from './functions.js';
import { showConfirmDialog,
  showToast,
  updateStageUI,
  updateResources,
  updatePlayerLife,
  updateEnemyStats,
  showTooltip,
  positionTooltip,
  hideTooltip,
  initializeSkillTreeStructure } from './ui/ui.js';
import { updateBuffIndicators } from './ui/skillTreeUi.js';
import { closeModal, createModal } from './ui/modal.js';
import Enemy from './enemy.js';
import { logout } from './api.js';
import { CHANGELOG } from './changelog/changelog.js';
import { audioManager } from './audio.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { setLanguage, t, tp } from './i18n.js';
import { SOUL_SHOP_MAX_QTY,
  CRYSTAL_SHOP_MAX_QTY,
  TRAINING_MAX_QTY,
  BUILDING_MAX_QTY,
  GLOBAL_MAX_QTY } from './constants/limits.js';

const html = String.raw;

function attachTooltip(el, generator) {
  el.addEventListener('mouseenter', (e) => {
    const content = typeof generator === 'function' ? generator() : generator;
    if (content) showTooltip(content, e);
  });
  el.addEventListener('mousemove', positionTooltip);
  el.addEventListener('mouseleave', hideTooltip);
}

// Options class to store options and version (future-proof for migrations)
export class Options {
  constructor(data = {}) {
    this.version = data.version || '0.9.0';
    this.startingStage = data.startingStage || null;
    this.showEnemyStats = data.showEnemyStats ?? false;
    this.showAllStats = data.showAllStats ?? false;
    this.hideZeroStats = data.hideZeroStats ?? false;
    this.resetRequired = data.resetRequired ?? null;
    this.stageSkip = data.stageSkip || 0;
    this.arenaBossSkip = data.arenaBossSkip || 0;
    this.resetStageSkip = data.resetStageSkip || 0;
    this.stageLockEnabled = data.stageLockEnabled ?? false;
    this.stageLock = data.stageLock || 0;
    this.soundVolume = typeof data.soundVolume === 'number' ? data.soundVolume : 0;
    this.salvageMaterialsEnabled = data.salvageMaterialsEnabled ?? false;
    this.autoSortInventory = data.autoSortInventory ?? false;
    this.showAdvancedTooltips = data.showAdvancedTooltips ?? true;
    this.showAdvancedAttributeTooltips = data.showAdvancedAttributeTooltips ?? false;
    this.showRateCounters = data.showRateCounters ?? false;
    this.rateCountersPeriod = data.rateCountersPeriod || 1;
    const quickFlags = [data.quickBuy, data.quickTraining, data.quickSoulShop, data.quickSkills];
    this.quickBuy = quickFlags.some((value) => value === true || value === 'true');
    const bulkValue = data.bulkBuy ?? data.bulkTraining ?? false;
    this.bulkBuy = typeof bulkValue === 'boolean' ? bulkValue : bulkValue === 'true';
    this.useNumericInputs = data.useNumericInputs ?? false;
    this.soulShopQty =
      data.soulShopQty === 'max'
        ? 'max'
        : typeof data.soulShopQty === 'number'
          ? Math.min(data.soulShopQty, SOUL_SHOP_MAX_QTY)
          : 1;
    this.soulShopQuickQty =
      data.soulShopQuickQty === 'max'
        ? 'max'
        : typeof data.soulShopQuickQty === 'number'
          ? Math.min(data.soulShopQuickQty, SOUL_SHOP_MAX_QTY)
          : 1;
    this.crystalShopQty =
      data.crystalShopQty === 'max'
        ? 'max'
        : typeof data.crystalShopQty === 'number'
          ? Math.min(data.crystalShopQty, CRYSTAL_SHOP_MAX_QTY)
          : 1;
    this.trainingQty =
      data.trainingQty === 'max'
        ? 'max'
        : typeof data.trainingQty === 'number'
          ? Math.min(data.trainingQty, TRAINING_MAX_QTY)
          : 1;
    this.trainingQuickQty =
      data.trainingQuickQty === 'max'
        ? 'max'
        : typeof data.trainingQuickQty === 'number'
          ? Math.min(data.trainingQuickQty, TRAINING_MAX_QTY)
          : 1;
    this.skillQuickQty =
      data.skillQuickQty === 'max'
        ? 'max'
        : typeof data.skillQuickQty === 'number'
          ? Math.max(1, Math.min(data.skillQuickQty, GLOBAL_MAX_QTY))
          : 1;
    this.buildingQty =
      data.buildingQty === 'max'
        ? 'max'
        : typeof data.buildingQty === 'number'
          ? Math.min(data.buildingQty, BUILDING_MAX_QTY)
          : 1;
    this.language = data.language || 'en';
    this.shortElementalNames = data.shortElementalNames ?? false;
    this.shortNumbers = data.shortNumbers ?? false;
    this.enableEnemyRarityBonus = data.enableEnemyRarityBonus ?? true;
    this.showSkillCooldowns = data.showSkillCooldowns ?? false;
    this.showInfoMessages = data.showInfoMessages ?? true;
    this.showNotifications = data.showNotifications ?? true;
    this.showCombatText = data.showCombatText ?? true;
    this.showStageControlsInline = data.showStageControlsInline ?? false;
    this.showRollPercentiles = data.showRollPercentiles ?? false;
    this.devAccessDeadline = data.devAccessDeadline || null;
    this.devAccessModalDismissed = data.devAccessModalDismissed ?? false;
  }

  initializeOptionsUI() {
    this._renderOptionsUI();
    this._initCloudSaveButtons();
    audioManager.setVolume(this.soundVolume);
  }

  _createLanguageOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="language-select" data-i18n="options.language">Language:</label>
      <select id="language-select" class="common-select">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="zh">中文</option>
      </select>
      <button id="language-reload-btn" class="common-action-btn" style="display:none;">
        ${t('options.lang.reload')}
      </button>
    `;
    const label = wrapper.querySelector('label');
    const select = wrapper.querySelector('select');
    const reloadBtn = wrapper.querySelector('#language-reload-btn');
    attachTooltip(label, () => html`${t('options.language.tooltip')}`);
    attachTooltip(select, () => html`${t('options.languageSelect.tooltip')}`);
    select.value = this.language;
    select.addEventListener('change', () => {
      this.language = select.value;
      setLanguage(this.language);
      dataManager.saveGame({ force: true });
      reloadBtn.style.display = 'inline-block';
    });
    reloadBtn.addEventListener('click', () => {
      window.location.reload();
    });
    return wrapper;
  }

  _createBackupRestoreOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="backup-save-select" data-i18n="options.backup.label">${t('options.backup.label')}</label>
      <select id="backup-save-select" class="common-select"></select>
      <button id="backup-save-apply" class="common-action-btn">${t('common.apply')}</button>
    `;

    const select = wrapper.querySelector('#backup-save-select');
    const apply = wrapper.querySelector('#backup-save-apply');

    const updateApplyState = () => {
      if (apply) {
        apply.disabled = !select?.value;
      }
    };

    this.refreshBackupSelect(select, apply);
    updateApplyState();

    select.addEventListener('change', updateApplyState);

    apply.addEventListener('click', async () => {
      const value = select.value;
      if (!value) return;

      const [slotStr, timestampStr] = value.split(':');
      const slot = parseInt(slotStr, 10);
      const timestamp = Number(timestampStr);
      if (!Number.isFinite(slot) || !Number.isFinite(timestamp)) {
        return;
      }

      if (slot !== dataManager.getCurrentSlot()) {
        showToast(tp('options.toast.backupUnavailable', { slot: slot + 1 }), 'error');
        return;
      }

      const backup = dataManager.getBackup(slot, timestamp);
      if (!backup) {
        showToast(t('options.toast.backupUnavailable'), 'error');
        this.refreshBackupSelect(select, apply);
        updateApplyState();
        return;
      }

      const confirmed = await showConfirmDialog(tp('options.backup.confirm', { date: backup.date, slot: slot + 1 }));
      if (!confirmed) return;

      const restored = dataManager.restoreBackup(slot, timestamp);
      if (!restored) {
        showToast(t('options.toast.backupRestoreFailed'), 'error');
        return;
      }

      showToast(t('options.toast.backupRestored'), 'success');
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });

    return wrapper;
  }

  _createSoundVolumeOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="sound-volume-slider" class="sound-volume-label" data-i18n="options.soundVolume">Sound Volume:</label>
      <input
        type="range"
        id="sound-volume-slider"
        class="sound-volume-slider"
        min="0"
        max="1"
        step="0.01"
        value="${this.soundVolume}"
      />
      <span class="sound-volume-value">${Math.round(this.soundVolume * 100)}%</span>
    `;
    const label = wrapper.querySelector('.sound-volume-label');
    const slider = wrapper.querySelector('input');
    const valueLabel = wrapper.querySelector('.sound-volume-value');
    attachTooltip(label, () => html`${t('options.soundVolumeLabel.tooltip')}`);
    attachTooltip(slider, () => html`${t('options.soundVolume.tooltip')}`);
    slider.addEventListener('input', () => {
      let val = parseFloat(slider.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 1) val = 1;
      this.soundVolume = val;
      valueLabel.textContent = `${Math.round(val * 100)}%`;
      audioManager.setVolume(val);
      dataManager.saveGame();
    });
    setTimeout(() => {
      audioManager.setVolume(this.soundVolume);
    }, 0);
    return wrapper;
  }

  _renderOptionsUI() {
    const optionsTab = document.getElementById('options');
    if (!optionsTab) return;
    optionsTab.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'options-container';

    const tabs = document.createElement('div');
    tabs.className = 'options-tabs';
    const gameTabBtn = document.createElement('button');
    gameTabBtn.className = 'options-tab active';
    gameTabBtn.setAttribute('data-i18n', 'options.tab.game');
    gameTabBtn.textContent = t('options.tab.game');
    const generalTabBtn = document.createElement('button');
    generalTabBtn.className = 'options-tab';
    generalTabBtn.setAttribute('data-i18n', 'options.tab.general');
    generalTabBtn.textContent = t('options.tab.general');
    tabs.appendChild(gameTabBtn);
    tabs.appendChild(generalTabBtn);
    container.appendChild(tabs);

    const gameContent = document.createElement('div');
    gameContent.className = 'options-content active';
    gameContent.appendChild(
      this._createToggleOption({
        id: 'advanced-tooltips-toggle',
        i18nKey: 'options.advancedTooltips',
        labelText: 'Show Advanced Item Tooltips:',
        stateKey: 'showAdvancedTooltips',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'advanced-attr-tooltips-toggle',
        i18nKey: 'options.advancedAttributeTooltips',
        labelText: 'Show Advanced Attribute Tooltips:',
        stateKey: 'showAdvancedAttributeTooltips',
        onChange: () => updateStatsAndAttributesUI(true),
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'roll-percentiles-toggle',
        i18nKey: 'options.rollPercentiles',
        labelText: 'Show Roll Percentiles:',
        stateKey: 'showRollPercentiles',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'enemy-stats-toggle',
        i18nKey: 'options.showEnemyStats',
        labelText: 'Show Enemy Stats:',
        stateKey: 'showEnemyStats',
        onChange: () => {
          const stats = document.querySelector('.enemy-stats');
          if (stats) stats.style.display = this.showEnemyStats ? '' : 'none';
        },
        onCreated: () => {
          setTimeout(() => {
            const stats = document.querySelector('.enemy-stats');
            if (stats) stats.style.display = this.showEnemyStats ? '' : 'none';
          }, 0);
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'show-all-stats-toggle',
        i18nKey: 'options.showAllStats',
        labelText: 'Show All Stats:',
        stateKey: 'showAllStats',
        onChange: () => updateStatsAndAttributesUI(true),
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'hide-zero-stats-toggle',
        i18nKey: 'options.hideZeroStats',
        labelText: 'Hide Zero Value Stats:',
        stateKey: 'hideZeroStats',
        onChange: () => updateStatsAndAttributesUI(true),
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'short-elemental-names-toggle',
        i18nKey: 'options.shortElementalNames',
        labelText: 'Use Short Elemental Stat Names:',
        stateKey: 'shortElementalNames',
        onChange: () => {
          updateStatsAndAttributesUI(true);
          updateEnemyStats();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'short-numbers-toggle',
        i18nKey: 'options.shortNumbers',
        labelText: 'Use Short Number Notation:',
        stateKey: 'shortNumbers',
        onChange: () => {
          updateResources();
          updateStatsAndAttributesUI(true);
          updateStageUI();
          updatePlayerLife();
          training.updateTrainingUI('gold-upgrades');
          crystalShop.updateCrystalShopUI();
          soulShop.updateSoulShopUI();
          initializeBuildingsUI();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'quick-buy-toggle',
        i18nKey: 'options.quickBuy',
        labelText: 'Enable Quick Buy:',
        stateKey: 'quickBuy',
        onChange: () => {
          if (training) training.initializeTrainingUI();
          if (soulShop) soulShop.initializeSoulShopUI();
          initializeSkillTreeStructure();
          initializeBuildingsUI();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'bulk-buy-toggle',
        i18nKey: 'options.bulkBuy',
        labelText: 'Enable Bulk Buy:',
        stateKey: 'bulkBuy',
        onChange: () => {
          if (training) training.initializeTrainingUI();
          if (soulShop) soulShop.initializeSoulShopUI();
          initializeSkillTreeStructure();
          initializeBuildingsUI();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'numeric-input-toggle',
        i18nKey: 'options.numericPurchaseInputs',
        labelText: 'Enable Numeric Purchase Inputs:',
        stateKey: 'useNumericInputs',
        onChange: () => {
          if (!this.useNumericInputs) {
            if (training) training.quickQty = 1;
            if (soulShop) soulShop.quickQty = 1;
            if (skillTree) skillTree.quickQty = 1;
          }
          if (training) {
            training.modal = null;
            training.initializeTrainingUI();
          }
          if (soulShop) {
            soulShop.modal = null;
            soulShop.initializeSoulShopUI();
          }
          if (crystalShop) {
            crystalShop.modal = null;
            crystalShop.initializeCrystalShopUI();
          }
          initializeSkillTreeStructure();
          initializeBuildingsUI();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'auto-sort-inventory-toggle',
        i18nKey: 'options.autoSortInventory',
        labelText: 'Auto Sort Inventory:',
        stateKey: 'autoSortInventory',
        disabled: !crystalShop.crystalUpgrades?.autoSortInventory,
        onCreated: (wrapper, checkbox) => {
          attachTooltip(checkbox, () => {
            const isPurchased = !!crystalShop.crystalUpgrades?.autoSortInventory;
            return html`${isPurchased ? '' : t('options.autoSortInventory.disabledTooltip')}`;
          });
          this._autoSortInventoryToggle = checkbox;
          this._autoSortInventoryWrapper = wrapper;
          this.updateAutoSortInventoryOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'stage-controls-inline-toggle',
        i18nKey: 'options.stageControlsInline',
        labelText: 'Show Stage Controls Under Enemy:',
        stateKey: 'showStageControlsInline',
        onChange: () => {
          try {
            document.dispatchEvent(new CustomEvent('updateInlineStageControls'));
          } catch (e) {}
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'starting-stage-input',
        i18nKey: 'options.startingStage',
        labelText: 'Starting Stage:',
        tooltip: 'options.startingStage.tooltip',
        inputTooltip: () => {
          const max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
          return html`${t('options.max')}: ${max} ${t('options.basedOnCrystal')}`;
        },
        stateKey: 'startingStage',
        min: 1,
        max: () => 1 + (crystalShop.crystalUpgrades?.startingStage || 0),
        showMinMax: true,
        onApply: (val, force, changed) => {
          const stageMismatch = game.fightMode === 'explore' && game.stage !== val;
          if (stageMismatch) {
            game.stage = game.getStartingStage();
            game.currentEnemy = new Enemy(game.stage);
            updateStageUI();
            game.resetAllLife();
          }
          if (changed || force || stageMismatch) {
            this.updateStartingStageOption();
            showToast(t('options.toast.startingStageApplied'), 'success');
          }
        },
        onCreated: (w, i) => {
          this._startingStageInput = i;
          this._startingStageWrapper = w;
          this.updateStartingStageOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'stage-skip-input',
        i18nKey: 'options.stageSkipPerKill',
        labelText: 'Stage Skip per Kill:',
        tooltip: 'options.stageSkip.tooltip',
        inputTooltip: () => {
          const max = crystalShop.crystalUpgrades?.stageSkip || 0;
          return html`${t('options.max')}: ${max} ${t('options.basedOnCrystal')}`;
        },
        stateKey: 'stageSkip',
        max: () => crystalShop.crystalUpgrades?.stageSkip || 0,
        showMinMax: true,
        onApply: (val, force, changed) => {
          if (changed || force) {
            showToast(t('options.toast.stageSkipApplied'), 'success');
            this.updateStageSkipOption();
          }
        },
        onCreated: (w, i) => {
          this._stageSkipInput = i;
          this._stageSkipWrapper = w;
          this.updateStageSkipOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'stage-lock-toggle',
        i18nKey: 'options.stageLock',
        labelText: 'Stage Lock:',
        stateKey: 'stageLockEnabled',
        disabled: !crystalShop.crystalUpgrades?.stageLock,
        onCreated: (wrapper, checkbox) => {
          attachTooltip(checkbox, () => {
            const isPurchased = !!crystalShop.crystalUpgrades?.stageLock;
            return html`${isPurchased ? '' : t('options.stageLock.disabledTooltip')}`;
          });
          this._stageLockToggle = checkbox;
          this._stageLockToggleWrapper = wrapper;
          this.updateStageLockOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'stage-lock-input',
        i18nKey: 'options.stageLockStage',
        labelText: 'Lock at Stage:',
        inputTooltip: () => {
          const isPurchased = !!crystalShop.crystalUpgrades?.stageLock;
          return html`${isPurchased ? '' : t('options.stageLock.disabledTooltip')}`;
        },
        stateKey: 'stageLock',
        showMinMax: true,
        disabled: !crystalShop.crystalUpgrades?.stageLock,
        onMax: (input) => {
          const highest = Math.max(...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0));
          input.value = highest || 0;
        },
        onApply: (val, force, changed) => {
          if (changed || force) {
            this.updateStageLockOption();
            showToast(t('options.toast.stageLockApplied'), 'success');
          }
        },
        onCreated: (w, i) => {
          this._stageLockInput = i;
          this._stageLockWrapper = w;
          this.updateStageLockOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'boss-skip-input',
        i18nKey: 'options.arenaBossSkipPerKill',
        labelText: 'Boss Skip per Kill:',
        tooltip: 'options.arenaBossSkip.tooltip',
        inputTooltip: () => {
          const rb = runes?.getBonusEffects?.() || {};
          const max = (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
          return html`${t('options.max')}: ${max} ${t('options.basedOnAscensionAndRunes')}`;
        },
        stateKey: 'arenaBossSkip',
        max: () => {
          const rb = runes?.getBonusEffects?.() || {};
          return (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
        },
        showMinMax: true,
        onApply: (val, force, changed) => {
          if (changed || force) {
            showToast(t('options.toast.arenaBossSkipApplied'), 'success');
            this.updateArenaBossSkipOption();
          }
        },
        onCreated: (w, i) => {
          this._bossSkipInput = i;
          this.updateArenaBossSkipOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'reset-stage-skip-input',
        i18nKey: 'options.resetStageSkipAt',
        labelText: 'Reset Stage Skip At:',
        tooltip: 'options.resetStageSkip.tooltip',
        inputTooltip: () => {
          const isPurchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
          return html`${isPurchased ? t('options.resetStageSkip.enabledTooltip') : t('options.resetStageSkip.disabledTooltip')}`;
        },
        stateKey: 'resetStageSkip',
        disabled: !crystalShop.crystalUpgrades?.resetStageSkip,
        showMinMax: true,
        onMax: (input) => {
          const highest = Math.max(...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0));
          input.value = highest || 0;
        },
        onApply: (val, force, changed) => {
          if (changed || force) {
            showToast(t('options.toast.resetStageSkipApplied'), 'success');
            this.updateResetStageSkipOption();
          }
        },
        onCreated: (w, i) => {
          this._resetStageSkipInput = i;
          this._resetStageSkipWrapper = w;
          this.updateResetStageSkipOption();
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'rate-counters-toggle',
        i18nKey: 'options.showRateCounters',
        labelText: 'Show Counters Bar:',
        stateKey: 'showRateCounters',
        onChange: () => {
          document.dispatchEvent(new CustomEvent('toggleRateCounters', { detail: this.showRateCounters }));
        },
      }),
    );
    gameContent.appendChild(
      this._createNumberInputOption({
        id: 'rate-counters-period',
        i18nKey: 'options.rateCountersPeriod',
        labelText: 'Counters Period (sec):',
        stateKey: 'rateCountersPeriod',
        min: 1,
        onApply: (v, f, changed) => {
          if (changed) {
            document.dispatchEvent(new CustomEvent('ratePeriodChange', { detail: v }));
          }
        },
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'show-info-messages-toggle',
        i18nKey: 'options.showInfoMessages',
        labelText: 'Show Info Messages:',
        stateKey: 'showInfoMessages',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'show-notifications-toggle',
        i18nKey: 'options.showNotifications',
        labelText: 'Show Notifications:',
        stateKey: 'showNotifications',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'show-combat-text-toggle',
        i18nKey: 'options.showCombatText',
        labelText: 'Show Combat Texts:',
        stateKey: 'showCombatText',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'enable-enemy-rarity-bonus-toggle',
        i18nKey: 'options.enableEnemyRarityBonus',
        labelText: 'Enable Specialization Rarity Bonus:',
        stateKey: 'enableEnemyRarityBonus',
      }),
    );
    gameContent.appendChild(
      this._createToggleOption({
        id: 'show-skill-cooldowns-toggle',
        i18nKey: 'options.showSkillCooldowns',
        labelText: 'Show Skill Cooldown Numbers:',
        stateKey: 'showSkillCooldowns',
        onChange: () => updateBuffIndicators(),
      }),
    );

    const generalContent = document.createElement('div');
    generalContent.className = 'options-content';
    generalContent.appendChild(this._createCloudSaveBar());
    generalContent.appendChild(this._createSaveSlotOption());
    generalContent.appendChild(this._createBackupRestoreOption());
    generalContent.appendChild(this._createSaveTextButtons());
    generalContent.appendChild(this._createLanguageOption());
    generalContent.appendChild(this._createSoundVolumeOption());

    const changelogRow = document.createElement('div');
    changelogRow.className = 'changelog-row';
    changelogRow.appendChild(this._createChangelogButton());
    generalContent.appendChild(changelogRow);

    generalContent.appendChild(this._createDiscordSection());

    const suggestionsRow = document.createElement('div');
    suggestionsRow.innerHTML = html`
      ${t('options.currentVersion')} ${this.version}.
      <br />
      <br />
      ${t('options.suggestionsPrompt')}
      <br />
      <br />
      ${t('options.desktopDownload')}
      <a
        style="color:#fff; background:#0078d7; padding:2px 8px; border-radius:4px; text-decoration:none; font-weight:bold;"
        target="_blank"
        href="https://github.com/aleksandar-radev/endless/releases"
        >${t('options.here')}</a
      >.
    `;
    generalContent.appendChild(suggestionsRow);
    generalContent.appendChild(this._createResetButton());

    container.appendChild(gameContent);
    container.appendChild(generalContent);

    gameTabBtn.addEventListener('click', () => {
      gameTabBtn.classList.add('active');
      generalTabBtn.classList.remove('active');
      gameContent.classList.add('active');
      generalContent.classList.remove('active');
    });

    generalTabBtn.addEventListener('click', () => {
      generalTabBtn.classList.add('active');
      gameTabBtn.classList.remove('active');
      generalContent.classList.add('active');
      gameContent.classList.remove('active');
    });

    optionsTab.appendChild(container);
  }

  _createNumberInputOption({
    id,
    i18nKey,
    labelText,
    tooltip,
    inputTooltip,
    stateKey,
    min = 0,
    max,
    onApply,
    showMinMax = false,
    onMin,
    onMax,
    onCreated,
    disabled = false,
  }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    const i18nAttr = i18nKey ? `data-i18n="${i18nKey}"` : '';

    let buttonsHtml = '';
    if (showMinMax) {
      buttonsHtml = `
        <div class="min-max-btn-group">
          <button class="min-btn" type="button" ${disabled ? 'disabled' : ''} data-i18n="common.min">Min</button>
          <button class="max-btn" type="button" ${disabled ? 'disabled' : ''} data-i18n="common.max">Max</button>
        </div>
      `;
    }

    wrapper.innerHTML = html`
      <label for="${id}" class="${id}-label" ${i18nAttr}>${labelText}</label>
      <input
        type="number"
        id="${id}"
        class="${id}"
        min="${min}"
        ${max !== undefined ? `max="${typeof max === 'function' ? max() : max}"` : ''}
        value="${this[stateKey] ?? 0}"
        ${disabled ? 'disabled' : ''}
      />
      ${buttonsHtml}
    `;

    const label = wrapper.querySelector('label');
    const input = wrapper.querySelector('input');

    if (tooltip) {
      attachTooltip(label, typeof tooltip === 'function' ? tooltip : () => html`${t(tooltip)}`);
    } else if (i18nKey) {
      attachTooltip(label, () => html`${t(i18nKey + '.tooltip')}`);
    }

    if (inputTooltip) {
      attachTooltip(input, inputTooltip);
    }

    const getSafeValue = () => {
      let val = parseInt(input.value, 10);
      let currentMax = typeof max === 'function' ? max() : max;
      if (isNaN(val) || val < min) val = min;
      if (currentMax !== undefined && val > currentMax) val = currentMax;
      return val;
    };

    const applyValue = (force = false) => {
      if (input.disabled) return;
      let val = getSafeValue();
      input.value = val;

      const valueChanged = this[stateKey] !== val;

      if (valueChanged) {
        this[stateKey] = val;
        dataManager.saveGame();
      }

      if (onApply) onApply(val, force, valueChanged);
    };

    input.addEventListener('input', () => {
      input.value = getSafeValue();
    });

    input.addEventListener('blur', () => applyValue());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyValue(true);
        input.blur();
      }
    });

    if (showMinMax) {
      const minBtn = wrapper.querySelector('.min-btn');
      const maxBtn = wrapper.querySelector('.max-btn');

      minBtn.onclick = () => {
        if (minBtn.disabled) return;
        if (onMin) onMin(input);
        else input.value = min;
        input.dispatchEvent(new Event('input'));
        applyValue(true);
      };

      maxBtn.onclick = () => {
        if (maxBtn.disabled) return;
        if (onMax) onMax(input);
        else {
          const currentMax = typeof max === 'function' ? max() : max;
          if (currentMax !== undefined) input.value = currentMax;
        }
        input.dispatchEvent(new Event('input'));
        applyValue(true);
      };
    }

    if (onCreated) onCreated(wrapper, input, label);
    return wrapper;
  }
  _createToggleOption({
    id,
    i18nKey,
    labelText,
    tooltip,
    stateKey,
    onChange,
    disabled = false,
    onCreated,
  }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    const i18nAttr = i18nKey ? `data-i18n="${i18nKey}"` : '';
    wrapper.innerHTML = `
      <label for="${id}" class="${id}-label" ${i18nAttr}>${labelText}</label>
      <input
        type="checkbox"
        id="${id}"
        class="${id}"
        ${this[stateKey] ? 'checked' : ''}
        ${disabled ? 'disabled' : ''}
      />
      <span class="toggle-btn ${disabled ? 'disabled' : ''}"></span>
    `;
    const label = wrapper.querySelector('label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    if (tooltip) {
      attachTooltip(label, typeof tooltip === 'function' ? tooltip : () => html`${t(tooltip)}`);
    } else if (i18nKey) {
      attachTooltip(label, () => html`${t(i18nKey + '.tooltip')}`);
    }
    toggleBtn.addEventListener('click', () => {
      if (checkbox.disabled) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this[stateKey] = checkbox.checked;
      if (onChange) onChange();
      dataManager.saveGame();
    });
    if (onCreated) onCreated(wrapper, checkbox, label);
    return wrapper;
  }

  updateStageSkipOption() {
    if (!this._stageSkipInput) return;
    const oldMax = parseInt(this._stageSkipInput.max, 10) || 0;
    const max = crystalShop.crystalUpgrades?.stageSkip || 0;
    this._stageSkipInput.max = max;

    let val = parseInt(this._stageSkipInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    if ((val === 0 || isNaN(val)) && this.stageSkip > 0) {
      this._stageSkipInput.value = this.stageSkip;
    } else if (oldMax > 0 && val === oldMax) {
      this._stageSkipInput.value = max;
    } else {
      this._stageSkipInput.value = val;
    }

    const inlineInput = document.querySelector('#inline-stage-controls .stage-skip-input');
    if (inlineInput) {
      const oldInlineMax = parseInt(inlineInput.max, 10) || 0;
      inlineInput.max = max;
      let v = parseInt(inlineInput.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      if (v > max) v = max;
      if ((v === 0 || isNaN(v)) && this.stageSkip > 0) {
        inlineInput.value = this.stageSkip;
      } else if (oldInlineMax > 0 && v === oldInlineMax) {
        inlineInput.value = max;
      } else {
        inlineInput.value = v;
      }
    }
  }

  updateStageLockOption() {
    const purchased = !!crystalShop.crystalUpgrades?.stageLock;
    const tooltip = t('options.stageLock.disabledTooltip');
    if (this._stageLockToggle) {
      this._stageLockToggle.disabled = !purchased;
      this._stageLockToggle.checked = !!this.stageLockEnabled;
      const toggleBtn = this._stageLockToggleWrapper?.querySelector('.toggle-btn');
      if (toggleBtn) toggleBtn.classList.toggle('disabled', !purchased);
    }
    if (this._stageLockInput) {
      this._stageLockInput.disabled = !purchased;
      this._stageLockInput.value = this.stageLock || 0;
      const minBtn = this._stageLockWrapper?.querySelector('.min-btn');
      const maxBtn = this._stageLockWrapper?.querySelector('.max-btn');
      if (minBtn) minBtn.disabled = !purchased;
      if (maxBtn) maxBtn.disabled = !purchased;
    }
    const inlineInput = document.querySelector('#inline-stage-controls .stage-lock-input');
    if (inlineInput) {
      inlineInput.disabled = !purchased;
      inlineInput.value = this.stageLock || 0;
      if (!purchased) inlineInput.title = tooltip;
      else inlineInput.removeAttribute('title');
      const row = inlineInput.closest('.option-row');
      if (row) {
        row.style.display = this.stageLockEnabled ? '' : 'none';
        const minBtn = row.querySelector('.min-btn');
        const maxBtn = row.querySelector('.max-btn');
        if (minBtn) {
          minBtn.disabled = !purchased;
          if (!purchased) minBtn.title = tooltip;
          else minBtn.removeAttribute('title');
        }
        if (maxBtn) {
          maxBtn.disabled = !purchased;
          if (!purchased) maxBtn.title = tooltip;
          else maxBtn.removeAttribute('title');
        }
      }
    }
  }

  updateArenaBossSkipOption() {
    if (!this._bossSkipInput) return;
    const oldMax = parseInt(this._bossSkipInput.max, 10) || 0;
    const rb = runes?.getBonusEffects?.() || {};
    const max = (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
    this._bossSkipInput.max = max;

    let val = parseInt(this._bossSkipInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    if ((val === 0 || isNaN(val)) && this.arenaBossSkip > 0) {
      this._bossSkipInput.value = this.arenaBossSkip;
    } else if (oldMax > 0 && val === oldMax) {
      this._bossSkipInput.value = max;
    } else {
      this._bossSkipInput.value = val;
    }
  }


  updateResetStageSkipOption() {
    if (!this._resetStageSkipInput) return;
    const purchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
    this._resetStageSkipInput.disabled = !purchased;
    const btns = this._resetStageSkipWrapper?.querySelectorAll('.min-btn, .max-btn');
    if (btns) btns.forEach((b) => (b.disabled = !purchased));

    const inlineInput = document.querySelector('#inline-stage-controls .reset-stage-skip-input');
    if (inlineInput) inlineInput.disabled = !purchased;
    const inlineRow = inlineInput?.closest('.option-row');
    const inlineMin = inlineRow?.querySelector('.min-btn');
    const inlineMax = inlineRow?.querySelector('.max-btn');
    if (inlineMin) inlineMin.disabled = !purchased;
    if (inlineMax) inlineMax.disabled = !purchased;
  }

  _createCloudSaveBar() {
    const bar = document.createElement('div');
    bar.className = 'cloud-save-bar';
    bar.innerHTML = `
      <span id="cloud-save-status" data-i18n="options.cloud.checking">Checking login...</span>
      <button id="cloud-save-btn" data-i18n="options.cloud.save">Save to Cloud</button>
      <button id="cloud-load-btn" data-i18n="options.cloud.load">Load from Cloud</button>
      <button id="logout-btn" style="display:none;" data-i18n="options.cloud.logout">Log out</button>
    `;
    return bar;
  }

  _createSaveSlotOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="save-slot-select">${t('options.saveSlot.label')}</label>
      <select id="save-slot-select" class="common-select"></select>
      <button id="save-slot-apply" class="common-action-btn">${t('common.apply')}</button>
    `;
    const select = wrapper.querySelector('#save-slot-select');
    const apply = wrapper.querySelector('#save-slot-apply');
    this.refreshSaveSlotSelect(select);
    apply.addEventListener('click', async () => {
      const slot = parseInt(select.value, 10);
      if (slot === dataManager.getCurrentSlot()) return;
      await dataManager.saveGame({ force: true });
      dataManager.setCurrentSlot(slot);
      window.location.reload();
    });
    return wrapper;
  }

  _createSaveTextButtons() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';

    const copyBtn = document.createElement('button');
    copyBtn.id = 'copy-save-text-btn';
    copyBtn.setAttribute('data-i18n', 'options.saveText.copy');
    copyBtn.textContent = t('options.saveText.copy');
    copyBtn.addEventListener('click', async () => {
      try {
        const slot = dataManager.getCurrentSlot();
        const encrypted = localStorage.getItem(`gameProgress_${slot}`);
        if (!encrypted) {
          showToast(t('options.toast.saveTextNotFound'), 'error');
          return;
        }
        await navigator.clipboard.writeText(encrypted);
        showToast(t('options.toast.saveTextCopied'), 'success');
      } catch (e) {
        showToast(t('options.toast.saveTextCopyFailed'), 'error');
        console.error(e);
      }
    });

    const pasteBtn = document.createElement('button');
    pasteBtn.id = 'paste-save-text-btn';
    pasteBtn.setAttribute('data-i18n', 'options.saveText.paste');
    pasteBtn.textContent = t('options.saveText.paste');
    pasteBtn.addEventListener('click', async () => {
      try {
        const confirmed = await showConfirmDialog(t('options.saveText.confirm'));
        if (!confirmed) return;

        let text = await navigator.clipboard.readText();
        if (!text) {
          showToast(t('options.toast.clipboardEmpty'), 'error');
          return;
        }

        if (text.length > 1 && text.startsWith('"') && text.endsWith('"')) {
          text = text.slice(1, -1);
        }

        try {
          let data = crypt.decrypt(text);
          if (typeof data === 'string') data = JSON.parse(data);
          if (!data || typeof data !== 'object') throw new Error('Invalid save');
        } catch {
          showToast(t('options.toast.saveTextInvalid'), 'error');
          return;
        }

        const slot = dataManager.getCurrentSlot();
        localStorage.setItem(`gameProgress_${slot}`, text);
        localStorage.setItem('gameProgress', text);
        window.location.reload();
        showToast(t('options.toast.saveTextPasted'), 'success');
      } catch (e) {
        showToast(t('options.toast.saveTextPasteFailed'), 'error');
        console.error(e);
      }
    });

    wrapper.appendChild(copyBtn);
    wrapper.appendChild(pasteBtn);
    return wrapper;
  }

  refreshSaveSlotSelect(selectEl = document.getElementById('save-slot-select')) {
    if (!selectEl) return;
    const summaries = dataManager.getSlotSummaries();
    const optionsHtml = summaries
      .map((s, i) => {
        let pathName = s ? (CLASS_PATHS[s.path]?.name() ?? s.path) : null;
        if (pathName === null) pathName = 'Peasant';
        let text = s
          ? tp('options.saveSlot.occupied', {
            slot: i + 1, path: pathName, level: s.level,
          })
          : tp('options.saveSlot.placeholder', { slot: i + 1 });
        const classes = [];
        if (s) classes.push('used-slot');
        if (i === dataManager.getCurrentSlot()) classes.push('current-slot');
        if (i === dataManager.getCurrentSlot()) text += t('options.saveSlot.current');
        return `<option value="${i}" class="${classes.join(' ')}">${text}</option>`;
      })
      .join('');
    selectEl.innerHTML = optionsHtml;
    selectEl.value = dataManager.getCurrentSlot();
    this.refreshBackupSelect();
  }

  refreshBackupSelect(
    selectEl = document.getElementById('backup-save-select'),
    applyBtn = document.getElementById('backup-save-apply'),
  ) {
    if (!selectEl) return;

    const previousValue = selectEl.value;
    const currentSlot = dataManager.getCurrentSlot();
    const backups = dataManager.getBackupsForSlot(currentSlot);

    selectEl.innerHTML = '';

    if (!backups.length) {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = t('options.backup.empty');
      placeholder.disabled = true;
      placeholder.selected = true;
      selectEl.appendChild(placeholder);
      if (applyBtn) applyBtn.disabled = true;
      return;
    }

    let matched = false;
    backups.forEach((backup) => {
      const option = document.createElement('option');
      option.value = `${backup.slot}:${backup.timestamp}`;
      let pathText = backup.path || null;
      if (pathText) {
        pathText = CLASS_PATHS[pathText]?.name() ?? pathText;
      } else {
        pathText = t('options.backup.noPath');
      }
      option.textContent = tp('options.backup.option', {
        date: backup.date,
        slot: backup.slot + 1,
        path: pathText,
        level: backup.level ?? 0,
      });
      if (option.value === previousValue) {
        option.selected = true;
        matched = true;
      }
      selectEl.appendChild(option);
    });

    if (!matched) {
      selectEl.selectedIndex = 0;
    }

    if (applyBtn) {
      applyBtn.disabled = !selectEl.value;
    }
  }

  _createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-progress';
    resetButton.setAttribute('data-i18n', 'options.resetAllProgress');
    resetButton.textContent = t('options.resetAllProgress');
    resetButton.onclick = async () => {
      try {
        const confirmed = await showConfirmDialog(t('options.resetProgressConfirm'));
        if (confirmed) {
          game.resetAllProgress();
        }
      } catch (error) {
        console.error('Error resetting progress:', error);
        alert(t('options.resetProgressError'));
      }
    };
    return resetButton;
  }

  _createChangelogButton() {
    const changelogBtn = document.createElement('button');
    changelogBtn.id = 'view-changelog';
    changelogBtn.setAttribute('data-i18n', 'options.changelog.view');
    changelogBtn.textContent = t('options.changelog.view');
    changelogBtn.onclick = async () => {
      // Get all changelog versions, sorted descending
      const versions = Object.keys(CHANGELOG).sort((a, b) =>
        b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
      );
      let content = '<div class="changelog-modal-content">';
      content += '<button class="modal-close">✖</button>';
      content += `<h2>${t('options.changelog.title')}</h2>`;
      if (versions.length === 0) {
        content += `<div class="changelog-body">${t('options.changelog.empty')}</div>`;
      } else {
        versions.forEach((version, i) => {
          const mod = CHANGELOG[version];
          let entryHtml = '';
          if (mod && typeof mod.run === 'function') {
            try {
              entryHtml = mod.run();
            } catch (e) {
              entryHtml = `<div style="color:red;">${t('options.changelog.errorFor')} ${version}</div>`;
            }
          } else {
            entryHtml = `<div style="color:orange;">${t('options.changelog.noContentFor')} ${version}</div>`;
          }
          const expanded = i === 0 ? 'expanded' : '';
          const versionLabel =
            i === 0
              ? `${version} <span class="changelog-current">(${t('options.changelog.current')})</span>`
              : `${version}`;
          content += `
            <div class="changelog-entry ${expanded}">
              <div class="changelog-header" data-index="${i}">
                <span class="changelog-version">${versionLabel}</span>
                  <span class="changelog-toggle">${expanded ? '▼' : '▶'}</span>
              </div>
              <div class="changelog-body" style="display:${expanded ? 'block' : 'none'}">${entryHtml}</div>
            </div>
          `;
        });
      }
      content += '</div>';
      const modal = createModal({
        id: 'changelog-modal',
        className: 'changelog-modal',
        content,
      });
      modal.querySelectorAll('.changelog-header').forEach((header) => {
        header.addEventListener('click', () => {
          const entry = header.parentElement;
          const toggle = entry.querySelector('.changelog-toggle');
          const expanded = entry.classList.toggle('expanded');
          if (expanded) {
            entry.querySelector('.changelog-body').style.display = 'block';
            toggle.textContent = '▼';
          } else {
            entry.querySelector('.changelog-body').style.display = 'none';
            toggle.textContent = '▶';
          }
        });
      });
    };
    return changelogBtn;
  }

  /**
   * Creates the Discord section.
   */
  _createDiscordSection() {
    const section = document.createElement('div');
    section.className = 'option-row';
    section.innerHTML = `
      <a
        href="https://discord.gg/8rgwg2zzqc"
        target="_blank"
        rel="noopener noreferrer"
        class="discord-link"
        aria-label="${t('options.discord')}"
      >
        <span data-i18n="options.discord">Join our Discord</span>
      </a>
    `;
    return section;
  }

  /**
   * Updates the cloud save status and buttons UI. Can be called to refresh the view.
   */
  async _updateCloudSaveUI() {
    const cloudSaveStatus = document.getElementById('cloud-save-status');
    const cloudSaveBtn = document.getElementById('cloud-save-btn');
    const cloudLoadBtn = document.getElementById('cloud-load-btn');
    const logoutBtn = document.getElementById('logout-btn');

    await dataManager.checkSession();
    const userSession = dataManager.getSession();

    let statusMsg = t('options.cloud.ready');
    const formatDateWithTimezone = (dateStr) => {
      if (!dateStr) return t('options.cloud.unknown');
      const date = new Date(dateStr);
      const options = {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      };
      return date.toLocaleString(undefined, options);
    };

    try {
      const cloudResult = await dataManager.loadGame({ cloud: true, statusCheck: true });
      if (!cloudResult || cloudResult.source !== 'cloud') {
        statusMsg = t('options.cloud.none');
      } else {
        statusMsg = `${t('options.cloud.lastSave')} ${formatDateWithTimezone(cloudResult.updated_at)}`;
      }
    } catch (e) {
      console.error('Failed to load cloud data:', e);
    }

    if (!userSession) {
      const loginUrl = import.meta.env.VITE_LOGIN_URL;
      cloudSaveStatus.innerHTML = `<span class="login-status">${t('options.cloud.notLoggedIn')}</span><div><button id="login-btn" class="login-link">${t('options.cloud.login')}</button></div>`;
      cloudSaveStatus.className = 'not-logged-in';
      cloudSaveBtn.disabled = true;
      cloudSaveBtn.classList.add('disabled');
      cloudLoadBtn.disabled = true;
      cloudLoadBtn.classList.add('disabled');
      logoutBtn.style.display = 'none';

      const loginBtn = document.getElementById('login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          const onMessage = async (e) => {
            if (e.data && e.data.type === 'cloud-login-success') {
              removeEventListener('message', onMessage);
              closeModal('login-modal');
              await this._updateCloudSaveUI();
            }
          };

          createModal({
            id: 'login-modal',
            className: 'login-modal',
            content: `
              <div class="modal-content">
                <button class="modal-close">X</button>
                <iframe src="${loginUrl}-mini" class="login-iframe"></iframe>
              </div>
            `,
            onClose: () => removeEventListener('message', onMessage),
          });

          addEventListener('message', onMessage);
        });
      }
    } else {
      cloudSaveStatus.textContent = statusMsg;
      cloudSaveStatus.className = '';
      cloudSaveBtn.disabled = false;
      cloudSaveBtn.classList.remove('disabled');
      cloudLoadBtn.disabled = false;
      cloudLoadBtn.classList.remove('disabled');
      logoutBtn.style.display = '';
    }
  }
  async _initCloudSaveButtons() {
    // Initialize UI state
    await this._updateCloudSaveUI();
    const cloudSaveStatus = document.getElementById('cloud-save-status');
    const cloudSaveBtn = document.getElementById('cloud-save-btn');
    const cloudLoadBtn = document.getElementById('cloud-load-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Save
    cloudSaveBtn.addEventListener('click', async () => {
      const userSession = dataManager.getSession();
      if (!userSession) return;
      cloudSaveBtn.disabled = true;
      cloudSaveStatus.textContent = t('options.cloud.saving');
      cloudSaveStatus.className = 'saving';
      try {
        // Use robust saveGame method
        await dataManager.saveGame({ cloud: true });
        cloudSaveStatus.textContent = `${t('options.cloud.lastCloudSave')} ${new Date(Date.now()).toLocaleTimeString()}`;
      } catch (e) {
        console.error('Cloud save failed:', e);
        cloudSaveStatus.textContent = t('options.cloud.saveFailed');
        cloudSaveStatus.className = 'failed';
      } finally {
        cloudSaveBtn.disabled = !userSession;
      }
    });

    // Load
    cloudLoadBtn.addEventListener('click', async () => {
      const userSession = dataManager.getSession();
      if (!userSession) return;

      try {
        const cloudData = await dataManager.loadGame({ cloud: true });

        if (!cloudData || cloudData.source !== 'cloud') throw new Error(t('options.cloud.none'));

        const msg = `${t('options.cloud.info')}\n\n${t('options.cloud.level')}: ${
          cloudData.hero.level || 1
        }\n${t('options.cloud.gold')}: ${cloudData.hero.gold || 0}\n${t('options.cloud.crystals')}: ${
          cloudData.hero.crystals || 0
        }\n${t('options.cloud.souls')}: ${cloudData.hero.souls || 0}\n\n${t('options.cloud.overwritePrompt')}`;

        const confirmed = await showConfirmDialog(msg);

        if (confirmed) {
          await setGlobals({ cloud: true });
          // Reload the game to apply the cloud save (to make sure all globals have been updated & have correct default values)
          location.reload();
        }
      } catch (e) {
        console.error('Failed to load from cloud:', e);
        showToast(e.message || t('options.cloud.loadFailed'));
      }
    });

    logoutBtn.addEventListener('click', async () => {
      await logout();
      dataManager.clearSession();
      await this._updateCloudSaveUI();
    });
  }

  /**
   * Updates the starting stage input's max, title, and value if needed.
   * Call this whenever crystalShop.crystalUpgrades.startingStage changes.
   */
  updateStartingStageOption() {
    if (!this._startingStageInput) return;
    const oldMax = parseInt(this._startingStageInput.max, 10) || 0;
    const max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
    this._startingStageInput.max = max;

    let val = parseInt(this._startingStageInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    // If input was at default/0, reflect the current option value (possibly updated after purchase)
    // Also, if value matched previous max, follow to new max.
    if ((val === 0 || isNaN(val)) && this.startingStage > 0) {
      this._startingStageInput.value = this.startingStage;
    } else if (oldMax > 0 && val === oldMax) {
      this._startingStageInput.value = max;
    } else {
      this._startingStageInput.value = val;
    }

    // Update inline input if present
    const inlineInput = document.querySelector('#inline-stage-controls .starting-stage-input');
    if (inlineInput) {
      const oldInlineMax = parseInt(inlineInput.max, 10) || 0;
      inlineInput.max = max;
      let v = parseInt(inlineInput.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      if (v > max) v = max;
      if ((v === 0 || isNaN(v)) && this.startingStage > 0) {
        inlineInput.value = this.startingStage;
      } else if (oldInlineMax > 0 && v === oldInlineMax) {
        inlineInput.value = max;
      } else {
        inlineInput.value = v;
      }
    }
  }

  updateAutoSortInventoryOption() {
    if (!this._autoSortInventoryToggle) return;
    const purchased = !!crystalShop.crystalUpgrades?.autoSortInventory;
    this._autoSortInventoryToggle.disabled = !purchased;
    const toggleBtn = this._autoSortInventoryWrapper?.querySelector('.toggle-btn');
    if (toggleBtn) toggleBtn.classList.toggle('disabled', !purchased);
  }
}