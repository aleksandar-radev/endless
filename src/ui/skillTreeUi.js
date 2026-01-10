import { STATS, getStatDecimalPlaces, getDivisor } from '../constants/stats/stats.js';
import { CLASS_PATHS, SKILL_TREES } from '../constants/skills.js';
import { getClassSpecializations, getSpecialization } from '../constants/specializations.js';
import { SKILL_LEVEL_TIERS, getSpellDamageTypes, SPECIALIZATION_UNLOCK_LEVEL } from '../skillTree.js';
import { SKILLS_MAX_QTY } from '../constants/limits.js';
import { skillTree, hero, crystalShop, options, dataManager } from '../globals.js';
import { formatNumber,
  formatStatName,
  hideTooltip,
  positionTooltip,
  showToast,
  showTooltip,
  updateResources } from './ui.js';
import { t, tp } from '../i18n.js';
import { createModal, closeModal } from './modal.js';
import { IS_MOBILE_OR_TABLET } from '../constants/common.js';

const html = String.raw;

const shouldShowStatValue = (stat) => STATS[stat]?.showValue !== false;
const getStatDecimals = (stat) => getStatDecimalPlaces(stat);
const formatSignedValue = (value, decimals, includeZero = true) => {
  if (typeof value !== 'number') return value;
  const shouldShowPlus = value > 0 || (includeZero && value === 0);
  return `${shouldShowPlus ? '+' : ''}${value.toFixed(decimals)}`;
};

const formatBaseStatLabel = (stat) => {
  let label = formatStatName(stat);
  // Keep prior UX: percent sign belongs to the value (e.g. "+5%"), not necessarily the label.
  if (stat.endsWith('Percent')) {
    label = label.replace(/\s*%$/, '');
  }
  return label;
};

function renderBaseStatsList(stats) {
  return Object.entries(stats)
    .map(([stat, value]) => {
      const label = formatBaseStatLabel(stat);
      let displayValue = value;
      if (stat.endsWith('Percent')) {
        displayValue = `${value}%`;
      }
      if (!shouldShowStatValue(stat)) return `<div>${label}</div>`;
      const prefix = value > 0 ? '+' : '';
      return `<div>${label}: ${prefix}${displayValue}</div>`;
    })
    .join('');
}

function buildSkillNodeElement(skill, { classes = 'skill-node', levelText } = {}) {
  const skillElement = document.createElement('div');
  skillElement.className = classes;
  skillElement.dataset.skillId = skill.id;
  skillElement.dataset.skillType = skill.type();
  skillElement.innerHTML = html`
    <div
      class="skill-icon"
      style="background-image: url('${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg')"
    ></div>
    <div class="skill-level">
      ${levelText ?? ''}
    </div>
  `;
  return skillElement;
}

const SKILL_CATEGORY_TRANSLATIONS = {
  attack: 'skillTree.skillCategory.attack',
  spell: 'skillTree.skillCategory.spell',
};

const SKILL_TYPE_TRANSLATIONS = {
  instant: 'skill.type.instant',
  passive: 'skill.type.passive',
  buff: 'skill.type.buff',
  summon: 'skill.type.summon',
  toggle: 'skill.type.toggle',
};

const SKILL_PURCHASE_QTYS = [1, 10, 50];

let cleanupSkillTreeHeaderFloating = null;
let updateSkillTreeHeaderFloating = null;
let skillBulkButton = null;
let skillBulkCostEl = null;

function updateSkillBulkCostDisplay() {
  if (!options?.bulkBuy || !skillBulkButton || !skillBulkCostEl) return;

  const specTabActive = document.getElementById('specializations-tab-content')?.classList.contains('active');
  if (specTabActive) {
    skillBulkButton.disabled = true;
    skillBulkCostEl.textContent = '';
    return;
  }

  const { totalCost, affordable } = skillTree.calculateBulkAllocation(skillTree.quickQty);
  skillBulkCostEl.textContent = `${t('skillTree.cost')}: ${formatNumber(totalCost)} ${t('skillTree.skillPointsLabel')}`;
  skillBulkCostEl.classList.toggle('unaffordable', !affordable);
  skillBulkButton.disabled = totalCost === 0 || !affordable;
}

function resolveSkillCategoryLabel(skill) {
  if (!skill) return '';
  const categorySource = skill.skill_type ?? skill.skillType;
  const resolvedCategory = typeof categorySource === 'function' ? categorySource() : categorySource;
  if (!resolvedCategory) return '';
  const normalized = `${resolvedCategory}`.toLowerCase();
  const translationKey = SKILL_CATEGORY_TRANSLATIONS[normalized];
  if (translationKey) {
    return t(translationKey);
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function resolveSkillTypeLabel(skill) {
  if (!skill?.type) return '';
  const rawType = skill.type();
  if (!rawType) return '';
  const normalized = `${rawType}`.toLowerCase();
  const translationKey = SKILL_TYPE_TRANSLATIONS[normalized];
  if (translationKey) {
    return t(translationKey);
  }
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatSkillTypeBadge(skill) {
  if (!skill?.type) return '';
  const primaryType = resolveSkillTypeLabel(skill);
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
    showSkillTreeWithTabs();
  }

  updateSkillTreeValues();
  updateActionBar();
}

function showSkillTreeWithTabs() {
  const container = document.getElementById('skill-tree-container');

  // Create tabs structure if it doesn't exist
  let tabsContainer = container.querySelector('.skill-tree-tabs');
  if (!tabsContainer) {
    container.innerHTML = '';

    tabsContainer = document.createElement('div');
    tabsContainer.className = 'skill-tree-tabs';

    let tabsHtml = `<button class="skill-tree-tab active" data-tab="skills">${t('skillTree.tabs.skills')}</button>`;
    if (hero.level >= SPECIALIZATION_UNLOCK_LEVEL) {
      tabsHtml += `<button class="skill-tree-tab" data-tab="specializations">${t('skillTree.tabs.specializations')}</button>`;
    }
    tabsHtml += `<button class="skill-tree-tab" data-tab="options">${t('skillTree.tabs.options')}</button>`;
    tabsContainer.innerHTML = tabsHtml;

    container.appendChild(tabsContainer);

    // Skills tab content
    const skillsContent = document.createElement('div');
    skillsContent.className = 'skill-tree-tab-content active';
    skillsContent.id = 'skills-tab-content';
    container.appendChild(skillsContent);

    // Specializations tab content
    const specializationsContent = document.createElement('div');
    specializationsContent.className = 'skill-tree-tab-content';
    specializationsContent.id = 'specializations-tab-content';
    container.appendChild(specializationsContent);

    // Options tab content
    const optionsContent = document.createElement('div');
    optionsContent.className = 'skill-tree-tab-content';
    optionsContent.id = 'options-tab-content';
    container.appendChild(optionsContent);

    // Tab click handlers
    tabsContainer.querySelectorAll('.skill-tree-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        console.log('Tab clicked:', tabName);
        switchSkillTreeTab(tabName);
      });
    });
  } else if (hero.level >= SPECIALIZATION_UNLOCK_LEVEL && !tabsContainer.querySelector('[data-tab="specializations"]')) {
    const specButton = document.createElement('button');
    specButton.className = 'skill-tree-tab';
    specButton.dataset.tab = 'specializations';
    specButton.textContent = t('skillTree.tabs.specializations');

    const optionsTab = tabsContainer.querySelector('[data-tab="options"]');
    if (optionsTab) {
      tabsContainer.insertBefore(specButton, optionsTab);
    } else {
      tabsContainer.appendChild(specButton);
    }

    specButton.addEventListener('click', () => {
      switchSkillTreeTab('specializations');
    });
  }

  initializeSkillsTab();
  if (hero.level >= SPECIALIZATION_UNLOCK_LEVEL) {
    initializeSpecializationsTab();
  }
  initializeOptionsTab();
}

function openSpecializationSelectionModal(spec) {
  const baseStatsHtml = renderBaseStatsList(spec.baseStats());

  const content = html`
    <div class="class-preview-wrapper">
      <button class="modal-close">&times;</button>
      <div
        class="class-preview-header"
        style="display: flex; flex-direction: row; gap: 20px; align-items: flex-start; text-align: left;"
      >
        <img
          src="${import.meta.env.VITE_BASE_PATH}/avatars/${spec.avatar()}"
          alt="${spec.name()}"
          class="character-avatar spec-preview-avatar"
          style="width: 72px; height: 128px; object-fit: cover; border-radius: 8px; border: 2px solid var(--accent);"
        />
        <div style="flex: 1;">
          <h2 style="color: var(--accent); margin-top: 0;">${spec.name()}</h2>
          <p style="color: #ccc; margin-bottom: 10px;">${spec.description()}</p>
          <div
            class="base-stats"
            style="font-size: 0.9em; color: #aaa; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;"
          >
            ${baseStatsHtml}
          </div>
        </div>
      </div>

      <div class="specialization-skills-preview" style="margin-top: 20px;">
        <h3 style="color: var(--accent); margin-bottom: 15px; text-align: center;">
          ${t('skillTree.passivesUnlocked')}
        </h3>
        <div class="skill-row" style="flex-wrap: wrap; justify-content: center; gap: 15px;"></div>
      </div>

      <div class="class-preview-footer" style="flex-direction: column; gap: 10px; margin-top: 30px;">
        <button class="select-class-btn" style="width: 100%;">
          ${t('skillTree.selectSpec')}
        </button>
      </div>
    </div>
  `;

  const modal = createModal({
    id: 'spec-selection-modal', className: 'class-preview-modal', content,
  });

  // Render skills grid
  const skillsContainer = modal.querySelector('.skill-row');
  Object.values(spec.skills).forEach((skill) => {
    const pathId = skillTree.selectedPath ? skillTree.selectedPath.name : null;
    const skillEl = createPreviewSkillElement(skill, pathId, spec.id);
    skillsContainer.appendChild(skillEl);
  });

  // Bind select button
  const selectBtn = modal.querySelector('.select-class-btn');
  selectBtn.addEventListener('click', () => {
    if (skillTree.selectSpecialization(spec.id)) {
      closeModal('spec-selection-modal');
      initializeSpecializationsTab();
      updateSkillTreeValues();
      showToast(`${spec.name()} specialization selected!`, 'success');
    } else {
      // If failed (e.g. level req), toast is handled by selectSpecialization
      closeModal('spec-selection-modal');
    }
  });
}

function switchSkillTreeTab(tabName) {
  const container = document.getElementById('skill-tree-container');

  // Update tab buttons
  container.querySelectorAll('.skill-tree-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // Update tab contents
  const skillsContent = document.getElementById('skills-tab-content');
  const specializationsContent = document.getElementById('specializations-tab-content');
  const optionsContent = document.getElementById('options-tab-content');

  skillsContent.classList.remove('active');
  specializationsContent.classList.remove('active');
  optionsContent.classList.remove('active');

  if (tabName === 'skills') {
    skillsContent.classList.add('active');
  } else if (tabName === 'specializations') {
    specializationsContent.classList.add('active');
  } else if (tabName === 'options') {
    optionsContent.classList.add('active');
  }
  updateSkillTreeValues();
}

function initializeSkillsTab() {
  const skillsContent = document.getElementById('skills-tab-content');
  if (!skillsContent) return;

  // Move existing skill tree structure here
  skillsContent.innerHTML = '';

  const skillPointsHeader = document.createElement('div');
  skillPointsHeader.className = 'skill-points-header';
  skillsContent.appendChild(skillPointsHeader);

  // Add mobile tooltip notice if quick buy is enabled
  renderMobileTooltipNotice(skillsContent);

  const noLvlRestriction = false;

  const skills = SKILL_TREES[skillTree.selectedPath.name];
  const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
    if (level <= hero.level || noLvlRestriction) {
      acc[level] = [];
    }
    return acc;
  }, {});

  Object.entries(skills).forEach(([skillId, skillData]) => {
    const isVisible = typeof skillData.isVisible === 'function' ? skillData.isVisible() : skillData.isVisible !== false;
    if (!isVisible) return;

    if (noLvlRestriction || (skillData.requiredLevel() <= hero.level && levelGroups[skillData.requiredLevel()])) {
      levelGroups[skillData.requiredLevel()].push({ id: skillId, ...skillData });
    }
  });

  Object.entries(levelGroups).forEach(([reqLevel, groupSkills]) => {
    if (groupSkills.length > 0) {
      const rowContainer = document.createElement('div');
      rowContainer.className = 'skills-table-row';

      const levelLabel = document.createElement('div');
      levelLabel.className = 'level-requirement';
      levelLabel.textContent = `Level ${reqLevel}`;
      rowContainer.appendChild(levelLabel);

      const skillsCell = document.createElement('div');
      skillsCell.className = 'skills-cell';

      groupSkills.forEach((skill) => {
        const skillElement = createSkillElement(skill);
        skillsCell.appendChild(skillElement);
      });
      rowContainer.appendChild(skillsCell);

      skillsContent.appendChild(rowContainer);
    }
  });

  updateSkillTreeValues();
  setupSkillTreeFloatingHeader(skillsContent, skillPointsHeader);
}

function initializeOptionsTab() {
  const optionsContent = document.getElementById('options-tab-content');
  if (!optionsContent) return;
  // Initialize content if empty or needed
  renderAutoCastToggles();
  renderDisplayToggles();
}

function initializeSpecializationsTab() {
  const specializationsContent = document.getElementById('specializations-tab-content');
  if (!specializationsContent) return;

  if (!skillTree.selectedPath) {
    specializationsContent.innerHTML = `<p style="padding: 20px;">${t('skillTree.selectClassFirst')}</p>`;
    return;
  }

  specializationsContent.innerHTML = '';

  // --- If Specialization Selected: Show Details & Skills ---
  if (skillTree.selectedSpecialization) {
    const spec = getSpecialization(skillTree.selectedPath.name, skillTree.selectedSpecialization.id);

    const baseStatsHtml = renderBaseStatsList(spec.baseStats());

    const showQtyControls = options?.quickBuy || options?.bulkBuy;
    let quickControls = '';
    if (showQtyControls) {
      if (options.useNumericInputs) {
        const val = skillTree.quickQty === 'max' ? options.skillQuickQty || 1 : skillTree.quickQty;
        quickControls = `
        <div class="skill-qty-controls">
          <input type="number" class="skill-qty-input input-number" min="1" value="${val}" />
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
        </div>`;
      } else {
        quickControls = `
        <div class="skill-qty-controls">
          <button data-qty="1" class="${skillTree.quickQty === 1 ? 'active' : ''}">1</button>
          <button data-qty="5" class="${skillTree.quickQty === 5 ? 'active' : ''}">5</button>
          <button data-qty="25" class="${skillTree.quickQty === 25 ? 'active' : ''}">25</button>
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
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

    const controlsMarkup =
      quickControls || bulkControls
        ? `<div class="skill-header-controls" style="display: flex; gap: 10px;">${quickControls}${bulkControls}</div>`
        : '';

    const header = document.createElement('div');
    header.className = 'selected-specialization-header';
    header.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
           <div class="spec-points-display" style="font-size: 1.2em; color: var(--gold);">${t('skillTree.specializationPoints')}: ${formatNumber(skillTree.specializationPoints)}</div>
           ${controlsMarkup}
        </div>
        <div style="display: flex; align-items: flex-start; gap: 20px;">
          <img src="${import.meta.env.VITE_BASE_PATH}/avatars/${spec.avatar()}" alt="${spec.name()} Avatar" class="character-avatar specialization-avatar" style="width: 72px; height: 128px; border-radius: 8px; object-fit: cover;" />
          <div style="flex: 1;">
              <h3 style="margin: 0; font-size: 1.5em; color: var(--gold);">${spec.name()}</h3>
              <p style="margin: 5px 0; opacity: 0.8;">${spec.description()}</p>
              <div class="base-stats" style="margin-top: 10px; font-size: 0.9em; color: #aaa;">
                ${baseStatsHtml}
              </div>
          </div>
        </div>
      </div>
    `;
    specializationsContent.appendChild(header);

    // Add mobile tooltip notice if quick buy is enabled
    renderMobileTooltipNotice(specializationsContent);

    // Attach event listeners for controls
    const qtyControls = header.querySelector('.skill-qty-controls');
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
          updateSkillTreeValues(); // Update UI to reflect cost changes
          dataManager.saveGame();
        };
        maxBtn.onclick = () => {
          skillTree.quickQty = 'max';
          maxBtn.classList.add('active');
          if (input) input.value = SKILLS_MAX_QTY;
          updateSkillTreeValues();
          dataManager.saveGame();
        };
      } else {
        qtyControls.querySelectorAll('button').forEach((btn) => {
          btn.onclick = () => {
            skillTree.quickQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
            qtyControls.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            updateSkillTreeValues();
            dataManager.saveGame();
          };
        });
      }
    }

    const bulkBtn = header.querySelector('.skill-bulk-controls .bulk-buy');
    if (bulkBtn) {
      bulkBtn.onclick = () => {
        skillTree.bulkAllocateSpecializationSkills(skillTree.quickQty);
      };
    }

    const skillsContainer = document.createElement('div');
    skillsContainer.className = 'specialization-skills-container';
    specializationsContent.appendChild(skillsContainer);

    const skills = spec.skills;
    const levelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
      acc[level] = [];
      return acc;
    }, {});

    Object.entries(skills).forEach(([skillId, skillData]) => {
      const isVisible =
        typeof skillData.isVisible === 'function' ? skillData.isVisible() : skillData.isVisible !== false;
      if (!isVisible) return;

      const reqLevel = skillData.requiredLevel();
      // Only show if level tier exists (it should)
      if (Array.isArray(levelGroups[reqLevel])) {
        levelGroups[reqLevel].push({ id: skillId, ...skillData });
      }
    });

    Object.entries(levelGroups).forEach(([reqLevel, groupSkills]) => {
      if (groupSkills.length > 0) {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'skills-table-row';

        const levelLabel = document.createElement('div');
        levelLabel.className = 'level-requirement';
        levelLabel.textContent = `Level ${reqLevel}`;
        rowContainer.appendChild(levelLabel);

        const skillsCell = document.createElement('div');
        skillsCell.className = 'skills-cell';

        groupSkills.forEach((skill) => {
          const skillEl = createSpecializationSkillElement(skill);
          skillsCell.appendChild(skillEl);
        });
        rowContainer.appendChild(skillsCell);
        skillsContainer.appendChild(rowContainer);
      }
    });

    return;
  }

  // --- If No Specialization Selected: Show Selection Grid ---
  specializationsContent.innerHTML = `<h3 class="specialization-title">${t('skillTree.selectSpecialization')}</h3>`;

  const specializations = getClassSpecializations(skillTree.selectedPath.name);
  if (!specializations || Object.keys(specializations).length === 0) {
    specializationsContent.innerHTML += `<p style="padding: 20px;">${t('skillTree.noSpecializationsAvailable')}</p>`;
    return;
  }

  const specializationsGrid = document.createElement('div');
  specializationsGrid.className = 'specializations-grid';

  Object.values(specializations).forEach((spec) => {
    const specCard = document.createElement('div');
    specCard.className = 'specialization-card';

    const baseStatsHtml = renderBaseStatsList(spec.baseStats());

    specCard.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 15px;">
        <img src="${import.meta.env.VITE_BASE_PATH}/avatars/${spec.avatar()}" alt="${spec.name()} Avatar" class="character-avatar specialization-avatar" style="width: 60px; height: 106px; flex-shrink: 0; object-fit: cover; border-radius: 6px; border: 2px solid var(--accent);" />
        <div style="flex: 1;">
          <h4 style="margin-top: 0; margin-bottom: 10px;">${spec.name()}</h4>
          <p class="specialization-description" style="margin-bottom: 10px;">${spec.description()}</p>
          <div class="base-stats" style="margin: 10px 0; font-size: 0.9em; color: #aaa;">
            ${baseStatsHtml}
          </div>
        </div>
      </div>
      
      <button class="select-spec-btn">${t('skillTree.selectSpecialization')}</button>
    `;

    const selectBtn = specCard.querySelector('.select-spec-btn');
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openSpecializationSelectionModal(spec);
    });

    specializationsGrid.appendChild(specCard);
  });

  specializationsContent.appendChild(specializationsGrid);
}

function createSpecializationSkillElement(baseSkill) {
  // Always get fresh state
  let skill = skillTree.getSpecializationSkill(baseSkill.id);
  // Fallback if not initialized yet (should not happen if logic is correct)
  if (!skill) skill = { ...baseSkill, level: 0 };

  const levelText = `${skill.level || 0}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}`;
  const skillElement = buildSkillNodeElement(skill, {
    classes: 'skill-node specialization-node',
    levelText,
  });

  // Tooltip
  skillElement.addEventListener('mouseenter', (e) => {
    if (IS_MOBILE_OR_TABLET()) return;
    showTooltip(updateSpecializationTooltipContent(skill.id), e);
  });
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);


  skillElement.addEventListener('click', (e) => {
    if (options?.quickBuy) {
      const count = skillTree.quickQty === 'max' ? Infinity : parseInt(skillTree.quickQty, 10) || 1;
      const unlocked = skillTree.unlockSpecializationSkill(skill.id, count);

      if (unlocked > 0) {
        // Refresh tooltip
        showTooltip(updateSpecializationTooltipContent(skill.id), e);
      }
    } else {
      openSpecializationSkillModal(skill.id);
    }
  });

  return skillElement;
}

let specSkillModal;
let currentSpecSkillId;
let selectedSpecSkillQty = 1;

function initializeSpecSkillModal() {
  if (specSkillModal) return;
  const content = html`
    <div class="skill-modal-content">
      <span class="modal-close">&times;</span>
      <div class="skill-modal-tooltip-content"></div>
      <div class="skill-modal-footer">
         <div class="skill-modal-resources">
            <div class="modal-available-points-display">${t('skillTree.available')}: <span class="modal-available-points"></span></div>
            <div class="modal-cost-display">${t('skillTree.cost')}: <span class="modal-sp-cost"></span></div>
         </div>
         <div class="modal-controls">
           <!-- Controls rendered dynamically -->
         </div>
         <button class="modal-buy">Buy</button>
      </div>
    </div>
  `;
  specSkillModal = createModal({
    id: 'spec-skill-modal',
    className: 'skill-modal hidden',
    content,
    onClose: closeSpecSkillModal,
  });
  specSkillModal.querySelector('.modal-buy').onclick = () => buySpecSkillBulk();
}

function renderGenericSkillModalControls(container, optionsObj) {
  const {
    currentQty,
    onQtyChange,
    updateDetails,
    isNumeric,
  } = optionsObj;

  container.innerHTML = '';

  if (isNumeric) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'skill-qty-input input-number';
    input.min = '1';
    const val = currentQty() === 'max' ? 1 : currentQty();
    input.value = val;

    input.oninput = () => {
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1) v = 1;
      onQtyChange(v);
      container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      updateDetails();
    };
    container.appendChild(input);

    const maxBtn = document.createElement('button');
    maxBtn.className = 'max-btn' + (currentQty() === 'max' ? ' active' : '');
    maxBtn.dataset.qty = 'max';
    maxBtn.textContent = t('common.max');
    maxBtn.onclick = () => {
      onQtyChange('max');
      container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      maxBtn.classList.add('active');
      updateDetails();
    };
    container.appendChild(maxBtn);
  } else {
    SKILL_PURCHASE_QTYS.forEach((q) => {
      const btn = document.createElement('button');
      btn.dataset.qty = q;
      btn.textContent = '+' + q;
      if (currentQty() == q) btn.classList.add('active');
      btn.onclick = () => {
        onQtyChange(q);
        container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updateDetails();
      };
      container.appendChild(btn);
    });

    const maxBtn = document.createElement('button');
    maxBtn.className = 'max-btn' + (currentQty() === 'max' ? ' active' : '');
    maxBtn.dataset.qty = 'max';
    maxBtn.textContent = t('common.max');
    maxBtn.onclick = () => {
      onQtyChange('max');
      container.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      maxBtn.classList.add('active');
      updateDetails();
    };
    container.appendChild(maxBtn);
  }
}

function renderSpecSkillModalControls() {
  renderGenericSkillModalControls(specSkillModal.querySelector('.modal-controls'), {
    currentQty: () => selectedSpecSkillQty,
    onQtyChange: (q) => { selectedSpecSkillQty = q; },
    updateDetails: updateSpecSkillModalDetails,
    isNumeric: options.useNumericInputs,
  });
}

function openSpecializationSkillModal(skillId) {
  initializeSpecSkillModal();
  currentSpecSkillId = skillId;
  selectedSpecSkillQty = 1;
  renderSpecSkillModalControls();
  updateSpecSkillModalDetails();
  specSkillModal.classList.remove('hidden');
}

function closeSpecSkillModal() {
  if (specSkillModal) specSkillModal.classList.add('hidden');
}

function updateSpecSkillModalDetails() {
  const qty = selectedSpecSkillQty === 'max' ? Infinity : parseInt(selectedSpecSkillQty, 10);
  const skill = skillTree.getSpecializationSkill(currentSpecSkillId);
  const currentLevel = skill.level || 0;
  // Use specialization points for calculation
  const maxQty = skillTree.calculateMaxPurchasable(skill, skillTree.specializationPoints);
  const actualQty = selectedSpecSkillQty === 'max' ? maxQty : Math.min(qty, maxQty);
  const displayQty = selectedSpecSkillQty === 'max' ? maxQty : isNaN(qty) ? 0 : qty;

  specSkillModal.querySelector('.modal-available-points').textContent = formatNumber(skillTree.specializationPoints);

  const displayCost = skillTree.calculateSkillPointCost(currentLevel, displayQty);
  specSkillModal.querySelector('.modal-sp-cost').textContent = displayCost + ' SP';

  if (options.useNumericInputs) {
    const maxBtn = specSkillModal.querySelector('.max-btn');
    if (maxBtn) {
      const btnCost = skillTree.calculateSkillPointCost(currentLevel, maxQty);
      maxBtn.textContent = t('common.max') + ' (' + btnCost + ' SP)';
    }
    const input = specSkillModal.querySelector('.skill-qty-input');
    if (input && selectedSpecSkillQty === 'max') {
      input.value = maxQty;
    }
  } else {
    specSkillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
      const v = btn.dataset.qty;
      const rawQty = v === 'max' ? maxQty : parseInt(v, 10);
      const btnCost = skillTree.calculateSkillPointCost(currentLevel, isNaN(rawQty) ? 0 : rawQty);
      btn.textContent = (v === 'max' ? t('common.max') : '+' + v) + ' (' + btnCost + ' SP)';
    });
  }

  const buyBtn = specSkillModal.querySelector('.modal-buy');
  buyBtn.disabled = actualQty <= 0;
  buyBtn.textContent = `Buy ${displayQty} for ${displayCost} SP`;

  // Render Tooltip Content
  const tooltipContainer = specSkillModal.querySelector('.skill-modal-tooltip-content');
  const effectsCurrent = skillTree.getSpecializationSkillEffect(currentSpecSkillId, currentLevel);
  // Preview Level Logic based on selected quantity
  // reusing qty from above scope or creating a new scoped block if needed. Actually, qty is already defined at top of function.
  // const qty = ... (duplicate)

  // If max is selected, we show effects at max possible level. If numeric input is invalid/0, default to +1.
  const additionalLevels = (isNaN(qty) || qty <= 0) ? 1 : qty;
  const targetLevel = currentLevel + additionalLevels;

  const effectsTarget = skillTree.getSpecializationSkillEffect(currentSpecSkillId, targetLevel);

  // generateSkillTooltipHtml handles all the heavy lifting of displaying effects, damage preview, etc.
  tooltipContainer.innerHTML = generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsTarget, targetLevel);
}

function buySpecSkillBulk() {
  let count = selectedSpecSkillQty === 'max' ? Infinity : parseInt(selectedSpecSkillQty, 10);
  const unlocked = skillTree.unlockSpecializationSkill(currentSpecSkillId, count);

  if (unlocked > 0) {
    updateSkillTreeValues();
    updateSpecSkillModalDetails();
  }
}

function formatDamageBreakdown(breakdown) {
  if (!breakdown || Object.keys(breakdown).length === 0) return '';
  let html = '<div class="damage-breakdown" style="font-size: 0.9em; margin-top: 4px; color: #aaa;">';
  Object.entries(breakdown).forEach(([type, value]) => {
    if (value > 0) {
      html += `<div>${formatStatName(type + 'Damage')}: ${formatNumber(value.toFixed(2))}</div>`;
    }
  });
  html += '</div>';
  return html;
}

function calculateSummonDamage(skill, level) {
  if (!skill || typeof skill.summonStats !== 'function') return null;

  const statsForCalc = skill.summonStats(level);
  const canCrit = statsForCalc.canCrit || false || (hero.stats.summonsCanCrit || 0) > 0;

  // Base player damage to be scaled
  const playerDamageObj = hero.calculateTotalDamage({}, { includeRandom: false, canCrit });

  let totalDamage = 0;
  let breakdown = {};

  // Base summon damage types
  if (statsForCalc.damage > 0) {
    totalDamage += statsForCalc.damage;
    breakdown.physical = (breakdown.physical || 0) + statsForCalc.damage;
  }

  const elements = ['fire', 'cold', 'air', 'earth', 'lightning', 'water'];
  elements.forEach((el) => {
    const key = el + 'Damage';
    if (statsForCalc[key] > 0) {
      totalDamage += statsForCalc[key];
      breakdown[el] = (breakdown[el] || 0) + statsForCalc[key];
    }
  });

  // Percent of Player Damage
  if (statsForCalc.percentOfPlayerDamage > 0) {
    const d = getDivisor('percentOfPlayerDamage');
    const ratio = statsForCalc.percentOfPlayerDamage / d;

    if (ratio > 0) {
      totalDamage += playerDamageObj.damage * ratio;
      if (playerDamageObj.breakdown) {
        Object.entries(playerDamageObj.breakdown).forEach(([k, v]) => {
          breakdown[k] = (breakdown[k] || 0) + v * ratio;
        });
      } else {
        breakdown.physical = (breakdown.physical || 0) + playerDamageObj.damage * ratio;
      }
    }
  }

  // Multipliers
  let multiplier = 1;

  if (canCrit) {
    const critChance = Math.max(0, Math.min(1, hero.stats.critChance || 0));
    const critDamage = Math.max(0, hero.stats.critDamage || 1);
    const expectedMultiplier = 1 + (critDamage - 1) * critChance;
    multiplier *= expectedMultiplier;
  }

  if (skill.id === 'animatedWeapons') {
    multiplier *= hero.stats.animatedWeaponsDamagePercent || 1;
  }
  if (skill.id === 'shadowClone') {
    multiplier *= hero.stats.cloneDamagePercent || 1;
  }
  const summonDamageMultiplier = 1 + (hero.stats.summonDamageBuffPercent || 0);
  multiplier *= summonDamageMultiplier;

  // Apply multipliers
  if (multiplier !== 1) {
    totalDamage *= multiplier;
    Object.keys(breakdown).forEach((k) => {
      breakdown[k] *= multiplier;
    });
  }

  return { damage: Math.floor(totalDamage), breakdown };
}

function formatDamageBreakdownNew(breakdown) {
  if (!breakdown || Object.keys(breakdown).length === 0) return '';
  let html = '';
  Object.entries(breakdown).forEach(([type, value]) => {
    if (value > 0) {
      html += `<div class="damage-breakdown-row"><span>${formatStatName(type + 'Damage')}</span><span>${formatNumber(value.toFixed(2))}</span></div>`;
    }
  });
  return html;
}

function generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsTarget, targetLevelInput, pathId = null, activeSpecId = null) {
  const typeBadge = formatSkillTypeBadge(skill);
  const isMaxed = currentLevel >= skill.maxLevel() && skill.maxLevel() !== Infinity;
  const targetLevel = targetLevelInput !== undefined ? targetLevelInput : (currentLevel + 1);
  const iconUrl = `${import.meta.env.VITE_BASE_PATH}/skills/${skill.icon()}.jpg`;

  let html = `
    <div class="skill-tooltip-container">
      <div class="skill-tooltip-header">
        <div class="skill-tooltip-icon" style="background-image: url('${iconUrl}')"></div>
        <div class="skill-tooltip-title-block">
          <div class="skill-tooltip-name">${skill.name()}</div>
          <div class="skill-tooltip-type">${typeBadge}</div>
        </div>
      </div>
      
      <div class="skill-tooltip-body">
        <div class="skill-tooltip-description">
          ${skill.description().replace(/\n/g, '<br>')}
        </div>
  `;

  // Stats Section
  if (effectsCurrent && Object.keys(effectsCurrent).length > 0) {
    html += `
      <div class="skill-tooltip-section">
        <div class="skill-tooltip-section-title">
          <span>${t('skillTree.currentEffects')}</span>
          <span>${t('skillTree.level')}: ${currentLevel}${skill.maxLevel() !== Infinity ? '/' + skill.maxLevel() : ''}</span>
        </div>
        <div class="skill-stats-grid">
    `;
    Object.entries(effectsCurrent).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        html += `<div class="skill-stat-row"><span class="stat-name">${formatStatName(stat)}</span></div>`;
        return;
      }
      const decimals = getStatDecimals(stat);
      html += `
        <div class="skill-stat-row">
          <span class="stat-name">${formatStatName(stat)}</span>
          <span class="stat-value">${formatSignedValue(value, decimals, false)}</span>
        </div>
      `;
    });
    html += '</div></div>';
  }

  // Target Level Effects
  if ((!isMaxed || targetLevel > currentLevel) && effectsTarget && skill.type() !== 'summon') {
    const title = targetLevel === currentLevel + 1
      ? t('skillTree.nextLevelEffects')
      : tp('skillTree.levelEffects', { level: targetLevel });

    html += `
      <div class="skill-tooltip-section">
        <div class="skill-tooltip-section-title">
          <span>${title}</span>
          <span>${t('skillTree.level')}: ${targetLevel}</span>
        </div>
        <div class="skill-stats-grid">
    `;
    Object.entries(effectsTarget).forEach(([stat, value]) => {
      const decimals = getStatDecimals(stat);
      const currVal = effectsCurrent?.[stat] || 0;
      const diff = value - currVal;
      let diffHtml = '';
      if (typeof value === 'number' && typeof currVal === 'number') {
        const sign = diff >= 0 ? '+' : '';
        // Format: NewValue (+Gain)
        // Ensure NewValue doesn't double-sign if formatSignedValue adds one.
        // Usually formatSignedValue adds sign for everyone. value is absolute new value.
        // We want: "124 (+2)" or "+124 (+2)".
        // If we use formatSignedValue(value), it produces "+124".
        // If we use diff, we want explicitly + or -.
        // Let's use formatSignedValue for Value (standard appearance) and construct Gain manually or carefully.
        const gainStr = `${sign}${formatNumber(diff.toFixed(decimals))}`;
        diffHtml = ` <span class="stat-diff-total">(${gainStr})</span>`;
      }

      if (!shouldShowStatValue(stat)) {
        html += `<div class="skill-stat-row"><span class="stat-name">${formatStatName(stat)}</span></div>`;
      } else {
        html += `
          <div class="skill-stat-row bonus">
            <span class="stat-name">${formatStatName(stat)}</span>
            <span class="stat-value">${formatSignedValue(value, decimals, false)}${diffHtml}</span>
          </div>
        `;
      }
    });
    html += '</div></div>';
  }

  // Summon Stats
  if (skill.type() === 'summon') {
    const summonStats = getDisplayedSummonStats(skill.summonStats(currentLevel));
    html += `
        <div class="skill-tooltip-section">
          <div class="skill-tooltip-section-title">${t('skillTree.summonStats')}</div>
          <div class="skill-stats-grid">
      `;
    Object.entries(summonStats).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        html += `<div class="skill-stat-row"><span class="stat-name">${formatStatName(stat)}</span></div>`;
      } else {
        const decimals = getStatDecimals(stat);
        html += `
              <div class="skill-stat-row">
                <span class="stat-name">${formatStatName(stat)}</span>
                <span class="stat-value">${typeof value === 'number' ? value.toFixed(decimals) : ''}</span>
              </div>
            `;
      }
    });
    html += '</div></div>';

    const summonDamage = calculateSummonDamage(skill, currentLevel);
    if (summonDamage && summonDamage.damage > 0) {
      html += `
          <div class="skill-damage-preview">
             <div class="damage-total">
               <span>${t('skill.totalPotentialDamage')}</span>
               <span>${formatNumber(summonDamage.damage)}</span>
             </div>
             ${formatDamageBreakdownNew(summonDamage.breakdown)}
          </div>
        `;
    }
  }

  // Synergies
  if (skill.synergies && Array.isArray(skill.synergies) && skill.synergies.length > 0) {
    html += `<div class="skill-tooltip-section"><div class="skill-tooltip-section-title">${t('skillTree.synergies')}</div>`;
    skill.synergies.forEach((synergy) => {
      let sourceSkill = skillTree.getSkill(synergy.sourceSkillId);
      if (!sourceSkill && pathId && SKILL_TREES[pathId]) {
        sourceSkill = SKILL_TREES[pathId][synergy.sourceSkillId];
      }
      if (!sourceSkill && pathId && activeSpecId) {
        const spec = getSpecialization(pathId, activeSpecId);
        if (spec && spec.skills[synergy.sourceSkillId]) {
          sourceSkill = spec.skills[synergy.sourceSkillId];
        }
      }
      if (!sourceSkill) return;
      const sourceLevel = skillTree.skills[synergy.sourceSkillId]?.level || 0;
      const synergyBonus = sourceLevel > 0 && synergy.calculateBonus ? synergy.calculateBonus(sourceLevel) : 0;
      const nextLevelBonus = synergy.calculateBonus ? synergy.calculateBonus(sourceLevel + 1) : 0;
      const bonusPerLevel = sourceLevel > 0 ? (nextLevelBonus - synergyBonus).toFixed(2) : synergy.calculateBonus ? synergy.calculateBonus(1).toFixed(2) : '0';
      const sIcon = sourceSkill.icon ? sourceSkill.icon() : 'unknown';

      html += `
          <div class="skill-synergy-row">
             <img src="${import.meta.env.VITE_BASE_PATH}/skills/${sIcon}.jpg" class="synergy-icon-small" />
             <div class="synergy-content">
                <span class="synergy-name">${sourceSkill.name()}</span>
                <span class="synergy-value">
                   ${t('common.current')}: <span>${synergyBonus > 0 ? '+' + synergyBonus.toFixed(1) + '%' : '(0%)'}</span>
                   (+${bonusPerLevel}% ${t('skillTree.perLevel')})
                </span>
             </div>
          </div>
        `;
    });
    html += '</div>';
  }

  // Instant Damage Preview
  if (skill?.type && skill.type() === 'instant' && skillTree.isDamageSkill?.(effectsCurrent)) {
    const skillTypeSource = skill?.skill_type ?? skill?.skillType;
    const resolvedSkillType = typeof skillTypeSource === 'function' ? skillTypeSource() : skillTypeSource;
    const skillType = (resolvedSkillType || 'attack').toLowerCase();
    const isSpell = skillType === 'spell';
    let damageEffects = effectsCurrent;
    if (isSpell) {
      const allowedDamageTypes = getSpellDamageTypes(effectsCurrent);
      damageEffects = { ...effectsCurrent, ...(allowedDamageTypes.length ? { allowedDamageTypes } : {}) };
    }
    const damagePreview = hero.calculateTotalDamage(damageEffects, { includeRandom: false });
    if (damagePreview?.damage > 0) {
      html += `
          <div class="skill-damage-preview">
             <div class="damage-total">
               <span>${t('skill.totalPotentialDamage')}</span>
               <span>${formatNumber(damagePreview.damage)}</span>
             </div>
             ${formatDamageBreakdownNew(damagePreview.breakdown)}
          </div>
        `;
    }
  }

  // Footer
  let footerHtml = '';
  if (skill.manaCost) {
    const manaCost = skillTree.getSkillManaCost(skill, currentLevel);
    const converted = hero.stats.convertManaToLifePercent >= 1;
    const label = converted ? t('skillTree.lifeCost') : t('skillTree.manaCost');
    const cls = converted ? 'life' : 'mana';
    if (manaCost) {
      const diff = !isMaxed ? skillTree.getSkillManaCost(skill, targetLevel) - manaCost : 0;
      const diffStr = diff ? ` (+${diff.toFixed(1)})` : '';
      footerHtml += `<div class="skill-meta-item ${cls}"><span>${label}: <span class="val">${manaCost.toFixed(1)}${diffStr}</span></span></div>`;
    }
  }
  if (skill.cooldown) {
    const cd = skillTree.getSkillCooldown(skill, currentLevel);
    if (cd) {
      const diff = !isMaxed ? (skillTree.getSkillCooldown(skill, targetLevel) - cd) / 1000 : 0;
      const diffStr = diff ? ` (${diff.toFixed(2)}s)` : '';
      footerHtml += `<div class="skill-meta-item cooldown"><span>${t('skillTree.cooldown')}: <span class="val">${(cd / 1000).toFixed(2)}s${diffStr}</span></span></div>`;
    }
  }
  if (skill.duration) {
    const dur = skillTree.getSkillDuration(skill, currentLevel);
    if (dur) {
      const diff = !isMaxed ? (skillTree.getSkillDuration(skill, targetLevel) - dur) / 1000 : 0;
      const diffStr = diff ? ` (+${diff.toFixed(2)}s)` : '';
      footerHtml += `<div class="skill-meta-item"><span>${t('skillTree.duration')}: <span class="val">${(dur / 1000).toFixed(2)}s${diffStr}</span></span></div>`;
    }
  }

  if (footerHtml) {
    html += `<div class="skill-tooltip-footer">${footerHtml}</div>`;
  }

  html += '</div></div>';
  return html;
}

function updateSpecializationTooltipContent(skillId) {
  let skill = skillTree.getSpecializationSkill(skillId);
  if (!skill) return '';

  const currentLevel = skill.level || 0;
  const effectsCurrent = skillTree.getSpecializationSkillEffect(skillId, currentLevel);

  const nextLevel = currentLevel < skill.maxLevel() ? currentLevel + 1 : currentLevel;
  const effectsNext = skillTree.getSpecializationSkillEffect(skillId, nextLevel);

  return generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsNext);
}

function getDisplayedSummonStats(rawSummonStats) {
  const summonStats = { ...rawSummonStats };
  const summonAttackSpeedBonus = hero.stats.summonAttackSpeedBuffPercent || 0;
  const summonDamageBonus = hero.stats.summonDamageBuffPercent || 0;
  const summonDamageMultiplier = 1 + summonDamageBonus;
  if (typeof summonStats.attackSpeed === 'number') {
    summonStats.attackSpeed *= 1 + summonAttackSpeedBonus;
  }

  if (typeof summonStats.percentOfPlayerDamage === 'number') {
    summonStats.percentOfPlayerDamage *= summonDamageMultiplier;
  }

  ['damage', 'fireDamage', 'coldDamage', 'airDamage', 'earthDamage', 'lightningDamage', 'waterDamage'].forEach(
    (key) => {
      if (typeof summonStats[key] === 'number') {
        summonStats[key] *= summonDamageMultiplier;
      }
    },
  );

  return summonStats;
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
        ${renderBaseStatsList(pathData.baseStats())}
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

  // Logic to track active specialization preview
  let activeSpecId = null;

  const content = html`
    <div class="class-preview-wrapper">
      <button class="modal-close">&times;</button>
      <div class="class-preview-header">
        <h2>${pathData.name()}</h2>
      </div>
      <div class="class-preview-specializations"></div>
      <div class="class-preview-tree"></div>
      <div class="class-preview-footer">
        <button class="select-class-btn">${t('skillTree.selectClass')}</button>
      </div>
    </div>
  `;
  const modal = createModal({
    id: 'class-preview-modal', className: 'class-preview-modal', content,
  });

  const specializationsContainer = modal.querySelector('.class-preview-specializations');
  const treeContainer = modal.querySelector('.class-preview-tree');
  const specializations = getClassSpecializations(pathId);

  // Render Specializations Section
  const specializationsList = Object.values(specializations);
  if (specializationsList.length > 0) {
    // Preselect the first specialization
    activeSpecId = specializationsList[0].id;

    specializationsContainer.innerHTML = `
      <h3>${t('skillTree.availableSpecializations')}</h3>
      <div class="specializations-preview-grid"></div>
    `;
    const grid = specializationsContainer.querySelector('.specializations-preview-grid');

    specializationsList.forEach((spec) => {
      const card = document.createElement('div');
      card.className = 'specialization-preview-card';
      card.dataset.specId = spec.id;

      // Highlight if active
      if (activeSpecId === spec.id) {
        card.classList.add('active');
      }

      card.innerHTML = `
        <img src="${import.meta.env.VITE_BASE_PATH}/avatars/${spec.avatar()}" alt="${spec.name()}" class="character-avatar spec-preview-avatar" style="width: 60px; height: 106px; flex-shrink: 0; object-fit: cover; border-radius: 6px; border: 2px solid var(--accent); pointer-events: none;" />
        <div style="pointer-events: none;">
          <h4 style="margin: 0; margin-bottom: 5px;">${spec.name()}</h4>
          <p class="spec-preview-desc">${spec.description()}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        if (activeSpecId === spec.id) {
          activeSpecId = null;
          card.classList.remove('active');
        } else {
          activeSpecId = spec.id;
          // Reset others
          grid.querySelectorAll('.specialization-preview-card').forEach((c) => {
            c.classList.remove('active');
          });
          card.classList.add('active');
        }
        buildClassPreviewTree(pathId, treeContainer, activeSpecId);
      });

      grid.appendChild(card);
    });
  }

  // Initial Tree Build
  buildClassPreviewTree(pathId, treeContainer, activeSpecId);

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
    showSkillTreeWithTabs();
    initializeSkillTreeUI();
  }
}

function buildClassPreviewTree(pathId, container, activeSpecId = null) {
  container.innerHTML = '';

  // --- Render Active Specialization Skills (if any) ---
  if (activeSpecId) {
    const spec = getSpecialization(pathId, activeSpecId);
    if (spec) {
      const specHeader = document.createElement('div');
      specHeader.innerHTML = `<h3 style="color: var(--gold); margin: 20px 0 10px;">${spec.name()} Skills</h3>`;
      container.appendChild(specHeader);

      const specSkills = spec.skills;
      const specLevelGroups = SKILL_LEVEL_TIERS.reduce((acc, level) => {
        acc[level] = [];
        return acc;
      }, {});

      Object.values(specSkills).forEach((skill) => {
        const reqLevel = skill.requiredLevel ? skill.requiredLevel() : 0;
        // Ensure the level group exists
        if (!specLevelGroups[reqLevel]) specLevelGroups[reqLevel] = [];
        specLevelGroups[reqLevel].push(skill);
      });

      Object.entries(specLevelGroups).forEach(([reqLevel, groupSkills]) => {
        if (groupSkills.length === 0) return;
        renderSkillRow(container, reqLevel, groupSkills, true, pathId);
      });

      const separator = document.createElement('hr');
      separator.style.cssText = 'border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 20px 0;';
      container.appendChild(separator);
    }
  }

  // --- Render Normal Class Skills ---
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
    renderSkillRow(container, reqLevel, groupSkills, false, pathId);
  });
}

function renderSkillRow(container, reqLevel, skills, isSpec = false, pathId = null) {
  const rowContainer = document.createElement('div');
  rowContainer.className = 'skills-table-row'; // Reuse the class for side-by-side layout

  const levelLabel = document.createElement('div');
  levelLabel.className = 'level-requirement';
  levelLabel.textContent = `Level ${reqLevel}`;
  rowContainer.appendChild(levelLabel);

  const skillsCell = document.createElement('div');
  skillsCell.className = 'skills-cell';

  skills.forEach((skill) => {
    const skillElement = createPreviewSkillElement(skill, pathId);
    if (isSpec) {
      skillElement.classList.add('specialization-node');
    }
    skillsCell.appendChild(skillElement);
  });
  rowContainer.appendChild(skillsCell);

  container.appendChild(rowContainer);
}

function createPreviewSkillElement(skill, pathId = null) {
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

  skillElement.addEventListener('mouseenter', (e) => showTooltip(createPreviewTooltip(skill, pathId), e));
  skillElement.addEventListener('mousemove', positionTooltip);
  skillElement.addEventListener('mouseleave', hideTooltip);

  return skillElement;
}

function createPreviewTooltip(skill, pathId = null) {
  const currentLevel = 0;
  const effectsCurrent = skill.effect(currentLevel);
  const nextLevel = currentLevel + 1;
  const effectsNext = skill.effect(nextLevel);

  return generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsNext, undefined, pathId);
}

export function initializeSkillTreeStructure() {
  if (!skillTree.selectedPath) {
    cleanupSkillTreeHeaderFloating?.();
    return;
  }

  // Use the new tabs-based structure
  showSkillTreeWithTabs();
}

function renderSkillToggleSection(
  containerId,
  titleKey,
  eligibleSkills,
  isCheckedFn,
  onToggleFn,
  wrapperClass,
  styleOptions = {},
) {
  const container = document.getElementById('options-tab-content') || document.getElementById('skills-tab-content') || document.getElementById('skill-tree-container');
  let section = document.getElementById(containerId);
  if (section) section.remove();

  if (eligibleSkills.length === 0) return;

  section = document.createElement('div');
  section.id = containerId;
  if (styleOptions.marginTop) section.style.marginTop = styleOptions.marginTop;

  section.innerHTML = `<h3 style="margin-bottom:8px;">${t(titleKey)}</h3>`;

  eligibleSkills.forEach((skill) => {
    const wrapper = document.createElement('div');
    wrapper.className = wrapperClass;
    if (styleOptions.wrapperAlignItems) wrapper.style.alignItems = styleOptions.wrapperAlignItems;
    if (styleOptions.wrapperMarginBottom) wrapper.style.marginBottom = styleOptions.wrapperMarginBottom;

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
    toggle.checked = isCheckedFn(skill.id);
    toggle.addEventListener('change', (e) => onToggleFn(skill, e));
    wrapper.appendChild(toggle);

    section.appendChild(wrapper);
  });

  container.appendChild(section);
}

function renderAutoCastToggles() {

  // Only show if there are any instant/buff skills unlocked
  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return (
        base && (base.type() === 'instant' || base.type() === 'buff' || base.type() === 'summon') && skill.level > 0
      );
    })
    .map(([skillId, skill]) => {
      const base = skillTree.getSkill(skillId);
      return { ...base, id: skillId };
    });

  renderSkillToggleSection(
    'auto-cast-section',
    'skillTree.autoCastSettings',
    eligibleSkills,
    (skillId) => skillTree.isAutoCastEnabled(skillId),
    (skill, e) => {
      skillTree.setAutoCast(skill.id, e.target.checked);
    },
    'auto-cast-switch',
    {
      marginTop: '32px', wrapperAlignItems: 'center', wrapperMarginBottom: '6px',
    },
  );
}

// --- Mobile Tooltip Notice ---
function renderMobileTooltipNotice(container) {
  // Remove existing notice if present
  const existingNotice = container.querySelector('.mobile-tooltip-notice');
  if (existingNotice) existingNotice.remove();

  // Only show on mobile when quick buy is enabled
  const isMobile = IS_MOBILE_OR_TABLET();
  if (!isMobile || !options?.quickBuy) return;

  // Check if user has dismissed this notice (use localStorage)
  const dismissedKey = 'skillTreeMobileNotice_dismissed';
  if (localStorage.getItem(dismissedKey) === 'true') return;

  const notice = document.createElement('div');
  notice.className = 'mobile-tooltip-notice';
  notice.innerHTML = html`
    <div class="mobile-tooltip-notice-content">
      <button class="mobile-tooltip-notice-close" aria-label="Close">&times;</button>
      <div class="mobile-tooltip-notice-text">
        <svg class="mobile-tooltip-notice-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>${t('skillTree.mobileTooltipNotice')}</span>
      </div>
      <button class="mobile-tooltip-notice-action" data-tab="options">
        ${t('skillTree.mobileTooltipNotice.goToOptions')}
      </button>
    </div>
  `;

  // Insert after the header
  const header = container.querySelector('.skill-points-header');
  if (header && header.nextSibling) {
    container.insertBefore(notice, header.nextSibling);
  } else {
    container.insertBefore(notice, container.firstChild);
  }

  // Close button handler
  const closeBtn = notice.querySelector('.mobile-tooltip-notice-close');
  closeBtn.addEventListener('click', () => {
    notice.remove();
    localStorage.setItem(dismissedKey, 'true');
  });

  // Action button handler - navigate to options tab
  const actionBtn = notice.querySelector('.mobile-tooltip-notice-action');
  actionBtn.addEventListener('click', () => {
    const optionsTab = document.querySelector('[data-tab="options"]');
    if (optionsTab) {
      optionsTab.click();
      notice.remove();
      localStorage.setItem(dismissedKey, 'true');
    }
  });
}

// --- Slot Display Toggles ---
function renderDisplayToggles() {
  const eligibleSkills = Object.entries(skillTree.skills)
    .filter(([id, data]) => {
      const base = skillTree.getSkill(id);
      return base && base.type() !== 'passive' && data.level > 0;
    })
    .map(([id]) => ({ ...skillTree.getSkill(id), id }));

  renderSkillToggleSection(
    'display-section',
    'skillTree.slotDisplaySettings',
    eligibleSkills,
    (skillId) => skillTree.isDisplayEnabled(skillId),
    (skill, e) => {
      skillTree.setDisplay(skill.id, e.target.checked);
      updateActionBar();
    },
    'display-switch',
  );
}

function setupSkillTreeFloatingHeader(container, header) {
  cleanupSkillTreeHeaderFloating?.();
  cleanupSkillTreeHeaderFloating = null;
  updateSkillTreeHeaderFloating = null;


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

  // Check if there's a specialization selected and use its avatar
  let avatarToUse = selectedPath?.avatar();
  let nameToUse = selectedPath.name();

  if (skillTree.selectedSpecialization) {
    const spec = getSpecialization(skillTree.selectedPath.name, skillTree.selectedSpecialization.id);
    if (spec && spec.avatar) {
      avatarToUse = spec.avatar();
      nameToUse = spec.name();
    }
  }

  if (characterAvatarEl && avatarToUse) {
    // Remove any previous img
    let img = characterAvatarEl.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.alt = nameToUse + ' avatar';
      characterAvatarEl.innerHTML = '';
      characterAvatarEl.appendChild(img);
    }
    img.src = `${import.meta.env.VITE_BASE_PATH}/avatars/${avatarToUse}`;
    img.alt = nameToUse + ' avatar';
  }

  const characterName =
    skillTree.selectedPath.name.charAt(0).toUpperCase() + skillTree.selectedPath.name.slice(1).toLowerCase();
  const sessionStatusGroup = characterNameEl.querySelector('.session-status-group');
  const heroAilments = characterNameEl.querySelector('.hero-ailments');
  characterNameEl.innerHTML = `<span class="character-name">${characterName}</span> (${t('skillTree.level')}: ${hero.level})`;
  if (heroAilments) {
    characterNameEl.appendChild(heroAilments);
  }
  if (sessionStatusGroup) {
    characterNameEl.appendChild(sessionStatusGroup);
  }

  const container = document.getElementById('skill-tree-container');

  const skillPointsHeader = container.querySelector('.skill-points-header');
  if (skillPointsHeader) {
    const showQtyControls = options?.quickBuy || options?.bulkBuy;
    let quickControls = '';
    if (showQtyControls) {
      if (options.useNumericInputs) {
        const val = skillTree.quickQty === 'max' ? options.skillQuickQty || 1 : skillTree.quickQty;
        quickControls = `
        <div class="skill-qty-controls">
          <input type="number" class="skill-qty-input input-number" min="1" value="${val}" />
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
        </div>`;
      } else {
        quickControls = `
        <div class="skill-qty-controls">
          <button data-qty="1" class="${skillTree.quickQty === 1 ? 'active' : ''}">1</button>
          <button data-qty="5" class="${skillTree.quickQty === 5 ? 'active' : ''}">5</button>
          <button data-qty="25" class="${skillTree.quickQty === 25 ? 'active' : ''}">25</button>
          <button data-qty="max" class="${skillTree.quickQty === 'max' ? 'active' : ''}">${t('common.max')}</button>
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

    const controlsMarkup =
      quickControls || bulkControls ? `<div class="skill-header-controls">${quickControls}${bulkControls}</div>` : '';

    const specTabActive = document.getElementById('specializations-tab-content')?.classList.contains('active');
    const pointsLabel = specTabActive ? t('skillTree.specializationPoints') : t('skillTree.availablePoints');
    const pointsValue = specTabActive ? skillTree.specializationPoints : skillTree.skillPoints;

    skillPointsHeader.innerHTML = `
    <div class="skill-header-left">
      <span class="skill-path-name">${characterName}</span>
      <span class="skill-points">${pointsLabel}: ${pointsValue}</span>
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
          if (input) input.value = SKILLS_MAX_QTY;
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
  }

  // Update Specialization Header if present
  const specHeader = container.querySelector('.selected-specialization-header');
  if (specHeader) {
    const pointsDisplay = specHeader.querySelector('.spec-points-display');
    if (pointsDisplay) {
      pointsDisplay.textContent = `${t('skillTree.specializationPoints')}: ${formatNumber(skillTree.specializationPoints)}`;
    }

    // Update active state of quantity buttons
    const qtyControls = specHeader.querySelector('.skill-qty-controls');
    if (qtyControls) {
      if (options.useNumericInputs) {
        const input = qtyControls.querySelector('.skill-qty-input');
        const maxBtn = qtyControls.querySelector('button[data-qty="max"]');
        if (input && document.activeElement !== input) {
          const val = skillTree.quickQty === 'max' ? options.skillQuickQty || 1 : skillTree.quickQty;
          input.value = val;
        }
        if (maxBtn) {
          maxBtn.classList.toggle('active', skillTree.quickQty === 'max');
        }
      } else {
        qtyControls.querySelectorAll('button').forEach((btn) => {
          const btnQty = btn.dataset.qty === 'max' ? 'max' : parseInt(btn.dataset.qty, 10);
          btn.classList.toggle('active', skillTree.quickQty === btnQty);
        });
      }
    }

    // Update bulk cost
    const bulkCostEl = specHeader.querySelector('.skill-bulk-cost');
    const bulkBtn = specHeader.querySelector('.bulk-buy');
    if (bulkCostEl && bulkBtn) {
      const { totalCost, affordable } = skillTree.calculateSpecializationBulkAllocation(skillTree.quickQty);
      bulkCostEl.textContent = `${t('skillTree.cost')}: ${formatNumber(totalCost)} ${t('skillTree.specializationPoints')}`;
      bulkCostEl.classList.toggle('unaffordable', !affordable);
      bulkBtn.disabled = totalCost === 0 || !affordable;
    }
  }

  updateSkillBulkCostDisplay();

  updateSkillTreeHeaderFloating?.();

  // Update Specialization Skills
  container.querySelectorAll('.skill-node.specialization-node').forEach((node) => {
    const skillId = node.dataset.skillId;
    const skill = skillTree.getSpecializationSkill(skillId);
    if (!skill) return;

    const currentLevel = skill.level || 0;
    const canUnlock = skillTree.canUnlockSpecializationSkill(skillId, false);

    const levelDisplay = node.querySelector('.skill-level');
    levelDisplay.textContent = skill.maxLevel() == Infinity ? `${currentLevel}` : `${currentLevel}/${skill.maxLevel()}`;

    node.classList.toggle('available', canUnlock);
    node.classList.toggle('unlocked', currentLevel > 0);
  });

  // Check if we need to re-render specialization skills due to visibility changes
  if (skillTree.selectedSpecialization) {
    const renderedSpecSkills = new Set(
      Array.from(container.querySelectorAll('.skill-node.specialization-node')).map((n) => n.dataset.skillId),
    );
    const spec = getSpecialization(skillTree.selectedPath.name, skillTree.selectedSpecialization.id);
    const allSpecSkills = spec?.skills || {};
    const needsSpecRender = Object.entries(allSpecSkills).some(([skillId, skillData]) => {
      const isVisible =
        typeof skillData.isVisible === 'function' ? skillData.isVisible() : skillData.isVisible !== false;
      return isVisible && !renderedSpecSkills.has(skillId);
    });

    if (needsSpecRender) {
      initializeSpecializationsTab();
    }
  }

  // Check if we need to re-render normal skills due to visibility changes
  if (skillTree.selectedPath) {
    const renderedSkills = new Set(
      Array.from(container.querySelectorAll('.skill-node:not(.specialization-node)')).map((n) => n.dataset.skillId),
    );
    const allSkills = SKILL_TREES[skillTree.selectedPath.name] || {};
    const needsRender = Object.entries(allSkills).some(([skillId, skillData]) => {
      const isVisible =
        typeof skillData.isVisible === 'function' ? skillData.isVisible() : skillData.isVisible !== false;
      const levelMet = skillData.requiredLevel() <= hero.level;
      return isVisible && levelMet && !renderedSkills.has(skillId);
    });

    if (needsRender) {
      initializeSkillsTab();
    }
  }

  // Update Normal Skills
  container.querySelectorAll('.skill-node:not(.specialization-node)').forEach((node) => {
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

// Removed - using showSkillTreeWithTabs
let skillModal;
let currentSkillId;
let selectedSkillQty = 1;

function initializeSkillModal() {
  if (skillModal) return;
  // Build skill modal content
  const content = html`
    <div class="skill-modal-content">
      <span class="modal-close">&times;</span>
      <div class="skill-modal-tooltip-content">
         <!-- Tooltip injected here -->
      </div>
      <div class="skill-modal-footer">
         <div class="skill-modal-resources">
            <div class="modal-available-points-display">${t('skillTree.available')}: <span class="modal-available-points"></span></div>
            <div class="modal-cost-display">${t('skillTree.cost')}: <span class="modal-sp-cost"></span></div>
         </div>
         <div class="modal-controls">
           <!-- Controls rendered dynamically -->
         </div>
         <button class="modal-buy">Buy</button>
      </div>
    </div>
  `;
  // Create via shared helper
  skillModal = createModal({
    id: 'skill-modal',
    className: 'skill-modal hidden',
    content,
    onClose: closeSkillModal,
  });
  // Attach buy handler
  skillModal.querySelector('.modal-buy').onclick = () => buySkillBulk();
}

function renderSkillModalControls() {
  renderGenericSkillModalControls(skillModal.querySelector('.modal-controls'), {
    currentQty: () => selectedSkillQty,
    onQtyChange: (q) => { selectedSkillQty = q; },
    updateDetails: updateSkillModalDetails,
    isNumeric: options.useNumericInputs,
  });
}

function openSkillModal(skillId) {
  initializeSkillModal();
  currentSkillId = skillId;
  selectedSkillQty = 1;
  renderSkillModalControls();
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
  // Quantity used for displaying cost should reflect the selected amount,
  // even if unaffordable (except 'max', which depends on affordability).
  const displayQty = selectedSkillQty === 'max' ? maxQty : isNaN(qty) ? 0 : qty;

  // Render Tooltip Content
  const tooltipContainer = skillModal.querySelector('.skill-modal-tooltip-content');
  const effectsCurrent = skillTree.getSkillEffect(currentSkillId, currentLevel);

  // Use buy quantity for preview
  const additionalLevels = (isNaN(displayQty) || displayQty <= 0) ? 1 : displayQty;
  const targetLevel = currentLevel + additionalLevels;

  const effectsTarget = skillTree.getSkillEffect(currentSkillId, targetLevel);

  // Render Tooltip
  tooltipContainer.innerHTML = generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsTarget, targetLevel);

  // Update modal fields
  skillModal.querySelector('.modal-available-points').textContent = skillTree.skillPoints;

  // Update SP cost display and button labels
  const displayCost = skillTree.calculateSkillPointCost(currentLevel, displayQty);
  skillModal.querySelector('.modal-sp-cost').textContent = displayCost + ' SP';

  if (options.useNumericInputs) {
    const maxBtn = skillModal.querySelector('.max-btn');
    if (maxBtn) {
      const btnCost = skillTree.calculateSkillPointCost(currentLevel, maxQty);
      maxBtn.textContent = t('common.max') + ' (' + btnCost + ' SP)';
    }
    const input = skillModal.querySelector('.skill-qty-input');
    if (input && selectedSkillQty === 'max') {
      input.value = maxQty;
    }
  } else {
    skillModal.querySelectorAll('.modal-controls button').forEach((btn) => {
      const v = btn.dataset.qty;
      const rawQty = v === 'max' ? maxQty : parseInt(v, 10);
      const btnCost = skillTree.calculateSkillPointCost(currentLevel, isNaN(rawQty) ? 0 : rawQty);
      btn.textContent = (v === 'max' ? t('common.max') : '+' + v) + ' (' + btnCost + ' SP)';
    });
  }

  // Update buy button
  const buyBtn = skillModal.querySelector('.modal-buy');
  buyBtn.disabled = actualQty <= 0;
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

  const levelText = `${skillTree.skills[skill.id]?.level || 0}${skill.maxLevel() !== Infinity ? `/${skill.maxLevel()}` : ''}`;
  const skillElement = buildSkillNodeElement(skill, { levelText });

  skillElement.addEventListener('mouseenter', (e) => {
    if (IS_MOBILE_OR_TABLET()) return;
    showTooltip(updateTooltipContent(skill.id), e);
  });
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

  return generateSkillTooltipHtml(skill, currentLevel, effectsCurrent, effectsNext);
};

export function updateActionBar() {
  const skillSlotsContainer = document.querySelector('.skill-slots');
  if (!skillSlotsContainer) return;

  skillSlotsContainer.innerHTML = '';
  let slotNumber = 1;

  // Render skills in a deterministic order based on the class skill constants
  const orderedIds = Object.keys(SKILL_TREES[skillTree.selectedPath?.name] || {});

  // Sort skills to ensure they always appear in the same order
  // We sort by required level (tier) first, then by ID
  const sortedIds = [...orderedIds].sort((a, b) => {
    const skillA = skillTree.getSkill(a);
    const skillB = skillTree.getSkill(b);

    if (!skillA || !skillB) return 0;

    const levelA = typeof skillA.requiredLevel === 'function' ? skillA.requiredLevel() : 0;
    const levelB = typeof skillB.requiredLevel === 'function' ? skillB.requiredLevel() : 0;

    if (levelA !== levelB) {
      return levelA - levelB;
    }

    return a.localeCompare(b);
  });

  sortedIds.forEach((skillId) => {
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
      <div class="tooltip-level">${t('skillTree.level')}: ${level}</div>
      <div class="tooltip-mana">${t(hero.stats.convertManaToLifePercent >= 1 ? 'skillTree.lifeCost' : 'skillTree.manaCost')}: ${skillTree.getSkillManaCost(skill, level).toFixed(2)} (+${(skillTree.getSkillManaCost(skill, level + 1) - skillTree.getSkillManaCost(skill, level)).toFixed(2)})</div>
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
  const cooldownMs = skillTree.getSkillCooldown(skill, level);
  if (cooldownMs) {
    tooltip += `<div class="tooltip-cooldown">${t('skillTree.cooldown')}: ${(cooldownMs / 1000).toFixed(2)}s</div>`;
  }
  const durationMs = skillTree.getSkillDuration(skill, level);
  if (durationMs) {
    tooltip += `<div class="tooltip-duration">${t('skillTree.duration')}: ${(durationMs / 1000).toFixed(2)}s</div>`;
  }

  // Add summon stats for summon skills
  if (skill?.type && skill.type() === 'summon' && typeof skill.summonStats === 'function') {
    const summonStats = getDisplayedSummonStats(skill.summonStats(level));
    tooltip += `<div class="tooltip-effects"><u>${t('skillTree.summonStats')}:</u>`;
    Object.entries(summonStats).forEach(([stat, value]) => {
      if (!shouldShowStatValue(stat)) {
        tooltip += `<div>${formatStatName(stat)}</div>`;
        return;
      }

      if (typeof value !== 'number') {
        tooltip += `<div>${formatStatName(stat)}</div>`;
        return;
      }

      const decimals = stat === 'attackSpeed' ? 2 : getStatDecimals(stat);
      tooltip += `<div>${formatStatName(stat)}: ${value.toFixed(decimals)}</div>`;
    });
    tooltip += '</div>';

    const summonDamage = calculateSummonDamage(skill, level);
    if (summonDamage && summonDamage.damage > 0) {
      tooltip += `<div class="tooltip-total-damage">${t('skill.totalPotentialDamage')}: ${formatNumber(summonDamage.damage)}</div>`;
    }
  }

  if (skill?.type && skill.type() === 'instant' && skillTree.isDamageSkill?.(effects)) {
    // Compute allowedDamageTypes for spells, same as useInstantSkill
    const skillTypeSource = skill?.skill_type ?? skill?.skillType;
    const resolvedSkillType = typeof skillTypeSource === 'function' ? skillTypeSource() : skillTypeSource;
    const skillType = (resolvedSkillType || 'attack').toLowerCase();
    const isSpell = skillType === 'spell';

    let damageEffects = effects;
    if (isSpell) {
      const allowedDamageTypes = getSpellDamageTypes(effects);
      damageEffects = {
        ...effects,
        ...(allowedDamageTypes.length ? { allowedDamageTypes } : {}),
      };
    }

    const damagePreview = hero.calculateTotalDamage(damageEffects, { includeRandom: false });

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
      ((skill.type() === 'buff' || skill.type() === 'summon') && skillTree.activeBuffs.has(skillId)) ||
      (skill.type() === 'toggle' && skill.active);

    slot.classList.toggle('active', isActive);

    // Update stack count for summons
    let stackCountEl = slot.querySelector('.stack-count');
    if (!stackCountEl) {
      stackCountEl = document.createElement('div');
      stackCountEl.className = 'stack-count';
      slot.appendChild(stackCountEl);
    }

    if (skill.type() === 'summon' && skillTree.activeBuffs.has(skillId)) {
      const instances = skillTree.activeBuffs.get(skillId);
      const count = Array.isArray(instances) ? instances.length : 1;
      if (count >= 1) {
        stackCountEl.textContent = count;
        stackCountEl.style.display = 'block';
      } else {
        stackCountEl.style.display = 'none';
      }
    } else {
      stackCountEl.style.display = 'none';
    }

    // Show cooldown for both buff and instant skills
    if (
      (skill.type() === 'buff' || skill.type() === 'instant' || skill.type() === 'summon') &&
      skill?.cooldownEndTime
    ) {
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
