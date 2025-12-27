import Boss from '../boss.js';
import { game } from '../globals.js';
import { hideTooltip, positionTooltip, showTooltip, updateEnemyStats, updateStageUI } from './ui.js';
import { tp } from '../i18n.js';
import { getBossRegions, getCurrentBossRegion, getUnlockedBossRegions, setCurrentBossRegion } from '../bossRegion.js';
import { createModal, closeModal } from './modal.js';
import { updateRegionSelectorButton } from '../region.js';

const html = String.raw;

let bossRegionsInitialized = false;

function buildUnlockNote(region) {
  const requirements = [];
  if (Number.isFinite(region?.unlockLevel) && region.unlockLevel > 1) {
    requirements.push(tp('bossRegion.unlockHint', { level: region.unlockLevel }));
  }
  if (Number.isFinite(region?.unlockBossLevel) && region.unlockBossLevel > 0) {
    requirements.push(tp('bossRegion.unlockBossHint', { level: region.unlockBossLevel }));
  }
  return requirements.join(' • ');
}

function buildBossRegionTooltip(region, isUnlocked) {
  const unlockNote = !isUnlocked ? buildUnlockNote(region) : '';

  return html`
    <div class="tooltip-header">${region.name}</div>
    ${region.description ? `<div class="tooltip-content">${region.description}</div>` : ''}
    ${unlockNote ? `<div class="tooltip-note">${unlockNote}</div>` : ''}
  `;
}

export function openBossRegionSelectionDialog() {
  const unlocked = getUnlockedBossRegions();
  const currentRegion = getCurrentBossRegion();
  const regions = getBossRegions();
  const visible = [...unlocked];
  const nextLocked = regions.find((region) => !unlocked.includes(region));
  if (nextLocked && !visible.includes(nextLocked)) {
    visible.push(nextLocked);
  }

  const regionItems = visible
    .map((region) => {
      const isUnlocked = unlocked.includes(region);
      const isCurrent = region.id === currentRegion.id;
      const disabledClass = !isUnlocked ? 'disabled' : '';
      const selectedClass = isCurrent ? 'selected' : '';

      const unlockHints = [];
      if (Number.isFinite(region?.unlockLevel) && region.unlockLevel > 1) {
        unlockHints.push(`Lv ${region.unlockLevel}`);
      }
      if (Number.isFinite(region?.unlockBossLevel) && region.unlockBossLevel > 0) {
        unlockHints.push(`Boss Lv ${region.unlockBossLevel}`);
      }
      const unlockText = unlockHints.join(' • ');

      return html`
        <div class="region-dialog-item ${disabledClass} ${selectedClass}" data-region-id="${region.id}">
          <div class="region-dialog-item-header">
            <span class="region-dialog-item-name">${region.name}</span>
            ${unlockText ? html`<span class="region-dialog-item-unlock">${unlockText}</span>` : ''}
            ${isCurrent ? html`<span class="region-dialog-item-current">${tp('region.current')}</span>` : ''}
            ${!isUnlocked ? html`<span class="region-dialog-item-locked">🔒</span>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  const content = html`
    <div class="modal-content region-selection-modal">
      <button class="modal-close">×</button>
      <h2 class="modal-title">${tp('region.selectRegion')}</h2>
      <div class="region-dialog-list">${regionItems}</div>
    </div>
  `;

  createModal({
    id: 'boss-region-selection-dialog',
    className: 'region-selection-dialog',
    content,
    closeOnOutsideClick: true,
  });

  // Add click handlers and tooltips to region items
  document.querySelectorAll('#boss-region-selection-dialog .region-dialog-item').forEach((item) => {
    const regionId = item.dataset.regionId;
    const region = regions.find((r) => r.id === regionId);

    if (region) {
      const isUnlocked = unlocked.includes(region);
      const tooltipContent = buildBossRegionTooltip(region, isUnlocked);
      item.classList.add('tooltip-target');
      item.addEventListener('mouseenter', (e) => showTooltip(tooltipContent, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);

      if (isUnlocked) {
        item.addEventListener('click', () => {
          if (regionId !== currentRegion.id) {
            hideTooltip();
            const changed = setCurrentBossRegion(regionId);
            if (!changed) return;
            selectBoss();
            updateBossRegionSelector();
            closeModal('boss-region-selection-dialog');
          }
        });
      }
    }
  });
}

function renderBossRegionButtons() {
  const container = document.getElementById('boss-region-selector');
  if (!container) return;

  const regions = getBossRegions();
  const unlocked = getUnlockedBossRegions();
  const current = getCurrentBossRegion();
  const visible = [...unlocked];
  const nextLocked = regions.find((region) => !unlocked.includes(region));
  if (nextLocked && !visible.includes(nextLocked)) {
    visible.push(nextLocked);
  }

  container.innerHTML = '';

  visible.forEach((region) => {
    const isUnlocked = unlocked.includes(region);
    const btn = document.createElement('button');
    btn.className = 'region-btn boss-region-btn';
    if (region.id === current.id) {
      btn.classList.add('selected');
    }
    btn.textContent = region.name;
    btn.disabled = !isUnlocked;
    btn.setAttribute('aria-disabled', String(!isUnlocked));

    const tooltipContent = buildBossRegionTooltip(region, isUnlocked);
    const accessibleDescriptionParts = [region.name];
    if (region.description) {
      accessibleDescriptionParts.push(region.description);
    }
    if (!isUnlocked) {
      const note = buildUnlockNote(region);
      if (note) {
        accessibleDescriptionParts.push(note);
      }
    }
    btn.setAttribute('aria-label', accessibleDescriptionParts.join('. '));
    btn.classList.add('tooltip-target');
    btn.addEventListener('mouseenter', (e) => showTooltip(tooltipContent, e));
    btn.addEventListener('mousemove', positionTooltip);
    btn.addEventListener('mouseleave', hideTooltip);

    btn.addEventListener('click', () => {
      if (!isUnlocked || region.id === current.id) return;
      const changed = setCurrentBossRegion(region.id);
      if (!changed) return;
      hideTooltip();
      selectBoss();
      updateBossRegionSelector();
    });
    container.appendChild(btn);
  });
}

export function updateBossRegionSelector() {
  // Update the region selector button for arena mode
  const currentRegion = getCurrentBossRegion();
  updateRegionSelectorButton('arena', currentRegion.name, openBossRegionSelectionDialog);

  renderBossRegionButtons();
}

export function initializeBossRegionUI() {
  if (!bossRegionsInitialized) {
    bossRegionsInitialized = true;
    document.addEventListener('heroLevelUp', () => {
      updateBossRegionSelector();
    });
    document.addEventListener('bossKilled', () => {
      updateBossRegionSelector();
    });
  }
  updateBossRegionSelector();
}

/**
 * Handle boss instantiation and display.
 */
export function selectBoss() {
  game.currentEnemy = new Boss();
  updateBossUI();
  // Ensure the stage display uses consistent formatting
  updateStageUI();
}

/**
 * Refresh boss stats in the Arena panel.
 */
export function updateBossUI() {
  updateEnemyStats();
}
