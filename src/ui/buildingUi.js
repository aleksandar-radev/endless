// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.
const html = String.raw;

import { buildings, dataManager, hero, options } from '../globals.js';
import { Building } from '../building.js';
import { createModal, closeModal } from './modal.js';
import { showConfirmDialog, updateResources, formatNumber } from './ui.js';
import { getTimeNow } from '../common.js';
import { t, tp } from '../i18n.js';

// Countdown timer state (single updater for all visible cards)
let buildingCountdownInterval = null;
let serverTimeOffsetMs = 0; // getTimeNow() - Date.now()

function intervalToMs(interval) {
  if (!interval) return 0;
  if (interval === 'minute') return 60 * 1000;
  if (interval === 'hour') return 60 * 60 * 1000;
  if (typeof interval === 'string' && interval.endsWith('min')) return parseInt(interval) * 60 * 1000;
  if (typeof interval === 'string' && interval.endsWith('sec')) return parseInt(interval) * 1000;
  return 0;
}

function fmtDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSec = Math.ceil(ms / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

async function ensureTimeOffsetInitialized() {
  if (serverTimeOffsetMs !== 0) return;
  try {
    const now = await getTimeNow();
    serverTimeOffsetMs = now - Date.now();
  } catch {
    // Fallback to local time only
    serverTimeOffsetMs = 0;
  }
}

function updateBuildingCountdowns() {
  // If the offline bonuses modal is open, do not auto-collect; let that flow handle it
  if (document.getElementById('offline-bonuses-modal')) return;
  const nodes = document.querySelectorAll('.building-next-bonus');
  if (!nodes.length) return;
  const now = Date.now() + serverTimeOffsetMs;
  let needsCollect = false;
  nodes.forEach((el) => {
    const id = el.dataset.buildingId;
    const b = buildings?.buildings?.[id];
    if (!b || b.placedAt == null || b.level <= 0 || !b.effect?.interval) {
      el.textContent = tp('buildings.nextBonus', { time: '—' });
      return;
    }
    const intervalMs = intervalToMs(b.effect.interval);
    if (!intervalMs) {
      el.textContent = tp('buildings.nextBonus', { time: '—' });
      return;
    }
    const nextAt = (b.lastBonusTime || now) + intervalMs;
    const msLeft = nextAt - now;
    if (msLeft <= 0) {
      // Mark for collection; UI will refresh after collect
      needsCollect = true;
      el.textContent = tp('buildings.nextBonus', { time: '0:00' });
    } else {
      el.textContent = tp('buildings.nextBonus', { time: fmtDuration(msLeft) });
    }
  });
  if (needsCollect && buildings?.collectBonuses) {
    // Run once for all buildings; then refresh resources and allow timers to reset
    buildings
      .collectBonuses({ showOfflineModal: false })
      .then(() => {
        updateResources();
      })
      .catch(() => {});
  }
}

function startBuildingCountdowns() {
  if (buildingCountdownInterval != null) return;
  // Initialize server time offset once then start ticking
  ensureTimeOffsetInitialized().finally(() => {
    // Small delay to avoid racing the initial offline collection flow in main.js
    setTimeout(() => {
      updateBuildingCountdowns();
      buildingCountdownInterval = setInterval(updateBuildingCountdowns, 1000);
    }, 1200);
  });
}

function createBuildingCard(building) {
  const el = document.createElement('div');
  el.className = 'building-card';
  el.innerHTML = html`
    <div class="building-image">
      <img src="${import.meta.env.VITE_BASE_PATH + building.image}" alt="${building.name}" class="building-img" />
    </div>
    <div class="building-info">
      <div class="building-name">${building.name}</div>
      <div class="building-effect">${building.formatEffect()}</div>
      <div class="building-earned">${tp('buildings.totalEarned', { amount: formatNumber(building.totalEarned), type: building.effect?.type || '' })}</div>
  <div class="building-next-bonus" data-building-id="${building.id}">${tp('buildings.nextBonus', { time: '—' })}</div>
    </div>
  `;
  return el;
}

function showBuildingInfoModal(building, onUpgrade, placementOptions) {
  const canUpgrade = building.level < building.maxLevel;

  let upgradeAmount = options.useNumericInputs ? Math.min(options.buildingQty || 1, 10000) : 1;
  let modal;

  function getMaxUpgradeAmount() {
    return Math.min(building.getMaxUpgradeAmount(hero), 10000);
  }

  function getTotalBonus(amount) {
    return building.getNextEffectValue(building.level + amount) - building.getEffectValue();
  }

  function canAffordUpgrade(amount) {
    const totalCost = building.getUpgradeCost(amount);
    for (const [type, value] of Object.entries(totalCost)) {
      if ((hero[type + 's'] !== undefined ? hero[type + 's'] : hero[type]) < value) {
        return false;
      }
    }
    return true;
  }

  function renderModalContent() {
    const maxAffordableAmt = getMaxUpgradeAmount();
    upgradeAmount = Math.max(1, Math.min(upgradeAmount, maxAffordableAmt));
    const totalCost = building.getUpgradeCost(upgradeAmount);
    const totalBonus = getTotalBonus(upgradeAmount);
    const refundAmount = building.getRefund();
    const upgradeControls = options.useNumericInputs
      ? `<input type="number" class="upgrade-amt-input input-number" min="1" max="10000" value="${upgradeAmount}" />
          <button data-amt="max" class="upgrade-amt-btn${upgradeAmount === maxAffordableAmt ? ' selected-upgrade-amt' : ''}">${t('options.max')}</button>`
      : `<button data-amt="1" class="upgrade-amt-btn${upgradeAmount === 1 ? ' selected-upgrade-amt' : ''}">+1</button>
          <button data-amt="10" class="upgrade-amt-btn${upgradeAmount === 10 ? ' selected-upgrade-amt' : ''}" ${maxAffordableAmt < 10 ? 'disabled' : ''}>+10</button>
          <button data-amt="50" class="upgrade-amt-btn${upgradeAmount === 50 ? ' selected-upgrade-amt' : ''}" ${maxAffordableAmt < 50 ? 'disabled' : ''}>+50</button>
          <button data-amt="max" class="upgrade-amt-btn${upgradeAmount === maxAffordableAmt ? ' selected-upgrade-amt' : ''}">${t('options.max')}</button>`;
    return html`
      <div class="building-modal-content">
        <button class="modal-close">×</button>
        <div class="building-info-modal-header">
          <img
            src="${import.meta.env.VITE_BASE_PATH + building.image}"
            class="building-map-img building-map-img-inset building-map-img-large"
            alt="${building.name}"
          />
          <div>
            <div class="building-name" style="font-size:1.3rem;">${building.name}</div>
            <div class="building-desc">${building.description}</div>
          </div>
        </div>
        <div class="building-info-modal-body">
          <div>${tp('buildings.levelInfo', { level: formatNumber(building.level), max: formatNumber(building.maxLevel) })}</div>
          <div>${tp('buildings.currentBonus', { bonus: building.formatEffect() })}</div>
          <div>${tp('buildings.upgradeAmountLine', { amount: formatNumber(upgradeAmount) })}</div>
          <div>${tp('buildings.totalUpgradeCost', { cost: Building.formatCost(totalCost) })}</div>
          <div>
            ${tp('buildings.bonusAfterUpgrade', { bonus: building.formatEffect(building.level + upgradeAmount), extra: formatNumber(totalBonus), type: building.effect?.type || '' })}
          </div>
        </div>
        <div class="building-info-modal-upgrade">
          <div style="margin: 10px 0 6px 0;" data-i18n="buildings.upgradeAmountLabel">${t('buildings.upgradeAmountLabel')}</div>
          <div class="building-upgrade-amounts">${upgradeControls}</div>
          <button class="building-upgrade-btn" ${canUpgrade && canAffordUpgrade(upgradeAmount) ? '' : 'disabled'}>
            ${t('buildings.upgrade')}
          </button>
          ${!placementOptions
    ? `<button class="building-sell-btn">${tp('buildings.sellRefund', { refund: Building.formatCost(refundAmount) })}</button>`
    : ''}
        </div>
      </div>
    `;
  }

  function rerenderModal() {
    modal.innerHTML = renderModalContent();
    // Re-attach event listeners
    const input = modal.querySelector('.upgrade-amt-input');
    const maxBtn = modal.querySelector('button[data-amt="max"]');
    if (input) {
      input.addEventListener('input', () => {
        let amt = parseInt(input.value, 10);
        if (isNaN(amt) || amt < 1) amt = 1;
        if (amt > 10000) amt = 10000;
        upgradeAmount = Math.max(1, Math.min(getMaxUpgradeAmount(), amt));
        options.buildingQty = upgradeAmount;
        dataManager.saveGame();
        rerenderModal();
        const newInput = modal.querySelector('.upgrade-amt-input');
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
      });
    } else {
      modal.querySelectorAll('.upgrade-amt-btn').forEach((btn) => {
        btn.onclick = () => {
          let amt;
          if (btn.dataset.amt === 'max') {
            amt = getMaxUpgradeAmount();
          } else {
            amt = parseInt(btn.dataset.amt);
          }
          upgradeAmount = Math.max(1, Math.min(getMaxUpgradeAmount(), amt));
          rerenderModal();
        };
      });
    }
    if (maxBtn && input) {
      maxBtn.onclick = () => {
        upgradeAmount = getMaxUpgradeAmount();
        options.buildingQty = upgradeAmount;
        dataManager.saveGame();
        rerenderModal();
      };
    }
    modal.querySelector('.building-upgrade-btn').onclick = () => {
      let amt = Math.min(upgradeAmount, getMaxUpgradeAmount());
      let upgraded = false;
      // Check if player can afford all resources for the upgrade
      const totalCost = building.getUpgradeCost(amt);
      let canAfford = true;
      for (const [type, value] of Object.entries(totalCost)) {
        if ((hero[type + 's'] !== undefined ? hero[type + 's'] : hero[type]) < value) {
          canAfford = false;
          break;
        }
      }
      if (!canAfford) {
        alert(t('buildings.notEnoughResources'));
        return;
      }
      // Deduct resources
      for (const [type, value] of Object.entries(totalCost)) {
        if (hero[type + 's'] !== undefined) hero[type + 's'] -= value;
        else if (hero[type] !== undefined) hero[type] -= value;
      }
      for (let i = 0; i < amt; ++i) {
        if (building.level < building.maxLevel) {
          if (buildings.upgradeBuilding) buildings.upgradeBuilding(building.id);
          upgraded = true;
        }
      }
      updateResources(); // Update UI after upgrade
      if (upgraded && placementOptions) {
        // If in placement mode and this is the first upgrade, place the building
        if (building.placedAt == null) {
          buildings.placeBuilding(building.id, placementOptions.placeholderIdx);
          if (typeof placementOptions.onPlaced === 'function') placementOptions.onPlaced();
          // Update main buildings tab after first placement
          renderPurchasedBuildings();
        }
        // If building is now level 1 or higher, switch to normal modal (show sell/refund)
        if (building.level > 0) {
          closeModal('building-info-modal');
          showBuildingInfoModal(building, onUpgrade, null);
          return;
        }
      }
      if (upgraded) renderPurchasedBuildings();
      if (upgraded && typeof onUpgrade === 'function') onUpgrade();
      if (dataManager) dataManager.saveGame();
      rerenderModal();
    };
    if (!placementOptions) {
      modal.querySelector('.building-sell-btn').onclick = () => {
        showConfirmDialog(tp('buildings.removeConfirm', { name: building.name })).then((confirmed) => {
          if (confirmed) {
            building.refundToHero();
            buildings.unplaceBuilding(building.id);
            if (typeof onUpgrade === 'function') onUpgrade();
            if (dataManager) dataManager.saveGame();
            closeModal('building-info-modal');
            renderPurchasedBuildings();
          }
        });
      };
    }
    modal.querySelector('.modal-close').onclick = () => {
      // If in placement mode and not upgraded, do not place the building
      closeModal('building-info-modal');
    };
  }

  modal = createModal({
    id: 'building-info-modal',
    className: 'building-modal building-info-modal',
    content: renderModalContent(),
    onClose: null,
  });
  rerenderModal();
}

function showSelectBuildingModal() {
  const placeholderIdx = buildings.placedBuildings.findIndex((id) => id === null);
  if (placeholderIdx === -1) {
    alert(t('buildings.noSlots'));
    return;
  }
  const content = html`
    <div class="building-choose-modal-content">
      <button class="modal-close">×</button>
      <h3 data-i18n="buildings.selectToPlace">${t('buildings.selectToPlace')}</h3>
      <div class="choose-building-list"></div>
    </div>
  `;
  const modal = createModal({
    id: 'building-choose-modal',
    className: 'building-modal building-choose-building-modal',
    content,
    onClose: null,
  });
  const list = modal.querySelector('.choose-building-list');
  const placedIds = new Set(
    Object.values(buildings.buildings)
      .filter((b) => b.placedAt !== null)
      .map((b) => b.id),
  );
  Object.values(buildings.buildings)
    .filter((building) => !placedIds.has(building.id))
    .forEach((building) => {
      const el = document.createElement('div');
      el.className = 'building-card';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div class="building-image">
          <img src="${import.meta.env.VITE_BASE_PATH + building.image}" alt="${building.name}" class="building-img" />
        </div>
        <div class="building-info">
          <div class="building-name">${building.name}</div>
          <div class="building-desc">${building.description}</div>
        </div>
      `;
      el.onclick = () => {
        closeModal('building-choose-modal');
        showBuildingInfoModal(building, renderPurchasedBuildings, {
          placeholderIdx,
          onPlaced: renderPurchasedBuildings,
        });
      };
      list.appendChild(el);
    });
  modal.querySelector('.modal-close').onclick = () => closeModal('building-choose-modal');
}

export function renderPurchasedBuildings() {
  const purchased = document.getElementById('purchased-buildings');
  if (!purchased) return;
  purchased.innerHTML = '';
  Object.values(buildings.buildings)
    .filter((building) => building.placedAt !== null)
    .forEach((building) => {
      const card = createBuildingCard(building);
      card.style.cursor = 'pointer';
      card.onclick = () => showBuildingInfoModal(building, renderPurchasedBuildings);
      purchased.appendChild(card);
    });
  // Update countdowns after (re)render
  updateBuildingCountdowns();
}

export function initializeBuildingsUI() {
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML =
    `<button id="select-building-btn" class="building-select-btn" data-i18n="buildings.selectBuilding">${t('buildings.selectBuilding')}</button><div id="purchased-buildings"></div>`;
  renderPurchasedBuildings();
  // Open building selection modal
  tab.querySelector('#select-building-btn').onclick = showSelectBuildingModal;
  // Start live countdowns
  startBuildingCountdowns();
}

export function showOfflineBonusesModal(bonuses, onCollect) {
  let collected = false;
  function doCollect() {
    if (!collected) {
      collected = true;
      if (typeof onCollect === 'function') onCollect();
    }
  }
  let htmlContent = html` <div class="offline-bonuses-modal-content">
    <button class="modal-close">×</button>
    <h2 data-i18n="buildings.offlineRewardsTitle">${t('buildings.offlineRewardsTitle')}</h2>
    <div style="margin:12px 0 0 0;">
      <ul style="list-style:none;padding:0;">
        ${bonuses
    .map((b) => {
      const intName = b.interval === 'min' ? 'minute' : b.interval === 'sec' ? 'second' : b.interval;
      const intervalKey = `time.${b.times > 1 ? intName + 's' : intName}`;
      return tp('buildings.offlineBonusItem', {
        icon: b.icon || '',
        name: b.name,
        amount: formatNumber(b.amount),
        type: b.type,
        times: formatNumber(b.times),
        interval: t(intervalKey),
      });
    })
    .join('')}
      </ul>
    </div>
    <div style="margin-top:18px;color:#aaa;font-size:0.98em;" data-i18n="buildings.offlineRewardsInfo">${t('buildings.offlineRewardsInfo')}</div>
    <button
      class="offline-bonuses-collect-btn"
      style="margin-top:24px;font-size:1.1em;padding:10px 32px;border-radius:8px;background:linear-gradient(90deg,#4e54c8,#8f94fb);color:#fff;font-weight:bold;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(78,84,200,0.15);"
      data-i18n="buildings.collect"
    >
      ${t('buildings.collect')}
    </button>
  </div>`;
  const modal = createModal({
    id: 'offline-bonuses-modal',
    className: 'building-modal offline-bonuses-modal',
    content: htmlContent,
    onClose: doCollect,
  });
  modal.querySelector('.offline-bonuses-collect-btn').onclick = () => {
    doCollect();
    closeModal('offline-bonuses-modal');
  };
  // Also call doCollect if the close button is clicked
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn)
    closeBtn.onclick = () => {
      doCollect();
      closeModal('offline-bonuses-modal');
    };
}
