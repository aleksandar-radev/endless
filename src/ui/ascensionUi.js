import { ascension, prestige, options } from '../globals.js';
import { showToast, showTooltip, hideTooltip, positionTooltip, formatNumber } from './ui.js';
import { createModal, closeModal } from './modal.js';
import { t, tp } from '../i18n.js';
import { renderRunesUI } from './runesUi.js';
import { getStatDecimalPlaces } from '../constants/stats/stats.js';
import { REQUIRED_CRYSTALS_FOR_ASCENSION } from '../ascension.js';

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
  const totalCrystals = prestige.bonuses?.startingCrystals || 0;
  const unspent = ascension.points;
  const total = ascension.getTotalPoints();
  const BASE = import.meta.env.VITE_BASE_PATH;

  container.innerHTML = `
    <div class="ascension-header">
      <button id="ascend-now-btn" ${disabled}>${t('ascension.ascendNow')}</button>
      <button id="ascension-info-btn" class="ascension-info-btn">?</button>
      <div class="ascension-points">${t('ascension.points')}: ${formatNumber(unspent)} / ${formatNumber(total)}</div>
      <div class="prestige-starting-crystals-info">${t('ascension.upgrade.startingCrystals')}: ${formatNumber(totalCrystals)} <img src="${BASE}/icons/crystal.png" style="width:20px; height:20px; vertical-align:middle; margin-left: 4px;" alt="crystal"/></div>
    </div>
    <div class="ascension-tabs"></div>
    <ul class="ascension-upgrades-list"></ul>
  `;
  const btn = container.querySelector('#ascend-now-btn');
  btn.onclick = () => {
    if (!ascension.canAscend()) {
      showToast(tp('ascension.needPrestiges', { required: REQUIRED_CRYSTALS_FOR_ASCENSION }));
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
        `<button class="ascension-tab ${key === activeCategory ? 'active' : ''}" data-cat="${key}">${t(cat.label)}</button>`,
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
      const perLevel = getAscensionPerLevelBonusText(key, cfg);
      // Show the value directly in the title like damage
      const translatedLabel = t(cfg.label);
      const nameWithBonus = perLevel ? `${perLevel} ${translatedLabel}` : translatedLabel;
      return `<li data-key="${key}">
        <div class="ascension-upgrade-info">
          <span class="ascension-level-tag">${t('ascension.upgrade.lvl')} ${levelText}</span>
          <span class="ascension-upgrade-label">${nameWithBonus}</span>
        </div>
        <button class="ascension-upgrade-btn" ${disabledBtn}>
          <span class="ascension-cost">${t('ascension.upgrade.cost')}: ${cost}</span>
        </button>
      </li>`;
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
  const modal = createModal({
    id: 'ascension-modal', className: 'ascension-modal', content,
  });
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
      <p>${tp('ascension.info.requirement', { required: REQUIRED_CRYSTALS_FOR_ASCENSION })}</p>
      <p>${tp('ascension.info.points', {
    required: REQUIRED_CRYSTALS_FOR_ASCENSION,
    points: Math.floor(REQUIRED_CRYSTALS_FOR_ASCENSION / 100),
  })}</p>
      <p>${tp('ascension.info.current', { crystals: totalCrystals, points: earned })}</p>
    </div>
  `;
  const modal = createModal({
    id: 'ascension-info-modal', className: 'ascension-modal', content,
  });
  modal.querySelector('.modal-close').onclick = () => closeModal('ascension-info-modal');
}

function openUpgradeInfoModal(key) {
  const cfg = ascension.config[key];
  if (!cfg) return;
  const tip = t(`ascension.tooltip.${key}`);
  const level = ascension.upgrades[key] || 0;
  const max = cfg.maxLevel || Infinity;
  const perLevel = getAscensionPerLevelBonusText(key, cfg);
  const translatedLabel = t(cfg.label);
  const title = perLevel ? `${perLevel} ${translatedLabel}` : translatedLabel;

  const controlsMarkup = options?.useNumericInputs
    ? '<div class="ascension-qty-controls"><input type="number" class="modal-qty-input input-number" min="1" value="1" /></div>'
    : '<div class="ascension-qty-controls"><button class="qty-btn" data-qty="1">+1</button><button class="qty-btn" data-qty="10">+10</button><button class="qty-btn" data-qty="50">+50</button></div>';

  const content = `
    <div class="ascension-modal-content">
      <button class="modal-close" aria-label="${t('common.close')}">&times;</button>
      <h2>${title}</h2>
      <p>${tip}</p>
      <p>${t('ascension.upgrade.currentLevel')}: <span class="modal-level">${formatNumber(level)}</span>${
  max !== Infinity ? `/<span class=\"modal-max\">${formatNumber(max)}</span>` : ''
}</p>
      <p>${t('ascension.upgrade.currentBonus')}: <span class="modal-bonus">${getAscensionBonusText(
  key,
  cfg,
  level,
)}</span></p>
      <p>${t('ascension.upgrade.nextLevelBonus')}: <span class="modal-next-bonus">${getAscensionBonusText(
  key,
  cfg,
  level + 1,
)}</span></p>
      <p>${t('ascension.upgrade.totalCost')}: <span class="modal-total-cost"></span> ${t('ascension.points')} (<span class="modal-qty">1</span>)</p>
      ${controlsMarkup}
      <div class="modal-controls">
        <button class="modal-buy ascension-upgrade-buy">${t('common.upgrade')}</button>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'ascension-upgrade-modal', className: 'ascension-modal', content,
  });
  let selectedQty = 1;
  const getBulkCost = (qty) => {
    let points = ascension.points;
    let lvl = ascension.upgrades[key] || 0;
    const maxLvl = cfg.maxLevel || Infinity;
    let remaining = Math.min(qty, Math.max(0, maxLvl - lvl));
    let totalCost = 0;
    let purchased = 0;
    while (remaining > 0) {
      const cost = typeof cfg.cost === 'function' ? cfg.cost(lvl) : cfg.cost || 1;
      if (points < cost || lvl >= maxLvl) break;
      points -= cost;
      totalCost += cost;
      lvl += 1;
      purchased += 1;
      remaining -= 1;
    }
    return { qty: purchased, totalCost };
  };

  const update = () => {
    const lvl = ascension.upgrades[key] || 0;
    const maxLvl = cfg.maxLevel || Infinity;
    const { qty: affordableQty, totalCost } = getBulkCost(selectedQty);
    const affordable = affordableQty > 0 && lvl < maxLvl && totalCost <= ascension.points;
    const lvlEl = modal.querySelector('.modal-level');
    const maxEl = modal.querySelector('.modal-max');
    if (lvlEl) lvlEl.textContent = formatNumber(lvl);
    if (maxEl && maxLvl !== Infinity) maxEl.textContent = formatNumber(maxLvl);
    const bonusEl = modal.querySelector('.modal-bonus');
    const nextEl = modal.querySelector('.modal-next-bonus');
    const totalCostEl = modal.querySelector('.modal-total-cost');
    const qtyEl = modal.querySelector('.modal-qty');
    if (bonusEl) bonusEl.textContent = getAscensionBonusText(key, cfg, lvl);
    if (nextEl) nextEl.textContent = getAscensionBonusText(key, cfg, lvl + 1);
    if (totalCostEl) totalCostEl.textContent = formatNumber(totalCost);
    if (qtyEl) qtyEl.textContent = formatNumber(affordableQty);
    const buyBtn = modal.querySelector('.ascension-upgrade-buy');
    if (buyBtn) buyBtn.disabled = !affordable;
  };

  const setActiveQtyButton = () => {
    const btns = modal.querySelectorAll('.qty-btn');
    btns.forEach((b) => {
      const q = parseInt(b.dataset.qty, 10);
      b.classList.toggle('active', q === selectedQty);
    });
  };

  const doBuy = () => {
    const { qty: toBuy } = getBulkCost(selectedQty);
    if (toBuy <= 0) return update();
    for (let i = 0; i < toBuy; i++) {
      if (!ascension.spendPoint(key)) break;
    }
    updateAscensionUI();
    if (key === 'runeSlots' || key === 'runeTabs') renderRunesUI();
    update();
  };
  modal.querySelector('.ascension-upgrade-buy').onclick = doBuy;

  const input = modal.querySelector('.modal-qty-input');
  if (input) {
    input.addEventListener('input', () => {
      let val = parseInt(input.value, 10);
      if (Number.isNaN(val) || val < 1) val = 1;
      selectedQty = val;
      update();
    });
  } else {
    modal.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedQty = parseInt(btn.dataset.qty, 10);
        update();
        setActiveQtyButton();
      });
    });
    // initialize active state
    setActiveQtyButton();
  }
  modal.querySelector('.modal-close').onclick = () => closeModal('ascension-upgrade-modal');
  update();
}

function getAscensionPerLevelBonusText(key, cfg) {
  const base = cfg?.bonus ?? 0;
  if (!isFinite(base)) return '';
  // Determine decimals/suffix from a representative stat/effect when possible
  const target = cfg.stat || cfg.effect || (Array.isArray(cfg.stats) ? cfg.stats[0] : null) || key;
  const isPercent = (s) => s && (/Percent$/i.test(s) || /CostReduction$/i.test(s));
  const useFractional = isPercent(target);
  const definedDecimals = target ? getStatDecimalPlaces(target, undefined) : undefined;
  const decimals =
    definedDecimals !== undefined ? definedDecimals : isPercent(target) ? 1 : Number.isInteger(base) ? 0 : 2;
  const value = useFractional ? base * 100 : base;
  return `+${formatNumber(value.toFixed(decimals))}${isPercent(target) ? ' %' : ''}`;
}

function getAscensionBonusText(key, cfg, level) {
  const valPerLevel = cfg?.bonus ?? 0;
  if (!isFinite(valPerLevel)) return '';
  const lvl = Math.max(0, level || 0);
  const total = valPerLevel * lvl;
  const target = cfg.stat || cfg.effect || (Array.isArray(cfg.stats) ? cfg.stats[0] : null) || key;
  const isPercent = (s) => s && (/Percent$/i.test(s) || /CostReduction$/i.test(s));
  const useFractional = isPercent(target);
  const definedDecimals = target ? getStatDecimalPlaces(target, undefined) : undefined;
  const decimals =
    definedDecimals !== undefined ? definedDecimals : isPercent(target) ? 1 : Number.isInteger(total) ? 0 : 2;
  const value = useFractional ? total * 100 : total;
  return `+${formatNumber(value.toFixed(decimals))}${isPercent(target) ? ' %' : ''}`;
}
