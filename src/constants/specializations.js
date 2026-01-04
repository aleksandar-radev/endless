import { t } from '../i18n.js';
import { getScalingPercent, getScalingFlat } from '../common.js';
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
      baseStats: () => ({ retaliateWhenHit: 1 }),
      skills: {
        armoredOffense: {
          id: 'armoredOffense',
          name: () => t('Armored Offense'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'armored-offense',
          description: () => t('skill.armoredOffense'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorPercentPerLevel: getScalingPercent({
              level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.81,
            }),
            extraDamageFromArmorPercent: Math.min(getScalingPercent({
              level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.7,
            }), 2.5),
            lifePercentPerLevel: getScalingPercent({
              level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.81,
            }),
            extraDamageFromLifePercent: Math.min(getScalingPercent({
              level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.7,
            }), 2.5),
          }),
        },
        reinforcedEquipment: {
          id: 'reinforcedEquipment',
          name: () => t('Reinforced Equipment'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'reinforced-equipment',
          description: () => t('skill.reinforcedEquipment'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            itemLifeEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
            itemArmorEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
          }),
        },
      },
    },
    WEAPONMASTER: {
      id: 'WEAPONMASTER',
      name: () => t('specialization.warrior.weaponmaster.name'),
      description: () => t('specialization.warrior.weaponmaster.description'),
      avatar: () => 'warrior-weaponmaster-avatar.jpg',
      baseStats: () => ({ canDualWieldTwoHanded: 1 }),
      skills: {
        spiritualWeapons: {
          id: 'spiritualWeapons',
          name: () => t('Spiritual Weapons'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'spiritual-weapons',
          description: () => t('skill.spiritualWeapons'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            animatedWeaponsUnlocked: 1,
            animatedWeaponsDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
          }),
        },
        weaponMastery: {
          id: 'weaponMastery',
          name: () => t('Weapon Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'weapon-mastery',
          description: () => t('skill.weaponMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            weaponEffectiveness: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
          }),
        },
      },
    },
    GLADIATOR: {
      id: 'GLADIATOR',
      name: () => t('specialization.warrior.gladiator.name'),
      description: () => t('specialization.warrior.gladiator.description'),
      avatar: () => 'warrior-gladiator-avatar.jpg',
      baseStats: () => ({ allowBossLoot: 1 }),
      skills: {
        arenaDominance: {
          id: 'arenaDominance',
          name: () => t('Arena Dominance'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'arena-dominance',
          description: () => t('skill.arenaDominance'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            arenaDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
          }),
        },
        arenaResilience: {
          id: 'arenaResilience',
          name: () => t('Arena Resilience'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'arena-resilience',
          description: () => t('skill.arenaResilience'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorPercentPerLevel: getScalingPercent({
              level, base: 0.2, softcap: 2000, linear: 0.05, power: 0.81,
            }),
            arenaDamageReductionPercent: Math.min(getScalingPercent({
              level, base: 5, softcap: 500, linear: 0.15, power: 0.6,
            }), 75),
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
      baseStats: () => ({ critDamage: 2 }),
      skills: {
        vanish: {
          id: 'vanish',
          name: () => t('Vanish'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'vanish',
          description: () => t('skill.vanish'),
          maxLevel: () => 400,
          effect: (level) => ({ avoidChance: 5 + getScalingPercent(level, 0.466, 3) }),
        },
        assassinate: {
          id: 'assassinate',
          name: () => t('Assassinate'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'assassinate',
          description: () => t('skill.assassinate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            critDamage: level * 0.025,
            executeThresholdPercent: Math.min(5 + getScalingPercent(level, 0.34, 3), 50),
          }),
        },
      },
    },
    SHADOWDANCER: {
      id: 'SHADOWDANCER',
      name: () => t('specialization.rogue.shadowdancer.name'),
      description: () => t('specialization.rogue.shadowdancer.description'),
      avatar: () => 'rogue-shadowdancer-avatar.jpg',
      baseStats: () => ({ attackSpeed: 0.5 }),
      skills: {
        shadowClone: {
          id: 'shadowClone',
          name: () => t('Shadow Clone'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'shadow-clone',
          description: () => t('skill.shadowClone'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            cloneUnlocked: 1,
            cloneDamagePercent: getScalingFlat(level, 5, 10, 0.5),
          }),
        },
        shadowMagic: {
          id: 'shadowMagic',
          name: () => t('Shadow Magic'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'shadow-magic',
          description: () => t('skill.shadowMagic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            earthDamage: level ? 20000 - 50 + getScalingFlat(level, 50, 3, 1) : 0,
            earthDamagePercent: level ? 100 - 6 + getScalingPercent(level, 6, 4) : 0,
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
        damagePercent: 200,
        elementalDamagePercent: 200,
      }),
      skills: {
        animalTracking: {
          id: 'animalTracking',
          name: () => t('Animal Tracking'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'animal-tracking',
          description: () => t('skill.animalTracking'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToHighRarityEnemiesPercent: getScalingPercent(level, 10),
            enemyRarityPercent: getScalingFlat(level, 20, 20, 0.5),
          }),
        },
        rangedPrecision: {
          id: 'rangedPrecision',
          name: () => t('Ranged Precision'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'ranged-precision',
          description: () => t('skill.rangedPrecision'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackRating: 20000 + getScalingFlat(level, 80, 10, 1),
            extraDamageFromAttackRatingPercent: 0.5 + getScalingPercent(level, 0.018),
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
      baseStats: () => ({ healDamagesEnemiesPercent: 200 }),
      skills: {
        vampiricBats: {
          id: 'vampiricBats',
          name: () => t('Vampiric Bats'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'vampiric-bats',
          description: () => t('skill.vampiricBats'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({ batsHealPercent: level ? 50 + getScalingPercent(level, 10, 5, 0.2) : 0 }),
        },
        crimsonFeast: {
          id: 'crimsonFeast',
          name: () => t('Crimson Feast'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'crimson-feast',
          description: () => t('skill.crimsonFeast'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: getScalingPercent(level, 0.2),
            lifePerHit: level ? 1000 + getScalingFlat(level, 50, 10, 1) : 0,
          }),
        },
      },
    },
    NIGHTSTALKER: {
      id: 'NIGHTSTALKER',
      name: () => t('specialization.vampire.nightstalker.name'),
      description: () => t('specialization.vampire.nightstalker.description'),
      avatar: () => 'vampire-nightstalker-avatar.jpg',
      baseStats: () => ({ overhealPercent: 100 }),
      skills: {
        nightStalkerMastery: {
          id: 'nightStalkerMastery',
          name: () => t('Night Stalker Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'night-stalker-mastery',
          description: () => t('skill.nightStalkerMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({ nightStalkerBuffEffectivenessPercent: level ? 50 + getScalingFlat(level, 8) : 0 }),
        },
        bloodRitual: {
          id: 'bloodRitual',
          name: () => t('Blood Ritual'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'blood-ritual',
          description: () => t('skill.bloodRitual'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bloodSacrificeUnlocked: 1,
            bloodSacrificeEffectiveness: getScalingFlat(level, 5, 1, 0),
          }),
        },
      },
    },
    HEMOMANCER: {
      id: 'HEMOMANCER',
      name: () => t('specialization.vampire.hemomancer.name'),
      description: () => t('specialization.vampire.hemomancer.description'),
      avatar: () => 'vampire-hemomancer-avatar.jpg',
      baseStats: () => ({ bleedChance: 20 }),
      skills: {
        bloodPotency: {
          id: 'bloodPotency',
          name: () => t('Blood Potency'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'blood-potency',
          description: () => t('skill.bloodPotency'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getScalingPercent(level, 6),
            attackSpeedPercent: getScalingPercent(level, 2),
            chanceToHitPercent: Math.min(getScalingPercent(level, 0.2), 40),
          }),
        },
        hemorrhage: {
          id: 'hemorrhage',
          name: () => t('Hemorrhage'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'hemorrhage',
          description: () => t('skill.hemorrhage'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: Math.min(5 + getScalingPercent(level, 0.6), 80),
            bleedDamagePercent: getScalingPercent(level, 3.4),
          }),
        },
      },
    },
  },
  PALADIN: {
    CRUSADER: {
      // Specialize in thorns damage.
      id: 'CRUSADER',
      name: () => t('specialization.paladin.crusader.name'),
      description: () => t('specialization.paladin.crusader.description'),
      avatar: () => 'paladin-crusader-avatar.jpg',
      baseStats: () => ({ canUseTwoShields: 1, thornsOnMiss: 1 }),
      skills: {
        shieldMastery: {
          id: 'shieldMastery',
          name: () => t('Shield Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'shield-mastery',
          description: () => t('skill.shieldMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            shieldEffectiveness: getScalingFlat(level, 10, 5, 0.2),
            endurancePercent: getScalingFlat(level, 5, 5, 0.2),
          }),
        },
        zeal: {
          id: 'zeal',
          name: () => t('Zeal'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'zeal',
          description: () => t('skill.zeal'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            divineProtectionBuffEffectivenessPercent: level ? 50 + getScalingFlat(level, 10) : 0,
            perseverancePercent: getScalingFlat(level, 5, 5, 0.2),
          }),
        },
      },
    },
    TEMPLAR: {
      id: 'TEMPLAR',
      name: () => t('specialization.paladin.templar.name'),
      description: () => t('specialization.paladin.templar.description'),
      avatar: () => 'paladin-templar-avatar.jpg',
      baseStats: () => ({ cooldownReductionCapPercent: 10 }),
      skills: {
        divineAmulet: {
          id: 'divineAmulet',
          name: () => t('Divine Amulet'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'divine-amulet',
          description: () => t('skill.divineAmulet'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({ jewelryEffectiveness: level ? 50 + getScalingFlat(level, 8, 8, 0.2) : 0 }),
        },
        sacredRelic: {
          id: 'sacredRelic',
          name: () => t('Sacred Relic'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'sacred-relic',
          description: () => t('skill.sacredRelic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackSpeedPercent: getScalingFlat(level, 3, 10, 0.1),
            attackRatingPercent: level ? 50 + getScalingFlat(level, 8, 10, 0.1) : 0,
            elementalDamagePercent: level ? 40 + getScalingFlat(level, 5, 10, 0.1) : 0,
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
        extraDamageFromLifePercent: 0.5,
        extraDamageFromAllResistancesPercent: 0.08,
        extraDamageFromArmorPercent: 0.5,
      }),
      skills: {
        unyieldingSpirit: {
          id: 'unyieldingSpirit',
          name: () => t('Unyielding Spirit'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'unyielding-spirit',
          description: () => t('skill.unyieldingSpirit'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            endurancePercent: getScalingPercent(level, 5),
            perseverancePercent: getScalingPercent(level, 3),
          }),
        },
        immortalPresence: {
          id: 'immortalPresence',
          name: () => t('Immortal Presence'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'immortal-presence',
          description: () => t('skill.immortalPresence'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            life: getScalingFlat(level, 50, 10, 1),
            lifePercent: getScalingPercent(level, 3),
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
      baseStats: () => ({ overkillDamagePercent: 200 }),
      skills: {
        lacerate: {
          id: 'lacerate',
          name: () => t('Lacerate'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'lacerate',
          description: () => t('skill.lacerate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: Math.min(getScalingPercent(level, 2, 10, 200, 0.1), 50),
            bleedDamagePercent: getScalingFlat(level, 5, 10, 0.5),
          }),
        },
        fatalBlow: {
          id: 'fatalBlow',
          name: () => t('Fatal Blow'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'fatal-blow',
          description: () => t('skill.fatalBlow'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getScalingFlat(level, 5, 5, 0.5),
            instaKillPercent: Math.min(getScalingPercent(level, 0.2, 200, 0.025), 5),
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
        uncappedAttackSpeed: 1,
        buffEffectivenessPercent: 20,
      }),
      skills: {
        battleCommand: {
          id: 'battleCommand',
          name: () => t('Battle Command'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'battle-command',
          description: () => t('skill.battleCommand'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({ buffEffectivenessPercent: getScalingFlat(level, 10, 5, 0.5) }),
        },
        warlordsAuthority: {
          id: 'warlordsAuthority',
          name: () => t("Warlord's Authority"),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'warlords-authority',
          description: () => t('skill.warlordsAuthority'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({ warlordEffectivenessPercent: getScalingFlat(level, 10, 5, 0.5) }),
        },
      },
    },
    SLAYER: {
      id: 'SLAYER',
      name: () => t('specialization.berserker.slayer.name'),
      description: () => t('specialization.berserker.slayer.description'),
      avatar: () => 'berserker-slayer-avatar.jpg',
      baseStats: () => ({
        lifeSteal: 2,
        critDamage: 3,
        critChanceCap: 25,
      }),
      skills: {
        bloodBank: {
          id: 'bloodBank',
          name: () => t('Blood Bank'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'blood-bank',
          description: () => t('skill.bloodBank'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            overhealPercent: 20 + getScalingFlat(level, 5, 10, 0.5),
            lifePercent: getScalingPercent(level, 1),
          }),
        },
        giantSlayer: {
          id: 'giantSlayer',
          name: () => t('Giant Slayer'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'giant-slayer',
          description: () => t('skill.giantSlayer'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToHighRarityEnemiesPercent: getScalingFlat(level, 5, 10, 0.2),
            executeThresholdPercent: Math.min(getScalingPercent(level, 0.1), 15),
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
        overkillDamagePercent: 50,
        burnChance: 20,
      }),
      skills: {
        searingHeat: {
          id: 'searingHeat',
          name: () => t('Searing Heat'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'searing-heat',
          description: () => t('skill.searingHeat'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            burnChance: Math.min(getScalingPercent(level, 2), 60),
            burnDamagePercent: getScalingPercent(level, 5),
          }),
        },
        combustion: {
          id: 'combustion',
          name: () => t('Combustion'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'combustion',
          description: () => t('skill.combustion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            explosionChance: getScalingPercent(level, 1),
            extraDamageAgainstBurningEnemies: getScalingFlat(level, 5, 5, 0.5),
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
        lightningEffectivenessPercent: 20,
        shockChance: 20,
      }),
      skills: {
        arcDischarge: {
          id: 'arcDischarge',
          name: () => t('Arc Discharge'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'arc-discharge',
          description: () => t('skill.arcDischarge'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            arcDischargeChance: Math.min(getScalingPercent(level, 2), 10),
            lightningDamage: getScalingFlat(level, 4),
          }),
        },
        staticShock: {
          id: 'staticShock',
          name: () => t('Static Shock'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'static-shock',
          description: () => t('skill.staticShock'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            shockChance: Math.min(getScalingPercent(level, 1), 20),
            shockEffectiveness: getScalingPercent(level, 2),
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
        freezeChance: 5,
        ignoreAllEnemyResistances: 1,
      }),
      skills: {
        permafrost: {
          id: 'permafrost',
          name: () => t('Permafrost'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'permafrost',
          description: () => t('skill.permafrost'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageAgainstFrozenEnemies: getScalingPercent(level, 1.5),
            chanceToShatterEnemy: Math.min(getScalingPercent(level, 1), 15),
          }),
        },
        iceBarrier: {
          id: 'iceBarrier',
          name: () => t('Ice Barrier'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'ice-barrier',
          description: () => t('skill.iceBarrier'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            coldDamagePercent: getScalingPercent(level, 2),
            glacialBulwarkUnlocked: 1,
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
      baseStats: () => ({ shapeshiftUnlocked: 1 }),
      skills: {
        shapeshiftingMastery: {
          id: 'shapeshiftingMastery',
          name: () => t('Shapeshifting Mastery'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'shapeshifting-mastery',
          description: () => t('skill.shapeshiftingMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            allAttributes: getScalingFlat(level, 4),
            allAttributesPercent: getScalingPercent(level, 1),
          }),
        },
        primalAdaptation: {
          id: 'primalAdaptation',
          name: () => t('Primal Adaptation'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'primal-adaptation',
          description: () => t('skill.primalAdaptation'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getScalingPercent(level, 0.5),
            elementalDamagePercent: getScalingPercent(level, 0.5),
            armorPercent: getScalingPercent(level, 0.5),
            lifePercent: getScalingPercent(level, 0.5),
            lifeRegenPercent: getScalingPercent(level, 0.5),
            allResistancePercent: getScalingPercent(level, 0.5),
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
        stunChance: 10,
        naturalistInstantSkillsUnlocked: 1,
      }),
      skills: {
        elementalHarmony: {
          id: 'elementalHarmony',
          name: () => t('Elemental Harmony'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'elemental-harmony',
          description: () => t('skill.elementalHarmony'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            waterDamagePercent: getScalingPercent(level, 2),
            coldDamagePercent: getScalingPercent(level, 2),
            earthDamagePercent: getScalingPercent(level, 2),
          }),
        },
        primalResilience: {
          id: 'primalResilience',
          name: () => t('Primal Resilience'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'primal-resilience',
          description: () => t('skill.primalResilience'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalPenetrationPercent: Math.min((20 * level) / 200, 20),
            damageTakenReductionPercent: Math.min((30 * level) / 200, 30),
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
        summonsCanCrit: 1,
        summonerExtraSummonUnlocked: 1,
      }),
      skills: {
        beastFrenzy: {
          id: 'beastFrenzy',
          name: () => t('Beast Frenzy'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'beast-frenzy',
          description: () => t('skill.beastFrenzy'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            summonAttackSpeedBuffPercent: Math.min(getScalingPercent(level, 1), 3),
            summonDamageBuffPercent: getScalingPercent(level, 2),
          }),
        },
        wildCommunion: {
          id: 'wildCommunion',
          name: () => t('Wild Communion'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'wild-communion',
          description: () => t('skill.wildCommunion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: getScalingPercent(level, 0.5),
            lifeRegenPercent: getScalingPercent(level, 0.5),
            armorPercent: getScalingPercent(level, 0.5),
            allResistancePercent: getScalingPercent(level, 0.5),
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
      baseStats: () => ({ teleportDodgeChance: 20 }),
      skills: {
        manaWard: {
          id: 'manaWard',
          name: () => t('Mana Ward'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'mana-ward',
          description: () => t('skill.manaWard'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            manaShieldDamageTakenReductionPercent: Math.min(getScalingPercent(level, 0.75), 50),
            manaPercent: getScalingPercent(level, 2),
          }),
        },
        arcaneOverload: {
          id: 'arcaneOverload',
          name: () => t('Arcane Overload'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'arcane-overload',
          description: () => t('skill.arcaneOverload'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageFromManaPercent: Math.min(getScalingPercent(level, 0.012), 2),
            manaRegen: getScalingFlat(level, 0.2),
            manaRegenPercent: getScalingPercent(level, 0.8),
          }),
        },
      },
    },
    BLOODMAGE: {
      id: 'BLOODMAGE',
      name: () => t('specialization.mage.bloodmage.name'),
      description: () => t('specialization.mage.bloodmage.description'),
      avatar: () => 'mage-bloodmage-avatar.jpg',
      baseStats: () => ({ convertManaToLifePercent: 100 }),
      skills: {
        crimsonFortitude: {
          id: 'crimsonFortitude',
          name: () => t('Crimson Fortitude'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'crimson-fortitude',
          description: () => t('skill.crimsonFortitude'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: getScalingPercent(level, 2),
            crimsonAegisSkillUnlocked: 1,
          }),
        },
        sanguineLeech: {
          id: 'sanguineLeech',
          name: () => t('Sanguine Leech'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'sanguine-leech',
          description: () => t('skill.sanguineLeech'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: Math.min(getScalingPercent(level, 0.02), 1),
            lifePerHitPercent: getScalingPercent(level, 2),
            bloodSiphonSkillUnlocked: 1,
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
        weaponIllusionUnlocked: 1,
      }),
      skills: {
        dancingBlades: {
          id: 'dancingBlades',
          name: () => t('Dancing Blades'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'dancing-blades',
          description: () => t('skill.dancingBlades'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            allResistancePercent: getScalingFlat(level, 5, 5, 0.2),
            extraDamageFromAllResistancesPercent: 0.5 + getScalingPercent(level, 0.01),
            elementalDamageTakenReductionPercent: Math.min(getScalingPercent(level, 0.5), 25),
          }),
        },
        enchantedArmor: {
          id: 'enchantedArmor',
          name: () => t('Enchanted Armor'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'enchanted-armor',
          description: () => t('skill.enchantedArmor'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            weaponEffectiveness: getScalingFlat(level, 10, 5, 0.2),
            jewelryEffectiveness: getScalingFlat(level, 10, 5, 0.2),
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
