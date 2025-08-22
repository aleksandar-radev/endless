import { getLeaderboard } from '../api.js';
import { options } from '../globals.js';
import { Leaderboard } from '../leaderboard.js';
import { t } from '../i18n.js';

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
    return `<div>${t('leaderboard.noData')}</div>`;
  }
  const updateMessage = `<span style="color: red">${t('leaderboard.updateMessage')}</span>`;

  return html`
    ${options.resetRequired == true ? updateMessage : ''}
    <table>
      <thead>
        <tr><th>${t('leaderboard.rank')}</th><th>${t('leaderboard.username')}</th><th>${t('leaderboard.highestLevel')}</th></tr>
      </thead>
      <tbody>
        ${leaderboardData.map((entry, i) => {
    const isCurrentUser = entry.user?.username === currentUsername;
    return `
            <tr${isCurrentUser ? ' class="highlight-user"' : ''}>
              <td>${i + 1}</td>
              <td>${entry.user?.username ?? t('leaderboard.unknown')}</td>
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