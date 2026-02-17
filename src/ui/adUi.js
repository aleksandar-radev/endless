import { AD_BONUSES, AD_BONUS_DURATION } from '../constants/ads.js';
import { createModal, closeModal } from './modal.js';

import { hero, game } from '../globals.js';
import { showToast } from './ui.js';
import { t, tp } from '../i18n.js';

const BASE_PATH = import.meta.env.VITE_BASE_PATH || '';

function formatTime(seconds) {
  if (seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

let updateInterval;
let adBlockDetected = false;

// Robust AdBlock detection: try to fetch known ad-serving domains
async function checkAdBlocker() {
  if (['local'].includes(import.meta.env.VITE_ENV)) {
    adBlockDetected = false;
    return;
  }

  // If we are on localhost, we might still want to check, OR we can default to false.
  // The user requested that we detect if blocked.
  // A common ad blocker test URL:
  const adTestUrl = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(adTestUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    // If we get here, it wasn't blocked by the network layer (or at least DNS/TCP succeeded enough)
    // Note: 'no-cors' opaque response doesn't give status, but if blocked by extension, it usually throws.
    adBlockDetected = false;
  } catch (e) {
    console.warn('AdBlock check failed:', e);
    adBlockDetected = true;
  }
}

export function initializeAdUI() {
  const adsTab = document.getElementById('ads');
  if (!adsTab) return;

  checkAdBlocker().then(() => {
    renderAdsTab();
  });

  // Start timer loop
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateAdTimers, 1000); // 1s update for timers

  document.addEventListener('adBonusesUpdated', renderAdsTab);
}

function renderAdsTab() {
  const adsTab = document.getElementById('ads');
  if (!adsTab) return;

  // If ad blocked, show warning
  if (adBlockDetected) {
    adsTab.innerHTML = `
        <div class="ads-container">
            <div class="ad-blocker-warning">
                <h2>${t('ads.blocker.title')}</h2>
                <div class="warning-icon">
                    <img src="${BASE_PATH}/icons/disabled.png" alt="Ad Blocker Detected">
                </div>
                <p>${t('ads.blocker.message')}</p>
            </div>
            
             <div class="active-bonuses-section" style="opacity: 0.5; pointer-events: none;">
                <h3>${t('ads.activeBonuses.title')}</h3>
                <div class="active-list" id="active-ad-bonuses-list">
                    <div class="no-active">${t('ads.activeBonuses.none')}</div>
                </div>
            </div>
        </div>
      `;
    return;
  }

  const activeBonuses = hero.adBonuses.active || [];

  adsTab.innerHTML = `
    <div class="ads-container">
        <div class="active-bonuses-section">
            <h3>${t('ads.activeBonuses.title')}</h3>
            <div class="active-list" id="active-ad-bonuses-list">
                ${activeBonuses.length === 0 ? `<div class="no-active">${t('ads.activeBonuses.none')}</div>` : ''}
                ${activeBonuses.map((b) => renderActiveBonusItem(b)).join('')}
            </div>
        </div>
        
        <div class="available-ads-section">
            <h3>${t('ads.watch.title')}</h3>
            <div class="ads-grid">
                <!-- General Bonus Ad -->
                <div class="ad-offer-card" onclick="window.showAd('bonus')">
                    <div class="ad-offer-icon">
                        <img src="${BASE_PATH}/icons/bonus.png" alt="Bonus">
                    </div>
                    <div class="ad-offer-title">${t('ads.offer.bonus.title')}</div>
                    <div class="ad-offer-desc">${tp('ads.offer.bonus.desc', { minutes: Math.floor(AD_BONUS_DURATION / 60000) })}</div>
                    <button class="ad-offer-btn">${t('ads.offer.bonus.btn')}</button>
                    <div class="ad-offer-sub">${t('ads.offer.bonus.sub')}</div>
                </div>
                
                <!-- Placeholder for future types -->
                <div class="ad-offer-card disabled">
                    <div class="ad-offer-icon">
                        <img src="${BASE_PATH}/icons/materials.png" alt="Materials">
                    </div>
                    <div class="ad-offer-title">${t('ads.offer.material.title')}</div>
                    <div class="ad-offer-desc">${t('ads.offer.material.desc')}</div>
                    <button class="ad-offer-btn" disabled>${t('ads.offer.comingSoon')}</button>
                </div>

                 <div class="ad-offer-card disabled">
                    <div class="ad-offer-icon">
                         <img src="${BASE_PATH}/icons/energy.png" alt="Energy">
                    </div>
                    <div class="ad-offer-title">${t('ads.offer.energy.title')}</div>
                    <div class="ad-offer-desc">${t('ads.offer.energy.desc')}</div>
                    <button class="ad-offer-btn" disabled>${t('ads.offer.comingSoon')}</button>
                </div>
            </div>
        </div>
    </div>
  `;
}

function renderActiveBonusItem(bonus) {
  const originalDef = AD_BONUSES.find((d) => d.type === bonus.type) || { icon: 'bonus.png' };
  const now = Date.now();
  const timeLeft = Math.max(0, bonus.expiry - now);

  const mult = 1 + (bonus.value / 100);
  const name = t('ads.bonus.' + bonus.type);
  const desc = `${mult}x ${name}`;

  return `
        <div class="active-bonus-item" data-type="${bonus.type}">
            <div class="active-bonus-icon">
                 <img src="${BASE_PATH}/icons/${originalDef.icon}" alt="" onerror="this.parentElement.innerHTML='✨'">
            </div>
            <div class="active-bonus-info">
                <div class="active-bonus-desc">${desc}</div>
                <div class="active-bonus-timer" data-expiry="${bonus.expiry}">${formatTime(timeLeft / 1000)}</div>
            </div>
        </div>
    `;
}

function updateAdTimers() {
  const list = document.getElementById('active-ad-bonuses-list');

  if (list) {
    const timers = list.querySelectorAll('.active-bonus-timer');
    timers.forEach((t) => {
      const expiry = parseInt(t.dataset.expiry);
      const now = Date.now();
      const left = Math.max(0, expiry - now);
      if (left <= 0) {
        t.textContent = 'Expired';
      } else {
        const totalSeconds = Math.floor(left / 1000);
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        t.textContent = `${m}:${s.toString().padStart(2, '0')}`;
      }
    });
  }
}

// Global scope attachment for the onclick in HTML string
window.showAd = showAd;

export function showAd(type = 'bonus') {
  // Local testing bypass
  if (
    ['local', 'development'].includes(import.meta.env.VITE_ENV)
  ) {
    console.log('Local/Dev environment detected: Simulating Ad View for testing.');
    if (type === 'bonus') showBonusSelectionModal();
    return;
  }

  if (adBlockDetected) {
    alert(t('ads.blocker.message'));
    return;
  }

  if (typeof window.sdk !== 'undefined' && typeof window.sdk.showBanner !== 'undefined') {
    // Hide resource bar
    const rateBar = document.querySelector('.rate-counters-bar');
    if (rateBar) rateBar.style.display = 'none';

    // Hook SDK_GAME_START to know when ad finished
    // We need to be careful not to override existing hook if any,
    // but typically we can wrap it.
    // However, window.SDK_OPTIONS.onEvent is defined in index.html.
    // We can't easily change it here without overwriting.
    // A better approach is to rely on index.html calling a global function or event.
    // BUT, for now, we will override it and call the original if present.

    // NOTE: SDK_OPTIONS is configuration. The SDK might have already consumed it on init.
    // GameMonetize SDK usually reads window.SDK_OPTIONS at startup. Changing it later might not work.
    // BUT the onEvent is a function reference, if the SDK calls window.SDK_OPTIONS.onEvent() directly, it might work.
    // If the SDK copied the options, then we are out of luck and need to modify index.html
    // or set a global flag that index.html checks.

    // Strategy: We set a global "pendingAdReward" flag.
    // index.html's onEvent(SDK_GAME_START) will check this flag.
    window.pendingAdType = type;

    window.sdk.showBanner();
  } else {
    // Fallback if SDK is undefined but adBlockDetected was false (maybe just not loaded yet?)
    console.warn('GameMonetize SDK not loaded.');
    // If we are sure it's not blocked, we might want to just show the reward?
    // Or show error. Let's assume error/block if not present here.
    alert('Ad SDK not ready. Please try again or check ad blocker.');
  }
}

// Function called by index.html when ad finishes (SDK_GAME_START)
window.handleAdFinished = function() {
  // Restore UI
  const rateBar = document.querySelector('.rate-counters-bar');
  if (rateBar) rateBar.style.display = '';

  if (window.pendingAdType) {
    if (window.pendingAdType === 'bonus') {
      showBonusSelectionModal();
    }
    window.pendingAdType = null;
  }
};

// Also handle if ad is skipped or fails? GameMonetize usually just resumes game.

function showBonusSelectionModal() {
  const options = [];
  const pool = [...AD_BONUSES];

  // Active bonuses map for quick lookup
  const activeMap = {};
  if (hero.adBonuses && hero.adBonuses.active) {
    hero.adBonuses.active.forEach((b) => {
      if (b.expiry > Date.now()) {
        activeMap[b.type] = b;
      }
    });
  }

  // Shuffle and pick 3, applying upgrades if active
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    // Clone to modify
    const original = pool[idx];
    const option = { ...original };

    if (activeMap[option.type]) {
      // Upgrade logic: Stack the bonus (e.g. 2x -> 3x)
      const currentVal = activeMap[option.type].value;
      option.value = currentVal + original.value;
      option.isUpgrade = true; // Mark as upgrade for UI
    }

    options.push(option);
    pool.splice(idx, 1);
  }

  // Create content with new structure
  // Need to generate descriptions here based on translations
  const renderOption = (opt, idx) => {
    const mult = 1 + (opt.value / 100);
    const name = t('ads.bonus.' + opt.type);
    let desc = `${mult}x ${name}`;
    if (opt.isUpgrade) desc += ` ${t('ads.bonus.upgrade')}`;

    return `
                <div class="bonus-card" data-idx="${idx}">
                    <div class="bonus-icon">
                        <img src="${BASE_PATH}/icons/${opt.icon}" alt="${desc}" onerror="this.parentElement.innerHTML='✨'">
                    </div>
                    <div class="bonus-desc">${desc}</div>
                    <div class="bonus-duration">${tp('ads.bonus.duration', { minutes: Math.floor(AD_BONUS_DURATION / 60000) })}</div>
                </div>
            `;
  };

  const content = `
      <div id="ad-bonus-modal">
        <div class="ad-modal-close">×</div>
        <h2>${t('ads.modal.title')}</h2>
        <div class="bonus-cards">
            ${options.map((opt, idx) => renderOption(opt, idx)).join('')}
        </div>
      </div>
    `;

  let bonusSelected = false;

  const modal = createModal({
    id: 'ad-bonus-container', // Wrapper ID
    className: 'ad-bonus-wrapper', // Wrapper class for centering if needed
    content: content,
    closeOnOutsideClick: false, // Prevent closing by clicking background
    onClose: () => {
      if (!bonusSelected) {
        // Randomly pick one if closed without selection
        const random = options[Math.floor(Math.random() * options.length)];
        applyBonus(random);
      }
    },
  });

  // Handle Close Button manually
  const closeBtn = modal.querySelector('.ad-modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      closeModal(modal);
    };
  }

  // Bind card clicks
  const cards = modal.querySelectorAll('.bonus-card');
  cards.forEach((card, index) => {
    card.onclick = () => {
      bonusSelected = true;
      const selected = options[index];
      applyBonus(selected);
      closeModal(modal);
    };
  });
}

function applyBonus(bonusEntry) {
  hero.activateAdBonus(bonusEntry.type, bonusEntry.value);

  const mult = 1 + (bonusEntry.value / 100);
  const name = t('ads.bonus.' + bonusEntry.type);
  let desc = `${mult}x ${name}`;

  showToast(tp('ads.toast.activated', { desc: desc }));
}
