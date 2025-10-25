import { STATS } from '../constants/stats/stats.js';
import { CLASS_PATHS, SKILL_TREES } from '../constants/skills.js';
import { SKILL_LEVEL_TIERS } from '../skillTree.js';
import { SKILLS_MAX_QTY } from '../constants/limits.js';
import { skillTree, hero, crystalShop, options, dataManager } from '../globals.js';
import { formatNumber, formatStatName, hideTooltip, positionTooltip, showToast, showTooltip, updateResources } from './ui.js';
import { t } from '../i18n.js';
import { createModal, closeModal } from './modal.js';

const html = String.raw;

const shouldShowStatValue = (stat) => STATS[stat]?.showValue !== false;
const getStatDecimals = (stat) => STATS[stat]?.decimalPlaces || 0;
const formatSignedValue = (value, decimals, includeZero = true) => {
  const shouldShowPlus = value > 0 || (includeZero && value === 0);
  return `${shouldShowPlus ? '+' : ''}${value.toFixed(decimals)}`;
};

const SKILL_CATEGORY_TRANSLATIONS = {
  attack: 'skillTree.skillCategory.attack',
  spell: 'skillTree.skillCategory.spell',
};

let cleanupSkillTreeHeaderFloating = null;
let updateSkillTreeHeaderFloating = null;
let skillBulkButton = null;
let skillBulkCostEl = null;

function updateSkillBulkCostDisplay() {
  if (!options?.bulkBuy || !skillBulkButton || !skillBulkCostEl) return;
  const { totalCost, affordable } = skillTree.calculateBulkAllocation(skillTree.quickQty);
  skillBulkCostEl.textContent = `${t('skillTree.cost')}: ${formatNumber(totalCost)} ${t('skillTree.skillPointsLabel')}`;
  skillBulkCostEl.classList.toggle('unaffordable', !affordable);
  skillBulkButton.disabled = totalCost === 0 || !affordable;
}

function resolveSkillCategoryLabel(skill) {
  if (!skill) return '';
  const categorySource = skill.skill_type ?? skill.skillType;
  const resolvedCategory =
    typeof categorySource === 'function' ? categorySource() : categorySource;
  if (!resolvedCategory) return '';
  const normalized = `${resolvedCategory}`.toLowerCase();
  const translationKey = SKILL_CATEGORY_TRANSLATIONS[normalized];
  if (translationKey) {
    return t(translationKey);
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatSkillTypeBadge(skill) {
  if (!skill?.type) return '';
  const primaryType = `${skill.type().toUpperCase()}`;
  const categoryLabel = resolveSkillCategoryLabel(skill);
  if (categoryLabel) {
    return `${primaryType} - ${categoryLabel}`;
  }
  return primaryType;
}

export function initializeSkillTreeUI() {
  const container = document.getElementById('skilltree');
  // Ensure class-selection and skill-tree-container exist
  let classSelection = document.getElementById('class-selection');
  let skillTreeContainer = document.getElementById('skill-tree-container');
  if (!classSelection) {
    classSelection = document.createElement('div');
    classSelection.id = 'class-selection';
    classSelection.className = 'class-selection';
    container.appendChild(classSelection);
  }
  if (!skillTreeContainer) {
    skillTreeContainer = document.createElement('div');
    skillTreeContainer.id = 'skill-tree-container';
    skillTreeContainer.className = 'skill-tree-container hidden';
    container.appendChild(skillTreeContainer);
  }

  if (!skillTree.selectedPath) {
    classSelection.classList.remove('hidden');
    skillTreeContainer.classList.add('hidden');
    showClassSelection();
  } else {
    classSelection.classList.add('hidden');
    skillTreeContainer.classList.remove('hidden');
    showSkillTree();
  }

  updateSkillTreeValues();
  updateActionBar();
}

function showClassSelection() {
  const classSelection = document.getElementById('class-selection');
  classSelection.innerHTML = '';

  Object.entries(CLASS_PATHS).forEach(([pathId, pathData]) => {
    if (!pathData.enabled) return;
    const pathElement = document.createElement('div');
    pathElement.className = 'class-path';

    // Avatar + name/description row
    pathElement.innerHTML = html`
      <div style="display: flex; align-items: flex-start; gap: 18px;">
        <img
          src="${import.meta.env.VITE_BASE_PATH}/avatars/${pathData.avatar()}"
          alt="${pathData.name()} Avatar"
          style="width: 72px; height: 72px; border-radius: 8px; object-fit: cover; background: #222;"
        />
        <div style="flex: 1;">
          <h3>${pathData.name()}</h3>
          <p>${pathData.description()}</p>
        </div>
      </div>
      <div class="base-stats" style="margin-top: 15px;">
        ${Object.entries(pathData.baseStats())
    .map(([stat, value]) => {
      let readableStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
      let displayValue = value;
      if (stat.endsWith('Percent')) {
        readableStat = readableStat.replace(/ Percent$/, '');
        displayValue = `${value}%`;
      }
      const prefix = value > 0 ? '+' : '';
      return `<div>${readableStat}: ${prefix}${displayValue}</div>`;
    })
    .join('')}
      </div>
    `;

    const button = document.createElement('button');
    const reqLevel = pathData.requiredLevel();
    const cost = pathData.crystalCost();
    const alreadyUnlocked = skillTree.unlockedPaths && skillTree.unlockedPaths.includes(pathId);
    let btnText;
    if (alreadyUnlocked) {
      btnText = hero.level < reqLevel ? `Requires Level ${reqLevel}` : 'Select Class';
    } else if (hero.level < reqLevel) {
      btnText = `Requires Level ${reqLevel}` + (cost > 0 ? ` & ${cost} Crystal${cost !== 1 ? 's' : ''}` : '');
    } else if (hero.crystals < cost) {
      btnText = `Requires ${cost} Crystal${cost !== 1 ? 's' : ''}`;
    } else {
      btnText = cost > 0 ? `Select Class (Cost: ${cost} Crystal${cost !== 1 ? 's' : ''})` : 'Select Class';
    }
    button.textContent = btnText;
    button.addEventListener('click', () => openClassPreview(pathId));
    pathElement.appendChild(button);

    classSelection.appendChild(pathElement);
  });
}

function openClassPreview(pathId) {
  const pathData = CLASS_PATHS[pathId];
  const content = html`
    <div class="class-preview-wrapper">
      <button class="modal-close">&times;</button>
      <div class="class-preview-header">
        <h2>${pathData.name()}</h2>
      </div>
      <div class="class-preview-tree"></div>
      <div class="class-preview-footer">
        <button class="select-class-btn">Select Class</button>
      </div>
    </div>
  `;
  const modal = createModal({ id: 'class-preview-modal', className: 'class-preview-modal', content });
  buildClassPreviewTree(pathId, modal.querySelector('.class-preview-tree'));
  modal.querySelectorAll('.select-class-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal('class-preview-modal');
      selectClassPath(pathId);
    });
  });
}

function selectClassPath(pathId) {
  if (skillTree.selectPath(pathId)) {
    // Update crystals and other resources display
    updateResources();
    document.getElementById('class-selection').classList.add('hidden');
    document.getElementById('skill-tree-container').classList.remove('hidden');
    showSkillTree();
    initializeSkillTreeUI();
  }
}

function buildClassPreviewTree(pathId, container) {
  container.innerHTML = '';
  const skills = SKILL_TREES[pathId];
  const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
    acc[level] = [];
    return acc;
  }, {});

  Object.values(skills).forEach((skill) => {
    const reqLevel = skill.requiredLevel();
    if (!levelGroups[reqLevel]) levelGroups[reqLevel] = [];
    levelGroups[reqLevel].push(skill);
  });

  Object.entries(levelGroups).forEach(([reqLevel, groupSkills]) => {
    if (groupSkills.length === 0) return;
    const levelLabel = document.createElement('div');
    levelLabel.className = 'level-requirement';
    levelLabel.textContent = `Level ${reqLevel}`;
    container.appendChild(levelLabel);

    const rowElement = document.createElement('div');
    rowElement.className = 'skill-row';
    groupSkills.forEach((skill) => {
      const skillElement = createPreviewSkillElement(skill);
      rowElement.appendChild(skillElement);
    });
    container.appendChild(rowElement);
  });
}

function createPreviewSkillElement(skill) {
  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type();

  skillElement.innerHTML = html`
    <div
      class="skill-icon"
      style="background-image: url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')"
    ></div>
    <div class="skill-level">0${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}</div>
  `;

  skillElement.addEventListener('mouseenter', (e) => showTooltip(createPreviewTooltip(skill), e));
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);

  return skillElement;
}

function createPreviewTooltip(skill) {
  const currentLevel = 0;
  const effectsCurrent = skill.effect(currentLevel);
  const nextLevel = currentLevel + 1;
  const effectsNext = skill.effect(nextLevel);

  const typeBadge = formatSkillTypeBadge(skill);

  let skillDescription = `
      <strong>${skill.name()} [${typeBadge}]</strong><br>
      ${skill
    .description()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('<br>')}
      <br>
      Level: ${currentLevel}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}
    `;

  if (skill.manaCost) {
    const manaCost = skill.manaCost(currentLevel);
    const manaCostNextLevel = skill.manaCost(nextLevel);
    if (manaCost) {
      const diff = manaCostNextLevel - manaCost;
      skillDescription += `<br />Mana Cost: ${manaCost.toFixed(2)} (+${diff.toFixed(2)})`;
    }
  }
  if (skill.cooldown) {
    const cooldown = skill.cooldown(currentLevel);
    const cooldownNextLevel = skill.cooldown(nextLevel);
    if (cooldown) {
      skillDescription += `<br />Cooldown: ${(cooldown / 1000).toFixed(2)}s (${(cooldownNextLevel - cooldown) / 1000}s)`;
    }
  }
  if (skill.duration) {
    const duration = skill.duration(currentLevel);
    const durationNextLevel = skill.duration(nextLevel);
    if (duration) {
      skillDescription += `<br />Duration: ${(duration / 1000).toFixed(2)}s (+${(durationNextLevel - duration) / 1000}s)`;
    }
  }

  if (effectsCurrent && Object.keys(effectsCurrent).length > 0) {
    skillDescription += '<br /><u>Current Effects:</u><br />';
    Object.entries(effectsCurrent).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      const formattedValue = formatSignedValue(value, decimals, false);
      skillDescription += `${formatStatName(stat)}: ${formattedValue}<br />`;
    });
  }

  if (skill.type() === 'summon') {
    const summonStats = skill.summonStats(currentLevel);
    skillDescription += '<br /><u>Summon Stats:</u><br />';
    Object.entries(summonStats).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      skillDescription += `${formatStatName(stat)}: ${value.toFixed(decimals)}<br />`;
    });
  } else if (currentLevel < skill.maxLevel() || skill.maxLevel() === Infinity) {
    skillDescription += '<br /><u>Next Level Effects:</u><br />';
    Object.entries(effectsNext).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      const currentValue = effectsCurrent[stat] || 0;
      const difference = value - currentValue;
      skillDescription += `${formatStatName(stat)}: ${formatSignedValue(
        value,
        decimals,
        false,
      )} <span class="bonus">(${formatSignedValue(difference, decimals)})</span><br />`;
    });
  }

  return skillDescription;
}

export function initializeSkillTreeStructure() {
  if (!skillTree.selectedPath) {
    cleanupSkillTreeHeaderFloating?.();
    return;
  }
  const container = document.getElementById('skill-tree-container');
  container.innerHTML = '';

  const skillPointsHeader = document.createElement('div');
  skillPointsHeader.className = 'skill-points-header';
  container.appendChild(skillPointsHeader);

  const noLvlRestriction = false;

  const skills = SKILL_TREES[skillTree.selectedPath.name];
  const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
    if (level <= hero.level || noLvlRestriction) {
      acc[level] = [];
    }
    return acc;
  }, {});

  Object.entries(skills).forEach(([skillId, skillData]) => {
    if (noLvlRestriction || (skillData.requiredLevel() <= hero.level && levelGroups[skillData.requiredLevel()])) {
      levelGroups[skillData.requiredLevel()].push({ id: skillId, ...skillData });
    }
  });

  Object.entries(levelGroups).forEach(([reqLevel, groupSkills]) => {
    if (groupSkills.length > 0) {
      const rowElement = document.createElement('div');
      rowElement.className = 'skill-row';

      const levelLabel = document.createElement('div');
      levelLabel.className = 'level-requirement';
      levelLabel.textContent = `Level ${reqLevel}`;
      container.appendChild(levelLabel);

      groupSkills.forEach((skill) => {
        const skillElement = createSkillElement(skill);
        rowElement.appendChild(skillElement);
      });

      container.appendChild(rowElement);
    }
  });
  updateSkillTreeValues();
  // --- Auto-cast toggles for instant/buff skills ---
  renderAutoCastToggles();
  // --- Slot Display Toggles ---
  renderDisplayToggles();
  setupSkillTreeFloatingHeader(container, skillPointsHeader);
}

function renderAutoCastToggles() {
  const container = document.getElementById('skill-tree-container');
  let autoCastSection = document.getElementById('auto-cast-section');
  if (autoCastSection) autoCastSection.remove();

  // Only show if player owns the upgrade
  if (!crystalShop.hasAutoSpellCastUpgrade()) return;

  // Only show if there are any instant/buff skills unlocked
  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return base && (base.type() === 'instant' || base.type() === 'buff' || base.type() === 'summon') && skill.level > 0;
    })
    .map(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return { ...base, id: skillId };
    });

  if (eligibleSkills.length === 0) return;

  autoCastSection = document.createElement('div');
  autoCastSection.id = 'auto-cast-section';
  autoCastSection.style.marginTop = '32px';
  autoCastSection.innerHTML = '<h3 style="margin-bottom:8px;">Auto-Cast Settings</h3>';

  eligibleSkills.forEach((skill) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'auto-cast-switch';
    wrapper.style.alignItems = 'center';
    wrapper.style.marginBottom = '6px';

    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.width = '28px';
    icon.style.height = '28px';
    icon.style.backgroundImage = `url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')`;
    icon.style.marginRight = '8px';
    wrapper.appendChild(icon);

    const label = document.createElement('label');
    label.textContent = skill.name();
    label.style.marginRight = '8px';
    wrapper.appendChild(label);

    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = skillTree.isAutoCastEnabled(skill.id);
    toggle.addEventListener('change', (e) => {
      // Only allow toggling if upgrade is owned
      if (crystalShop.hasAutoSpellCastUpgrade()) {
        skillTree.setAutoCast(skill.id, e.target.checked);
      } else {
        e.preventDefault();
        showToast(t('skillTree.purchaseAutoCastWarning'), 'warning');
        toggle.checked = false;
      }
    });
    wrapper.appendChild(toggle);

    autoCastSection.appendChild(wrapper);
  });

  container.appendChild(autoCastSection);
}

// --- Slot Display Toggles ---
function renderDisplayToggles() {
  const container = document.getElementById('skill-tree-container');
  let displaySection = document.getElementById('display-section');
  if (displaySection) displaySection.remove();

  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([id, data]) => {
      const base = skillTree.getSkill(id);
      return base && base.type() !== 'passive' && data.level > 0;
    })
    .map(([id]) => ({ ...skillTree.getSkill(id), id }));
  if (eligibleSkills.length === 0) return;

  displaySection = document.createElement('div');
  displaySection.id = 'display-section';
  displaySection.innerHTML = '<h3 style="margin-bottom:8px;">Slot Display Settings</h3>';

  eligibleSkills.forEach((skill) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'display-switch';
    const icon = document.createElement('div');
    icon.className = 'skill-icon';
    icon.style.width = '28px';
    icon.style.height = '28px';
    icon.style.backgroundImage = `url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')`;
    icon.style.marginRight = '8px';
    wrapper.appendChild(icon);
    const label = document.createElement('label');
    label.textContent = skill.name();
    label.style.marginRight = '8px';
    wrapper.appendChild(label);
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.checked = skillTree.isDisplayEnabled(skill.id);
    toggle.addEventListener('change', (e) => {
      skillTree.setDisplay(skill.id, e.target.checked);
      updateActionBar();
    });
    wrapper.appendChild(toggle);
    displaySection.appendChild(wrapper);
  });
  container.appendChild(displaySection);
}

function setupSkillTreeFloatingHeader(container, header) {
  cleanupSkillTreeHeaderFloating?.();
  updateSkillTreeHeaderFloating = null;

  if (!container || !header) {
    cleanupSkillTreeHeaderFloating = null;
    updateSkillTreeHeaderFloating = null;
    return;
  }

  const tabPanel = container.closest('.tab-panel');
  const scrollTargets = [window];
  if (tabPanel) scrollTargets.push(tabPanel);

  const getNumericVar = (styles, property, fallback = 0) => {
    const raw = styles.getPropertyValue(property);
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const updateFloatingHeader = () => {
    if (!document.body.contains(container) || !document.body.contains(header)) {
      cleanupSkillTreeHeaderFloating?.();
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(container);
    const headerStyles = window.getComputedStyle(header);

    const basePadding = getNumericVar(containerStyles, '--skill-tree-base-padding', 0);
    const headerGap = getNumericVar(
      containerStyles,
      '--skill-tree-header-gap',
      parseFloat(headerStyles.marginBottom) || 0,
    );
    const fixedOffset = getNumericVar(containerStyles, '--skill-tree-header-fixed-offset', 0);
    const headerHeight = header.offsetHeight;

    const headerTopInFlow = containerRect.top + basePadding;
    const contentBottom = containerRect.bottom - basePadding;
    const shouldFix = headerTopInFlow <= fixedOffset && contentBottom > fixedOffset + headerHeight;

    if (shouldFix) {
      const contentLeft = containerRect.left + basePadding;
      const contentWidth = Math.max(containerRect.width - basePadding * 2, 0);
      const totalSpace = headerHeight + headerGap;

      header.classList.add('skill-points-header--fixed');
      header.style.setProperty('--skill-tree-header-fixed-left', `${contentLeft}px`);
      header.style.setProperty('--skill-tree-header-fixed-width', `${contentWidth}px`);
      container.style.setProperty('--skill-tree-floating-header-space', `${totalSpace}px`);
    } else {
      header.classList.remove('skill-points-header--fixed');
      header.style.removeProperty('--skill-tree-header-fixed-left');
      header.style.removeProperty('--skill-tree-header-fixed-width');
      container.style.setProperty('--skill-tree-floating-header-space', '0px');
    }
  };

  const scrollListener = { passive: true };
  scrollTargets.forEach((target) => target.addEventListener('scroll', updateFloatingHeader, scrollListener));
  window.addEventListener('resize', updateFloatingHeader);

  const resizeObservers = [];
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(updateFloatingHeader);
    observer.observe(container);
    observer.observe(header);
    resizeObservers.push(observer);
  }

  updateSkillTreeHeaderFloating = updateFloatingHeader;
  updateFloatingHeader();

  cleanupSkillTreeHeaderFloating = () => {
    scrollTargets.forEach((target) => target.removeEventListener('scroll', updateFloatingHeader));
    window.removeEventListener('resize', updateFloatingHeader);
    resizeObservers.forEach((observer) => observer.disconnect());
    container.style.setProperty('--skill-tree-floating-header-space', '0px');
    header.classList.remove('skill-points-header--fixed');
    header.style.removeProperty('--skill-tree-header-fixed-left');
    header.style.removeProperty('--skill-tree-header-fixed-width');
    cleanupSkillTreeHeaderFloating = null;
    updateSkillTreeHeaderFloating = null;
  };
}

export function updateSkillTreeValues() {
  const characterAvatarEl = document.getElementById('character-avatar');
  const characterNameEl = document.getElementById('character-name');

  if (!skillTree.selectedPath) {
    let img = characterAvatarEl.querySelector('img');
    img = document.createElement('img');
    img.alt = 'Peasant Avatar';
    characterAvatarEl.innerHTML = '';
    characterAvatarEl.appendChild(img);
    img.src = `${import.meta.env.VITE_BASE_PATH}/avatars/peasant-avatar.jpg`;

    // reset name
    characterNameEl.textContent = '';
    return;
  }

  const selectedPath = skillTree.getSelectedPath();
  if (characterAvatarEl && selectedPath?.avatar) {
    // Remove any previous img
    let img = characterAvatarEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = selectedPath.name() + ' avatar';
      characterAvatarEl.innerHTML = '';
      characterAvatarEl.appendChild(img);
    }
    img.src = `${import.meta.env.VITE_BASE_PATH}/avatars/${selectedPath.avatar()}`;
  }

  const characterName =
    skillTree.selectedPath.name.charAt(0).toUpperCase() + skillTree.selectedPath.name.slice(1).toLowerCase();
  characterNameEl.innerHTML = `<span class="character-name">${characterName}</span> (Level: ${hero.level})`;

  const container = document.getElementById('skill-tree-container');

  const skillPointsHeader = container.querySelector('.skill-points-header');
  const showQtyControls = options?.quickBuy || options?.bulkBuy;
  let quickControls = '';
  if (showQtyControls) {
    if (options.useNumericInputs) {
      const val = skillTree.quickQty === 'max' ? (options.skillQuickQty || 1) : skillTree.quickQty;
      quickControls = `
        <div class="skill-qty-controls">
          <input type="number" class="skill-qty-input input-number" min="1" value="${val}" />
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">Max</button>
        </div>`;
    } else {
      quickControls = `
        <div class="skill-qty-controls">
          <button data-qty="1" class="${skillTree.quickQty === 1 ? 'active' : ''}">1</button>
          <button data-qty="5" class="${skillTree.quickQty === 5 ? 'active' : ''}">5</button>
          <button data-qty="25" class="${skillTree.quickQty === 25 ? 'active' : ''}">25</button>
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">Max</button>
        </div>`;
    }
  }

  let bulkControls = '';
  if (options?.bulkBuy) {
    bulkControls = `
      <div class="skill-bulk-controls">
        <button class="bulk-buy">${t('skillTree.bulkAllocate')}</button>
        <span class="skill-bulk-cost"></span>
      </div>`;
  }

  const controlsMarkup = quickControls || bulkControls ? `<div class="skill-header-controls">${quickControls}${bulkControls}</div>` : '';

  skillPointsHeader.innerHTML = `
    <div class="skill-header-left">
      <span class="skill-path-name">${characterName}</span>
      <span class="skill-points">Available Skill Points: ${skillTree.skillPoints}</span>
    </div>
    ${controlsMarkup}
  `;

  const qtyControls = skillPointsHeader.querySelector('.skill-qty-controls');
  if (qtyControls) {
    if (options.useNumericInputs) {
      const input = qtyControls.querySelector('.skill-qty-input');
      const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
      input.oninput = () => {
        let v = parseInt(input.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > SKILLS_MAX_QTY) v = SKILLS_MAX_QTY;
        input.value = v;
        skillTree.quickQty = v;
        options.skillQuickQty = v;
        maxBtn.classList.remove('active');
        updateSkillBulkCostDisplay();
        dataManager.saveGame();
        // Don't call updateSkillTreeValues() here as it rebuilds the input and loses focus
      };
      maxBtn.onclick = () => {
        skillTree.quickQty = 'max';
        maxBtn.classList.add('active');
        // Update the input field to show the max value without rebuilding the entire UI
        const maxValue = Math.min(options.skillQuickQty || 1, SKILLS_MAX_QTY);
        input.value = maxValue;
        updateSkillBulkCostDisplay();
        dataManager.saveGame();
      };
    } else {
      qtyControls.querySelectorAll('button').forEach((btn) => {
        btn.onclick = () => {
          skillTree.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          updateSkillBulkCostDisplay();
          dataManager.saveGame();
        };
      });
    }
  }

  skillBulkButton = skillPointsHeader.querySelector('.skill-bulk-controls .bulk-buy');
  skillBulkCostEl = skillPointsHeader.querySelector('.skill-bulk-cost');
  if (skillBulkButton) {
    skillBulkButton.onclick = () => {
      skillTree.bulkAllocateSkills(skillTree.quickQty);
    };
  }

  updateSkillBulkCostDisplay();

  updateSkillTreeHeaderFloating?.();

  container.querySelectorAll('.skill-node').forEach((node) => {
    const skillId = node.dataset.skillId;
    const currentLevel = skillTree.skills[skillId]?.level || 0;
    const canUnlock = skillTree.canUnlockSkill(skillId, false);

    const levelDisplay = node.querySelector('.skill-level');
    const skill = skillTree.getSkill(skillId);

    levelDisplay.textContent = skill.maxLevel() == Infinity ? `${currentLevel}` : `${currentLevel}/${skill.maxLevel()}`;

    node.classList.toggle('available', canUnlock);
    node.classList.toggle('unlocked', !!skillTree.skills[skillId]);
  });

  // --- Auto-cast toggles for instant/buff skills ---
  renderAutoCastToggles();
  // --- Slot display toggles ---
  renderDisplayToggles();
}

function showSkillTree() {
  const container = document.getElementById('skill-tree-container');
  if (!container.children.length) {
    initializeSkillTreeStructure();
  } else {
    updateSkillTreeValues();
  }
}

let skillModal;
let currentSkillId;
let selectedSkillQty = 1;

function initializeSkillModal() {
  if (skillModal) return;
  // Build skill modal content
  const content = html`
    <div class="skill-modal-content">
      <span class="modal-close">&times;</span>
      <div class="modal-skill-icon"></div>
      <h2 class="modal-skill-name"></h2>
      <p class="modal-skill-desc"></p>
      <div class="modal-skill-stats">
        <p>Level: <span class="modal-level"></span>/<span class="modal-max-level"></span></p>
        <p>Available Points: <span class="modal-available-points"></span></p>
        <p>Skill Point Cost: <span class="modal-sp-cost"></span></p>
        <p class="modal-mana-row">
          Mana Cost: <span class="modal-current-mana-cost"></span> (<span class="modal-next-mana-cost"></span>)
        </p>
        <p class="modal-cooldown-row">
          Cooldown: <span class="modal-current-cooldown"></span> (<span class="modal-next-cooldown"></span>)
        </p>
        <p class="modal-duration-row">
          Duration: <span class="modal-current-duration"></span> (<span class="modal-next-duration"></span>)
        </p>
      </div>
      <div class="modal-skill-effects">
        <h3>Effects</h3>
        <div class="effects-list"></div>
      </div>
      <div class="modal-controls">
        <button data-qty="1">+1</button>
        <button data-qty="5">+5</button>
        <button data-qty="25">+25</button>
        <button class="max-btn" data-qty="max">Max</button>
      </div>
      <button class="modal-buy">Buy</button>
    </div>
  `;
  // Create via shared helper
  skillModal = createModal({
    id: 'skill-modal',
    className: 'skill-modal hidden',
    content,
    onClose: closeSkillModal,
  });
  // Attach quantity controls and buy handler
  skillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
    btn.onclick = () => {
      selectedSkillQty = btn.dataset.qty;
      updateSkillModalDetails();
    };
  });
  skillModal.querySelector('.modal-buy').onclick = () => buySkillBulk();
}

function openSkillModal(skillId) {
  initializeSkillModal();
  currentSkillId = skillId;
  const skill = skillTree.getSkill(skillId);

  // Set skill icon in modal
  const iconEl = skillModal.querySelector('.modal-skill-icon');
  iconEl.style.backgroundImage = `url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')`;

  const currentLevel = skillTree.skills[skillId]?.level || 0;
  const nextLevel = currentLevel + 1;
  skillModal.querySelector('.modal-skill-name').textContent = skill.name();
  skillModal.querySelector('.modal-skill-desc').innerHTML = skill.description().replace(/\n/g, '<br>');
  skillModal.querySelector('.modal-level').textContent = currentLevel;
  skillModal.querySelector('.modal-max-level').textContent = skill.maxLevel() === Infinity ? '∞' : skill.maxLevel();
  skillModal.querySelector('.modal-available-points').textContent = skillTree.skillPoints;
  const currMana = skillTree.getSkillManaCost(skill, currentLevel);
  const nextMana = skillTree.getSkillManaCost(skill, nextLevel);
  const manaDiff = nextMana - currMana;
  skillModal.querySelector('.modal-current-mana-cost').textContent = currMana.toFixed(2);
  skillModal.querySelector('.modal-next-mana-cost').textContent = `${manaDiff >= 0 ? '+' : ''}${manaDiff.toFixed(2)}`;
  const currCd = skillTree.getSkillCooldown(skill, currentLevel);
  const nextCd = skillTree.getSkillCooldown(skill, nextLevel);
  skillModal.querySelector('.modal-current-cooldown').textContent = (currCd / 1000).toFixed(2) + 's';
  skillModal.querySelector('.modal-next-cooldown').textContent = (nextCd / 1000).toFixed(2) + 's';
  const currDur = skillTree.getSkillDuration(skill, currentLevel);
  const nextDur = skillTree.getSkillDuration(skill, nextLevel);
  skillModal.querySelector('.modal-current-duration').textContent = (currDur / 1000).toFixed(2) + 's';
  skillModal.querySelector('.modal-next-duration').textContent = (nextDur / 1000).toFixed(2) + 's';

  // Show or hide mana cost row
  const manaRow = skillModal.querySelector('.modal-mana-row');
  if (skill.manaCost) {
    manaRow.style.display = '';
  } else {
    manaRow.style.display = 'none';
  }

  // Show or hide cooldown row
  const cdRow = skillModal.querySelector('.modal-cooldown-row');
  if (skill.cooldown) {
    cdRow.style.display = '';
  } else {
    cdRow.style.display = 'none';
  }

  // Show or hide duration row
  const durRow = skillModal.querySelector('.modal-duration-row');
  if (skill.duration) {
    durRow.style.display = '';
  } else {
    durRow.style.display = 'none';
  }

  // Populate effects
  const effectsCurrent = skillTree.getSkillEffect(skillId, currentLevel);
  const effectsNext = skillTree.getSkillEffect(skillId, nextLevel);
  const effectsEl = skillModal.querySelector('.effects-list');
  effectsEl.innerHTML = '';
  Object.entries(effectsNext).forEach(([stat, nextVal]) => {
    const currVal = effectsCurrent[stat] || 0;
    const diff = nextVal - currVal;
    if (!shouldShowStatValue(stat)) {
      effectsEl.innerHTML += `
      <p>${formatStatName(stat)}</p>
    `;
      return;
    }
    const decimals = getStatDecimals(stat);
    effectsEl.innerHTML += `
      <p>${formatStatName(stat)}: ${currVal.toFixed(decimals)} (${formatSignedValue(diff, decimals)})</p>
    `;
  });

  selectedSkillQty = 1;
  updateSkillModalDetails();
  skillModal.classList.remove('hidden');
}

function closeSkillModal() {
  if (skillModal) skillModal.classList.add('hidden');
}

function updateSkillModalDetails() {
  const qty = selectedSkillQty === 'max' ? Infinity : parseInt(selectedSkillQty, 10);
  const currentLevel = skillTree.skills[currentSkillId]?.level || 0;
  const skill = skillTree.getSkill(currentSkillId);
  const maxLevel = skill.maxLevel() || Infinity;
  const maxQty = skillTree.calculateMaxPurchasable(skill);
  const actualQty = selectedSkillQty === 'max' ? maxQty : Math.min(qty, maxQty);
  const futureLevel = currentLevel + actualQty;
  // Quantity used for displaying cost should reflect the selected amount,
  // even if unaffordable (except 'max', which depends on affordability).
  const displayQty = selectedSkillQty === 'max' ? maxQty : (isNaN(qty) ? 0 : qty);

  // Update modal fields
  skillModal.querySelector('.modal-level').textContent = currentLevel;
  skillModal.querySelector('.modal-max-level').textContent = maxLevel === Infinity ? '∞' : maxLevel;
  skillModal.querySelector('.modal-available-points').textContent = skillTree.skillPoints;

  // Update SP cost display and button labels
  // Show true cost for the selected quantity (not clamped by affordability)
  const displayCost = skillTree.calculateSkillPointCost(currentLevel, displayQty);
  const totalCost = skillTree.calculateSkillPointCost(currentLevel, actualQty);
  skillModal.querySelector('.modal-sp-cost').textContent = displayCost + ' SP';
  skillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
    const v = btn.dataset.qty;
    const rawQty = v === 'max' ? maxQty : parseInt(v, 10);
    const btnCost = skillTree.calculateSkillPointCost(currentLevel, isNaN(rawQty) ? 0 : rawQty);
    btn.textContent = (v === 'max' ? 'Max' : '+' + v) + ' (' + btnCost + ' SP)';
  });

  // Update cost and stats
  const currMana = skillTree.getSkillManaCost(skill, currentLevel);
  const nextMana = skillTree.getSkillManaCost(skill, futureLevel);
  skillModal.querySelector('.modal-current-mana-cost').textContent = currMana;
  skillModal.querySelector('.modal-next-mana-cost').textContent = nextMana;

  // Show or hide mana cost row
  const manaRow = skillModal.querySelector('.modal-mana-row');
  if (skill.manaCost) {
    manaRow.style.display = '';
  } else {
    manaRow.style.display = 'none';
  }

  // Cooldown
  const currCd = skillTree.getSkillCooldown(skill, currentLevel) / 1000;
  const nextCd = skillTree.getSkillCooldown(skill, futureLevel) / 1000;
  skillModal.querySelector('.modal-current-cooldown').textContent = currCd.toFixed(2) + 's';
  skillModal.querySelector('.modal-next-cooldown').textContent = nextCd.toFixed(2) + 's';

  // Duration
  const currDur = skillTree.getSkillDuration(skill, currentLevel) / 1000;
  const nextDur = skillTree.getSkillDuration(skill, futureLevel) / 1000;
  skillModal.querySelector('.modal-current-duration').textContent = currDur.toFixed(2) + 's';
  skillModal.querySelector('.modal-next-duration').textContent = nextDur.toFixed(2) + 's';

  // Effects list
  const effectsCurrent = skillTree.getSkillEffect(currentSkillId, currentLevel);
  const effectsFuture = skillTree.getSkillEffect(currentSkillId, futureLevel);
  const effectsEl = skillModal.querySelector('.effects-list');
  effectsEl.innerHTML = '';
  Object.entries(effectsFuture).forEach(([stat, futureVal]) => {
    const currVal = effectsCurrent[stat] || 0;
    const diff = futureVal - currVal;
    if (!shouldShowStatValue(stat)) {
      effectsEl.innerHTML += `<p>${formatStatName(stat)}</p>`;
      return;
    }
    const decimals = getStatDecimals(stat);
    effectsEl.innerHTML += `<p>${formatStatName(stat)}: ${currVal.toFixed(decimals)} (${formatSignedValue(
      diff,
      decimals,
    )})</p>`;
  });

  // --- Show summon stats if this is a summon skill ---
  if (skill.type() === 'summon') {
    const title = skillModal.querySelector('.modal-skill-effects h3');
    title.innerHTML = 'Summon Stats';
    const summonStatsCurrent = skill.summonStats(currentLevel);
    const summonStatsFuture = skill.summonStats(futureLevel);
    Object.entries(summonStatsCurrent).forEach(([stat, currVal]) => {
      const futureVal = summonStatsFuture[stat];
      const diff = futureVal - currVal;
      if (!shouldShowStatValue(stat)) {
        effectsEl.innerHTML += `<p>${formatStatName(stat)}</p>`;
        return;
      }
      const decimals = getStatDecimals(stat);
      effectsEl.innerHTML += `<p>${formatStatName(stat)}: ${currVal.toFixed(decimals)} (${formatSignedValue(
        diff,
        decimals,
      )})</p>`;
    });
  } else {
    const title = skillModal.querySelector('.modal-skill-effects h3');
    title.innerHTML = 'Skill Effects';
  }

  // Update buy button
  const buyBtn = skillModal.querySelector('.modal-buy');
  buyBtn.disabled = actualQty <= 0;
  // Show intended purchase amount and its true cost even if unaffordable
  buyBtn.textContent = `Buy ${displayQty} for ${displayCost} SP`;
}

function buySkillBulk() {
  let count = selectedSkillQty === 'max' ? Infinity : parseInt(selectedSkillQty, 10);
  const currentLevel = skillTree.skills[currentSkillId]?.level || 0;
  const unlocked = skillTree.unlockSkillBulk(currentSkillId, count);

  if (typeof gtag === 'function') {
    gtag('event', 'skill_leveled_up_bulk', {
      event_category: 'SkillTree',
      event_label: currentSkillId,
      value: unlocked, // total levels gained in this action
      final_level: currentLevel + unlocked,
    });
  }
  updateSkillTreeValues();
  updateActionBar();
  updateSkillModalDetails();
}

function createSkillElement(baseSkill) {
  let skill = skillTree.getSkill(baseSkill.id);

  const skillElement = document.createElement('div');
  skillElement.className = 'skill-node';
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type();

  skillElement.innerHTML = html`
    <div
      class="skill-icon"
      style="background-image: url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')"
    ></div>
    <div class="skill-level">
      ${skillTree.skills[skill.id]?.level || 0}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}
    </div>
  `;

  skillElement.addEventListener('mouseenter', (e) => showTooltip(updateTooltipContent(skill.id), e));
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);

  skillElement.addEventListener('click', (e) => {
    if (options?.quickBuy) {
      const count = skillTree.quickQty === 'max' ? Infinity : parseInt(skillTree.quickQty, 10) || 1;
      const currentLevel = skillTree.skills[skill.id]?.level || 0;
      const unlocked = skillTree.unlockSkillBulk(skill.id, count);
      skill = skillTree.getSkill(skill.id);
      if (typeof gtag === 'function' && unlocked > 0) {
        gtag('event', 'skill_leveled_up_bulk', {
          event_category: 'SkillTree',
          event_label: skill.id,
          value: unlocked,
          final_level: currentLevel + unlocked,
        });
      }
      updateSkillTreeValues();
      updateActionBar();
      const tooltip = document.getElementById('tooltip');
      if (tooltip?.classList.contains('show')) {
        showTooltip(updateTooltipContent(skill.id), e);
      }
    } else {
      openSkillModal(skill.id);
    }
  });

  return skillElement;
}

const updateTooltipContent = (skillId) => {
  // get fresh skill data
  let skill = skillTree.getSkill(skillId);
  const currentLevel = skillTree.skills[skill.id]?.level || 0;

  // Calculate effects at current level
  const effectsCurrent = skillTree.getSkillEffect(skill.id);

  // Calculate effects at next level (if not maxed out)
  const nextLevel = currentLevel < skill.maxLevel() ? currentLevel + 1 : currentLevel;
  const effectsNext = skillTree.getSkillEffect(skill.id, nextLevel);

  const typeBadge = formatSkillTypeBadge(skill);

  let skillDescription = `
      <strong>${skill.name()} [${typeBadge}]</strong><br>
      ${skill
    .description()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('<br>')}
      <br>
      Level: ${currentLevel}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}
    `;

  const skillManaCost = skillTree.getSkillManaCost(skill);
  const skillManaCostNextLevel = skillTree.getSkillManaCost(skill, nextLevel);
  if (skillManaCost) {
    skillDescription += `<br />Mana Cost: ${skillManaCost} (+${skillManaCostNextLevel - skillManaCost})`;
  }
  const skillCooldown = skillTree.getSkillCooldown(skill);
  const skillCooldownNextLevel = skillTree.getSkillCooldown(skill, nextLevel);

  if (skillCooldown) {
    skillDescription += `<br />Cooldown: ${(skillCooldown / 1000).toFixed(2)}s (${
      (skillCooldownNextLevel - skillCooldown) / 1000
    }s)`;
  }
  const skillDuration = skillTree.getSkillDuration(skill);
  const skillDurationNextLevel = skillTree.getSkillDuration(skill, nextLevel);
  if (skillDuration) {
    skillDescription += `<br />Duration: ${(skillDuration / 1000).toFixed(2)}s (+${
      (skillDurationNextLevel - skillDuration) / 1000
    }s)`;
  }

  // Calculate effects at current level
  if (effectsCurrent && Object.keys(effectsCurrent).length > 0) {
    skillDescription += '<br /><u>Current Effects:</u><br />';
    Object.entries(effectsCurrent).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      const formattedValue = formatSignedValue(value, decimals, false);
      skillDescription += `${formatStatName(stat)}: ${formattedValue}<br />`;
    });
  }

  // If not at max level, show next level effects and the bonus

  if (skill.type() === 'summon') {
  // Show summon stats at current level
    const level = skillTree.skills[skill.id]?.level || 0;
    const summonStats = skill.summonStats(level);
    skillDescription += '<br /><u>Summon Stats:</u><br />';
    Object.entries(summonStats).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      skillDescription += `${formatStatName(stat)}: ${value.toFixed(decimals)}<br />`;
    });
  } else if (currentLevel < skill.maxLevel() || skill.maxLevel() === Infinity) {
    skillDescription += '<br /><u>Next Level Effects:</u><br />';
    Object.entries(effectsNext).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        skillDescription += `${formatStatName(stat)}<br />`;
        return;
      }
      const decimals = getStatDecimals(stat);
      const currentValue = effectsCurrent[stat] || 0;
      const difference = value - currentValue;
      skillDescription += `${formatStatName(stat)}: ${formatSignedValue(
        value,
        decimals,
        false,
      )} <span class="bonus">(${formatSignedValue(difference, decimals)})</span><br />`;
    });
  }

  return skillDescription;
};

export function updateActionBar() {
  const skillSlotsContainer = document.querySelector('.skill-slots');
  if (!skillSlotsContainer) return;

  skillSlotsContainer.innerHTML = '';
  let slotNumber = 1;

  // Render skills in a deterministic order based on the class skill constants
  const orderedIds = Object.keys(SKILL_TREES[skillTree.selectedPath?.name] || {});
  orderedIds.forEach((skillId) => {
    const unlocked = !!skillTree.skills[skillId];
    if (!unlocked) return;

    const skill = skillTree.getSkill(skillId);
    if (skill.type() === 'passive' || !skillTree.isDisplayEnabled(skillId)) return;

    const skillSlot = document.createElement('div');
    skillSlot.className = 'skill-slot';
    skillSlot.dataset.skillId = skillId;
    skillSlot.dataset.key = slotNumber;

    // Add key number indicator
    const keyIndicator = document.createElement('div');
    keyIndicator.className = 'key-indicator';
    skillSlot.appendChild(keyIndicator);

    // Add overlays for buff visualization
    const cooldownOverlay = document.createElement('div');
    cooldownOverlay.className = 'cooldown-overlay';
    skillSlot.appendChild(cooldownOverlay);

    // Add cooldown text
    const cooldownText = document.createElement('div');
    cooldownText.className = 'cooldown-text';
    if (!options.showSkillCooldowns) cooldownText.style.display = 'none';
    skillSlot.appendChild(cooldownText);

    // Add skill icon
    const iconDiv = document.createElement('div');
    iconDiv.className = 'skill-icon';
    iconDiv.style.backgroundImage = `url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')`;
    skillSlot.appendChild(iconDiv);

    // Show active state
    if (skillTree.activeBuffs.has(skillId)) {
      skillSlot.classList.add('active');
    }

    // Use the reusable tooltip
    skillSlot.addEventListener('mouseenter', (e) => showTooltip(createSkillTooltip(skillId), e));
    skillSlot.addEventListener('mousemove', positionTooltip);
    skillSlot.addEventListener('mouseleave', hideTooltip);

    skillSlot.addEventListener('click', () => skillTree.toggleSkill(skillId));
    skillSlotsContainer.appendChild(skillSlot);
    slotNumber++;
  });

  // Update buff/cooldown indicators
  updateBuffIndicators();
  // Add keyboard listeners
  setupKeyboardShortcuts();
}

function createSkillTooltip(skillId) {
  const skill = skillTree.getSkill(skillId);
  const level = skill?.level || 0;
  const effects = skillTree.getSkillEffect(skillId, level);

  const typeBadge = formatSkillTypeBadge(skill);

  let tooltip = `
      <div class="tooltip-header">${skill.name()}</div>
      <div class="tooltip-type">${typeBadge}</div>
      <div class="tooltip-level">Level: ${level}</div>
      <div class="tooltip-mana">Mana Cost: ${skillTree.getSkillManaCost(skill, level).toFixed(2)} (+${(skillTree.getSkillManaCost(skill, level + 1) - skillTree.getSkillManaCost(skill, level)).toFixed(2)})</div>
  `;

  // Add effects
  tooltip += '<div class="tooltip-effects">';
  Object.entries(effects).forEach(([stat, value]) => {
    if (!shouldShowStatValue(stat)) {
      tooltip += `<div>${formatStatName(stat)}</div>`;
      return;
    }
    const decimals = getStatDecimals(stat);
    const formattedValue = formatSignedValue(value, decimals, false);
    tooltip += `<div>${formatStatName(stat)}: ${formattedValue}</div>`;
  });
  tooltip += '</div>';

  // Add cooldown/duration for applicable skills
  if (skillTree.getSkillCooldown(skill)) {
    tooltip += `<div class="tooltip-cooldown">Cooldown: ${(skillTree.getSkillCooldown(skill) / 1000).toFixed(2)}s</div>`;
  }
  if (skillTree.getSkillDuration(skill)) {
    tooltip += `<div class="tooltip-duration">Duration: ${(skillTree.getSkillDuration(skill) / 1000).toFixed(2)}s</div>`;
  }

  if (skill?.type && skill.type() === 'instant' && skillTree.isDamageSkill?.(effects)) {
    const damagePreview = hero.calculateTotalDamage(effects, { includeRandom: false });
    if (damagePreview?.damage > 0) {
      tooltip += `<div class="tooltip-total-damage">${t('skill.totalPotentialDamage')}: ${formatNumber(damagePreview.damage)}</div>`;
    }
  }

  return tooltip;
}

function setupKeyboardShortcuts() {
  document.removeEventListener('keydown', handleKeyPress); // Remove existing listener
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
  if (e.key >= '1' && e.key <= '9') {
    const slot = document.querySelector(`.skill-slot[data-key="${e.key}"]`);
    if (slot) {
      const skillId = slot.dataset.skillId;
      skillTree.toggleSkill(skillId);
    }
  }
}

export function updateBuffIndicators() {
  document.querySelectorAll('.skill-slot').forEach((slot) => {
    const skillId = slot.dataset.skillId;
    const skill = skillTree.getSkill(skillId);
    const cooldownOverlay = slot.querySelector('.cooldown-overlay');
    const cooldownText = slot.querySelector('.cooldown-text');

    // Handle active states for all skill types
    const isActive =
      (skill.type() === 'buff' || skill.type() === 'summon') && skillTree.activeBuffs.has(skillId) || (skill.type() === 'toggle' && skill.active);

    slot.classList.toggle('active', isActive);

    // Show cooldown for both buff and instant skills
    if ((skill.type() === 'buff' || skill.type() === 'instant' || skill.type() === 'summon') && skill?.cooldownEndTime) {
      const remaining = skill.cooldownEndTime - Date.now();
      if (remaining > 0) {
        const percentage = Math.min((remaining / skillTree.getSkillCooldown(skill)) * 100, 100);
        cooldownOverlay.style.height = `${percentage}%`;
        slot.classList.add('on-cooldown');
        if (options.showSkillCooldowns) {
          cooldownText.textContent = Math.ceil(remaining / 1000);
          cooldownText.style.display = '';
        } else {
          cooldownText.style.display = 'none';
        }
      } else {
        cooldownOverlay.style.height = '0';
        slot.classList.remove('on-cooldown');
        cooldownText.textContent = '';
        cooldownText.style.display = 'none';
      }
    } else {
      cooldownOverlay.style.height = '0';
      slot.classList.remove('on-cooldown');
      cooldownText.textContent = '';
      cooldownText.style.display = 'none';
    }
  });
}

export function showManaWarning() {
  showToast(t('skillTree.notEnoughMana'), 'warning', 1500);
}

export function showLifeWarning() {
  showToast(t('skillTree.notEnoughLife'), 'warning', 1500);
}
