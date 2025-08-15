import Boss from '../boss.js';
import { game, hero } from '../globals.js';
import { updateEnemyStats } from './ui.js';
import { t } from '../i18n.js';

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 */
export function selectBoss() {
  game.currentEnemy = new Boss();
  updateBossUI();
  const display = document.getElementById('stage-display');
  const label = display?.querySelector('.stage-label');
  const value = display?.querySelector('.stage-value');
  if (label) label.textContent = t('combat.bossLevel');
  if (value) value.textContent = hero.bossLevel;
}

/**
 * Refresh boss stats in the Arena panel.
 * @param {Boss} boss Current boss instance.
 */
export function updateBossUI() {
  updateEnemyStats();
}
