import { dataManager } from './globals.js';
import { fetchLeaderboardData, renderLeaderboardTable } from './ui/leaderboardUi.js';

export class Leaderboard {
  constructor(container) {
    this.container = container;
    this.data = [];
  }

  async show() {
    this.container.innerHTML = '<div id="leaderboard-list">Loading...</div>';
    try {
      this.data = await fetchLeaderboardData();
      this.render();
    } catch (e) {
      this.container.querySelector('#leaderboard-list').textContent = 'Failed to load leaderboard.';
    }
  }

  render() {
    const list = this.container.querySelector('#leaderboard-list');
    list.innerHTML = renderLeaderboardTable(this.data, dataManager.session?.username || null);
  }
}