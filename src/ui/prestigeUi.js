import { prestige, hero, statistics } from '../globals.js';
import { createModal, closeModal } from './modal.js';
import { formatStatName, showToast, formatNumber, updateResources } from './ui.js';
import { getBossScalingFactor } from '../prestige.js';
import { t, tp } from '../i18n.js';

const html = String.raw;
const BASE = import.meta.env.VITE_BASE_PATH;

function updateButtonState() {
  const tab = document.getElementById('prestige');
  let container = tab.querySelector('.prestige-container');
  const btn = container.querySelector('#prestige-now-btn');

  if (prestige.canPrestige()) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
};

function updateLevelInfo() {
  const tab = document.getElementById('prestige');
  if (!tab) return;
  const levelInfo = tab.querySelector('.prestige-level-info');
  if (!levelInfo) return;
  const level = hero.level || 0;
  const required = prestige.getCurrentLevelRequirement();
  levelInfo.textContent = tp('prestige.levelInfo', { level, required });
}


export function initializePrestigeUI() {
  const tab = document.getElementById('prestige');
  if (!tab) return;

  let container = tab.querySelector('.prestige-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'prestige-container';
    tab.innerHTML = '';
    tab.appendChild(container);
  }

  container.innerHTML = html`
    <div class="prestige-header">
      <button id="prestige-now-btn" data-i18n="prestige.prestigeNow">${t('prestige.prestigeNow')}</button>
      <button id="prestige-history-btn" data-i18n="prestige.history">${t('prestige.history')}</button>
      <div class="prestige-level-info"></div>
    </div>
    <ul class="prestige-bonuses-list"></ul>
  `;

  const btn = container.querySelector('#prestige-now-btn');
  const historyBtn = container.querySelector('#prestige-history-btn');

  updateButtonState();
  updateLevelInfo();

  btn.addEventListener('click', (e) => {
    if (btn.classList.contains('disabled')) {
      e.preventDefault();
      showToast(prestige.getPrestigeRequirementMessage());
      return;
    }
    openPrestigeModal();
  });

  historyBtn.addEventListener('click', openPrestigeHistoryModal);

  updatePrestigeBonuses();

  // Listen for a custom event 'heroLevelUp' to update the prestige tab
  document.addEventListener('heroLevelUp', () => {
    updateButtonState();
    updatePrestigeBonuses();
    updateLevelInfo();
  });
  document.addEventListener('bossKilled', () => {
    updateButtonState();
    updatePrestigeBonuses();
    updateLevelInfo();
  });
}

export function updatePrestigeBonuses() {
  const tab = document.getElementById('prestige');
  if (!tab) return;
  const list = tab.querySelector('.prestige-bonuses-list');
  if (!list) return;
  const bonuses = prestige.getBonuses();
  list.innerHTML = Object.keys(bonuses).length
    ? Object.entries(bonuses)
      .map(([stat, val]) => `<li>${formatStatName(stat)} ${formatPrestigeBonus(stat, val)}</li>`)
      .join('')
    : `<li>${t('prestige.noBonuses')}</li>`;
}

function openPrestigeModal() {
  // Always use prestige.generateCards(3), which now returns the saved cards if present
  let cards = prestige.generateCards(3);
  const highestBossLevel = statistics?.highestBossLevel || 0;
  const scalingFactor = getBossScalingFactor(highestBossLevel);
  const bonusPercent = Math.round((scalingFactor - 1) * 100);
  const content = html`
    <div class="prestige-modal-content">
      <button class="modal-close">&times;</button>
      <div class="prestige-cards"></div>
      <div class="modal-controls">
        <button id="prestige-reroll-btn">${t('prestige.reroll')} (60<img src="${BASE}/icons/crystal.svg" class="icon" alt="gem"/>)</button>
      </div>
      <div class="prestige-info-message" style="margin-top: 10px; color: #9ac7fcff; font-size: 1.05em;">
      <p class="prestige-info prestige-bonus-info">${tp('prestige.bonusInfo', { bonus: bonusPercent })}</p>
      <p class="prestige-info">${t('prestige.resetInfo')}</p>
      <p class="prestige-info">${t('prestige.optionsInfo')}</p>
      <div class="prestige-info-cta">${t('prestige.historyRecord')}</div>
      </div>
      <div class="modal-footer" style="margin-top: 12px; text-align: center;">
        <button id="prestige-perform-btn" class="disabled">${t('prestige.perform')}</button>
      </div>
    </div>
  `;

  const modal = createModal({ id: 'prestige-modal', className: 'prestige-modal', content });
  const cardsContainer = modal.querySelector('.prestige-cards');
  const performBtn = modal.querySelector('#prestige-perform-btn');
  let selectedIdx = null;

  const renderCards = () => {
    cardsContainer.innerHTML = cards
      .map((c, i) => {
        const lockLabel = c.locked
          ? `<img src="${BASE}/icons/lock.svg" class="icon" alt="${t('prestige.lock')}"/>`
          : `${t('prestige.lock')} (20<img src="${BASE}/icons/crystal.svg" class="icon" alt="gem"/>)`;
        return html`
          <div class="prestige-card-wrapper" data-idx="${i}">
            <div class="prestige-card ${c.locked ? 'locked' : ''} ${selectedIdx === i ? 'selected' : ''}">
              <ul>${c.descriptions.map((d) => `<li>${d}</li>`).join('')}</ul>
            </div>
            <button class="prestige-lock-btn">${lockLabel}</button>
          </div>
        `;
      })
      .join('');
    cardsContainer.querySelectorAll('.prestige-card').forEach((el) => {
      el.onclick = () => {
        const idx = parseInt(el.parentElement.dataset.idx, 10);
        selectedIdx = idx;
        cardsContainer.querySelectorAll('.prestige-card').forEach((c) => c.classList.remove('selected'));
        el.classList.add('selected');
        performBtn.classList.remove('disabled');
      };
    });
    cardsContainer.querySelectorAll('.prestige-lock-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.parentElement.dataset.idx, 10);
        const card = cards[idx];
        const cardEl = btn.parentElement.querySelector('.prestige-card');
        if (card.locked) {
          card.locked = false;
          btn.innerHTML = `${t('prestige.lock')} (20<img src="${BASE}/icons/crystal.svg" class="icon" alt="gem"/>)`;
          cardEl.classList.remove('locked');
        } else {
          if (hero.crystals < 20) {
            showToast(t('prestige.notEnoughCrystalsLock'));
            return;
          }
          hero.crystals -= 20;
          updateResources();
          card.locked = true;
          btn.innerHTML = `<img src="${BASE}/icons/lock.svg" class="icon" alt="${t('prestige.lock')}"/>`;
          cardEl.classList.add('locked');
        }
      });
    });
  };

  renderCards();

  const rerollBtn = modal.querySelector('#prestige-reroll-btn');
  rerollBtn.onclick = () => {
    if (hero.crystals < 60) {
      showToast(t('prestige.notEnoughCrystalsReroll'));
      return;
    }
    hero.crystals -= 60;
    updateResources();
    cards = prestige.rerollCards(3);
    selectedIdx = null;
    performBtn.classList.add('disabled');
    renderCards();
  };

  performBtn.onclick = async () => {
    if (selectedIdx == null) return;
    await prestige.prestigeWithBonus(cards[selectedIdx]);
    closeModal(modal);
    updatePrestigeBonuses();
    // Update button state after prestige
    updateButtonState();
    updateLevelInfo();
  };
}

export function formatPrestigeBonus(stat, value) {
  if (stat.endsWith('Percent')) {
    return `+${(value * 100).toFixed(1)}%`;
  }
  return `+${formatNumber(Math.round(value))}`;
}

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

// Format a duration given in seconds into "Hh Mm Ss"
function formatDurationSeconds(seconds) {
  const sec = Math.floor(seconds || 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

function openPrestigeHistoryModal() {
  const history = prestige.history || [];
  const items = history
    .map(
      (h, i) =>
        `<li data-idx="${i}">#${h.number} - ${new Date(h.timestamp).toLocaleString()}</li>`,
    )
    .join('');
  const content = html`
    <div class="prestige-history-modal-content">
      <button class="modal-close">&times;</button>
      <h2 data-i18n="prestige.historyTitle">${t('prestige.historyTitle')}</h2>
      <ul class="prestige-history-list">
        ${items || `<li>${t('prestige.noPrestiges')}</li>`}
      </ul>
    </div>`;
  const modal = createModal({
    id: 'prestige-history-modal',
    className: 'prestige-history-modal',
    content,
  });
  modal.querySelectorAll('.prestige-history-list li[data-idx]').forEach((el) => {
    el.addEventListener('click', () => {
      const idx = parseInt(el.dataset.idx, 10);
      closeModal(modal);
      openPrestigeDetailModal(history[idx]);
    });
  });
}

function formatObjectStat(name, obj) {
  if (name === 'highestStages') {
    const parts = [];
    for (let i = 1; i <= 12; i++) {
      const span = `<span class="stage-value">T${i}: ${formatNumber(obj[i] || 0)}</span>`;
      parts.push(span);
      if (i < 12) {
        parts.push('<span class="stage-separator breakable-separator">|||</span>');
      }
    }
    return `<li>${formatStatName(name)}: ${parts.join('')}</li>`;
  }
  if (name === 'enemiesKilledByZone') {
    const parts = [];
    for (let i = 1; i <= 12; i++) {
      const span = `<span class="stage-value">T${i}: ${formatNumber(obj[i] || 0)}</span>`;
      parts.push(span);
      if (i < 12) {
        parts.push('<span class="stage-separator breakable-separator">|||</span>');
      }
    }
    return `<li>${t('prestige.enemiesKilledByZone')}: ${parts.join('')}</li>`;
  }
  const entries = Object.entries(obj);
  const parts = entries
    .map(
      ([key, val]) =>
        `<span class="stage-value">${formatStatName(key)}: ${formatNumber(val || 0)}</span>`,
    )
    .join('<span class="stage-separator breakable-separator">|||</span>');
  const label =
    name === 'enemiesKilled'
      ? t('prestige.enemiesKilledByRarity')
      : name === 'itemsFound'
        ? t('prestige.itemsFoundByRarity')
        : formatStatName(name);
  return `<li>${label}: ${parts}</li>`;
}

function openPrestigeDetailModal(entry) {
  if (!entry) return;
  const stats = Object.entries(entry.statistics || {})
    .filter(([k]) => k !== 'lastUpdate')
    .map(([k, v]) => {
      if (typeof v === 'object') {
        return formatObjectStat(k, v);
      }
      if (k === 'totalTimePlayed' || k === 'totalTimeInFights') {
        return `<li>${formatStatName(k)}: ${formatDurationSeconds(Math.round(v))}</li>`;
      }
      return `<li>${formatStatName(k)}: ${formatNumber(Math.round(v))}</li>`;
    })
    .join('');
  const content = html`
    <div class="prestige-history-modal-content">
      <button class="modal-close">&times;</button>
      <h2>${tp('prestige.entryTitle', { number: entry.number })}</h2>
      <div>${tp('prestige.timeLabel', { time: new Date(entry.timestamp).toLocaleString() })}</div>
      <ul class="prestige-stat-list">${stats}</ul>
    </div>`;
  createModal({ id: 'prestige-detail-modal', className: 'prestige-history-modal', content });
}
