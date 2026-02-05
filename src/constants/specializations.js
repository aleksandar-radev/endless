import { t } from '../i18n.js';
import { getSkillStatBonus } from '../common.js';
import { DEFAULT_MAX_SKILL_LEVEL, SPECIALIZATION_SKILL_LEVEL_TIERS } from '../skillTree.js';

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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'armored-offense',
          description: () => t('skill.armoredOffense'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorPercent: getSkillStatBonus({
              level, statKey: 'armorPercent', skillType: 'passive', scale: { base: 4 },
            }),
            extraDamageFromArmorPercent: getSkillStatBonus({
              level,
              statKey: 'extraDamageFromArmorPercent',
              skillType: 'passive',
              scale: {
                base: 2, linear: 13.33, power: 1.17, max: 1,
              },
            }),
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 4 },
            }),
            extraDamageFromLifePercent: getSkillStatBonus({
              level,
              statKey: 'extraDamageFromLifePercent',
              skillType: 'passive',
              scale: {
                base: 2, linear: 13.33, power: 1.17, max: 1,
              },
            }),
          }),
        },
        reinforcedEquipment: {
          id: 'reinforcedEquipment',
          name: () => t('Reinforced Equipment'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'reinforced-equipment',
          description: () => t('skill.reinforcedEquipment'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            itemLifeEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'itemLifeEffectivenessPercent', skillType: 'passive',
            }),
            itemArmorEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'itemArmorEffectivenessPercent', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'spiritual-weapons',
          description: () => t('skill.spiritualWeapons'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            animatedWeaponsUnlocked: 1,
            animatedWeaponsDamagePercent: getSkillStatBonus({
              level, statKey: 'animatedWeaponsDamagePercent', skillType: 'passive',
            }),
          }),
        },
        weaponMastery: {
          id: 'weaponMastery',
          name: () => t('Weapon Mastery'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'weapon-mastery',
          description: () => t('skill.weaponMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            weaponFlatEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'weaponFlatEffectivenessPercent', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'arena-dominance',
          description: () => t('skill.arenaDominance'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            arenaDamagePercent: getSkillStatBonus({
              level, statKey: 'arenaDamagePercent', skillType: 'passive',
            }),
          }),
        },
        arenaResilience: {
          id: 'arenaResilience',
          name: () => t('Arena Resilience'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'arena-resilience',
          description: () => t('skill.arenaResilience'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            armorPercent: getSkillStatBonus({
              level,
              statKey: 'armorPercent',
              skillType: 'passive',
              scale: {
                base: 10, linear: 3, max: 5,
              },
            }),
            arenaDamageReductionPercent: getSkillStatBonus({
              level, statKey: 'arenaDamageReductionPercent', skillType: 'passive',
            }),
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
      baseStats: () => ({ critDamagePercent: 80 }),
      skills: {
        vanish: {
          id: 'vanish',
          name: () => t('skill.vanish.name'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'vanish',
          description: () => t('skill.vanish'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            evasionPercent: getSkillStatBonus({
              level, statKey: 'evasionPercent', skillType: 'passive',
            }),
            avoidChance: 5 + getSkillStatBonus({
              level, statKey: 'avoidChance', skillType: 'passive',
            }),
          }),
        },
        assassinate: {
          id: 'assassinate',
          name: () => t('skill.assassinate.name'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'assassinate',
          description: () => t('skill.assassinate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            DamagePercent: getSkillStatBonus({
              level,
              statKey: 'DamagePercent',
              skillType: 'passive',
              scale: {
                base: 5, linear: 4, max: 2,
              },
            }),
            critDamagePercent: getSkillStatBonus({
              level,
              statKey: 'critDamagePercent',
              skillType: 'passive',
              scale: {
                base: 5, linear: 4, max: 2,
              },
            }),
            executeThresholdPercent: getSkillStatBonus({
              level, statKey: 'executeThresholdPercent', skillType: 'passive',
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'shadow-clone',
          description: () => t('skill.shadowClone'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            cloneUnlocked: 1,
            cloneDamagePercent: getSkillStatBonus({
              level, statKey: 'cloneDamagePercent', skillType: 'passive',
            }),
          }),
        },
        shadowMagic: {
          id: 'shadowMagic',
          name: () => t('Shadow Magic'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'shadow-magic',
          description: () => t('skill.shadowMagic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            earthDamage: getSkillStatBonus({
              level, statKey: 'earthDamage', skillType: 'passive', scale: { base: 50, increment: 33 },
            }),
            earthDamagePercent: getSkillStatBonus({
              level, statKey: 'earthDamagePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'animal-tracking',
          description: () => t('skill.animalTracking'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToHighRarityEnemiesPercent: getSkillStatBonus({
              level, statKey: 'damageToHighRarityEnemiesPercent', skillType: 'passive',
            }),
            enemyRarityPercent: getSkillStatBonus({
              level, statKey: 'enemyRarityPercent', skillType: 'passive',
            }),
          }),
        },
        rangedPrecision: {
          id: 'rangedPrecision',
          name: () => t('Ranged Precision'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'ranged-precision',
          description: () => t('skill.rangedPrecision'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackRating: getSkillStatBonus({
              level,
              statKey: 'attackRating',
              skillType: 'passive',
              scale: {
                base: 15, increment: 10, interval: 0.1, bonus: 5,
              },
            }),
            extraDamageFromAttackRatingPercent: getSkillStatBonus({
              level, statKey: 'extraDamageFromAttackRatingPercent', skillType: 'passive', scale: { base: 10 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'vampiric-bats',
          description: () => t('skill.vampiricBats'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            batsHealPercent: level ? 50 + getSkillStatBonus({
              level, statKey: 'batsHealPercent', skillType: 'passive',
            }) : 0,
          }),
        },
        crimsonFeast: {
          id: 'crimsonFeast',
          name: () => t('Crimson Feast'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'crimson-feast',
          description: () => t('skill.crimsonFeast'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: getSkillStatBonus({
              level, statKey: 'lifeSteal', skillType: 'passive', scale: { base: 4 },
            }),
            lifePerHit: getSkillStatBonus({
              level,
              statKey: 'lifePerHit',
              skillType: 'passive',
              scale: {
                base: 30, increment: 20, interval: 0.2, bonus: 10,
              },
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'night-stalker-mastery',
          description: () => t('skill.nightStalkerMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            nightStalkerBuffEffectivenessPercent: level ? 50 + getSkillStatBonus({
              level, statKey: 'nightStalkerBuffEffectivenessPercent', skillType: 'passive',
            }) : 0,
          }),
        },
        bloodRitual: {
          id: 'bloodRitual',
          name: () => t('Blood Ritual'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'blood-ritual',
          description: () => t('skill.bloodRitual'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bloodSacrificeUnlocked: 1,
            bloodSacrificeEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'bloodSacrificeEffectivenessPercent', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'blood-potency',
          description: () => t('skill.bloodPotency'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getSkillStatBonus({
              level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 5 },
            }),
            attackSpeedPercent: getSkillStatBonus({
              level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 4 },
            }),
            chanceToHitPercent: getSkillStatBonus({
              level, statKey: 'chanceToHitPercent', skillType: 'passive',
            }),
          }),
        },
        hemorrhage: {
          id: 'hemorrhage',
          name: () => t('skill.hemorrhage.name'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'hemorrhage',
          description: () => t('skill.hemorrhage'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: getSkillStatBonus({
              level, statKey: 'bleedChance', skillType: 'passive',
            }),
            bleedDamagePercent: getSkillStatBonus({
              level, statKey: 'bleedDamagePercent', skillType: 'passive',
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
      baseStats: () => ({
        canUseTwoShields: 1, thornsOnMiss: 1, blockChanceCap: 10,
      }),
      skills: {
        shieldMastery: {
          id: 'shieldMastery',
          name: () => t('Shield Mastery'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'shield-mastery',
          description: () => t('skill.shieldMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            shieldEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'shieldEffectivenessPercent', skillType: 'passive',
            }),
            endurancePercent: getSkillStatBonus({
              level, statKey: 'endurancePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
          }),
        },
        zeal: {
          id: 'zeal',
          name: () => t('skill.zeal.name'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'zeal',
          description: () => t('skill.zeal'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            divineProtectionBuffEffectivenessPercent: level ? 50 + getSkillStatBonus({
              level, statKey: 'divineProtectionBuffEffectivenessPercent', skillType: 'passive',
            }) : 0,
            perseverancePercent: getSkillStatBonus({
              level, statKey: 'perseverancePercent', skillType: 'passive', scale: { base: 0.4 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'divine-amulet',
          description: () => t('skill.divineAmulet'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            jewelryFlatEffectivenessPercent: level ? 50 + getSkillStatBonus({
              level, statKey: 'jewelryFlatEffectivenessPercent', skillType: 'passive',
            }) : 0,
          }),
        },
        sacredRelic: {
          id: 'sacredRelic',
          name: () => t('Sacred Relic'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'sacred-relic',
          description: () => t('skill.sacredRelic'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            attackSpeedPercent: getSkillStatBonus({
              level, statKey: 'attackSpeedPercent', skillType: 'passive', scale: { base: 4 },
            }),
            attackRatingPercent: level ? 50 + getSkillStatBonus({
              level, statKey: 'attackRatingPercent', skillType: 'passive', scale: { base: 5 },
            }) : 0,
            elementalDamagePercent: level ? 40 + getSkillStatBonus({
              level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 5 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'unyielding-spirit',
          description: () => t('skill.unyieldingSpirit'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            endurancePercent: getSkillStatBonus({
              level, statKey: 'endurancePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            perseverancePercent: getSkillStatBonus({
              level, statKey: 'perseverancePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
          }),
        },
        immortalPresence: {
          id: 'immortalPresence',
          name: () => t('Immortal Presence'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'immortal-presence',
          description: () => t('skill.immortalPresence'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            life: getSkillStatBonus({
              level, statKey: 'life', skillType: 'passive', scale: { base: 3.17 },
            }),
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'lacerate',
          description: () => t('skill.lacerate'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            bleedChance: getSkillStatBonus({
              level, statKey: 'bleedChance', skillType: 'passive',
            }),
            bleedDamagePercent: getSkillStatBonus({
              level, statKey: 'bleedDamagePercent', skillType: 'passive',
            }),
          }),
        },
        fatalBlow: {
          id: 'fatalBlow',
          name: () => t('Fatal Blow'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'fatal-blow',
          description: () => t('skill.fatalBlow'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getSkillStatBonus({
              level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 5 },
            }),
            instaKillPercent: getSkillStatBonus({
              level, statKey: 'instaKillPercent', skillType: 'passive',
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'battle-command',
          description: () => t('skill.battleCommand'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            buffEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'buffEffectivenessPercent', skillType: 'passive',
            }),
          }),
        },
        warlordsAuthority: {
          id: 'warlordsAuthority',
          name: () => t("Warlord's Authority"),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'warlords-authority',
          description: () => t('skill.warlordsAuthority'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            warlordEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'warlordEffectivenessPercent', skillType: 'passive',
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
        critDamagePercent: 20,
        critChanceCap: 25,
      }),
      skills: {
        bloodBank: {
          id: 'bloodBank',
          name: () => t('Blood Bank'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'blood-bank',
          description: () => t('skill.bloodBank'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            overhealPercent: 20 + getSkillStatBonus({
              level, statKey: 'overhealPercent', skillType: 'passive',
            }),
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
          }),
        },
        giantSlayer: {
          id: 'giantSlayer',
          name: () => t('Giant Slayer'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'giant-slayer',
          description: () => t('skill.giantSlayer'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damageToHighRarityEnemiesPercent: getSkillStatBonus({
              level, statKey: 'damageToHighRarityEnemiesPercent', skillType: 'passive',
            }),
            executeThresholdPercent: getSkillStatBonus({
              level,
              statKey: 'executeThresholdPercent',
              skillType: 'passive',
              scale: { max: 0.3 }, // 15/50 = 0.3
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'searing-heat',
          description: () => t('skill.searingHeat'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            burnChance: getSkillStatBonus({
              level, statKey: 'burnChance', skillType: 'passive',
            }),
            burnDamagePercent: getSkillStatBonus({
              level, statKey: 'burnDamagePercent', skillType: 'passive',
            }),
          }),
        },
        combustion: {
          id: 'combustion',
          name: () => t('skill.combustion.name'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'combustion',
          description: () => t('skill.combustion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            explosionChance: getSkillStatBonus({
              level, statKey: 'explosionChance', skillType: 'passive',
            }),
            extraDamageAgainstBurningEnemies: getSkillStatBonus({
              level, statKey: 'extraDamageAgainstBurningEnemies', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'arc-discharge',
          description: () => t('skill.arcDischarge'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            arcDischargeChance: getSkillStatBonus({
              level, statKey: 'arcDischargeChance', skillType: 'passive',
            }),
            lightningDamage: getSkillStatBonus({
              level, statKey: 'lightningDamage', skillType: 'passive', scale: { base: 3.33 },
            }),
          }),
        },
        staticShock: {
          id: 'staticShock',
          name: () => t('Static Shock'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'static-shock',
          description: () => t('skill.staticShock'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            shockChance: getSkillStatBonus({
              level, statKey: 'shockChance', skillType: 'passive',
            }),
            shockEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'shockEffectivenessPercent', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'permafrost',
          description: () => t('skill.permafrost'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageAgainstFrozenEnemies: getSkillStatBonus({
              level, statKey: 'extraDamageAgainstFrozenEnemies', skillType: 'passive',
            }),
            chanceToShatterEnemy: getSkillStatBonus({
              level, statKey: 'chanceToShatterEnemy', skillType: 'passive',
            }),
          }),
        },
        iceBarrier: {
          id: 'iceBarrier',
          name: () => t('Ice Barrier'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'ice-barrier',
          description: () => t('skill.iceBarrier'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            coldDamagePercent: getSkillStatBonus({
              level, statKey: 'coldDamagePercent', skillType: 'passive', scale: { base: 2 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'shapeshifting-mastery',
          description: () => t('skill.shapeshiftingMastery'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            allAttributes: getSkillStatBonus({
              level, statKey: 'allAttributes', skillType: 'passive', scale: { base: 2.66 },
            }),
            allAttributesPercent: getSkillStatBonus({
              level, statKey: 'allAttributesPercent', skillType: 'passive', scale: { base: 0.2 },
            }),
          }),
        },
        primalAdaptation: {
          id: 'primalAdaptation',
          name: () => t('Primal Adaptation'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'primal-adaptation',
          description: () => t('skill.primalAdaptation'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            damagePercent: getSkillStatBonus({
              level, statKey: 'damagePercent', skillType: 'passive', scale: { base: 1 },
            }),
            elementalDamagePercent: getSkillStatBonus({
              level, statKey: 'elementalDamagePercent', skillType: 'passive', scale: { base: 1 },
            }),
            armorPercent: getSkillStatBonus({
              level, statKey: 'armorPercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            lifeRegenPercent: getSkillStatBonus({
              level, statKey: 'lifeRegenPercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            allResistancePercent: getSkillStatBonus({
              level, statKey: 'allResistancePercent', skillType: 'passive', scale: { base: 1 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'elemental-harmony',
          description: () => t('skill.elementalHarmony'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            waterDamagePercent: getSkillStatBonus({
              level, statKey: 'waterDamagePercent', skillType: 'passive', scale: { base: 2 },
            }),
            coldDamagePercent: getSkillStatBonus({
              level, statKey: 'coldDamagePercent', skillType: 'passive', scale: { base: 2 },
            }),
            earthDamagePercent: getSkillStatBonus({
              level, statKey: 'earthDamagePercent', skillType: 'passive', scale: { base: 2 },
            }),
          }),
        },
        primalResilience: {
          id: 'primalResilience',
          name: () => t('Primal Resilience'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'primal-resilience',
          description: () => t('skill.primalResilience'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            elementalPenetrationPercent: getSkillStatBonus({
              level, statKey: 'elementalPenetrationPercent', skillType: 'passive', scale: { base: 1 },
            }),
            damageTakenReductionPercent: getSkillStatBonus({
              level, statKey: 'damageTakenReductionPercent', skillType: 'passive', scale: { base: 1.5 },
            }),
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'beast-frenzy',
          description: () => t('skill.beastFrenzy'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            summonAttackSpeedBuffPercent: getSkillStatBonus({
              level, statKey: 'summonAttackSpeedBuffPercent', skillType: 'passive',
            }),
            summonDamageBuffPercent: getSkillStatBonus({
              level, statKey: 'summonDamageBuffPercent', skillType: 'passive',
            }),
          }),
        },
        wildCommunion: {
          id: 'wildCommunion',
          name: () => t('Wild Communion'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'wild-communion',
          description: () => t('skill.wildCommunion'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            lifeRegenPercent: getSkillStatBonus({
              level, statKey: 'lifeRegenPercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            armorPercent: getSkillStatBonus({
              level, statKey: 'armorPercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            allResistancePercent: getSkillStatBonus({
              level, statKey: 'allResistancePercent', skillType: 'passive', scale: { base: 1 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'mana-ward',
          description: () => t('skill.manaWard'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            manaShieldDamageTakenReductionPercent: getSkillStatBonus({
              level, statKey: 'manaShieldDamageTakenReductionPercent', skillType: 'passive',
            }),
            manaPercent: getSkillStatBonus({
              level, statKey: 'manaPercent', skillType: 'passive', scale: { base: 1 },
            }),
          }),
        },
        arcaneOverload: {
          id: 'arcaneOverload',
          name: () => t('Arcane Overload'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'arcane-overload',
          description: () => t('skill.arcaneOverload'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            extraDamageFromManaPercent: getSkillStatBonus({
              level, statKey: 'extraDamageFromManaPercent', skillType: 'passive', scale: { base: 1 },
            }),
            manaRegen: getSkillStatBonus({
              level, statKey: 'manaRegen', skillType: 'passive', scale: { base: 0.66 },
            }),
            manaRegenPercent: getSkillStatBonus({
              level, statKey: 'manaRegenPercent', skillType: 'passive', scale: { base: 0.4 },
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'crimson-fortitude',
          description: () => t('skill.crimsonFortitude'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifePercent: getSkillStatBonus({
              level, statKey: 'lifePercent', skillType: 'passive', scale: { base: 0.4 },
            }),
            crimsonAegisSkillUnlocked: 1,
          }),
        },
        sanguineLeech: {
          id: 'sanguineLeech',
          name: () => t('Sanguine Leech'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'sanguine-leech',
          description: () => t('skill.sanguineLeech'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            lifeSteal: getSkillStatBonus({
              level, statKey: 'lifeSteal', skillType: 'passive', scale: { base: 4 },
            }),
            lifePerHitPercent: getSkillStatBonus({
              level, statKey: 'lifePerHitPercent', skillType: 'passive',
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
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[0],
          icon: () => 'dancing-blades',
          description: () => t('skill.dancingBlades'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            allResistancePercent: getSkillStatBonus({
              level, statKey: 'allResistancePercent', skillType: 'passive', scale: { base: 1 },
            }),
            extraDamageFromAllResistancesPercent: 0.5 + getSkillStatBonus({
              level,
              statKey: 'extraDamageFromAllResistancesPercent',
              skillType: 'passive',
              scale: { base: 2 },
            }),
            elementalDamageTakenReductionPercent: getSkillStatBonus({
              level, statKey: 'elementalDamageTakenReductionPercent', skillType: 'passive',
            }),
          }),
        },
        enchantedArmor: {
          id: 'enchantedArmor',
          name: () => t('Enchanted Armor'),
          type: () => 'passive',
          requiredLevel: () => SPECIALIZATION_SKILL_LEVEL_TIERS[1],
          icon: () => 'enchanted-armor',
          description: () => t('skill.enchantedArmor'),
          maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
          effect: (level) => ({
            weaponFlatEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'weaponFlatEffectivenessPercent', skillType: 'passive',
            }),
            jewelryFlatEffectivenessPercent: getSkillStatBonus({
              level, statKey: 'jewelryFlatEffectivenessPercent', skillType: 'passive',
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