import { t } from '../i18n.js';
import { scaleDownFlat, scaleUpFlat } from '../common.js';
import { DEFAULT_MAX_SKILL_LEVEL, SKILL_LEVEL_TIERS } from '../skillTree.js';

// Each class has 3 specializations
// Once a player chooses the first upgrade in one specialization, the other two become locked

export const SPECIALIZATIONS = {
  WARRIOR: {
    GUARDIAN: {
      id: 'GUARDIAN',
      name: () => t('specialization.warrior.guardian.name'),
      description: () => t('specialization.warrior.guardian.description'),
      avatar: () => 'warrior-guardian-avatar.jpg',
      baseStats: () => ({
        armorPercent: 20,
        blockChance: 5,
      }),
      skills: {
        guardianStance: {
          id: 'guardianStance',
          name: () => t('Guardian Stance'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'shield',
          description: () => t('skill.guardianStance'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armor: scaleUpFlat(level, 10, 8, 0.2),
            armorPercent: scaleDownFlat(level, 5),
            blockChance: scaleDownFlat(level, 0.5),
          }),
        },
        fortifiedShield: {
          id: 'fortifiedShield',
          name: () => t('Fortified Shield'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'shield',
          description: () => t('skill.fortifiedShield'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorPercent: scaleDownFlat(level, 30),
            reduceEnemyDamagePercent: scaleDownFlat(level, 10),
          }),
        },
      },
    },
    WEAPONMASTER: {
      id: 'WEAPONMASTER',
      name: () => t('specialization.warrior.weaponmaster.name'),
      description: () => t('specialization.warrior.weaponmaster.description'),
      avatar: () => 'warrior-weaponmaster-avatar.jpg',
      baseStats: () => ({
        damagePercent: 15,
        attackRatingPercent: 10,
      }),
      skills: {
        weaponExpertise: {
          id: 'weaponExpertise',
          name: () => t('Weapon Expertise'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'sword',
          description: () => t('skill.weaponExpertise'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 8, 6, 0.2),
            damagePercent: scaleDownFlat(level, 3),
            attackRatingPercent: scaleDownFlat(level, 5),
          }),
        },
        powerfulStrike: {
          id: 'powerfulStrike',
          name: () => t('Powerful Strike'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'war-axe',
          description: () => t('skill.powerfulStrike'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 20, 10, 0.2),
            damagePercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
    GLADIATOR: {
      id: 'GLADIATOR',
      name: () => t('specialization.warrior.gladiator.name'),
      description: () => t('specialization.warrior.gladiator.description'),
      avatar: () => 'warrior-gladiator-avatar.jpg',
      baseStats: () => ({
        critChance: 10,
        attackSpeed: 0.1,
      }),
      skills: {
        combatMastery: {
          id: 'combatMastery',
          name: () => t('Combat Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'helmet',
          description: () => t('skill.combatMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            critChance: scaleDownFlat(level, 1),
            critDamage: scaleDownFlat(level, 0.1),
            attackRatingPercent: scaleDownFlat(level, 5),
          }),
        },
        gladiatorsFury: {
          id: 'gladiatorsFury',
          name: () => t('Gladiator\'s Fury'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'cry',
          description: () => t('skill.gladiatorsFury'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 20, 10, 0.2),
            damagePercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
  },
  ROGUE: {
    ASSASSIN: {
      id: 'ASSASSIN',
      name: () => t('specialization.rogue.assassin.name'),
      description: () => t('specialization.rogue.assassin.description'),
      avatar: () => 'rogue-assassin-avatar.jpg',
      baseStats: () => ({
        critChance: 15,
        critDamage: 0.2,
      }),
      skills: {
        deadlyPrecision: {
          id: 'deadlyPrecision',
          name: () => t('Deadly Precision'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'dagger',
          description: () => t('skill.deadlyPrecision'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            critChance: scaleDownFlat(level, 2),
            critDamage: scaleDownFlat(level, 0.15),
          }),
        },
        shadowStrike: {
          id: 'shadowStrike',
          name: () => t('Shadow Strike'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'dagger',
          description: () => t('skill.shadowStrike'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 15, 8, 0.2),
            damagePercent: scaleDownFlat(level, 25),
          }),
        },
      },
    },
    SHADOWDANCER: {
      id: 'SHADOWDANCER',
      name: () => t('specialization.rogue.shadowdancer.name'),
      description: () => t('specialization.rogue.shadowdancer.description'),
      avatar: () => 'rogue-shadowdancer-avatar.jpg',
      baseStats: () => ({
        evasionPercent: 15,
        attackSpeed: 0.1,
      }),
      skills: {
        evasiveTactics: {
          id: 'evasiveTactics',
          name: () => t('Evasive Tactics'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'dodge',
          description: () => t('skill.evasiveTactics'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasion: scaleUpFlat(level, 10, 8, 0.2),
            evasionPercent: scaleDownFlat(level, 5),
          }),
        },
        smokeBomb: {
          id: 'smokeBomb',
          name: () => t('Smoke Bomb'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'smoke',
          description: () => t('skill.smokeBomb'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasionPercent: scaleDownFlat(level, 40),
            reduceEnemyAttackSpeedPercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
    RANGER: {
      id: 'RANGER',
      name: () => t('specialization.rogue.ranger.name'),
      description: () => t('specialization.rogue.ranger.description'),
      avatar: () => 'rogue-ranger-avatar.jpg',
      baseStats: () => ({
        attackRatingPercent: 20,
        damagePercent: 10,
      }),
      skills: {
        marksmanship: {
          id: 'marksmanship',
          name: () => t('Marksmanship'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'bow',
          description: () => t('skill.marksmanship'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackRating: scaleUpFlat(level, 10, 8, 0.2),
            attackRatingPercent: scaleDownFlat(level, 5),
            chanceToHitPercent: scaleDownFlat(level, 1),
          }),
        },
        precisionShot: {
          id: 'precisionShot',
          name: () => t('Precision Shot'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'bow',
          description: () => t('skill.precisionShot'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 12, 6, 0.2),
            damagePercent: scaleDownFlat(level, 20),
            armorPenetrationPercent: scaleDownFlat(level, 10),
          }),
        },
      },
    },
  },
  VAMPIRE: {
    BLOODLORD: {
      id: 'BLOODLORD',
      name: () => t('specialization.vampire.bloodlord.name'),
      description: () => t('specialization.vampire.bloodlord.description'),
      avatar: () => 'vampire-bloodlord-avatar.jpg',
      baseStats: () => ({
        lifeSteal: 5,
        lifePercent: 10,
      }),
      skills: {
        bloodThirst: {
          id: 'bloodThirst',
          name: () => t('Blood Thirst'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'blood-drop',
          description: () => t('skill.bloodThirst'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: scaleDownFlat(level, 1),
            damagePercent: scaleDownFlat(level, 3),
          }),
        },
        bloodFrenzy: {
          id: 'bloodFrenzy',
          name: () => t('Blood Frenzy'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'blood-drop',
          description: () => t('skill.bloodFrenzy'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: scaleDownFlat(level, 5),
            attackSpeed: scaleDownFlat(level, 0.3),
          }),
        },
      },
    },
    NIGHTSTALKER: {
      id: 'NIGHTSTALKER',
      name: () => t('specialization.vampire.nightstalker.name'),
      description: () => t('specialization.vampire.nightstalker.description'),
      avatar: () => 'vampire-nightstalker-avatar.jpg',
      baseStats: () => ({
        evasionPercent: 10,
        lifeSteal: 5,
      }),
      skills: {
        shadowForm: {
          id: 'shadowForm',
          name: () => t('Shadow Form'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'shadow',
          description: () => t('skill.shadowForm'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasion: scaleUpFlat(level, 8, 6, 0.2),
            damagePercent: scaleDownFlat(level, 2),
          }),
        },
        darkEmbrace: {
          id: 'darkEmbrace',
          name: () => t('Dark Embrace'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'shadow',
          description: () => t('skill.darkEmbrace'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: scaleDownFlat(level, 3),
            evasionPercent: scaleDownFlat(level, 20),
          }),
        },
      },
    },
    HEMOMANCER: {
      id: 'HEMOMANCER',
      name: () => t('specialization.vampire.hemomancer.name'),
      description: () => t('specialization.vampire.hemomancer.description'),
      avatar: () => 'vampire-hemomancer-avatar.jpg',
      baseStats: () => ({
        elementalDamagePercent: 15,
        lifeSteal: 5,
      }),
      skills: {
        bloodMagic: {
          id: 'bloodMagic',
          name: () => t('Blood Magic'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'wand',
          description: () => t('skill.bloodMagic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamagePercent: scaleDownFlat(level, 3),
            lifeSteal: scaleDownFlat(level, 0.5),
          }),
        },
        bloodBolt: {
          id: 'bloodBolt',
          name: () => t('Blood Bolt'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'wand',
          description: () => t('skill.bloodBolt'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamage: scaleUpFlat(level, 15, 8, 0.2),
            lifeSteal: scaleDownFlat(level, 2),
          }),
        },
      },
    },
  },
  PALADIN: {
    CRUSADER: {
      id: 'CRUSADER',
      name: () => t('specialization.paladin.crusader.name'),
      description: () => t('specialization.paladin.crusader.description'),
      avatar: () => 'paladin-crusader-avatar.jpg',
      baseStats: () => ({
        armorPercent: 20,
        blockChance: 10,
      }),
      skills: {
        holyShield: {
          id: 'holyShield',
          name: () => t('Holy Shield'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'shield',
          description: () => t('skill.holyShield'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            blockChance: scaleDownFlat(level, 1),
            armor: scaleUpFlat(level, 10, 8, 0.2),
          }),
        },
        divineIntervention: {
          id: 'divineIntervention',
          name: () => t('Divine Intervention'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'shield',
          description: () => t('skill.divineIntervention'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            blockChance: scaleDownFlat(level, 10),
            armorPercent: scaleDownFlat(level, 30),
          }),
        },
      },
    },
    TEMPLAR: {
      id: 'TEMPLAR',
      name: () => t('specialization.paladin.templar.name'),
      description: () => t('specialization.paladin.templar.description'),
      avatar: () => 'paladin-templar-avatar.jpg',
      baseStats: () => ({
        damagePercent: 15,
        lightDamagePercent: 10,
      }),
      skills: {
        righteousFury: {
          id: 'righteousFury',
          name: () => t('Righteous Fury'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'sword',
          description: () => t('skill.righteousFury'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 6, 5, 0.2),
            damagePercent: scaleDownFlat(level, 2),
          }),
        },
        holyStrike: {
          id: 'holyStrike',
          name: () => t('Holy Strike'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'sword',
          description: () => t('skill.holyStrike'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 18, 9, 0.2),
            lightDamage: scaleUpFlat(level, 10, 5, 0.2),
          }),
        },
      },
    },
    GUARDIAN: {
      id: 'GUARDIAN',
      name: () => t('specialization.paladin.guardian.name'),
      description: () => t('specialization.paladin.guardian.description'),
      avatar: () => 'paladin-guardian-avatar.jpg',
      baseStats: () => ({
        lifePercent: 20,
        allResistance: 10,
      }),
      skills: {
        protectorAura: {
          id: 'protectorAura',
          name: () => t('Protector Aura'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'aura',
          description: () => t('skill.protectorAura'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            life: scaleUpFlat(level, 20, 15, 0.2),
            lifePercent: scaleDownFlat(level, 3),
          }),
        },
        blessingOfProtection: {
          id: 'blessingOfProtection',
          name: () => t('Blessing of Protection'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'aura',
          description: () => t('skill.blessingOfProtection'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: scaleDownFlat(level, 20),
            allResistance: scaleUpFlat(level, 50, 30, 0.2),
          }),
        },
      },
    },
  },
  BERSERKER: {
    RAVAGER: {
      id: 'RAVAGER',
      name: () => t('specialization.berserker.ravager.name'),
      description: () => t('specialization.berserker.ravager.description'),
      avatar: () => 'berserker-ravager-avatar.jpg',
      baseStats: () => ({
        attackSpeed: 0.1,
        damagePercent: 10,
      }),
      skills: {
        savageFury: {
          id: 'savageFury',
          name: () => t('Savage Fury'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'war-axe',
          description: () => t('skill.savageFury'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: scaleDownFlat(level, 4),
            attackSpeed: scaleDownFlat(level, 0.05),
          }),
        },
        berserk: {
          id: 'berserk',
          name: () => t('Berserk'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'cry',
          description: () => t('skill.berserk'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: scaleDownFlat(level, 60),
            attackSpeed: scaleDownFlat(level, 0.5),
          }),
        },
      },
    },
    WARLORD: {
      id: 'WARLORD',
      name: () => t('specialization.berserker.warlord.name'),
      description: () => t('specialization.berserker.warlord.description'),
      avatar: () => 'berserker-warlord-avatar.jpg',
      baseStats: () => ({
        damagePercent: 15,
        critChance: 5,
      }),
      skills: {
        battleMastery: {
          id: 'battleMastery',
          name: () => t('Battle Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'sword',
          description: () => t('skill.battleMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 8, 6, 0.2),
            critChance: scaleDownFlat(level, 0.5),
          }),
        },
        warCry: {
          id: 'warCry',
          name: () => t('War Cry'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'cry',
          description: () => t('skill.warCry'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: scaleDownFlat(level, 30),
            attackRatingPercent: scaleDownFlat(level, 20),
          }),
        },
      },
    },
    SLAYER: {
      id: 'SLAYER',
      name: () => t('specialization.berserker.slayer.name'),
      description: () => t('specialization.berserker.slayer.description'),
      avatar: () => 'berserker-slayer-avatar.jpg',
      baseStats: () => ({
        critDamage: 0.2,
        damagePercent: 10,
      }),
      skills: {
        executionerStance: {
          id: 'executionerStance',
          name: () => t('Executioner Stance'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'war-axe',
          description: () => t('skill.executionerStance'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            critDamage: scaleDownFlat(level, 0.2),
            damagePercent: scaleDownFlat(level, 3),
          }),
        },
        execute: {
          id: 'execute',
          name: () => t('Execute'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'war-axe',
          description: () => t('skill.execute'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 30, 15, 0.2),
            damagePercent: scaleDownFlat(level, 20),
          }),
        },
      },
    },
  },
  ELEMENTALIST: {
    PYROMANCER: {
      id: 'PYROMANCER',
      name: () => t('specialization.elementalist.pyromancer.name'),
      description: () => t('specialization.elementalist.pyromancer.description'),
      avatar: () => 'elementalist-pyromancer-avatar.jpg',
      baseStats: () => ({
        fireDamagePercent: 20,
        elementalDamagePercent: 10,
      }),
      skills: {
        flameMastery: {
          id: 'flameMastery',
          name: () => t('Flame Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'fire',
          description: () => t('skill.flameMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            fireDamagePercent: scaleDownFlat(level, 5),
            elementalDamagePercent: scaleDownFlat(level, 2),
          }),
        },
        inferno: {
          id: 'inferno',
          name: () => t('Inferno'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'fire',
          description: () => t('skill.inferno'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            fireDamage: scaleUpFlat(level, 20, 10, 0.2),
            fireDamagePercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
    STORMCALLER: {
      id: 'STORMCALLER',
      name: () => t('specialization.elementalist.stormcaller.name'),
      description: () => t('specialization.elementalist.stormcaller.description'),
      avatar: () => 'elementalist-stormcaller-avatar.jpg',
      baseStats: () => ({
        lightningDamagePercent: 20,
        elementalDamagePercent: 10,
      }),
      skills: {
        stormMastery: {
          id: 'stormMastery',
          name: () => t('Storm Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'lightning',
          description: () => t('skill.stormMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lightningDamagePercent: scaleDownFlat(level, 5),
            elementalDamagePercent: scaleDownFlat(level, 2),
          }),
        },
        chainLightning: {
          id: 'chainLightning',
          name: () => t('Chain Lightning'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'lightning',
          description: () => t('skill.chainLightning'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lightningDamage: scaleUpFlat(level, 20, 10, 0.2),
            lightningDamagePercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
    CRYOMANCER: {
      id: 'CRYOMANCER',
      name: () => t('specialization.elementalist.cryomancer.name'),
      description: () => t('specialization.elementalist.cryomancer.description'),
      avatar: () => 'elementalist-cryomancer-avatar.jpg',
      baseStats: () => ({
        coldDamagePercent: 20,
        elementalDamagePercent: 10,
      }),
      skills: {
        frostMastery: {
          id: 'frostMastery',
          name: () => t('Frost Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'frost',
          description: () => t('skill.frostMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            coldDamagePercent: scaleDownFlat(level, 5),
            elementalDamagePercent: scaleDownFlat(level, 2),
          }),
        },
        frozenOrb: {
          id: 'frozenOrb',
          name: () => t('Frozen Orb'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'frost',
          description: () => t('skill.frozenOrb'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            coldDamage: scaleUpFlat(level, 20, 10, 0.2),
            coldDamagePercent: scaleDownFlat(level, 15),
          }),
        },
      },
    },
  },
  DRUID: {
    SHAPESHIFTER: {
      id: 'SHAPESHIFTER',
      name: () => t('specialization.druid.shapeshifter.name'),
      description: () => t('specialization.druid.shapeshifter.description'),
      avatar: () => 'druid-shapeshifter-avatar.jpg',
      baseStats: () => ({
        armorPercent: 20,
        lifePercent: 10,
      }),
      skills: {
        feralInstinct: {
          id: 'feralInstinct',
          name: () => t('Feral Instinct'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'claw',
          description: () => t('skill.feralInstinct'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackSpeed: scaleDownFlat(level, 0.05),
            damagePercent: scaleDownFlat(level, 3),
          }),
        },
        bearForm: {
          id: 'bearForm',
          name: () => t('Bear Form'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'claw',
          description: () => t('skill.bearForm'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: scaleDownFlat(level, 40),
            armorPercent: scaleDownFlat(level, 30),
          }),
        },
      },
    },
    NATURALIST: {
      id: 'NATURALIST',
      name: () => t('specialization.druid.naturalist.name'),
      description: () => t('specialization.druid.naturalist.description'),
      avatar: () => 'druid-naturalist-avatar.jpg',
      baseStats: () => ({
        lifeRegenPercent: 20,
        allResistance: 10,
      }),
      skills: {
        naturesBlessing: {
          id: 'naturesBlessing',
          name: () => t('Nature\'s Blessing'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'leaf',
          description: () => t('skill.naturesBlessing'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeRegen: scaleUpFlat(level, 5, 4, 0.2),
            lifeRegenPercent: scaleDownFlat(level, 3),
          }),
        },
        rejuvenation: {
          id: 'rejuvenation',
          name: () => t('Rejuvenation'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'leaf',
          description: () => t('skill.rejuvenation'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeRegenPercent: scaleDownFlat(level, 50),
            allResistance: scaleUpFlat(level, 30, 20, 0.2),
          }),
        },
      },
    },
    SUMMONER: {
      id: 'SUMMONER',
      name: () => t('specialization.druid.summoner.name'),
      description: () => t('specialization.druid.summoner.description'),
      avatar: () => 'druid-summoner-avatar.jpg',
      baseStats: () => ({
        damagePercent: 20,
        manaPercent: 10,
      }),
      skills: {
        summonMastery: {
          id: 'summonMastery',
          name: () => t('Summon Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'summon',
          description: () => t('skill.summonMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: scaleDownFlat(level, 2),
          }),
        },
        summonWolf: {
          id: 'summonWolf',
          name: () => t('Summon Wolf'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'summon',
          description: () => t('skill.summonWolf'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 10, 8, 0.2),
          }),
        },
      },
    },
  },
  MAGE: {
    ARCANIST: {
      id: 'ARCANIST',
      name: () => t('specialization.mage.arcanist.name'),
      description: () => t('specialization.mage.arcanist.description'),
      avatar: () => 'mage-arcanist-avatar.jpg',
      baseStats: () => ({
        elementalDamagePercent: 20,
        manaPercent: 20,
      }),
      skills: {
        arcaneMastery: {
          id: 'arcaneMastery',
          name: () => t('Arcane Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'wand',
          description: () => t('skill.arcaneMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamagePercent: scaleDownFlat(level, 4),
            manaPercent: scaleDownFlat(level, 3),
          }),
        },
        arcaneMissiles: {
          id: 'arcaneMissiles',
          name: () => t('Arcane Missiles'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'wand',
          description: () => t('skill.arcaneMissiles'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamage: scaleUpFlat(level, 18, 9, 0.2),
            elementalDamagePercent: scaleDownFlat(level, 20),
          }),
        },
      },
    },
    BLOODMAGE: {
      id: 'BLOODMAGE',
      name: () => t('specialization.mage.bloodmage.name'),
      description: () => t('specialization.mage.bloodmage.description'),
      avatar: () => 'mage-bloodmage-avatar.jpg',
      baseStats: () => ({
        damagePercent: 15,
        elementalDamagePercent: 15,
      }),
      skills: {
        spellsword: {
          id: 'spellsword',
          name: () => t('Spellsword'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'sword',
          description: () => t('skill.spellsword'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 5, 4, 0.2),
            elementalDamagePercent: scaleDownFlat(level, 2),
          }),
        },
        elementalBlade: {
          id: 'elementalBlade',
          name: () => t('Elemental Blade'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'sword',
          description: () => t('skill.elementalBlade'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damage: scaleUpFlat(level, 12, 6, 0.2),
            elementalDamage: scaleUpFlat(level, 12, 6, 0.2),
          }),
        },
      },
    },
    ENCHANTER: {
      id: 'ENCHANTER',
      name: () => t('specialization.mage.enchanter.name'),
      description: () => t('specialization.mage.enchanter.description'),
      avatar: () => 'mage-enchanter-avatar.jpg',
      baseStats: () => ({
        elementalDamagePercent: 10,
        attackSpeed: 0.1,
      }),
      skills: {
        enchantWeapon: {
          id: 'enchantWeapon',
          name: () => t('Enchant Weapon'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'enchant',
          description: () => t('skill.enchantWeapon'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamage: scaleUpFlat(level, 5, 4, 0.2),
            elementalDamagePercent: scaleDownFlat(level, 2),
          }),
        },
        powerSurge: {
          id: 'powerSurge',
          name: () => t('Power Surge'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'enchant',
          description: () => t('skill.powerSurge'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalDamagePercent: scaleDownFlat(level, 40),
            manaRegenPercent: scaleDownFlat(level, 30),
          }),
        },
      },
    },
  },
};

// Helper to get all specializations for a class
export function getClassSpecializations(className) {
  return SPECIALIZATIONS[className] || {};
}

// Helper to get a specific specialization
export function getSpecialization(className, specializationId) {
  return SPECIALIZATIONS[className]?.[specializationId] || null;
}