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
    hero.addAdBonus(b);
  });
  hero.recalculateFromAttributes();
  updateResources();
  showToast('Ad watched! Bonuses applied.', 'success');
}

export function showRewardAd() {
  const content = `
    <div class="modal-content ad-modal-content">
      <h2>Advertisement</h2>
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-0000000000000000"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
      <p>Ad playing... Please wait.</p>
    </div>
  `;
  const modal = createModal({
    id: 'ad-modal',
    className: 'ad-modal',
    content,
    closeOnOutsideClick: false,
  });
  // Render ad
  if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
    window.adsbygoogle.push({});
  }
  // Fallback timer if ad library doesn't fire events
  setTimeout(() => {
    closeModal('ad-modal');
    applyAdBonuses();
  }, 30000);
}
