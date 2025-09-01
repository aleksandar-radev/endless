import { runes, dataManager, hero, options } from '../globals.js';
import { t } from '../i18n.js';
import { getRuneName, getRuneDescription } from '../runes.js';
import { showTooltip, positionTooltip, hideTooltip } from './ui.js';
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
      slot.appendChild(createRuneIcon(rune.icon));
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
        hero.recalculateFromAttributes();
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

  const invSection = document.createElement('div');
  invSection.className = 'rune-section';
  const invTitle = document.createElement('div');
  invTitle.className = 'rune-section-title';
  invTitle.textContent = t('runes.inventory');
  const inv = document.createElement('div');
  inv.className = 'rune-inventory';
  runes.inventory.forEach((rune, i) => {
    const slot = document.createElement('div');
    slot.className = 'rune-slot';
    slot.dataset.index = i;
    slot.dataset.source = 'inventory';
    if (selectedRune && selectedRune.source === 'inventory' && selectedRune.index === i) {
      slot.classList.add('selected');
    }
    if (rune) {
      slot.appendChild(createRuneIcon(rune.icon));
      slot.draggable = true;
      slot.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', `inventory-${i}`);
      });
      slot.addEventListener('mouseenter', (e) => {
        showTooltip(getRuneTooltip(rune), e);
      });
      slot.addEventListener('mousemove', positionTooltip);
      slot.addEventListener('mouseleave', hideTooltip);
      slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openRuneContextMenu('inventory', i, rune, e.clientX, e.clientY);
      });
      slot.addEventListener('click', () => {
        selectedRune = { source: 'inventory', index: i };
        document.querySelectorAll('.rune-slot').forEach((s) => s.classList.remove('selected'));
        slot.classList.add('selected');
        if (equipBtn) equipBtn.style.display = 'inline-block';
      });
      slot.addEventListener('dblclick', () => {
        selectedRune = { source: 'inventory', index: i };
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
    });
    inv.appendChild(slot);
  });
  invSection.append(invTitle, inv);

  const sortBtn = document.createElement('button');
  sortBtn.className = 'inventory-btn sort-btn';
  sortBtn.textContent = t('inventory.sort');
  sortBtn.onclick = () => {
    runes.sortInventory(options.shortElementalNames);
    renderRunesUI();
    dataManager.saveGame();
  };
  const salvageBtn = document.createElement('button');
  salvageBtn.className = 'inventory-btn salvage-btn';
  salvageBtn.textContent = t('inventory.salvage');
  salvageBtn.onclick = () => {
    runes.inventory.forEach((r, i) => {
      if (!r) return;
      runes.salvage(i);
    });
    renderRunesUI();
    dataManager.saveGame();
  };
  const topControls = document.createElement('div');
  topControls.className = 'rune-controls';
  topControls.append(sortBtn, salvageBtn);
  equipBtn = document.createElement('button');
  equipBtn.className = 'inventory-btn equip-btn';
  equipBtn.textContent = t('inventory.equip');
  equipBtn.style.display =
    selectedRune && selectedRune.source === 'inventory' ? 'inline-block' : 'none';
  equipBtn.onclick = () => {
    if (!selectedRune || selectedRune.source !== 'inventory') return;
    equipSelectedRune();
  };
  const bottomControls = document.createElement('div');
  bottomControls.className = 'rune-controls';
  bottomControls.append(equipBtn);

  container.append(equipSection, topControls, invSection, bottomControls);
}

let selectedRune = null;
let equipBtn;

function equipSelectedRune() {
  const inventoryIndex = selectedRune.index;
  const slot = runes.equipped.findIndex((r) => r === null);
  if (slot === -1) return;
  runes.equip(slot, inventoryIndex);
  hero.recalculateFromAttributes();
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
  hero.recalculateFromAttributes();
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
    if (source === 'inventory') {
      runes.salvage(index);
    } else {
      runes.equipped[index] = null;
      hero.recalculateFromAttributes();
    }
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
