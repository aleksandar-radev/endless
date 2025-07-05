import { getLeaderboard } from '../api.js';
import { Leaderboard } from '../leaderboard.js';

const html = String.raw;

/**
 * Fetches leaderboard data and returns it.
 * @returns {Promise<Array>} Leaderboard data array
 */
export async function fetchLeaderboardData() {
  return await getLeaderboard();
}

/**
 * Renders the leaderboard HTML table as a string.
 * @param {Array} leaderboardData - Array of leaderboard entries
 * @param {string} [currentUsername] - The current user's username to highlight
 * @returns {string} HTML string for the leaderboard table
 */
export function renderLeaderboardTable(leaderboardData, currentUsername) {

  if (!leaderboardData || leaderboardData.length === 0) {
    return '<div>No leaderboard data available.</div>';
  }
  return html`
    <table>
      <thead>
        <tr><th>Rank</th><th>Username</th><th>Highest Level</th></tr>
      </thead>
      <tbody>
        ${leaderboardData.map((entry, i) => {
    const isCurrentUser = entry.user?.username === currentUsername;
    return `
            <tr${isCurrentUser ? ' class="highlight-user"' : ''}>
              <td>${i + 1}</td>
              <td>${entry.user?.username ?? 'Unknown'}</td>
              <td>${entry.highestLevel ?? 0}</td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;
}


export function initializeLeaderboardUI() {
  const leaderboardTab = document.getElementById('leaderboard');
  if (!leaderboardTab) return;
  const leaderboard = new Leaderboard(leaderboardTab);
  leaderboard.show();
}

export function setupLeaderboardTabLazyLoad() {
  const leaderboardTab = document.getElementById('leaderboard');
  let leaderboardInstance = null;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'leaderboard') {
        if (!leaderboardInstance) {
          leaderboardInstance = new Leaderboard(leaderboardTab);
        }
        leaderboardInstance.show();
      }
    });
  });
}