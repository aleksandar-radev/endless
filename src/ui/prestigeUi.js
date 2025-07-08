import { prestige } from '../globals.js';
import { createModal, closeModal } from './modal.js';

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

  container.innerHTML = `
    <div class="prestige-header">
      <button id="prestige-now-btn">Prestige Now</button>
    </div>
    <ul class="prestige-bonuses-list"></ul>
  `;

  container.querySelector('#prestige-now-btn').onclick = () => {
    if (prestige.canPrestige()) openPrestigeModal();
  };

  updatePrestigeBonuses();
}

export function updatePrestigeBonuses() {
  const tab = document.getElementById('prestige');
  if (!tab) return;
  const list = tab.querySelector('.prestige-bonuses-list');
  if (!list) return;
  const bonuses = prestige.getBonuses();
  list.innerHTML = Object.keys(bonuses).length
    ? Object.entries(bonuses)
      .map(([stat, val]) => `<li>${stat}: +${(val * 100).toFixed(1)}%</li>`)
      .join('')
    : '<li>No prestige bonuses yet.</li>';
}

function openPrestigeModal() {
  const cards = prestige.generateCards(3);
  const content = html`
    <div class="prestige-modal-content">
      <button class="modal-close">&times;</button>
      <div class="prestige-cards">
        ${cards
    .map(
      (c, i) => `
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
