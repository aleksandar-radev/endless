import { runes, dataManager, hero, options, training, soulShop } from '../globals.js';
import { t, tp } from '../i18n.js';
import {
  getRuneName,
  getRuneDescription,
  getRuneIcon,
  FROZEN_RUNE_SLOTS,
  INVENTORY_TAB_COUNT,
} from '../runes.js';
import { showTooltip, positionTooltip, hideTooltip, showToast } from './ui.js';
import { createModal, closeModal } from './modal.js';

export function initializeRunesUI() {
  renderRunesUI();
}

function createRuneIcon(icon) {
  const img = document.createElement('img');
  img.src = icon;
  img.className = 'rune-icon';
  return img;
}

export function renderRunesUI() {
  const container = document.getElementById('runes');
  if (!container) return;
  container.innerHTML = '';
  runeFilterCache.clear();

  const unlockedTabs =
    typeof runes.getUnlockedTabCount === 'function'
      ? runes.getUnlockedTabCount()
      : INVENTORY_TAB_COUNT;
  if (activeTab >= unlockedTabs) {
    activeTab = Math.max(0, unlockedTabs - 1);
  }

  if (selectedRune?.source === 'inventory') {
    const index = selectedRune.index;
    const isValid =
      typeof runes.isValidInventoryIndex === 'function'
        ? runes.isValidInventoryIndex(index)
        : index >= 0 && index < runes.inventory.length;
    if (!isValid) {
      selectedRune = null;
    } else if (
      typeof runes.isFrozenIndex === 'function'
      && typeof runes.getTabIndexForSlot === 'function'
      && !runes.isFrozenIndex(index)
    ) {
      const tabIndex = runes.getTabIndexForSlot(index);
      if (tabIndex !== null && tabIndex !== activeTab) {
        selectedRune = null;
      }
    }
  }

  const equipSection = document.createElement('div');
  equipSection.className = 'rune-section';
  const equipTitle = document.createElement('div');
  equipTitle.className = 'rune-section-title';
  equipTitle.textContent = t('runes.equipped');
  const equip = document.createElement('div');
  equip.className = 'rune-equip-slots';
  runes.equipped.forEach((rune, i) => {
    const slot = document.createElement('div');
    slot.className = 'rune-slot';
    slot.dataset.index = i;
    slot.dataset.source = 'equipped';
    if (selectedRune && selectedRune.source === 'equipped' && selectedRune.index === i) {
      slot.classList.add('selected');
    }
    if (rune) {
      slot.appendChild(createRuneIcon(getRuneIcon(rune)));
      slot.draggable = true;
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', `equipped-${i}`);
      });
      slot.addEventListener('mouseenter', (e) => {
        showTooltip(getRuneTooltip(rune), e);
      });
      slot.addEventListener('mousemove', positionTooltip);
      slot.addEventListener('mouseleave', hideTooltip);
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openRuneContextMenu('equipped', i, rune, e.clientX, e.clientY);
      });
      slot.addEventListener('click', () => {
        selectedRune = { source: 'equipped', index: i };
        document.querySelectorAll('.rune-slot').forEach((s) => s.classList.remove('selected'));
        slot.classList.add('selected');
        if (equipBtn) equipBtn.style.display = 'none';
      });
      slot.addEventListener('dblclick', () => {
        runes.unequip(i);
        hero.queueRecalculateFromAttributes();
        training.updateTrainingAffordability('gold-upgrades');
        soulShop.updateSoulShopAffordability();
        // Update Arena Boss Skip option max when unique rune effects change
        try { options.updateArenaBossSkipOption?.(); } catch {}
        selectedRune = null;
        renderRunesUI();
        dataManager.saveGame();
      });
    }
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.classList.add('drag-over');
    });
    slot.addEventListener('dragleave', () => {
      slot.classList.remove('drag-over');
    });
    slot.addEventListener('drop', (e) => {
      slot.classList.remove('drag-over');
      handleDrop(e);
    });
    equip.appendChild(slot);
  });
  equipSection.append(equipTitle, equip);

  const tabsBar = createTabsBar();
  const frozenSection = createFrozenSection();
  const invSection = createInventorySection();

  const sortBtn = document.createElement('button');
  sortBtn.className = 'inventory-btn sort-btn';
  sortBtn.textContent = t('inventory.sort');
  sortBtn.onclick = () => {
    if (typeof runes.sortTab === 'function') {
      runes.sortTab(activeTab, options.shortElementalNames);
    } else {
      runes.sortInventory(options.shortElementalNames);
    }
    renderRunesUI();
    dataManager.saveGame();
  };

  const filterWrapper = document.createElement('div');
  filterWrapper.className = 'rune-filter';
  const filterInput = document.createElement('input');
  filterInput.type = 'text';
  filterInput.className = 'rune-filter-input';
  filterInput.placeholder = t('runes.tabSearchPlaceholder');
  filterInput.value = runeFilterText;
  filterInput.addEventListener('input', (e) => {
    runeFilterText = e.target.value;
    updateRuneFilterHighlights(container);
  });
  filterWrapper.appendChild(filterInput);

  const salvageRunesInRange = (start, end) => {
    let crystals = 0;
    for (let i = start; i < end; i++) {
      if (!runes.inventory[i]) continue;
      if (typeof runes.isFrozenIndex === 'function' && runes.isFrozenIndex(i)) continue;
      crystals += runes.salvage(i);
    }
    return crystals;
  };

  const finalizeSalvage = (crystals) => {
    if (crystals > 0) {
      showToast(`Salvaged runes for ${crystals} crystal${crystals > 1 ? 's' : ''}`, 'success');
    }
    selectedRune = null;
    renderRunesUI();
    dataManager.saveGame();
  };

  const salvageTabBtn = document.createElement('button');
  salvageTabBtn.className = 'inventory-btn salvage-btn';
  salvageTabBtn.textContent = t('runes.salvageTab');
  salvageTabBtn.onclick = () => {
    if (typeof runes.getTabBounds !== 'function') {
      finalizeSalvage(salvageRunesInRange(0, runes.inventory.length));
      return;
    }
    const { start, end } = runes.getTabBounds(activeTab);
    finalizeSalvage(salvageRunesInRange(start, end));
  };

  const salvageAllBtn = document.createElement('button');
  salvageAllBtn.className = 'inventory-btn salvage-btn salvage-all-btn';
  salvageAllBtn.textContent = t('runes.salvageAllTabs');
  salvageAllBtn.onclick = () => {
    finalizeSalvage(salvageRunesInRange(0, runes.inventory.length));
  };
  const topControls = document.createElement('div');
  topControls.className = 'rune-controls';
  equipBtn = document.createElement('button');
  equipBtn.className = 'inventory-btn equip-btn';
  equipBtn.textContent = t('inventory.equip');
  equipBtn.style.display =
    selectedRune && selectedRune.source === 'inventory' ? 'inline-block' : 'none';
  equipBtn.onclick = () => {
    if (!selectedRune || selectedRune.source !== 'inventory') return;
    equipSelectedRune();
  };
  topControls.append(filterWrapper, sortBtn, salvageTabBtn, salvageAllBtn, equipBtn);

  container.append(equipSection, tabsBar, frozenSection, topControls, invSection);
  updateRuneFilterHighlights(container);
}

let selectedRune = null;
let equipBtn;
let activeTab = 0;
let draggedRuneIndex = null;
let runeFilterText = '';
const runeFilterCache = new Map();

function getRuneFilterKey(rune) {
  if (!rune) return '';
  const percent = typeof rune.conversion?.percent === 'number' ? rune.conversion.percent : '';
  const mode = options?.shortElementalNames ? 'short' : 'long';
  return `${rune.id}:${percent}:${mode}`;
}

function getRuneFilterStrings(rune) {
  const key = getRuneFilterKey(rune);
  if (!key) return null;
  if (!runeFilterCache.has(key)) {
    const name = getRuneName(rune, options.shortElementalNames).toLowerCase();
    const desc = getRuneDescription(rune, options.shortElementalNames).toLowerCase();
    runeFilterCache.set(key, { name, desc });
  }
  return runeFilterCache.get(key);
}

function runeMatchesFilter(rune, filter) {
  if (!rune || !filter) return false;
  const strings = getRuneFilterStrings(rune);
  if (!strings) return false;
  return strings.name.includes(filter) || strings.desc.includes(filter);
}

function updateRuneFilterHighlights(root = document) {
  if (!root) return;
  const filter = (runeFilterText || '').trim().toLowerCase();
  const filterActive = filter.length > 0;

  const slots = root.querySelectorAll('.rune-slot');
  slots.forEach((slot) => {
    slot.classList.remove('filter-match', 'filter-dim');
    if (!filterActive) return;
    const source = slot.dataset.source;
    const index = Number(slot.dataset.index);
    if (Number.isNaN(index)) return;
    const rune = source === 'equipped' ? runes.equipped[index] : runes.inventory[index];
    if (rune && runeMatchesFilter(rune, filter)) {
      slot.classList.add('filter-match');
    } else if (rune) {
      slot.classList.add('filter-dim');
    }
  });

  const tabButtons = root.querySelectorAll('.rune-tab-button');
  const hasTabBounds = typeof runes.getTabBounds === 'function';
  const fallbackTabSize = hasTabBounds
    ? 0
    : Math.ceil(runes.inventory.length / INVENTORY_TAB_COUNT);
  tabButtons.forEach((btn) => {
    btn.classList.remove('filter-match');
    if (!filterActive) return;
    const tabIndex = Number(btn.dataset.tab);
    if (Number.isNaN(tabIndex)) return;
    let start = 0;
    let end = 0;
    if (hasTabBounds) {
      const bounds = runes.getTabBounds(tabIndex);
      start = bounds.start;
      end = bounds.end;
    } else {
      const size = fallbackTabSize || 0;
      start = FROZEN_RUNE_SLOTS + tabIndex * size;
      end = Math.min(start + size, runes.inventory.length);
    }
    let hasMatch = false;
    for (let i = start; i < end; i++) {
      const rune = runes.inventory[i];
      if (rune && runeMatchesFilter(rune, filter)) {
        hasMatch = true;
        break;
      }
    }
    if (hasMatch) {
      btn.classList.add('filter-match');
    }
  });
}

function createTabsBar() {
  const tabs = document.createElement('div');
  tabs.className = 'rune-tabs';
  const unlockedTabs =
    typeof runes.getUnlockedTabCount === 'function'
      ? runes.getUnlockedTabCount()
      : INVENTORY_TAB_COUNT;
  for (let i = 0; i < INVENTORY_TAB_COUNT; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.tab = i;
    btn.className = 'rune-tab-button';

    const { start, end } = runes.getTabBounds(i);
    let filled = 0;
    for (let slot = start; slot < end; slot++) {
      if (runes.inventory[slot]) filled++;
    }
    const capacity = end - start;

    const isUnlocked = typeof runes.isTabUnlocked === 'function' ? runes.isTabUnlocked(i) : i < unlockedTabs;

    if (i === activeTab) btn.classList.add('active');
    if (filled === 0) btn.classList.add('empty');
    if (!isUnlocked) {
      btn.classList.add('locked');
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
    }

    const number = document.createElement('span');
    number.className = 'rune-tab-number';
    number.textContent = `${i + 1}`;
    btn.appendChild(number);

    const count = document.createElement('span');
    count.className = 'rune-tab-count';
    count.textContent = `${filled}/${capacity}`;
    count.setAttribute('aria-hidden', 'true');
    btn.appendChild(count);

    const tabLabel = isUnlocked
      ? tp('runes.tabTooltip', { tab: i + 1, used: filled, capacity })
      : t('runes.tabLockedTooltip');
    btn.setAttribute('aria-label', tabLabel);
    btn.setAttribute('title', tabLabel);
    btn.setAttribute('aria-pressed', i === activeTab ? 'true' : 'false');
    if (isUnlocked) {
      btn.onclick = () => {
        if (activeTab === i) return;
        activeTab = i;
        if (selectedRune?.source === 'inventory' && typeof runes.isFrozenIndex === 'function') {
          const idx = selectedRune.index;
          if (!runes.isFrozenIndex(idx)) {
            selectedRune = null;
          }
        }
        renderRunesUI();
      };
      btn.addEventListener('dragover', (e) => {
        if (draggedRuneIndex === null) return;
        e.preventDefault();
        btn.classList.add('drag-over');
      });
      btn.addEventListener('dragleave', () => {
        btn.classList.remove('drag-over');
      });
      btn.addEventListener('drop', (e) => {
        if (draggedRuneIndex === null) return;
        e.preventDefault();
        btn.classList.remove('drag-over');
        if (runes.moveRuneToTab?.(draggedRuneIndex, i)) {
          selectedRune = null;
          renderRunesUI();
          dataManager.saveGame();
        }
        draggedRuneIndex = null;
      });
    }
    tabs.appendChild(btn);
  }
  return tabs;
}

function createFrozenSection() {
  const section = document.createElement('div');
  section.className = 'rune-section';
  const title = document.createElement('div');
  title.className = 'rune-section-title';
  title.textContent = t('runes.frozenSlots');
  const slots = document.createElement('div');
  slots.className = 'rune-inventory rune-frozen-slots';
  for (let i = 0; i < FROZEN_RUNE_SLOTS; i++) {
    slots.appendChild(createInventorySlot(runes.inventory[i], i, true));
  }
  section.append(title, slots);
  return section;
}

function createInventorySection() {
  const section = document.createElement('div');
  section.className = 'rune-section';
  const title = document.createElement('div');
  title.className = 'rune-section-title';
  title.textContent = t('runes.inventory');
  const slots = document.createElement('div');
  slots.className = 'rune-inventory';
  if (typeof runes.getTabBounds === 'function') {
    const { start, end } = runes.getTabBounds(activeTab);
    for (let i = start; i < end; i++) {
      slots.appendChild(createInventorySlot(runes.inventory[i], i, false));
    }
  } else {
    runes.inventory.forEach((rune, index) => {
      slots.appendChild(createInventorySlot(rune, index, false));
    });
  }
  section.append(title, slots);
  return section;
}

function createInventorySlot(rune, index, isFrozen) {
  const slot = document.createElement('div');
  slot.className = 'rune-slot';
  slot.dataset.index = index;
  slot.dataset.source = 'inventory';
  if (isFrozen) {
    slot.dataset.frozen = 'true';
    slot.classList.add('frozen');
  }
  if (selectedRune && selectedRune.source === 'inventory' && selectedRune.index === index) {
    slot.classList.add('selected');
  }
  if (rune) {
    slot.appendChild(createRuneIcon(getRuneIcon(rune)));
    slot.draggable = true;
    slot.addEventListener('dragstart', (e) => {
      draggedRuneIndex = index;
      e.dataTransfer.setData('text/plain', `inventory-${index}`);
    });
    slot.addEventListener('dragend', () => {
      draggedRuneIndex = null;
    });
    slot.addEventListener('mouseenter', (e) => {
      showTooltip(getRuneTooltip(rune), e);
    });
    slot.addEventListener('mousemove', positionTooltip);
    slot.addEventListener('mouseleave', hideTooltip);
    slot.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openRuneContextMenu('inventory', index, rune, e.clientX, e.clientY);
    });
    slot.addEventListener('click', () => {
      selectedRune = { source: 'inventory', index };
      document.querySelectorAll('.rune-slot').forEach((s) => s.classList.remove('selected'));
      slot.classList.add('selected');
      if (equipBtn) equipBtn.style.display = 'inline-block';
    });
    slot.addEventListener('dblclick', () => {
      selectedRune = { source: 'inventory', index };
      equipSelectedRune();
    });
  }
  slot.addEventListener('dragover', (e) => {
    e.preventDefault();
    slot.classList.add('drag-over');
  });
  slot.addEventListener('dragleave', () => {
    slot.classList.remove('drag-over');
  });
  slot.addEventListener('drop', (e) => {
    slot.classList.remove('drag-over');
    handleDrop(e);
    draggedRuneIndex = null;
  });
  return slot;
}

function equipSelectedRune() {
  const inventoryIndex = selectedRune.index;
  const slot = runes.equipped.findIndex((r) => r === null);
  if (slot === -1) return;
  runes.equip(slot, inventoryIndex);
  hero.queueRecalculateFromAttributes();
  training.updateTrainingAffordability('gold-upgrades');
  soulShop.updateSoulShopAffordability();
  try { options.updateArenaBossSkipOption?.(); } catch {}
  selectedRune = null;
  renderRunesUI();
  dataManager.saveGame();
}

function handleDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  const target = e.currentTarget;
  const targetSource = target.dataset.source;
  const targetIndex = parseInt(target.dataset.index, 10);

  const [source, indexStr] = data.split('-');
  const fromIndex = parseInt(indexStr, 10);
  if (source === 'inventory' && targetSource === 'inventory') {
    runes.moveInventory(fromIndex, targetIndex);
  } else if (source === 'inventory' && targetSource === 'equipped') {
    runes.equip(targetIndex, fromIndex);
  } else if (source === 'equipped' && targetSource === 'inventory') {
    runes.unequip(fromIndex, targetIndex);
  } else if (source === 'equipped' && targetSource === 'equipped') {
    runes.moveEquipped(fromIndex, targetIndex);
  }
  hero.queueRecalculateFromAttributes();
  training.updateTrainingAffordability('gold-upgrades');
  soulShop.updateSoulShopAffordability();
  try { options.updateArenaBossSkipOption?.(); } catch {}
  selectedRune = null;
  renderRunesUI();
  dataManager.saveGame();
}

function getRuneTooltip(rune) {
  return `<div class="tooltip-header">${getRuneName(rune, options.shortElementalNames)}</div><div class="tooltip-content">${getRuneDescription(rune, options.shortElementalNames)}</div>`;
}

function openRuneContextMenu(source, index, rune, x, y) {
  closeRuneContextMenu();
  const menu = document.createElement('div');
  menu.id = 'rune-context-menu';
  menu.className = 'item-context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.innerHTML = `
    <button data-action="equip">${t('inventory.equip')}</button>
    <button data-action="inspect">${t('inventory.inspect')}</button>
    <button data-action="salvage">${t('inventory.salvage')}</button>
  `;
  document.body.appendChild(menu);

  if (source === 'inventory') {
    const moveRow = document.createElement('div');
    moveRow.className = 'rune-move-row';
    const label = document.createElement('label');
    label.textContent = t('runes.moveToTab');
    const select = document.createElement('select');
    select.className = 'rune-move-select';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = t('runes.moveToTab');
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);
    const unlockedTabs =
      typeof runes.getUnlockedTabCount === 'function'
        ? runes.getUnlockedTabCount()
        : INVENTORY_TAB_COUNT;
    for (let tab = 0; tab < INVENTORY_TAB_COUNT; tab++) {
      const option = document.createElement('option');
      option.value = tab;
      const isUnlocked =
        typeof runes.isTabUnlocked === 'function' ? runes.isTabUnlocked(tab) : tab < unlockedTabs;
      option.textContent = isUnlocked
        ? `${tab + 1}`
        : tp('runes.lockedTabOption', { tab: tab + 1 });
      option.disabled = !isUnlocked;
      select.appendChild(option);
    }
    select.onchange = (e) => {
      const tabIndex = Number(e.target.value);
      if (Number.isNaN(tabIndex)) return;
      if (runes.moveRuneToTab?.(index, tabIndex)) {
        selectedRune = null;
        renderRunesUI();
        dataManager.saveGame();
      }
      closeRuneContextMenu();
    };
    moveRow.append(label, select);
    menu.appendChild(moveRow);
  }

  menu.querySelector('[data-action="equip"]').onclick = () => {
    if (source === 'inventory') {
      selectedRune = { source, index };
      equipSelectedRune();
    }
    closeRuneContextMenu();
  };
  menu.querySelector('[data-action="inspect"]').onclick = () => {
    const dialog = createModal({
      id: 'inspect-rune',
      className: 'inventory-modal',
      content: `<div class="inventory-modal-content"><button class="modal-close">&times;</button>${getRuneTooltip(
        rune,
      )}</div>`,
    });
    dialog.querySelector('.modal-close').onclick = () => closeModal('inspect-rune');
    closeRuneContextMenu();
  };
  menu.querySelector('[data-action="salvage"]').onclick = () => {
    let crystals = 0;
    if (source === 'inventory') {
      crystals = runes.salvage(index);
    } else {
      runes.equipped[index] = null;
      hero.queueRecalculateFromAttributes();
      training.updateTrainingAffordability('gold-upgrades');
      soulShop.updateSoulShopAffordability();
    }
    if (crystals > 0) {
      showToast(`Salvaged rune for ${crystals} crystal${crystals > 1 ? 's' : ''}`,'success');
    }
    try { options.updateArenaBossSkipOption?.(); } catch {}
    selectedRune = null;
    renderRunesUI();
    dataManager.saveGame();
    closeRuneContextMenu();
  };

  setTimeout(() => {
    document.addEventListener('click', handleContextOutside);
  });
}

function handleContextOutside(e) {
  if (!e.target.closest('#rune-context-menu')) {
    closeRuneContextMenu();
  }
}

function closeRuneContextMenu() {
  const menu = document.getElementById('rune-context-menu');
  if (menu) {
    menu.remove();
    document.removeEventListener('click', handleContextOutside);
  }
}
