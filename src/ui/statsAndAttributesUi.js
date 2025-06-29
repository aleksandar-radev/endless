import { hero } from '../globals.js';
import { STATS } from '../constants/stats/stats.js';
import { hideTooltip, positionTooltip, showTooltip } from '../ui/ui.js';
import { OFFENSE_STATS } from '../constants/stats/offenseStats.js';
import { DEFENSE_STATS } from '../constants/stats/defenseStats.js';
import { MISC_STATS } from '../constants/stats/miscStats.js';
import { formatStatName } from '../ui/ui.js';
import { ATTRIBUTE_TOOLTIPS, ATTRIBUTES } from '../constants/stats/attributes.js';
import { ELEMENTS } from '../constants/common.js';

const html = String.raw;

// allocation mode selector (global for attribute buttons)
let allocationMode = 1;

export function updateStatsAndAttributesUI() {
  // Create .stats-grid if it doesn't exist
  let statsGrid = document.querySelector('.stats-grid');
  if (!statsGrid) {
    statsGrid = document.createElement('div');
    statsGrid.className = 'stats-grid';
    // Insert as the only child of the #stats tab panel
    const statsTab = document.getElementById('stats');
    if (statsTab) {
      statsTab.innerHTML = '';
      statsTab.appendChild(statsGrid);
    }
  }

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector('.stats-container');
  let attributesContainer = document.querySelector('.attributes-container');

  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    // Header: level, EXP, highest stage
    const headerHtml = html`
      <div><strong>Level:</strong> <span id="level-value">${hero.level || 1}</span></div>
      <div>
        <strong>EXP:</strong> <span id="exp-value">${hero.exp || 0}</span> /
        <span id="exp-to-next-level-value">${hero.getExpToNextLevel() || 100}</span>
        (<span id="exp-progress">${((hero.exp / hero.getExpToNextLevel()) * 100).toFixed(1)}%</span>)
      </div>
      <div><strong>Highest Stage:</strong><span id="highest-stage-value">${hero.highestStage}</span></div>
      <hr style="border: none; border-top: 1px solid #fff; margin: 10px 0;" />
    `;
    // Create tab buttons
    const tabsHtml = html`
      <div class="stats-tabs">
        <button class="subtab-btn active" data-subtab="offense">Offense</button>
        <button class="subtab-btn" data-subtab="defense">Defense</button>
        <button class="subtab-btn" data-subtab="misc">Misc</button>
      </div>
    `;
    // Combine header and tabs
    statsContainer.innerHTML = headerHtml + tabsHtml;
    // Create panels
    const createPanel = (name) => {
      const panel = document.createElement('div');
      panel.className = 'stats-panel';
      if (name === 'offense') panel.classList.add('active');
      panel.id = `${name}-panel`;
      return panel;
    };
    const offensePanel = createPanel('offense');
    const defensePanel = createPanel('defense');
    const miscPanel = createPanel('misc');
    // Populate panels based on showInUI flags
    const addStatsToPanel = (panel, statsDef) => {
      const elementalKeys = ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'];
      const collectedElementals = [];
      Object.keys(statsDef).forEach((key) => {
        if (!statsDef[key].showInUI && key !== 'extraMaterialDropPercent') return;
        // Collect elementals separately for offense panel
        if (panel === offensePanel && elementalKeys.includes(key)) {
          collectedElementals.push(key);
          return;
        }
        const row = document.createElement('div');
        row.className = 'stat-row';
        const lbl = document.createElement('span');
        lbl.className = 'stat-label';
        lbl.textContent = formatStatName(key);
        const span = document.createElement('span');
        span.id = `${key}-value`;
        let val = hero.stats[key];
        // Special formatting for extraMaterialDropPercent
        if (key === 'extraMaterialDropPercent') {
          val = (val * 100).toFixed(1) + '%';
        } else if (typeof val === 'number' && statsDef[key].decimalPlaces !== undefined) {
          val = val.toFixed(statsDef[key].decimalPlaces);
        }
        span.textContent = val;
        row.appendChild(lbl);
        row.appendChild(document.createTextNode(' '));
        row.appendChild(span);
        panel.appendChild(row);
        // Add tooltip if defined (special-case elemental stats)
        const baseKey = lbl.textContent.replace(/[^a-zA-Z]/g, '');
        let tooltipFn = ATTRIBUTE_TOOLTIPS[`get${baseKey}Tooltip`];
        // For offense elementals override tooltip
        if (panel === offensePanel && ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'].includes(key)) {
          tooltipFn = ATTRIBUTE_TOOLTIPS.getElementalDamageTooltip;
        }
        if (tooltipFn) {
          lbl.addEventListener('mouseenter', (e) => showTooltip(tooltipFn(), e));
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
        }
      });
      // After other stats, render elemental grid in offense panel
      if (panel === offensePanel && collectedElementals.length) {
        const iconMap = {
          fireDamage: ELEMENTS.fire.icon,
          coldDamage: ELEMENTS.cold.icon,
          airDamage: ELEMENTS.air.icon,
          earthDamage: ELEMENTS.earth.icon,
        };
        const grid = document.createElement('div');
        grid.className = 'elemental-stats-grid';
        ['fireDamage', 'coldDamage', 'airDamage', 'earthDamage'].forEach((key) => {
          if (!collectedElementals.includes(key)) return;
          const row = document.createElement('div');
          row.className = 'elemental-row';
          const icon = document.createElement('span');
          icon.textContent = iconMap[key];
          const lbl = document.createElement('strong');
          lbl.textContent = formatStatName(key);
          // Add tooltip for elemental damage
          lbl.addEventListener('mouseenter', (e) => showTooltip(ATTRIBUTE_TOOLTIPS.getElementalDamageTooltip(), e));
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
          const span = document.createElement('span');
          span.id = `${key}-value`;
          let val = hero.stats[key];
          span.textContent = val;
          row.appendChild(icon);
          row.appendChild(lbl);
          row.appendChild(document.createTextNode(' '));
          row.appendChild(span);
          grid.appendChild(row);
        });
        panel.appendChild(grid);
      }
    };
    addStatsToPanel(offensePanel, OFFENSE_STATS);
    addStatsToPanel(defensePanel, DEFENSE_STATS);
    addStatsToPanel(miscPanel, MISC_STATS);
    statsContainer.appendChild(offensePanel);
    statsContainer.appendChild(defensePanel);
    statsContainer.appendChild(miscPanel);
    // Tab switching logic
    statsContainer.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // mark button active
        statsContainer.querySelectorAll('.subtab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.dataset.subtab;
        // toggle panels
        statsContainer.querySelectorAll('.stats-panel').forEach((p) => p.classList.remove('active'));
        const target = statsContainer.querySelector(`#${sub}-panel`);
        if (target) target.classList.add('active');
      });
    });
    statsGrid.appendChild(statsContainer);
  } else {
    // Update all dynamic stats values
    Object.keys(hero.stats).forEach((key) => {
      const el = document.getElementById(`${key}-value`);
      if (el) {
        // Special formatting for certain stats
        if (key === 'attackSpeed') {
          el.textContent = hero.stats.attackSpeed.toFixed(STATS.attackSpeed.decimalPlaces);
        } else if (key === 'critChance') {
          el.textContent = hero.stats.critChance.toFixed(STATS.critChance.decimalPlaces) + '%';
        } else if (key === 'critDamage') {
          el.textContent = hero.stats.critDamage.toFixed(STATS.critDamage.decimalPlaces) + 'x';
        } else if (key === 'lifeSteal') {
          el.textContent = hero.stats.lifeSteal.toFixed(STATS.lifeSteal.decimalPlaces) + '%';
        } else if (key === 'lifeRegen') {
          el.textContent = hero.stats.lifeRegen.toFixed(STATS.lifeRegen.decimalPlaces);
        } else if (key === 'manaRegen') {
          el.textContent = hero.stats.manaRegen.toFixed(STATS.manaRegen.decimalPlaces);
        } else if (key === 'blockChance') {
          el.textContent = hero.stats.blockChance.toFixed(STATS.blockChance.decimalPlaces) + '%';
        } else if (key === 'bonusGoldPercent') {
          el.textContent = (hero.stats.bonusGoldPercent * 100).toFixed(STATS.bonusGoldPercent.decimalPlaces) + '%';
        } else if (key === 'bonusExperiencePercent') {
          el.textContent =
            (hero.stats.bonusExperiencePercent * 100).toFixed(STATS.bonusExperiencePercent.decimalPlaces) + '%';
        } else if (key === 'extraMaterialDropPercent') {
          el.textContent =
            (hero.stats.extraMaterialDropPercent * 100).toFixed(STATS.extraMaterialDropPercent.decimalPlaces) + '%';
        } else {
          el.textContent = hero.stats[key];
        }
      }
    });

    // Update header values
    document.getElementById('level-value').textContent = hero.level || 1;
    document.getElementById('exp-value').textContent = hero.exp || 0;
    document.getElementById('exp-progress').textContent =
      ((hero.exp / hero.getExpToNextLevel()) * 100).toFixed(1) + '%';
    document.getElementById('exp-to-next-level-value').textContent = hero.getExpToNextLevel() || 100;
    document.getElementById('highest-stage-value').textContent = hero.highestStage;

    // Add hit chance percentage to attackRating
    const attackRatingEl = document.getElementById('attackRating-value');
    if (attackRatingEl) {
      attackRatingEl.textContent = hero.stats.attackRating;
      const hitPct = hero.calculateHitChance().toFixed(2) + '%';
      attackRatingEl.appendChild(document.createTextNode(` (${hitPct})`));
    }

    // Add armor reduction percentage to armor
    const armorEl = document.getElementById('armor-value');
    if (armorEl) {
      armorEl.textContent = hero.stats.armor || 0;
      const ar = hero.calculateArmorReduction().toFixed(2) + '%';
      armorEl.appendChild(document.createTextNode(` (${ar})`));
    }

    // add evasion reduction percentage to evasion
    const evasionEl = document.getElementById('evasion-value');
    if (evasionEl) {
      evasionEl.textContent = hero.stats.evasion || 0;
      const er = hero.calculateEvasionChance().toFixed(2) + '%';
      evasionEl.appendChild(document.createTextNode(` (${er})`));
    }
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = html`
      <div class="attributes-header">
        <h3 id="attributes">Attributes (+${hero.statPoints})</h3>
        <div class="allocate-modes" style="margin-bottom:8px;">
          <button class="mode-btn" data-amount="1">+1</button>
          <button class="mode-btn" data-amount="30">+30</button>
          <button class="mode-btn" data-amount="60">+60</button>
          <button class="mode-btn" data-amount="120">+120</button>
          <button class="mode-btn" data-amount="max">MAX</button>
        </div>
      </div>
      <div class="attributes-body">
        ${Object.entries(hero.stats)
    .map(([stat, value]) => {
      if (!ATTRIBUTES[stat]) return '';
      const displayName = stat.charAt(0).toUpperCase() + stat.slice(1);
      return `
            <div class="attribute-row">
              <button class="allocate-btn" data-stat="${stat}">+</button>
              <strong>${displayName}:</strong>
              <span id="${stat}-value">${hero.stats[stat]}</span>
            </div>
          `;
    })
    .join('')}
      </div>
    `;

    // mode button handlers
    attributesContainer.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        allocationMode = btn.dataset.amount;
        attributesContainer.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    // set default active mode
    attributesContainer.querySelector(`.mode-btn[data-amount="${allocationMode}"]`).classList.add('active');

    attributesContainer.querySelectorAll('.attribute-row').forEach((row) => {
      const stat = row.querySelector('button').dataset.stat;
      row.addEventListener('mouseenter', (e) =>
        showTooltip(ATTRIBUTE_TOOLTIPS[`get${stat.charAt(0).toUpperCase() + stat.slice(1)}Tooltip`](), e),
      );
      row.addEventListener('mousemove', positionTooltip);
      row.addEventListener('mouseleave', hideTooltip);
    });

    // attach allocate handler
    attributesContainer.querySelectorAll('.allocate-btn').forEach((btn) => {
      btn.addEventListener('mousedown', (e) => {
        const stat = e.target.dataset.stat;

        // Allocate based on allocationMode using bulk allocation
        if (allocationMode === 'max') {
          hero.allocateStatBulk(stat, hero.statPoints);
        } else {
          const count = parseInt(allocationMode, 10) || 1;
          hero.allocateStatBulk(stat, count);
        }
        updateStatsAndAttributesUI();

        let intervalId, holdingTimeout;
        const startHolding = () => {
          clearInterval(intervalId);
          intervalId = setInterval(() => {
            if (hero.statPoints > 0) {
              if (allocationMode === 'max') {
                hero.allocateStatBulk(stat, hero.statPoints);
              } else {
                const count = parseInt(allocationMode, 10) || 1;
                hero.allocateStatBulk(stat, count);
              }
              updateStatsAndAttributesUI();
            } else stopHolding();
          }, 100);
        };
        const stopHolding = () => {
          clearTimeout(holdingTimeout);
          clearInterval(intervalId);
          document.removeEventListener('mouseup', stopHolding);
          document.removeEventListener('mouseleave', stopHolding);
        };
        holdingTimeout = setTimeout(startHolding, 500);
        document.addEventListener('mouseup', stopHolding);
        document.addEventListener('mouseleave', stopHolding);
      });
    });

    // Add attributes container to the grid
    statsGrid.appendChild(attributesContainer);
  } else {
    document.getElementById('attributes').textContent = `Attributes (+${hero.statPoints})`;
    // Update dynamic attribute values
    document.getElementById('strength-value').textContent = hero.stats['strength'];
    document.getElementById('agility-value').textContent = hero.stats['agility'];
    document.getElementById('vitality-value').textContent = hero.stats['vitality'];
    document.getElementById('wisdom-value').textContent = hero.stats['wisdom'];
    document.getElementById('endurance-value').textContent = hero.stats['endurance'];
    document.getElementById('dexterity-value').textContent = hero.stats['dexterity'];
  }

  const skillTreeTab = document.querySelector('[data-tab="skilltree"]');
  skillTreeTab.classList.remove('hidden');
}
