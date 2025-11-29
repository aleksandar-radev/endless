import { ELEMENTS } from '../common.js';
import { t, tp } from '../../i18n.js';
import { ascension, skillTree } from '../../globals.js';

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
      lifePerPoint: 6,
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
      armorPerPoint: 4,
      thornsDamagePerPoint: 0,
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
      allResistancePerPoint: 3,
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
  strength: () => {
    const bonus = ascension?.getBonuses?.()?.strengthEffectiveness || 0;
    const val = ATTRIBUTES.strength.effects.damagePerPoint * (1 + bonus);
    return tp('tooltip.strength', { damage: Number(val.toFixed(2)) });
  },
  agility: () => {
    const bonus = ascension?.getBonuses?.()?.agilityEffectiveness || 0;
    const ar = ATTRIBUTES.agility.effects.attackRatingPerPoint * (1 + bonus);
    const dmg = ATTRIBUTES.agility.effects.damagePerPoint * (1 + bonus);
    return tp('tooltip.agility', {
      attackRating: Number(ar.toFixed(2)),
      damage: Number(dmg.toFixed(2)),
    });
  },
  vitality: () => {
    const bonus = ascension?.getBonuses?.()?.vitalityEffectiveness || 0;
    const val = ATTRIBUTES.vitality.effects.lifePerPoint * (1 + bonus);
    return tp('tooltip.vitality', { life: Number(val.toFixed(2)) });
  },
  wisdom: () => {
    const bonus = ascension?.getBonuses?.()?.wisdomEffectiveness || 0;
    const mana = ATTRIBUTES.wisdom.effects.manaPerPoint * (1 + bonus);
    const regen = ATTRIBUTES.wisdom.effects.manaRegenPerPoint * (1 + bonus);
    return tp('tooltip.wisdom', {
      mana: Number(mana.toFixed(2)),
      manaRegen: Number(regen.toFixed(3)),
    });
  },
  endurance: () => {
    const bonus = ascension?.getBonuses?.()?.enduranceEffectiveness || 0;
    const armor = ATTRIBUTES.endurance.effects.armorPerPoint * (1 + bonus);
    const skillBonuses = skillTree?.getAllSkillTreeBonuses?.() || {};
    const baseThorns = ATTRIBUTES.endurance.effects.thornsDamagePerPoint || 0;
    // Assuming thorns per point from skills also gets scaled by effectiveness?
    // Usually effectiveness scales the attribute's *output*.
    const totalThornsPerPoint = (baseThorns + (skillBonuses.enduranceThornsDamagePerPoint || 0)) * (1 + bonus);
    let thornsBonus = '';

    if (totalThornsPerPoint > 0) {
      thornsBonus = tp('tooltip.endurance.thornsBonus', {
        thornsDamage: Number(totalThornsPerPoint.toFixed(2)),
      });
    }

    return tp('tooltip.endurance', { armor: Number(armor.toFixed(2)), thornsBonus });
  },
  dexterity: () => {
    const bonus = ascension?.getBonuses?.()?.dexterityEffectiveness || 0;
    const val = ATTRIBUTES.dexterity.effects.evasionPerPoint * (1 + bonus);
    return tp('tooltip.dexterity', { evasion: Number(val.toFixed(2)) });
  },
  intelligence: () => {
    const bonus = ascension?.getBonuses?.()?.intelligenceEffectiveness || 0;
    const val = ATTRIBUTES.intelligence.effects.elementalDamagePerPoint * (1 + bonus);
    return tp('tooltip.intelligence', {
      elementalDamage: Number(val.toFixed(3)),
    });
  },
  perseverance: () => {
    const bonus = ascension?.getBonuses?.()?.perseveranceEffectiveness || 0;
    const mr = ATTRIBUTES.perseverance.effects.manaRegenPerPoint * (1 + bonus);
    const lr = ATTRIBUTES.perseverance.effects.lifeRegenPerPoint * (1 + bonus);
    const res = ATTRIBUTES.perseverance.effects.allResistancePerPoint * (1 + bonus);
    return tp('tooltip.perseverance', {
      manaRegen: Number(mr.toFixed(3)),
      lifeRegen: Number(lr.toFixed(2)),
      allResistance: Number(res.toFixed(2)),
    });
  },
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
  materialQuantityPercent: () => t('tooltip.materialQuantityPercent'),
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
  const description = CUSTOM_DESCRIPTIONS[stat]?.() ?? generateDescription(stat);
  return description;
};
