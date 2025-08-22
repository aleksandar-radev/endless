
import { crystalShop, dataManager, game, setGlobals, training, soulShop } from './globals.js';
import { initializeBuildingsUI } from './ui/buildingUi.js';
import { showConfirmDialog, showToast, updateStageUI, updateEnemyStatLabels } from './ui/ui.js';
import { updateBuffIndicators } from './ui/skillTreeUi.js';
import { closeModal, createModal } from './ui/modal.js';
import Enemy from './enemy.js';
import { logout } from './api.js';
import { CHANGELOG } from './changelog/changelog.js';
import upcommingChanges from './upcoming.js';
import { audioManager } from './audio.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { setLanguage } from './i18n.js';

const html = String.raw;

// Options class to store options and version (future-proof for migrations)
export class Options {
  constructor(data = {}) {
    this.version = data.version || '0.7.8';
    // Add startingStage, default to null (unset)
    this.startingStage = data.startingStage || null;
    // Add showEnemyStats option, default to false
    this.showEnemyStats = data.showEnemyStats ?? false;
    // Option to show all stats including those hidden by default
    this.showAllStats = data.showAllStats ?? false;
    this.resetRequired = data.resetRequired ?? null;
    // Add stageSkip option, default to 0
    this.stageSkip = data.stageSkip || 0;
    // Add resetStageSkip option, default to 0 (disabled)
    this.resetStageSkip = data.resetStageSkip || 0;
    // Add soundVolume option, default to 0
    this.soundVolume = typeof data.soundVolume === 'number' ? data.soundVolume : 0;
    // Remember salvage preference across prestiges
    this.salvageMaterialsEnabled = data.salvageMaterialsEnabled ?? false;
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
    // Enable quick soul shop purchases
    this.quickSoulShop = data.quickSoulShop ?? false;
    // Use numeric inputs for bulk purchases
    this.useNumericInputs = data.useNumericInputs ?? false;
    // Default quantities for bulk purchases
    this.soulShopQty = typeof data.soulShopQty === 'number' ? data.soulShopQty : 1;
    this.soulShopQuickQty = typeof data.soulShopQuickQty === 'number' ? data.soulShopQuickQty : 1;
    this.crystalShopQty = typeof data.crystalShopQty === 'number' ? data.crystalShopQty : 1;
    this.trainingQty = typeof data.trainingQty === 'number' ? data.trainingQty : 1;
    this.trainingQuickQty = typeof data.trainingQuickQty === 'number' ? data.trainingQuickQty : 1;
    this.buildingQty = typeof data.buildingQty === 'number' ? data.buildingQty : 1;
    // Preferred language, default to English
    this.language = data.language || 'en';
    // Use short elemental stat names
    this.shortElementalNames = data.shortElementalNames ?? false;
    // Show cooldown numbers on skill slots
    this.showSkillCooldowns = data.showSkillCooldowns ?? false;
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
        <option value="en" data-i18n="options.lang.english">English</option>
        <option value="es" data-i18n="options.lang.spanish">Español</option>
      </select>
      <span>Not everything translated yet. You might still see translations in english, as a default language. You might want to refresh page after changing language, to see all changes take effect.</span>
    `;
    const select = wrapper.querySelector('select');
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
      <label for="sound-volume-slider" class="sound-volume-label">Sound Volume:</label>
      <input
        type="range"
        id="sound-volume-slider"
        class="sound-volume-slider"
        min="0"
        max="1"
        step="0.01"
        value="${this.soundVolume}"
        title="Adjust game sound volume"
      />
      <span class="sound-volume-value">${Math.round(this.soundVolume * 100)}%</span>
    `;
    const slider = wrapper.querySelector('input');
    const valueLabel = wrapper.querySelector('.sound-volume-value');
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
    gameTabBtn.textContent = 'Game';
    const generalTabBtn = document.createElement('button');
    generalTabBtn.className = 'options-tab';
    generalTabBtn.textContent = 'General';
    tabs.appendChild(gameTabBtn);
    tabs.appendChild(generalTabBtn);
    container.appendChild(tabs);

    // --- Game Options Content ---
    const gameContent = document.createElement('div');
    gameContent.className = 'options-content active';
    gameContent.appendChild(this._createAdvancedTooltipsOption());
    gameContent.appendChild(this._createAdvancedAttributeTooltipsOption());
    gameContent.appendChild(this._createEnemyStatsToggleOption());
    gameContent.appendChild(this._createShowAllStatsOption());
    gameContent.appendChild(this._createShortElementalNamesOption());
    gameContent.appendChild(this._createQuickTrainingOption());
    gameContent.appendChild(this._createQuickSoulShopOption());
    gameContent.appendChild(this._createNumericInputOption());
    gameContent.appendChild(this._createStartingStageOption());
    gameContent.appendChild(this._createStageSkipOption());
    gameContent.appendChild(this._createResetStageSkipOption());
    gameContent.appendChild(this._createRateCountersOption());
    gameContent.appendChild(this._createRateCountersPeriodOption());

    // --- General Options Content ---
    const generalContent = document.createElement('div');
    generalContent.className = 'options-content';
    generalContent.appendChild(this._createCloudSaveBar());
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
      Current version: ${this.version}.
      <br>
      <br>
      Please add your suggestions for changes in the game in the discord channel :)
      <br>
      <br>
      You can download desktop application (Windows only!) from <a style="color:#fff; background:#0078d7; padding:2px 8px; border-radius:4px; text-decoration:none; font-weight:bold;" target="_blank" href="https://github.com/aleksandar-radev/endless/releases">HERE</a>.
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
      <label for="advanced-tooltips-toggle" class="advanced-tooltips-toggle-label">Show Advanced Item Tooltips:</label>
      <input
        type="checkbox"
        id="advanced-tooltips-toggle"
        class="advanced-tooltips-toggle"
        ${this.showAdvancedTooltips ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
      <label for="advanced-attr-tooltips-toggle" class="advanced-attr-tooltips-toggle-label">Show Advanced Attribute Tooltips:</label>
      <input
        type="checkbox"
        id="advanced-attr-tooltips-toggle"
        class="advanced-attr-tooltips-toggle"
        ${this.showAdvancedAttributeTooltips ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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

  _createRateCountersOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = `
      <label for="rate-counters-toggle" class="rate-counters-toggle-label">Show Counters Bar:</label>
      <input
        type="checkbox"
        id="rate-counters-toggle"
        class="rate-counters-toggle"
        ${this.showRateCounters ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
      <label for="rate-counters-period" class="rate-counters-period-label">Counters Period (sec):</label>
      <input
        type="number"
        id="rate-counters-period"
        class="rate-counters-period-input"
        min="1"
        value="${this.rateCountersPeriod}"
      />
    `;
    const input = wrapper.querySelector('input');
    input.addEventListener('change', () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v <= 0) v = 3600;
      this.rateCountersPeriod = v;
      dataManager.saveGame();
      document.dispatchEvent(new CustomEvent('ratePeriodChange', { detail: v }));
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
      <label for="stage-skip-input" class="stage-skip-label">Stage Skip per Kill:</label>
      <input
        type="number"
        id="stage-skip-input"
        class="stage-skip-input"
        min="0"
        max="${max}"
        value="${value}"
        title="Max: ${max} (based on crystal upgrades)"
      />
      <button class="apply-btn" type="button">Apply</button>
    `;

    const input = wrapper.querySelector('input');
    const applyBtn = wrapper.querySelector('button');

    // Store refs for update
    this._stageSkipInput = input;
    this._stageSkipWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');

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
      showToast('Stage skip option applied!', 'success');
    };

    // Initial update to ensure correct max/value
    this.updateStageSkipOption();

    return wrapper;
  }

  /**
   * Updates the stage skip input's max, title, and value if needed.
   * Call this whenever crystalShop.crystalUpgrades.stageSkip changes.
   */
  updateStageSkipOption() {
    if (!this._stageSkipInput) return;
    const max = crystalShop.crystalUpgrades?.stageSkip || 0;
    this._stageSkipInput.max = max;
    this._stageSkipInput.title = `Max: ${max} (based on crystal upgrades)`;

    let val = parseInt(this._stageSkipInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    this._stageSkipInput.value = val;
  }

  _createResetStageSkipOption() {
    const purchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
    const value = this.resetStageSkip || 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="reset-stage-skip-input" class="reset-stage-skip-label">Reset Stage Skip At:</label>
      <input
        type="number"
        id="reset-stage-skip-input"
        class="reset-stage-skip-input"
        min="0"
        value="${value}"
        title="${purchased ? 'Stage at which stage skip resets' : 'Purchase in crystal shop to enable'}"
        ${purchased ? '' : 'disabled'}
      />
      <button class="apply-btn" type="button" ${purchased ? '' : 'disabled'}>Apply</button>
    `;

    const input = wrapper.querySelector('input');
    const applyBtn = wrapper.querySelector('button');

    this._resetStageSkipInput = input;
    this._resetStageSkipWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');

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
      showToast('Reset stage skip option applied!', 'success');
    };

    this.updateResetStageSkipOption();

    return wrapper;
  }

  updateResetStageSkipOption() {
    if (!this._resetStageSkipInput) return;
    const purchased = !!crystalShop.crystalUpgrades?.resetStageSkip;
    this._resetStageSkipInput.disabled = !purchased;
    this._resetStageSkipInput.title = purchased
      ? 'Stage at which stage skip resets'
      : 'Purchase in crystal shop to enable';
    const btn = this._resetStageSkipWrapper?.querySelector('button');
    if (btn) btn.disabled = !purchased;
  }

  /**
   * Creates the cloud save/load bar UI.
   */
  _createCloudSaveBar() {
    const bar = document.createElement('div');
    bar.className = 'cloud-save-bar';
    bar.innerHTML = `
      <span id="cloud-save-status">Checking login...</span>
      <button id="cloud-save-btn">Save to Cloud</button>
      <button id="cloud-load-btn">Load from Cloud</button>
      <button id="logout-btn" style="display:none;">Log out</button>
    `;
    return bar;
  }

  /**
   * Creates the reset progress button and its logic.
   */
  _createResetButton() {
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-progress';
    resetButton.textContent = 'Reset All Progress';
    resetButton.onclick = async () => {
      try {
        const confirmed = await showConfirmDialog(
          'Are you sure you want to reset all progress? This cannot be undone!',
        );
        if (confirmed) {
          game.resetAllProgress();
        }
      } catch (error) {

        console.error('Error resetting progress:', error);
        alert('An error occurred while resetting progress.');
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
    changelogBtn.textContent = 'View Changelog';
    changelogBtn.onclick = async () => {
      // Get all changelog versions, sorted descending
      const versions = Object.keys(CHANGELOG).sort((a, b) => b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }));
      let content = '<div class="changelog-modal-content">';
      content += '<button class="modal-close">X</button>';
      content += '<h2>Changelog</h2>';
      if (versions.length === 0) {
        content += '<div class="changelog-body">No changelog entries found.</div>';
      } else {
        versions.forEach((version, i) => {
          const mod = CHANGELOG[version];
          let entryHtml = '';
          if (mod && typeof mod.run === 'function') {
            try {
              entryHtml = mod.run();
            } catch (e) {
              entryHtml = `<div style="color:red;">Error loading changelog for ${version}</div>`;
            }
          } else {
            entryHtml = `<div style="color:orange;">No changelog content for ${version}</div>`;
          }
          const expanded = i === 0 ? 'expanded' : '';
          const versionLabel =
            i === 0 ? `${version} <span class="changelog-current">(current)</span>` : `${version}`;
          content += `
            <div class="changelog-entry ${expanded}">
              <div class="changelog-header" data-index="${i}">
                <span class="changelog-version">${versionLabel}</span>
                <span class="changelog-toggle">${expanded ? '▼' : '►'}</span>
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
            toggle.textContent = '►';
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
    upcomingBtn.textContent = 'View Upcoming Changes';
    upcomingBtn.onclick = async () => {
      let text = '';
      text = upcommingChanges();
      let content = '<div class="changelog-modal-content">';
      content += '<button class="modal-close">X</button>';
      content += '<h2>Upcoming Changes</h2>';
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
        aria-label="Join our Discord"
      >
        <span>Join our Discord</span>
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

    let statusMsg = 'Ready to save to cloud';
    const formatDateWithTimezone = (dateStr) => {
      if (!dateStr) return 'unknown';
      const date = new Date(dateStr);
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString(undefined, options);
    };

    try {
      const cloudResult = await dataManager.loadGame({ cloud: true, statusCheck: true });
      if (!cloudResult || cloudResult.source !== 'cloud') {
        statusMsg = 'No cloud save found';
      } else {
        statusMsg = `Last save: ${formatDateWithTimezone(cloudResult.updated_at)}`;
      }
    } catch (e) {
      console.error('Failed to load cloud data:', e);
    }

    if (!userSession) {
      const loginUrl = import.meta.env.VITE_LOGIN_URL;
      cloudSaveStatus.innerHTML =
        '<span class="login-status">Not logged in</span><div><button id="login-btn" class="login-link">Log in</button></div>';
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
                <button class="modal-close">×</button>
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
      cloudSaveStatus.textContent = 'Saving...';
      cloudSaveStatus.className = 'saving';
      try {
        // Use robust saveGame method
        await dataManager.saveGame({ cloud: true });
        cloudSaveStatus.textContent = `Last cloud save: ${new Date(Date.now()).toLocaleTimeString()}`;
      } catch (e) {
        console.error('Cloud save failed:', e);
        cloudSaveStatus.textContent = 'Cloud save failed';
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

        if (!cloudData || cloudData.source !== 'cloud') throw new Error('No cloud save found');

        const msg = `Cloud Save Info:\n\nLevel: ${cloudData.hero.level || 1}\nGold: ${
          cloudData.hero.gold || 0
        }\nCrystals: ${cloudData.hero.crystals || 0}\nSouls: ${
          cloudData.hero.souls || 0
        }\n\nAre you sure you want to overwrite your local save with this cloud save? This cannot be undone.`;

        const confirmed = await showConfirmDialog(msg);

        if (confirmed) {
          await setGlobals({ cloud: true });
          // Reload the game to apply the cloud save (to make sure all globals have been updated & have correct default values)
          location.reload();
        }
      } catch (e) {
        console.error('Failed to load from cloud:', e);
        showToast(e.message || 'Failed to load from cloud');
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
      <label for="starting-stage-input" class="starting-stage-label">Starting Stage:</label>
      <input
        type="number"
        id="starting-stage-input"
        class="starting-stage-input"
        min="0"
        max="${max}"
        value="${value}"
        title="Max: ${max} (based on crystal upgrades)"
      />
      <button class="apply-btn" type="button">Apply</button>
    `;

    const input = wrapper.querySelector('input');
    const applyBtn = wrapper.querySelector('button');

    // Store refs for update
    this._startingStageInput = input;
    this._startingStageWrapper = wrapper;

    applyBtn.onmouseenter = () => applyBtn.classList.add('hover');
    applyBtn.onmouseleave = () => applyBtn.classList.remove('hover');

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
      showToast('Starting stage option applied!', 'success');
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
    const max = 1 + (crystalShop.crystalUpgrades?.startingStage || 0);
    this._startingStageInput.max = max;
    this._startingStageInput.title = `Max: ${max} (based on crystal upgrades)`;

    let val = parseInt(this._startingStageInput.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > max) val = max;
    this._startingStageInput.value = val;
  }

  /**
   * Creates the toggle for short/long elemental stat names.
   */
  _createShortElementalNamesOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="short-elemental-names-toggle" class="short-elemental-names-toggle-label">Use Short Elemental Stat Names:</label>
      <input
        type="checkbox"
        id="short-elemental-names-toggle"
        class="short-elemental-names-toggle"
        ${this.shortElementalNames ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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

  /**
   * Creates the show skill cooldown numbers toggle option UI.
   */
  _createShowSkillCooldownsOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="show-skill-cooldowns-toggle" class="show-skill-cooldowns-toggle-label">Show Skill Cooldown Numbers:</label>
      <input
        type="checkbox"
        id="show-skill-cooldowns-toggle"
        class="show-skill-cooldowns-toggle"
        ${this.showSkillCooldowns ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
      <label for="show-all-stats-toggle" class="show-all-stats-toggle-label">Show All Stats:</label>
      <input
        type="checkbox"
        id="show-all-stats-toggle"
        class="show-all-stats-toggle"
        ${this.showAllStats ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
      <label for="quick-training-toggle" class="quick-training-toggle-label">Enable Quick Training:</label>
      <input
        type="checkbox"
        id="quick-training-toggle"
        class="quick-training-toggle"
        ${this.quickTraining ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
   * Creates the quick soul shop toggle option UI.
   */
  _createQuickSoulShopOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="quick-soulshop-toggle" class="quick-soulshop-toggle-label">Enable Quick Soul Shop:</label>
      <input
        type="checkbox"
        id="quick-soulshop-toggle"
        class="quick-soulshop-toggle"
        ${this.quickSoulShop ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
   * Toggle numeric input fields for bulk purchases.
   */
  _createNumericInputOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="numeric-input-toggle" class="numeric-input-toggle-label">Enable Numeric Purchase Inputs:</label>
      <input
        type="checkbox"
        id="numeric-input-toggle"
        class="numeric-input-toggle"
        ${this.useNumericInputs ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
    toggleBtn.addEventListener('click', () => {
      checkbox.checked = !checkbox.checked;
      checkbox.dispatchEvent(new Event('change'));
    });
    checkbox.addEventListener('change', () => {
      this.useNumericInputs = checkbox.checked;
      if (!this.useNumericInputs) {
        if (training) training.quickQty = 1;
        if (soulShop) soulShop.quickQty = 1;
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
      initializeBuildingsUI();
    });
    return wrapper;
  }

  /**
   * Creates the enemy stats toggle option UI.
   */
  _createEnemyStatsToggleOption() {
    const wrapper = document.createElement('div');
    wrapper.className = 'option-row';
    wrapper.innerHTML = html`
      <label for="enemy-stats-toggle" class="enemy-stats-toggle-label">Show Enemy Stats:</label>
      <input
        type="checkbox"
        id="enemy-stats-toggle"
        class="enemy-stats-toggle"
        ${this.showEnemyStats ? 'checked' : ''}
      />
      <span class="toggle-btn"></span>
    `;
    const checkbox = wrapper.querySelector('input');
    const toggleBtn = wrapper.querySelector('.toggle-btn');
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
}
