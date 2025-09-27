import { t } from '../../i18n.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../../skillTree.js';
import { scaleDownFlat, scaleUpFlat } from '../../common.js';

// Elementalist skills extracted from skills.js
export const ELEMENTALIST_SKILLS = {
  // Tier 1 Skills
  fireball: {
    id: 'fireball',
    name: () => t('Fireball'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 2 + level * 0.25,
    cooldown: () => 5200,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'fireball',
    description: () => t('skill.fireball'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamage = scaleUpFlat(level, 2, 6);
      const fireDamagePercent = scaleDownFlat(level, 4);
      return {
        fireDamage: fireDamage * 4,
        fireDamagePercent: fireDamagePercent * 4,
      };
    },
  },
  frostArmor: {
    id: 'frostArmor',
    name: () => t('Frost Armor'),
    type: () => 'buff',
    manaCost: (level) => 6 + level * 1.25,
    cooldown: () => 34000,
    duration: () => 10000,
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'frost-armor',
    description: () => t('skill.frostArmor'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      armor: scaleUpFlat(level, 4, 8),
      armorPercent: scaleDownFlat(level, 3),
      coldDamagePercent: scaleDownFlat(level, 2),
    }),
  },

  warmth: {
    id: 'warmth',
    name: () => t('Warmth'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[0],
    icon: () => 'storm',
    description: () => t('skill.warmth'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPercent: scaleDownFlat(level, 2),
      manaRegen: scaleUpFlat(level, 0.2),
      manaRegenPercent: scaleDownFlat(level, 0.8),
      wisdomPercent: scaleDownFlat(level, 0.5),
      wisdom: scaleUpFlat(level, 2),
    }),
  },

  // Tier 10 Skills
  lightningStrike: {
    id: 'lightningStrike',
    name: () => t('Lightning Strike'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 4 + level * 0.375,
    cooldown: () => 3500,
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'lightning',
    description: () => t('skill.lightningStrike'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const lightningDamage = scaleUpFlat(level, 5, 7);
      const lightningDamagePercent = scaleDownFlat(level, 3);
      const airDamagePercent = scaleDownFlat(level, 2);
      return {
        lightningDamage: lightningDamage * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
        airDamagePercent: airDamagePercent * 4,
      };
    },
  },
  elementalMastery: {
    id: 'elementalMastery',
    name: () => t('Elemental Mastery'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[1],
    icon: () => 'elemental-mastery',
    description: () => t('skill.elementalMastery'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 0.75),
      elementalPenetration: scaleUpFlat(level, 8, 5),
      elementalPenetrationPercent: Math.min(scaleDownFlat(level, 0.1), 20),
    }),
  },

  // Tier 25 Skills
  blizzard: {
    id: 'blizzard',
    name: () => t('Blizzard'),
    type: () => 'buff',
    manaCost: (level) => 10 + level * 1.25,
    cooldown: () => 88000,
    duration: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'blizzard',
    description: () => t('skill.blizzard'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      coldDamagePercent: scaleDownFlat(level, 3),
      airDamagePercent: scaleDownFlat(level, 3),
      waterDamagePercent: scaleDownFlat(level, 3),
      lightningDamagePercent: scaleDownFlat(level, 3),
      coldDamage: scaleUpFlat(level, 3),
      airDamage: scaleUpFlat(level, 3),
      waterDamage: scaleUpFlat(level, 3),
      lightningDamage: scaleUpFlat(level, 3),
    }),
  },
  fireShield: {
    id: 'fireShield',
    name: () => t('Fire Shield'),
    type: () => 'buff',
    manaCost: (level) => 20 + level * 0.5,
    cooldown: () => 37000,
    duration: () => 15000,
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'fire-shield',
    description: () => t('skill.fireShield'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      reflectFireDamage: scaleUpFlat(level, 18),
      fireDamagePercent: scaleDownFlat(level, 2.5),
    }),
  },
  arcaneWisdom: {
    id: 'arcaneWisdom',
    name: () => t('Arcane Wisdom'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[2],
    icon: () => 'wisdom',
    description: () => t('skill.arcaneWisdom'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      manaPercent: scaleDownFlat(level, 1.5),
      manaRegen: scaleUpFlat(level, 0.2),
      manaRegenPercent: scaleDownFlat(level, 0.5),
      manaRegenOfTotalPercent: Math.min(scaleDownFlat(level, 0.005), 1),
    }),
  },

  // Tier 50 Skills
  elementalStorm: {
    id: 'elementalStorm',
    name: () => t('Elemental Storm'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 50,
    cooldown: () => 4500,
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'storm',
    description: () => t('skill.elementalStorm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const elementalDamage = scaleUpFlat(level, 2);
      const elementalDamagePercent = scaleDownFlat(level);
      return {
        elementalDamage: elementalDamage * 4,
        elementalDamagePercent: elementalDamagePercent * 4,
      };
    },
  },
  elementalAffinity: {
    id: 'elementalAffinity',
    name: () => t('Elemental Affinity'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[3],
    icon: () => 'affinity',
    description: () => t('skill.elementalAffinity'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamage: scaleUpFlat(level, 1),
      elementalDamagePercent: scaleDownFlat(level, 0.5),
      intelligencePercent: scaleDownFlat(level, 0.75),
      allResistance: scaleUpFlat(level, 7),
    }),
  },

  // Tier 75 Skills
  arcanePulse: {
    id: 'arcanePulse',
    name: () => t('Arcane Pulse'),
    type: () => 'buff',
    manaCost: (level) => 30 + level * 0.75,
    cooldown: () => 51000,
    duration: () => 25000,
    requiredLevel: () => SKILL_LEVEL_TIERS[4],
    icon: () => 'pulse',
    description: () => t('skill.arcanePulse'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      attackRatingPercent: scaleDownFlat(level, 1.9),
      lifePerHit: scaleUpFlat(level, 4),
      manaPerHit: scaleUpFlat(level, 0.5),
      attackSpeed: Math.min(scaleDownFlat(level, 0.0075), 1),
    }),
  },

  // Tier 100 Skills
  elementalOverload: {
    id: 'elementalOverload',
    name: () => t('Elemental Overload'),
    type: () => 'toggle',
    manaCost: (level) => 4 + level * 0.625,
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'overload',
    description: () => t('skill.elementalOverload'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      fireDamagePercent: scaleDownFlat(level, 2),
      coldDamagePercent: scaleDownFlat(level, 2),
      airDamagePercent: scaleDownFlat(level, 2),
      lightningDamagePercent: scaleDownFlat(level, 2),
    }),
  },
  primordialControl: {
    id: 'primordialControl',
    name: () => t('Primordial Control'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[5],
    icon: () => 'control',
    description: () => t('skill.primordialControl'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      earthDamagePercent: scaleDownFlat(level, 1.5),
      vitality: scaleUpFlat(level, 5),
      vitalityPercent: scaleDownFlat(level, 2),
      wisdomPercent: scaleDownFlat(level, 2),
    }),
  },

  // Tier 200 Skills
  avatarOfTheElements: {
    id: 'avatarOfTheElements',
    name: () => t('Avatar of the Elements'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[6],
    icon: () => 'avatar-of-elements',
    description: () => t('skill.avatarOfTheElements'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 1.2),
      elementalDamage: scaleUpFlat(level, 3),
      allResistance: scaleUpFlat(level, 8, 5, 0.15),
      perseverance: scaleUpFlat(level, 5, 5),
      perseverancePercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 1200 Skills
  elementalCorrosion: {
    id: 'elementalCorrosion',
    name: () => t('Elemental Corrosion'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'elemental-corrosion',
    description: () => t('skill.elementalCorrosion'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 1.4),
      elementalPenetrationPercent: Math.min(scaleDownFlat(level, 0.1), 20),
      manaRegenPercent: scaleDownFlat(level, 2),
    }),
  },
  volcanicWrath: {
    id: 'volcanicWrath',
    name: () => t('Volcanic Wrath'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 25 + level * 1.25,
    cooldown: () => 100000,
    requiredLevel: () => SKILL_LEVEL_TIERS[7],
    icon: () => 'volcanic-wrath',
    description: () => t('skill.volcanicWrath'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamagePercent = scaleDownFlat(level, 4);
      const earthDamage = scaleUpFlat(level, 8, 4);
      const fireDamage = scaleUpFlat(level, 6, 6, 0.15);
      return {
        fireDamagePercent: fireDamagePercent * 4,
        earthDamage: earthDamage * 4,
        fireDamage: fireDamage * 4,
      };
    },
  },

  // Tier 2000 Skills
  tempestNova: {
    id: 'tempestNova',
    name: () => t('Tempest Nova'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 35 + level * 1.25,
    cooldown: () => 40000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'tempest-nova',
    description: () => t('skill.tempestNova'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const lightningDamage = scaleUpFlat(level, 10, 4);
      const lightningDamagePercent = scaleDownFlat(level, 4);
      const coldDamage = scaleUpFlat(level, 10, 4);
      const coldDamagePercent = scaleDownFlat(level, 4);
      return {
        lightningDamage: lightningDamage * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
        coldDamage: coldDamage * 4,
        coldDamagePercent: coldDamagePercent * 4,
      };
    },
  },
  earthShatter: {
    id: 'earthShatter',
    name: () => t('Earth Shatter'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 30 + level * 1.25,
    cooldown: () => 17000,
    requiredLevel: () => SKILL_LEVEL_TIERS[8],
    icon: () => 'earth-shatter',
    description: () => t('skill.earthShatter'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const earthDamagePercent = scaleDownFlat(level, 4);
      const earthDamage = scaleUpFlat(level, 30, 4, 0.2);
      return {
        earthDamagePercent: earthDamagePercent * 8,
        earthDamage: earthDamage * 8,
      };
    },
  },

  // Tier 3000 Skills
  tidalWave: {
    id: 'tidalWave',
    name: () => t('Tidal Wave'),
    type: () => 'buff',
    manaCost: (level) => 40 + level * 1.25,
    cooldown: () => 70000,
    duration: () => 30000,
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'tidal-wave',
    description: () => t('skill.tidalWave'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      waterDamage: scaleUpFlat(level, 15, 5, 0.2),
      waterDamagePercent: scaleDownFlat(level, 5),
      reduceEnemyAttackSpeedPercent: Math.min(scaleDownFlat(level, 0.1), 15),
    }),
  },
  stormLord: {
    id: 'stormLord',
    name: () => t('Storm Lord'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[9],
    icon: () => 'storm-lord',
    description: () => t('skill.stormLord'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      lightningDamagePercent: scaleDownFlat(level, 5),
      elementalDamage: scaleUpFlat(level, 1.4),
      manaPercent: scaleDownFlat(level, 1.5),
    }),
  },

  // Tier 5000 Skills
  elementalAscension: {
    id: 'elementalAscension',
    name: () => t('Elemental Ascension'),
    type: () => 'passive',
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'elemental-ascension',
    description: () => t('skill.elementalAscension'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => ({
      elementalDamagePercent: scaleDownFlat(level, 1.5),
      elementalPenetrationPercent: Math.min(scaleDownFlat(level, 0.1), 15),
      allResistance: scaleUpFlat(level, 16),
    }),
  },
  natureCataclysm: {
    id: 'natureCataclysm',
    name: () => t('Nature Cataclysm'),
    type: () => 'instant',
    skill_type: 'spell',
    manaCost: (level) => 50 + level * 1.25,
    cooldown: () => 28000,
    requiredLevel: () => SKILL_LEVEL_TIERS[10],
    icon: () => 'nature-cataclysm',
    description: () => t('skill.natureCataclysm'),
    maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
    effect: (level) => {
      const fireDamagePercent = scaleDownFlat(level, 5);
      const coldDamagePercent = scaleDownFlat(level, 5);
      const lightningDamagePercent = scaleDownFlat(level, 5);
      const elementalDamage = scaleUpFlat(level, 8, 4);
      return {
        fireDamagePercent: fireDamagePercent * 4,
        coldDamagePercent: coldDamagePercent * 4,
        lightningDamagePercent: lightningDamagePercent * 4,
        elementalDamage: elementalDamage * 4,
      };
    },
  },
};
