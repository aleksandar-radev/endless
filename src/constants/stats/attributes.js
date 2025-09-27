import { ELEMENTS } from '../common.js';
import { t, tp } from '../../i18n.js';
import { ascension } from '../../globals.js';

const html = String.raw;

export const ATTRIBUTES = {
  strength: {
    effects: {
      damagePerPoint: 0.3,
    },
  },
  agility: {
    effects: {
      attackRatingPerPoint: 4,
      damagePerPoint: 0.1,
    },
  },
  vitality: {
    effects: {
      lifePerPoint: 5,
    },
  },
  wisdom: {
    effects: {
      manaPerPoint: 3,
      manaRegenPerPoint: 0.05,
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 5,
    },
  },
  dexterity: {
    effects: {
      evasionPerPoint: 4,
    },
  },
  intelligence: {
    effects: {
      elementalDamagePerPoint: 0.067,
    },
  },
  perseverance: {
    effects: {
      lifeRegenPerPoint: 0.5,
      manaRegenPerPoint: 0.05,
      allResistancePerPoint: 2,
    },
  },
};

const formatTitle = (stat) => {
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
  strength: () =>
    tp('tooltip.strength', { damage: ATTRIBUTES.strength.effects.damagePerPoint }),
  agility: () =>
    tp('tooltip.agility', {
      attackRating: ATTRIBUTES.agility.effects.attackRatingPerPoint,
      damage: ATTRIBUTES.agility.effects.damagePerPoint,
    }),
  vitality: () =>
    tp('tooltip.vitality', { life: ATTRIBUTES.vitality.effects.lifePerPoint }),
  wisdom: () =>
    tp('tooltip.wisdom', {
      mana: ATTRIBUTES.wisdom.effects.manaPerPoint,
      manaRegen: ATTRIBUTES.wisdom.effects.manaRegenPerPoint,
    }),
  endurance: () =>
    tp('tooltip.endurance', { armor: ATTRIBUTES.endurance.effects.armorPerPoint }),
  dexterity: () =>
    tp('tooltip.dexterity', { evasion: ATTRIBUTES.dexterity.effects.evasionPerPoint }),
  intelligence: () =>
    tp('tooltip.intelligence', {
      elementalDamage: ATTRIBUTES.intelligence.effects.elementalDamagePerPoint,
    }),
  perseverance: () =>
    tp('tooltip.perseverance', {
      manaRegen: ATTRIBUTES.perseverance.effects.manaRegenPerPoint,
      lifeRegen: ATTRIBUTES.perseverance.effects.lifeRegenPerPoint,
      allResistance: ATTRIBUTES.perseverance.effects.allResistancePerPoint,
    }),
  elementalDamage: () => t('tooltip.elementalDamage'),
  damage: () => t('tooltip.damage'),
  attackSpeed: () => {
    const asc = ascension?.getBonuses?.() || {};
    const baseCap = 5;
    const ascCap = Number((asc.attackSpeedCap || 0).toFixed(2));
    const currentCap = Number((baseCap + ascCap).toFixed(2));
    return tp('tooltip.attackSpeed', {
      baseCap,
      ascCap,
      currentCap,
    });
  },
  attackRating: () => t('tooltip.attackRating'),
  critChance: () => {
    const asc = ascension?.getBonuses?.() || {};
    const baseCap = 50;
    const ascCap = Math.floor(asc.critChanceCap || 0);
    const currentCap = baseCap + ascCap;
    return tp('tooltip.critChance', { baseCap, ascCap, currentCap });
  },
  critDamage: () => t('tooltip.critDamage'),
  lifeSteal: () => t('tooltip.lifeSteal'),
  manaSteal: () => t('tooltip.manaSteal'),
  omniSteal: () => t('tooltip.omniSteal'),
  life: () => t('tooltip.life'),
  lifeRegen: () => t('tooltip.lifeRegen'),
  mana: () => t('tooltip.mana'),
  manaRegen: () => t('tooltip.manaRegen'),
  armor: () => t('tooltip.armor'),
  blockChance: () => {
    const asc = ascension?.getBonuses?.() || {};
    const baseCap = 50;
    const ascCap = Math.floor(asc.blockChanceCap || 0);
    const currentCap = baseCap + ascCap;
    return tp('tooltip.blockChance', { baseCap, ascCap, currentCap });
  },
  evasion: () => t('tooltip.evasion'),
  fireResistance: () => tp('tooltip.fireResistance', { icon: ELEMENTS.fire.icon }),
  coldResistance: () => tp('tooltip.coldResistance', { icon: ELEMENTS.cold.icon }),
  airResistance: () => tp('tooltip.airResistance', { icon: ELEMENTS.air.icon }),
  earthResistance: () => tp('tooltip.earthResistance', { icon: ELEMENTS.earth.icon }),
  lightningResistance: () =>
    tp('tooltip.lightningResistance', { icon: ELEMENTS.lightning.icon }),
  waterResistance: () => tp('tooltip.waterResistance', { icon: ELEMENTS.water.icon }),
  allResistance: () => t('tooltip.allResistance'),
  lifePerHit: () => t('tooltip.lifePerHit'),
  manaPerHit: () => t('tooltip.manaPerHit'),
  fireDamage: () => tp('tooltip.fireDamage', { icon: ELEMENTS.fire.icon }),
  coldDamage: () => tp('tooltip.coldDamage', { icon: ELEMENTS.cold.icon }),
  airDamage: () => tp('tooltip.airDamage', { icon: ELEMENTS.air.icon }),
  earthDamage: () => tp('tooltip.earthDamage', { icon: ELEMENTS.earth.icon }),
  lightningDamage: () => tp('tooltip.lightningDamage', { icon: ELEMENTS.lightning.icon }),
  waterDamage: () => tp('tooltip.waterDamage', { icon: ELEMENTS.water.icon }),
  doubleDamageChance: () => t('tooltip.doubleDamageChance'),
  resurrectionChance: () => t('tooltip.resurrectionChance'),
  bonusGoldPercent: () => t('tooltip.bonusGoldPercent'),
  bonusExperiencePercent: () => t('tooltip.bonusExperiencePercent'),
  itemQuantityPercent: () => t('tooltip.itemQuantityPercent'),
  itemRarityPercent: () => t('tooltip.itemRarityPercent'),
  skillPoints: () => t('tooltip.skillPoints'),
  allAttributes: () => t('tooltip.allAttributes'),
  allAttributesPercent: () => t('tooltip.allAttributesPercent'),
  manaShieldPercent: () => t('tooltip.manaShieldPercent'),
  reflectFireDamage: () => t('tooltip.reflectFireDamage'),
  thornsDamage: () => t('tooltip.thornsDamage'),
  thornsDamagePercent: () => t('tooltip.thornsDamagePercent'),
  attackNeverMiss: () => t('tooltip.attackNeverMiss'),
  chanceToHitPercent: () => t('tooltip.chanceToHitPercent'),
  ignoreEnemyArmor: () => t('tooltip.ignoreEnemyArmor'),
  ignoreAllEnemyResistances: () => t('tooltip.ignoreAllEnemyResistances'),
  percentOfPlayerDamage: () => t('tooltip.percentOfPlayerDamage'),
  extraMaterialDropPercent: () => t('tooltip.extraMaterialDropPercent'),
  extraMaterialDropMax: () => t('tooltip.extraMaterialDropMax'),
  itemBonusesPercent: () => t('tooltip.itemBonusesPercent'),
  cooldownReductionPercent: () => t('tooltip.cooldownReductionPercent'),
  manaCostReductionPercent: () => t('tooltip.manaCostReductionPercent'),
  buffDurationPercent: () => t('tooltip.buffDurationPercent'),
  lifeRegenOfTotalPercent: () => t('tooltip.lifeRegenOfTotalPercent'),
  manaRegenOfTotalPercent: () => t('tooltip.manaRegenOfTotalPercent'),
  reduceEnemyDamagePercent: () => t('tooltip.reduceEnemyDamagePercent'),
  reduceEnemyHpPercent: () => t('tooltip.reduceEnemyHpPercent'),
  reduceEnemyAttackSpeedPercent: () => t('tooltip.reduceEnemyAttackSpeedPercent'),
  firePenetrationPercent: () =>
    tp('tooltip.firePenetrationPercent', { icon: ELEMENTS.fire.icon }),
  coldPenetrationPercent: () =>
    tp('tooltip.coldPenetrationPercent', { icon: ELEMENTS.cold.icon }),
  airPenetrationPercent: () =>
    tp('tooltip.airPenetrationPercent', { icon: ELEMENTS.air.icon }),
  earthPenetrationPercent: () =>
    tp('tooltip.earthPenetrationPercent', { icon: ELEMENTS.earth.icon }),
  lightningPenetrationPercent: () =>
    tp('tooltip.lightningPenetrationPercent', { icon: ELEMENTS.lightning.icon }),
  waterPenetrationPercent: () =>
    tp('tooltip.waterPenetrationPercent', { icon: ELEMENTS.water.icon }),
  flatPenetrationPercent: () => t('tooltip.flatPenetrationPercent'),
  elementalPenetrationPercent: () => t('tooltip.elementalPenetrationPercent'),
  extraDamageFromLifePercent: () => t('tooltip.extraDamageFromLifePercent'),
  extraDamageFromArmorPercent: () => t('tooltip.extraDamageFromArmorPercent'),
  extraDamageFromManaPercent: () => t('tooltip.extraDamageFromManaPercent'),
  extraDamageFromEvasionPercent: () => t('tooltip.extraDamageFromEvasionPercent'),
  extraDamageFromAttackRatingPercent: () =>
    t('tooltip.extraDamageFromAttackRatingPercent'),
  extraDamageFromLifeRegenPercent: () =>
    t('tooltip.extraDamageFromLifeRegenPercent'),
};

export const getAttributeTooltip = (stat) => {
  const title = formatTitle(stat);
  const description = CUSTOM_DESCRIPTIONS[stat]?.() ?? generateDescription(stat);
  return html`<strong>${title}</strong><br />${description}`;
};
