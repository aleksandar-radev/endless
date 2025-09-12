// Region system for the game
// Handles region data, selection, unlocking, and UI

import { dataManager, game, hero } from './globals.js';
import { showConfirmDialog, toggleGame, updateStageUI } from './ui/ui.js';
import { t } from './i18n.js';
import Enemy from './enemy.js';
// Tooltip imports
import { showTooltip, positionTooltip, hideTooltip } from './ui/ui.js';
import { REGIONS } from './constants/regions.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { ENEMY_LIST } from './constants/enemies.js';

export async function setCurrentRegion(regionId) {
  if (regionId === game.currentRegionId) return;
  // Show confirm dialog before changing region
  const confirmed = await showConfirmDialog(
    'Are you sure you want to change region? That will reset your stage progress and will find you a new enemy',
  );
  if (!confirmed) return;
  game.currentRegionId = regionId;
  // Reset stage progress and enemy as if the hero died

  game.stage = game.getStartingStage();
  game.currentEnemy = new Enemy(game.stage);
  game.resetAllLife();
  hero.queueRecalculateFromAttributes(); // in order to apply region changes to hero stats (elemental resistances)
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
  return html`
    <div class="tooltip-header">${t(region.name)}</div>
    <div class="tooltip-content">${t(region.description)}</div>
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

export function updateRegionUI() {
  const container = document.getElementById('region-selector');
  if (!container) return;
  if (!game.currentRegionId) {
    game.currentRegionId = REGIONS[0].id; // Default to first region if none set
  }
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
