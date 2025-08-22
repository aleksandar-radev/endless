import { dataManager } from './globals.js';
import { fetchLeaderboardData, renderLeaderboardTable } from './ui/leaderboardUi.js';
import { t } from './i18n.js';

export class Leaderboard {
  constructor(container) {
    this.container = container;
    this.data = [];
  }

  async show() {
    this.container.innerHTML = `<div id="leaderboard-list">${t('leaderboard.loading')}</div>`;
    try {
      this.data = await fetchLeaderboardData();
      this.render();
    } catch (e) {
      this.container.querySelector('#leaderboard-list').textContent = t('leaderboard.error');
    }
  }

  render() {
    const list = this.container.querySelector('#leaderboard-list');
    list.innerHTML = renderLeaderboardTable(this.data, dataManager.session?.username || null);
  }
}