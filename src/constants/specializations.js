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
        retaliateWhenHit: 1,
      }),
      skills: {
        armoredOffense: {
          id: 'armoredOffense',
          name: () => t('Armored Offense'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'armored-offense',
          description: () => t('skill.armoredOffense'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageFromArmorPercent: 0.5 + scaleDownFlat(level, 0.01),
            extraDamageFromLifePercent: 0.5 + scaleDownFlat(level, 0.01),
          }),
        },
        reinforcedEquipment: {
          id: 'reinforcedEquipment',
          name: () => t('Reinforced Equipment'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'reinforced-equipment',
          description: () => t('skill.reinforcedEquipment'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            itemLifeEffectivenessPercent: 50 + scaleUpFlat(level, 8, 8, 0.2),
            itemArmorEffectivenessPercent: 50 + scaleUpFlat(level, 8, 8, 0.2),
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
        canDualWieldTwoHanded: 1,
      }),
      skills: {
        animatedWeapons: {
          id: 'animatedWeapons',
          name: () => t('Animated Weapons'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'animated-weapons',
          description: () => t('skill.animatedWeapons'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            animatedWeaponsUnlocked: 1,
            animatedWeaponsDamagePercent: scaleUpFlat(level, 5, 10, 0.5),
          }),
        },
        weaponMastery: {
          id: 'weaponMastery',
          name: () => t('Weapon Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'weapon-mastery',
          description: () => t('skill.weaponMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            weaponEffectiveness: scaleUpFlat(level, 10, 5, 0.2),
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
        allowBossLoot: 1,
      }),
      skills: {
        arenaDominance: {
          id: 'arenaDominance',
          name: () => t('Arena Dominance'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'arena-dominance',
          description: () => t('skill.arenaDominance'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            arenaDamagePercent: 20 + scaleUpFlat(level, 8, 10, 0.1),
          }),
        },
        arenaResilience: {
          id: 'arenaResilience',
          name: () => t('Arena Resilience'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'arena-resilience',
          description: () => t('skill.arenaResilience'),
          maxLevel: () => 400,
          effect: (level) => ({
            arenaDamageReductionPercent: 5 + scaleDownFlat(level, 0.466, 3),
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
        critDamage: 0.5,
      }),
      skills: {
        vanish: {
          id: 'vanish',
          name: () => t('Vanish'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'vanish',
          description: () => t('skill.vanish'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            stealthChance: scaleDownFlat(level, 0.5),
          }),
        },
        assassinate: {
          id: 'assassinate',
          name: () => t('Assassinate'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'assassinate',
          description: () => t('skill.assassinate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            executeThresholdPercent: scaleDownFlat(level, 0.5),
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
        cloneUnlocked: 1,
      }),
      skills: {
        cloneMastery: {
          id: 'cloneMastery',
          name: () => t('Clone Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'clone-mastery',
          description: () => t('skill.cloneMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            cloneEffectivenessPercent: scaleUpFlat(level, 10, 5, 0.2),
          }),
        },
        shadowMagic: {
          id: 'shadowMagic',
          name: () => t('Shadow Magic'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'shadow-magic',
          description: () => t('skill.shadowMagic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            earthDamage: scaleUpFlat(level, 15, 8, 0.2),
            earthDamagePercent: scaleDownFlat(level, 2),
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
        damagePercent: 20,
      }),
      skills: {
        animalTracking: {
          id: 'animalTracking',
          name: () => t('Animal Tracking'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'animal-tracking',
          description: () => t('skill.animalTracking'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToRareEnemiesPercent: scaleDownFlat(level, 2),
          }),
        },
        rangedPrecision: {
          id: 'rangedPrecision',
          name: () => t('Ranged Precision'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'ranged-precision',
          description: () => t('skill.rangedPrecision'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackRating: scaleUpFlat(level, 20, 10, 0.2),
            extraDamageFromAttackRatingPercent: scaleDownFlat(level, 0.05),
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
        healDamagesEnemiesPercent: 100,
      }),
      skills: {
        vampiricBats: {
          id: 'vampiricBats',
          name: () => t('Vampiric Bats'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'vampiric-bats',
          description: () => t('skill.vampiricBats'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            batsHealPercent: scaleDownFlat(level, 1),
          }),
        },
        stoneSkin: {
          id: 'stoneSkin',
          name: () => t('Stone Skin'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'stone-skin',
          description: () => t('skill.stoneSkin'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            reduceEnemyDamagePercent: scaleDownFlat(level, 1),
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
        nightStalkerBuffEffectivenessPercent: 10,
      }),
      skills: {
        lifeShadows: {
          id: 'lifeShadows',
          name: () => t('Life Shadows'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'life-shadows',
          description: () => t('skill.lifeShadows'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraEvasionFromLifePercent: scaleDownFlat(level, 0.05),
          }),
        },
        shadowStealth: {
          id: 'shadowStealth',
          name: () => t('Shadow Stealth'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'shadow-stealth',
          description: () => t('skill.shadowStealth'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasionPercent: scaleDownFlat(level, 2),
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
        damagePercent: 20,
      }),
      skills: {
        bloodPotency: {
          id: 'bloodPotency',
          name: () => t('Blood Potency'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'blood-potency',
          description: () => t('skill.bloodPotency'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: scaleDownFlat(level, 0.5),
            lifePerHit: scaleUpFlat(level, 5, 5, 0.2),
          }),
        },
        hemorrhage: {
          id: 'hemorrhage',
          name: () => t('Hemorrhage'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'hemorrhage',
          description: () => t('skill.hemorrhage'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: scaleDownFlat(level, 1),
            bleedDamagePercent: scaleDownFlat(level, 2),
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
        thornsDamage: 20,
        thornsDamagePercent: 10,
      }),
      skills: {
        shieldMastery: {
          id: 'shieldMastery',
          name: () => t('Shield Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'shield-mastery',
          description: () => t('skill.shieldMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            canUseTwoShields: 1,
            extraDamageFromArmorPercent: scaleDownFlat(level, 0.05),
          }),
        },
        zeal: {
          id: 'zeal',
          name: () => t('Zeal'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'zeal',
          description: () => t('skill.zeal'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            zealDamageReductionPerStack: scaleDownFlat(level, 0.1),
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
        armorPercent: 20,
        allResistancePercent: 10,
      }),
      skills: {
        divineAmulet: {
          id: 'divineAmulet',
          name: () => t('Divine Amulet'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'divine-amulet',
          description: () => t('skill.divineAmulet'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            amuletEffectivenessPercent: scaleUpFlat(level, 5, 5, 0.2),
          }),
        },
        sacredRelic: {
          id: 'sacredRelic',
          name: () => t('Sacred Relic'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'sacred-relic',
          description: () => t('skill.sacredRelic'),
          maxLevel: () => 1,
          effect: () => ({
            canUseTwoAmulets: 1,
          }),
        },
      },
    },
    SENTINEL: {
      id: 'SENTINEL',
      name: () => t('specialization.paladin.sentinel.name'),
      description: () => t('specialization.paladin.sentinel.description'),
      avatar: () => 'paladin-sentinel-avatar.jpg',
      baseStats: () => ({
        reduceEnemyDamagePercent: 10,
      }),
      skills: {
        ringMastery: {
          id: 'ringMastery',
          name: () => t('Ring Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'ring-mastery',
          description: () => t('skill.ringMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            ringEffectivenessPercent: scaleUpFlat(level, 5, 5, 0.2),
          }),
        },
        guardianSignet: {
          id: 'guardianSignet',
          name: () => t('Guardian Signet'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'guardian-signet',
          description: () => t('skill.guardianSignet'),
          maxLevel: () => 1,
          effect: () => ({
            canUseExtraRing: 1,
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
        aoeDevastationChance: 10,
      }),
      skills: {
        lacerate: {
          id: 'lacerate',
          name: () => t('Lacerate'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'lacerate',
          description: () => t('skill.lacerate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            dotStrikeChance: scaleDownFlat(level, 2),
          }),
        },
        sunderArmor: {
          id: 'sunderArmor',
          name: () => t('Sunder Armor'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'sunder-armor',
          description: () => t('skill.sunderArmor'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorShredChance: scaleDownFlat(level, 2),
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
        warcryBuffEffectivenessPercent: 20,
      }),
      skills: {
        frenzy: {
          id: 'frenzy',
          name: () => t('Frenzy'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'frenzy',
          description: () => t('skill.frenzy'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackSpeed: scaleDownFlat(level, 0.05),
          }),
        },
        unboundRage: {
          id: 'unboundRage',
          name: () => t('Unbound Rage'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'unbound-rage',
          description: () => t('skill.unboundRage'),
          maxLevel: () => 1,
          effect: () => ({
            uncappedAttackSpeed: 1,
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
        lifeSteal: 5,
      }),
      skills: {
        bloodBank: {
          id: 'bloodBank',
          name: () => t('Blood Bank'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'blood-bank',
          description: () => t('skill.bloodBank'),
          maxLevel: () => 1,
          effect: () => ({
            overhealToLife: 1,
          }),
        },
        giantSlayer: {
          id: 'giantSlayer',
          name: () => t('Giant Slayer'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'giant-slayer',
          description: () => t('skill.giantSlayer'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToElitesPercent: scaleDownFlat(level, 5),
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
        overkillDamageEnabled: 1,
      }),
      skills: {
        searingHeat: {
          id: 'searingHeat',
          name: () => t('Searing Heat'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'searing-heat',
          description: () => t('skill.searingHeat'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            burnStackingChance: scaleDownFlat(level, 2),
          }),
        },
        combustion: {
          id: 'combustion',
          name: () => t('Combustion'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'combustion',
          description: () => t('skill.combustion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            explosionChance: scaleDownFlat(level, 1),
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
      }),
      skills: {
        arcDischarge: {
          id: 'arcDischarge',
          name: () => t('Arc Discharge'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'arc-discharge',
          description: () => t('skill.arcDischarge'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            chainLightningChance: scaleDownFlat(level, 2),
          }),
        },
        staticShock: {
          id: 'staticShock',
          name: () => t('Static Shock'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'static-shock',
          description: () => t('skill.staticShock'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            shockChance: scaleDownFlat(level, 1),
            shockDamagePercent: scaleDownFlat(level, 2),
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
      }),
      skills: {
        permafrost: {
          id: 'permafrost',
          name: () => t('Permafrost'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'permafrost',
          description: () => t('skill.permafrost'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            freezeChance: scaleDownFlat(level, 0.5),
            slowChance: scaleDownFlat(level, 2),
          }),
        },
        iceBarrier: {
          id: 'iceBarrier',
          name: () => t('Ice Barrier'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'ice-barrier',
          description: () => t('skill.iceBarrier'),
          maxLevel: () => 1,
          effect: () => ({
            frostShield: 1,
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
        shapeshiftUnlocked: 1,
      }),
      skills: {
        packLeader: {
          id: 'packLeader',
          name: () => t('Pack Leader'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'pack-leader',
          description: () => t('skill.packLeader'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            summonDamageBuffPercent: scaleDownFlat(level, 5),
          }),
        },
        primalVigor: {
          id: 'primalVigor',
          name: () => t('Primal Vigor'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'primal-vigor',
          description: () => t('skill.primalVigor'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageFromLifePercent: scaleDownFlat(level, 0.02),
            extraDamageFromLifeRegenPercent: scaleDownFlat(level, 0.05),
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
        elementalDamagePercent: 30,
      }),
      skills: {
        entanglingVines: {
          id: 'entanglingVines',
          name: () => t('Entangling Vines'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'entangling-vines',
          description: () => t('skill.entanglingVines'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            entangleChance: scaleDownFlat(level, 1),
          }),
        },
        natureGrasp: {
          id: 'natureGrasp',
          name: () => t('Nature\'s Grasp'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'nature-grasp',
          description: () => t('skill.natureGrasp'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            terrainControlPercent: scaleDownFlat(level, 2),
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
        summonDamageBuffPercent: 20,
      }),
      skills: {
        beastFrenzy: {
          id: 'beastFrenzy',
          name: () => t('Beast Frenzy'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'beast-frenzy',
          description: () => t('skill.beastFrenzy'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            summonAttackSpeedBuffPercent: scaleDownFlat(level, 2),
          }),
        },
        wildCommunion: {
          id: 'wildCommunion',
          name: () => t('Wild Communion'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'wild-communion',
          description: () => t('skill.wildCommunion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            summonDamageBuffPercent: scaleDownFlat(level, 3),
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
        extraDamageFromManaPercent: 1,
      }),
      skills: {
        blink: {
          id: 'blink',
          name: () => t('Blink'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'blink',
          description: () => t('skill.blink'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            teleportDodgeChance: scaleDownFlat(level, 0.5),
          }),
        },
        arcaneDissolution: {
          id: 'arcaneDissolution',
          name: () => t('Arcane Dissolution'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'arcane-dissolution',
          description: () => t('skill.arcaneDissolution'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            reduceEnemyResistancesPercent: scaleDownFlat(level, 2),
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
        manaToLifeTransferPercent: 100,
      }),
      skills: {
        sanguinePower: {
          id: 'sanguinePower',
          name: () => t('Sanguine Power'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'sanguine-power',
          description: () => t('skill.sanguinePower'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageFromLifePercent: scaleDownFlat(level, 0.05),
          }),
        },
        vitalityOverflow: {
          id: 'vitalityOverflow',
          name: () => t('Vitality Overflow'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'vitality-overflow',
          description: () => t('skill.vitalityOverflow'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: scaleDownFlat(level, 2),
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
        weaponBuffEffectivenessPercent: 20,
      }),
      skills: {
        dancingBlades: {
          id: 'dancingBlades',
          name: () => t('Dancing Blades'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[0],
          icon: () => 'dancing-blades',
          description: () => t('skill.dancingBlades'),
          maxLevel: () => 1,
          effect: () => ({
            weaponIllusionUnlocked: 1,
          }),
        },
        enchantedArmor: {
          id: 'enchantedArmor',
          name: () => t('Enchanted Armor'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[1],
          icon: () => 'enchanted-armor',
          description: () => t('skill.enchantedArmor'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorEnchantmentEffectivenessPercent: scaleDownFlat(level, 2),
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
