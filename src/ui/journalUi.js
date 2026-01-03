import { updateQuestsUI } from './questUi.js';
import * as achievementsUi from './achievementsUi.js';
import { statistics, quests, achievements } from '../globals.js';
import { t } from '../i18n.js';

let activeSubTab = 'quests';

export function initializeJournalUI() {
  const container = document.getElementById('journal');
  if (!container) return;

  container.innerHTML = `
    <div class="journal-tabs">
      <button class="journal-tab-btn active" data-subtab="quests" data-i18n="journal.tabs.quests">${t('journal.tabs.quests')}</button>
      <button class="journal-tab-btn" data-subtab="achievements" data-i18n="journal.tabs.achievements">${t('journal.tabs.achievements')}</button>
      <button class="journal-tab-btn" data-subtab="statistics" data-i18n="journal.tabs.statistics">${t('journal.tabs.statistics')}</button>
    </div>
    <div class="journal-content">
      <div id="journal-quests" class="journal-panel active"></div>
      <div id="journal-achievements" class="journal-panel"></div>
      <div id="journal-statistics" class="journal-panel"></div>
    </div>
  `;

  const tabs = container.querySelectorAll('.journal-tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeSubTab = btn.dataset.subtab;
      updateJournalUI();
    });
  });

  // Initial update
  updateJournalUI();
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
  }
  updateJournalIndicators();
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
