import { ascension, prestige } from '../globals.js';
import { ASCENSION_UPGRADES } from '../ascension.js';
import { showToast } from './ui.js';

const html = String.raw;

export function initializeAscensionUI() {
  const tab = document.getElementById('ascension');
  if (!tab) return;

  let container = tab.querySelector('.ascension-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ascension-container';
    tab.innerHTML = '';
    tab.appendChild(container);
  }

  function render() {
    const upgradesHtml = Object.entries(ASCENSION_UPGRADES)
      .map(([key, cfg]) => {
        const disabled = ascension.getAvailablePoints() <= 0 ? 'disabled' : '';
        return html`
          <li>
            <span class="upgrade-label">${cfg.label} (Lvl ${ascension.getUpgradeLevel(key)})</span>
            <button class="ascension-upgrade-btn" data-up="${key}" ${disabled}>Upgrade</button>
          </li>
        `;
      })
      .join('');

    container.innerHTML = html`
      <div class="ascension-header">
        <button id="ascend-now-btn">Ascend Now</button>
        <div>Ascension Points: <span id="ascension-points">${ascension.getAvailablePoints()}</span></div>
      </div>
      <ul class="ascension-upgrades-list">
        ${upgradesHtml}
      </ul>
    `;

    container.querySelectorAll('.ascension-upgrade-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.up;
        const success = ascension.purchaseUpgrade(key);
        if (!success) {
          showToast('Not enough ascension points.');
        }
        render();
      });
    });

    const ascendBtn = container.querySelector('#ascend-now-btn');
    if (prestige.prestigeCount <= 0) {
      ascendBtn.classList.add('disabled');
    }
    ascendBtn.addEventListener('click', () => {
      if (prestige.prestigeCount <= 0) {
        showToast('Prestige at least once to ascend.');
        return;
      }
      ascension.ascend();
    });
  }

  render();
}
