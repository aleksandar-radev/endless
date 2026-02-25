import { updateQuestsUI, refreshQuestsInPlace } from './questUi.js';
import * as achievementsUi from './achievementsUi.js';
import { statistics, quests, achievements } from '../globals.js';
import { t } from '../i18n.js';
import { navigationManager } from '../utils/navigationManager.js';
import { createModal, closeModal } from './modal.js';

let activeSubTab = 'quests';
let journalRefreshInterval = null;

export function initializeJournalUI() {
  const container = document.getElementById('journal');
  if (!container) return;

  container.innerHTML = `
    <div class="journal-tabs">
      <button class="journal-tab-btn ${activeSubTab === 'quests' ? 'active' : ''}" data-subtab="quests" data-i18n="journal.tabs.quests">${t('journal.tabs.quests')}</button>
      <button class="journal-tab-btn ${activeSubTab === 'achievements' ? 'active' : ''}" data-subtab="achievements" data-i18n="journal.tabs.achievements">${t('journal.tabs.achievements')}</button>
      <button class="journal-tab-btn ${activeSubTab === 'statistics' ? 'active' : ''}" data-subtab="statistics" data-i18n="journal.tabs.statistics">${t('journal.tabs.statistics')}</button>
      <button class="journal-tab-btn ${activeSubTab === 'offline' ? 'active' : ''}" data-subtab="offline" data-i18n="journal.tabs.offline">${t('journal.tabs.offline')}</button>
    </div>
    <div class="journal-content">
      <div id="journal-quests" class="journal-panel ${activeSubTab === 'quests' ? 'active' : ''}"></div>
      <div id="journal-achievements" class="journal-panel ${activeSubTab === 'achievements' ? 'active' : ''}"></div>
      <div id="journal-statistics" class="journal-panel ${activeSubTab === 'statistics' ? 'active' : ''}"></div>
      <div id="journal-offline" class="journal-panel ${activeSubTab === 'offline' ? 'active' : ''}"></div>
    </div>
  `;

  const tabs = container.querySelectorAll('.journal-tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      switchJournalSubTab(btn.dataset.subtab);
    });
  });

  // Initial update
  updateJournalUI();
}

export function switchJournalSubTab(subTabName, { skipUrlUpdate = false } = {}) {
  activeSubTab = subTabName;
  updateJournalUI();

  if (!skipUrlUpdate) {
    navigationManager.updateUrl({ subtab: subTabName });
  }
}

export function updateJournalUI() {
  const container = document.getElementById('journal');
  if (!container) return; // Not rendered yet or tab not active

  // Update tab active states
  const tabs = container.querySelectorAll('.journal-tab-btn');
  tabs.forEach((btn) => {
    if (btn.dataset.subtab === activeSubTab) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const panels = container.querySelectorAll('.journal-panel');
  panels.forEach((p) => p.classList.remove('active'));

  const activePanel = document.getElementById(`journal-${activeSubTab}`);
  if (activePanel) activePanel.classList.add('active');

  if (activeSubTab === 'quests') {
    // questUi expects to render into #quests usually. We need to redirect it or ensure it targets #journal-quests.
    // Since we can't easily change questUi without modifying it, we should ensure modify questUi to accept a target container
    // OR we change the ID in the DOM to match what questUi expects, effectively "mounting" the sub-panel as the main panel.
    // The implementation plan said "Update updateQuestsUI to target the new container".
    updateQuestsUI();
  } else if (activeSubTab === 'achievements') {
    achievementsUi.updateAchievementsUI();
  } else if (activeSubTab === 'statistics') {
    // statistics.updateStatisticsUI relies on elements being present.
    // statistics.initializeStatisticsUI builds the DOM.
    // We should call initialize if empty.
    const statsContainer = document.getElementById('journal-statistics');
    if (statsContainer && !statsContainer.hasChildNodes()) {
      statistics.initializeStatisticsUI(statsContainer);
    }
    statistics.updateStatisticsUI();
  } else if (activeSubTab === 'offline') {
    updateOfflineJournalUI();
  }
  updateJournalIndicators();
}

export function updateOfflineJournalUI() {
  const container = document.getElementById('journal-offline');
  if (!container) return;

  const history = statistics.offlineHistory || [];

  if (history.length === 0) {
    container.innerHTML = `<div class="offline-history-empty">${t('offline.history.empty')}</div>`;
    return;
  }

  const formatDuration = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    let res = '';
    if (h > 0) res += `${h}h `;
    if (m > 0) res += `${m}m `;
    if (s > 0 || res === '') res += `${s}s`;
    return res.trim();
  };

  const html = String.raw;
  let historyHtml = html`
    <h2 class="offline-history-title">${t('offline.history.title')}</h2>
    <div class="offline-history-list">
      <div class="offline-history-header">
        <span class="col-time">${t('offline.history.time')}</span>
        <span class="col-duration">${t('offline.history.duration')}</span>
        <span class="col-xp">${t('offline.history.xp')}</span>
        <span class="col-gold">${t('offline.history.gold')}</span>
        <span class="col-items">${t('offline.history.items')}</span>
        <span class="col-mats">${t('offline.history.materials')}</span>
      </div>
  `;

  [...history].reverse().forEach((entry, index) => {
    const start = new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const end = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullDate = new Date(entry.timestamp).toLocaleDateString();

    historyHtml += html`
      <div class="offline-history-row clickable" data-index="${history.length - 1 - index}">
        <span class="offline-time col-time">
          <div class="offline-date-small">${fullDate}</div>
          ${start} - ${end}
        </span>
        <span class="offline-duration col-duration">${formatDuration(entry.elapsed)}</span>
        <span class="offline-xp col-xp">+${entry.xp.toLocaleString()}</span>
        <span class="offline-gold col-gold">+${entry.gold.toLocaleString()}</span>
        <span class="offline-items col-items">+${entry.items.toLocaleString()}</span>
        <span class="offline-mats col-mats">+${entry.materials.toLocaleString()}</span>
      </div>
    `;
  });

  historyHtml += '</div>';
  container.innerHTML = historyHtml;

  // Add click handlers for the rows
  container.querySelectorAll('.offline-history-row').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.dataset.index, 10);
      const entry = history[idx];
      if (!entry) return;

      const start = new Date(entry.startTime).toLocaleString();
      const end = new Date(entry.timestamp).toLocaleString();

      const modalContent = html`
        <div class="modal-content">
          <span class="modal-close">&times;</span>
          <h2 style="margin-bottom: 20px;">${t('offline.history.details')}</h2>
          <div class="offline-detail-item"><strong>${t('offline.history.time')}:</strong> ${start} - ${end}</div>
          <div class="offline-detail-item"><strong>${t('offline.history.duration')}:</strong> ${formatDuration(entry.elapsed)}</div>
          <hr style="border: none; border-top: 1px solid var(--border); margin: 15px 0;" />
          <div class="offline-detail-item offline-xp"><strong>${t('offline.history.xp')}:</strong> +${entry.xp.toLocaleString()}</div>
          <div class="offline-detail-item offline-gold"><strong>${t('offline.history.gold')}:</strong> +${entry.gold.toLocaleString()}</div>
          <div class="offline-detail-item offline-items"><strong>${t('offline.history.items')}:</strong> +${entry.items.toLocaleString()}</div>
          <div class="offline-detail-item offline-mats"><strong>${t('offline.history.materials')}:</strong> +${entry.materials.toLocaleString()}</div>
        </div>
      `;

      createModal({
        id: 'offline-detail-modal',
        className: 'offline-detail-modal',
        content: modalContent,
      });
    });
  });
}

export function startJournalRefreshInterval() {
  if (journalRefreshInterval) return;
  journalRefreshInterval = setInterval(() => {
    if (activeSubTab === 'quests') {
      refreshQuestsInPlace();
    } else if (activeSubTab === 'achievements') {
      achievementsUi.refreshAchievementsInPlace();
    }
    updateJournalIndicators();
  }, 1000);
}

export function stopJournalRefreshInterval() {
  if (journalRefreshInterval) {
    clearInterval(journalRefreshInterval);
    journalRefreshInterval = null;
  }
}

export function updateJournalIndicators() {
  const container = document.getElementById('journal');
  if (!container) return;

  // Quests dot
  const questBtn = container.querySelector('.journal-tab-btn[data-subtab="quests"]');
  if (questBtn) {
    const claimableQuests = quests.quests.filter((q) => q.isComplete() && !q.claimed).length;
    if (claimableQuests > 0) questBtn.classList.add('has-indicator');
    else questBtn.classList.remove('has-indicator');
  }

  // Achievements dot
  const achievementBtn = container.querySelector('.journal-tab-btn[data-subtab="achievements"]');
  if (achievementBtn) {
    const claimableAchievements = achievements.achievements.filter((a) => a.isComplete() && !a.claimed).length;
    if (claimableAchievements > 0) achievementBtn.classList.add('has-indicator');
    else achievementBtn.classList.remove('has-indicator');
  }
}
