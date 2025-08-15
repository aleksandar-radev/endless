import { prestige, hero } from '../globals.js';
import { createModal, closeModal } from './modal.js';
import { formatStatName, showToast, formatNumber, updateResources } from './ui.js';

const html = String.raw;

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
  levelInfo.textContent = `Level ${level} / ${required}`;
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
      <button id="prestige-now-btn">Prestige Now</button>
      <button id="prestige-history-btn">History</button>
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
    : '<li>No prestige bonuses yet.</li>';
}

function openPrestigeModal() {
  // Always use prestige.generateCards(3), which now returns the saved cards if present
  let cards = prestige.generateCards(3);
  const content = html`
    <div class="prestige-modal-content">
      <button class="modal-close">&times;</button>
      <div class="prestige-cards"></div>
      <div class="modal-controls">
        <button id="prestige-reroll-btn">Reroll (100💎)</button>
      </div>
      <div class="prestige-info-message" style="margin-top: 10px; color: #9ac7fcff; font-size: 1.05em;">

      <p class="prestige-info">Prestige starts a fresh run: level, equipment, inventory, buildings, quests and most progress are reset. Only chosen Prestige bonus is kept.</p>
      <p class="prestige-info">All options apart from ones that are unlocked from crystal shop are preserved after a prestige.</p>
      <div class="prestige-info-cta">A record is saved to Prestige History so you can review past prestiges.</div>
      </div>
    </div>
  `;

  const modal = createModal({ id: 'prestige-modal', className: 'prestige-modal', content });
  const cardsContainer = modal.querySelector('.prestige-cards');

  const renderCards = () => {
    cardsContainer.innerHTML = cards
      .map(
        (c, i) => html`
                <div class="prestige-card" data-idx="${i}">
                  <ul>${c.descriptions.map((d) => `<li>${d}</li>`).join('')}</ul>
                </div>
              `,
      )
      .join('');
    cardsContainer.querySelectorAll('.prestige-card').forEach((el) => {
      el.onclick = async () => {
        const idx = parseInt(el.dataset.idx, 10);
        await prestige.prestigeWithBonus(cards[idx]);
        closeModal(modal);
        updatePrestigeBonuses();
        // Update button state after prestige
        updateButtonState();
        updateLevelInfo();
      };
    });
  };

  renderCards();

  const rerollBtn = modal.querySelector('#prestige-reroll-btn');
  rerollBtn.onclick = () => {
    if (hero.crystals < 100) {
      showToast('Not enough crystals to reroll.');
      return;
    }
    hero.crystals -= 100;
    updateResources();
    cards = prestige.rerollCards(3);
    renderCards();
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
      <h2>Prestige History</h2>
      <ul class="prestige-history-list">
        ${items || '<li>No prestiges yet.</li>'}
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
    return `<li>Enemies Killed by Zone: ${parts.join('')}</li>`;
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
      ? 'Enemies Killed by Rarity'
      : name === 'itemsFound'
        ? 'Items Found by Rarity'
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
      <h2>Prestige #${entry.number}</h2>
      <div>Time: ${new Date(entry.timestamp).toLocaleString()}</div>
      <ul class="prestige-stat-list">${stats}</ul>
    </div>`;
  createModal({ id: 'prestige-detail-modal', className: 'prestige-history-modal', content });
}
