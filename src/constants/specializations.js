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
            armorPercent: getScalingPercent({
              level, base: 20, softcap: 20000, linear: 0.5, power: 0.81,
            }),
            extraDamageFromArmorPercent: Math.min(getScalingPercent({
              level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.7,
            }), 2.5),
            lifePercent: getScalingPercent({
              level, base: 20, softcap: 20000, linear: 0.5, power: 0.81,
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
            weaponFlatEffectivenessPercent: getScalingPercent({
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
              level, base: 0.5, softcap: 2000, linear: 0.08, power: 0.81,
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
          name: () => t('skill.vanish.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'vanish',
          description: () => t('skill.vanish'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasionPercent: getScalingPercent({
              level, base: 30, softcap: 20000, linear: 0.8, power: 0.81,
            }),
            avoidChance: 5 + getScalingPercent({
              level, base: 0.466, softcap: 2000, linear: 0.1, power: 0.6,
            }),
          }),
        },
        assassinate: {
          id: 'assassinate',
          name: () => t('skill.assassinate.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'assassinate',
          description: () => t('skill.assassinate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            critDamage: getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.001, power: 0.75,
            }),
            executeThresholdPercent: Math.min(5 + getScalingPercent({
              level, base: 0.34, softcap: 2000, linear: 0.1, power: 0.6,
            }), 50),
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
            cloneDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            earthDamage: level ? 20000 - 50 + getScalingFlat({
              level, base: 50, interval: 3, bonus: 1, increment: 0,
            }) : 0,
            earthDamagePercent: level ? 100 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
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
            damageToHighRarityEnemiesPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            enemyRarityPercent: getScalingFlat({
              level, base: 20, interval: 20, bonus: 0.5, increment: 0,
            }),
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
            attackRating: 20000 + getScalingFlat({
              level, base: 80, interval: 10, bonus: 1, increment: 0,
            }),
            extraDamageFromAttackRatingPercent: 0.5 + getScalingPercent({
              level, base: 0.05, softcap: 2000, linear: 0.01, power: 0.7,
            }),
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
          effect: (level) => ({
            batsHealPercent: level ? 50 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
          }),
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
            lifeSteal: getScalingPercent({
              level, base: 0.2, softcap: 100, linear: 0.01, power: 0.5,
            }),
            lifePerHit: level ? 1000 + getScalingFlat({
              level, base: 50, interval: 10, bonus: 1, increment: 0,
            }) : 0,
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
          effect: (level) => ({
            nightStalkerBuffEffectivenessPercent: level ? 50 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
          }),
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
            bloodSacrificeEffectivenessPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            damagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            attackSpeedPercent: getScalingPercent({
              level, base: 4, softcap: 2000, linear: 1, power: 0.685,
            }),
            chanceToHitPercent: Math.min(getScalingPercent({
              level, base: 0.2, power: 0.6,
            }), 40),
          }),
        },
        hemorrhage: {
          id: 'hemorrhage',
          name: () => t('skill.hemorrhage.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'hemorrhage',
          description: () => t('skill.hemorrhage'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: Math.min(5 + getScalingPercent({ level, base: 0.6 }), 80),
            bleedDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            shieldEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
            endurancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
          }),
        },
        zeal: {
          id: 'zeal',
          name: () => t('skill.zeal.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'zeal',
          description: () => t('skill.zeal'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            divineProtectionBuffEffectivenessPercent: level ? 50 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
            perseverancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
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
          effect: (level) => ({
            jewelryFlatEffectivenessPercent: level ? 50 + getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }) : 0,
          }),
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
            attackSpeedPercent: getScalingPercent({
              level, base: 4, softcap: 2000, linear: 1, power: 0.685,
            }),
            attackRatingPercent: level ? 50 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
            elementalDamagePercent: level ? 40 + getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }) : 0,
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
            endurancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
            perseverancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
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
            life: getScalingFlat({
              level, base: 50, interval: 10, bonus: 1, increment: 0,
            }),
            lifePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.8,
            }),
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
          name: () => t('skill.lacerate.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'lacerate',
          description: () => t('skill.lacerate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: Math.min(getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }), 50),
            bleedDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            damagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            instaKillPercent: Math.min(getScalingPercent({
              level, base: 0.2, softcap: 100, linear: 0.1, power: 0.5,
            }), 5),
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
          effect: (level) => ({
            buffEffectivenessPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
          }),
        },
        warlordsAuthority: {
          id: 'warlordsAuthority',
          name: () => t("Warlord's Authority"),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'warlords-authority',
          description: () => t('skill.warlordsAuthority'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            warlordEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
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
            overhealPercent: 20 + getScalingPercent({
              level, base: 5, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            lifePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.8,
            }),
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
            damageToHighRarityEnemiesPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            executeThresholdPercent: Math.min(getScalingPercent({
              level, base: 0.1, softcap: 100, power: 0.5,
            }), 15),
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
            burnChance: Math.min(getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }), 60),
            burnDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
          }),
        },
        combustion: {
          id: 'combustion',
          name: () => t('skill.combustion.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[6],
          icon: () => 'combustion',
          description: () => t('skill.combustion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            explosionChance: getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
            }),
            extraDamageAgainstBurningEnemies: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            arcDischargeChance: Math.min(getScalingPercent({ level, base: 2 }), 10),
            lightningDamage: getScalingFlat({
              level, base: 4, increment: 0,
            }),
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
            shockChance: Math.min(getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
            }), 20),
            shockEffectivenessPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
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
          name: () => t('skill.permafrost.name'),
          type: () => 'passive',
          requiredLevel: () => SKILL_LEVEL_TIERS[4],
          icon: () => 'permafrost',
          description: () => t('skill.permafrost'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageAgainstFrozenEnemies: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            chanceToShatterEnemy: Math.min(getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
            }), 15),
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
            coldDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            allAttributes: getScalingFlat({
              level, base: 4, increment: 0,
            }),
            allAttributesPercent: getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.2, power: 0.7,
            }),
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
            damagePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            elementalDamagePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            armorPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            lifePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            lifeRegenPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
            allResistancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }),
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
            waterDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            coldDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
            earthDamagePercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            elementalPenetrationPercent: Math.min(getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.2, power: 0.6,
            }), 20),
            damageTakenReductionPercent: Math.min(getScalingPercent({
              level, base: 3, softcap: 2000, linear: 0.3, power: 0.6,
            }), 30),
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
            summonAttackSpeedBuffPercent: Math.min(getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.6,
            }), 30),
            summonDamageBuffPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            lifePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
            lifeRegenPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
            armorPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
            allResistancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
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
            manaShieldDamageTakenReductionPercent: Math.min(getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.2, power: 0.6,
            }), 50),
            manaPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.8,
            }),
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
            extraDamageFromManaPercent: Math.min(getScalingPercent({
              level, base: 0.05, softcap: 2000, linear: 0.01, power: 0.7,
            }), 2.5),
            manaRegen: getScalingFlat({
              level, base: 0.2, increment: 0,
            }),
            manaRegenPercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
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
            lifePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.8,
            }),
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
            lifeSteal: Math.min(getScalingPercent({
              level, base: 0.2, softcap: 100, linear: 0.01, power: 0.5,
            }), 1),
            lifePerHitPercent: getScalingPercent({
              level, base: 10, softcap: 2000, linear: 1, power: 0.685,
            }),
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
            allResistancePercent: getScalingPercent({
              level, base: 2, softcap: 2000, linear: 0.5, power: 0.7,
            }),
            extraDamageFromAllResistancesPercent: 0.5 + getScalingPercent({
              level, base: 0.1, softcap: 2000, linear: 0.01, power: 0.7,
            }),
            elementalDamageTakenReductionPercent: Math.min(getScalingPercent({
              level, base: 1, softcap: 2000, linear: 0.1, power: 0.6,
            }), 25),
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
            weaponFlatEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
            jewelryFlatEffectivenessPercent: getScalingPercent({
              level, base: 15, softcap: 2000, linear: 2, power: 0.725,
            }),
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
