import { crystalShop, dataManager, game, setGlobals } from './globals.js';
import { showConfirmDialog, showToast, updateStageUI } from './ui/ui.js';
import { createModal } from './ui/modal.js';
import Enemy from './enemy.js';
import { marked } from 'marked';
const html = String.raw;

// Options class to store options and version (future-proof for migrations)
export class Options {
  constructor(data = {}) {
    this.version = data.version || '0.1.3';
    // Add startingStage, default to null (unset)
    this.startingStage = data.startingStage || null;
  }

  /**
   * Main entry to initialize the Options tab UI.
   */
  initializeOptionsUI() {
    this._renderOptionsUI();
    this._initCloudSaveButtons();
  }

  _renderOptionsUI() {
    const optionsTab = document.getElementById('options');
    if (!optionsTab) return;
    optionsTab.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'options-container';
    container.appendChild(this._createCloudSaveBar());

    // --- Starting Stage Option ---
    container.appendChild(this._createStartingStageOption());

    // --- Changelog & Upcoming buttons row ---
    const changelogRow = document.createElement('div');
    changelogRow.className = 'changelog-row';
    changelogRow.appendChild(this._createChangelogButton());
    changelogRow.appendChild(this._createUpcomingChangesButton());
    container.appendChild(changelogRow);

    container.appendChild(this._createDiscordSection());

    const suggestionsRow = document.createElement('div');
    suggestionsRow.innerHTML = html` Please add your suggestions for changes in the game in the discord channel :) `;
    container.appendChild(suggestionsRow);

    container.appendChild(this._createResetButton());
    optionsTab.appendChild(container);
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
          'Are you sure you want to reset all progress? This cannot be undone!'
        );
        if (confirmed) {
          game.resetAllProgress();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
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
      // Use Vite's import.meta.glob to dynamically import all changelog files
      const changelogModules = import.meta.glob('./changelog/*.md', { query: '?raw', import: 'default' });
      const entries = Object.entries(changelogModules)
        .map(([path, loader]) => {
          const match = path.match(/([\d.]+)\.md$/);
          return match ? { version: match[1] } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true, sensitivity: 'base' }));
      const changelogs = await Promise.all(
        entries.map(async (entry) => {
          const html = await getChangelogHtml(entry.version);
          return { ...entry, html };
        })
      );
      let content = `<div class="changelog-modal-content">`;
      content += `<button class="modal-close">X</button>`;
      content += `<h2>Changelog</h2>`;
      changelogs.forEach((entry, i) => {
        const expanded = i === 0 ? 'expanded' : '';
        const versionLabel =
          i === 0 ? `${entry.version} <span class="changelog-current">(current)</span>` : `${entry.version}`;
        content += `
          <div class="changelog-entry ${expanded}">
            <div class="changelog-header" data-index="${i}">
              <span class="changelog-version">${versionLabel}</span>
              <span class="changelog-toggle">${expanded ? '▼' : '►'}</span>
            </div>
            <div class="changelog-body" style="display:${expanded ? 'block' : 'none'}">${entry.html || ''}</div>
          </div>
        `;
      });
      content += `</div>`;
      const modal = createModal({
        id: 'changelog-modal',
        className: 'changelog-modal',
        content,
      });
      modal.querySelectorAll('.changelog-header').forEach((header) => {
        header.addEventListener('click', () => {
          const entry = header.parentElement;
          const body = entry.querySelector('.changelog-body');
          const toggle = entry.querySelector('.changelog-toggle');
          const expanded = entry.classList.toggle('expanded');
          if (expanded) {
            body.style.display = 'block';
            toggle.textContent = '▼';
          } else {
            body.style.display = 'none';
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
      // Use Vite's import.meta.glob to dynamically import the upcoming file
      const upcomingModules = import.meta.glob('./upcomming.md', { query: '?raw', import: 'default' });
      const loader = upcomingModules['./upcomming.md'];
      let text = '';
      try {
        text = loader ? await loader() : '(No upcoming changes found)';
      } catch {
        text = '(Could not load upcoming changes)';
      }
      let content = `<div class="changelog-modal-content">`;
      content += `<button class="modal-close">X</button>`;
      content += `<h2>Upcoming Changes</h2>`;
      content += `<div class="changelog-body">${text ? marked.parse(text) : ''}</div>`;
      content += `</div>`;
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
        href="https://discord.gg/DYEf8dk6Ab"
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

  async _initCloudSaveButtons() {
    // Cloud Save UI logic
    const cloudSaveStatus = document.getElementById('cloud-save-status');
    const cloudSaveBtn = document.getElementById('cloud-save-btn');
    const cloudLoadBtn = document.getElementById('cloud-load-btn');

    await dataManager.checkSession();
    let userSession = dataManager.getSession();

    // Fetch cloud save and compare with local
    let statusMsg = 'Ready to save to cloud';

    const formatDateWithTimezone = (dateStr) => {
      if (!dateStr) return 'unknown';
      const date = new Date(dateStr);
      const options = {
        year: 'numeric',
        month: 'short', // e.g., "May"
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleString(undefined, options);
    };

    try {
      const cloudResult = await dataManager.loadGame({ cloud: true, statusCheck: true });

      if (!cloudResult) {
        statusMsg = 'No cloud save found';
      } else if (cloudResult.source !== 'cloud') {
        statusMsg = 'No cloud save found';
      } else {
        statusMsg = `Last save: ${formatDateWithTimezone(cloudResult.updated_at)}`;
      }
    } catch (e) {
      console.error('Failed to load cloud data:', e);
    }

    cloudSaveStatus.textContent = statusMsg;

    if (!userSession) {
      let loginUrl = '/login';
      const isLocal = import.meta.env.VITE_IS_LOCAL === 'true';
      if (isLocal) {
        loginUrl = 'http://localhost:5173/login';
      }
      cloudSaveStatus.innerHTML =
        '<span class="login-status">Not logged in</span><div><a href="' +
        loginUrl +
        '" class="login-link" target="_blank">Log in</a></div>';
      cloudSaveStatus.className = 'not-logged-in';
      cloudSaveBtn.disabled = true;
      cloudSaveBtn.classList.add('disabled');
      cloudLoadBtn.disabled = true;
      cloudLoadBtn.classList.add('disabled');
    }

    // Save
    cloudSaveBtn.addEventListener('click', async () => {
      userSession = dataManager.getSession();
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
      userSession = dataManager.getSession();
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
          window.location.reload();
        }
      } catch (e) {
        console.error('Failed to load from cloud:', e);
        showToast(e.message || 'Failed to load from cloud');
      }
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
}

/**
 * Returns the HTML for a given changelog version (from ./changelog/*.md)
 * @param {string} version - The version string, e.g. '0.1.1'
 * @returns {Promise<string>} HTML string for the changelog, or empty string if not found
 */
export async function getChangelogHtml(version) {
  const changelogModules = import.meta.glob('./changelog/*.md', { query: '?raw', import: 'default' });
  const path = `./changelog/${version}.md`;
  const loader = changelogModules[path];
  if (!loader) return '';
  try {
    const rawMd = await loader();
    // Simple markdown to HTML conversion (headings and list)
    return rawMd
      .replace(/^# (.*)$/m, '<h3>$1</h3>')
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/\n{2,}/g, '\n')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  } catch {
    return '';
  }
}
