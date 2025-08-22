// UI logic for buildings tab
// This file will handle rendering and updating the buildings tab UI.
const html = String.raw;

import { buildings, dataManager, hero } from '../globals.js';
import { Building } from '../building.js';
import { createModal, closeModal } from './modal.js';
import { showConfirmDialog, updateResources, formatNumber } from './ui.js';
import { getTimeNow } from '../common.js';

// Countdown timer state (single updater for all visible cards)
let buildingCountdownInterval = null;
let serverTimeOffsetMs = 0; // getTimeNow() - Date.now()


const placeholders = [
  { left: 342, top: 411 },
  { left: 514, top: 136 },
  { left: 709, top: 240 },
  { left: 700, top: 534 },
  { left: 420, top: 270 },
];

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
      el.textContent = 'Next bonus: —';
      return;
    }
    const intervalMs = intervalToMs(b.effect.interval);
    if (!intervalMs) {
      el.textContent = 'Next bonus: —';
      return;
    }
    const nextAt = (b.lastBonusTime || now) + intervalMs;
    const msLeft = nextAt - now;
    if (msLeft <= 0) {
      // Mark for collection; UI will refresh after collect
      needsCollect = true;
      el.textContent = 'Next bonus: 0:00';
    } else {
      el.textContent = `Next bonus: ${fmtDuration(msLeft)}`;
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
      <div class="building-earned">Total Earned: ${formatNumber(building.totalEarned)} ${building.effect?.type || ''}</div>
  <div class="building-next-bonus" data-building-id="${building.id}">Next bonus: —</div>
    </div>
  `;
  return el;
}

function showBuildingInfoModal(building, onUpgrade, placementOptions) {
  const canUpgrade = building.level < building.maxLevel;

  let upgradeAmount = 1;
  let modal;

  function getMaxUpgradeAmount() {
    return building.getMaxUpgradeAmount(hero);
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
    const totalCost = building.getUpgradeCost(upgradeAmount);
    const totalBonus = getTotalBonus(upgradeAmount);
    const refundAmount = building.getRefund();
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
          <div>Level: <b>${formatNumber(building.level)}</b> / ${formatNumber(building.maxLevel)}</div>
          <div>Current Bonus: <b>${building.formatEffect()}</b></div>
          <div>Upgrade Amount: <b>${formatNumber(upgradeAmount)}</b></div>
          <div>Total Upgrade Cost: <b>${Building.formatCost(totalCost)}</b></div>
          <div>
            Bonus After Upgrade:
            <b>${building.formatEffect(building.level + upgradeAmount)}</b>
            <span style="color:#aaa;font-size:0.95em;">(+${formatNumber(totalBonus)} ${building.effect?.type || ''})</span>
          </div>
        </div>
        <div class="building-info-modal-upgrade">
          <div style="margin: 10px 0 6px 0;">Upgrade Amount:</div>
          <div class="building-upgrade-amounts">
            <button data-amt="1" class="upgrade-amt-btn${upgradeAmount === 1 ? ' selected-upgrade-amt' : ''}">
              +1
            </button>
            <button
              data-amt="10"
              class="upgrade-amt-btn${upgradeAmount === 10 ? ' selected-upgrade-amt' : ''}"
              ${maxAffordableAmt < 10 ? 'disabled' : ''}
            >
              +10
            </button>
            <button
              data-amt="50"
              class="upgrade-amt-btn${upgradeAmount === 50 ? ' selected-upgrade-amt' : ''}"
              ${maxAffordableAmt < 50 ? 'disabled' : ''}
            >
              +50
            </button>
            <button
              data-amt="max"
              class="upgrade-amt-btn${upgradeAmount === maxAffordableAmt ? ' selected-upgrade-amt' : ''}"
            >
              Max
            </button>
          </div>
          <button class="building-upgrade-btn" ${canUpgrade && canAffordUpgrade(upgradeAmount) ? '' : 'disabled'}>
            Upgrade
          </button>
          ${!placementOptions
    ? `<button class="building-sell-btn">Sell / Refund (+${Building.formatCost(refundAmount)})</button>`
    : ''}
        </div>
      </div>
    `;
  }

  function rerenderModal() {
    modal.innerHTML = renderModalContent();
    // Re-attach event listeners
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
        alert('Not enough resources to upgrade!');
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
        showConfirmDialog(`Are you sure you want to remove <b>${building.name}</b> from the map?`).then((confirmed) => {
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

function showBuildingsMapModal() {
  const content = html`
    <div class="building-modal-content">
      <button class="modal-close">×</button>
      <div class="building-map-container">
        <img src="${import.meta.env.VITE_BASE_PATH}/buildings/building-map.jpg" class="building-map-img" draggable="false" />
        <div class="building-map-placeholders"></div>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'building-map-modal',
    className: 'building-modal building-map-modal',
    content,
    onClose: null,
    closeOnOutsideClick: false,
  });
  const mapContainer = modal.querySelector('.building-map-container');
  const mapImg = modal.querySelector('.building-map-img');
  const phContainer = modal.querySelector('.building-map-placeholders');
  // Wrap map image and placeholders in an inner container for scaling
  const mapInner = document.createElement('div');
  mapInner.className = 'building-map-inner';
  mapInner.style.position = 'relative';
  mapInner.style.width = mapImg.naturalWidth + 'px';
  mapInner.style.height = mapImg.naturalHeight + 'px';
  mapInner.appendChild(mapImg);
  mapInner.appendChild(phContainer);
  mapContainer.innerHTML = '';
  mapContainer.appendChild(mapInner);

  let isDragging = false,
    startX,
    startY;
  let mapScale = 1;
  const minScale = 1;
  const maxScale = 2.5;

  function clampScroll() {
    // Clamp scroll so you can't scroll past the map
    const scaledWidth = mapImg.naturalWidth * mapScale;
    const scaledHeight = mapImg.naturalHeight * mapScale;
    mapContainer.scrollLeft = Math.max(0, Math.min(mapContainer.scrollLeft, scaledWidth - mapContainer.clientWidth));
    mapContainer.scrollTop = Math.max(0, Math.min(mapContainer.scrollTop, scaledHeight - mapContainer.clientHeight));
  }

  mapContainer.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const scaleAmount = 0.1;
      let newScale = mapScale + (e.deltaY < 0 ? scaleAmount : -scaleAmount);
      newScale = Math.max(minScale, Math.min(maxScale, newScale));
      if (newScale === mapScale) return;
      // Zoom towards mouse position
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + mapContainer.scrollLeft;
      const mouseY = e.clientY - rect.top + mapContainer.scrollTop;
      const percentX = mouseX / (mapImg.naturalWidth * mapScale);
      const percentY = mouseY / (mapImg.naturalHeight * mapScale);
      mapScale = newScale;
      mapInner.style.transformOrigin = `${percentX * 100}% ${percentY * 100}%`;
      mapInner.style.transform = `scale(${mapScale})`;
      // Clamp scroll after zoom
      setTimeout(clampScroll, 0);
    },
    { passive: false },
  );
  mapContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - mapContainer.offsetLeft;
    startY = e.pageY - mapContainer.offsetTop;
    mapContainer.style.cursor = 'grabbing';
    // // Uncomment the following lines to log the click position on the map
    // const rect = mapImg.getBoundingClientRect();
    // const x = Math.round(e.clientX - rect.left);
    // const y = Math.round(e.clientY - rect.top);
    // console.log(`Map clicked at: { left: ${x}, top: ${y} }`);
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    mapContainer.scrollLeft -= e.movementX;
    mapContainer.scrollTop -= e.movementY;
    clampScroll();
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
    mapContainer.style.cursor = '';
  });
  function renderPlaceholders() {
    phContainer.innerHTML = '';
    const placed = buildings.getPlacedBuildings();
    placeholders.forEach((pos, idx) => {
      const ph = document.createElement('div');
      ph.className = 'building-map-placeholder';
      ph.style.left = pos.left + 'px';
      ph.style.top = pos.top + 'px';
      ph.title = placed[idx] ? placed[idx].name : `Place building #${idx + 1}`;
      ph.style.position = 'absolute';
      ph.style.pointerEvents = 'auto';
      if (placed[idx]) {
        ph.classList.add('building-map-has-building');
        const img = document.createElement('img');
        img.src = import.meta.env.VITE_BASE_PATH + placed[idx].image;
        img.alt = placed[idx].name;
        img.className = 'building-map-img building-map-img-inset building-map-img-large';
        img.style.cursor = 'pointer';
        img.style.pointerEvents = 'auto';
        ph.style.pointerEvents = 'auto';
        img.onclick = (e) => {
          e.stopPropagation();
          showBuildingInfoModal(placed[idx], renderPlaceholders);
        };
        ph.appendChild(img);
      } else {
        ph.addEventListener('click', (e) => {
          e.stopPropagation();
          showChooseBuildingModal(idx, renderPlaceholders);
        });
      }
      phContainer.appendChild(ph);
    });
  }
  mapImg.onload = () => {
    renderPlaceholders();
  };
  if (mapImg.complete) mapImg.onload();
}

function showChooseBuildingModal(placeholderIdx, onChoose) {
  const content = html`
    <div class="building-choose-modal-content">
      <button class="modal-close">×</button>
      <h3>Choose a building to place</h3>
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
  // Only show buildings that are not already placed
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
        <div class="building-image" >
          <img src="${import.meta.env.VITE_BASE_PATH + building.image}" alt="${building.name}" class="building-img" />
        </div>
        <div class="building-info">
          <div class="building-name">${building.name}</div>
          <div class="building-desc">${building.description}</div>
        </div>
      `;
      el.onclick = () => {
        closeModal('building-choose-modal');
        // Show upgrade modal in placement mode
        showBuildingInfoModal(building, onChoose, { placeholderIdx, onPlaced: onChoose });
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
    '<button id="open-buildings-map" class="building-open-map-btn">Open Buildings Map</button><div id="purchased-buildings"></div>';
  renderPurchasedBuildings();
  // Open map modal
  tab.querySelector('#open-buildings-map').onclick = showBuildingsMapModal;
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
    <h2>Offline Building Rewards</h2>
    <div style="margin:12px 0 0 0;">
      <ul style="list-style:none;padding:0;">
        ${bonuses
    .map(
      (b) =>
        `<li style='margin:10px 0;font-size:1.1em;'>${b.icon || ''} <b>${b.name}</b>: +${formatNumber(b.amount)} ${
          b.type
        } <span style='color:#aaa;font-size:0.95em;'>(for ${b.times} ${b.interval}${
          b.times > 1 ? 's' : ''
        })</span></li>`,
    )
    .join('')}
      </ul>
    </div>
    <div style="margin-top:18px;color:#aaa;font-size:0.98em;">Bonuses were earned while you were away!</div>
    <button
      class="offline-bonuses-collect-btn"
      style="margin-top:24px;font-size:1.1em;padding:10px 32px;border-radius:8px;background:linear-gradient(90deg,#4e54c8,#8f94fb);color:#fff;font-weight:bold;border:none;cursor:pointer;box-shadow:0 2px 8px rgba(78,84,200,0.15);"
    >
      Collect
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
