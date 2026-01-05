// Quest UI logic moved from ui.js
import { formatNumber } from './ui.js';
import { quests } from '../globals.js';
import { MATERIALS } from '../constants/materials.js';
import { t, tp } from '../i18n.js';
import { getDivisor, getStatDecimalPlaces } from '../constants/stats/stats.js';
import { ITEM_RARITY } from '../constants/items.js';
import { UNIQUE_ITEMS } from '../constants/uniqueItems.js';

const BASE = import.meta.env.VITE_BASE_PATH;

export function updateQuestsUI() {
  const panel = document.getElementById('journal-quests');
  if (!panel) return;
  panel.innerHTML = '';

  // Gather unique categories from quests
  const categories = Array.from(new Set(quests.quests.map((q) => q.category)));
  // Use a static variable to remember selected tab
  if (!updateQuestsUI.selectedCategory || !categories.includes(updateQuestsUI.selectedCategory)) {
    updateQuestsUI.selectedCategory = categories[0];
  }
  const selectedCategory = updateQuestsUI.selectedCategory;

  // Create tabs
  const tabs = document.createElement('div');
  tabs.className = 'quest-tabs';
  // --- Add Claimable Quests Button INSIDE tabs, at the start ---
  const claimableBtn = document.createElement('button');
  claimableBtn.className = 'quest-claimable-btn';
  // Check if there are claimable quests
  const hasClaimable = quests.quests.some((q) => q.isComplete() && !q.claimed);
  if (hasClaimable) {
    claimableBtn.innerHTML = `<img src="${BASE}/icons/check.svg" alt="${t('icon.check')}"/>`;
    claimableBtn.style.backgroundColor = '';
  } else {
    claimableBtn.innerHTML = `<img src="${BASE}/icons/close.svg" alt="${t('common.close')}"/>`;
    claimableBtn.style.backgroundColor = 'var(--danger)';
  }
  claimableBtn.style.marginRight = '12px';
  claimableBtn.onclick = () => openClaimableQuestsModal();
  tabs.appendChild(claimableBtn);
  categories.forEach((cat) => {
    const tab = document.createElement('button');
    tab.className = 'quest-tab' + (cat === selectedCategory ? ' active' : '');
    tab.textContent = t(`quests.tab.${cat}`) || cat.charAt(0).toUpperCase() + cat.slice(1);
    tab.onclick = () => {
      updateQuestsUI.selectedCategory = cat;
      updateQuestsUI();
    };
    tabs.appendChild(tab);
  });
  panel.appendChild(tabs);

  // Filter quests by selected category
  const list = document.createElement('div');
  list.className = 'quest-list';
  quests.quests
    .filter((q) => q.category === selectedCategory)
    .forEach((q) => {
      const progress = q.getProgress();
      const item = document.createElement('div');
      item.className = 'quest-item';
      if (q.isComplete() && !q.claimed) item.classList.add('ready');
      if (q.claimed) item.classList.add('claimed');
      item.innerHTML = `
      <span class="quest-icon">${q.icon}</span>
      <span class="quest-title">${q.title}</span>
      <span class="quest-progress">${progress}/${q.target}</span>
    `;
      // Always open modal on click
      item.addEventListener('click', () => openQuestModal(q));
      list.appendChild(item);
    });
  panel.appendChild(list);
}

export function openQuestModal(quest) {
  // Remove any existing modal
  let modal = document.getElementById('quest-modal');
  if (modal) modal.remove();

  // Use the same modal structure as quest-modal for consistent centering
  modal = document.createElement('div');
  modal.id = 'quest-modal';
  modal.className = 'modal quest-modal'; // Use both classes for styling/position
  modal.innerHTML = `
    <div class="quest-modal-content">
      <button class="modal-close">&times;</button>
      <h2 id="quest-modal-title"></h2>
      <div id="quest-modal-category" style="color:var(--crystals);font-size:1em;"></div>
      <p id="quest-modal-desc"></p>
      <p id="quest-modal-reward"></p>
      <button id="quest-claim-btn" class="modal-btn">${t('quests.modal.claimReward')}</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Set quest info
  modal.querySelector('#quest-modal-title').textContent = quest.title;
  const categoryEl = modal.querySelector('#quest-modal-category');
  if (categoryEl) {
    const catLabel = t('quests.category');
    const catName = t(`quests.tab.${quest.category}`) || quest.category;
    categoryEl.textContent = quest.category ? `${catLabel}: ${catName}` : '';
  }
  modal.querySelector('#quest-modal-desc').textContent = quest.description;
  // Add progress display in green
  const progress = quest.getProgress();
  const progressHtml = `<span style=\"color:var(--success);font-weight:bold;\">${formatNumber(progress)}/${formatNumber(quest.target)}</span>`;
  // Add reward display: gold in yellow, crystals in blue, others default
  let rewardParts = [];
  for (const [key, value] of Object.entries(quest.reward)) {
    let color = '';
    if (key === 'gold') color = 'var(--gold)';
    else if (key === 'crystals') color = 'var(--crystals)';
    else color = 'var(--text)';

    const rewardName =
      key === 'gold'
        ? t('resource.gold.name')
        : key === 'crystals'
          ? t('resource.crystal.name')
          : t(key) || key.charAt(0).toUpperCase() + key.slice(1);

    if (key === 'item' && typeof value === 'object') {
      const rarityKey = (value.rarity || 'normal').toUpperCase();
      const rarityData = ITEM_RARITY[rarityKey];
      const itemColor = rarityData?.color || 'var(--text)';

      let rewardText = '';
      if (value.uniqueId && UNIQUE_ITEMS[value.uniqueId]) {
        rewardText = t(UNIQUE_ITEMS[value.uniqueId].nameKey);
      } else {
        const rarityLabel = t('quests.tab.rarity');
        const tierLabel = t('item.tier');
        const rarityName = t(`rarity.${value.rarity.toLowerCase()}`);
        const rarityHtml = `<span class="item-color-${value.rarity.toLowerCase()}">${rarityName}</span>`;
        const tierHtml = `<span style='color:var(--crystals)'>${value.tier}</span>`;

        rewardText = tp('quests.modal.randomItemReward', {
          rarityLabel,
          tierLabel,
          rarity: rarityHtml,
          tier: tierHtml,
        });
      }

      rewardParts.push(
        `<span style="color:${itemColor};font-weight:bold;">${rewardText}</span>`,
      );
    } else if (key === 'materials' && Array.isArray(value)) {
      value.forEach(({ id, qty }) => {
        const matDef = MATERIALS[id] || Object.values(MATERIALS).find((m) => m.id === id);
        const name = matDef ? matDef.name : (t(id) || id);
        rewardParts.push(
          `<span style="color:var(--text);font-weight:bold;">${name}: ${formatNumber(qty)}</span>`,
        );
      });
    } else if (key === 'bonuses' && typeof value === 'object') {
      for (const [bonusKey, bonusValue] of Object.entries(value)) {
        const bonusName = t(bonusKey) || bonusKey.charAt(0).toUpperCase() + bonusKey.slice(1);
        const divisor = getDivisor(bonusKey);
        const decimals = getStatDecimalPlaces(bonusKey);
        let formattedValue;

        if (divisor !== 1) {
          formattedValue = formatNumber((bonusValue).toFixed(decimals)) + '%';
        } else {
          formattedValue = formatNumber(bonusValue.toFixed(decimals));
        }

        rewardParts.push(
          `<span style="color:var(--text);font-weight:bold;">${bonusName}: ${formattedValue}</span>`,
        );
      }
    } else {
      rewardParts.push(`<span style=\"color:${color};font-weight:bold;\">${rewardName}: ${formatNumber(value)}</span>`);
    }
  }
  const rewardHtml = rewardParts.join('<br>');
  modal.querySelector('#quest-modal-reward').innerHTML =
    `${t('quests.modal.progress')}: ${progressHtml}<br>${t('quests.modal.reward')}:<br>${rewardHtml}`;

  // Claim button logic
  const claimBtn = modal.querySelector('#quest-claim-btn');
  claimBtn.disabled = !quest.isComplete() || quest.claimed;
  if (quest.claimed) {
    claimBtn.textContent = t('quests.modal.claimed');
    claimBtn.style.backgroundColor = 'var(--success)';
    claimBtn.disabled = true;
  } else {
    claimBtn.textContent = t('quests.modal.claimReward');
    claimBtn.style.backgroundColor = '';
    claimBtn.disabled = !quest.isComplete();
  }
  claimBtn.onclick = () => {
    if (!quest.isComplete() || quest.claimed) return;
    quest.claim();
    modal.classList.add('hidden');
    updateQuestsUI();
  };

  // Close button logic
  modal.querySelector('.modal-close').onclick = () => modal.classList.add('hidden');

  // Close modal when clicking outside the content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Show modal
  modal.classList.remove('hidden');
}

function openClaimableQuestsModal() {
  // Remove any existing modal
  let modal = document.getElementById('claimable-quests-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'claimable-quests-modal';
  modal.className = 'modal quest-modal';
  modal.innerHTML = `
    <div class="quest-modal-content">
      <button class="modal-close">&times;</button>
      <div class="claimable-header">
        <button id="claim-all-btn" class="modal-btn claim-all-btn">${t('quests.modal.claimAll')}</button>
        <h2>${t('quests.modal.claimableTitle')}</h2>
      </div>
      <div id="claimable-quests-list"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Populate the list
  const listDiv = modal.querySelector('#claimable-quests-list');
  const claimAllBtn = modal.querySelector('#claim-all-btn');
  const claimable = quests.quests.filter((q) => q.isComplete() && !q.claimed);
  if (claimable.length === 0) {
    listDiv.innerHTML = `<p style="color:var(--text-muted);">${t('quests.noQuestsReadyToClaim')}</p>`;
    claimAllBtn.disabled = true;
  } else {
    claimAllBtn.disabled = false;
    claimAllBtn.onclick = () => {
      claimable.forEach((q) => q.claim());
      updateQuestsUI();
      openClaimableQuestsModal();
    };
    claimable.forEach((q) => {
      const item = document.createElement('div');
      item.className = 'quest-item ready';
      item.innerHTML = `
        <span class="quest-icon">${q.icon}</span>
        <span class="quest-title">${q.title}</span>
        <span class="quest-progress">${formatNumber(q.getProgress())}/${formatNumber(q.target)}</span>
        <button class="modal-btn" style="margin-left:auto;">${t('quests.modal.claim')}</button>
      `;
      // Open quest modal on title/icon click
      item.querySelector('.quest-title').onclick = () => openQuestModal(q);
      item.querySelector('.quest-icon').onclick = () => openQuestModal(q);
      // Claim button
      item.querySelector('button').onclick = (e) => {
        e.stopPropagation();
        q.claim();
        updateQuestsUI();
        openClaimableQuestsModal(); // Refresh modal
      };
      listDiv.appendChild(item);
    });
  }

  // Close button logic
  modal.querySelector('.modal-close').onclick = () => modal.classList.add('hidden');
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });
  modal.classList.remove('hidden');
}
