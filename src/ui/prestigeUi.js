import { prestige } from '../globals.js';
import { createModal, closeModal } from './modal.js';
import { formatStatName, showToast } from './ui.js';

const html = String.raw;

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
    </div>
    <ul class="prestige-bonuses-list"></ul>
  `;

  const btn = container.querySelector('#prestige-now-btn');
  const updateButtonState = () => {
    if (prestige.canPrestige()) {
      btn.classList.remove('disabled');
    } else {
      btn.classList.add('disabled');
    }
  };
  updateButtonState();

  btn.addEventListener('click', (e) => {
    if (btn.classList.contains('disabled')) {
      e.preventDefault();
      showToast(prestige.getPrestigeRequirementMessage());
      return;
    }
    openPrestigeModal();
  });

  updatePrestigeBonuses();

  // Listen for a custom event 'heroLevelUp' to update the prestige tab
  document.addEventListener('heroLevelUp', () => {
    updateButtonState();
    updatePrestigeBonuses();
  });
  document.addEventListener('bossKilled', () => {
    updateButtonState();
    updatePrestigeBonuses();
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
  const cards = prestige.generateCards(3);
  const content = html`
    <div class="prestige-modal-content">
      <button class="modal-close">&times;</button>
      <div class="prestige-cards">
        ${cards
    .map(
      (c, i) => html`
              <div class="prestige-card" data-idx="${i}">
                <ul>${c.descriptions.map((d) => `<li>${d}</li>`).join('')}</ul>
              </div>
            `,
    )
    .join('')}
      </div>
    </div>
  `;

  const modal = createModal({ id: 'prestige-modal', className: 'prestige-modal', content });
  modal.querySelectorAll('.prestige-card').forEach((el) => {
    el.onclick = async () => {
      const idx = parseInt(el.dataset.idx, 10);
      await prestige.prestigeWithBonus(cards[idx]);
      closeModal(modal);
      updatePrestigeBonuses();
    };
  });
}

export function formatPrestigeBonus(stat, value) {
  if (stat.endsWith('Percent')) {
    return `+${(value * 100).toFixed(1)}%`;
  }
  return `+${Math.round(value)}`;
}
