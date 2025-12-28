import { ELEMENTS } from '../common.js';
import { t, tp } from '../../i18n.js';
import { ascension, skillTree } from '../../globals.js';
import { STATS } from './stats.js';

const html = String.raw;

export const ATTRIBUTES = {
  strength: { effects: { damagePerPoint: 0.3 } },
  agility: {
    effects: {
      attackRatingPerPoint: 4,
      damagePerPoint: 0.1,
    },
  },
  vitality: { effects: { lifePerPoint: 6 } },
  wisdom: {
    effects: {
      manaPerPoint: 3,
      manaRegenPerPoint: 0.05,
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 4,
      thornsDamagePerPoint: 0,
    },
  },
  dexterity: { effects: { evasionPerPoint: 4 } },
  intelligence: { effects: { elementalDamagePerPoint: 0.067 } },
  perseverance: {
    effects: {
      lifeRegenPerPoint: 0.5,
      manaRegenPerPoint: 0.05,
      allResistancePerPoint: 3,
    },
  },
};

const formatTitle = (stat) => {
  const statsKey = `stats.${stat}`;
  const statsTranslation = t(statsKey);
  if (statsTranslation && statsTranslation !== statsKey) return statsTranslation;

  const translated = t(stat);
  if (translated && translated !== stat) return translated;
  return stat.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
};

const generateDescription = (stat) => {
  const base = stat.replace(/Percent$|PerLevel$|OfTotalPercent$/, '');
  if (stat.endsWith('PenetrationPercent')) {
    const b = stat.replace('PenetrationPercent', '');
    return tp('tooltip.pattern.penetrationPercent', { stat: formatTitle(b).toLowerCase() });
  }
  if (stat.endsWith('Penetration')) {
    const b = stat.replace('Penetration', '');
    return tp('tooltip.pattern.penetration', { stat: formatTitle(b).toLowerCase() });
  }
  if (stat.endsWith('ResistancePercent')) {
    const b = stat.replace('ResistancePercent', '');
    return tp('tooltip.pattern.resistancePercent', { stat: formatTitle(b) });
  }
  if (stat.endsWith('Resistance')) {
    const b = stat.replace('Resistance', '');
    return tp('tooltip.pattern.resistance', { stat: formatTitle(b) });
  }
  if (stat.endsWith('DamagePercent')) {
    const b = stat.replace('DamagePercent', '');
    return tp('tooltip.pattern.damagePercent', { stat: formatTitle(b) });
  }
  if (stat.endsWith('Damage')) {
    const b = stat.replace('Damage', '');
    return tp('tooltip.pattern.damage', { stat: formatTitle(b) });
  }
  if (stat.endsWith('RegenPercent')) {
    const b = stat.replace('RegenPercent', '') + ' regeneration';
    return tp('tooltip.pattern.regenPercent', { stat: formatTitle(b) });
  }
  if (stat.endsWith('Regen')) {
    const b = stat.replace('Regen', '') + ' regeneration';
    return tp('tooltip.pattern.regen', { stat: formatTitle(b).toLowerCase() });
  }
  if (stat.endsWith('Percent')) {
    return tp('tooltip.pattern.percent', { stat: formatTitle(base) });
  }
  if (stat.endsWith('PerLevel')) {
    return tp('tooltip.pattern.perLevel', { stat: formatTitle(base) });
  }
  if (stat.endsWith('OfTotalPercent')) {
    return tp('tooltip.pattern.ofTotalPercent', { stat: formatTitle(base) });
  }
  if (stat.startsWith('extraDamageFrom')) {
    const b = stat.replace('extraDamageFrom', '');
    return tp('tooltip.pattern.extraDamageFrom', { stat: formatTitle(b).toLowerCase() });
  }
  if (stat.endsWith('Chance')) {
    const b = stat.replace('Chance', '');
    return tp('tooltip.pattern.chance', { action: formatTitle(b).toLowerCase() });
  }
  return tp('tooltip.pattern.default', { stat: formatTitle(stat) });
};

const CUSTOM_DESCRIPTIONS = {
  strength: () => t('tooltip.strength'),
  agility: () => t('tooltip.agility'),
  vitality: () => t('tooltip.vitality'),
  wisdom: () => t('tooltip.wisdom'),
  endurance: () => t('tooltip.endurance'),
  dexterity: () => t('tooltip.dexterity'),
  intelligence: () => t('tooltip.intelligence'),
  perseverance: () => t('tooltip.perseverance'),
  strengthPercent: () => t('tooltip.strengthPercent'),
  agilityPercent: () => t('tooltip.agilityPercent'),
  vitalityPercent: () => t('tooltip.vitalityPercent'),
  wisdomPercent: () => t('tooltip.wisdomPercent'),
  endurancePercent: () => t('tooltip.endurancePercent'),
  dexterityPercent: () => t('tooltip.dexterityPercent'),
  intelligencePercent: () => t('tooltip.intelligencePercent'),
  perseverancePercent: () => t('tooltip.perseverancePercent'),
  elementalDamage: () => t('tooltip.elementalDamage'),
  damage: () => t('tooltip.damage'),
  damagePercent: () => t('tooltip.damagePercent'),
  totalDamagePercent: () => t('tooltip.totalDamagePercent'),
  attackSpeed: () => t('tooltip.attackSpeed'),
  attackRating: () => t('tooltip.attackRating'),
  critChance: () => t('tooltip.critChance'),
  critChanceCap: () => {
    const baseCap = STATS.critChanceCap?.base || 50;
    return tp('tooltip.critChanceCap', { baseCap });
  },
  critDamage: () => t('tooltip.critDamage'),
  lifeSteal: () => t('tooltip.lifeSteal'),
  manaSteal: () => t('tooltip.manaSteal'),
  omniSteal: () => t('tooltip.omniSteal'),
  life: () => t('tooltip.life'),
  lifePercent: () => t('tooltip.lifePercent'),
  lifeRegen: () => t('tooltip.lifeRegen'),
  lifeRegenPercent: () => t('tooltip.lifeRegenPercent'),
  mana: () => t('tooltip.mana'),
  manaPercent: () => t('tooltip.manaPercent'),
  manaRegen: () => t('tooltip.manaRegen'),
  manaRegenPercent: () => t('tooltip.manaRegenPercent'),
  armor: () => t('tooltip.armor'),
  armorPercent: () => t('tooltip.armorPercent'),
  blockChance: () => t('tooltip.blockChance'),
  blockChanceCap: () => {
    const cap = STATS.blockChance?.cap || 50;
    return tp('tooltip.blockChanceCap', { cap });
  },
  evasion: () => t('tooltip.evasion'),
  evasionPercent: () => t('tooltip.evasionPercent'),
  fireResistance: () => t('tooltip.fireResistance'),
  fireResistancePercent: () => t('tooltip.fireResistancePercent'),
  coldResistance: () => t('tooltip.coldResistance'),
  coldResistancePercent: () => t('tooltip.coldResistancePercent'),
  airResistance: () => t('tooltip.airResistance'),
  airResistancePercent: () => t('tooltip.airResistancePercent'),
  earthResistance: () => t('tooltip.earthResistance'),
  earthResistancePercent: () => t('tooltip.earthResistancePercent'),
  lightningResistance: () => t('tooltip.lightningResistance'),
  lightningResistancePercent: () => t('tooltip.lightningResistancePercent'),
  waterResistance: () => t('tooltip.waterResistance'),
  waterResistancePercent: () => t('tooltip.waterResistancePercent'),
  allResistance: () => t('tooltip.allResistance'),
  allResistancePercent: () => t('tooltip.allResistancePercent'),
  lifePerHit: () => t('tooltip.lifePerHit'),
  manaPerHit: () => t('tooltip.manaPerHit'),
  fireDamage: () => t('tooltip.fireDamage'),
  fireDamagePercent: () => t('tooltip.fireDamagePercent'),
  firePenetration: () => t('tooltip.firePenetration'),
  firePenetrationPercent: () => t('tooltip.firePenetrationPercent'),
  coldDamage: () => t('tooltip.coldDamage'),
  coldDamagePercent: () => t('tooltip.coldDamagePercent'),
  coldPenetration: () => t('tooltip.coldPenetration'),
  coldPenetrationPercent: () => t('tooltip.coldPenetrationPercent'),
  airDamage: () => t('tooltip.airDamage'),
  airDamagePercent: () => t('tooltip.airDamagePercent'),
  airPenetration: () => t('tooltip.airPenetration'),
  airPenetrationPercent: () => t('tooltip.airPenetrationPercent'),
  earthDamage: () => t('tooltip.earthDamage'),
  earthDamagePercent: () => t('tooltip.earthDamagePercent'),
  earthPenetration: () => t('tooltip.earthPenetration'),
  earthPenetrationPercent: () => t('tooltip.earthPenetrationPercent'),
  lightningDamage: () => t('tooltip.lightningDamage'),
  lightningDamagePercent: () => t('tooltip.lightningDamagePercent'),
  lightningPenetration: () => t('tooltip.lightningPenetration'),
  lightningPenetrationPercent: () => t('tooltip.lightningPenetrationPercent'),
  waterDamage: () => t('tooltip.waterDamage'),
  waterDamagePercent: () => t('tooltip.waterDamagePercent'),
  waterPenetration: () => t('tooltip.waterPenetration'),
  waterPenetrationPercent: () => t('tooltip.waterPenetrationPercent'),
  elementalDamagePercent: () => t('tooltip.elementalDamagePercent'),
  elementalPenetration: () => t('tooltip.elementalPenetration'),
  elementalPenetrationPercent: () => t('tooltip.elementalPenetrationPercent'),
  doubleDamageChance: () => t('tooltip.doubleDamageChance'),
  resurrectionChance: () => t('tooltip.resurrectionChance'),
  bonusGoldPercent: () => t('tooltip.bonusGoldPercent'),
  bonusExperiencePercent: () => t('tooltip.bonusExperiencePercent'),
  itemQuantityPercent: () => t('tooltip.itemQuantityPercent'),
  materialQuantityPercent: () => t('tooltip.materialQuantityPercent'),
  itemRarityPercent: () => t('tooltip.itemRarityPercent'),
  extraMaterialDropPercent: () => t('tooltip.extraMaterialDropPercent'),
  skillPoints: () => t('tooltip.skillPoints'),
  allAttributes: () => t('tooltip.allAttributes'),
  allAttributesPercent: () => t('tooltip.allAttributesPercent'),
  manaShieldPercent: () => t('tooltip.manaShieldPercent'),
  manaShieldDamageTakenReductionPercent: () => t('tooltip.manaShieldDamageTakenReductionPercent'),
  reflectFireDamage: () => t('tooltip.reflectFireDamage'),
  thornsDamage: () => t('tooltip.thornsDamage'),
  thornsDamagePercent: () => t('tooltip.thornsDamagePercent'),
  attackNeverMiss: () => t('tooltip.attackNeverMiss'),
  chanceToHitPercent: () => t('tooltip.chanceToHitPercent'),
  ignoreEnemyArmor: () => t('tooltip.ignoreEnemyArmor'),
  ignoreAllEnemyResistances: () => t('tooltip.ignoreAllEnemyResistances'),
  extraDamageAgainstFrozenEnemies: () => t('tooltip.extraDamageAgainstFrozenEnemies'),
  chanceToShatterEnemy: () => t('tooltip.chanceToShatterEnemy'),
  damageTakenConvertedToColdPercent: () => {
    const cap = STATS.damageTakenConvertedToColdPercent?.cap || 75;
    return tp('tooltip.damageTakenConvertedToColdPercent', { cap });
  },
  coldDamageTakenReductionPercent: () => {
    const cap = STATS.coldDamageTakenReductionPercent?.cap || 50;
    return tp('tooltip.coldDamageTakenReductionPercent', { cap });
  },
  damageTakenReductionPercent: () => {
    const cap = STATS.damageTakenReductionPercent?.cap || 80;
    return tp('tooltip.damageTakenReductionPercent', { cap });
  },
  stunChance: () => t('tooltip.stunChance'),
  percentOfPlayerDamage: () => t('tooltip.percentOfPlayerDamage'),
  extraMaterialDropMax: () => t('tooltip.extraMaterialDropMax'),
  itemBonusesPercent: () => t('tooltip.itemBonusesPercent'),
  cooldownReductionPercent: () => t('tooltip.cooldownReductionPercent'),
  manaCostReductionPercent: () => t('tooltip.manaCostReductionPercent'),
  buffDurationPercent: () => t('tooltip.buffDurationPercent'),
  lifeRegenOfTotalPercent: () => t('tooltip.lifeRegenOfTotalPercent'),
  manaRegenOfTotalPercent: () => t('tooltip.manaRegenOfTotalPercent'),
  reduceEnemyDamagePercent: () => {
    const cap = STATS.reduceEnemyDamagePercent?.cap || 50;
    return tp('tooltip.reduceEnemyDamagePercent', { cap });
  },
  reduceEnemyHpPercent: () => {
    const cap = STATS.reduceEnemyHpPercent?.cap || 50;
    return tp('tooltip.reduceEnemyHpPercent', { cap });
  },
  reduceEnemyAttackSpeedPercent: () => {
    const cap = STATS.reduceEnemyAttackSpeedPercent?.cap || 50;
    return tp('tooltip.reduceEnemyAttackSpeedPercent', { cap });
  },
  firePenetrationPercent: () => t('tooltip.firePenetrationPercent'),
  coldPenetrationPercent: () => t('tooltip.coldPenetrationPercent'),
  airPenetrationPercent: () => t('tooltip.airPenetrationPercent'),
  earthPenetrationPercent: () => t('tooltip.earthPenetrationPercent'),
  lightningPenetrationPercent: () => t('tooltip.lightningPenetrationPercent'),
  waterPenetrationPercent: () => t('tooltip.waterPenetrationPercent'),
  flatPenetrationPercent: () => t('tooltip.flatPenetrationPercent'),
  elementalPenetrationPercent: () => t('tooltip.elementalPenetrationPercent'),
  extraDamageFromLifePercent: () => t('tooltip.extraDamageFromLifePercent'),
  extraDamageFromArmorPercent: () => t('tooltip.extraDamageFromArmorPercent'),
  extraDamageFromManaPercent: () => t('tooltip.extraDamageFromManaPercent'),
  extraDamageFromEvasionPercent: () => t('tooltip.extraDamageFromEvasionPercent'),
  extraDamageFromAttackRatingPercent: () => t('tooltip.extraDamageFromAttackRatingPercent'),
  extraDamageFromLifeRegenPercent: () => t('tooltip.extraDamageFromLifeRegenPercent'),
};

export const getAttributeTooltip = (stat) => {
  const description = CUSTOM_DESCRIPTIONS[stat]?.() ?? generateDescription(stat);
  return description;
};
