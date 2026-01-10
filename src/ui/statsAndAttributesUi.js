import { game, hero, statistics, options, training, soulShop, ascension } from '../globals.js';
import { getDivisor, getStatDecimalPlaces } from '../constants/stats/stats.js';
import { hideTooltip, positionTooltip, showTooltip, updateEnemyStats, formatNumber, switchTab } from '../ui/ui.js';
import { OFFENSE_STATS } from '../constants/stats/offenseStats.js';
import { DEFENSE_STATS } from '../constants/stats/defenseStats.js';
import { MISC_STATS } from '../constants/stats/miscStats.js';
import { formatStatName } from '../ui/ui.js';
import { getAttributeTooltip, ATTRIBUTES } from '../constants/stats/attributes.js';
import { calculateArmorReduction,
  calculateEvasionChance,
  calculateHitChance,
  calculateResistanceReduction } from '../combat.js';
import { createModal } from './modal.js';
import { t, tp } from '../i18n.js';
import { updateInventoryGrid } from './inventoryUi.js';
import { renderRunesUI } from './runesUi.js';
import { updateAscensionUI } from './ascensionUi.js';
import { updateSkillTreeValues } from './skillTreeUi.js';
import { updateBuildingAffordability } from './buildingUi.js';
import { ELEMENTS } from '../constants/common.js';

const html = String.raw;

// allocation mode selector (global for attribute buttons)
let allocationMode = 1;
let rateIntervalId = null;
let startTimeInFights = 0;
let startGold = 0;
let startExp = 0;
let startItems = 0;
let startMaterialsDropped = 0;
let sessionXp = 0;
let sessionDamage = 0;
let listenersAttached = false;
let bottomBar = null;

// Ordered subcategories for each stat group. Stats define their own
// `subcategory` property which determines the panel they appear in.
const SUBCATEGORIES = {
  offense: ['attack', 'elemental', 'misc'],
  defense: ['defense', 'elemental', 'misc'],
  misc: ['resources', 'rewards', 'misc'],
};

const ELEMENT_IDS = Object.keys(ELEMENTS);

const DAMAGE_PERCENT_SOURCES = {
  damage: ['totalDamagePercent', 'damagePercent'],
  elementalDamage: ['totalDamagePercent', 'elementalDamagePercent'],
  thornsDamage: {
    additive: ['totalDamagePercent', 'damagePercent'],
    percent: 'thornsDamagePercent',
  },
};

ELEMENT_IDS.forEach((id) => {
  DAMAGE_PERCENT_SOURCES[`${id}Damage`] = { additive: ['totalDamagePercent', 'elementalDamagePercent', `${id}DamagePercent`] };
});

function appendDamagePercentBonus(el, key) {
  const config = DAMAGE_PERCENT_SOURCES[key];
  if (!config || !el) return;

  const additiveKeys = Array.isArray(config) ? config : config.additive || [];
  const additiveTotal = additiveKeys.reduce((sum, statKey) => sum + (hero.stats?.[statKey] || 0), 0);

  let totalPercent = additiveTotal;
  let decimalKeys = [...additiveKeys];

  if (!Array.isArray(config) && config.percent) {
    const rawPercent = hero.stats?.[config.percent] || 0;
    const fraction = Math.abs(rawPercent) > 1 ? rawPercent / 100 : rawPercent;
    totalPercent += fraction;
    decimalKeys.push(config.percent);
  }

  if (!Number.isFinite(totalPercent)) return;

  const normalized = Math.abs(totalPercent) < 1e-6 ? 0 : totalPercent;
  const decimals = decimalKeys.reduce((max, statKey) => Math.max(max, getStatDecimalPlaces(statKey)), 0);
  const formattedPercent = (normalized * 100).toFixed(decimals);
  el.textContent = `${el.textContent} (${formattedPercent}%)`;
}

function formatPeriod(seconds) {
  if (seconds % 3600 === 0) return `${seconds / 3600}h`;
  if (seconds % 60 === 0) return `${seconds / 60}m`;
  return `${seconds}s`;
}

function updateRateCounters() {
  let ratePeriod = options.rateCountersPeriod || 1;
  const eligibilityBaseline =
    statistics.offlineEligibilityStart ?? startTimeInFights ?? statistics.totalTimeInFights ?? 0;
  const elapsed = statistics.totalTimeInFights - startTimeInFights;
  const eligibilityElapsed = (statistics.totalTimeInFights || 0) - eligibilityBaseline;
  const periodLabel = formatPeriod(ratePeriod);
  const formatRateLine = (labelKey, value) =>
    tp('counters.rateLine', {
      label: t(labelKey), period: periodLabel, value,
    });
  const dmgEls = document.querySelectorAll('.counter-damage');
  const xpEls = document.querySelectorAll('.counter-xp');
  const goldEls = document.querySelectorAll('.counter-gold');
  const itemsEls = document.querySelectorAll('.counter-items');
  const matEls = document.querySelectorAll('.counter-materials');
  const offlineEl = document.querySelector('.counter-offline');
  // Compute session fight time (since last resetRateCounters call)
  const eligible = (eligibilityElapsed || 0) >= 60;
  if (offlineEl) {
    const icon = offlineEl.querySelector('.offline-icon');
    const status = offlineEl.querySelector('.offline-status');
    if (icon) icon.textContent = eligible ? '✔' : '✖';
    if (status) {
      status.dataset.i18n = eligible ? 'counters.eligible' : 'counters.notEligible';
      status.textContent = eligible ? t('counters.eligible') : t('counters.notEligible');
    }
    offlineEl.classList.toggle('offline-eligible', eligible);
    offlineEl.classList.toggle('offline-not-eligible', !eligible);
  }
  if (!elapsed || elapsed <= 0) {
    dmgEls.forEach((el) => (el.textContent = formatRateLine('counters.damage', 0)));
    xpEls.forEach((el) => (el.textContent = formatRateLine('counters.xp', 0)));
    goldEls.forEach((el) => (el.textContent = formatRateLine('counters.gold', 0)));
    itemsEls.forEach((el) => (el.textContent = formatRateLine('counters.items', 0)));
    matEls.forEach((el) => (el.textContent = formatRateLine('counters.materials', 0)));
    // Only reset offline rates if we're not preserving them during offline collection
    if (!statistics.preserveOfflineRates) {
      statistics.offlineRates = {
        xp: 0, gold: 0, items: 0, materials: 0,
      };
    }
    return;
  }
  const damageRate = sessionDamage / elapsed;
  dmgEls.forEach(
    (el) => (el.textContent = formatRateLine('counters.damage', formatNumber((damageRate * ratePeriod).toFixed(1)))),
  );
  const xpRate = (statistics.totalExpFromCombat - startExp) / elapsed;
  xpEls.forEach(
    (el) => (el.textContent = formatRateLine('counters.xp', formatNumber((xpRate * ratePeriod).toFixed(1)))),
  );
  const goldRate = (statistics.totalGoldFromCombat - startGold) / elapsed;
  goldEls.forEach(
    (el) => (el.textContent = formatRateLine('counters.gold', formatNumber((goldRate * ratePeriod).toFixed(1)))),
  );
  const itemRate = (statistics.totalItemsFound - startItems) / elapsed;
  itemsEls.forEach(
    (el) => (el.textContent = formatRateLine('counters.items', formatNumber((itemRate * ratePeriod).toFixed(1)))),
  );
  const matRate = (statistics.totalMaterialsDropped - startMaterialsDropped) / elapsed;
  matEls.forEach(
    (el) => (el.textContent = formatRateLine('counters.materials', formatNumber((matRate * ratePeriod).toFixed(1)))),
  );
  // Only expose offlineRates after at least 60s spent in fights (eligibility)
  // But preserve existing rates if offline rewards are being collected
  if (!statistics.preserveOfflineRates) {
    if (eligible) {
      statistics.offlineRates = {
        xp: xpRate, gold: goldRate, items: itemRate, materials: matRate,
      };
    } else {
      statistics.offlineRates = {
        xp: 0, gold: 0, items: 0, materials: 0,
      };
    }
  }
}

function resetRateCounters() {
  const baseline = statistics.totalTimeInFights || 0;
  startTimeInFights = baseline;
  statistics.offlineEligibilityStart = baseline;
  startGold = statistics.totalGoldFromCombat;
  startExp = statistics.totalExpFromCombat;
  startItems = statistics.totalItemsFound;
  startMaterialsDropped = statistics.totalMaterialsDropped;
  sessionXp = 0;
  sessionDamage = 0;
  updateRateCounters();
}

function getAdvancedAttributeTooltip(attr) {
  const breakdown = hero.statBreakdown?.[attr];
  if (!breakdown) return '';

  const sources = [
    {
      name: 'Base', flat: Math.floor(breakdown.base), percent: 0,
    },
    {
      name: t('attributes.breakdown.allocated'), flat: Math.floor(breakdown.allocated), percent: 0,
    },
    {
      name: t('attributes.breakdown.potions'), flat: Math.floor(breakdown.perma), percent: breakdown.percent.perma,
    },
    {
      name: t('attributes.breakdown.prestige'), flat: Math.floor(breakdown.prestige), percent: breakdown.percent.prestige,
    },
    {
      name: t('attributes.breakdown.items'), flat: Math.floor(breakdown.items), percent: breakdown.percent.items,
    },
    {
      name: t('attributes.breakdown.skills'), flat: Math.floor(breakdown.skills), percent: breakdown.percent.skills,
    },
    {
      name: t('attributes.breakdown.training'), flat: Math.floor(breakdown.training), percent: breakdown.percent.training,
    },
    {
      name: t('attributes.breakdown.soulShop'), flat: Math.floor(breakdown.soul), percent: breakdown.percent.soul,
    },
  ].filter((s) => s.flat || s.percent);

  const totalFlat = sources.reduce((sum, s) => sum + (s.flat || 0), 0);
  const totalPercent = sources.reduce((sum, s) => sum + (s.percent || 0), 0);
  const finalValue = hero.stats[attr];

  let lines = sources
    .map((s) => `${s.name}: ${formatNumber(s.flat || 0)}${s.percent ? ` (${(s.percent * 100).toFixed(1)}%)` : ''}`)
    .join('<br />');

  const baseTooltip = getAttributeTooltip(attr);
  const ascKey = `${attr}EffectPercent`;
  const bonusMultiplier = ascension?.getBonuses?.()?.[ascKey] || 0;

  let ascInfo = '';

  if (bonusMultiplier > 0) {
    const effects = ATTRIBUTES[attr]?.effects || {};

    const extraTexts = Object.entries(effects).map(([statKey, baseVal]) => {
      const extra = baseVal * bonusMultiplier;

      const statName = formatStatName(statKey.replace('PerPoint', ''));

      return `+${formatNumber(extra.toFixed(2))} ${statName}`;
    });

    const extraStr = extraTexts.length ? ` (${extraTexts.join(', ')})` : '';

    ascInfo = `<div style="margin-top: 4px; font-size: 0.9em; color: var(--ascension);"><em>${t('stats.tooltip.ascensionBaseBonus')}:</em> +${(bonusMultiplier * 100).toFixed(0)}%<p>${extraStr}</p></div>`;
  }

  return html`
    <strong>${formatStatName(attr)}</strong><br />
    <div style="margin-bottom:8px; font-size:0.9em; color:var(--text-muted); border-bottom: 1px solid var(--border); padding-bottom: 4px;">
      ${baseTooltip}
    </div>
    ${lines} ${ascInfo}
    <hr style="border:none; border-top:1px solid var(--border); margin:4px 0" />
    <em>${t('attributes.breakdown.totalFlat')}:</em> ${formatNumber(totalFlat)}<br />
    <em>${t('attributes.breakdown.totalPercent')}:</em> ${(totalPercent * 100).toFixed(1)}%<br />
    <strong>${t('attributes.breakdown.total')}:</strong> ${formatNumber(finalValue)}
  `;
}

export function setRateCountersVisibility(show) {
  if (show) {
    if (!bottomBar) {
      bottomBar = document.createElement('div');
      bottomBar.className = 'rate-counters-bar';
      bottomBar.innerHTML = html`
        <div class="counter counter-offline offline-not-eligible">
          <span class="offline-icon">✖</span>
          <span data-i18n="counters.offline">${t('counters.offline')}</span>:
          <span class="offline-status" data-i18n="counters.notEligible">${t('counters.notEligible')}</span>
        </div>
        <div class="counter counter-damage"></div>
        <div class="counter counter-xp"></div>
        <div class="counter counter-gold"></div>
        <div class="counter counter-items"></div>
        <div class="counter counter-materials"></div>
        <button class="reset-btn" data-i18n="counters.reset">${t('counters.reset')}</button>
      `;
      document.body.appendChild(bottomBar);
      bottomBar.querySelector('.reset-btn').addEventListener('click', resetRateCounters);
      updateRateCounters();
    }
  } else if (bottomBar) {
    bottomBar.remove();
    bottomBar = null;
  }
}

document.addEventListener('toggleRateCounters', (e) => setRateCountersVisibility(e.detail));
// Allow other systems (e.g., offline reward collection) to request a counters reset
document.addEventListener('resetRateCounters', () => resetRateCounters());

export function updateStatsAndAttributesUI(forceRebuild = false) {
  // Create .stats-grid if it doesn't exist
  let statsGrid = document.querySelector('.stats-grid');
  if (forceRebuild && statsGrid) {
    statsGrid.innerHTML = '';
  }
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

  if (!listenersAttached) {
    resetRateCounters();
    document.addEventListener('xpGained', (e) => {
      sessionXp += e.detail;
    });
    document.addEventListener('damageDealt', (e) => {
      sessionDamage += e.detail;
    });
    document.addEventListener('ratePeriodChange', (e) => {
      options.rateCountersPeriod = e.detail;
      updateRateCounters();
    });
    if (rateIntervalId) clearInterval(rateIntervalId);
    rateIntervalId = setInterval(updateRateCounters, 1000);
    listenersAttached = true;
  }

  // Ensure sections exist; create them only if they don't
  let statsContainer = document.querySelector('.stats-container');
  let attributesContainer = document.querySelector('.attributes-container');

  if (forceRebuild) {
    statsContainer = null;
    attributesContainer = null;
  }

  if (!statsContainer) {
    statsContainer = document.createElement('div');
    statsContainer.className = 'stats-container';
    // Header: level, EXP
    const headerHtml = html`
      <div>
        <strong>${t('skillTree.level')}:</strong> <span id="level-value">${formatNumber(hero.level || 1)}</span>
      </div>
      <div>
        <strong>${t('stats.exp')}:</strong> <span id="exp-value">${formatNumber(Math.floor(hero.exp) || 0)}</span> /
        <span id="exp-to-next-level-value">${formatNumber(hero.getExpToNextLevel() || 100)}</span>
        (<span id="exp-progress">${((hero.exp / hero.getExpToNextLevel()) * 100).toFixed(1)}%</span>)
      </div>
      <hr style="border: none; border-top: 1px solid #fff; margin: 10px 0;" />
    `;
    // Initialize container with header
    statsContainer.innerHTML = headerHtml;

    const tabsHtml = html`
      <div class="stats-tabs">
        <button class="subtab-btn active" data-subtab="offense">${t('stats.offense')}</button>
        <button class="subtab-btn" data-subtab="defense">${t('stats.defense')}</button>
        <button class="subtab-btn" data-subtab="misc">${t('stats.misc')}</button>
        <button class="elemental-allocation-btn stats-elemental-btn" data-i18n="training.elementalDistributionButton">
          ${t('training.elementalDistributionButton')}
        </button>
        <button class="split-view-btn" id="split-view-btn">${t('stats.splitView')}</button>
      </div>
    `;
    statsContainer.innerHTML += tabsHtml;

    const splitBtn = statsContainer.querySelector('#split-view-btn');
    if (splitBtn) {
      splitBtn.addEventListener('click', openSplitView);
    }
    const allocationBtn = statsContainer.querySelector('.stats-elemental-btn');
    if (allocationBtn) {
      allocationBtn.addEventListener('click', () => training?.openElementalDistributionModal?.());
    }
    // Create panels
    const createPanel = (name) => {
      const panel = document.createElement('div');
      panel.className = 'stats-panel';
      if (!options.showAllStats) {
        panel.classList.add('default');
      } else {
        panel.classList.remove('default');
      }
      if (name === 'offense') panel.classList.add('active');
      panel.id = `${name}-panel`;
      return panel;
    };

    // Populate panels based on showInUI flags
    const addStatsToPanel = (panel, group, statsDef) => {
      const formatDisplayValue = (statKey, statValue) => {
        if (statKey === 'cooldownReductionPercent') {
          const cap = hero.stats.cooldownReductionCapPercent || 0.8;
          const raw = typeof statValue === 'number' ? statValue : 0;
          const effective = Math.min(raw, cap);
          const decimals = getStatDecimalPlaces(statKey);
          const divisor = getDivisor(statKey);
          let text = (effective * divisor).toFixed(decimals) + '%';
          if (raw > cap) {
            text += ` (${(raw * divisor).toFixed(decimals)}%)`;
          }
          return text;
        }

        if (typeof statValue === 'number') {
          const divisor = getDivisor(statKey);
          const decimals = getStatDecimalPlaces(statKey);
          let formattedValue;
          if (divisor !== 1) {
            formattedValue = formatNumber((statValue * divisor).toFixed(decimals)) + '%';
          } else {
            formattedValue = formatNumber(statValue.toFixed(decimals));
          }

          // Truncate to 12 digits (excluding separators, decimals, and percent sign)
          const strippedValue = formattedValue.replace(/[,\.%]/g, '');
          if (strippedValue.length > 12) {
            const numberPart = formattedValue.replace('%', '');
            const digitsOnly = numberPart.replace(/,/g, '');
            const num = parseFloat(digitsOnly);
            if (!isNaN(num)) {
              // Show first 12 significant digits with ellipsis
              const significantDigits = num.toPrecision(12);
              const truncated = formatNumber(parseFloat(significantDigits).toFixed(decimals));
              return truncated + (divisor !== 1 ? '%' : '') + '...';
            }
          }

          return formattedValue;
        }

        return formatNumber(statValue);
      };

      if (options.showAllStats) {
        const subcats = SUBCATEGORIES[group];
        const tabs = document.createElement('div');
        tabs.className = 'subcat-tabs';
        const subPanelsContainer = document.createElement('div');
        const subPanels = {};

        subcats.forEach((name, idx) => {
          const btn = document.createElement('button');
          btn.className = 'subcat-btn' + (idx === 0 ? ' active' : '');
          btn.dataset.subcat = name;
          btn.textContent = t(`stats.${group}.${name}`);
          tabs.appendChild(btn);

          const sp = document.createElement('div');
          sp.className = 'stat-subpanel' + (idx === 0 ? ' active' : '');
          subPanels[name] = sp;
          subPanelsContainer.appendChild(sp);
        });

        panel.appendChild(tabs);
        panel.appendChild(subPanelsContainer);

        Object.keys(statsDef).forEach((key) => {
          if (group === 'misc' && ATTRIBUTES[key]) return;
          if (!options.showAllStats && !statsDef[key].showInUI) return;
          if (statsDef[key].forceNotShow) return;
          // Skip rendering if displayed is false when showAllStats is enabled
          if (options.showAllStats && statsDef[key].displayed === false) return;

          // Do not special-case elemental stats here; let them be created like other stats so
          // they appear in the same rows instead of a separate elemental grid.

          const subcat = statsDef[key].subcategory || 'misc';
          const targetPanel = subPanels[subcat] || subPanels.misc;
          const row = document.createElement('div');
          row.className = 'stat-row';
          const lbl = document.createElement('span');
          lbl.className = 'stat-label';
          const lblText = formatStatName(key);
          if (lblText && lblText.includes('<')) lbl.innerHTML = lblText;
          else lbl.textContent = lblText;

          const showValue = statsDef[key].showValue !== false;
          const span = document.createElement('span');
          span.id = `${key}-value`;

          if (hero.stats[key] === 0 && options.hideZeroStats) {
            row.classList.add('hidden');
          }

          row.appendChild(lbl);
          row.appendChild(span);
          targetPanel.appendChild(row);
          lbl.addEventListener('mouseenter', (e) =>
            showTooltip(html`<strong>${formatStatName(key)}</strong><br />${getAttributeTooltip(key)}`, e),
          );
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
        });

        // Elemental damage keys will be rendered above in the normal stat-row flow so they
        // match other stats visually and behaviour-wise.

        // Elemental resistance keys will be rendered like other stats (no separate grid).

        tabs.querySelectorAll('.subcat-btn').forEach((btn) => {
          btn.addEventListener('click', () => {
            tabs.querySelectorAll('.subcat-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            Object.values(subPanels).forEach((p) => p.classList.remove('active'));
            subPanels[btn.dataset.subcat].classList.add('active');
          });
        });
      } else {
        Object.keys(statsDef).forEach((key) => {
          if (group === 'misc' && ATTRIBUTES[key]) return;
          if (!options.showAllStats && !statsDef[key].showInUI) return;
          if (statsDef[key].forceNotShow) return;

          const row = document.createElement('div');
          row.className = 'stat-row';
          const lbl = document.createElement('span');
          lbl.className = 'stat-label';
          const lblText = formatStatName(key);
          if (lblText && lblText.includes('<')) lbl.innerHTML = lblText;
          else lbl.textContent = lblText;
          const span = document.createElement('span');
          span.id = `${key}-value`;
          span.textContent = formatDisplayValue(key, hero.stats[key]);
          appendDamagePercentBonus(span, key);

          if (hero.stats[key] === 0 && options.hideZeroStats) {
            row.classList.add('hidden');
          }

          row.appendChild(lbl);
          row.appendChild(span);
          panel.appendChild(row);

          lbl.addEventListener('mouseenter', (e) =>
            showTooltip(html`<strong>${formatStatName(key)}</strong><br />${getAttributeTooltip(key)}`, e),
          );
          lbl.addEventListener('mousemove', positionTooltip);
          lbl.addEventListener('mouseleave', hideTooltip);
        });
      }
    };
    const offensePanel = createPanel('offense');
    const defensePanel = createPanel('defense');
    const miscPanel = createPanel('misc');
    addStatsToPanel(offensePanel, 'offense', OFFENSE_STATS);
    addStatsToPanel(defensePanel, 'defense', DEFENSE_STATS);
    addStatsToPanel(miscPanel, 'misc', MISC_STATS);
    statsContainer.appendChild(offensePanel);
    statsContainer.appendChild(defensePanel);
    statsContainer.appendChild(miscPanel);

    // Tab switching logic
    statsContainer.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        statsContainer.querySelectorAll('.subtab-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const sub = btn.dataset.subtab;
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
        const val = hero.stats[key];
        const row = el.closest('.stat-row');
        if (row) {
          row.classList.toggle('hidden', val === 0 && options.hideZeroStats);
        }
        // Special formatting for certain stats
        if (key === 'attackSpeed') {
          el.textContent = formatNumber(hero.stats.attackSpeed.toFixed(getStatDecimalPlaces('attackSpeed')));
        } else if (key === 'critChance') {
          const d = getDivisor('critChance');
          el.textContent = (hero.stats.critChance * d).toFixed(getStatDecimalPlaces('critChance')) + '%';
        } else if (key === 'critDamage') {
          el.textContent = hero.stats.critDamage.toFixed(getStatDecimalPlaces('critDamage')) + 'x';
        } else if (key === 'lifeSteal') {
          const d = getDivisor('lifeSteal');
          el.textContent = (hero.stats.lifeSteal * d).toFixed(getStatDecimalPlaces('lifeSteal')) + '%';
        } else if (key === 'manaSteal') {
          const d = getDivisor('manaSteal');
          el.textContent = (hero.stats.manaSteal * d).toFixed(getStatDecimalPlaces('manaSteal')) + '%';
        } else if (key === 'omniSteal') {
          const d = getDivisor('omniSteal');
          el.textContent = (hero.stats.omniSteal * d).toFixed(getStatDecimalPlaces('omniSteal')) + '%';
        } else if (key === 'lifeRegen') {
          el.textContent = formatNumber(hero.stats.lifeRegen.toFixed(getStatDecimalPlaces('lifeRegen')));
        } else if (key === 'manaRegen') {
          el.textContent = formatNumber(hero.stats.manaRegen.toFixed(getStatDecimalPlaces('manaRegen')));
        } else if (key === 'blockChance') {
          const d = getDivisor('blockChance');
          el.textContent = (hero.stats.blockChance * d).toFixed(getStatDecimalPlaces('blockChance')) + '%';
        } else if (key === 'cooldownReductionPercent') {
          const val = hero.stats[key];
          const cap = hero.stats.cooldownReductionCapPercent || 0.8;
          const effective = Math.min(val, cap);
          const decimals = getStatDecimalPlaces(key);
          let text = (effective * 100).toFixed(decimals) + '%';
          if (val > cap) {
            text += ` (${(val * 100).toFixed(decimals)}%)`;
          }
          el.textContent = text;
        } else {
          const decimalPlaces = getStatDecimalPlaces(key);
          const divisor = getDivisor(key);
          let value = Number(hero.stats[key]);
          if (divisor !== 1) {
            value *= divisor;
            el.textContent = formatNumber(value.toFixed(decimalPlaces)) + '%';
          } else {
            el.textContent = formatNumber(value.toFixed(decimalPlaces));
          }
        }
        appendDamagePercentBonus(el, key);
      }
    });

    // Update header values
    document.getElementById('level-value').textContent = formatNumber(hero.level || 1);
    document.getElementById('exp-value').textContent = formatNumber(Math.floor(hero.exp || 0));
    document.getElementById('exp-progress').textContent =
      ((hero.exp / hero.getExpToNextLevel()) * 100).toFixed(1) + '%';
    document.getElementById('exp-to-next-level-value').textContent = formatNumber(hero.getExpToNextLevel() || 100);

    // Add enemy-based calculations only if an enemy exists
    const enemy = game.currentEnemy;

    // Add hit chance percentage to attackRating
    const attackRatingEl = document.getElementById('attackRating-value');
    if (attackRatingEl) {
      attackRatingEl.textContent = formatNumber(hero.stats.attackRating);
      if (enemy) {
        const hitPct =
          calculateHitChance(
            hero.stats.attackRating,
            enemy.evasion,
            undefined,
            hero.stats.chanceToHitPercent || 0,
          ).toFixed(2) + '%';
        attackRatingEl.appendChild(document.createTextNode(` (${hitPct})`));
      }
    }

    // Add armor reduction percentage to armor
    const armorEl = document.getElementById('armor-value');
    if (armorEl) {
      armorEl.textContent = formatNumber(hero.stats.armor || 0);
      if (enemy) {
        // Use PoE2 formula: reduction = armor / (armor + 10 * enemy damage)
        const reduction = calculateArmorReduction(hero.stats.armor, enemy.damage);
        armorEl.appendChild(document.createTextNode(` (${reduction.toFixed(2)}%)`));
      }
    }

    // Add elemental resistance reduction percentages
    const resistanceMap = [
      ['fireResistance', 'fireDamage'],
      ['coldResistance', 'coldDamage'],
      ['airResistance', 'airDamage'],
      ['earthResistance', 'earthDamage'],
      ['lightningResistance', 'lightningDamage'],
      ['waterResistance', 'waterDamage'],
    ];
    resistanceMap.forEach(([resKey, dmgKey]) => {
      const el = document.getElementById(`${resKey}-value`);
      if (el) {
        const value = formatNumber(hero.stats[resKey].toFixed(getStatDecimalPlaces(resKey)));
        el.textContent = value;
        if (enemy) {
          const reduction = calculateResistanceReduction(hero.stats[resKey], enemy[dmgKey]);
          el.appendChild(document.createTextNode(` (${reduction.toFixed(2)}%)`));
        }
      }
    });

    // add evasion reduction percentage to evasion
    const evasionEl = document.getElementById('evasion-value');
    if (evasionEl) {
      evasionEl.textContent = formatNumber(hero.stats.evasion || 0);
      if (enemy) {
        const er = calculateEvasionChance(hero.stats.evasion, enemy.attackRating).toFixed(2) + '%';
        evasionEl.appendChild(document.createTextNode(` (${er})`));
      }
    }
  }

  if (!attributesContainer) {
    attributesContainer = document.createElement('div');
    attributesContainer.className = 'attributes-container';
    attributesContainer.innerHTML = html`
      <div class="attributes-header">
        <h3 id="attributes">${t('attributes')} (+${formatNumber(hero.statPoints)})</h3>
        <div class="allocate-modes" style="margin-bottom:8px;">
          <button class="mode-btn" data-amount="1">+1</button>
          <button class="mode-btn" data-amount="30">+30</button>
          <button class="mode-btn" data-amount="60">+60</button>
          <button class="mode-btn" data-amount="120">+120</button>
          <button class="mode-btn" data-amount="max">${t('common.max')}</button>
        </div>
      </div>
      <div class="attributes-body">
        ${Object.entries(hero.stats)
    .map(([stat, value]) => {
      if (!ATTRIBUTES[stat]) return '';

      const displayName = t(stat);
      return `
            <div class="attribute-row">
              <button class="allocate-btn" data-stat="${stat}">+</button>
              <strong>${displayName}:</strong>
              <span id="${stat}-value">${formatNumber(hero.stats[stat])}</span>
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
      row.addEventListener('mouseenter', (e) => {
        const tip = options.showAdvancedAttributeTooltips
          ? getAdvancedAttributeTooltip(stat)
          : html`<strong>${formatStatName(stat)}</strong><br />${getAttributeTooltip(stat)}`;
        showTooltip(tip, e);
      });
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
    document.getElementById('attributes').textContent = `${t('attributes')} (+${formatNumber(hero.statPoints)})`;
    // Update all attribute values dynamically (works with showAllStats)
    Object.keys(hero.stats).forEach((stat) => {
      if (!ATTRIBUTES[stat]) return;
      const el = document.getElementById(`${stat}-value`);
      if (el) {
        el.textContent = formatNumber(hero.stats[stat]);
      }
    });
  }

  updateRateCounters();
  setRateCountersVisibility(options.showRateCounters);

  const skillTreeTab = document.querySelector('[data-tab="skilltree"]');
  skillTreeTab.classList.remove('hidden');

  if (game.currentEnemy) {
    updateEnemyStats();
  }
}

function openSplitView() {
  const html = String.raw;
  const splitState = { placeholders: {}, currentRight: null };

  function movePanel(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    const placeholder = document.createElement('div');
    splitState.placeholders[id] = placeholder;
    el.parentElement.insertBefore(placeholder, el);
    target.appendChild(el);
    el.classList.add('active');
  }

  function restorePanel(id) {
    const el = document.getElementById(id);
    const placeholder = splitState.placeholders[id];
    if (el && placeholder) {
      placeholder.parentElement.insertBefore(el, placeholder);
      el.classList.remove('active');
      placeholder.remove();
      delete splitState.placeholders[id];
    }
  }

  const modal = createModal({
    id: 'split-view-modal',
    className: 'split-view-modal',
    content: html`
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <div class="split-left"></div>
        <div class="split-right">
          <div class="split-right-tabs"></div>
          <div class="split-right-panel"></div>
        </div>
      </div>
    `,
    onClose: () => {
      restorePanel('stats');
      if (splitState.currentRight) restorePanel(splitState.currentRight);
      switchTab('stats');
      updateInventoryGrid();
    },
  });

  const left = modal.querySelector('.split-left');
  const rightTabs = modal.querySelector('.split-right-tabs');
  const rightPanel = modal.querySelector('.split-right-panel');

  movePanel('stats', left);
  const statsEl = document.getElementById('stats');

  function showRight(tab) {
    if (splitState.currentRight) {
      restorePanel(splitState.currentRight);
    }
    switchTab(tab);
    statsEl.classList.add('active');
    movePanel(tab, rightPanel);

    // Update inventory grid for all tabs to ensure equipped items are displayed correctly
    updateInventoryGrid();

    // Call specific UI update functions for each tab
    if (tab === 'runes') {
      renderRunesUI();
    } else if (tab === 'ascension') {
      updateAscensionUI();
    } else if (tab === 'skilltree') {
      updateSkillTreeValues();
    } else if (tab === 'soulShop') {
      soulShop?.updateSoulShopAffordability();
    } else if (tab === 'buildings') {
      updateBuildingAffordability();
    }

    splitState.currentRight = tab;
    rightTabs.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
  }

  document.querySelectorAll('.tab-buttons .tab-btn').forEach((btn) => {
    const tab = btn.dataset.tab;
    // Allow inventory, runes, skill tree, ascension, soul shop and buildings in split view
    if (!['inventory', 'runes', 'skilltree', 'ascension', 'soulShop', 'buildings'].includes(tab)) return;
    const clone = document.createElement('button');
    clone.className = 'subtab-btn';
    clone.dataset.tab = tab;
    clone.textContent = btn.textContent;
    clone.addEventListener('click', () => showRight(tab));
    rightTabs.appendChild(clone);
  });

  showRight('inventory');
}
