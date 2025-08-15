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

export const ATTRIBUTE_TOOLTIPS = {
  strengthTooltip: () => html`
    <strong>Strength</strong><br />
    Each point increases:<br />
    • Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />
  `,

  agilityTooltip: () => html`
    <strong>Agility</strong><br />
    Each point increases:<br />
    • Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />
    • Damage by ${ATTRIBUTES.agility.effects.damagePerPoint}<br />
  `,

  vitalityTooltip: () => html`
    <strong>Vitality</strong><br />
    Each point increases:<br />
    • Life by ${ATTRIBUTES.vitality.effects.lifePerPoint}<br />
  `,

  wisdomTooltip: () => html`
    <strong>Wisdom</strong><br />
    Each point increases:<br />
    • Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />
  `,

  enduranceTooltip: () => html`
    <strong>Endurance</strong><br />
    Each point increases:<br />
    • Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />
  `,

  dexterityTooltip: () => html`
    <strong>Dexterity</strong><br />
    Each point increases:<br />
    • Evasion by ${ATTRIBUTES.dexterity.effects.evasionPerPoint}<br />
  `,

  intelligenceTooltip: () => html`
    <strong>Intelligence</strong><br />
    Each point increases:<br />
    • Elemental Damage by ${ATTRIBUTES.intelligence.effects.elementalDamagePerPoint}<br />
  `,

  perseveranceTooltip: () => html`
    <strong>Perseverance</strong><br />
    Each point increases:<br />
    • Mana Regeneration by ${ATTRIBUTES.perseverance.effects.manaRegenPerPoint}<br />
    • Life Regeneration by ${ATTRIBUTES.perseverance.effects.lifeRegenPerPoint}<br />
    • All Resistances by ${ATTRIBUTES.perseverance.effects.allResistancePerPoint}<br />
  `,

  elementalDamageTooltip: () => html`
    <strong>Elemental Damage</strong><br />
    Included in base hit damage. Reduced by enemy resistances.
  `,

  damageTooltip: () => html`
    <strong>Damage</strong><br />
    Base physical damage dealt to enemies.<br />
    Increased by Strength and equipment.
  `,

  attackSpeedTooltip: () => html`
    <strong>Attack Speed</strong><br />
    Number of attacks per second.<br />
    Maximum: 5 attacks/second
  `,

  attackRatingTooltip: () => html`
    <strong>Attack Rating</strong><br />
    Determines hit chance against enemies.<br />
    Higher stages require more Attack Rating.
  `,

  critChanceTooltip: () => html`
    <strong>Critical Strike Chance</strong><br />
    Chance to deal critical damage.<br />
    Maximum: 100%
  `,

  critDamageTooltip: () => html`
    <strong>Critical Strike Damage</strong><br />
    Damage multiplier on critical hits.<br />
    Base: 1.33x damage
  `,

  lifeStealTooltip: () => html`
    <strong>Life Steal</strong><br />
    Percentage of damage dealt recovered as life.
  `,

  lifeTooltip: () => html`
    <strong>Life</strong><br />
    Maximum life points.<br />
    Increased by Vitality and level ups.
  `,

  lifeRegenerationTooltip: () => html`
    <strong>Life Regeneration</strong><br />
    Amount of life recovered per second.
  `,

  manaTooltip: () => html`
    <strong>Mana</strong><br />
    Maximum mana points.<br />
    Increased by Wisdom and level ups.
  `,

  manaRegenerationTooltip: () => html`
    <strong>Mana Regeneration</strong><br />
    Amount of mana recovered per second.
  `,

  armorTooltip: () => html`
    <strong>Armor</strong><br />
    Reduces incoming damage.<br />
    Effectiveness decreases in higher stages.
  `,

  blockChanceTooltip: () => html`
    <strong>Block Chance</strong><br />
    Chance to block incoming attacks.<br />
    Maximum: 75%
  `,

  evasionTooltip: () => html`
    <strong>Evasion</strong><br />
    Chance to dodge enemy attacks completely.<br />
    Higher evasion reduces enemy hit chance.
  `,

  fireResistanceTooltip: () => html`
    <strong>Fire Resistance</strong><br />
    Reduces fire damage taken from enemies.<br />
    ${ELEMENTS.fire.icon} Effective against fire enemies.
  `,

  coldResistanceTooltip: () => html`
    <strong>Cold Resistance</strong><br />
    Reduces cold damage taken from enemies.<br />
    ${ELEMENTS.cold.icon} Effective against cold enemies.
  `,

  airResistanceTooltip: () => html`
    <strong>Air Resistance</strong><br />
    Reduces air damage taken from enemies.<br />
    ${ELEMENTS.air.icon} Effective against air enemies.
  `,

  earthResistanceTooltip: () => html`
    <strong>Earth Resistance</strong><br />
    Reduces earth damage taken from enemies.<br />
    ${ELEMENTS.earth.icon} Effective against earth enemies.
  `,

  lightningResistanceTooltip: () => html`
    <strong>Lightning Resistance</strong><br />
    Reduces lightning damage taken from enemies.<br />
    ${ELEMENTS.lightning.icon} Effective against lightning enemies.
  `,

  waterResistanceTooltip: () => html`
    <strong>Water Resistance</strong><br />
    Reduces water damage taken from enemies.<br />
    ${ELEMENTS.water.icon} Effective against water enemies.
  `,

  elementalResistanceTooltip: () => html`
    <strong>Elemental Resistance</strong><br />
    Reduces elemental damage taken from enemies based on your resistance and the enemy's damage.
  `,
};
