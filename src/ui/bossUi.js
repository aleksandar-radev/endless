import Boss from '../boss.js';
import { game, hero } from '../globals.js';
import { updateEnemyStats, updateStageUI } from './ui.js';
import { t } from '../i18n.js';

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 */
export function selectBoss() {
  game.currentEnemy = new Boss();
  updateBossUI();
  // Ensure the stage display uses consistent formatting
  updateStageUI();
}

/**
 * Refresh boss stats in the Arena panel.
 * @param {Boss} boss Current boss instance.
 */
export function updateBossUI() {
  updateEnemyStats();
}
