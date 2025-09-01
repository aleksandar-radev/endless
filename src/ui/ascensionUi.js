import { ascension, prestige } from '../globals.js';
import { showToast, showTooltip, hideTooltip, positionTooltip } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { t, tp } from '../i18n.js';
import { renderRunesUI } from './runesUi.js';

let activeCategory = null;

export function initializeAscensionUI() {
  const tab = document.getElementById('ascension');
  if (!tab) return;
  if (!activeCategory && ascension?.categories) {
    activeCategory = Object.keys(ascension.categories)[0];
  }
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
  if (!activeCategory) {
    activeCategory = Object.keys(ascension.categories)[0];
  }
  container.innerHTML = `
    <div class="ascension-header">
      <button id="ascend-now-btn" ${disabled}>${t('ascension.ascendNow')}</button>
      <button id="ascension-info-btn" class="ascension-info-btn">?</button>
      <div class="ascension-points">${t('ascension.points')}: ${ascension.points}</div>
    </div>
    <div class="ascension-tabs"></div>
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

  const tabs = container.querySelector('.ascension-tabs');
  tabs.innerHTML = Object.entries(ascension.categories)
    .map(
      ([key, cat]) =>
        `<button class="ascension-tab ${key === activeCategory ? 'active' : ''}" data-cat="${key}">${cat.label}</button>`,
    )
    .join('');
  tabs.querySelectorAll('.ascension-tab').forEach((b) => {
    b.onclick = () => {
      activeCategory = b.dataset.cat;
      renderAscension();
    };
  });

  const list = container.querySelector('.ascension-upgrades-list');
  const cat = ascension.categories[activeCategory];
  const upgrades = Object.entries(cat.upgrades)
    .map(([key, cfg]) => {
      const level = ascension.upgrades[key] || 0;
      const cost = typeof cfg.cost === 'function' ? cfg.cost(level) : cfg.cost || 1;
      const max = cfg.maxLevel || Infinity;
      const disabledBtn = ascension.points < cost || level >= max ? 'disabled' : '';
      const levelText = cfg.maxLevel ? `${level}/${cfg.maxLevel}` : level;
      return `<li data-key="${key}"><span class="ascension-upgrade-label">${t('ascension.upgrade.lvl')} ${levelText} - ${cfg.label}</span> <button class="ascension-upgrade-btn" ${disabledBtn}>${t('ascension.upgrade.buy')} (<span class="ascension-cost">${t('ascension.upgrade.cost')}: ${cost}</span>)</button></li>`;
    })
    .join('');
  list.innerHTML = upgrades || `<li>${t('ascension.upgrade.none')}</li>`;
  list.querySelectorAll('li').forEach((li) => {
    const key = li.dataset.key;
    const lbl = li.querySelector('.ascension-upgrade-label');
    const tip = t(`ascension.tooltip.${key}`);
    if (lbl) {
      lbl.addEventListener('mouseenter', (e) => showTooltip(tip, e));
      lbl.addEventListener('mousemove', positionTooltip);
      lbl.addEventListener('mouseleave', hideTooltip);
      lbl.addEventListener('click', () => openUpgradeInfoModal(key));
    }
    const btn = li.querySelector('.ascension-upgrade-btn');
    if (btn) {
      btn.onclick = () => {
        if (ascension.spendPoint(key)) {
          updateAscensionUI();
          if (key === 'runeSlots') {
            renderRunesUI();
          }
        }
      };
    }
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

function openUpgradeInfoModal(key) {
  const cfg = ascension.config[key];
  const tip = t(`ascension.tooltip.${key}`);
  const content = `
    <div class="ascension-modal-content">
      <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
      <h2>${cfg.label}</h2>
      <p>${tip}</p>
    </div>
  `;
  const modal = createModal({ id: 'ascension-upgrade-modal', className: 'ascension-modal', content });
  modal.querySelector('.modal-close').onclick = () => closeModal('ascension-upgrade-modal');
}
