import { ascension, prestige } from '../globals.js';
import { showToast } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { t, tp } from '../i18n.js';

export function initializeAscensionUI() {
  const tab = document.getElementById('ascension');
  if (!tab) return;
  let container = tab.querySelector('.ascension-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ascension-container';
    tab.appendChild(container);
  }
  renderAscension();
}

export function updateAscensionUI() {
  const tab = document.getElementById('ascension');
  const container = tab?.querySelector('.ascension-container');
  if (!container) return;
  renderAscension();
}

function renderAscension() {
  const tab = document.getElementById('ascension');
  const container = tab.querySelector('.ascension-container');
  const disabled = ascension.canAscend() ? '' : 'disabled';
  container.innerHTML = `
    <div class="ascension-header">
      <button id="ascend-now-btn" ${disabled}>${t('ascension.ascendNow')}</button>
      <button id="ascension-info-btn" class="ascension-info-btn">?</button>
      <div class="ascension-points">${t('ascension.points')}: ${ascension.points}</div>
    </div>
    <ul class="ascension-upgrades-list"></ul>
  `;
  const btn = container.querySelector('#ascend-now-btn');
  btn.onclick = () => {
    if (!ascension.canAscend()) {
      showToast(t('ascension.needPrestiges'));
      return;
    }
    openAscensionModal();
  };
  const infoBtn = container.querySelector('#ascension-info-btn');
  infoBtn.onclick = openAscensionInfoModal;
  const list = container.querySelector('.ascension-upgrades-list');
  const items = Object.entries(ascension.config)
    .map(([key, cfg]) => {
      const level = ascension.upgrades[key] || 0;
      const cost = cfg.cost || 1;
      const max = cfg.maxLevel || Infinity;
      const disabled = ascension.points < cost || level >= max ? 'disabled' : '';
      const levelText = cfg.maxLevel ? `${level}/${cfg.maxLevel}` : level;
      return `<li data-key="${key}">${t('ascension.upgrade.lvl')} ${levelText} - ${cfg.label} <button class="ascension-upgrade-btn" ${disabled}>${t('ascension.upgrade.buy')} (${t('ascension.upgrade.cost')}: <span class="ascension-cost">${cost}</span>)</button></li>`;
    })
    .join('');
  list.innerHTML = items || `<li>${t('ascension.upgrade.none')}</li>`;
  list.querySelectorAll('.ascension-upgrade-btn').forEach((b) => {
    b.onclick = () => {
      const key = b.parentElement.dataset.key;
      if (ascension.spendPoint(key)) {
        updateAscensionUI();
      }
    };
  });
}

function openAscensionModal() {
  const earned = ascension.getEarnedPoints();
  const content = `
    <div class="ascension-modal-content">
      <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
      <h2>${t('ascension.modal.title')}</h2>
      <p>${t('ascension.modal.body')} <span class="ascension-earned">${earned}</span> ${earned === 1 ? t('ascension.modal.point') : t('ascension.modal.points')}.</p>
      <div class="modal-controls">
        <button id="ascension-confirm-btn">${t('ascension.modal.confirm')}</button>
        <button id="ascension-cancel-btn">${t('ascension.modal.cancel')}</button>
      </div>
    </div>
  `;
  const modal = createModal({ id: 'ascension-modal', className: 'ascension-modal', content });
  modal.querySelector('#ascension-confirm-btn').onclick = async () => {
    await ascension.ascend();
  };
  modal.querySelector('#ascension-cancel-btn').onclick = () => closeModal('ascension-modal');
}

function openAscensionInfoModal() {
  const totalCrystals = prestige.bonuses?.startingCrystals || 0;
  const earned = ascension.getEarnedPoints();
  const content = `
    <div class="ascension-modal-content">
      <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
      <h2>${t('ascension.info.title')}</h2>
      <p>${t('ascension.info.requirement')}</p>
      <p>${t('ascension.info.points')}</p>
      <p>${tp('ascension.info.current', { prestiges: prestige.prestigeCount, crystals: totalCrystals, points: earned })}</p>
    </div>
  `;
  const modal = createModal({ id: 'ascension-info-modal', className: 'ascension-modal', content });
  modal.querySelector('.modal-close').onclick = () => closeModal('ascension-info-modal');
}
