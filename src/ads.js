import { createModal, closeModal } from './ui/modal.js';
import { hero } from './globals.js';
import { updateResources, showToast } from './ui/ui.js';
import { AD_BONUSES } from './constants/adBonuses.js';

export function initializeAds() {
  const btn = document.getElementById('watch-ad-btn');
  if (btn) {
    btn.addEventListener('click', showRewardAd);
  }
}

function applyAdBonuses() {
  AD_BONUSES.forEach((b) => {
    if (b.type === 'gold') hero.gainGold(b.amount);
    else if (b.type === 'crystals') hero.gainCrystals(b.amount);
    else if (b.type === 'souls') hero.gainSouls(b.amount);
  });
  updateResources();
  showToast('Ad watched! Bonuses applied.', 'success');
}

export function showRewardAd() {
  let remaining = 5;
  const content = `
    <div class="modal-content">
      <h2>Advertisement</h2>
      <p>Watching ad... <span id="ad-countdown">${remaining}</span></p>
    </div>
  `;
  const modal = createModal({
    id: 'ad-modal',
    className: 'ad-modal',
    content,
    closeOnOutsideClick: false,
  });
  const counter = modal.querySelector('#ad-countdown');
  const timer = setInterval(() => {
    remaining -= 1;
    if (counter) counter.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      closeModal('ad-modal');
      applyAdBonuses();
    }
  }, 1000);
}
