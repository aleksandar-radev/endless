import { game, hero, statistics, options, training, soulShop, ascension } from '../globals.js';
import { getDivisor, getStatDecimalPlaces } from '../constants/stats/stats.js';
import { hideTooltip, positionTooltip, showTooltip, updateEnemyStats, formatNumber } from '../ui/ui.js';
import { OFFENSE_STATS } from '../constants/stats/offenseStats.js';
import { DEFENSE_STATS } from '../constants/stats/defenseStats.js';
import { MISC_STATS } from '../constants/stats/miscStats.js';
import { formatStatName } from '../ui/ui.js';
import { getAttributeTooltip, ATTRIBUTES } from '../constants/stats/attributes.js';
import { navigationManager } from '../utils/navigationManager.js';
import { calculateArmorReduction,
  calculateEvasionChance,
  calculateHitChance,
  calculateResistanceReduction,
  calculateExpectedDamageVsEnemy } from '../combat.js';
import { t, tp } from '../i18n.js';
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
let activeSubTab = 'offense';

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
  life: ['lifePercent'],
  lifeRegen: ['lifeRegenPercent'],
  mana: ['manaPercent'],
  thornsDamage: {
    additive: ['totalDamagePercent', 'damagePercent'],
    percent: 'thornsDamagePercent',
  },
};

ELEMENT_IDS.forEach((id) => {
  DAMAGE_PERCENT_SOURCES[`${id}Damage`] = { additive: ['totalDamagePercent', 'elementalDamagePercent', `${id}DamagePercent`] };
});

// Defense / combat stats: show their percent bonus in parentheses on the main stat rows
DAMAGE_PERCENT_SOURCES.armor = ['armorPercent'];
DAMAGE_PERCENT_SOURCES.evasion = ['evasionPercent'];
DAMAGE_PERCENT_SOURCES.attackRating = ['attackRatingPercent'];
ELEMENT_IDS.forEach((id) => {
  DAMAGE_PERCENT_SOURCES[`${id}Resistance`] = [`${id}ResistancePercent`, 'allResistancePercent'];
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

function buildAvgHitTooltip(enemy) {
  if (!enemy) {
    return html`<strong>${t('stats.combat.avgHit')}</strong><br />${t('stats.combat.noEnemy')}`;
  }
  const d = calculateExpectedDamageVsEnemy(hero, enemy);
  const fmt = (n) => formatNumber(Math.round(n));
  const pct = (n) => (n * 100).toFixed(2) + '%';

  // Physical row
  let rows = `<tr><td><strong>${t('stats.combat.tooltip.physical')}</strong></td>` +
    `<td style="text-align:right">${fmt(d.physicalRaw)}</td>` +
    `<td>− ${pct(d.armorReductionPct)} ${t('stats.combat.tooltip.armor')}</td>` +
    `<td style="text-align:right">= ${fmt(d.physicalMitigated)}</td></tr>`;

  // Elemental rows (only non-zero damage)
  d.elementalDetails.forEach(({
    id, raw, resReductionPct, mitigated,
  }) => {
    if (raw <= 0) return;
    rows += `<tr><td>${ELEMENTS[id].icon} ${id.charAt(0).toUpperCase() + id.slice(1)}</td>` +
      `<td style="text-align:right">${fmt(raw)}</td>` +
      `<td>− ${pct(resReductionPct)} ${t('stats.combat.tooltip.res')}</td>` +
      `<td style="text-align:right">= ${fmt(mitigated)}</td></tr>`;
  });

  // Multiplier rows
  const critLine = d.critChance > 0
    ? `<tr><td colspan="4" style="padding-top:4px">${t('stats.combat.tooltip.crit')}: ` +
      `${(d.critChance * 100).toFixed(1)}% × ${d.critDamage.toFixed(2)}x ` +
      `= <strong>×${d.expectedCritMultiplier.toFixed(3)}</strong></td></tr>` : '';

  const doubleLine = d.doubleDamageChance > 0
    ? `<tr><td colspan="4">${t('stats.combat.tooltip.double')}: ` +
      `${(d.doubleDamageChance * 100).toFixed(1)}% ` +
      `= <strong>×${d.expectedDoubleMultiplier.toFixed(3)}</strong></td></tr>` : '';

  return html`
    <strong>${t('stats.combat.avgHit')}</strong> <em style="color:var(--text-muted)">${tp('stats.combat.vsEnemy', { name: enemy.name || '' })}</em>
    <table style="border-collapse:collapse;margin-top:6px;min-width:280px">
      <tr style="font-size:0.8em;color:var(--text-muted)">
        <th style="text-align:left">${t('stats.combat.tooltip.type')}</th>
        <th style="text-align:right">${t('stats.combat.tooltip.base')}</th>
        <th></th>
        <th style="text-align:right">${t('stats.combat.tooltip.after')}</th>
      </tr>
      ${rows}
    </table>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div>${t('stats.combat.tooltip.totalBefore')}: <strong>${fmt(d.totalMitigated)}</strong></div>
    <table style="border-collapse:collapse;margin-top:4px">
      ${critLine}${doubleLine}
    </table>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div><strong>${t('stats.combat.avgHit')}: ~ ${fmt(d.expectedHit)}</strong></div>
  `;
}

function buildAvgDpsTooltip(enemy) {
  if (!enemy) {
    return html`<strong>${t('stats.combat.avgDps')}</strong><br />${t('stats.combat.noEnemy')}`;
  }
  const d = calculateExpectedDamageVsEnemy(hero, enemy);
  const fmt = (n) => formatNumber(Math.round(n));
  return html`
    <strong>${t('stats.combat.avgDps')}</strong> <em style="color:var(--text-muted)">${tp('stats.combat.vsEnemy', { name: enemy.name || '' })}</em>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div>${t('stats.combat.avgHit')}: ${fmt(d.expectedHit)}</div>
    <div>${t('stats.combat.tooltip.attackSpeed')}: ${d.attackSpeed.toFixed(2)}/s</div>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div><strong>${t('stats.combat.avgDps')}: ~ ${fmt(d.dps)}</strong></div>
  `;
}

function calculatePhysicalPenetrationImpact(enemy) {
  if (!enemy) return null;
  const raw = hero.stats.damage || 0;
  const baseArmor = Math.max(0, enemy.armor || 0);
  const noPenReduction = calculateArmorReduction(baseArmor, raw) / 100;
  const noPenDamage = raw * (1 - noPenReduction);

  const armorPenFlat = hero.stats.armorPenetration || 0;
  const armorPenPercent = hero.stats.armorPenetrationPercent || 0;
  const ignoreArmor = hero.stats.ignoreEnemyArmor > 0;
  const effectiveArmor = ignoreArmor
    ? 0
    : Math.max(0, baseArmor * Math.max(0, 1 - armorPenPercent) - armorPenFlat);
  const withPenReduction = calculateArmorReduction(effectiveArmor, raw) / 100;
  const withPenDamage = raw * (1 - withPenReduction);

  const bonus = withPenDamage - noPenDamage;
  const bonusPct = noPenDamage > 0 ? bonus / noPenDamage : 0;

  return {
    raw,
    baseArmor,
    armorPenFlat,
    armorPenPercent,
    ignoreArmor,
    effectiveArmor,
    noPenDamage,
    withPenDamage,
    bonus,
    bonusPct,
  };
}

function calculateElementalPenetrationImpact(enemy) {
  if (!enemy) return null;
  const ignoreAllRes = hero.stats.ignoreAllEnemyResistances > 0;
  const details = ELEMENT_IDS.map((id) => {
    const raw = hero.stats[`${id}Damage`] || 0;
    const baseRes = Math.max(0, enemy[`${id}Resistance`] || 0);
    const noPenReduction = calculateResistanceReduction(baseRes, raw) / 100;
    const noPenDamage = raw * (1 - noPenReduction);

    const specificFlat = hero.stats[`${id}Penetration`] || 0;
    const globalFlat = hero.stats.elementalPenetration || 0;
    const specificPercent = hero.stats[`${id}PenetrationPercent`] || 0;
    const globalPercent = hero.stats.elementalPenetrationPercent || 0;
    const resistReductionPercent = hero.stats.reduceEnemyResistancesPercent || 0;
    const percentTotal = specificPercent + globalPercent + resistReductionPercent;
    const flatTotal = specificFlat + globalFlat;

    const effectiveRes = ignoreAllRes
      ? 0
      : Math.max(0, baseRes * Math.max(0, 1 - percentTotal) - flatTotal);
    const withPenReduction = calculateResistanceReduction(effectiveRes, raw) / 100;
    const withPenDamage = raw * (1 - withPenReduction);

    return {
      id,
      raw,
      baseRes,
      specificFlat,
      globalFlat,
      specificPercent,
      globalPercent,
      resistReductionPercent,
      percentTotal,
      flatTotal,
      effectiveRes,
      noPenDamage,
      withPenDamage,
      bonus: withPenDamage - noPenDamage,
    };
  });

  const noPenDamage = details.reduce((sum, d) => sum + d.noPenDamage, 0);
  const withPenDamage = details.reduce((sum, d) => sum + d.withPenDamage, 0);
  const bonus = withPenDamage - noPenDamage;
  const bonusPct = noPenDamage > 0 ? bonus / noPenDamage : 0;

  return {
    ignoreAllRes,
    details,
    noPenDamage,
    withPenDamage,
    bonus,
    bonusPct,
  };
}

function buildPhysicalPenetrationTooltip(enemy) {
  if (!enemy) {
    return html`<strong>${t('stats.combat.physicalPenBonus')}</strong><br />${t('stats.combat.noEnemy')}`;
  }
  const data = calculatePhysicalPenetrationImpact(enemy);
  const fmt = (n) => formatNumber(Math.round(n));

  return html`
    <strong>${t('stats.combat.physicalPenBonus')}</strong> <em style="color:var(--text-muted)">${tp('stats.combat.vsEnemy', { name: enemy.name || '' })}</em>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div>${t('stats.combat.tooltip.base')}: ${fmt(data.raw)}</div>
    <div>${t('stats.combat.tooltip.penFlat')}: ${formatNumber(Math.round(data.armorPenFlat))}</div>
    <div>${t('stats.combat.tooltip.penPercent')}: ${(data.armorPenPercent * 100).toFixed(1)}%</div>
    <div>${t('stats.combat.tooltip.base')} ${t('stats.combat.tooltip.armor')}: ${fmt(data.baseArmor)}</div>
    <div>${t('stats.combat.tooltip.after')} ${t('stats.combat.tooltip.armor')}: ${fmt(data.effectiveArmor)}</div>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div>${t('stats.combat.tooltip.noPenDamage')}: ${fmt(data.noPenDamage)}</div>
    <div>${t('stats.combat.tooltip.withPenDamage')}: ${fmt(data.withPenDamage)}</div>
    <div><strong>${t('stats.combat.tooltip.bonus')}: +${fmt(data.bonus)} (${(data.bonusPct * 100).toFixed(2)}%)</strong></div>
  `;
}

function buildElementalPenetrationTooltip(enemy) {
  if (!enemy) {
    return html`<strong>${t('stats.combat.elementalPenBonus')}</strong><br />${t('stats.combat.noEnemy')}`;
  }
  const data = calculateElementalPenetrationImpact(enemy);
  const fmt = (n) => formatNumber(Math.round(n));

  let rows = '';
  data.details.forEach((d) => {
    if (d.raw <= 0) return;
    rows += `<tr><td>${ELEMENTS[d.id].icon} ${d.id.charAt(0).toUpperCase() + d.id.slice(1)}</td>` +
      `<td style="text-align:right">${fmt(d.raw)}</td>` +
      `<td style="text-align:right">${formatNumber(Math.round(d.flatTotal))}</td>` +
      `<td style="text-align:right">${(d.percentTotal * 100).toFixed(1)}%</td>` +
      `<td style="text-align:right">+${fmt(d.bonus)}</td></tr>`;
  });

  return html`
    <strong>${t('stats.combat.elementalPenBonus')}</strong> <em style="color:var(--text-muted)">${tp('stats.combat.vsEnemy', { name: enemy.name || '' })}</em>
    <table style="border-collapse:collapse;margin-top:6px;min-width:360px">
      <tr style="font-size:0.8em;color:var(--text-muted)">
        <th style="text-align:left">${t('stats.combat.tooltip.type')}</th>
        <th style="text-align:right">${t('stats.combat.tooltip.base')}</th>
        <th style="text-align:right">${t('stats.combat.tooltip.penFlat')}</th>
        <th style="text-align:right">${t('stats.combat.tooltip.penPercent')}</th>
        <th style="text-align:right">${t('stats.combat.tooltip.bonus')}</th>
      </tr>
      ${rows}
    </table>
    <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
    <div>${t('stats.combat.tooltip.noPenDamage')}: ${fmt(data.noPenDamage)}</div>
    <div>${t('stats.combat.tooltip.withPenDamage')}: ${fmt(data.withPenDamage)}</div>
    <div><strong>${t('stats.combat.tooltip.totalBonus')}: +${fmt(data.bonus)} (${(data.bonusPct * 100).toFixed(2)}%)</strong></div>
  `;
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
      name: t('attributes.breakdown.quests'), flat: Math.floor(breakdown.quests), percent: breakdown.percent.quests,
    },
    {
      name: t('attributes.breakdown.achievements'), flat: Math.floor(breakdown.achievements), percent: breakdown.percent.achievements,
    },
    {
      name: t('attributes.breakdown.ascension'), flat: Math.floor(breakdown.ascension), percent: breakdown.percent.ascension,
    },
    {
      name: t('attributes.breakdown.soulShop'), flat: Math.floor(breakdown.soul), percent: breakdown.percent.soul,
    },
    {
      name: t('attributes.breakdown.runes'), flat: Math.floor(breakdown.runes), percent: breakdown.percent.runes,
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

function getAdvancedStatTooltip(key) {
  const breakdown = hero.statBreakdown?.[key];
  if (!breakdown) return html`<strong>${formatStatName(key)}</strong><br />${getAttributeTooltip(key)}`;

  const isPercent  = key.endsWith('Percent');
  const divisor    = getDivisor(key);
  const decimals   = getStatDecimalPlaces(key);
  const finalValue = hero.stats[key];

  // Build the ordered list of flat sources (skip for pure percent stats)
  const flatSources = isPercent ? [] : [
    {
      label: t('stats.breakdown.base'),         flat: breakdown.base,         percent: 0,
    },
    // For individual resistance stats: show allResistance/allResistancePercent as a dedicated row
    ...(breakdown.allResistanceFlat !== undefined ? [{
      label: t('stats.breakdown.allResistance'),
      flat:    breakdown.allResistanceFlat    || 0,
      percent: breakdown.allResistancePercent || 0,
    }] : []),
    {
      label: t('stats.breakdown.attributes'),   flat: breakdown.attributes,   percent: breakdown.percent.attributes,
    },
    {
      label: t('stats.breakdown.items'),        flat: breakdown.items,        percent: breakdown.percent.items,
    },
    {
      label: t('stats.breakdown.skills'),       flat: breakdown.skills,       percent: breakdown.percent.skills,
    },
    {
      label: t('stats.breakdown.training'),     flat: breakdown.training,     percent: breakdown.percent.training,
    },
    {
      label: t('stats.breakdown.potions'),      flat: breakdown.perma,        percent: breakdown.percent.perma,
    },
    {
      label: t('stats.breakdown.quests'),       flat: breakdown.quests,       percent: breakdown.percent.quests,
    },
    {
      label: t('stats.breakdown.achievements'), flat: breakdown.achievements, percent: breakdown.percent.achievements,
    },
    {
      label: t('stats.breakdown.prestige'),     flat: breakdown.prestige,     percent: breakdown.percent.prestige,
    },
    {
      label: t('stats.breakdown.ascension'),    flat: breakdown.ascension,    percent: breakdown.percent.ascension,
    },
    {
      label: t('stats.breakdown.soulShop'),     flat: breakdown.soul,         percent: breakdown.percent.soul,
    },
    {
      label: t('stats.breakdown.runes'),        flat: breakdown.runes,        percent: breakdown.percent.runes,
    },
  ].filter((s) => s.flat || s.percent);

  // For percent stats, build percent sources instead
  const percentSources = isPercent ? [
    { label: t('stats.breakdown.items'),        percent: breakdown.percent.items },
    { label: t('stats.breakdown.skills'),       percent: breakdown.percent.skills },
    { label: t('stats.breakdown.training'),     percent: breakdown.percent.training },
    { label: t('stats.breakdown.potions'),      percent: breakdown.percent.perma },
    { label: t('stats.breakdown.quests'),       percent: breakdown.percent.quests },
    { label: t('stats.breakdown.achievements'), percent: breakdown.percent.achievements },
    { label: t('stats.breakdown.prestige'),     percent: breakdown.percent.prestige },
    { label: t('stats.breakdown.ascension'),    percent: breakdown.percent.ascension },
    { label: t('stats.breakdown.soulShop'),     percent: breakdown.percent.soul },
    { label: t('stats.breakdown.runes'),        percent: breakdown.percent.runes },
  ].filter((s) => s.percent) : [];

  // Sort by contribution descending so most impactful source appears first
  flatSources.sort((a, b) => Math.abs(b.flat) - Math.abs(a.flat));
  percentSources.sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));

  // Format value based on whether it's a percent stat
  const fmt = (val) => {
    if (divisor !== 1) return (val * divisor).toFixed(decimals) + '%';
    return formatNumber(val.toFixed(decimals));
  };

  const fmtPct = (pct) => (pct * 100).toFixed(1) + '%';

  const lines = flatSources
    .map((s) =>
      `${s.label}: +${fmt(s.flat)}${s.percent ? ` <em>(+${fmtPct(s.percent)})</em>` : ''}`,
    ).join('<br />');

  const pctLines = percentSources
    .map((s) => `${s.label}: +${fmtPct(s.percent)}`).join('<br />');

  const descBlock = html`
    <div style="margin-bottom:8px; font-size:0.9em; color:var(--text-muted);
                border-bottom: 1px solid var(--border); padding-bottom: 4px;">
      ${getAttributeTooltip(key)}
    </div>`;

  // Ad bonus row (if any)
  const adMultiplier = breakdown.adMultiplier || 0;
  const adBlock = adMultiplier > 0
    ? `<div style="color:var(--ad-bonus, #f9a825); margin-top:4px;">
         ${t('stats.breakdown.ads')}: ×${(1 + adMultiplier).toFixed(2)}
       </div>`
    : '';

  // Special notes
  const noteBlock = (() => {
    if (key === 'blockChance' && breakdown.hasShield === false) {
      return `<div style="color:var(--warning)">${t('stats.breakdown.noShield')}</div>`;
    }
    if (key === 'life' && breakdown.manaConversion) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        + ${formatNumber(breakdown.manaConversion.toFixed(decimals))} ${t('stats.breakdown.fromMana')}
      </div>`;
    }
    if (key === 'mana' && breakdown.manaConversion) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        − ${formatNumber(breakdown.manaConversion.toFixed(decimals))} ${t('stats.breakdown.toLife')}
      </div>`;
    }
    if (key === 'attackSpeed') {
      return `<div style="font-size:0.8em; color:var(--text-muted); margin-top:2px;">
        ${t('stats.breakdown.attackSpeedNote')}
      </div>`;
    }
    if ((key === 'critChance' || key === 'blockChance' || key === 'attackSpeed') && breakdown.cap !== undefined) {
      return `<div style="font-size:0.85em; color:var(--text-muted);">
        ${t('common.cap')}: ${fmt(breakdown.cap / divisor)}
      </div>`;
    }
    return '';
  })();

  // Totals row
  const totalFlat    = flatSources.reduce((s, r) => s + r.flat, 0);
  const totalPercent = flatSources.reduce((s, r) => s + (r.percent || 0), 0);

  const totalRow = !isPercent
    ? html`<hr style="border:none; border-top:1px solid var(--border); margin:4px 0" />
       <em>${t('attributes.breakdown.totalFlat')}:</em> ${fmt(totalFlat)}<br />
       ${totalPercent ? `<em>${t('attributes.breakdown.totalPercent')}:</em> +${fmtPct(totalPercent)}<br />` : ''}
       <strong>${t('attributes.breakdown.total')}:</strong> ${fmt(finalValue)}`
    : html`<hr style="border:none; border-top:1px solid var(--border); margin:4px 0" />
       <strong>${t('attributes.breakdown.total')}:</strong> ${fmtPct(finalValue)}`;

  return html`
    <strong>${formatStatName(key)}</strong><br />
    ${descBlock}
    ${isPercent ? pctLines : lines}
    ${adBlock}
    ${noteBlock}
    ${totalRow}
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

export function switchStatsSubTab(subTabName, { skipUrlUpdate = false } = {}) {
  activeSubTab = subTabName;
  const statsContainer = document.querySelector('.stats-container');
  if (!statsContainer) return;

  statsContainer.querySelectorAll('.subtab-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.subtab === subTabName);
  });

  statsContainer.querySelectorAll('.stats-panel').forEach((p) => {
    p.classList.toggle('active', p.id === `${subTabName}-panel`);
  });

  if (!skipUrlUpdate) {
    navigationManager.updateUrl({ subtab: subTabName });
  }
}

export function updateStatsAndAttributesUI(forceRebuild = false) {
  if (window.perfMon?.enabled) window.perfMon.mark('updateStatsAndAttributesUI');
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
        <button class="subtab-btn ${activeSubTab === 'offense' ? 'active' : ''}" data-subtab="offense">${t('stats.offense')}</button>
        <button class="subtab-btn ${activeSubTab === 'defense' ? 'active' : ''}" data-subtab="defense">${t('stats.defense')}</button>
        <button class="subtab-btn ${activeSubTab === 'misc' ? 'active' : ''}" data-subtab="misc">${t('stats.misc')}</button>
        <button class="subtab-btn ${activeSubTab === 'combat' ? 'active' : ''}" data-subtab="combat">${t('stats.combat')}</button>
        <button class="elemental-allocation-btn stats-elemental-btn" data-i18n="training.elementalDistributionButton">
          ${t('training.elementalDistributionButton')}
        </button>
      </div>
    `;
    statsContainer.innerHTML += tabsHtml;

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
      if (name === activeSubTab) panel.classList.add('active');
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
            showTooltip(getAdvancedStatTooltip(key), e),
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
            showTooltip(getAdvancedStatTooltip(key), e),
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

    // Combat panel – derived calculations vs current enemy (always uses 2-col grid layout)
    const combatPanel = createPanel('combat');
    combatPanel.classList.add('default'); // always use the 2-column grid regardless of showAllStats
    const combatRows = [
      { id: 'combat-hit-chance', labelKey: 'stats.combat.hitChance' },
      {
        id: 'combat-avg-hit', labelKey: 'stats.combat.avgHit', getTooltip: () => buildAvgHitTooltip(game.currentEnemy),
      },
      {
        id: 'combat-avg-dps', labelKey: 'stats.combat.avgDps', getTooltip: () => buildAvgDpsTooltip(game.currentEnemy),
      },
      {
        id: 'combat-physical-pen-bonus', labelKey: 'stats.combat.physicalPenBonus', getTooltip: () => buildPhysicalPenetrationTooltip(game.currentEnemy),
      },
      {
        id: 'combat-elemental-pen-bonus', labelKey: 'stats.combat.elementalPenBonus', getTooltip: () => buildElementalPenetrationTooltip(game.currentEnemy),
      },
      { id: 'combat-armor-reduction', labelKey: 'stats.combat.armorReduction' },
      { id: 'combat-evade-chance', labelKey: 'stats.combat.evadeChance' },
      ...ELEMENT_IDS.map((el) => ({
        id: `combat-${el}-resistance-reduction`,
        labelKey: `stats.combat.${el}ResistanceReduction`,
      })),
    ];
    const combatNoteEl = document.createElement('div');
    combatNoteEl.id = 'combat-enemy-note';
    combatNoteEl.className = 'combat-enemy-note';
    combatPanel.appendChild(combatNoteEl);
    combatRows.forEach(({
      id, labelKey, getTooltip,
    }) => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      const lbl = document.createElement('span');
      lbl.className = 'stat-label';
      const lblText = t(labelKey);
      if (lblText.includes('<')) lbl.innerHTML = lblText;
      else lbl.textContent = lblText;
      if (getTooltip) {
        lbl.style.cursor = 'help';
        const tooltipClass = id === 'combat-avg-hit' || id === 'combat-avg-dps' || id === 'combat-physical-pen-bonus' || id === 'combat-elemental-pen-bonus' ? 'combat-wide-tooltip' : '';
        lbl.addEventListener('mouseenter', (e) => showTooltip(getTooltip(), e, tooltipClass));
        lbl.addEventListener('mousemove', positionTooltip);
        lbl.addEventListener('mouseleave', hideTooltip);
      }
      const val = document.createElement('span');
      val.id = `${id}-value`;
      val.textContent = '—';
      row.appendChild(lbl);
      row.appendChild(val);
      combatPanel.appendChild(row);
    });
    statsContainer.appendChild(combatPanel);

    // Tab switching logic
    statsContainer.querySelectorAll('.subtab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sub = btn.dataset.subtab;
        if (sub) {
          switchStatsSubTab(sub);
        }
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

    // Update combat panel derived calculations
    const enemy = game.currentEnemy;
    const combatNoteUpdate = document.getElementById('combat-enemy-note');
    if (combatNoteUpdate) {
      combatNoteUpdate.textContent = enemy
        ? tp('stats.combat.vsEnemy', { name: enemy.name || '' })
        : t('stats.combat.noEnemy');
    }

    const combatArmorEl = document.getElementById('combat-armor-reduction-value');
    if (combatArmorEl) {
      combatArmorEl.textContent = enemy
        ? calculateArmorReduction(hero.stats.armor, enemy.damage).toFixed(2) + '%'
        : '—';
    }

    const combatEvadeEl = document.getElementById('combat-evade-chance-value');
    if (combatEvadeEl) {
      combatEvadeEl.textContent = enemy
        ? calculateEvasionChance(hero.stats.evasion, enemy.attackRating).toFixed(2) + '%'
        : '—';
    }

    const combatHitEl = document.getElementById('combat-hit-chance-value');
    if (combatHitEl) {
      combatHitEl.textContent = enemy
        ? calculateHitChance(
          hero.stats.attackRating,
          enemy.evasion,
          undefined,
          hero.stats.chanceToHitPercent || 0,
        ).toFixed(2) + '%'
        : '—';
    }

    const resistanceMap = [
      ['fire', 'fireDamage'],
      ['cold', 'coldDamage'],
      ['air', 'airDamage'],
      ['earth', 'earthDamage'],
      ['lightning', 'lightningDamage'],
      ['water', 'waterDamage'],
    ];
    resistanceMap.forEach(([element, dmgKey]) => {
      const el = document.getElementById(`combat-${element}-resistance-reduction-value`);
      if (el) {
        el.textContent = enemy
          ? calculateResistanceReduction(hero.stats[`${element}Resistance`], enemy[dmgKey]).toFixed(2) + '%'
          : '—';
      }
    });

    // Avg hit and avg DPS
    const avgHitEl = document.getElementById('combat-avg-hit-value');
    const avgDpsEl = document.getElementById('combat-avg-dps-value');
    if (avgHitEl || avgDpsEl) {
      if (enemy) {
        const d = calculateExpectedDamageVsEnemy(hero, enemy);
        if (avgHitEl) avgHitEl.textContent = '~' + formatNumber(Math.round(d.expectedHit));
        if (avgDpsEl) avgDpsEl.textContent = '~' + formatNumber(Math.round(d.dps));
      } else {
        if (avgHitEl) avgHitEl.textContent = '—';
        if (avgDpsEl) avgDpsEl.textContent = '—';
      }
    }

    const physicalPenEl = document.getElementById('combat-physical-pen-bonus-value');
    const elementalPenEl = document.getElementById('combat-elemental-pen-bonus-value');
    if (physicalPenEl || elementalPenEl) {
      if (enemy) {
        const p = calculatePhysicalPenetrationImpact(enemy);
        const e = calculateElementalPenetrationImpact(enemy);
        if (physicalPenEl) {
          physicalPenEl.textContent = `+${formatNumber(Math.round(p.bonus))} (${(p.bonusPct * 100).toFixed(2)}%)`;
        }
        if (elementalPenEl) {
          elementalPenEl.textContent = `+${formatNumber(Math.round(e.bonus))} (${(e.bonusPct * 100).toFixed(2)}%)`;
        }
      } else {
        if (physicalPenEl) physicalPenEl.textContent = '—';
        if (elementalPenEl) elementalPenEl.textContent = '—';
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
  if (window.perfMon?.enabled) window.perfMon.measure('updateStatsAndAttributesUI', 10);
}
