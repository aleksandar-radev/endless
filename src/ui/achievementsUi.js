
import { achievements } from '../globals.js';
import { formatNumber, formatStatName } from './ui.js';
import { t, tp } from '../i18n.js';

// Helper function for creating elements, assuming it exists elsewhere or is intended to be added.
// For this change, we'll define a simple one to match the usage.
function createElement(tag, props) {
  const el = document.createElement(tag);
  if (props.class) el.className = props.class;
  if (props.text) el.textContent = props.text;
  // Add other properties as needed, e.g., 'id', 'style', etc.
  return el;
}

// default to hiding claimed achievements
let showClaimed = false;

export function updateAchievementsUI() {
  const panel = document.getElementById('journal-achievements');
  if (!panel) return;

  panel.innerHTML = '';

  const headerContainer = createElement('div', { class: 'achievements-header' });
  const headerTitle = createElement('div', {
    class: 'achievements-header-title',
    text: t('achievements.title'),
  });
  headerContainer.appendChild(headerTitle);

  const headerScore = createElement('div', {
    class: 'achievements-header-score',
    text: `: ${achievements.getScore()} / ${achievements.achievements.length}`,
  });
  headerContainer.appendChild(headerScore);

  // Toggle Button
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle-claimed-btn';
  toggleBtn.textContent = showClaimed ? t('achievements.hideClaimed') : t('achievements.showClaimed');
  toggleBtn.addEventListener('click', () => {
    showClaimed = !showClaimed;
    updateAchievementsUI();
  });
  headerContainer.appendChild(toggleBtn);

  // Removed ambiguous specific bonus percent.
  // Maybe list active bonuses in a tooltip or separate panel later.

  panel.appendChild(headerContainer);

  const list = document.createElement('div');
  list.className = 'achievement-list';

  achievements.achievements.forEach((ach) => {
    // Filter out claimed achievements if showClaimed is false
    if (ach.claimed && !showClaimed) return;

    const item = document.createElement('div');
    item.className = 'achievement-item';
    if (ach.claimed) item.classList.add('claimed');
    else if (ach.isComplete()) item.classList.add('ready');

    const progress = ach.getProgress();
    const target = ach.target;
    // Cap progress at target for display
    const current = Math.min(progress, target);
    const percent = Math.min(100, (current / target) * 100);

    // Helper to format bonuses
    const formatBonuses = (bonuses) => {
      if (!bonuses) return '';
      const parts = [];
      Object.entries(bonuses).forEach(([stat, val]) => {
        const statName = formatStatName(stat);
        let formattedVal = val;
        let suffix = '';
        if (stat.endsWith('Percent')) {
          formattedVal = parseFloat((val * 100).toFixed(2));
          suffix = '%';
        } else {
          formattedVal = formatNumber(val);
        }
        parts.push(`+${formattedVal}${suffix} ${statName}`);
      });
      return parts.join(', ');
    };

    const nextRewardText = ach.reward?.bonuses ? formatBonuses(ach.reward.bonuses) : '';
    const activeRewardText = ach.activeReward?.bonuses ? formatBonuses(ach.activeReward.bonuses) : '';

    // Determine title suffix
    const levelSuffix = (ach.targetMultiplier || ach.baseTarget) ? ` (Lvl ${ach.level})` : '';

    let rewardsHtml = '';
    if (activeRewardText) {
      rewardsHtml += `<div class="achievement-reward active-bonus">${t('common.current_bonus') || 'Current Bonus'}: ${activeRewardText}</div>`;
    }
    if (nextRewardText) {
      const label = activeRewardText ? (t('common.next_reward') || 'Next Reward') : (t('common.reward') || 'Reward');
      rewardsHtml += `<div class="achievement-reward next-reward">${label}: ${nextRewardText}</div>`;
    }

    item.innerHTML = `
      <div class="achievement-icon">${ach.icon.replace('text:', '')}</div>
      <div class="achievement-info">
        <div class="achievement-title">${t(ach.title)}${levelSuffix}</div>
        <div class="achievement-desc">${tp(ach.description, { target: formatNumber(target) })}</div>
        ${rewardsHtml}
        <div class="achievement-progress-bar-container">
            <div class="achievement-progress-bar" style="width: ${percent}%"></div>
            <div class="achievement-progress-text">${formatNumber(current)} / ${formatNumber(target)}</div>
        </div>
      </div>
      <div class="achievement-action">
        ${(() => {
    const isMaxed = ach.maxLevel && ach.level >= ach.maxLevel && ach.claimed;
    const isSingleClaimed = ach.claimed && !ach.targetMultiplier;

    if (isMaxed) return `<span class="claimed-text">${t('common.max') || 'Maxed'}</span>`;
    if (isSingleClaimed) return `<span class="claimed-text">${t('common.claimed')}</span>`;

    return `<button class="claim-btn" ${!ach.isComplete() ? 'disabled' : ''}>${ach.targetMultiplier ? (t('common.upgrade') || 'Upgrade') : (t('common.claim') || 'Claim')}</button>`;
  })()}
      </div>
    `;

    // Add listener only if not maxed and not single-claimed
    const isMaxed = ach.maxLevel && ach.level >= ach.maxLevel && ach.claimed;
    const isSingleClaimed = ach.claimed && !ach.targetMultiplier;

    if (!isMaxed && !isSingleClaimed && ach.isComplete()) {
      const btn = item.querySelector('.claim-btn');
      btn.addEventListener('click', () => {
        ach.claim();
        updateAchievementsUI();
      });
    }

    list.appendChild(item);
  });

  panel.appendChild(list);
}
