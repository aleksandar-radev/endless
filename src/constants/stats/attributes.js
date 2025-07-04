import { ELEMENTS } from '../common.js';

const html = String.raw;

export const ATTRIBUTES = {
  strength: {
    effects: {
      damagePerPoint: 0.5,
      damagePercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
    },
  },
  agility: {
    effects: {
      attackRatingPerPoint: 7,
      attackRatingPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      attackSpeedPer: {
        enabled: false,
        points: 25,
        value: 0.01,
      },
    },
  },
  vitality: {
    effects: {
      lifePerPoint: 5,
      lifePercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        enabled: false,
        points: 10,
        value: 0.01,
      },
    },
  },
  wisdom: {
    effects: {
      manaPerPoint: 1,
      manaPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
      regenPercentPer: {
        enabled: false,
        points: 10,
        value: 0.1,
      },
    },
  },
  endurance: {
    effects: {
      armorPerPoint: 4,
      armorPercentPer: {
        enabled: false,
        points: 5,
        value: 0.01,
      },
    },
  },
  dexterity: {
    effects: {
      evasionPerPoint: 4,
      critChancePer: {
        enabled: false,
        points: 25,
        value: 0.01,
      },
      critDamagePer: {
        enabled: false,
        points: 10,
        value: 0.01,
      },
    },
  },
};

export const ATTRIBUTE_TOOLTIPS = {
  getStrengthTooltip: () => html`
    <strong>Strength</strong><br />
    Each point increases:<br />
    • Damage by ${ATTRIBUTES.strength.effects.damagePerPoint}<br />
    ${ATTRIBUTES.strength.effects.damagePercentPer.enabled
    ? `• Every ${ATTRIBUTES.strength.effects.damagePercentPer.points} points adds ${
      ATTRIBUTES.strength.effects.damagePercentPer.value * 100
    }% to total damage`
    : ''}
  `,

  getAgilityTooltip: () => html`
    <strong>Agility</strong><br />
    Each point increases:<br />
    • Attack Rating by ${ATTRIBUTES.agility.effects.attackRatingPerPoint}<br />
    ${ATTRIBUTES.agility.effects.attackRatingPercentPer.enabled
    ? `• Every ${ATTRIBUTES.agility.effects.attackRatingPercentPer.points} points adds ${
      ATTRIBUTES.agility.effects.attackRatingPercentPer.value * 100
    }% to total attack rating`
    : ''}
    ${ATTRIBUTES.agility.effects.attackSpeedPer.enabled
    ? `• Every ${ATTRIBUTES.agility.effects.attackSpeedPer.points} points adds ${
      ATTRIBUTES.agility.effects.attackSpeedPer.value * 100
    }% attack speed`
    : ''}
  `,

  getVitalityTooltip: () => html`
    <strong>Vitality</strong><br />
    Each point increases:<br />
    • Life by ${ATTRIBUTES.vitality.effects.lifePerPoint}<br />
    ${ATTRIBUTES.vitality.effects.lifePercentPer.enabled
    ? `• Every ${ATTRIBUTES.vitality.effects.lifePercentPer.points} points adds ${
      ATTRIBUTES.vitality.effects.lifePercentPer.value * 100
    }% to total life`
    : ''}
    ${ATTRIBUTES.vitality.effects.regenPercentPer.enabled
    ? `• Every ${ATTRIBUTES.vitality.effects.regenPercentPer.points} points adds ${
      ATTRIBUTES.vitality.effects.regenPercentPer.value * 100
    }% life regeneration`
    : ''}
  `,

  getWisdomTooltip: () => html`
    <strong>Wisdom</strong><br />
    Each point increases:<br />
    • Mana by ${ATTRIBUTES.wisdom.effects.manaPerPoint}<br />
    ${ATTRIBUTES.wisdom.effects.manaPercentPer.enabled
    ? `• Every ${ATTRIBUTES.wisdom.effects.manaPercentPer.points} points adds ${
      ATTRIBUTES.wisdom.effects.manaPercentPer.value * 100
    }% to total mana`
    : ''}
    ${ATTRIBUTES.wisdom.effects.regenPercentPer.enabled
    ? `• Every ${ATTRIBUTES.wisdom.effects.regenPercentPer.points} points adds ${
      ATTRIBUTES.wisdom.effects.regenPercentPer.value * 100
    }% mana regeneration`
    : ''}
  `,

  getEnduranceTooltip: () => html`
    <strong>Endurance</strong><br />
    Each point increases:<br />
    • Armor by ${ATTRIBUTES.endurance.effects.armorPerPoint}<br />
    ${ATTRIBUTES.endurance.effects.armorPercentPer.enabled
    ? `• Every ${ATTRIBUTES.endurance.effects.armorPercentPer.points} points adds ${
      ATTRIBUTES.endurance.effects.armorPercentPer.value * 100
    }% to total armor`
    : ''}
  `,

  getDexterityTooltip: () => html`
    <strong>Dexterity</strong><br />
    Each point increases:<br />
    • Evasion by ${ATTRIBUTES.dexterity.effects.evasionPerPoint}<br />
    ${ATTRIBUTES.dexterity.effects.critChancePer.enabled
    ? `• Every ${ATTRIBUTES.dexterity.effects.critChancePer.points} points adds ${
      ATTRIBUTES.dexterity.effects.critChancePer.value * 100
    }% critical strike chance`
    : ''}
    ${ATTRIBUTES.dexterity.effects.critDamagePer.enabled
    ? `• Every ${ATTRIBUTES.dexterity.effects.critDamagePer.points} points adds ${
      ATTRIBUTES.dexterity.effects.critDamagePer.value * 100
    }% critical strike damage`
    : ''}
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
};
