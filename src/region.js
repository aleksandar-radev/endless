// Region system for the game
// Handles region data, selection, unlocking, and UI

import { dataManager, game, hero } from './globals.js';
import { toggleGame, updateStageUI } from './ui/ui.js';
import { t } from './i18n.js';
import Enemy from './enemy.js';
// Tooltip imports
import { showTooltip, positionTooltip, hideTooltip } from './ui/ui.js';
import { REGIONS } from './constants/regions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_LIST } from './constants/enemies.js';
import { formatNamedType } from './format.js';
import { createModal, closeModal } from './ui/modal.js';

/**
 * Shared utility to update the region selector button
 * @param {string} fightMode - The current fight mode to check against
 * @param {string} regionName - The region name to display
 * @param {Function} clickHandler - The function to call when clicked
 */
export function updateRegionSelectorButton(fightMode, regionName, clickHandler) {
  const regionSelectorDiv = document.getElementById('combat-region-selector');
  const button = document.getElementById('combat-region-select-btn');

  // Only update if we're in the correct mode
  if (game.fightMode !== fightMode) {
    return;
  }

  // Show region selector
  if (regionSelectorDiv) {
    regionSelectorDiv.style.display = 'flex';
  }

  // Update button text and click handler
  if (button) {
    button.textContent = regionName;

    // Remove all existing listeners and add new one
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener('click', clickHandler);
  }
}

export function setCurrentRegion(regionId) {
  if (regionId === game.currentRegionId) return;
  game.currentRegionId = regionId;

  game.stage = game.getStartingStage();
  game.currentEnemy = new Enemy(game.stage);
  game.resetAllLife();
  hero.queueRecalculateFromAttributes();
  updateStatsAndAttributesUI();
  updateStageUI();
  updateRegionUI();

  if (game.gameStarted) {
    toggleGame();
    return;
  }

  dataManager.saveGame();
}

export function getCurrentRegion() {
  return REGIONS.find((r) => r.id === game.currentRegionId) || REGIONS[0];
}

export function getRegionEnemies(region) {
  const allowedTags = region.allowedTags;
  return ENEMY_LIST.filter((e) => e.tags && allowedTags.some((tag) => e.tags.includes(tag)) && e.tier === region.tier);
}

export function getUnlockedRegions(hero) {
  return REGIONS.filter((region) => hero.level >= region.unlockLevel);
}

function getRegionTooltip(region) {
  const html = String.raw;
  const displayName = formatNamedType(region.name, 'combatMode.subAreaType.region');
  return html`
    <div class="tooltip-header">${displayName}</div>
    <div class="tooltip-content">${region.description}</div>
    <div><strong>${t('region.unlockLevel')}:</strong> ${region.unlockLevel}</div>
    ${region.multiplier.xp != 1
    ? `<div><strong>${t('region.xpBonus')}:</strong> ${((region.multiplier.xp - 1) * 100).toFixed(0)}%</div>`
    : ''}
    ${region.multiplier.gold != 1
    ? `<div><strong>${t('region.goldBonus')}:</strong> ${((region.multiplier.gold - 1) * 100).toFixed(0)}%</div>`
    : ''}
    ${region.multiplier.itemDrop != 1
    ? `<div><strong>${t('region.itemDropBonus')}:</strong> ${((region.multiplier.itemDrop - 1) * 100).toFixed(0)}%</div>`
    : ''}
    ${region.multiplier.materialDrop && region.multiplier.materialDrop != 1
    ? `<div><strong>${t('region.materialDropBonus')}:</strong> ${((region.multiplier.materialDrop - 1) * 100).toFixed(0)}%</div>`
    : ''}
  `;
}

export function openRegionSelectionDialog() {
  const html = String.raw;
  const unlocked = getUnlockedRegions(hero);
  const currentRegion = getCurrentRegion();

  const regionItems = REGIONS.map((region) => {
    const isUnlocked = unlocked.includes(region);
    const isCurrent = region.id === currentRegion.id;
    const disabledClass = !isUnlocked ? 'disabled' : '';
    const selectedClass = isCurrent ? 'selected' : '';

    return html`
      <div class="region-dialog-item ${disabledClass} ${selectedClass}" data-region-id="${region.id}">
        <div class="region-dialog-item-header">
          <span class="region-dialog-item-name">${region.name}</span>
          <span class="region-dialog-item-unlock">${t('region.unlockLevel')}: ${region.unlockLevel}</span>
          ${isCurrent ? html`<span class="region-dialog-item-current">${t('region.current')}</span>` : ''}
          ${!isUnlocked ? html`<span class="region-dialog-item-locked">🔒</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const content = html`
    <div class="modal-content region-selection-modal">
      <button class="modal-close">×</button>
      <h2 class="modal-title">${t('region.selectRegion')}</h2>
      <div class="region-dialog-list">${regionItems}</div>
    </div>
  `;

  createModal({
    id: 'region-selection-dialog',
    className: 'region-selection-dialog',
    content,
    closeOnOutsideClick: true,
  });

  // Add click handlers and tooltips to region items
  document.querySelectorAll('.region-dialog-item').forEach((item) => {
    const regionId = item.dataset.regionId;
    const region = REGIONS.find((r) => r.id === regionId);

    if (region) {
      const tooltipContent = getRegionTooltip(region);
      item.classList.add('tooltip-target');
      item.addEventListener('mouseenter', (e) => showTooltip(tooltipContent, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);

      if (!item.classList.contains('disabled')) {
        item.addEventListener('click', () => {
          if (regionId !== currentRegion.id) {
            hideTooltip();
            setCurrentRegion(regionId);
            closeModal('region-selection-dialog');
          }
        });
      }
    }
  });
}

export function updateRegionUI() {
  const container = document.getElementById('region-selector');

  if (!game.currentRegionId) {
    game.currentRegionId = REGIONS[0].id; // Default to first region if none set
  }

  // Update the region selector button for explore mode
  const currentRegion = getCurrentRegion();
  updateRegionSelectorButton('explore', currentRegion.name, openRegionSelectionDialog);

  // Update the old button-based selector if it exists
  if (container) {
    container.innerHTML = '';
    const unlocked = getUnlockedRegions(hero);
    const nextLockedRegion = REGIONS.find((region) => !unlocked.includes(region) && hero.level < region.unlockLevel);
    const visibleRegions = [...unlocked];
    if (nextLockedRegion) visibleRegions.push(nextLockedRegion);

    visibleRegions.forEach((region) => {
      const btn = document.createElement('button');
      btn.className = 'region-btn' + (region.id === game.currentRegionId ? ' selected' : '');
      btn.textContent = region.name;
      btn.disabled = !unlocked.includes(region);
      btn.onclick = () => setCurrentRegion(region.id);
      // Tooltip events
      btn.addEventListener('mouseenter', (e) => showTooltip(getRegionTooltip(region), e));
      btn.addEventListener('mousemove', positionTooltip);
      btn.addEventListener('mouseleave', hideTooltip);
      container.appendChild(btn);
    });
  }
}
