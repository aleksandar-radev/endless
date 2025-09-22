
import { crystalShop, dataManager, game, setGlobals, training, soulShop, statistics, ascension, runes, skillTree } from './globals.js';
import { CLASS_PATHS } from './constants/skills.js';
import { initializeBuildingsUI } from './ui/buildingUi.js';
import { crypt } from './functions.js';
import {
  showConfirmDialog,
  showToast,
  updateStageUI,
  updateResources,
  updatePlayerLife,
  updateEnemyStatLabels,
  showTooltip,
  positionTooltip,
  hideTooltip,
  initializeSkillTreeStructure,
} from './ui/ui.js';
import { updateBuffIndicators } from './ui/skillTreeUi.js';
import { closeModal, createModal } from './ui/modal.js';
import Enemy from './enemy.js';
import { logout } from './api.js';
import { CHANGELOG } from './changelog/changelog.js';
import upcommingChanges from './upcoming.js';
import { audioManager } from './audio.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { setLanguage, t } from './i18n.js';
import {
  SOUL_SHOP_MAX_QTY,
  CRYSTAL_SHOP_MAX_QTY,
  TRAINING_MAX_QTY,
  BUILDING_MAX_QTY,
  GLOBAL_MAX_QTY,
} from './constants/limits.js';

const html = String.raw;

const OPTION_TOOLTIPS = {
  languageLabel: () => html`Select the game language`,
  languageSelect: () => html`Change the game's language`,
  soundVolumeLabel: () => html`Adjust overall sound volume`,
  soundVolumeSlider: () => html`${t('options.soundVolume.tooltip')}`,
  advancedTooltipsLabel: () => html`Show detailed information in item tooltips`,
  advancedAttrTooltipsLabel: () => html`Display extra attribute details in tooltips`,
  showRateCountersLabel: () => html`Toggle the resource rate counters bar`,
  rateCountersPeriodLabel: () => html`Period used to calculate rate counters`,
  showInfoMessagesLabel: () => html`Display informational messages during gameplay`,
  showNotificationsLabel: () => html`Enable browser notifications for game events`,
  showCombatTextLabel: () => html`Show damage numbers and other combat text`,
  stageSkipLabel: () => html`Skip ahead by this many stages after each kill`,
  stageSkipInput: (getMax) => html`${t('options.max')}: ${getMax()} ${t('options.basedOnCrystal')}`,
  stageLockToggleLabel: () => html`Enable or disable locking stage progression`,
  stageLockToggle: (isPurchased) =>
    html`${isPurchased() ? '' : t('options.stageLock.disabledTooltip')}`,
  stageLockStageLabel: () => html`Stage at which progression will lock`,
  stageLockStageInput: (isPurchased) =>
    html`${isPurchased() ? '' : t('options.stageLock.disabledTooltip')}`,
  arenaBossSkipLabel: () => html`${t('options.arenaBossSkip.tooltip')}`,
  arenaBossSkipInput: (getMax) => html`${t('options.max')}: ${getMax()} ${t('options.basedOnAscensionAndRunes')}`,
  resetStageSkipLabel: () => html`Stage where stage skip resets to zero`,
  resetStageSkipInput: (isPurchased) =>
    html`${isPurchased()
      ? t('options.resetStageSkip.enabledTooltip')
      : t('options.resetStageSkip.disabledTooltip')}`,
  startingStageLabel: () => html`Stage to begin from after resetting`,
  startingStageInput: (getMax) => html`${t('options.max')}: ${getMax()} ${t('options.basedOnCrystal')}`,
  shortElementalNamesLabel: () => html`Use abbreviated elemental stat names`,
  showSkillCooldownsLabel: () => html`Display numeric cooldown timers on skills`,
  showAllStatsLabel: () => html`Display every available statistic`,
  quickTrainingLabel: () => html`Enable quick buy buttons for training`,
  bulkTrainingLabel: () => html`Allow purchasing multiple training levels at once`,
  quickSoulShopLabel: () => html`Enable quick purchase buttons in the soul shop`,
  quickSkillsLabel: () => html`Enable quick allocation in the skill tree`,
  numericInputLabel: () => html`Use numeric fields to specify purchase quantities`,
  autoSortInventoryLabel: () => html`Automatically sort inventory items`,
  autoSortInventoryToggle: (isPurchased) =>
    html`${isPurchased() ? '' : t('options.autoSortInventory.disabledTooltip')}`,
  enemyStatsLabel: () => html`Display enemy statistics during combat`,
  stageControlsInlineLabel: () => html`Show stage controls under enemy in Explore`,
  shortNumbersLabel: () => html`Display large numbers using abbreviations`,
  rollPercentilesLabel: () => html`${t('options.rollPercentiles.tooltip')}`,
};

function attachTooltip(el, key, ...params) {
  el.addEventListener('mouseenter', (e) => showTooltip(OPTION_TOOLTIPS[key](...params), e));
  el.addEventListener('mousemove', positionTooltip);
  el.addEventListener('mouseleave', hideTooltip);
}

// Options class to store options and version (future-proof for migrations)
export class Options {
  constructor(data = {}) {
    this.version = data.version || '0.8.6';
    // Add startingStage, default to null (unset)
    this.startingStage = data.startingStage || null;
    // Add showEnemyStats option, default to false
    this.showEnemyStats = data.showEnemyStats ?? false;
    // Option to show all stats including those hidden by default
    this.showAllStats = data.showAllStats ?? false;
    this.resetRequired = data.resetRequired ?? null;
    // Add stageSkip option, default to 0
    this.stageSkip = data.stageSkip || 0;
    // Add arena boss skip option, default to 0
    this.arenaBossSkip = data.arenaBossSkip || 0;
    // Add resetStageSkip option, default to 0 (disabled)
    this.resetStageSkip = data.resetStageSkip || 0;
    // Option to lock stage progression at a chosen stage
    this.stageLockEnabled = data.stageLockEnabled ?? false;
    this.stageLock = data.stageLock || 0;
    // Add soundVolume option, default to 0
    this.soundVolume = typeof data.soundVolume === 'number' ? data.soundVolume : 0;
    // Remember salvage preference across prestiges
    this.salvageMaterialsEnabled = data.salvageMaterialsEnabled ?? false;
    // Enable auto inventory sorting
    this.autoSortInventory = data.autoSortInventory ?? false;
    // Add advanced tooltips option
    this.showAdvancedTooltips = data.showAdvancedTooltips ?? false;
    // Add advanced attribute tooltips option
    this.showAdvancedAttributeTooltips = data.showAdvancedAttributeTooltips ?? false;
    // Show rate counters bar
    this.showRateCounters = data.showRateCounters ?? false;
    // Period for rate counters in seconds
    this.rateCountersPeriod = data.rateCountersPeriod || 1;
    // Enable quick training purchases
    this.quickTraining = data.quickTraining ?? false;
    // Enable bulk training purchases
    this.bulkTraining = data.bulkTraining ?? false;
    // Enable quick soul shop purchases
    this.quickSoulShop = data.quickSoulShop ?? false;
    // Enable quick skill allocations
    this.quickSkills = data.quickSkills ?? false;
    // Use numeric inputs for bulk purchases
    this.useNumericInputs = data.useNumericInputs ?? false;
    // Default quantities for bulk purchases
    this.soulShopQty =
      typeof data.soulShopQty === 'number'
        ? Math.min(data.soulShopQty, SOUL_SHOP_MAX_QTY)
        : 1;
    this.soulShopQuickQty =
      typeof data.soulShopQuickQty === 'number'
        ? Math.min(data.soulShopQuickQty, SOUL_SHOP_MAX_QTY)
        : 1;
    this.crystalShopQty =
      typeof data.crystalShopQty === 'number'
        ? Math.min(data.crystalShopQty, CRYSTAL_SHOP_MAX_QTY)
        : 1;
    this.trainingQty =
      typeof data.trainingQty === 'number'
        ? Math.min(data.trainingQty, TRAINING_MAX_QTY)
        : 1;
    this.trainingQuickQty =
      typeof data.trainingQuickQty === 'number'
        ? Math.min(data.trainingQuickQty, TRAINING_MAX_QTY)
        : 1;
    this.skillQuickQty =
      typeof data.skillQuickQty === 'number'
        ? Math.max(1, Math.min(data.skillQuickQty, GLOBAL_MAX_QTY))
        : 1;
    this.buildingQty =
      typeof data.buildingQty === 'number'
        ? Math.min(data.buildingQty, BUILDING_MAX_QTY)
        : 1;
    // Preferred language, default to English
    this.language = data.language || 'en';
    // Use short elemental stat names
    this.shortElementalNames = data.shortElementalNames ?? false;
    // Use shortened number notation
    this.shortNumbers = data.shortNumbers ?? false;
    // Show cooldown numbers on skill slots
    this.showSkillCooldowns = data.showSkillCooldowns ?? false;
    // Show informational toast messages
    this.showInfoMessages = data.showInfoMessages ?? true;
    // Show bottom notifications for loot and materials
    this.showNotifications = data.showNotifications ?? true;
    // Show combat texts (damage numbers, level up text)
    this.showCombatText = data.showCombatText ?? true;
    // Show stage controls under enemy in Explore panel
    this.showStageControlsInline = data.showStageControlsInline ?? false;
    // Show roll quality percentiles instead of min/max ranges
    this.showRollPercentiles = data.showRollPercentiles ?? false;
  }

  /**
   * Main entry to initialize the Options tab UI.
   */
  initializeOptionsUI() {
    this._renderOptionsUI();
    this._initCloudSaveButtons();
    // Always set audio volume to current option when initializing options UI
    audioManager.setVolume(this.soundVolume);
  }


  /**
   * Creates the language selection dropdown.
   */
  _createLanguageOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="language-select" data-i18n="options.language">Language:</label>
      <select id="language-select">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="zh">中文</option>
      </select>
      <span data-i18n="options.lang.note">Not everything translated yet. You might still see translations in english, as a default language. You might want to refresh page after changing language, to see all changes take effect.</span>
    `;
    const label = wrapper.querySelector('label');
    const select = wrapper.querySelector('select');
    attachTooltip(label, 'languageLabel');
    attachTooltip(select, 'languageSelect');
    select.value = this.language;
    select.addEventListener('change', () => {
      this.language = select.value;
      setLanguage(this.language);
      dataManager.saveGame();
    });
    return wrapper;
  }

  /**
   * Creates the sound volume slider UI.
   */
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
    attachTooltip(label, 'soundVolumeLabel');
    attachTooltip(slider, 'soundVolumeSlider');
    slider.addEventListener('input', () => {
      let val = parseFloat(slider.value);
      if (isNaN(val) || val < 0) val = 0;
      if (val > 1) val = 1;
      this.soundVolume = val;
      valueLabel.textContent = `${Math.round(val * 100)}%`;
      // Set global audio volume
      audioManager.setVolume(val);
      // Save option
      dataManager.saveGame();
    });
    // Set initial volume on load
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

    // --- Tabs ---
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

    // --- Game Options Content ---
    const gameContent = document.createElement('div');
    gameContent.className = 'options-content active';
    gameContent.appendChild(this._createAdvancedTooltipsOption());
    gameContent.appendChild(this._createAdvancedAttributeTooltipsOption());
    gameContent.appendChild(this._createRollPercentilesOption());
    gameContent.appendChild(this._createEnemyStatsToggleOption());
    gameContent.appendChild(this._createShowAllStatsOption());
    gameContent.appendChild(this._createShortElementalNamesOption());
    gameContent.appendChild(this._createShortNumbersOption());
    gameContent.appendChild(this._createQuickTrainingOption());
    gameContent.appendChild(this._createBulkTrainingOption());
    gameContent.appendChild(this._createQuickSoulShopOption());
    gameContent.appendChild(this._createQuickSkillsOption());
    gameContent.appendChild(this._createNumericInputOption());
    gameContent.appendChild(this._createAutoSortInventoryOption());
    gameContent.appendChild(this._createStageControlsInlineOption());
    gameContent.appendChild(this._createStartingStageOption());
    gameContent.appendChild(this._createStageSkipOption());
    gameContent.appendChild(this._createStageLockToggleOption());
    gameContent.appendChild(this._createStageLockInputOption());
    gameContent.appendChild(this._createArenaBossSkipOption());
    gameContent.appendChild(this._createResetStageSkipOption());
    gameContent.appendChild(this._createRateCountersOption());
    gameContent.appendChild(this._createRateCountersPeriodOption());
    gameContent.appendChild(this._createShowInfoMessagesOption());
    gameContent.appendChild(this._createShowNotificationsOption());
    gameContent.appendChild(this._createShowCombatTextOption());

    // --- General Options Content ---
    const generalContent = document.createElement('div');
    generalContent.className = 'options-content';
    generalContent.appendChild(this._createCloudSaveBar());
    generalContent.appendChild(this._createSaveSlotOption());
    generalContent.appendChild(this._createSaveTextButtons());
    generalContent.appendChild(this._createLanguageOption());
    generalContent.appendChild(this._createSoundVolumeOption());

    const changelogRow = document.createElement('div');
    changelogRow.className = 'changelog-row';
    changelogRow.appendChild(this._createChangelogButton());
    changelogRow.appendChild(this._createUpcomingChangesButton());
    generalContent.appendChild(changelogRow);

    generalContent.appendChild(this._createDiscordSection());

    const suggestionsRow = document.createElement('div');
    suggestionsRow.innerHTML = html`
      ${t('options.currentVersion')} ${this.version}.
      <br>
      <br>
      ${t('options.suggestionsPrompt')}
      <br>
      <br>
      ${t('options.desktopDownload')} <a style="color:#fff; background:#0078d7; padding:2px 8px; border-radius:4px; text-decoration:none; font-weight:bold;" target="_blank" href="https://github.com/aleksandar-radev/endless/releases">${t('options.here')}</a>.
    `;
    generalContent.appendChild(suggestionsRow);
    generalContent.appendChild(this._createResetButton());

    container.appendChild(gameContent);
    container.appendChild(generalContent);

    // --- Tab Switching Logic ---
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

  /**
   * Creates the advanced tooltips toggle option UI.
   */
  _createAdvancedTooltipsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="advanced-tooltips-toggle" class="advanced-tooltips-toggle-label" data-i18n="options.advancedTooltips">Show Advanced Item Tooltips:</label>
      <input
        type="checkbox"
        id="advanced-tooltips-toggle"
        class="advanced-tooltips-toggle"
        ${this.showAdvancedTooltips ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.advanced-tooltips-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'advancedTooltipsLabel');
    // Make the toggle button clickable and sync with checkbox
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showAdvancedTooltips = checkbox.checked;
      // Save option
      dataManager.saveGame();
      // Optionally, refresh tooltips if needed
    });
    return wrapper;
  }

  _createAdvancedAttributeTooltipsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="advanced-attr-tooltips-toggle" class="advanced-attr-tooltips-toggle-label" data-i18n="options.advancedAttributeTooltips">Show Advanced Attribute Tooltips:</label>
      <input
        type="checkbox"
        id="advanced-attr-tooltips-toggle"
        class="advanced-attr-tooltips-toggle"
        ${this.showAdvancedAttributeTooltips ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.advanced-attr-tooltips-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'advancedAttrTooltipsLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showAdvancedAttributeTooltips = checkbox.checked;
      dataManager.saveGame();
      updateStatsAndAttributesUI(true);
    });
    return wrapper;
  }

  _createRollPercentilesOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="roll-percentiles-toggle" class="roll-percentiles-toggle-label" data-i18n="options.rollPercentiles">Show Roll Percentiles:</label>
      <input
        type="checkbox"
        id="roll-percentiles-toggle"
        class="roll-percentiles-toggle"
        ${this.showRollPercentiles ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.roll-percentiles-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'rollPercentilesLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showRollPercentiles = checkbox.checked;
      dataManager.saveGame();
    });
    return wrapper;
  }

  _createRateCountersOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="rate-counters-toggle" class="rate-counters-toggle-label" data-i18n="options.showRateCounters">Show Counters Bar:</label>
      <input
        type="checkbox"
        id="rate-counters-toggle"
        class="rate-counters-toggle"
        ${this.showRateCounters ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.rate-counters-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showRateCountersLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showRateCounters = checkbox.checked;
      dataManager.saveGame();
      document.dispatchEvent(new CustomEvent('toggleRateCounters', { detail: this.showRateCounters }));
    });
    return wrapper;
  }

  _createRateCountersPeriodOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="rate-counters-period" class="rate-counters-period-label" data-i18n="options.rateCountersPeriod">Counters Period (sec):</label>
      <input
        type="number"
        id="rate-counters-period"
        class="rate-counters-period-input"
        min="1"
        value="${this.rateCountersPeriod}"
      />
    `;
    const label = wrapper.querySelector('.rate-counters-period-label');
    const input = wrapper.querySelector('input');
    attachTooltip(label, 'rateCountersPeriodLabel');
    input.addEventListener('change', () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v <= 0) v = 3600;
      this.rateCountersPeriod = v;
      dataManager.saveGame();
      document.dispatchEvent(new CustomEvent('ratePeriodChange', { detail: v }));
    });
    return wrapper;
  }

  _createShowInfoMessagesOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="show-info-messages-toggle" class="show-info-messages-toggle-label" data-i18n="options.showInfoMessages">Show Info Messages:</label>
      <input
        type="checkbox"
        id="show-info-messages-toggle"
        class="show-info-messages-toggle"
        ${this.showInfoMessages ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.show-info-messages-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showInfoMessagesLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showInfoMessages = checkbox.checked;
      dataManager.saveGame();
    });
    return wrapper;
  }

  _createShowNotificationsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="show-notifications-toggle" class="show-notifications-toggle-label" data-i18n="options.showNotifications">Show Notifications:</label>
      <input
        type="checkbox"
        id="show-notifications-toggle"
        class="show-notifications-toggle"
        ${this.showNotifications ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.show-notifications-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showNotificationsLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showNotifications = checkbox.checked;
      dataManager.saveGame();
    });
    return wrapper;
  }

  _createShowCombatTextOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="show-combat-text-toggle" class="show-combat-text-toggle-label" data-i18n="options.showCombatText">Show Combat Texts:</label>
      <input
        type="checkbox"
        id="show-combat-text-toggle"
        class="show-combat-text-toggle"
        ${this.showCombatText ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.show-combat-text-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showCombatTextLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showCombatText = checkbox.checked;
      dataManager.saveGame();
    });
    return wrapper;
  }

  /**
   * Creates the stage skip number input UI.
   */
  _createStageSkipOption() {
    let max = crystalShop.crystalUpgrades?.stageSkip || 0;
    const value = this.stageSkip !== null ? this.stageSkip : 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="stage-skip-input" class="stage-skip-label" data-i18n="options.stageSkipPerKill">Stage Skip per Kill:</label>
      <input
        type="number"
        id="stage-skip-input"
        class="stage-skip-input"
        min="0"
        max="${max}"
        value="${value}"
      />
      <button class="max-btn" type="button" data-i18n="common.max">Max</button>
      <button class="apply-btn" type="button" data-i18n="common.apply">Apply</button>
    `;

    const label = wrapper.querySelector('.stage-skip-label');
    const input = wrapper.querySelector('input');
    const maxBtn = wrapper.querySelector('.max-btn');
    const applyBtn = wrapper.querySelector('.apply-btn');
    attachTooltip(label, 'stageSkipLabel');
    attachTooltip(input, 'stageSkipInput', () => crystalShop.crystalUpgrades?.stageSkip || 0);

    // Store refs for update
    this._stageSkipInput = input;
    this._stageSkipWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');
    if (maxBtn) {
      maxBtn.onmouseenter = () => maxBtn.classList.add('hover');
      maxBtn.onmouseleave = () => maxBtn.classList.remove('hover');
      maxBtn.onclick = () => {
        const max = crystalShop.crystalUpgrades?.stageSkip || 0;
        input.value = max;
        input.dispatchEvent(new Event('input'));
      };
    }

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      let max = crystalShop.crystalUpgrades?.stageSkip || 0;
      if (isNaN(val) || val < 0) val = 0;
      if (val > max) val = max;
      input.value = val;
    });

    applyBtn.onclick = () => {
      let val = parseInt(input.value, 10);
      let max = crystalShop.crystalUpgrades?.stageSkip || 0;
      if (isNaN(val) || val < 0) val = 0;
      if (val > max) val = max;

      this.stageSkip = val;
      dataManager.saveGame();
      showToast(t('options.toast.stageSkipApplied'), 'success');
    };

    // Initial update to ensure correct max/value
    this.updateStageSkipOption();

    return wrapper;
  }

  _createStageLockToggleOption() {
    const purchased = !!crystalShop.crystalUpgrades?.stageLock;
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="stage-lock-toggle" class="stage-lock-toggle-label" data-i18n="options.stageLock">Stage Lock:</label>
      <input
        type="checkbox"
        id="stage-lock-toggle"
        class="stage-lock-toggle"
        ${this.stageLockEnabled ? 'checked' : ''}
        ${purchased ? '' : 'disabled'}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.stage-lock-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'stageLockToggleLabel');
    attachTooltip(checkbox, 'stageLockToggle', () => !!crystalShop.crystalUpgrades?.stageLock);
    toggleBtn.addEventListener('click', () => {
      if (checkbox.disabled) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.stageLockEnabled = checkbox.checked;
      dataManager.saveGame();
    });
    this._stageLockToggle = checkbox;
    this._stageLockToggleWrapper = wrapper;
    this.updateStageLockOption();
    return wrapper;
  }

  _createStageLockInputOption() {
    const purchased = !!crystalShop.crystalUpgrades?.stageLock;
    const value = this.stageLock || 0;
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="stage-lock-input" class="stage-lock-label" data-i18n="options.stageLockStage">Lock at Stage:</label>
      <input
        type="number"
        id="stage-lock-input"
        class="stage-lock-input"
        min="0"
        value="${value}"
        ${purchased ? '' : 'disabled'}
      />
      <button class="max-btn" type="button" ${purchased ? '' : 'disabled'} data-i18n="common.max">Max</button>
      <button class="apply-btn" type="button" ${purchased ? '' : 'disabled'} data-i18n="common.apply">Apply</button>
    `;
    const label = wrapper.querySelector('.stage-lock-label');
    const input = wrapper.querySelector('input');
    const maxBtn = wrapper.querySelector('.max-btn');
    const applyBtn = wrapper.querySelector('.apply-btn');
    attachTooltip(label, 'stageLockStageLabel');
    attachTooltip(input, 'stageLockStageInput', () => !!crystalShop.crystalUpgrades?.stageLock);

    this._stageLockInput = input;
    this._stageLockWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');
    if (maxBtn) {
      maxBtn.onmouseenter = () => maxBtn.classList.add('hover');
      maxBtn.onmouseleave = () => maxBtn.classList.remove('hover');
      maxBtn.onclick = () => {
        const highest = Math.max(
          ...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0),
        );
        input.value = highest || 0;
        input.dispatchEvent(new Event('input'));
      };
    }

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      input.value = val;
    });

    applyBtn.onclick = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      this.stageLock = val;
      dataManager.saveGame();
      showToast(t('options.toast.stageLockApplied'), 'success');
    };

    this.updateStageLockOption();

    return wrapper;
  }

  _createArenaBossSkipOption() {
    const runeBonuses = runes?.getBonusEffects?.() || {};
    let max = (ascension.getBonuses()?.arenaBossSkip || 0) + (runeBonuses.arenaBossSkip || 0);
    const value = this.arenaBossSkip != null ? this.arenaBossSkip : 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="boss-skip-input" class="boss-skip-label" data-i18n="options.arenaBossSkipPerKill">Boss Skip per Kill:</label>
      <input
        type="number"
        id="boss-skip-input"
        class="boss-skip-input"
        min="0"
        max="${max}"
        value="${value}"
      />
      <button class="max-btn" type="button" data-i18n="common.max">Max</button>
      <button class="apply-btn" type="button" data-i18n="common.apply">Apply</button>
    `;

    const label = wrapper.querySelector('.boss-skip-label');
    const input = wrapper.querySelector('input');
    const maxBtn = wrapper.querySelector('.max-btn');
    const applyBtn = wrapper.querySelector('.apply-btn');
    attachTooltip(label, 'arenaBossSkipLabel');
    attachTooltip(input, 'arenaBossSkipInput', () => {
      const rb = runes?.getBonusEffects?.() || {};
      return (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
    });

    this._bossSkipInput = input;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');
    if (maxBtn) {
      maxBtn.onmouseenter = () => maxBtn.classList.add('hover');
      maxBtn.onmouseleave = () => maxBtn.classList.remove('hover');
      maxBtn.onclick = () => {
        const rb = runes?.getBonusEffects?.() || {};
        const m = (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
        input.value = m;
        input.dispatchEvent(new Event('input'));
      };
    }

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      const rb = runes?.getBonusEffects?.() || {};
      let m = (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
      if (isNaN(val) || val < 0) val = 0;
      if (val > m) val = m;
      input.value = val;
    });

    applyBtn.onclick = () => {
      let val = parseInt(input.value, 10);
      const rb = runes?.getBonusEffects?.() || {};
      let m = (ascension.getBonuses()?.arenaBossSkip || 0) + (rb.arenaBossSkip || 0);
      if (isNaN(val) || val < 0) val = 0;
      if (val > m) val = m;
      this.arenaBossSkip = val;
      dataManager.saveGame();
      showToast(t('options.toast.arenaBossSkipApplied'), 'success');
    };

    this.updateArenaBossSkipOption();

    return wrapper;
  }

  /**
   * Updates the stage skip input's max, title, and value if needed.
   * Call this whenever crystalShop.crystalUpgrades.stageSkip changes.
   */
  updateStageSkipOption() {
    if (!this._stageSkipInput) return;
    const oldMax = parseInt(this._stageSkipInput.max, 10) || 0;
    const max = crystalShop.crystalUpgrades?.stageSkip || 0;
    this._stageSkipInput.max = max;

    let val = parseInt(this._stageSkipInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    // If user hadn't set a custom value (0/default), bump to current option (which may be newly synced)
    // Also, if user value was exactly the previous max, follow the new max.
    if ((val === 0 || isNaN(val)) && this.stageSkip > 0) {
      this._stageSkipInput.value = this.stageSkip;
    } else if (oldMax > 0 && val === oldMax) {
      this._stageSkipInput.value = max;
    } else {
      this._stageSkipInput.value = val;
    }

    // Update inline input if present
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
    if (this._stageLockToggle) {
      this._stageLockToggle.disabled = !purchased;
      const toggleBtn = this._stageLockToggleWrapper?.querySelector('.toggle-btn');
      if (toggleBtn) toggleBtn.classList.toggle('disabled', !purchased);
    }
    if (this._stageLockInput) {
      this._stageLockInput.disabled = !purchased;
      const applyBtn = this._stageLockWrapper?.querySelector('.apply-btn');
      const maxBtn = this._stageLockWrapper?.querySelector('.max-btn');
      if (applyBtn) applyBtn.disabled = !purchased;
      if (maxBtn) maxBtn.disabled = !purchased;
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

  _createResetStageSkipOption() {
    const purchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
    const value = this.resetStageSkip || 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="reset-stage-skip-input" class="reset-stage-skip-label" data-i18n="options.resetStageSkipAt">Reset Stage Skip At:</label>
      <input
        type="number"
        id="reset-stage-skip-input"
        class="reset-stage-skip-input"
        min="0"
        value="${value}"
        ${purchased ? '' : 'disabled'}
      />
      <button class="max-btn" type="button" ${purchased ? '' : 'disabled'} data-i18n="common.max">Max</button>
      <button class="apply-btn" type="button" ${purchased ? '' : 'disabled'} data-i18n="common.apply">Apply</button>
    `;

    const label = wrapper.querySelector('.reset-stage-skip-label');
    const input = wrapper.querySelector('input');
    const maxBtn = wrapper.querySelector('.max-btn');
    const applyBtn = wrapper.querySelector('.apply-btn');
    attachTooltip(label, 'resetStageSkipLabel');
    attachTooltip(input, 'resetStageSkipInput', () => !!crystalShop.crystalUpgrades?.resetStageSkip);

    this._resetStageSkipInput = input;
    this._resetStageSkipWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');
    if (maxBtn) {
      maxBtn.onmouseenter = () => maxBtn.classList.add('hover');
      maxBtn.onmouseleave = () => maxBtn.classList.remove('hover');
      maxBtn.onclick = () => {
        // Use highest stage reached across all tiers as a sensible maximum
        const highest = Math.max(
          ...Array.from({ length: 12 }, (_, i) => statistics.highestStages[i + 1] || 0),
        );
        input.value = highest || 0;
        input.dispatchEvent(new Event('input'));
      };
    }

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      input.value = val;
    });

    applyBtn.onclick = () => {
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      this.resetStageSkip = val;
      dataManager.saveGame();
      showToast(t('options.toast.resetStageSkipApplied'), 'success');
    };

    this.updateResetStageSkipOption();

    return wrapper;
  }

  updateResetStageSkipOption() {
    if (!this._resetStageSkipInput) return;
    const purchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
    this._resetStageSkipInput.disabled = !purchased;
    const btns = this._resetStageSkipWrapper?.querySelectorAll('.apply-btn, .max-btn');
    if (btns) btns.forEach((b) => (b.disabled = !purchased));

    // Update inline input/button if present
    const inlineInput = document.querySelector('#inline-stage-controls .reset-stage-skip-input');
    if (inlineInput) inlineInput.disabled = !purchased;
    const inlineRow = inlineInput?.closest('.option-row');
    const inlineBtn = inlineRow?.querySelector('.apply-btn');
    if (inlineBtn) inlineBtn.disabled = !purchased;
  }

  /**
   * Creates the cloud save/load bar UI.
   */
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
      <label for="save-slot-select">Save Slot:</label>
      <select id="save-slot-select"></select>
      <button id="save-slot-apply">${t('common.apply')}</button>
    `;
    const select = wrapper.querySelector('#save-slot-select');
    const apply = wrapper.querySelector('#save-slot-apply');
    this.refreshSaveSlotSelect(select);
    apply.addEventListener('click', async () => {
      const slot = parseInt(select.value, 10);
      if (slot === dataManager.getCurrentSlot()) return;
      await dataManager.saveGame();
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

  /**
   * Refreshes the save slot dropdown with latest summaries.
   * @param {HTMLSelectElement} [selectEl]
   */
  refreshSaveSlotSelect(selectEl = document.getElementById('save-slot-select')) {
    if (!selectEl) return;
    const summaries = dataManager.getSlotSummaries();
    const optionsHtml = summaries
      .map((s, i) => {
        let pathName = s ? CLASS_PATHS[s.path]?.name() ?? s.path : null;
        if (pathName === null) pathName = 'Peasant';
        let text = s
          ? `Slot ${i + 1} - ${pathName} Lv ${s.level}`
          : `Slot ${i + 1} - Empty`;
        const classes = [];
        if (s) classes.push('used-slot');
        if (i === dataManager.getCurrentSlot()) classes.push('current-slot');
        if (i === dataManager.getCurrentSlot()) text += ' (Current)';
        return `<option value="${i}" class="${classes.join(' ')}">${text}</option>`;
      })
      .join('');
    selectEl.innerHTML = optionsHtml;
    selectEl.value = dataManager.getCurrentSlot();
  }

  /**
   * Creates the reset progress button and its logic.
   */
  _createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-progress';
    resetButton.setAttribute('data-i18n', 'options.resetAllProgress');
    resetButton.textContent = t('options.resetAllProgress');
    resetButton.onclick = async () => {
      try {
        const confirmed = await showConfirmDialog(
          t('options.resetProgressConfirm'),
        );
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

  /**
   * Creates the changelog button and its modal logic.
   */
  _createChangelogButton() {
    const changelogBtn = document.createElement('button');
    changelogBtn.id = 'view-changelog';
    changelogBtn.setAttribute('data-i18n', 'options.changelog.view');
    changelogBtn.textContent = t('options.changelog.view');
    changelogBtn.onclick = async () => {
      // Get all changelog versions, sorted descending
      const versions = Object.keys(CHANGELOG).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
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
            i === 0 ? `${version} <span class="changelog-current">(${t('options.changelog.current')})</span>` : `${version}`;
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
   * Creates the Upcoming Changes button and its modal logic.
   */
  _createUpcomingChangesButton() {
    const upcomingBtn = document.createElement('button');
    upcomingBtn.id = 'view-upcoming';
    upcomingBtn.setAttribute('data-i18n', 'options.upcoming.view');
    upcomingBtn.textContent = t('options.upcoming.view');
    upcomingBtn.onclick = async () => {
      let text = '';
      text = upcommingChanges();
      let content = '<div class="changelog-modal-content">';
      content += '<button class="modal-close">X</button>';
      content += `<h2>${t('options.upcoming.title')}</h2>`;
      content += `<div class="changelog-body">${text || ''}</div>`;
      content += '</div>';
      createModal({
        id: 'upcoming-modal',
        className: 'changelog-modal',
        content,
      });
    };
    return upcomingBtn;
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
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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
      cloudSaveStatus.innerHTML =
        `<span class="login-status">${t('options.cloud.notLoggedIn')}</span><div><button id="login-btn" class="login-link">${t('options.cloud.login')}</button></div>`;
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
                <button class="modal-close">�</button>
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
   * Creates the starting stage number input UI.
   */
  _createStartingStageOption() {
    let max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
    const value = this.startingStage !== null ? this.startingStage : 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="starting-stage-input" class="starting-stage-label" data-i18n="options.startingStage">Starting Stage:</label>
      <input
        type="number"
        id="starting-stage-input"
        class="starting-stage-input"
        min="0"
        max="${max}"
        value="${value}"
      />
      <button class="max-btn" type="button" data-i18n="common.max">Max</button>
      <button class="apply-btn" type="button" data-i18n="common.apply">Apply</button>
    `;

    const label = wrapper.querySelector('.starting-stage-label');
    const input = wrapper.querySelector('input');
    const maxBtn = wrapper.querySelector('.max-btn');
    const applyBtn = wrapper.querySelector('.apply-btn');
    attachTooltip(label, 'startingStageLabel');
    attachTooltip(input, 'startingStageInput', () => 1 + (crystalShop.crystalUpgrades?.startingStage || 0));

    // Store refs for update
    this._startingStageInput = input;
    this._startingStageWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');
    if (maxBtn) {
      maxBtn.onmouseenter = () => maxBtn.classList.add('hover');
      maxBtn.onmouseleave = () => maxBtn.classList.remove('hover');
      maxBtn.onclick = () => {
        const max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
        input.value = max;
        input.dispatchEvent(new Event('input'));
      };
    }

    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      let max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
      if (isNaN(val) || val < 0) val = 0;
      if (val > max) val = max;
      input.value = val;
    });

    applyBtn.onclick = () => {
      let val = parseInt(input.value, 10);
      let max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
      if (isNaN(val) || val < 0) val = 0;
      if (val > max) val = max;

      this.startingStage = val;
      if (game.fightMode === 'explore') {
        game.stage = game.getStartingStage();
        game.currentEnemy = new Enemy(game.stage);
        updateStageUI();
        game.resetAllLife();
      }
      dataManager.saveGame();
      showToast(t('options.toast.startingStageApplied'), 'success');
    };

    // Initial update to ensure correct max/value
    this.updateStartingStageOption();

    return wrapper;
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

  /**
   * Creates the toggle for short/long elemental stat names.
   */
  _createShortElementalNamesOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="short-elemental-names-toggle" class="short-elemental-names-toggle-label" data-i18n="options.shortElementalNames">Use Short Elemental Stat Names:</label>
      <input
        type="checkbox"
        id="short-elemental-names-toggle"
        class="short-elemental-names-toggle"
        ${this.shortElementalNames ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.short-elemental-names-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'shortElementalNamesLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.shortElementalNames = checkbox.checked;
      dataManager.saveGame();
      updateStatsAndAttributesUI(true);
      updateEnemyStatLabels();
    });
    return wrapper;
  }

  _createShortNumbersOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="short-numbers-toggle" class="short-numbers-toggle-label" data-i18n="options.shortNumbers">Use Short Number Notation:</label>
      <input
        type="checkbox"
        id="short-numbers-toggle"
        class="short-numbers-toggle"
        ${this.shortNumbers ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.short-numbers-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'shortNumbersLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.shortNumbers = checkbox.checked;
      dataManager.saveGame();
      updateResources();
      updateStatsAndAttributesUI(true);
      updateStageUI();
      updatePlayerLife();
      training.updateTrainingUI('gold-upgrades');
      crystalShop.updateCrystalShopUI();
      soulShop.updateSoulShopUI();
      initializeBuildingsUI();
    });
    return wrapper;
  }

  /**
   * Creates the show skill cooldown numbers toggle option UI.
   */
  _createShowSkillCooldownsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="show-skill-cooldowns-toggle" class="show-skill-cooldowns-toggle-label" data-i18n="options.showSkillCooldowns">Show Skill Cooldown Numbers:</label>
      <input
        type="checkbox"
        id="show-skill-cooldowns-toggle"
        class="show-skill-cooldowns-toggle"
        ${this.showSkillCooldowns ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.show-skill-cooldowns-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showSkillCooldownsLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showSkillCooldowns = checkbox.checked;
      dataManager.saveGame();
      updateBuffIndicators();
    });
    return wrapper;
  }

  /**
   * Creates the show all stats toggle option UI.
   */
  _createShowAllStatsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="show-all-stats-toggle" class="show-all-stats-toggle-label" data-i18n="options.showAllStats">Show All Stats:</label>
      <input
        type="checkbox"
        id="show-all-stats-toggle"
        class="show-all-stats-toggle"
        ${this.showAllStats ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.show-all-stats-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'showAllStatsLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showAllStats = checkbox.checked;
      dataManager.saveGame();
      updateStatsAndAttributesUI(true);
    });
    return wrapper;
  }

  /**
   * Creates the quick training toggle option UI.
   */
  _createQuickTrainingOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="quick-training-toggle" class="quick-training-toggle-label" data-i18n="options.quickTraining">Enable Quick Training:</label>
      <input
        type="checkbox"
        id="quick-training-toggle"
        class="quick-training-toggle"
        ${this.quickTraining ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.quick-training-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'quickTrainingLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.quickTraining = checkbox.checked;
      dataManager.saveGame();
      if (training) training.initializeTrainingUI();
    });
    return wrapper;
  }

  /**
   * Creates the bulk training toggle option UI.
   */
  _createBulkTrainingOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="bulk-training-toggle" class="bulk-training-toggle-label" data-i18n="options.bulkTraining">Enable Training Bulk Buy:</label>
      <input
        type="checkbox"
        id="bulk-training-toggle"
        class="bulk-training-toggle"
        ${this.bulkTraining ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.bulk-training-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'bulkTrainingLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.bulkTraining = checkbox.checked;
      dataManager.saveGame();
      if (training) training.initializeTrainingUI();
    });
    return wrapper;
  }

  /**
   * Creates the quick soul shop toggle option UI.
   */
  _createQuickSoulShopOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="quick-soulshop-toggle" class="quick-soulshop-toggle-label" data-i18n="options.quickSoulShop">Enable Quick Soul Shop:</label>
      <input
        type="checkbox"
        id="quick-soulshop-toggle"
        class="quick-soulshop-toggle"
        ${this.quickSoulShop ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.quick-soulshop-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'quickSoulShopLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.quickSoulShop = checkbox.checked;
      dataManager.saveGame();
      if (soulShop) soulShop.initializeSoulShopUI();
    });
    return wrapper;
  }

  /**
   * Creates the quick skills toggle option UI.
   */
  _createQuickSkillsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="quick-skills-toggle" class="quick-skills-toggle-label" data-i18n="options.quickSkills">Enable Quick Skill Allocation:</label>
      <input
        type="checkbox"
        id="quick-skills-toggle"
        class="quick-skills-toggle"
        ${this.quickSkills ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.quick-skills-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'quickSkillsLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.quickSkills = checkbox.checked;
      dataManager.saveGame();
      initializeSkillTreeStructure();
    });
    return wrapper;
  }

  /**
   * Toggle numeric input fields for bulk purchases.
   */
  _createNumericInputOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="numeric-input-toggle" class="numeric-input-toggle-label" data-i18n="options.numericPurchaseInputs">Enable Numeric Purchase Inputs:</label>
      <input
        type="checkbox"
        id="numeric-input-toggle"
        class="numeric-input-toggle"
        ${this.useNumericInputs ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.numeric-input-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'numericInputLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.useNumericInputs = checkbox.checked;
      if (!this.useNumericInputs) {
        if (training) training.quickQty = 1;
        if (soulShop) soulShop.quickQty = 1;
        if (skillTree) skillTree.quickQty = 1;
      }
      dataManager.saveGame();
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
    });
    return wrapper;
  }

  _createAutoSortInventoryOption() {
    const purchased = !!crystalShop.crystalUpgrades?.autoSortInventory;
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="auto-sort-inventory-toggle" class="auto-sort-inventory-toggle-label" data-i18n="options.autoSortInventory">Auto Sort Inventory:</label>
      <input
        type="checkbox"
        id="auto-sort-inventory-toggle"
        class="auto-sort-inventory-toggle"
        ${this.autoSortInventory ? 'checked' : ''}
        ${purchased ? '' : 'disabled'}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.auto-sort-inventory-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'autoSortInventoryLabel');
    attachTooltip(checkbox, 'autoSortInventoryToggle', () => !!crystalShop.crystalUpgrades?.autoSortInventory);
    toggleBtn.addEventListener('click', () => {
      if (checkbox.disabled) return;
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.autoSortInventory = checkbox.checked;
      dataManager.saveGame();
    });
    this._autoSortInventoryToggle = checkbox;
    this._autoSortInventoryWrapper = wrapper;
    this.updateAutoSortInventoryOption();
    return wrapper;
  }

  updateAutoSortInventoryOption() {
    if (!this._autoSortInventoryToggle) return;
    const purchased = !!crystalShop.crystalUpgrades?.autoSortInventory;
    this._autoSortInventoryToggle.disabled = !purchased;
    const toggleBtn = this._autoSortInventoryWrapper?.querySelector('.toggle-btn');
    if (toggleBtn) toggleBtn.classList.toggle('disabled', !purchased);
  }

  /**
   * Creates the enemy stats toggle option UI.
   */
  _createEnemyStatsToggleOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="enemy-stats-toggle" class="enemy-stats-toggle-label" data-i18n="options.showEnemyStats">Show Enemy Stats:</label>
      <input
        type="checkbox"
        id="enemy-stats-toggle"
        class="enemy-stats-toggle"
        ${this.showEnemyStats ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.enemy-stats-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'enemyStatsLabel');
    // Make the toggle button clickable and sync with checkbox
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showEnemyStats = checkbox.checked;
      // Save option
      dataManager.saveGame();
      // Show/hide enemy stats in UI
      const stats = document.querySelector('.enemy-stats');
      if (stats) stats.style.display = this.showEnemyStats ? '' : 'none';
    });
    // Initial hide/show
    setTimeout(() => {
      const stats = document.querySelector('.enemy-stats');
      if (stats) stats.style.display = this.showEnemyStats ? '' : 'none';
    }, 0);
    return wrapper;
  }

  /**
   * Creates a toggle to show stage-related controls below the enemy in Explore panel.
   */
  _createStageControlsInlineOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="stage-controls-inline-toggle" class="stage-controls-inline-toggle-label" data-i18n="options.stageControlsInline">Show Stage Controls Under Enemy:</label>
      <input
        type="checkbox"
        id="stage-controls-inline-toggle"
        class="stage-controls-inline-toggle"
        ${this.showStageControlsInline ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const label = wrapper.querySelector('.stage-controls-inline-toggle-label');
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    attachTooltip(label, 'stageControlsInlineLabel');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.showStageControlsInline = checkbox.checked;
      dataManager.saveGame();
      // Ask UI to update inline controls visibility
      try {
        const evt = new CustomEvent('updateInlineStageControls');
        document.dispatchEvent(evt);
      } catch (e) {}
    });
    return wrapper;
  }
}
