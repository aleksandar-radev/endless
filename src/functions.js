import { game, hero, inventory, training, skillTree, dataManager, statistics } from './globals.js';
import { MATERIALS } from './constants/materials.js';
import SimpleCrypto from 'simple-crypto-js';
import { showToast, updatePlayerLife, updateResources, updateStageUI } from './ui/ui.js';
import { ITEM_RARITY, ITEM_TYPES } from './constants/items.js';

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

  document.addEventListener('keydown', (event) => {
    keySequence.push(event.key.toLowerCase());
    if (keySequence.length > toggleSequence.length) {
      keySequence.shift();
    }
    if (keySequence.join('') === toggleSequence.join('')) {
      dev = !dev;
      console.log(`Dev mode is now ${dev ? 'enabled' : 'disabled'}.`);
      if (dev) {
        document.body.classList.add('dev-active');
        createDebugUI();
        saveExpandedState(expandedState);
        createModifyUI();

        // Initial update and monitor changes
        updateDebugUI();
        debugUiInterval = setInterval(updateDebugUI, 1000);
        saveGameInterval = setInterval(dataManager.saveGame, 1000);
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
        valueNodes.clear();
        lastEncryptedSave = null;
      }
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

export function createDebugUI() {
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
  document.body.appendChild(debugDiv);
}

export function createModifyUI() {
  if (import.meta.env.VITE_ENV == 'production') {
    return;
  }
  const modifyDiv = document.createElement('div');
  modifyDiv.className = 'modify-panel modify-ui';
  document.body.appendChild(modifyDiv);

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
      hero.recalculateFromAttributes();
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
      updateResources();
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
      hero.recalculateFromAttributes();
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
  Object.keys(ITEM_TYPES).forEach((type) => {
    const option = document.createElement('option');
    option.value = ITEM_TYPES[type];
    option.textContent = ITEM_TYPES[type];
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
    Object.values(ITEM_TYPES).forEach((itemType) => {
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

  // Create dropdown for all materials
  const materialSelect = document.createElement('select');
  materialSelect.id = 'material-id-select';
  Object.values(MATERIALS).forEach((mat) => {
    const option = document.createElement('option');
    option.value = mat.id;
    option.innerHTML = `${mat.icon} ${mat.name}`;
    materialSelect.appendChild(option);
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

  addMaterialByIdDiv.appendChild(materialSelect);
  addMaterialByIdDiv.appendChild(qtyInput);
  addMaterialByIdDiv.appendChild(addBtn);
  inventorySection.appendChild(addMaterialByIdDiv);

  addBtn.onclick = () => {
    const id = materialSelect.value;
    const qty = parseInt(qtyInput.value, 10) || 1;
    const matDef = Object.values(MATERIALS).find((m) => m.id === id);
    if (matDef) {
      inventory.addMaterial({ id: matDef.id, qty });
      showToast(`Added ${qty} ${matDef.name}${qty > 1 ? 's' : ''} to materials`);
    } else {
      showToast('Invalid material ID', 'error');
    }
  };

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
    hero.recalculateFromAttributes();
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
      const encrypted = localStorage.getItem('gameProgress');
      if (!encrypted) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      const decrypted = crypt.decrypt(encrypted);
      await navigator.clipboard.writeText(JSON.stringify(decrypted, null, 2));
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
      const encrypted = crypt.encrypt(JSON.stringify(parsed));
      localStorage.setItem('gameProgress', encrypted);
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
      const encrypted = localStorage.getItem('gameProgress');
      if (!encrypted) {
        showToast('No save found in localStorage', 'error');
        return;
      }
      await navigator.clipboard.writeText('"' + encrypted + '"');
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
      // Remove quotes if present at start and end
      if (encrypted.length > 1 && encrypted.startsWith('"') && encrypted.endsWith('"')) {
        encrypted = encrypted.slice(1, -1);
      }
      localStorage.setItem('gameProgress', encrypted);
      window.location.reload();
      showToast('Encrypted save pasted to localStorage!');
    } catch (e) {
      showToast('Failed to paste encrypted save', 'error');
      console.error(e);
    }
  });
  dataManagementSection.appendChild(pasteEncryptedBtn);
}
