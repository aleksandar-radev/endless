import Boss from '../boss.js';
import { hero } from '../globals.js';
import { updateEnemyStats } from './ui.js';

/**
 * Handle boss instantiation and display.
 * @param {Object} game Global game instance.
 */
export function selectBoss(game) {
  game.currentEnemy = new Boss();
  updateBossUI(game.currentEnemy);
  const display = document.getElementById('stage-display');
  if (display) display.textContent = `Boss Level: ${hero.bossLevel}`;
}

/**
 * Refresh boss stats in the Arena panel.
 * @param {Boss} boss Current boss instance.
 */
export function updateBossUI(boss) {
  updateEnemyStats();
}
