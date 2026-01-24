import { itemStatScaleFactor, createTierScaling, createStat, createPercentStat, createHiddenStat, getSkillBonusesFlat, getSkillBonusesPercent } from './stats.js';
import { getItemRange, getSkillFlatBase, getSkillFlatIncrement, SKILL_INTERVAL, getSkillFlatBonus } from '../ratios.js';

const rewardTierScalingMaxPercent = createTierScaling(20, 400, 1.2);
const dropTierScalingMaxPercent = createTierScaling(13, 200, 1.2);
const attributeTierScalingMaxPercent = createTierScaling(12, 200, 1.2);

const STATS_MIN = 8;
const STATS_MAX = 15;

const miscScaling = (level, tier) => itemStatScaleFactor(level, tier);

export const MISC_STATS = {
  mana: createStat({
    base: 50,
    levelUpBonus: 0,
    training: {
      cost: 120, bonus: 5, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('mana'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('mana'),
        increment: getSkillFlatIncrement('mana'),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('mana'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('mana', 1.33),
        increment: getSkillFlatIncrement('mana', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('mana'),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('mana', 1.67),
        increment: getSkillFlatIncrement('mana', 1.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('mana', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('mana', 1.33),
        increment: getSkillFlatIncrement('mana', 1.33),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('mana', 1.2),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('mana', 0.67),
        increment: getSkillFlatIncrement('mana', 0.67),
        interval: SKILL_INTERVAL,
        bonus: getSkillFlatBonus('mana', 0.8),
      }),
    },
  }),
  manaPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(8, 100, 1.2) },
    itemTags: ['misc', 'jewelry', 'magic'],
  }),
  manaRegen: createStat({
    dec: 1,
    training: {
      cost: 300, bonus: 0.1, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('manaRegen'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('manaRegen'),
        increment: getSkillFlatIncrement('manaRegen'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaRegen'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('manaRegen', 1.33),
        increment: getSkillFlatIncrement('manaRegen', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaRegen', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('manaRegen', 1.67),
        increment: getSkillFlatIncrement('manaRegen', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaRegen', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('manaRegen', 1.33),
        increment: getSkillFlatIncrement('manaRegen', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaRegen', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('manaRegen', 0.67),
        increment: getSkillFlatIncrement('manaRegen', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaRegen', 0.8),
      }),
    },
  }),
  manaRegenPercent: createPercentStat({
    item: { tierScalingMaxPercent: createTierScaling(10, 100, 1.2) },
    itemTags: ['jewelry', 'magic'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6, max: 10000,
      }),
      buff: getSkillBonusesPercent({
        type: 'buff', base: 8, softcap: 2000, linear: 0.08, power: 0.6, max: 10000,
      }),
    },
  }),
  manaPerHit: createStat({
    dec: 1,
    training: {
      cost: 1750, bonus: 1, maxLevel: Infinity,
    },
    item: {
      ...getItemRange('manaPerHit'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'magic'],
    show: true,
    sub: 'resources',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('manaPerHit'),
        increment: getSkillFlatIncrement('manaPerHit'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaPerHit'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('manaPerHit', 1.33),
        increment: getSkillFlatIncrement('manaPerHit', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaPerHit', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('manaPerHit', 1.67),
        increment: getSkillFlatIncrement('manaPerHit', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaPerHit', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('manaPerHit', 1.33),
        increment: getSkillFlatIncrement('manaPerHit', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaPerHit', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('manaPerHit', 0.67),
        increment: getSkillFlatIncrement('manaPerHit', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('manaPerHit', 0.8),
      }),
    },
  }),
  manaPerHitPercent: createStat({ div: 100 }),
  manaSteal: createPercentStat({
    dec: 2,
    item: { tierScalingMaxPercent: createTierScaling(1.25, 10, 1.2) },
    show: true,
    sub: 'attack',
  }),
  manaStealPercent: createPercentStat({ forceNotShow: true }),
  strength: createStat({
    item: {
      ...getItemRange('strength'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('strength'),
        increment: getSkillFlatIncrement('strength'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('strength'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('strength', 1.33),
        increment: getSkillFlatIncrement('strength', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('strength', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('strength', 1.67),
        increment: getSkillFlatIncrement('strength', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('strength', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('strength', 1.33),
        increment: getSkillFlatIncrement('strength', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('strength', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('strength', 0.67),
        increment: getSkillFlatIncrement('strength', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('strength', 0.8),
      }),
    },
  }),
  strengthPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  agility: createStat({
    item: {
      ...getItemRange('agility'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('agility'),
        increment: getSkillFlatIncrement('agility'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('agility'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('agility', 1.33),
        increment: getSkillFlatIncrement('agility', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('agility', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('agility', 1.67),
        increment: getSkillFlatIncrement('agility', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('agility', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('agility', 1.33),
        increment: getSkillFlatIncrement('agility', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('agility', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('agility', 0.67),
        increment: getSkillFlatIncrement('agility', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('agility', 0.8),
      }),
    },
  }),
  agilityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'axe', 'mace'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  vitality: createStat({
    item: {
      ...getItemRange('vitality'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('vitality'),
        increment: getSkillFlatIncrement('vitality'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('vitality'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('vitality', 1.33),
        increment: getSkillFlatIncrement('vitality', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('vitality', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('vitality', 1.67),
        increment: getSkillFlatIncrement('vitality', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('vitality', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('vitality', 1.33),
        increment: getSkillFlatIncrement('vitality', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('vitality', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('vitality', 0.67),
        increment: getSkillFlatIncrement('vitality', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('vitality', 0.8),
      }),
    },
  }),
  vitalityPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  wisdom: createStat({
    item: {
      ...getItemRange('wisdom'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('wisdom'),
        increment: getSkillFlatIncrement('wisdom'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('wisdom'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('wisdom', 1.33),
        increment: getSkillFlatIncrement('wisdom', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('wisdom', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('wisdom', 1.67),
        increment: getSkillFlatIncrement('wisdom', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('wisdom', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('wisdom', 1.33),
        increment: getSkillFlatIncrement('wisdom', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('wisdom', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('wisdom', 0.67),
        increment: getSkillFlatIncrement('wisdom', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('wisdom', 0.8),
      }),
    },
  }),
  wisdomPercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  endurance: createStat({
    item: {
      ...getItemRange('endurance'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('endurance'),
        increment: getSkillFlatIncrement('endurance'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('endurance'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('endurance', 1.33),
        increment: getSkillFlatIncrement('endurance', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('endurance', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('endurance', 1.67),
        increment: getSkillFlatIncrement('endurance', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('endurance', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('endurance', 1.33),
        increment: getSkillFlatIncrement('endurance', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('endurance', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('endurance', 0.67),
        increment: getSkillFlatIncrement('endurance', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('endurance', 0.8),
      }),
    },
  }),
  endurancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  dexterity: createStat({
    item: {
      ...getItemRange('dexterity'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('dexterity'),
        increment: getSkillFlatIncrement('dexterity'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('dexterity'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('dexterity', 1.33),
        increment: getSkillFlatIncrement('dexterity', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('dexterity', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('dexterity', 1.67),
        increment: getSkillFlatIncrement('dexterity', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('dexterity', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('dexterity', 1.33),
        increment: getSkillFlatIncrement('dexterity', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('dexterity', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('dexterity', 0.67),
        increment: getSkillFlatIncrement('dexterity', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('dexterity', 0.8),
      }),
    },
  }),
  dexterityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  intelligence: createStat({
    item: {
      ...getItemRange('intelligence'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat', 'magic'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('intelligence'),
        increment: getSkillFlatIncrement('intelligence'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('intelligence'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('intelligence', 1.33),
        increment: getSkillFlatIncrement('intelligence', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('intelligence', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('intelligence', 1.67),
        increment: getSkillFlatIncrement('intelligence', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('intelligence', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('intelligence', 1.33),
        increment: getSkillFlatIncrement('intelligence', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('intelligence', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('intelligence', 0.67),
        increment: getSkillFlatIncrement('intelligence', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('intelligence', 0.8),
      }),
    },
  }),
  intelligencePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'magic'],
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 5, softcap: 2000, linear: 0.05, power: 0.6,
      }),
    },
  }),
  perseverance: createStat({
    item: {
      ...getItemRange('perseverance'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['misc', 'jewelry', 'stat'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('perseverance'),
        increment: getSkillFlatIncrement('perseverance'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('perseverance'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('perseverance', 1.33),
        increment: getSkillFlatIncrement('perseverance', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('perseverance', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('perseverance', 1.67),
        increment: getSkillFlatIncrement('perseverance', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('perseverance', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('perseverance', 1.33),
        increment: getSkillFlatIncrement('perseverance', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('perseverance', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('perseverance', 0.67),
        increment: getSkillFlatIncrement('perseverance', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('perseverance', 0.8),
      }),
    },
  }),
  perseverancePercent: createPercentStat({
    item: { tierScalingMaxPercent: attributeTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
  }),
  enduranceThornsDamagePerPoint: createStat({
    dec: 1,
    sub: 'defense',
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive', base: 0.2, increment: 0, interval: 0, bonus: getSkillFlatBonus('enduranceThornsDamagePerPoint', 0),
      }),
    },
  }),
  summonsCanCrit: createHiddenStat(),
  bonusGoldPercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
    skills: {
      passive: getSkillBonusesPercent({
        type: 'passive', base: 10, softcap: 2000, linear: 0.5, power: 0.6, max: 500,
      }),
    },
  }),
  bonusExperiencePercent: createPercentStat({
    item: { tierScalingMaxPercent: rewardTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry'],
    show: true,
    sub: 'rewards',
  }),
  cooldownReductionPercent: createPercentStat({
    show: true,
    sub: 'misc',
    item: {
      tierScalingMaxPercent: createTierScaling(5, 5, 1),
      overrides: {
        WAND: { tierScalingMaxPercent: createTierScaling(10, 10, 1) },
        STAFF: { tierScalingMaxPercent: createTierScaling(20, 20, 1) },
        AMULET: { tierScalingMaxPercent: createTierScaling(15, 25, 1) },
        RING: { tierScalingMaxPercent: createTierScaling(5, 10, 1) },
      },
    },
    itemTags: ['magic', 'jewelry'],
    skills: {
      buff: getSkillBonusesPercent({
        type: 'buff', base: 2, softcap: 2000, linear: 0.1, power: 0.5, max: 50,
      }),
    },
  }),
  cooldownReductionCapPercent: createStat({
    base: 80,
    div: 100,
    sub: 'misc',
  }),
  adDamagePercent: createPercentStat({ sub: 'rewards', show: true }),
  adLifePercent: createPercentStat({ sub: 'rewards', show: true }),
  adArmorPercent: createPercentStat({ sub: 'rewards', show: true }),
  adEvasionPercent: createPercentStat({ sub: 'rewards', show: true }),
  adAllResistancePercent: createPercentStat({ sub: 'rewards', show: true }),
  adXpBonusPercent: createPercentStat({ sub: 'rewards', show: true }),
  adGoldGainPercent: createPercentStat({ sub: 'rewards', show: true }),
  manaCostReductionPercent: createPercentStat(),
  buffDurationPercent: createPercentStat({
    show: true,
    sub: 'misc',
    item: {
      tierScalingMaxPercent: createTierScaling(20, 50, 1),
      overrides: {
        AMULET: { tierScalingMaxPercent: createTierScaling(40, 80, 1) },
        RING: { tierScalingMaxPercent: createTierScaling(20, 50, 1) },
      },
    },
    itemTags: ['jewelry'],
  }),
  buffEffectivenessPercent: createPercentStat({ sub: 'misc' }),
  itemBonusesPercent: createPercentStat(),
  itemQuantityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'gloves'],
    show: true,
    sub: 'rewards',
  }),
  itemRarityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['misc', 'jewelry', 'gloves'],
    show: true,
    sub: 'rewards',
  }),
  enemyRarityPercent: createStat({
    div: 100,
    show: true,
    sub: 'rewards',
  }),
  materialQuantityPercent: createStat({
    div: 100,
    item: { tierScalingMaxPercent: dropTierScalingMaxPercent },
    itemTags: ['jewelry', 'ring', 'amulet'],
    show: true,
    sub: 'rewards',
  }),
  skillPoints: createStat({
    show: true,
    sub: 'rewards',
  }),
  skillPointsPerLevel: createStat({ dec: 0 }),
  attributesPerLevel: createStat({ dec: 0 }),
  extraResourceDamageCapPerLevel: createStat({ dec: 0 }),
  extraMaterialDropPercent: createStat({ div: 100 }),
  extraMaterialDropMax: createStat({ base: 1 }),
  manaRegenOfTotalPercent: createPercentStat({
    dec: 2,
    training: {
      cost: 1000, bonus: 0.01, maxLevel: 100,
    },
    item: { tierScalingMaxPercent: createTierScaling(0.05, 1, 1.2) },
    itemTags: ['staff'],
  }),
  allAttributes: createStat({
    item: {
      ...getItemRange('allAttributes'),
      scaling: (level, tier) => miscScaling(level, tier),
    },
    itemTags: ['defense', 'jewelry', 'gloves', 'misc'],
    skills: {
      passive: getSkillBonusesFlat({
        type: 'passive',
        base: getSkillFlatBase('allAttributes'),
        increment: getSkillFlatIncrement('allAttributes'),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('allAttributes'),
      }),
      toggle: getSkillBonusesFlat({
        type: 'toggle',
        base: getSkillFlatBase('allAttributes', 1.33),
        increment: getSkillFlatIncrement('allAttributes', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('allAttributes', 1.2),
      }),
      instant: getSkillBonusesFlat({
        type: 'instant',
        base: getSkillFlatBase('allAttributes', 1.67),
        increment: getSkillFlatIncrement('allAttributes', 1.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('allAttributes', 1.5),
      }),
      buff: getSkillBonusesFlat({
        type: 'buff',
        base: getSkillFlatBase('allAttributes', 1.33),
        increment: getSkillFlatIncrement('allAttributes', 1.33),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('allAttributes', 1.3),
      }),
      summon: getSkillBonusesFlat({
        type: 'summon',
        base: getSkillFlatBase('allAttributes', 0.67),
        increment: getSkillFlatIncrement('allAttributes', 0.67),
        interval: SKILL_INTERVAL * 2,
        bonus: getSkillFlatBonus('allAttributes', 0.8),
      }),
    },
  }),
  allAttributesPercent: createPercentStat(),
  canDualWieldTwoHanded: createHiddenStat(),
  weaponEffectivenessPercent: createStat({ dec: 1 }),
  weaponFlatEffectivenessPercent: createStat({ dec: 1 }),
  jewelryEffectivenessPercent: createStat({ dec: 1 }),
  jewelryFlatEffectivenessPercent: createStat({ dec: 1 }),
  allowBossLoot: createHiddenStat({ itemTags: [] }),
  animatedWeaponsUnlocked: createHiddenStat(),
  cloneUnlocked: createHiddenStat(),
  nightStalkerBuffEffectivenessPercent: createPercentStat(),
  canUseTwoShields: createHiddenStat(),
  amuletEffectivenessPercent: createPercentStat(),
  amuletFlatEffectivenessPercent: createStat({ dec: 1 }),
  ringEffectivenessPercent: createPercentStat(),
  ringFlatEffectivenessPercent: createStat({ dec: 1 }),
  uncappedAttackSpeed: createHiddenStat(),
  warlordEffectivenessPercent: createPercentStat(),
  overhealToLife: createHiddenStat(),
  overhealPercent: createStat({ div: 100 }),
  bloodSacrificeUnlocked: createHiddenStat(),
  shapeshiftUnlocked: createHiddenStat(),
  reduceEnemyResistancesPercent: createPercentStat(),
  convertManaToLifePercent: createPercentStat(),
  weaponIllusionUnlocked: createHiddenStat(),
  glacialBulwarkUnlocked: createHiddenStat(),
  weaponBuffEffectivenessPercent: createPercentStat(),
  crimsonAegisSkillUnlocked: createHiddenStat(),
  bloodSiphonSkillUnlocked: createHiddenStat(),
};
