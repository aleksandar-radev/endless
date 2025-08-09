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
      manaPerPoint: 1,
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 4,
    },
  },
  dexterity: {
    effects: {
      evasionPerPoint: 5,
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
    },
  },
};

export const ATTRIBUTE_TOOLTIPS = {
  getStrengthTooltip: () => html`
    <strong>Strength</strong><br />
    Each point increases:<br />
    • Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />
  `,

  getAgilityTooltip: () => html`
    <strong>Agility</strong><br />
    Each point increases:<br />
    • Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />
    • Damage by ${ATTRIBUTES.agility.effects.damagePerPoint}<br />
  `,

  getVitalityTooltip: () => html`
    <strong>Vitality</strong><br />
    Each point increases:<br />
    • Life by ${ATTRIBUTES.vitality.effects.lifePerPoint}<br />
  `,

  getWisdomTooltip: () => html`
    <strong>Wisdom</strong><br />
    Each point increases:<br />
    • Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />
  `,

  getEnduranceTooltip: () => html`
    <strong>Endurance</strong><br />
    Each point increases:<br />
    • Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />
  `,

  getDexterityTooltip: () => html`
    <strong>Dexterity</strong><br />
    Each point increases:<br />
    • Evasion by ${ATTRIBUTES.dexterity.effects.evasionPerPoint}<br />
  `,

  getIntelligenceTooltip: () => html`
    <strong>Intelligence</strong><br />
    Each point increases:<br />
    • Elemental Damage by ${ATTRIBUTES.intelligence.effects.elementalDamagePerPoint}<br />
  `,

  getPerseveranceTooltip: () => html`
    <strong>Perseverance</strong><br />
    Each point increases:<br />
    • Mana Regeneration by ${ATTRIBUTES.perseverance.effects.manaRegenPerPoint}<br />
    • Life Regeneration by ${ATTRIBUTES.perseverance.effects.lifeRegenPerPoint}
  `,

  getElementalDamageTooltip: () => html`
    <strong>Elemental Damage</strong><br />
    Included in base hit damage. Reduced by enemy resistances.
  `,

  getDamageTooltip: () => html`
    <strong>Damage</strong><br />
    Base physical damage dealt to enemies.<br />
    Increased by Strength and equipment.
  `,

  getAttackSpeedTooltip: () => html`
    <strong>Attack Speed</strong><br />
    Number of attacks per second.<br />
    Maximum: 5 attacks/second
  `,

  getAttackRatingTooltip: () => html`
    <strong>Attack Rating</strong><br />
    Determines hit chance against enemies.<br />
    Higher stages require more Attack Rating.
  `,

  getCritChanceTooltip: () => html`
    <strong>Critical Strike Chance</strong><br />
    Chance to deal critical damage.<br />
    Maximum: 100%
  `,

  getCritDamageTooltip: () => html`
    <strong>Critical Strike Damage</strong><br />
    Damage multiplier on critical hits.<br />
    Base: 1.5x damage
  `,

  getLifeStealTooltip: () => html`
    <strong>Life Steal</strong><br />
    Percentage of damage dealt recovered as life.
  `,

  getLifeTooltip: () => html`
    <strong>Life</strong><br />
    Maximum life points.<br />
    Increased by Vitality and level ups.
  `,

  getLifeRegenerationTooltip: () => html`
    <strong>Life Regeneration</strong><br />
    Amount of life recovered per second.
  `,

  getManaTooltip: () => html`
    <strong>Mana</strong><br />
    Maximum mana points.<br />
    Increased by Wisdom and level ups.
  `,

  getManaRegenerationTooltip: () => html`
    <strong>Mana Regeneration</strong><br />
    Amount of mana recovered per second.
  `,

  getArmorTooltip: () => html`
    <strong>Armor</strong><br />
    Reduces incoming damage.<br />
    Effectiveness decreases in higher stages.
  `,

  getBlockChanceTooltip: () => html`
    <strong>Block Chance</strong><br />
    Chance to block incoming attacks.<br />
    Maximum: 75%
  `,

  getEvasionTooltip: () => html`
    <strong>Evasion</strong><br />
    Chance to dodge enemy attacks completely.<br />
    Higher evasion reduces enemy hit chance.
  `,

  getFireResistanceTooltip: () => html`
    <strong>Fire Resistance</strong><br />
    Reduces fire damage taken from enemies.<br />
    ${ELEMENTS.fire.icon} Effective against fire enemies.
  `,

  getColdResistanceTooltip: () => html`
    <strong>Cold Resistance</strong><br />
    Reduces cold damage taken from enemies.<br />
    ${ELEMENTS.cold.icon} Effective against cold enemies.
  `,

  getAirResistanceTooltip: () => html`
    <strong>Air Resistance</strong><br />
    Reduces air damage taken from enemies.<br />
    ${ELEMENTS.air.icon} Effective against air enemies.
  `,

  getEarthResistanceTooltip: () => html`
    <strong>Earth Resistance</strong><br />
    Reduces earth damage taken from enemies.<br />
    ${ELEMENTS.earth.icon} Effective against earth enemies.
  `,
  getLightningResistanceTooltip: () => html`
    <strong>Lightning Resistance</strong><br />
    Reduces lightning damage taken from enemies.<br />
    ${ELEMENTS.lightning.icon} Effective against lightning enemies.
  `,
  getWaterResistanceTooltip: () => html`
    <strong>Water Resistance</strong><br />
    Reduces water damage taken from enemies.<br />
    ${ELEMENTS.water.icon} Effective against water enemies.
  `,
  getElementalResistanceTooltip: () => html`
    <strong>Elemental Resistance. Reduces elemental damage taken from enemies based on your resistance and the enemy's damage.</strong>
  `,
};
