import { t, tp } from '../../i18n.js';
import { STATS } from './stats.js';
import { BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL, ELEMENTS } from '../common.js';
import { formatNumber } from '../../utils/numberFormatter.js';
import { formatStatName } from '../../ui/ui.js';
import { hero, ascension } from '../../globals.js';

export const ATTRIBUTES = {
  strength: { effects: { damagePerPoint: 0.3 } },
  agility: {
    effects: {
      attackRatingPerPoint: 4,
      damagePerPoint: 0.1,
    },
  },
  vitality: { effects: { lifePerPoint: 5, lifeRegenPerPoint: 0.25 } },
  wisdom: {
    effects: {
      manaPerPoint: 3,
      manaRegenPerPoint: 0.08,
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 4,
      thornsDamagePerPoint: 0.1,
    },
  },
  dexterity: { effects: { evasionPerPoint: 4, attackRatingPerPoint: 1 } },
  intelligence: { effects: { elementalDamagePerPoint: 0.067 } },
  perseverance: {
    effects: {
      lifeRegenPerPoint: 0.25,
      manaRegenPerPoint: 0.05,
      allResistancePerPoint: 3,
    },
  },
};

const getAttributeEffectsInfo = (stat) => {
  const config = ATTRIBUTES[stat];
  if (!config || !config.effects) return '';

  const effects = Object.entries(config.effects).map(([key, value]) => {
    // key is like "damagePerPoint" or "attackRatingPerPoint"
    // We want to extract "Damage" or "AttackRating"
    const statName = key.replace('PerPoint', '');
    const formattedStat = formatStatName(statName);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value} ${formattedStat}`;
  });

  if (effects.length === 0) return '';
  return `<div style="margin-top: 8px;">
    <div style="color: var(--text-muted); font-size: 0.8em; margin-bottom: 2px;">${t('tooltip.effectsPerPoint')}</div>
    <div style="color: var(--text); line-height: 1.4;">${effects.join('<br/>')}</div>
  </div>`;
};

const getAdditionalStatInfo = (stat) => {
  if (!hero || !hero.stats) return '';
  if (!stat.startsWith('extraDamageFrom') || !stat.endsWith('Percent')) return '';

  const sourceName = stat.replace('extraDamageFrom', '').replace('Percent', '');
  let sourceValue = 0;

  if (sourceName === 'AllResistances') {
    const elementIds = Object.keys(ELEMENTS);
    sourceValue = elementIds.reduce((sum, id) => sum + (hero.stats[`${id}Resistance`] || 0), 0);
  } else {
    const prop = sourceName.charAt(0).toLowerCase() + sourceName.slice(1);
    sourceValue = hero.stats[prop] || 0;
  }

  const resourceCapPerLevel = Math.max(
    0,
    BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL + (ascension?.getBonuses()?.extraResourceDamageCapPerLevel || 0),
  );
  const totalCap = Math.max(0, (hero.level || 1) * resourceCapPerLevel);

  const cappedValue = Math.min(sourceValue, totalCap);
  const percent = hero.stats[stat] || 0;
  const damage = cappedValue * percent;

  let color = 'var(--success)';
  if (sourceValue > totalCap) {
    color = 'var(--danger)';
  } else if (sourceValue >= totalCap) {
    color = 'var(--warning)';
  }

  const formattedSource = formatNumber(Math.floor(sourceValue));
  const formattedCap = formatNumber(Math.floor(totalCap));
  const formattedDamage = formatNumber(Math.floor(damage));

  return `<div style="margin-top: 4px; font-size: 0.9em;">
    ${t('tooltip.currentDamage')}: ${formattedDamage}<br/>
    ${t('tooltip.source')}: <span style="color:${color}">${formattedSource} / ${formattedCap} (${t('common.cap')})</span>
  </div>`;
};

const generateDescription = (stat) => `<div style="font-size: 0.9em; color: var(--text-description); margin-bottom: 4px;">${t('tooltip.pattern.default', { stat: formatStatName(stat) })}</div>`;

const CUSTOM_DESCRIPTIONS = {};

Object.keys(STATS).forEach((stat) => {
  CUSTOM_DESCRIPTIONS[stat] = () => {
    const params = { ...STATS[stat] };
    params.resourceDamageCap = BASE_EXTRA_RESOURCE_DAMAGE_CAP_PER_LEVEL;

    if (params.base) {
      params.baseCap = params.base;
    }
    const descriptionText = tp(`tooltip.${stat}`, params);
    const description = `<div style="font-size: 0.9em; color: var(--text-description); margin-bottom: 4px;">${descriptionText}</div>`;
    const effects = getAttributeEffectsInfo(stat);
    const additional = getAdditionalStatInfo(stat);

    let result = description;
    if (effects) result += effects;
    if (additional) result += additional;

    return result;
  };
});

export const getAttributeTooltip = (stat) => {
  const description = CUSTOM_DESCRIPTIONS[stat]?.() ?? generateDescription(stat);
  return description;
};
