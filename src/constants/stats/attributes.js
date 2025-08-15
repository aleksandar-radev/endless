import { ELEMENTS } from '../common.js';

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

const formatTitle = (stat) =>
  stat.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());

const generateDescription = (stat) => {
  const base = stat.replace(/Percent$|PerLevel$|OfTotalPercent$/, '');
  if (stat.endsWith('Percent')) {
    return `Increases ${formatTitle(base)} by a percentage.`;
  }
  if (stat.endsWith('PerLevel')) {
    return `${formatTitle(base)} gained per level.`;
  }
  if (stat.endsWith('OfTotalPercent')) {
    return `${formatTitle(base)} based on total ${formatTitle(base)}.`;
  }
  if (stat.endsWith('PenetrationPercent')) {
    return `Ignores a percentage of enemy ${formatTitle(base.replace(/PenetrationPercent$/, '')).toLowerCase()} resistance.`;
  }
  if (stat.endsWith('Penetration')) {
    return `Ignores a flat amount of enemy ${formatTitle(base.replace(/Penetration$/, '')).toLowerCase()} resistance.`;
  }
  if (stat.endsWith('ResistancePercent')) {
    return `Increases ${formatTitle(base.replace(/ResistancePercent$/, ''))} resistance by a percentage.`;
  }
  if (stat.endsWith('Resistance')) {
    return `Reduces ${formatTitle(base.replace(/Resistance$/, ''))} damage taken.`;
  }
  if (stat.endsWith('DamagePercent')) {
    return `Increases ${formatTitle(base.replace(/DamagePercent$/, ''))} damage by a percentage.`;
  }
  if (stat.endsWith('Damage')) {
    return `Adds ${formatTitle(base.replace(/Damage$/, ''))} damage to your attacks.`;
  }
  if (stat.endsWith('RegenPercent')) {
    return `Increases ${formatTitle(base.replace(/RegenPercent$/, '') + ' regeneration')} by a percentage.`;
  }
  if (stat.endsWith('Regen')) {
    return `Amount of ${formatTitle(base.replace(/Regen$/, '') + ' regeneration').toLowerCase()}.`;
  }
  if (stat.startsWith('extraDamageFrom')) {
    return `Adds damage equal to a percentage of your ${formatTitle(stat.replace('extraDamageFrom', '')).toLowerCase()}.`;
  }
  if (stat.endsWith('Chance')) {
    return `Chance to ${formatTitle(stat.replace('Chance', '')).toLowerCase()}.`;
  }
  return `Description for ${formatTitle(stat)}.`;
};

const CUSTOM_DESCRIPTIONS = {
  strength: () => `Each point increases:<br />• Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />`,
  agility: () =>
    `Each point increases:<br />• Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />• Damage by ${ATTRIBUTES.agility.effects.damagePerPoint}<br />`,
  vitality: () => `Each point increases:<br />• Life by ${ATTRIBUTES.vitality.effects.lifePerPoint}<br />`,
  wisdom: () => `Each point increases:<br />• Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />`,
  endurance: () => `Each point increases:<br />• Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />`,
  dexterity: () => `Each point increases:<br />• Evasion by ${ATTRIBUTES.dexterity.effects.evasionPerPoint}<br />`,
  intelligence: () =>
    `Each point increases:<br />• Elemental Damage by ${ATTRIBUTES.intelligence.effects.elementalDamagePerPoint}<br />`,
  perseverance: () =>
    `Each point increases:<br />• Mana Regeneration by ${ATTRIBUTES.perseverance.effects.manaRegenPerPoint}<br />• Life Regeneration by ${ATTRIBUTES.perseverance.effects.lifeRegenPerPoint}<br />• All Resistances by ${ATTRIBUTES.perseverance.effects.allResistancePerPoint}<br />`,
  elementalDamage: () => 'Included in base hit damage. Reduced by enemy resistances.',
  damage: () => 'Base physical damage dealt to enemies.<br />Increased by Strength and equipment.',
  attackSpeed: () => 'Number of attacks per second.<br />Maximum: 5 attacks/second',
  attackRating: () => 'Determines hit chance against enemies.<br />Higher stages require more Attack Rating.',
  critChance: () => 'Chance to deal critical damage.<br />Maximum: 100%',
  critDamage: () => 'Damage multiplier on critical hits.<br />Base: 1.33x damage',
  lifeSteal: () => 'Percentage of damage dealt recovered as life.',
  life: () => 'Maximum life points.<br />Increased by Vitality and level ups.',
  lifeRegen: () => 'Amount of life recovered per second.',
  mana: () => 'Maximum mana points.<br />Increased by Wisdom and level ups.',
  manaRegen: () => 'Amount of mana recovered per second.',
  armor: () => 'Reduces incoming damage.<br />Effectiveness decreases in higher stages.',
  blockChance: () => 'Chance to block incoming attacks.<br />Maximum: 75%',
  evasion: () => 'Chance to dodge enemy attacks completely.<br />Higher evasion reduces enemy hit chance.',
  fireResistance: () =>
    `Reduces fire damage taken from enemies.<br />${ELEMENTS.fire.icon} Effective against fire enemies.`,
  coldResistance: () =>
    `Reduces cold damage taken from enemies.<br />${ELEMENTS.cold.icon} Effective against cold enemies.`,
  airResistance: () =>
    `Reduces air damage taken from enemies.<br />${ELEMENTS.air.icon} Effective against air enemies.`,
  earthResistance: () =>
    `Reduces earth damage taken from enemies.<br />${ELEMENTS.earth.icon} Effective against earth enemies.`,
  lightningResistance: () =>
    `Reduces lightning damage taken from enemies.<br />${ELEMENTS.lightning.icon} Effective against lightning enemies.`,
  waterResistance: () =>
    `Reduces water damage taken from enemies.<br />${ELEMENTS.water.icon} Effective against water enemies.`,
  allResistance: () =>
    'Reduces elemental damage taken from enemies based on your resistance and the enemy\'s damage.',
  lifePerHit: () => 'Restores life whenever your attack hits an enemy.',
  manaPerHit: () => 'Restores mana whenever your attack hits an enemy.',
  fireDamage: () =>
    `Adds fire damage to your attacks.<br />${ELEMENTS.fire.icon} Reduced by enemy fire resistance.`,
  coldDamage: () =>
    `Adds cold damage to your attacks.<br />${ELEMENTS.cold.icon} Reduced by enemy cold resistance.`,
  airDamage: () =>
    `Adds air damage to your attacks.<br />${ELEMENTS.air.icon} Reduced by enemy air resistance.`,
  earthDamage: () =>
    `Adds earth damage to your attacks.<br />${ELEMENTS.earth.icon} Reduced by enemy earth resistance.`,
  lightningDamage: () =>
    `Adds lightning damage to your attacks.<br />${ELEMENTS.lightning.icon} Reduced by enemy lightning resistance.`,
  waterDamage: () =>
    `Adds water damage to your attacks.<br />${ELEMENTS.water.icon} Reduced by enemy water resistance.`,
  doubleDamageChance: () => 'Chance for an attack to deal double damage.',
  resurrectionChance: () => 'Chance to revive after death.',
  bonusGoldPercent: () => 'Increases gold dropped by enemies.',
  bonusExperiencePercent: () => 'Increases experience gained from enemies.',
  itemQuantityPercent: () => 'Increases the number of items that drop.',
  itemRarityPercent: () => 'Increases the chance to find higher rarity items.',
  skillPoints: () => 'Permanent skill points earned from materials.',
  allAttributes: () => 'Adds points to all attributes.',
  allAttributesPercent: () => 'Increases all attributes by a percentage.',
  manaShieldPercent: () => 'Portion of damage taken from mana before life.',
  reflectFireDamage: () => 'Reflects fire damage back to attackers.',
  thornsDamage: () => 'Deals damage back to attackers when hit.',
  thornsDamagePercent: () => 'Increases reflected damage by a percentage.',
  attackNeverMiss: () => 'Attacks always hit the target.',
  chanceToHitPercent: () => 'Adds a flat bonus to your chance to hit.',
  ignoreEnemyArmor: () => 'Attacks completely ignore enemy armor.',
  ignoreAllEnemyResistances: () => 'Attacks ignore all enemy resistances.',
  percentOfPlayerDamage: () => "Deals a percentage of the player's damage.",
  extraMaterialDropPercent: () => 'Chance to drop extra materials on enemy kill.',
  extraMaterialDropMax: () => 'Maximum extra materials dropped per enemy kill.',
  itemBonusesPercent: () => 'Increases bonuses provided by items.',
  cooldownReductionPercent: () => 'Reduces ability cooldowns by a percentage.',
  manaCostReductionPercent: () => 'Reduces mana costs of abilities by a percentage.',
  buffDurationPercent: () => 'Increases the duration of buffs by a percentage.',
  lifeRegenOfTotalPercent: () => 'Regenerates life equal to a percentage of total life.',
  manaRegenOfTotalPercent: () => 'Regenerates mana equal to a percentage of total mana.',
  reduceEnemyDamagePercent: () => 'Reduces enemy damage by a percentage.',
  reduceEnemyHpPercent: () => 'Reduces enemy health by a percentage.',
  reduceEnemyAttackSpeedPercent: () => 'Reduces enemy attack speed by a percentage.',
  firePenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.fire.icon} resistance.`,
  coldPenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.cold.icon} resistance.`,
  airPenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.air.icon} resistance.`,
  earthPenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.earth.icon} resistance.`,
  lightningPenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.lightning.icon} resistance.`,
  waterPenetrationPercent: () =>
    `Ignores a percentage of enemy ${ELEMENTS.water.icon} resistance.`,
  elementalPenetrationPercent: () =>
    'Ignores a percentage of all enemy elemental resistances.',
  extraDamageFromLifePercent: () =>
    'Adds extra damage based on a percentage of your current life — the bonus is split 50% physical and 50% elemental.',
  extraDamageFromArmorPercent: () =>
    'Adds extra damage based on a percentage of your current armor — the bonus is split 50% physical and 50% elemental.',
  extraDamageFromManaPercent: () =>
    'Adds extra damage based on a percentage of your current mana — the bonus is split 50% physical and 50% elemental.',
  extraDamageFromEvasionPercent: () =>
    'Adds extra damage based on a percentage of your current evasion — the bonus is split 50% physical and 50% elemental.',
  extraDamageFromAttackRatingPercent: () =>
    'Adds extra damage based on a percentage of your current attack rating — the bonus is split 50% physical and 50% elemental.',
  extraDamageFromLifeRegenPercent: () =>
    'Adds extra damage based on a percentage of your current life regeneration — the bonus is split 50% physical and 50% elemental.',
};

export const getAttributeTooltip = (stat) => {
  const title = formatTitle(stat);
  const description = CUSTOM_DESCRIPTIONS[stat]?.() ?? generateDescription(stat);
  return html`<strong>${title}</strong><br />${description}`;
};
