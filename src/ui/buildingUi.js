// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.
const html = String.raw;

import { buildings, dataManager, hero, options } from '../globals.js';
import { Building } from '../building.js';
import { createModal, closeModal } from './modal.js';
import { showConfirmDialog, updateResources, formatNumber, showToast } from './ui.js';
import { getTimeNow } from '../common.js';
import { t, tp } from '../i18n.js';
import { BUILDING_MAX_QTY } from '../constants/limits.js';

// Countdown timer state (single updater for all visible cards)
let buildingCountdownInterval = null;
let serverTimeOffsetMs = 0; // getTimeNow() - Date.now()

function intervalToMs(interval) {
  if (!interval) return 0;
  if (typeof interval === 'number') {
    // Ensure positive number
    return interval > 0 ? interval * 1000 : 0;
  }
  if (interval === 'minute') return 60 * 1000;
  if (interval === 'hour') return 60 * 60 * 1000;
  if (typeof interval === 'string' && interval.endsWith('min')) {
    const value = parseInt(interval);
    return !isNaN(value) && value > 0 ? value * 60 * 1000 : 0;
  }
  if (typeof interval === 'string' && interval.endsWith('sec')) {
    const value = parseInt(interval);
    return !isNaN(value) && value > 0 ? value * 1000 : 0;
  }
  return 0;
}

// Helper function to validate building state for timer display
function isBuildingReadyForTimer(building) {
  return (
    building &&
    building.level > 0 &&
    building.effect &&
    building.effect.interval &&
    intervalToMs(building.effect.interval) > 0
  );
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
  } catch (error) {
    console.warn('Failed to get server time, using local time:', error);
    // Fallback to local time only - this is still valid for countdown calculations
    serverTimeOffsetMs = 0;
  }
  if (serverTimeOffsetMs === 0 || !Number.isFinite(serverTimeOffsetMs)) {
    const storedOffset =
      Number.isFinite(buildings?.lastActive) && Number.isFinite(buildings?.lastActiveLocal)
        ? buildings.lastActive - buildings.lastActiveLocal
        : 0;
    if (Number.isFinite(storedOffset) && storedOffset !== 0) {
      serverTimeOffsetMs = storedOffset;
    }
  }
}

function updateBuildingCountdowns() {
  if (window.perfMon?.enabled) window.perfMon.mark('updateBuildingCountdowns');
  // If the offline bonuses modal is open, do not auto-collect; let that flow handle it
  const offlineModal = document.getElementById('offline-bonuses-modal');
  if (offlineModal && !offlineModal.classList.contains('hidden')) {
    if (window.perfMon?.enabled) window.perfMon.measure('updateBuildingCountdowns', 5);
    return;
  }
  const nodes = document.querySelectorAll('.building-next-bonus');
  if (!nodes.length) {
    if (window.perfMon?.enabled) window.perfMon.measure('updateBuildingCountdowns', 5);
    return;
  }

  // Use current time with server offset, fallback to local time if offset failed
  const now = Date.now() + serverTimeOffsetMs;
  let needsCollect = false;

  nodes.forEach((el) => {
    const id = el.dataset.buildingId;
    const b = buildings?.buildings?.[id];

    // Use helper function for validation
    if (!isBuildingReadyForTimer(b)) {
      el.textContent = tp('buildings.nextBonus', { time: '—' });
      return;
    }

    const intervalMs = intervalToMs(b.effect.interval);

    // Ensure lastBonusTime is valid, use current time as fallback
    const lastBonusTime = typeof b.lastBonusTime === 'number' && b.lastBonusTime > 0 ? b.lastBonusTime : now;

    const nextAt = lastBonusTime + intervalMs;
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
      .catch((error) => {
        console.warn('Failed to collect building bonuses:', error);
      });
  }
  if (window.perfMon?.enabled) window.perfMon.measure('updateBuildingCountdowns', 5);
}

function startBuildingCountdowns() {
  if (buildingCountdownInterval != null) return;

  // Initialize server time offset with retry logic
  const initializeWithRetry = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      await ensureTimeOffsetInitialized();
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(`Time initialization failed, retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => initializeWithRetry(retryCount + 1), retryDelay);
        return;
      } else {
        console.warn('Failed to initialize server time after retries, using local time');
        serverTimeOffsetMs = 0;
      }
    }

    // Start the countdown timer after successful initialization (or final fallback)
    // Small delay to avoid racing the initial offline collection flow in main.js
    setTimeout(() => {
      // Validate that buildings are available before starting
      if (buildings?.buildings && Object.keys(buildings.buildings).length > 0) {
        updateBuildingCountdowns();
        buildingCountdownInterval = setInterval(updateBuildingCountdowns, 1000);
      } else {
        // If no buildings yet, retry after a short delay
        setTimeout(() => {
          if (buildings?.buildings && Object.keys(buildings.buildings).length > 0) {
            updateBuildingCountdowns();
            buildingCountdownInterval = setInterval(updateBuildingCountdowns, 1000);
          }
        }, 2000);
      }
    }, 1200);
  };

  initializeWithRetry();
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
      <div class="building-earned">
        ${tp('buildings.totalEarned', {
    amount: formatNumber(building.totalEarned),
    type: t(building.effect.displayName || building.effect.type),
  })}
      </div>
      <div class="building-next-bonus" data-building-id="${building.id}">
        ${tp('buildings.nextBonus', { time: '—' })}
      </div>
      <div class="building-upgrade-cost" data-building-id="${building.id}"></div>
    </div>
  `;
  return el;
}

export function updateBuildingAffordability() {
  const nodes = document.querySelectorAll('.building-upgrade-cost');
  if (!nodes.length) return;

  nodes.forEach((el) => {
    const id = el.dataset.buildingId;
    const building = buildings?.buildings?.[id];
    if (!building) return;

    let amt = 1;
    if (options?.quickBuy) {
      const rawQty = options.buildingQty || 1;
      const maxLevelGain = Math.max(building.maxLevel - building.level, 0);
      const maxAffordable = building.getMaxUpgradeAmount(hero);
      const qty = rawQty === 'max' ? Math.min(maxLevelGain, maxAffordable) : parseInt(rawQty, 10) || 1;
      amt = Math.min(qty, maxLevelGain);
      if (amt <= 0 && building.level < building.maxLevel) amt = 1; // Show cost for 1 if can't afford desired
    } else {
      // Default to 1 if quickBuy is off
      amt = 1;
    }

    if (amt > 0 && building.level < building.maxLevel) {
      const totalCost = building.getUpgradeCost(amt);
      const costStr = Building.formatCost(totalCost);
      el.innerHTML = `${t('ascension.upgrade.cost') || 'Cost'}: <b>${costStr}</b>${options?.quickBuy ? ` (${formatNumber(amt)})` : ''}`;

      // Check affordability
      let canAfford = true;
      for (const [type, value] of Object.entries(totalCost)) {
        const playerRes = hero[type + 's'] !== undefined ? hero[type + 's'] : hero[type];
        if (playerRes < value) {
          canAfford = false;
          break;
        }
      }
      el.classList.toggle('unaffordable', !canAfford);
      el.style.display = '';
    } else if (building.level >= building.maxLevel) {
      el.textContent = t('common.max');
      el.classList.remove('unaffordable');
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  updateBuildingBulkCost();
}

export function updateBuildingBulkCost() {
  const bulkBtn = document.querySelector('.building-bulk-buy-btn');
  const bulkCostEl = document.querySelector('.building-bulk-cost');
  if (!bulkBtn || !bulkCostEl) return;

  const {
    totalCosts, upgrades, affordable,
  } = buildings.calculateBulkCostAndUpgrades(options.buildingQty);
  const costStr = Building.formatCost(totalCosts);

  bulkCostEl.textContent = costStr ? `${t('ascension.upgrade.totalCost') || 'Total Cost'}: ${costStr}` : '';
  bulkCostEl.classList.toggle('unaffordable', !affordable);
  bulkBtn.disabled = upgrades.length === 0 || !affordable;
}

function showBuildingInfoModal(building, onUpgrade) {
  const canUpgrade = building.level < building.maxLevel;

  let selectedAmount = options.useNumericInputs ? Math.min(Math.max(options.buildingQty || 1, 1), BUILDING_MAX_QTY) : 1;
  let modal;

  function getMaxUpgradeAmount() {
    return Math.min(building.getMaxUpgradeAmount(hero), BUILDING_MAX_QTY);
  }

  function getSelectedAmount() {
    return Math.max(1, Math.min(selectedAmount, BUILDING_MAX_QTY));
  }

  function getMaxInteractionAmount() {
    return Math.min(BUILDING_MAX_QTY, Math.max(getMaxUpgradeAmount(), building.level));
  }

  function getUpgradeAmount() {
    const raw = getSelectedAmount();
    const maxLevelGain = Math.min(Math.max(building.maxLevel - building.level, 0), BUILDING_MAX_QTY);
    if (maxLevelGain <= 0) return 0;
    const maxAffordable = Math.min(getMaxUpgradeAmount(), maxLevelGain);
    if (maxAffordable <= 0) return 0;
    return Math.min(raw, maxAffordable);
  }

  function getSellAmount() {
    const raw = getSelectedAmount();
    return Math.min(raw, building.level);
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
    const rawAmount = getSelectedAmount();
    const upgradeAmount = getUpgradeAmount();
    const sellAmount = getSellAmount();
    const maxInteractionAmount = Math.max(1, getMaxInteractionAmount());
    const maxLevelGain = Math.min(Math.max(building.maxLevel - building.level, 0), BUILDING_MAX_QTY);
    const requestedAmount = Math.min(rawAmount, maxLevelGain);
    const previewAmount = upgradeAmount > 0 ? upgradeAmount : requestedAmount;
    const totalCost = building.getUpgradeCost(previewAmount);
    const totalBonus = getTotalBonus(previewAmount);
    const refundAmount = building.getRefundForAmount(sellAmount);
    const upgradeControls = options.useNumericInputs
      ? `<input type="number" class="upgrade-amt-input input-number" min="1" max="${BUILDING_MAX_QTY}" value="${rawAmount}" />
          <button data-amt="max" class="upgrade-amt-btn${rawAmount === maxInteractionAmount ? ' selected-upgrade-amt' : ''}">${t('options.max')}</button>`
      : `<button data-amt="1" class="upgrade-amt-btn${rawAmount === 1 ? ' selected-upgrade-amt' : ''}">+1</button>
          <button data-amt="10" class="upgrade-amt-btn${rawAmount === 10 ? ' selected-upgrade-amt' : ''}" ${maxInteractionAmount < 10 ? 'disabled' : ''}>+10</button>
          <button data-amt="50" class="upgrade-amt-btn${rawAmount === 50 ? ' selected-upgrade-amt' : ''}" ${maxInteractionAmount < 50 ? 'disabled' : ''}>+50</button>
          <button data-amt="max" class="upgrade-amt-btn${rawAmount === maxInteractionAmount ? ' selected-upgrade-amt' : ''}">${t('options.max')}</button>`;
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
          <div>
            ${tp('buildings.levelInfo', { level: formatNumber(building.level), max: formatNumber(building.maxLevel) })}
          </div>
          <div>${tp('buildings.currentBonus', { bonus: building.formatEffect() })}</div>
          <div>${tp('buildings.upgradeAmountLine', { amount: formatNumber(previewAmount) })}</div>
          <div>${tp('buildings.totalUpgradeCost', { cost: Building.formatCost(totalCost) })}</div>
          <div>
            ${tp('buildings.bonusAfterUpgrade', {
    bonus: building.formatEffect(building.level + previewAmount),
    extra: formatNumber(totalBonus),
    type: t(building.effect.displayName || building.effect.type),
  })}
          </div>
        </div>
        <div class="building-info-modal-upgrade">
          <div style="margin: 10px 0 6px 0;" data-i18n="buildings.upgradeAmountLabel">
            ${t('buildings.upgradeAmountLabel')}
          </div>
          <div class="building-upgrade-amounts">${upgradeControls}</div>
          <button
            class="building-upgrade-btn"
            ${canUpgrade && upgradeAmount > 0 && canAffordUpgrade(upgradeAmount) ? '' : 'disabled'}
          >
            ${t('buildings.upgrade')}
          </button>
          <button class="building-sell-btn" ${sellAmount > 0 ? '' : 'disabled'}>${tp('buildings.sellRefund', { refund: Building.formatCost(refundAmount) })}</button>
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
        if (amt > BUILDING_MAX_QTY) amt = BUILDING_MAX_QTY;
        selectedAmount = Math.max(1, Math.min(amt, BUILDING_MAX_QTY));
        options.buildingQty = selectedAmount;
        dataManager.saveGame();
        rerenderModal();
        const newInput = modal.querySelector('.upgrade-amt-input');
        newInput.focus();
        try {
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        } catch {
          // setSelectionRange isn't supported on number inputs in some browsers
          const val = newInput.value;
          newInput.value = '';
          newInput.value = val;
        }
      });
    } else {
      modal.querySelectorAll('.upgrade-amt-btn').forEach((btn) => {
        btn.onclick = () => {
          let amt;
          if (btn.dataset.amt === 'max') {
            amt = Math.max(1, getMaxInteractionAmount());
          } else {
            amt = parseInt(btn.dataset.amt, 10);
          }
          if (isNaN(amt) || amt < 1) amt = 1;
          selectedAmount = Math.min(amt, BUILDING_MAX_QTY);
          rerenderModal();
        };
      });
    }
    if (maxBtn && input) {
      maxBtn.onclick = () => {
        selectedAmount = Math.max(1, getMaxInteractionAmount());
        options.buildingQty = selectedAmount;
        dataManager.saveGame();
        rerenderModal();
      };
    }
    modal.querySelector('.building-upgrade-btn').onclick = () => {
      let amt = Math.min(getUpgradeAmount(), getMaxUpgradeAmount());
      if (amt <= 0) return;
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
      if (upgraded) renderPurchasedBuildings();
      if (upgraded && typeof onUpgrade === 'function') onUpgrade();
      if (dataManager) dataManager.saveGame();
      rerenderModal();
    };
    modal.querySelector('.building-sell-btn').onclick = () => {
      const sellAmount = getSellAmount();
      if (sellAmount <= 0) return;
      showConfirmDialog(tp('buildings.removeConfirm', { name: building.name })).then((confirmed) => {
        if (confirmed) {
          building.refundToHero(sellAmount);
          if (building.level <= 0) {
            // buildings.unplaceBuilding(building.id); // No longer needed as we don't use placement
            closeModal('building-info-modal');
          } else {
            selectedAmount = Math.max(1, Math.min(selectedAmount, building.level));
            if (options.useNumericInputs) {
              options.buildingQty = selectedAmount;
            }
            rerenderModal();
          }
          if (typeof onUpgrade === 'function') onUpgrade();
          if (dataManager) dataManager.saveGame();
          renderPurchasedBuildings();
        }
      });
    };
    modal.querySelector('.modal-close').onclick = () => {
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

export function renderPurchasedBuildings() {
  if (window.perfMon?.enabled) window.perfMon.mark('renderPurchasedBuildings');
  const purchased = document.getElementById('purchased-buildings');
  if (!purchased) {
    if (window.perfMon?.enabled) window.perfMon.measure('renderPurchasedBuildings', 10);
    return;
  }
  purchased.innerHTML = '';
  Object.values(buildings.buildings)
    .forEach((building) => {
      const card = createBuildingCard(building);
      card.style.cursor = 'pointer';
      card.onclick = () => {
        if (options?.quickBuy) {
          const rawQty = options.buildingQty || 1;
          const maxLevelGain = Math.min(Math.max(building.maxLevel - building.level, 0), BUILDING_MAX_QTY);
          const maxAffordable = building.getMaxUpgradeAmount(hero);
          const qty = rawQty === 'max' ? Math.min(maxLevelGain, maxAffordable) : parseInt(rawQty, 10) || 1;
          const amt = Math.min(qty, maxLevelGain, maxAffordable);

          if (amt > 0) {
            const totalCost = building.getUpgradeCost(amt);
            // Deduct resources
            for (const [type, value] of Object.entries(totalCost)) {
              if (hero[type + 's'] !== undefined) hero[type + 's'] -= value;
              else if (hero[type] !== undefined) hero[type] -= value;
            }
            for (let i = 0; i < amt; ++i) {
              if (building.level < building.maxLevel) {
                if (buildings.upgradeBuilding) buildings.upgradeBuilding(building.id);
              }
            }
            updateResources();
            renderPurchasedBuildings();
            if (dataManager) dataManager.saveGame();
            showToast(tp('buildings.upgraded', { name: building.name, count: formatNumber(amt) }));
          } else if (building.level >= building.maxLevel) {
            showToast(t('buildings.maxLevelReached'), 'info');
          } else {
            showToast(t('buildings.notEnoughResources'), 'error');
          }
        } else {
          showBuildingInfoModal(building, renderPurchasedBuildings);
        }
      };
      purchased.appendChild(card);
    });
  // Update countdowns after (re)render
  updateBuildingCountdowns();
  updateBuildingAffordability();
  if (window.perfMon?.enabled) window.perfMon.measure('renderPurchasedBuildings', 10);
}

export function initializeBuildingsUI() {
  const tab = document.getElementById('buildings');
  if (!tab) return;
  tab.innerHTML = html`
    <div class="buildings-header">
      <div class="building-controls-wrapper"></div>
    </div>
    <div id="purchased-buildings"></div>
  `;

  const controlsWrapper = tab.querySelector('.building-controls-wrapper');
  if (options?.quickBuy || options?.bulkBuy) {
    const qtyControls = document.createElement('div');
    qtyControls.className = 'building-qty-controls';
    const currentQty = options.buildingQty || 1;
    if (options.useNumericInputs) {
      qtyControls.innerHTML = html`
        <input type="number" class="building-qty-input input-number" min="1" max="${BUILDING_MAX_QTY}" value="${currentQty}" />
        <button data-qty="max" class="${currentQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
      `;
      controlsWrapper.appendChild(qtyControls);
      const input = qtyControls.querySelector('.building-qty-input');
      const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
      input.oninput = () => {
        let val = parseInt(input.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > BUILDING_MAX_QTY) val = BUILDING_MAX_QTY;
        options.buildingQty = val;
        maxBtn.classList.remove('active');
        dataManager.saveGame();
        updateBuildingAffordability();
      };
      maxBtn.onclick = () => {
        options.buildingQty = 'max';
        maxBtn.classList.add('active');
        if (input) input.value = BUILDING_MAX_QTY;
        dataManager.saveGame();
        updateBuildingAffordability();
      };
    } else {
      qtyControls.innerHTML = html`
        <button data-qty="1" class="${currentQty === 1 ? 'active' : ''}">1</button>
        <button data-qty="10" class="${currentQty === 10 ? 'active' : ''}">10</button>
        <button data-qty="50" class="${currentQty === 50 ? 'active' : ''}">50</button>
        <button data-qty="max" class="${currentQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
      `;
      controlsWrapper.appendChild(qtyControls);
      qtyControls.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          const qty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          options.buildingQty = qty;
          qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          dataManager.saveGame();
          updateBuildingAffordability();
        };
      });
    }
  }

  if (options?.bulkBuy) {
    const bulkControls = document.createElement('div');
    bulkControls.className = 'building-bulk-controls';
    bulkControls.innerHTML = html`
      <button class="building-bulk-buy-btn">${t('common.bulkBuy') || 'Bulk Buy'}</button>
      <span class="building-bulk-cost"></span>
    `;
    controlsWrapper.appendChild(bulkControls);
    const bulkBtn = bulkControls.querySelector('.building-bulk-buy-btn');
    bulkBtn.onclick = () => {
      if (buildings.bulkUpgradeAll(options.buildingQty)) {
        updateResources();
        renderPurchasedBuildings();
        if (dataManager) dataManager.saveGame();
        showToast(t('buildings.bulkUpgradeSuccess') || 'All buildings upgraded!', 'success');
      }
    };
  }

  renderPurchasedBuildings();
  // Start live countdowns
  startBuildingCountdowns();
}

export function showOfflineBonusesModal(bonuses, onCollect, options = {}) {
  let collected = false;
  function doCollect() {
    if (!collected) {
      collected = true;
      if (typeof onCollect === 'function') onCollect();
    }
  }

  const { offlineDurationMs, xpLevelsGained } = options;
  let durationStr = '';
  if (offlineDurationMs && offlineDurationMs > 0) {
    const totalSec = Math.floor(offlineDurationMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    durationStr = parts.join(' ');
  }

  let htmlContent = html` <div class="offline-bonuses-modal-content">
    <button class="modal-close">×</button>
    <h2 data-i18n="buildings.offlineRewardsTitle">${t('buildings.offlineRewardsTitle')}</h2>
    ${
  durationStr
    ? `<div style="margin-bottom:15px; font-size:1.1em; color:#ccc;">
          ${t('buildings.offlineTime') || 'Offline Time'}: <span style="color:#fff; font-weight:bold;">${durationStr}</span>
       </div>`
    : ''
}
    <div style="margin:12px 0 0 0;">
      <ul style="list-style:none;padding:0; max-height: 40vh; overflow-y: auto;">
        ${bonuses
    .map((b) => {
      let extraInfo = '';
      if (b.type === 'XP' && xpLevelsGained > 0) {
        extraInfo = ` <span style="color:#ffd700; font-weight:bold;">(+${xpLevelsGained} ${t('skillTree.level') || 'Levels'})</span>`;
      } else if (b.levelsGained > 0) {
        // Fallback if levelsGained is attached to the bonus object itself
        extraInfo = ` <span style="color:#ffd700; font-weight:bold;">(+${b.levelsGained} ${t('skillTree.level') || 'Levels'})</span>`;
      }

      // Use icon if available, otherwise no icon
      const iconHtml = b.icon
        ? `<img src="${import.meta.env.VITE_BASE_PATH + b.icon}" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;" />`
        : '';

      return `<li class="offline-bonus-line" style="
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        margin-bottom: 6px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      ">
        ${iconHtml}
        <div style="flex: 1;">
          <span style="font-weight:bold; color:#fff;">${b.name}</span>:
          <span style="color:#eee; margin-left:4px;">+${formatNumber(b.amount)} ${b.type}</span>
          ${extraInfo}
        </div>
      </li>`;
    })
    .join('')}
      </ul>
    </div>
    <div style="margin-top:18px;color:#aaa;font-size:0.9em;" data-i18n="buildings.offlineRewardsInfo">
      ${t('buildings.offlineRewardsInfo')}
    </div>
    <button
      class="offline-bonuses-collect-btn"
      style="margin-top:24px;font-size:1.1em;padding:10px 32px;border-radius:8px;background:linear-gradient(90deg,#4e54c8,#8f94fb);color:#fff;font-weight:bold;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(78,84,200,0.15); transition: transform 0.1s;"
      onmouseover="this.style.transform='scale(1.05)'"
      onmouseout="this.style.transform='scale(1)'"
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
