import { game,
  hero,
  inventory,
  training,
  skillTree,
  dataManager,
  statistics,
  runes,
  ascension,
  prestige } from './globals.js';
import { MATERIALS } from './constants/materials.js';
import { RUNES, MAX_CONVERSION_PERCENT, MIN_CONVERSION_PERCENT } from './constants/runes.js';
import SimpleCrypto from 'simple-crypto-js';
import { initializeSkillTreeStructure,
  showToast,
  updatePlayerLife,
  updateResources,
  updateStageUI,
  updateTabIndicators } from './ui/ui.js';
import { createImageDropdownFromData } from './ui/imageDropdown.js';
import { ITEM_ICONS, ITEM_RARITY, ITEM_TYPES, ALL_ITEM_TYPES } from './constants/items.js';
import { updateRegionUI } from './region.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { createCombatText } from './combat.js';
import { renderRunesUI } from './ui/runesUi.js';
import { updateAscensionUI } from './ui/ascensionUi.js';
import { getRuneName } from './runes.js';
import { t, tp } from './i18n.js';
import { createModal, closeModal } from './ui/modal.js';
import { createSetItemsById,
  createUniqueItemById,
  getItemSetDefinitions,
  getUniqueItemDefinitions } from './uniqueItems.js';
import { isDevAccessWindowActive } from './migrations/0.8.15.js';

export const crypt = new SimpleCrypto(import.meta.env.VITE_ENCRYPT_KEY);

export const handleSavedData = (savedData, self) => {
  if (savedData) {
    Object.keys(self).forEach((key) => {
      if (savedData.hasOwnProperty(key)) {
        if (
          typeof self[key] === 'object' &&
          !Array.isArray(self[key]) &&
          self[key] !== null &&
          savedData[key] !== null
        ) {
          self[key] = { ...self[key], ...savedData[key] };
        } else {
          self[key] = savedData[key];
        }
      }
    });
  }
};

// Debugging
let debugUiInterval = null; // Track the interval ID for clearing later
let saveGameInterval = null; // Track the interval ID for clearing later
const valueNodes = new Map(); // Cache DOM nodes for quick updates
let lastEncryptedSave = null; // Cache the last encrypted save to avoid redundant work

// Load saved expanded states

let expandedState;

export function initDebugging() {
  expandedState = new Map(JSON.parse(localStorage.getItem('debugUIState') || '[]'));
  let dev = false; // Track if dev mode is active
  let keySequence = [];
  const toggleSequence = ['e', 'd', 'e', 'v'];

  const toggleDevMode = () => {
    dev = !dev;
    console.log(`Dev mode is now ${dev ? 'enabled' : 'disabled'}.`);
    if (dev) {
      document.body.classList.add('dev-active');

      if (window.innerWidth <= 900) {
        const content = document.createElement('div');
        content.className = 'modal-content devtools-modal-content';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.gap = '10px';
        content.style.maxHeight = '90vh';
        content.style.overflowY = 'auto';
        content.style.background = '#000';
        content.style.color = '#fff';
        content.style.padding = '20px';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '10px';
        closeBtn.style.right = '15px';
        closeBtn.style.fontSize = '24px';
        closeBtn.style.cursor = 'pointer';
        content.appendChild(closeBtn);

        const title = document.createElement('h2');
        title.textContent = 'DevTools';
        title.style.marginTop = '0';
        content.appendChild(title);

        // Create UIs but append to content instead of body
        const debugUI = createDebugUI(content);
        debugUI.style.position = 'static'; // Reset fixed position for modal
        debugUI.style.maxWidth = '100%';
        debugUI.style.height = '300px';
        debugUI.style.border = '1px solid #333';

        createModifyUI(content);

        createModal({
          id: 'devtools-modal',
          className: 'devtools-modal',
          content: content.outerHTML,
          onClose: () => {
            if (dev) toggleDevMode();
          },
        });

        setTimeout(() => {
          const modalContent = document.querySelector('#devtools-modal .modal-content');
          if (modalContent) {
            modalContent.innerHTML = '';

            // Re-add close button and title since we cleared innerHTML
            const closeBtn = document.createElement('span');
            closeBtn.className = 'modal-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '15px';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.cursor = 'pointer';
            // Re-attach close listener manually since we are inside the content
            closeBtn.onclick = () => closeModal('devtools-modal');
            modalContent.appendChild(closeBtn);

            const title = document.createElement('h2');
            title.textContent = 'DevTools';
            title.style.marginTop = '0';
            modalContent.appendChild(title);

            const debugUI = createDebugUI(modalContent);
            debugUI.style.position = 'static';
            debugUI.style.maxWidth = '100%';
            debugUI.style.height = '300px';
            debugUI.style.border = '1px solid #333';
            createModifyUI(modalContent);

            valueNodes.clear();
            updateDebugUI();
          }
        }, 0);
      } else {
        createDebugUI();
        createModifyUI();
      }

      saveExpandedState(expandedState);

      // Initial update and monitor changes
      updateDebugUI();
      debugUiInterval = setInterval(updateDebugUI, 1000);
      saveGameInterval = setInterval(() => dataManager.saveGame({ force: true }), 1000);
    } else {
      if (debugUiInterval) {
        clearInterval(debugUiInterval);
        debugUiInterval = null;
      }
      clearInterval(saveGameInterval);
      document.body.classList.remove('dev-active');
      const debugDiv = document.querySelector('.debug-ui');
      const modifyUI = document.querySelector('.modify-ui');
      if (debugDiv) {
        debugDiv.remove();
      }
      if (modifyUI) {
        modifyUI.remove();
      }

      const modal = document.getElementById('devtools-modal');
      if (modal) {
        modal._onClose = null; // Prevent callback loop
        closeModal(modal);
      }

      valueNodes.clear();
      lastEncryptedSave = null;
    }
  };

  document.addEventListener('keydown', (event) => {
    keySequence.push(event.key.toLowerCase());
    if (keySequence.length > toggleSequence.length) {
      keySequence.shift();
    }
    if (keySequence.join('') === toggleSequence.join('')) {
      toggleDevMode();
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('dev-access-highlight') || event.target.id === 'edev-btn') {
      toggleDevMode();
    }
  });
}

// Function to update the UI
function updateDebugUI() {
  const debugDiv = document.querySelector('.debug-ui');
  if (!debugDiv) return;

  const encrypted = localStorage.getItem('gameProgress');
  if (encrypted === lastEncryptedSave) return; // Nothing changed
  lastEncryptedSave = encrypted;

  let decrypted;
  try {
    decrypted = crypt.decrypt(encrypted);
  } catch {
    console.error('Failed to decrypt game progress');
    return;
  }

  const key = 'gameProgress';
  const fullPath = key;

  // If structure changed or UI not built, rebuild it
  if (!valueNodes.size || rebuildNeeded(decrypted, fullPath)) {
    debugDiv.innerHTML = '';
    valueNodes.clear();
    const details = document.createElement('details');

    // Preserve expansion state
    if (expandedState.has(fullPath)) {
      details.open = expandedState.get(fullPath);
    } else {
      details.open = true; // Default: Expanded
    }

    // Track changes to the expansion state
    details.addEventListener('toggle', () => {
      expandedState.set(fullPath, details.open);
    });

    const summary = document.createElement('summary');
    summary.textContent = key;
    details.appendChild(summary);

    // Render the nested object or value
    renderObject(decrypted, details, fullPath, 0);
    debugDiv.appendChild(details);
  } else {
    // Update existing values in-place
    updateValues(decrypted, fullPath);
  }
}

// Save expanded state whenever it changes
function saveExpandedState() {
  localStorage.setItem('debugUIState', JSON.stringify([...expandedState]));
}

// Determine if the structure of the object has changed and the UI needs a full rebuild
function rebuildNeeded(obj, path) {
  const newPaths = [];

  function collect(o, currentPath) {
    for (const key in o) {
      if (!Object.prototype.hasOwnProperty.call(o, key)) continue;
      const value = o[key];
      const full = `${currentPath}.${key}`;
      if (value && typeof value === 'object') {
        collect(value, full);
      } else {
        newPaths.push(full);
      }
    }
  }

  collect(obj, path);

  if (newPaths.length !== valueNodes.size) return true;
  return newPaths.some((p) => !valueNodes.has(p));
}

// Update existing DOM nodes with new values
function updateValues(obj, path) {
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const fullPath = `${path}.${key}`;
    if (value && typeof value === 'object') {
      updateValues(value, fullPath);
    } else {
      const node = valueNodes.get(fullPath);
      if (node) {
        const newText = `${key}: ${JSON.stringify(value)}`;
        if (node.textContent !== newText) {
          node.textContent = newText;
        }
      }
    }
  }
}

// Helper function to render nested objects and arrays with spacing
function renderObject(obj, parent, path = '', level = 0) {
  const indentPx = 10;

  if (typeof obj !== 'object' || obj === null) {
    // Display primitive values
    const span = document.createElement('span');
    span.style.marginLeft = `${level * indentPx}px`; // Indentation for levels
    span.textContent = JSON.stringify(obj);
    parent.appendChild(span);
    return;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      const fullPath = `${path}.${key}`;

      if (obj instanceof Map) {
        // Convert Map to an object for display
        const mapObject = {};
        obj.forEach((value, key) => {
          mapObject[key] = value;
        });
        renderObject(mapObject, parent, path, level);
        return;
      }

      if (typeof obj !== 'object' || obj === null) {
        const span = document.createElement('span');
        span.style.marginLeft = `${level * indentPx}px`;
        span.textContent = JSON.stringify(obj);
        parent.appendChild(span);
        return;
      }

      if (typeof value === 'object' && value !== null) {
        // Create expandable details for objects and arrays
        const details = document.createElement('details');
        details.style.marginLeft = `${level * indentPx}px`; // Indentation for levels

        // Preserve expansion state
        if (expandedState.has(fullPath)) {
          details.open = expandedState.get(fullPath);
        } else {
          details.open = true; // Default: Expanded
        }

        // Track changes to the expansion state
        details.addEventListener('toggle', () => {
          expandedState.set(fullPath, details.open);
          saveExpandedState();
        });

        const summary = document.createElement('summary');
        summary.textContent = key;
        summary.style.cursor = 'pointer';
        summary.style.fontWeight = 'bold';
        summary.style.color = 'orange';
        if (Array.isArray(value)) {
          summary.textContent = key + '[]';
          summary.style.color = 'yellow';
        }

        if (level === 0) {
          summary.style.fontSize = '18px';
          summary.style.color = '#00ff00';
        }

        details.appendChild(summary);

        // Recursively render child objects
        renderObject(value, details, fullPath, level + 1);
        parent.appendChild(details);
      } else {
        // Display primitive properties as plain text
        const span = document.createElement('span');
        span.style.marginLeft = `${(level + 1) * indentPx}px`; // Indentation for properties
        span.textContent = `${key}: ${JSON.stringify(value)}`;
        parent.appendChild(span);
        parent.appendChild(document.createElement('br'));
        valueNodes.set(fullPath, span);
      }
    }
  }
}

export function createDebugUI(container = document.body) {
  const debugDiv = document.createElement('div');
  debugDiv.style.position = 'fixed';
  debugDiv.style.top = '0';
  debugDiv.style.left = '0';
  debugDiv.style.backgroundColor = 'black';
  debugDiv.style.color = 'white'; // For readability
  debugDiv.style.border = '1px solid black';
  debugDiv.style.padding = '10px';
  debugDiv.style.maxHeight = '100%';
  debugDiv.style.maxWidth = '350px';
  debugDiv.style.overflowY = 'scroll';
  debugDiv.style.zIndex = '9999';
  debugDiv.style.fontFamily = 'monospace';
  debugDiv.style.fontSize = '12px';
  debugDiv.classList.add('debug-ui');
  container.appendChild(debugDiv);
  return debugDiv;
}

export function createModifyUI(container = document.body) {
  const environment = import.meta.env.VITE_ENV;
  if (environment === 'production' && !isDevAccessWindowActive()) {
    return;
  }
  const modifyDiv = document.createElement('div');
  modifyDiv.className = 'modify-panel modify-ui';
  container.appendChild(modifyDiv);

  // Example: Add buttons to modify hero stats
  const heroSection = document.createElement('div');
  heroSection.innerHTML = '<h3>Hero</h3>';
  modifyDiv.appendChild(heroSection);

  // Give Attributes input and button
  const attrDiv = document.createElement('div');
  attrDiv.className = 'input-row';
  const attrInput = document.createElement('input');
  attrInput.type = 'number';
  attrInput.min = '1';
  attrInput.value = '100';
  attrInput.title = 'Number of attribute points to give';
  attrInput.className = 'input-number';
  const giveAttrsBtn = document.createElement('button');
  giveAttrsBtn.textContent = 'Give Attributes';
  giveAttrsBtn.addEventListener('click', () => {
    const val = parseInt(attrInput.value, 10);
    if (!isNaN(val) && val > 0) {
      hero.statPoints += val;
      hero.queueRecalculateFromAttributes();
      showToast(`Gave ${val} attribute point${val > 1 ? 's' : ''}!`);
    } else {
      showToast('Invalid attribute value', 'error');
    }
  });
  attrDiv.appendChild(attrInput);
  attrDiv.appendChild(giveAttrsBtn);
  heroSection.appendChild(attrDiv);

  // Gold input and button
  const goldDiv = document.createElement('div');
  goldDiv.className = 'input-row';
  const goldInput = document.createElement('input');
  goldInput.type = 'number';
  goldInput.min = '1';
  goldInput.value = '100000000';
  goldInput.title = 'Amount of gold to add';
  goldInput.className = 'input-number';
  const addGoldBtn = document.createElement('button');
  addGoldBtn.textContent = 'Add Gold';
  addGoldBtn.addEventListener('click', () => {
    const goldAmount = parseInt(goldInput.value, 10);
    if (!isNaN(goldAmount) && goldAmount > 0) {
      hero.gainGold(goldAmount);
      updateResources();
      showToast(`Added ${goldAmount} gold!`);
    } else {
      showToast('Invalid gold value', 'error');
    }
  });
  goldDiv.appendChild(goldInput);
  goldDiv.appendChild(addGoldBtn);
  heroSection.appendChild(goldDiv);

  // Crystals input and button
  const crystalsDiv = document.createElement('div');
  crystalsDiv.className = 'input-row';
  const crystalsInput = document.createElement('input');
  crystalsInput.type = 'number';
  crystalsInput.min = '1';
  crystalsInput.value = '1000';
  crystalsInput.title = 'Amount of crystals to add';
  crystalsInput.className = 'input-number';
  const addCrystalsBtn = document.createElement('button');
  addCrystalsBtn.textContent = 'Add Crystals';
  addCrystalsBtn.addEventListener('click', () => {
    const crystalsAmount = parseInt(crystalsInput.value, 10);
    if (!isNaN(crystalsAmount) && crystalsAmount > 0) {
      hero.gainCrystals(crystalsAmount);
      showToast(`Added ${crystalsAmount} crystals!`);
    } else {
      showToast('Invalid crystals value', 'error');
    }
  });
  crystalsDiv.appendChild(crystalsInput);
  crystalsDiv.appendChild(addCrystalsBtn);
  heroSection.appendChild(crystalsDiv);

  // Souls input and button
  const soulsDiv = document.createElement('div');
  soulsDiv.className = 'input-row';
  const soulsInput = document.createElement('input');
  soulsInput.type = 'number';
  soulsInput.min = '1';
  soulsInput.value = '1000';
  soulsInput.title = 'Amount of souls to add';
  soulsInput.className = 'input-number';
  const addSoulsBtn = document.createElement('button');
  addSoulsBtn.textContent = 'Add Souls';
  addSoulsBtn.addEventListener('click', () => {
    const soulsAmount = parseInt(soulsInput.value, 10);
    if (!isNaN(soulsAmount) && soulsAmount > 0) {
      hero.gainSouls(soulsAmount);
      updateResources();
      showToast(`Added ${soulsAmount} souls!`);
    } else {
      showToast('Invalid souls value', 'error');
    }
  });
  soulsDiv.appendChild(soulsInput);
  soulsDiv.appendChild(addSoulsBtn);
  heroSection.appendChild(soulsDiv);

  // Highest Stage input and button
  const highestStageDiv = document.createElement('div');
  highestStageDiv.className = 'input-row';
  const highestStageInput = document.createElement('input');
  highestStageInput.type = 'number';
  highestStageInput.min = '1';
  highestStageInput.value = statistics.highestStages[1] || 1;
  highestStageInput.title = 'Set the highest stage for all 12 stages';
  highestStageInput.className = 'input-number';
  const setHighestStageBtn = document.createElement('button');
  setHighestStageBtn.textContent = 'Set All Highest Stages';
  setHighestStageBtn.addEventListener('click', () => {
    const val = parseInt(highestStageInput.value, 10);
    if (!isNaN(val) && val > 0) {
      for (let i = 1; i <= 12; i++) {
        statistics.set('highestStages', i, val);
      }
      updateStageUI();
      dataManager.saveGame();
      showToast(`Set all 12 highest stages to ${val}!`);
    } else {
      showToast('Invalid stage value', 'error');
    }
  });
  highestStageDiv.appendChild(highestStageInput);
  highestStageDiv.appendChild(setHighestStageBtn);
  heroSection.appendChild(highestStageDiv);

  // Highest Runes Stage input and button
  const highestRunesStageDiv = document.createElement('div');
  highestRunesStageDiv.className = 'input-row';
  const highestRunesStageInput = document.createElement('input');
  highestRunesStageInput.type = 'number';
  highestRunesStageInput.min = '1';
  highestRunesStageInput.value = game.rockyFieldHighestStage || 1;
  highestRunesStageInput.title = 'Set the highest Rocky Field stage';
  highestRunesStageInput.className = 'input-number';
  const setHighestRunesStageBtn = document.createElement('button');
  setHighestRunesStageBtn.textContent = 'Set Highest Runes Stage';
  setHighestRunesStageBtn.addEventListener('click', () => {
    const val = parseInt(highestRunesStageInput.value, 10);
    if (!isNaN(val) && val > 0) {
      game.rockyFieldHighestStage = val;
      if (game.rockyFieldStage < val) {
        game.rockyFieldStage = val;
      }
      const currentHighest = statistics.get('rockyFieldHighestStages', game.rockyFieldRegion);
      statistics.set('rockyFieldHighestStages', game.rockyFieldRegion, Math.max(val, currentHighest));
      updateStageUI();
      dataManager.saveGame();
      showToast(`Set highest runes stage to ${val}!`);
    } else {
      showToast('Invalid stage value', 'error');
    }
  });
  highestRunesStageDiv.appendChild(highestRunesStageInput);
  highestRunesStageDiv.appendChild(setHighestRunesStageBtn);
  heroSection.appendChild(highestRunesStageDiv);

  // Boss Level input and button
  const bossLevelDiv = document.createElement('div');
  bossLevelDiv.className = 'input-row';
  const bossLevelInput = document.createElement('input');
  bossLevelInput.type = 'number';
  bossLevelInput.min = '1';
  bossLevelInput.value = hero.bossLevel || 1;
  bossLevelInput.title = 'Set the highest boss level';
  bossLevelInput.className = 'input-number';
  const setBossLevelBtn = document.createElement('button');
  setBossLevelBtn.textContent = 'Set Boss Level';
  setBossLevelBtn.addEventListener('click', () => {
    const val = parseInt(bossLevelInput.value, 10);
    if (!isNaN(val) && val > 0) {
      hero.bossLevel = val;
      statistics.set('highestBossLevel', null, hero.bossLevel);
      updateStageUI();
      document.dispatchEvent(new CustomEvent('bossKilled', { detail: { level: hero.bossLevel } }));
      dataManager.saveGame();
      showToast(`Set highest boss level to ${val}!`);
    } else {
      showToast('Invalid boss level value', 'error');
    }
  });
  bossLevelDiv.appendChild(bossLevelInput);
  bossLevelDiv.appendChild(setBossLevelBtn);
  heroSection.appendChild(bossLevelDiv);

  // Experience input and button
  const expDiv = document.createElement('div');
  expDiv.className = 'input-row';
  const expInput = document.createElement('input');
  expInput.type = 'number';
  expInput.min = '1';
  expInput.value = '1';
  expInput.title = 'Number of level ups';
  expInput.className = 'input-number';
  const giveExpBtn = document.createElement('button');
  giveExpBtn.textContent = 'Level Up';
  giveExpBtn.addEventListener('click', () => {
    const val = parseInt(expInput.value, 10);
    if (!isNaN(val) && val > 0) {
      hero.levelUp(val);

      updateStatsAndAttributesUI();
      hero.queueRecalculateFromAttributes();
      createCombatText(`LEVEL UP! (${hero.level})`);
      updateStatsAndAttributesUI();
      initializeSkillTreeStructure();
      dataManager.saveGame();
      updateRegionUI();
      updateTabIndicators();
      statistics.updateStatisticsUI();

      showToast(`Leveled up ${val} time${val > 1 ? 's' : ''}!`);
    } else {
      showToast('Invalid level up value', 'error');
    }
  });
  expDiv.appendChild(expInput);
  expDiv.appendChild(giveExpBtn);
  heroSection.appendChild(expDiv);

  // Example: Add buttons to modify inventory
  const inventorySection = document.createElement('div');
  inventorySection.innerHTML = '<h3>Inventory</h3>';
  modifyDiv.appendChild(inventorySection);

  // --- Add Random Item with controls ---
  const addItemControlsDiv = document.createElement('div');
  addItemControlsDiv.style.display = 'flex';
  addItemControlsDiv.style.flexDirection = 'row';
  addItemControlsDiv.style.alignItems = 'center';
  addItemControlsDiv.style.flexWrap = 'wrap';

  // Helper to group label+input compactly
  function makeControl(labelText, inputElem) {
    const group = document.createElement('div');
    group.style.display = 'flex';
    group.style.flexDirection = 'column';
    group.style.alignItems = 'flex-start';
    group.style.margin = '0 4px';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.fontSize = '11px';
    label.style.marginBottom = '2px';
    group.appendChild(label);
    group.appendChild(inputElem);
    return group;
  }

  // Item type
  const itemTypeSelect = document.createElement('select');
  itemTypeSelect.id = 'item-type-select';
  ALL_ITEM_TYPES.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    itemTypeSelect.appendChild(option);
  });
  addItemControlsDiv.appendChild(makeControl('Type', itemTypeSelect));

  // Item level
  const itemLevelInput = document.createElement('input');
  itemLevelInput.type = 'number';
  itemLevelInput.min = '1';
  itemLevelInput.max = '100';
  itemLevelInput.value = '1';
  itemLevelInput.id = 'item-level-input';
  itemLevelInput.style.width = '45px';
  addItemControlsDiv.appendChild(makeControl('Lvl', itemLevelInput));

  // Item rarity
  const raritySelect = document.createElement('select');
  raritySelect.id = 'item-rarity-select';
  Object.keys(ITEM_RARITY).forEach((rarityKey) => {
    const option = document.createElement('option');
    option.value = ITEM_RARITY[rarityKey].name;
    option.textContent = ITEM_RARITY[rarityKey].name;
    raritySelect.appendChild(option);
  });
  addItemControlsDiv.appendChild(makeControl('Rarity', raritySelect));

  // Item tier
  const tierInput = document.createElement('input');
  tierInput.type = 'number';
  tierInput.min = '1';
  tierInput.max = '12';
  tierInput.value = '1';
  tierInput.id = 'item-tier-input';
  tierInput.style.width = '45px';
  addItemControlsDiv.appendChild(makeControl('Tier', tierInput));

  // Add Random Item button
  const addItemBtn = document.createElement('button');
  addItemBtn.textContent = 'Add Random Item';
  addItemBtn.addEventListener('click', () => {
    const itemType = itemTypeSelect.value;
    const itemLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
    inventory.addItemToInventory(newItem);
    showToast(`Added ${itemType} (level ${itemLevel}, ${rarity}, tier ${tier}) to inventory`);
  });
  addItemControlsDiv.appendChild(addItemBtn);

  // Add 10x Items button (levels increment by 500)
  const add10ItemsBtn = document.createElement('button');
  add10ItemsBtn.textContent = 'Add 10x Items (+500 Lvl each)';
  add10ItemsBtn.addEventListener('click', () => {
    const itemType = itemTypeSelect.value;
    const baseLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    for (let i = 0; i < 10; i++) {
      const itemLevel = baseLevel + i * 500;
      const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
      inventory.addItemToInventory(newItem);
    }
    showToast(
      `Added 10x ${itemType} (levels ${baseLevel} to ${baseLevel + 4500}, ${rarity}, tier ${tier}) to inventory`,
    );
  });
  addItemControlsDiv.appendChild(add10ItemsBtn);

  // Generate full gear button
  const generateFullGearBtn = document.createElement('button');
  generateFullGearBtn.textContent = 'Generate full gear';
  generateFullGearBtn.addEventListener('click', () => {
    const itemLevel = parseInt(itemLevelInput.value, 10) || 1;
    const rarity = raritySelect.value;
    const tier = parseInt(tierInput.value, 10) || 1;
    let count = 0;
    ALL_ITEM_TYPES.forEach((itemType) => {
      if (itemType === 'RING') {
        for (let i = 0; i < 2; i++) {
          const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
          inventory.addItemToInventory(newItem);
          count++;
        }
      } else {
        const newItem = inventory.createItem(itemType, itemLevel, rarity, tier);
        inventory.addItemToInventory(newItem);
        count++;
      }
    });
    showToast(`Generated full gear set (${count} items, level ${itemLevel}, ${rarity}, tier ${tier})`);
  });
  addItemControlsDiv.appendChild(generateFullGearBtn);

  inventorySection.appendChild(addItemControlsDiv);

  // --- Add Material Buttons ---
  // Add Random Material
  const addRandomMaterialBtn = document.createElement('button');
  addRandomMaterialBtn.textContent = 'Add Random Material';
  addRandomMaterialBtn.addEventListener('click', () => {
    const mat = inventory.getRandomMaterial();
    inventory.addMaterial({ id: mat.id, qty: 1 });
    showToast(`Added 1 ${mat.name} to materials`);
  });
  inventorySection.appendChild(addRandomMaterialBtn);

  // Add Material by Dropdown
  const addMaterialByIdDiv = document.createElement('div');
  addMaterialByIdDiv.style.marginTop = '8px';

  // Build data-driven image dropdown for materials (native <option> can't show images reliably)
  const materialItems = Object.values(MATERIALS).map((mat) => {
    let iconUrl = '';
    try {
      if (typeof mat.icon === 'string') {
        const t = mat.icon.trim();
        if (t.startsWith('<img')) {
          const tmp = document.createElement('div');
          tmp.innerHTML = t;
          const img = tmp.querySelector('img');
          if (img) iconUrl = img.getAttribute('src') || img.src || '';
        } else if (/^(https?:|\/)/.test(t) || /\.(png|jpe?g|svg|gif)(\?|$)/i.test(t)) {
          iconUrl = t;
        }
      } else if (mat.icon && mat.icon.src) {
        iconUrl = mat.icon.src;
      }
    } catch (e) {
      iconUrl = '';
    }
    return {
      id: mat.id, text: mat.name, icon: iconUrl,
    };
  });

  // Quantity input
  const qtyInput = document.createElement('input');
  qtyInput.id = 'material-qty-input';
  qtyInput.type = 'number';
  qtyInput.min = '1';
  qtyInput.value = '1';
  qtyInput.style.width = '50px';

  // Add button
  const addBtn = document.createElement('button');
  addBtn.id = 'add-material-by-id-btn';
  addBtn.textContent = 'Add Material';

  // Create the image dropdown component
  const imgDd = createImageDropdownFromData(materialItems, materialItems[0] && materialItems[0].id);
  addMaterialByIdDiv.appendChild(imgDd.container);
  addMaterialByIdDiv.appendChild(qtyInput);
  addMaterialByIdDiv.appendChild(addBtn);
  inventorySection.appendChild(addMaterialByIdDiv);

  addBtn.onclick = () => {
    const id = imgDd.getValue();
    const qty = parseInt(qtyInput.value, 10) || 1;
    const matDef = Object.values(MATERIALS).find((m) => m.id === id);
    if (matDef) {
      inventory.addMaterial({ id: matDef.id, qty });
      showToast(`Added ${qty} ${matDef.name}${qty > 1 ? 's' : ''} to materials`);
    } else {
      showToast('Invalid material ID', 'error');
    }
  };

  // Add Rune by Dropdown
  const addRuneDiv = document.createElement('div');
  addRuneDiv.style.marginTop = '8px';

  const runeItems = RUNES.map((r) => {
    let iconUrl = '';
    try {
      if (typeof r.icon === 'string') {
        iconUrl = r.icon;
      } else if (r.icon && r.icon.src) {
        iconUrl = r.icon.src;
      }
    } catch {
      iconUrl = '';
    }
    return {
      id: r.id, text: getRuneName(r), icon: iconUrl,
    };
  });

  const runeDd = createImageDropdownFromData(runeItems, runeItems[0] && runeItems[0].id);

  const runeSearch = document.createElement('input');
  runeSearch.type = 'search';
  runeSearch.className = 'debug-rune-search';
  runeSearch.placeholder = t('runes.tabSearchPlaceholder');
  runeSearch.style.marginRight = '8px';
  runeSearch.style.padding = '4px 6px';
  runeSearch.style.borderRadius = '4px';
  runeSearch.style.border = '1px solid #555';
  runeSearch.style.background = 'rgba(0, 0, 0, 0.4)';
  runeSearch.style.color = '#fff';
  runeSearch.addEventListener('input', () => {
    const query = runeSearch.value.trim().toLowerCase();
    if (!query) {
      runeDd.setFilter();
      return;
    }
    runeDd.setFilter((item) => {
      const idMatch = item.id?.toLowerCase().includes(query);
      const textMatch = item.text?.toLowerCase().includes(query);
      return Boolean(idMatch || textMatch);
    });
  });

  const addRuneBtn = document.createElement('button');
  addRuneBtn.textContent = 'Add Rune';
  addRuneBtn.addEventListener('click', () => {
    const id = runeDd.getValue();
    if (!id) {
      showToast(t('debug.selectRuneFirst'), 'error');
      return;
    }
    const percent =
      Math.floor(Math.random() * (MAX_CONVERSION_PERCENT - MIN_CONVERSION_PERCENT + 1)) + MIN_CONVERSION_PERCENT;
    const rune = runes.addRune(id, percent);
    if (rune) {
      renderRunesUI();
      showToast(`Added ${getRuneName(rune)} rune to inventory`);
    } else {
      showToast('Invalid rune ID', 'error');
    }
  });
  addRuneDiv.appendChild(runeSearch);
  addRuneDiv.appendChild(runeDd.container);
  addRuneDiv.appendChild(addRuneBtn);
  inventorySection.appendChild(addRuneDiv);

  const extractIconSrc = (iconHtml) => {
    if (!iconHtml || typeof iconHtml !== 'string') return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = iconHtml;
    const img = tmp.querySelector('img');
    return img ? img.getAttribute('src') || img.src || '' : '';
  };

  const uniqueDiv = document.createElement('div');
  uniqueDiv.style.marginTop = '8px';
  uniqueDiv.style.display = 'flex';
  uniqueDiv.style.alignItems = 'center';
  uniqueDiv.style.flexWrap = 'wrap';

  const uniqueDefs = getUniqueItemDefinitions();
  const uniqueMap = new Map(uniqueDefs.map((def) => [def.id, def]));
  const uniqueItems = uniqueDefs
    .map((def) => ({
      id: def.id,
      text: t(def.nameKey),
      icon: extractIconSrc(ITEM_ICONS[def.type]),
    }))
    .sort((a, b) => a.text.localeCompare(b.text));

  const uniqueDd = createImageDropdownFromData(uniqueItems, uniqueItems[0] && uniqueItems[0].id);

  const uniqueSearch = document.createElement('input');
  uniqueSearch.type = 'search';
  uniqueSearch.className = 'debug-unique-search';
  uniqueSearch.placeholder = t('debug.searchUniquePlaceholder');
  uniqueSearch.style.marginRight = '8px';
  uniqueSearch.style.padding = '4px 6px';
  uniqueSearch.style.borderRadius = '4px';
  uniqueSearch.style.border = '1px solid #555';
  uniqueSearch.style.background = 'rgba(0, 0, 0, 0.4)';
  uniqueSearch.style.color = '#fff';
  uniqueSearch.addEventListener('input', () => {
    const query = uniqueSearch.value.trim().toLowerCase();
    if (!query) {
      uniqueDd.setFilter();
      return;
    }
    uniqueDd.setFilter((item) => {
      const idMatch = item.id?.toLowerCase().includes(query);
      const textMatch = item.text?.toLowerCase().includes(query);
      return Boolean(idMatch || textMatch);
    });
  });

  const uniqueTierInput = document.createElement('input');
  uniqueTierInput.type = 'number';
  uniqueTierInput.min = '1';
  uniqueTierInput.max = '12';
  uniqueTierInput.value = '1';
  uniqueTierInput.style.width = '55px';
  const uniqueTierControl = makeControl('Tier', uniqueTierInput);

  const uniqueLevelInput = document.createElement('input');
  uniqueLevelInput.type = 'number';
  uniqueLevelInput.min = '0';
  uniqueLevelInput.value = '1';
  uniqueLevelInput.style.width = '55px';
  const uniqueLevelControl = makeControl('Level', uniqueLevelInput);

  const addUniqueBtn = document.createElement('button');
  addUniqueBtn.textContent = t('debug.addUniqueItem');
  addUniqueBtn.addEventListener('click', () => {
    const id = uniqueDd.getValue();
    if (!id) {
      showToast(t('debug.selectUniqueFirst'), 'error');
      return;
    }
    const tier = Math.min(12, Math.max(1, Math.round(parseInt(uniqueTierInput.value, 10) || 1)));
    const level = Math.max(0, Math.round(parseInt(uniqueLevelInput.value, 10) || 1));
    const uniqueDef = uniqueMap.get(id);
    const item = createUniqueItemById(id, tier, level);
    if (!item) {
      showToast(t('debug.invalidUnique'), 'error');
      return;
    }
    inventory.addItemToInventory(item);
    showToast(tp('debug.addedUniqueItem', { name: t(uniqueDef.nameKey), tier }));
  });

  uniqueDiv.appendChild(uniqueSearch);
  uniqueDiv.appendChild(uniqueDd.container);
  uniqueDiv.appendChild(uniqueTierControl);
  uniqueDiv.appendChild(uniqueLevelControl);
  uniqueDiv.appendChild(addUniqueBtn);
  inventorySection.appendChild(uniqueDiv);

  const setDiv = document.createElement('div');
  setDiv.style.marginTop = '8px';
  setDiv.style.display = 'flex';
  setDiv.style.alignItems = 'center';
  setDiv.style.flexWrap = 'wrap';

  const setDefs = getItemSetDefinitions();
  const setMap = new Map(setDefs.map((set) => [set.id, set]));
  const setItems = setDefs
    .map((set) => ({ id: set.id, text: t(set.nameKey) }))
    .sort((a, b) => a.text.localeCompare(b.text));

  const setDd = createImageDropdownFromData(setItems, setItems[0] && setItems[0].id);

  const setSearch = document.createElement('input');
  setSearch.type = 'search';
  setSearch.className = 'debug-set-search';
  setSearch.placeholder = t('debug.searchSetPlaceholder');
  setSearch.style.marginRight = '8px';
  setSearch.style.padding = '4px 6px';
  setSearch.style.borderRadius = '4px';
  setSearch.style.border = '1px solid #555';
  setSearch.style.background = 'rgba(0, 0, 0, 0.4)';
  setSearch.style.color = '#fff';
  setSearch.addEventListener('input', () => {
    const query = setSearch.value.trim().toLowerCase();
    if (!query) {
      setDd.setFilter();
      return;
    }
    setDd.setFilter((item) => {
      const idMatch = item.id?.toLowerCase().includes(query);
      const textMatch = item.text?.toLowerCase().includes(query);
      return Boolean(idMatch || textMatch);
    });
  });

  const setTierInput = document.createElement('input');
  setTierInput.type = 'number';
  setTierInput.min = '1';
  setTierInput.max = '12';
  setTierInput.value = '1';
  setTierInput.style.width = '55px';
  const setTierControl = makeControl('Tier', setTierInput);

  const setLevelInput = document.createElement('input');
  setLevelInput.type = 'number';
  setLevelInput.min = '0';
  setLevelInput.value = '1';
  setLevelInput.style.width = '55px';
  const setLevelControl = makeControl('Level', setLevelInput);

  const addSetBtn = document.createElement('button');
  addSetBtn.textContent = t('debug.addSetItems');
  addSetBtn.addEventListener('click', () => {
    const id = setDd.getValue();
    if (!id) {
      showToast(t('debug.selectSetFirst'), 'error');
      return;
    }
    const tier = Math.min(12, Math.max(1, Math.round(parseInt(setTierInput.value, 10) || 1)));
    const level = Math.max(0, Math.round(parseInt(setLevelInput.value, 10) || 1));
    const setDef = setMap.get(id);
    const items = createSetItemsById(id, tier, level);
    if (!items.length) {
      showToast(t('debug.invalidSet'), 'error');
      return;
    }
    items.forEach((item) => inventory.addItemToInventory(item));
    showToast(tp('debug.addedSetItems', {
      name: t(setDef.nameKey), count: items.length, tier,
    }));
  });

  setDiv.appendChild(setSearch);
  setDiv.appendChild(setDd.container);
  setDiv.appendChild(setTierControl);
  setDiv.appendChild(setLevelControl);
  setDiv.appendChild(addSetBtn);
  inventorySection.appendChild(setDiv);

  // Example: Add buttons to modify skill tree
  const skillTreeSection = document.createElement('div');
  skillTreeSection.innerHTML = '<h3>Skill Tree</h3>';
  modifyDiv.appendChild(skillTreeSection);

  const addSkillPointBtn = document.createElement('button');
  addSkillPointBtn.textContent = 'Add 100 Skill Points';
  addSkillPointBtn.addEventListener('click', () => {
    skillTree.addSkillPoints(100);
  });
  skillTreeSection.appendChild(addSkillPointBtn);

  // Example: Add buttons to modify ascension
  const ascensionSection = document.createElement('div');
  ascensionSection.innerHTML = '<h3>Ascension</h3>';
  modifyDiv.appendChild(ascensionSection);

  const addAscensionPointBtn = document.createElement('button');
  addAscensionPointBtn.textContent = 'Add 100 Ascension Points';
  addAscensionPointBtn.addEventListener('click', () => {
    ascension.points += 100;
    updateAscensionUI();
    showToast('Added 100 ascension points!');
  });
  ascensionSection.appendChild(addAscensionPointBtn);

  // Enable Ascension by setting prestiges to 20
  const enableAscensionBtn = document.createElement('button');
  enableAscensionBtn.textContent = 'Enable Ascension (20 Prestiges)';
  enableAscensionBtn.title = 'Sets prestige count to 20 so Ascend can be used immediately.';
  enableAscensionBtn.addEventListener('click', () => {
    const before = prestige.prestigeCount || 0;
    if (before < 20) {
      prestige.prestigeCount = 20;
      dataManager.saveGame();
      updateAscensionUI();
      updateTabIndicators();
      showToast('Prestige count set to 20 for Ascension.');
    } else {
      updateAscensionUI();
      showToast('Already eligible to Ascend (>= 20 prestiges).');
    }
  });
  ascensionSection.appendChild(enableAscensionBtn);

  // Example: Add buttons to modify training
  const trainingSection = document.createElement('div');
  trainingSection.innerHTML = '<h3>Training</h3>';
  modifyDiv.appendChild(trainingSection);

  const resetTrainingBtn = document.createElement('button');
  resetTrainingBtn.textContent = 'Reset Training';
  resetTrainingBtn.addEventListener('click', () => {
    training.reset();
    training.updateTrainingUI('gold-upgrades');
    training.updateTrainingUI('crystal-upgrades');
    hero.queueRecalculateFromAttributes();
    updatePlayerLife();
  });
  trainingSection.appendChild(resetTrainingBtn);

  // Button to reset all progress
  const resetProgressBtn = document.createElement('button');
  resetProgressBtn.textContent = 'Reset All Progress';
  resetProgressBtn.addEventListener('click', () => {
    game.resetAllProgress();
  });
  modifyDiv.appendChild(resetProgressBtn);

  // Example: Add buttons to modify training
  const dataManagementSection = document.createElement('div');
  dataManagementSection.innerHTML = '<h3>Data Management</h3>';
  modifyDiv.appendChild(dataManagementSection);

  // Button: Copy Decrypted Save to Clipboard
  const copyDecryptedBtn = document.createElement('button');
  copyDecryptedBtn.textContent = 'Copy Decrypted Save';
  copyDecryptedBtn.title = 'Decrypts your current save and copies the JSON to clipboard.';
  copyDecryptedBtn.addEventListener('click', async () => {
    try {
      const slots = {};
      for (let i = 0; i < 5; i++) {
        const raw = localStorage.getItem(`gameProgress_${i}`);
        if (raw) {
          try {
            let dec = crypt.decrypt(raw);
            if (typeof dec === 'string') dec = JSON.parse(dec);
            slots[i] = dec;
          } catch {
            slots[i] = null;
          }
        }
      }
      const slotKeys = Object.keys(slots);
      if (slotKeys.length === 0) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      const currentSlot = dataManager.getCurrentSlot();
      const toCopy = slotKeys.length > 1 ? { slots, currentSlot } : slots[currentSlot] || slots[slotKeys[0]];
      await navigator.clipboard.writeText(JSON.stringify(toCopy, null, 2));
      showToast('Decrypted save copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy decrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(copyDecryptedBtn);

  // Button: Paste Decrypted Save from Clipboard (encrypts and saves)
  const pasteDecryptedBtn = document.createElement('button');
  pasteDecryptedBtn.textContent = 'Paste Decrypted Save';
  pasteDecryptedBtn.title = 'Reads decrypted JSON from clipboard, encrypts it, and saves to localStorage.';
  pasteDecryptedBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showToast('Clipboard is empty', 'error');
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        showToast('Clipboard does not contain valid JSON', 'error');
        return;
      }
      if (parsed && parsed.slots) {
        const currentSlot = parsed.currentSlot ?? 0;
        for (const [slot, data] of Object.entries(parsed.slots)) {
          if (!data) continue;
          const enc = crypt.encrypt(JSON.stringify(data));
          localStorage.setItem(`gameProgress_${slot}`, enc);
          if (parseInt(slot, 10) === currentSlot) {
            localStorage.setItem('gameProgress', enc);
          }
        }
        localStorage.setItem('gameCurrentSlot', currentSlot);
      } else {
        const encrypted = crypt.encrypt(JSON.stringify(parsed));
        const slot = dataManager.getCurrentSlot();
        localStorage.setItem('gameProgress', encrypted);
        localStorage.setItem(`gameProgress_${slot}`, encrypted);
      }
      window.location.reload();
      showToast('Decrypted save encrypted and saved to localStorage!');
    } catch (e) {
      showToast('Failed to paste decrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(pasteDecryptedBtn);

  // Button: Copy Encrypted Save to Clipboard (with quotes)
  const copyEncryptedWithQuotesBtn = document.createElement('button');
  copyEncryptedWithQuotesBtn.textContent = 'Copy Encrypted Save (with quotes)';
  copyEncryptedWithQuotesBtn.title = 'Copies the encrypted save from localStorage to clipboard, wrapped in quotes.';
  copyEncryptedWithQuotesBtn.addEventListener('click', async () => {
    try {
      const slots = {};
      for (let i = 0; i < 5; i++) {
        const raw = localStorage.getItem(`gameProgress_${i}`);
        if (raw) slots[i] = raw;
      }
      const slotKeys = Object.keys(slots);
      if (slotKeys.length === 0) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      const currentSlot = dataManager.getCurrentSlot();
      if (slotKeys.length > 1) {
        await navigator.clipboard.writeText(JSON.stringify({ slots, currentSlot }, null, 2));
      } else {
        const enc = slots[currentSlot] || slots[slotKeys[0]];
        await navigator.clipboard.writeText('"' + enc + '"');
      }
      showToast('Encrypted save (with quotes) copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy encrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(copyEncryptedWithQuotesBtn);

  // Button: Paste Encrypted Save from Clipboard (saves directly)
  const pasteEncryptedBtn = document.createElement('button');
  pasteEncryptedBtn.textContent = 'Paste Encrypted Save';
  pasteEncryptedBtn.title = 'Reads encrypted text from clipboard and saves it directly to localStorage.';
  pasteEncryptedBtn.addEventListener('click', async () => {
    try {
      let encrypted = await navigator.clipboard.readText();
      if (!encrypted) {
        showToast('Clipboard is empty', 'error');
        return;
      }
      let parsed;
      try {
        parsed = JSON.parse(encrypted);
      } catch {
        parsed = null;
      }
      if (parsed && parsed.slots) {
        const currentSlot = parsed.currentSlot ?? 0;
        for (const [slot, enc] of Object.entries(parsed.slots)) {
          if (!enc) continue;
          localStorage.setItem(`gameProgress_${slot}`, enc);
          if (parseInt(slot, 10) === currentSlot) {
            localStorage.setItem('gameProgress', enc);
          }
        }
        localStorage.setItem('gameCurrentSlot', currentSlot);
      } else {
        // Remove quotes if present at start and end
        if (encrypted.length > 1 && encrypted.startsWith('"') && encrypted.endsWith('"')) {
          encrypted = encrypted.slice(1, -1);
        }
        localStorage.setItem('gameProgress', encrypted);
        localStorage.setItem(`gameProgress_${dataManager.getCurrentSlot()}`, encrypted);
      }
      window.location.reload();
      showToast('Encrypted save pasted to localStorage!');
    } catch (e) {
      showToast('Failed to paste encrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(pasteEncryptedBtn);
}
