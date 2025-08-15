// Quest UI logic moved from ui.js
import { showTooltip, hideTooltip, positionTooltip, formatNumber } from './ui.js';
import { quests } from '../globals.js';
import { MATERIALS } from '../constants/materials.js';

export function updateQuestsUI() {
  const panel = document.getElementById('quests');
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
    claimableBtn.innerHTML = '✅';
    claimableBtn.style.backgroundColor = '';
  } else {
    claimableBtn.innerHTML = '❌';
    claimableBtn.style.backgroundColor = '#dc2626'; // red-600
  }
  claimableBtn.style.marginRight = '12px';
  claimableBtn.onclick = () => openClaimableQuestsModal();
  tabs.appendChild(claimableBtn);
  categories.forEach((cat) => {
    const tab = document.createElement('button');
    tab.className = 'quest-tab' + (cat === selectedCategory ? ' active' : '');
    tab.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
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
      // Show tooltip on hover
      item.addEventListener('mouseenter', (e) => showTooltip(q.description, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);
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
      <div id="quest-modal-category" style="color:#38bdf8;font-size:1em;"></div>
      <p id="quest-modal-desc"></p>
      <p id="quest-modal-reward"></p>
      <button id="quest-claim-btn" class="modal-btn">Claim Reward</button>
    </div>
  `;
  document.body.appendChild(modal);

  // Set quest info
  modal.querySelector('#quest-modal-title').textContent = quest.title;
  if (modal.querySelector('#quest-modal-category')) {
    modal.querySelector('#quest-modal-category').textContent = quest.category
      ? `Category: ${quest.category.charAt(0).toUpperCase() + quest.category.slice(1)}`
      : '';
  }
  modal.querySelector('#quest-modal-desc').textContent = quest.description;
  // Add progress display in green
  const progress = quest.getProgress();
  const progressHtml = `<span style=\"color:#22c55e;font-weight:bold;\">${formatNumber(progress)}/${formatNumber(quest.target)}</span>`;
  // Add reward display: gold in yellow, crystals in blue, others default
  let rewardParts = [];
  for (const [key, value] of Object.entries(quest.reward)) {
    let color = '';
    if (key === 'gold') color = '#FFD700';
    else if (key === 'crystals') color = '#38bdf8';
    else color = '#fff';
    if (key === 'item' && typeof value === 'object') {
      // Show item reward details (rarity, tier)
      rewardParts.push(
        `<span style="color:#fff;font-weight:bold;">Random Item (Rarity: <span class="item-color-${value.rarity}">${value.rarity}</span>, Tier: <span style='color:#38bdf8'>${value.tier}</span>)</span>`,
      );
    } else if (key === 'materials' && Array.isArray(value)) {
      value.forEach(({ id, qty }) => {
        const matDef = MATERIALS[id] || Object.values(MATERIALS).find((m) => m.id === id);
        rewardParts.push(
          `<span style=\"color:#fff;font-weight:bold;\">${formatNumber(qty)} ${matDef?.name || id}</span>`,
        );
      });
    } else {
      rewardParts.push(
        `<span style=\"color:${color};font-weight:bold;\">${formatNumber(value)} ${key.charAt(0).toUpperCase() + key.slice(1)}</span>`,
      );
    }
  }
  const rewardHtml = rewardParts.join(', ');
  modal.querySelector('#quest-modal-reward').innerHTML = `Progress: ${progressHtml}<br>Reward: ${rewardHtml}`;

  // Claim button logic
  const claimBtn = modal.querySelector('#quest-claim-btn');
  claimBtn.disabled = !quest.isComplete() || quest.claimed;
  if (quest.claimed) {
    claimBtn.textContent = 'Claimed';
    claimBtn.style.backgroundColor = '#22c55e'; // green
    claimBtn.disabled = true;
  } else {
    claimBtn.textContent = 'Claim Reward';
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
        <button id="claim-all-btn" class="modal-btn claim-all-btn">Claim All</button>
        <h2>Claimable Quests</h2>
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
    listDiv.innerHTML = '<p style="color:#aaa;">No quests ready to claim.</p>';
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
        <button class="modal-btn" style="margin-left:auto;">Claim</button>
      `;
      // Show tooltip on hover
      item.addEventListener('mouseenter', (e) => showTooltip(q.description, e));
      item.addEventListener('mousemove', positionTooltip);
      item.addEventListener('mouseleave', hideTooltip);
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
