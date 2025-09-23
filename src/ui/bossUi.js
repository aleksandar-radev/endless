import Boss from '../boss.js';
import { game } from '../globals.js';
import {
  hideTooltip,
  positionTooltip,
  showTooltip,
  updateEnemyStats,
  updateStageUI,
} from './ui.js';
import { tp } from '../i18n.js';
import {
  getBossRegions,
  getCurrentBossRegion,
  getUnlockedBossRegions,
  setCurrentBossRegion,
} from '../bossRegion.js';

const html = String.raw;

let bossRegionsInitialized = false;

function buildBossRegionTooltip(region, isUnlocked) {
  const unlockNote = !isUnlocked ? tp('bossRegion.unlockHint', { level: region.unlockLevel }) : '';

  return html`
    <div class="tooltip-header">${region.name}</div>
    ${region.description ? `<div class="tooltip-content">${region.description}</div>` : ''}
    ${unlockNote ? `<div class="tooltip-note">${unlockNote}</div>` : ''}
  `;
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
      accessibleDescriptionParts.push(tp('bossRegion.unlockHint', { level: region.unlockLevel }));
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
  renderBossRegionButtons();
}

export function initializeBossRegionUI() {
  if (!bossRegionsInitialized) {
    bossRegionsInitialized = true;
    document.addEventListener('heroLevelUp', () => {
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
