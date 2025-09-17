import { ROCKY_FIELD_BASE_STATS, ROCKY_FIELD_ENEMIES } from './constants/rocky_field.js';
import {
  percentIncreasedByLevel,
  percentReducedByLevel,
  scaleStat,
} from './common.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';
import { hero } from './globals.js';

export const ROCKY_FIELD_REGIONS = [
  {
    id: 'outskirts',
    name: 'Outskirts',
    description: 'The edge of the rocky expanse.',
    unlockStage: 1,
    multiplier: {
      life: 1,
      damage: 1,
      armor: 1,
      attackSpeed: 1,
      attackRating: 1,
      evasion: 1,
      xp: 1,
      gold: 1,
    },
  },
  {
    id: 'boulders',
    name: 'Boulder Basin',
    description: 'Boulders scatter this wide basin.',
    unlockStage: 500,
    multiplier: {
      life: 3,
      damage: 3,
      armor: 3,
      attackSpeed: 0.8,
      attackRating: 3,
      evasion: 3,
      xp: 3,
      gold: 3,
    },
  },
  {
    id: 'caves',
    name: 'Hidden Caves',
    description: 'Dark caverns hide unseen threats.',
    unlockStage: 1000,
    multiplier: {
      life: 12,
      damage: 12,
      armor: 12,
      attackSpeed: 1,
      attackRating: 12,
      evasion: 12,
      xp: 12,
      gold: 12,
    },
  },
  {
    id: 'cliffs',
    name: 'Sheer Cliffs',
    description: 'Treacherous cliffs tower above.',
    unlockStage: 2000,
    multiplier: {
      life: 48,
      damage: 48,
      armor: 48,
      attackSpeed: 0.9,
      attackRating: 48,
      evasion: 48,
      xp: 48,
      gold: 48,
    },
  },
  {
    id: 'valley',
    name: 'Silent Valley',
    description: 'A quiet valley with lurking danger.',
    unlockStage: 4000,
    multiplier: {
      life: 288,
      damage: 288,
      armor: 288,
      attackSpeed: 1,
      attackRating: 288,
      evasion: 288,
      xp: 288,
      gold: 288,
    },
  },
  {
    id: 'summit',
    name: 'Windy Summit',
    description: 'Blistering winds dominate the peak.',
    unlockStage: 5000,
    multiplier: {
      life: 2880,
      damage: 2880,
      armor: 2880,
      attackSpeed: 1.2,
      attackRating: 2880,
      evasion: 2880,
      xp: 2880,
      gold: 2880,
    },
  },
];

export function getRockyFieldEnemies(regionId) {
  return ROCKY_FIELD_ENEMIES.filter((e) => Array.isArray(e.tags) && e.tags.includes(regionId));
}

const ELEMENT_IDS = Object.keys(ELEMENTS);

const REGION_STAT_SCALE = {
  outskirts: (level) => percentIncreasedByLevel(0.65, level, 25, 0.025, 3.2),
  boulders: (level) => percentIncreasedByLevel(0.6, level, 30, 0.02, 2.9),
  caves: (level) => percentIncreasedByLevel(0.55, level, 35, 0.015, 2.5),
  cliffs: (level) => percentIncreasedByLevel(0.5, level, 40, 0.01, 2.2),
  valley: (level) => percentIncreasedByLevel(0.45, level, 45, 0.01, 2),
  summit: (level) => percentIncreasedByLevel(0.4, level, 50, 0.01, 1.8),
};

const REGION_EXP_GOLD_SCALE = {
  outskirts: (level) => percentReducedByLevel(1, level, 40, 0.01, 0.1),
  boulders: (level) => percentReducedByLevel(1, level, 41, 0.009, 0.1),
  caves: (level) => percentReducedByLevel(1, level, 42, 0.008, 0.1),
  cliffs: (level) => percentReducedByLevel(1, level, 43, 0.007, 0.1),
  valley: (level) => percentReducedByLevel(0.95, level, 44, 0.006, 0.1),
  summit: (level) => percentReducedByLevel(0.9, level, 45, 0.005, 0.1),
};

const BASE_SCALE_PER_REGION_AND_LEVEL = {
  outskirts: {
    tierScale: 0.6,
    levelScale: 0.01,
  },
  boulders: {
    tierScale: 1,
    levelScale: 0.01,
  },
  caves: {
    tierScale: 2,
    levelScale: 0.01,
  },
  cliffs: {
    tierScale: 2,
    levelScale: 0.01,
  },
  valley: {
    tierScale: 3,
    levelScale: 0.01,
  },
  summit: {
    tierScale: 3,
    levelScale: 0.01,
  },
};

const attackRatingAndEvasionScale = 0.6;

const REGION_RUNE_MAX = {
  outskirts: 5,
  boulders: 10,
  caves: 20,
  cliffs: 40,
  valley: 60,
  summit: 80,
};

export function getRockyFieldRunePercent(regionId, stage) {
  const max = REGION_RUNE_MAX[regionId] || 5;
  const capped = Math.min(stage, 5000);
  const maxPercent = 1 + Math.floor((capped / 5000) * (max - 1));
  return Math.floor(Math.random() * maxPercent) + 1;
}

export class RockyFieldEnemy {
  constructor(regionId, level) {
    this.regionId = regionId;
    this.level = level;

    const regionEnemies = getRockyFieldEnemies(regionId);
    const baseData = regionEnemies[Math.floor(Math.random() * regionEnemies.length)];
    if (!baseData) {
      throw new Error(`No enemies defined for region "${regionId}"`);
    }
    this.baseData = baseData;

    this.name = baseData.name;
    this.image = baseData.image;
    this.special = baseData.special || [];
    this.runeDrop = baseData.runeDrop || [];

    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === regionId);
    if (!region) {
      throw new Error(`No region defined for "${regionId}"`);
    }
    const regionMultipliers = region.multiplier;
    if (!regionMultipliers) {
      throw new Error(`No multipliers defined for region "${regionId}"`);
    }
    const enemyMultipliers = baseData.multiplier || {};
    const getMultiplierValue = (source, stat) => {
      const value = source[stat];
      return value === undefined ? 1 : value;
    };
    const getStatValue = (stat, defaultValue = 0) => {
      const base = ROCKY_FIELD_BASE_STATS[stat];
      const baseValue = base === undefined ? defaultValue : base;
      const regionMultiplier = getMultiplierValue(regionMultipliers, stat);
      const enemyMultiplier = getMultiplierValue(enemyMultipliers, stat);
      return baseValue * regionMultiplier * enemyMultiplier;
    };
    const baseScale = BASE_SCALE_PER_REGION_AND_LEVEL[regionId] || { tierScale: 1, levelScale: 0 };
    const levelBonus = 1 + Math.floor(level / 20) * baseScale.levelScale;
    const statMultiplier = baseScale.tierScale * levelBonus;

    this.baseScale = REGION_STAT_SCALE[regionId](level);
    const xpGoldScale = REGION_EXP_GOLD_SCALE[regionId](level);

    const speedRed = hero.stats.reduceEnemyAttackSpeedPercent || 0;
    const hpRed = hero.stats.reduceEnemyHpPercent || 0;
    const dmgRed = hero.stats.reduceEnemyDamagePercent || 0;

    this.attackSpeed = getStatValue('attackSpeed', 1) * (1 - speedRed);
    this.life = scaleStat(getStatValue('life') * statMultiplier, level, 0, 0, 0, this.baseScale) * (1 - hpRed);
    this.damage = Math.max(
      scaleStat(getStatValue('damage') * statMultiplier, level, 0, 0, 0, this.baseScale) * (1 - dmgRed),
      1,
    );
    this.armor = scaleStat(getStatValue('armor') * statMultiplier, level, 0, 0, 0, this.baseScale);
    this.evasion =
      scaleStat(getStatValue('evasion') * statMultiplier, level, 0, 0, 0, this.baseScale) *
      attackRatingAndEvasionScale;
    this.attackRating =
      scaleStat(getStatValue('attackRating') * statMultiplier, level, 0, 0, 0, this.baseScale) *
      attackRatingAndEvasionScale;
    this.xp = scaleStat(getStatValue('xp') * statMultiplier, level, 0, 0, 0, this.baseScale) * xpGoldScale;
    this.gold = scaleStat(getStatValue('gold') * statMultiplier, level, 0, 0, 0, this.baseScale) * xpGoldScale;

    ELEMENT_IDS.forEach((id) => {
      const elementDamage = getStatValue(`${id}Damage`);
      const dmgBase = scaleStat(
        elementDamage * statMultiplier,
        level,
        0,
        0,
        0,
        this.baseScale,
      );
      this[`${id}Damage`] = elementDamage > 0 ? Math.max(dmgBase * (1 - dmgRed), 1) : 0;

      this[`${id}Resistance`] = scaleStat(
        getStatValue(`${id}Resistance`) * statMultiplier,
        level,
        0,
        0,
        0,
        this.baseScale,
      );
    });

    this.currentLife = this.life;
    this.lastAttack = Date.now();

    const rarityName = t('rarity.normal');
    battleLog.addBattle(tp('battleLog.encounteredEnemy', { rarity: rarityName, level: this.level, name: t(this.name) }));
  }

  canAttack(currentTime) {
    const timeBetweenAttacks = 1000 / this.attackSpeed;
    return currentTime - this.lastAttack >= timeBetweenAttacks;
  }

  resetLife() {
    this.currentLife = this.life;
  }

  takeDamage(damage) {
    this.currentLife -= damage;
    if (this.currentLife < 0) this.currentLife = 0;
    return this.currentLife <= 0;
  }
}

export default {
  regions: ROCKY_FIELD_REGIONS,
  getEnemies: getRockyFieldEnemies,
};
