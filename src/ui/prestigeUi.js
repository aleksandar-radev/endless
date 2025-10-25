import { prestige, hero, statistics } from '../globals.js';
import { createModal, closeModal } from './modal.js';
import { formatStatName, showToast, formatNumber, updateResources } from './ui.js';
import { getBossScalingFactor } from '../prestige.js';
import { t, tp } from '../i18n.js';
import { buildStatisticsDisplayEntries, formatSeparatedStat } from '../statistics.js';

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
        <button id="prestige-reroll-btn">${t('prestige.reroll')} (60<img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/>)</button>
        <span id="prestige-crystals-total" class="prestige-crystals-total" style="margin-left:10px;"></span>
      </div>
      <div class="prestige-info-message" style="margin-top: 10px; color: #9ac7fcff; font-size: 1.05em;">
      <p class="prestige-info prestige-bonus-info">${tp('prestige.bonusInfo', { bonus: bonusPercent })}</p>
      <p class="prestige-info">${t('prestige.resetInfo')}</p>
      <p class="prestige-info">${t('prestige.optionsInfo')}</p>
      <p class="prestige-info">${t('prestige.levelRequirementIncreaseInfo')}</p>
      <p class="prestige-info">${t('prestige.selectionRequirementInfo')}</p>
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
  const crystalsTotalEl = modal.querySelector('#prestige-crystals-total');
  const updateModalCrystals = () => {
    if (!crystalsTotalEl) return;
    crystalsTotalEl.innerHTML = `${tp('prestige.totalCrystals', { count: formatNumber(hero.crystals || 0) })} <img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/>`;
  };
  let selectedIdx = null;

  const renderCards = () => {
    cardsContainer.innerHTML = cards
      .map((c, i) => {
        const lockLabel = c.locked
          ? `<img src="${BASE}/icons/lock.svg" class="icon" alt="${t('prestige.lock')}"/>`
          : `${t('prestige.lock')} (20<img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/>)`;
        const rerollCost = formatNumber(prestige.getCardValueRerollCost(c));
        const rerollLabel = `${t('prestige.rerollValues')} (${rerollCost}<img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/>)`;
        const descriptionItems = c.descriptions
          .map((d, idx) => {
            const percent = c.rollPercentiles?.[idx];
            const style =
              typeof percent === 'number' && !Number.isNaN(percent)
                ? ` style="--roll-percent:${Math.max(0, Math.min(1, percent))};"`
                : '';
            return `<li${style}>${d}</li>`;
          })
          .join('');
        return html`
          <div class="prestige-card-wrapper" data-idx="${i}">
            <div class="prestige-card ${c.locked ? 'locked' : ''} ${selectedIdx === i ? 'selected' : ''}">
              <ul>${descriptionItems}</ul>
            </div>
            <div class="prestige-card-actions">
              <button class="prestige-lock-btn">${lockLabel}</button>
              <button class="prestige-reroll-values-btn">${rerollLabel}</button>
            </div>
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
        const wrapper = btn.closest('.prestige-card-wrapper');
        const idx = parseInt(wrapper.dataset.idx, 10);
        const card = cards[idx];
        const cardEl = wrapper.querySelector('.prestige-card');
        if (card.locked) {
          card.locked = false;
          btn.innerHTML = `${t('prestige.lock')} (20<img src="${BASE}/icons/crystal.svg" class="icon" alt="${t('resource.crystal.name')}"/>)`;
          cardEl.classList.remove('locked');
        } else {
          if (hero.crystals < 20) {
            showToast(t('prestige.notEnoughCrystalsLock'));
            return;
          }
          hero.crystals -= 20;
          updateResources();
          updateModalCrystals();
          card.locked = true;
          btn.innerHTML = `<img src="${BASE}/icons/lock.svg" class="icon" alt="${t('prestige.lock')}"/>`;
          cardEl.classList.add('locked');
        }
      });
    });
    cardsContainer.querySelectorAll('.prestige-reroll-values-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wrapper = btn.closest('.prestige-card-wrapper');
        const idx = parseInt(wrapper.dataset.idx, 10);
        const card = cards[idx];
        const cost = prestige.getCardValueRerollCost(card);
        if (hero.crystals < cost) {
          showToast(t('prestige.notEnoughCrystalsValueReroll'));
          return;
        }
        hero.crystals -= cost;
        updateResources();
        updateModalCrystals();
        cards = prestige.rerollCardValues(idx) || cards;
        renderCards();
      });
    });
  };

  renderCards();
  updateModalCrystals();

  const rerollBtn = modal.querySelector('#prestige-reroll-btn');
  rerollBtn.onclick = () => {
    if (hero.crystals < 60) {
      showToast(t('prestige.notEnoughCrystalsReroll'));
      return;
    }
    hero.crystals -= 60;
    updateResources();
    updateModalCrystals();
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

function openPrestigeDetailModal(entry) {
  if (!entry) return;
  const statsEntries = buildStatisticsDisplayEntries(entry.statistics || {});
  const stats = statsEntries
    .map((statEntry) => {
      if (statEntry.type === 'segments') {
        return `<li>${formatSeparatedStat(statEntry.label, statEntry.segments)}</li>`;
      }
      return `<li>${statEntry.text}</li>`;
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
