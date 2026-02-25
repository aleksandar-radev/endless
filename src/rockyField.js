import { ROCKY_FIELD_BASE_STATS, ROCKY_FIELD_ENEMIES } from './constants/rocky_field.js';
import { computeScaledReward, xpDiminishingFactor } from './common.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';
import { hero, options, statistics } from './globals.js';
import { formatNumber as formatNumberValue } from './utils/numberFormatter.js';
import EnemyBase from './enemyBase.js';

export const ROCKY_FIELD_REGIONS = [
  {
    id: 'outskirts',
    tier: 1,
    get name() {
      return t('rockyField.region.outskirts.name');
    },
    get description() {
      return t('rockyField.region.outskirts.desc');
    },
    unlockStage: 1,
    previousRegion: null,
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
  {
    id: 'boulders',
    tier: 2,
    get name() {
      return t('rockyField.region.boulders.name');
    },
    get description() {
      return t('rockyField.region.boulders.desc');
    },
    unlockStage: 500,
    previousRegion: 'outskirts',
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
  {
    id: 'caves',
    tier: 3,
    get name() {
      return t('rockyField.region.caves.name');
    },
    get description() {
      return t('rockyField.region.caves.desc');
    },
    unlockStage: 500,
    previousRegion: 'boulders',
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
  {
    id: 'cliffs',
    tier: 4,
    get name() {
      return t('rockyField.region.cliffs.name');
    },
    get description() {
      return t('rockyField.region.cliffs.desc');
    },
    unlockStage: 500,
    previousRegion: 'caves',
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
  {
    id: 'valley',
    tier: 5,
    get name() {
      return t('rockyField.region.valley.name');
    },
    get description() {
      return t('rockyField.region.valley.desc');
    },
    unlockStage: 500,
    previousRegion: 'cliffs',
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
  {
    id: 'summit',
    tier: 6,
    get name() {
      return t('rockyField.region.summit.name');
    },
    get description() {
      return t('rockyField.region.summit.desc');
    },
    unlockStage: 500,
    previousRegion: 'valley',
    multiplier: {
      life: 1, damage: 1, armor: 1, attackSpeed: 1, xp: 1, gold: 1,
    },
  },
];

export function isRegionUnlocked(regionId) {
  const region = ROCKY_FIELD_REGIONS.find((r) => r.id === regionId);
  if (!region) return false;
  if (!region.unlockStage || region.unlockStage <= 1) return true;
  if (!region.previousRegion) return true;

  // Check the highest stage in the PREVIOUS region
  const prevHighest = statistics?.get('rockyFieldHighestStages', region.previousRegion) || 0;
  return prevHighest >= region.unlockStage;
}

export function getRockyFieldEnemies(regionId) {
  return ROCKY_FIELD_ENEMIES.filter((e) => Array.isArray(e.tags) && e.tags.includes(regionId));
}

const ELEMENT_IDS = Object.keys(ELEMENTS);

// Region scaling: 25x per region tier
const ROCKY_FIELD_REGION_MULTIPLIER = 25;
// Stage scaling: 20% per stage (0.2)
const ROCKY_FIELD_STAGE_SCALING = 0.2;

export class RockyFieldEnemy extends EnemyBase {
  constructor(regionId, stage) {
    super();
    this.regionId = regionId;
    this.level = stage;

    const regionEnemies = getRockyFieldEnemies(regionId);
    const template = regionEnemies[Math.floor(Math.random() * regionEnemies.length)] || {};

    this.nameKey = template.nameKey || 'enemy.name.unknown';
    this.image = template.image || '';
    this.tags = template.tags || [];
    this.runeDrop = template.runeDrop || [];
    this.special = Array.isArray(template.special) ? [...template.special] : [];
    this.specialData = { ...(template.specialData || {}) };
    this.baseData = template;

    const region = ROCKY_FIELD_REGIONS.find((r) => r.id === regionId);
    const tier = region?.tier || 1;

    this.tier = tier;
    this.regionMultiplier = region?.multiplier || {};
    this.regionScale = Math.pow(ROCKY_FIELD_REGION_MULTIPLIER, tier - 1);
    this.stageScale = 1 + (stage - 1) * ROCKY_FIELD_STAGE_SCALING;

    // Stats that don't change with hero bonuses
    this.armor = this.calculateArmor();
    this.evasion = this.calculateEvasion();
    this.attackRating = this.calculateAttackRating();

    ELEMENT_IDS.forEach((elId) => {
      this[`${elId}Resistance`] = this.calculateElementalResistance(elId);
    });

    // Stats that can be affected by hero skills (damage reduction, etc.)
    this.recalculateStats();

    // XP and Gold with diminishing returns
    const templateMult = template.multiplier || {};
    const baseXp = ROCKY_FIELD_BASE_STATS.xp || 120;
    const baseGold = ROCKY_FIELD_BASE_STATS.gold || 140;

    const diminishing = xpDiminishingFactor(stage);
    const xpScaled = computeScaledReward(
      baseXp * (templateMult.xp || 1) * (this.regionMultiplier.xp || 1) * this.regionScale,
      stage, 0.1, 1, diminishing,
    );
    const goldScaled = computeScaledReward(
      baseGold * (templateMult.gold || 1) * (this.regionMultiplier.gold || 1) * this.regionScale,
      stage, 0.1, 1, diminishing,
    );

    this.xp = Math.floor(xpScaled);
    this.gold = Math.floor(goldScaled);

    this.currentLife = this.life;
    this.lastAttack = Date.now();
  }

  getRegionMultiplier(stat) {
    return this.regionMultiplier?.[stat] || 1;
  }

  calculateAttackSpeed() {
    const templateMult = this.baseData.multiplier || {};
    const baseSpeed = (templateMult.attackSpeed || 1) * this.getRegionMultiplier('attackSpeed');
    const speedRed = hero?.stats?.reduceEnemyAttackSpeedPercent || 0;
    return baseSpeed * (1 - speedRed);
  }

  calculateLife() {
    const templateMult = this.baseData.multiplier || {};
    const baseLife = ROCKY_FIELD_BASE_STATS.life || 5000;
    const scaled = baseLife * (templateMult.life || 1) * this.getRegionMultiplier('life')
      * this.regionScale * this.stageScale;
    const hpRed = hero?.stats?.reduceEnemyHpPercent || 0;
    return Math.floor(scaled * (1 - hpRed));
  }

  calculateDamage() {
    const templateMult = this.baseData.multiplier || {};
    const baseDamage = ROCKY_FIELD_BASE_STATS.damage || 375;
    const scaled = baseDamage * (templateMult.damage || 1) * this.getRegionMultiplier('damage')
      * this.regionScale * this.stageScale;
    const damageRed = hero?.stats?.reduceEnemyDamagePercent || 0;
    return Math.floor(scaled * (1 - damageRed));
  }

  calculateArmor() {
    const templateMult = this.baseData.multiplier || {};
    const baseArmor = ROCKY_FIELD_BASE_STATS.armor;
    return Math.floor(
      baseArmor * (templateMult.armor || 1) * this.getRegionMultiplier('armor')
        * this.regionScale * this.stageScale,
    );
  }

  calculateEvasion() {
    const templateMult = this.baseData.multiplier || {};
    const baseEvasion = ROCKY_FIELD_BASE_STATS.evasion;
    return Math.floor(
      baseEvasion * (templateMult.evasion || 1) * this.regionScale * this.stageScale,
    );
  }

  calculateAttackRating() {
    const templateMult = this.baseData.multiplier || {};
    const baseAttackRating = ROCKY_FIELD_BASE_STATS.attackRating;
    return Math.floor(
      baseAttackRating * (templateMult.attackRating || 1) * this.regionScale * this.stageScale,
    );
  }

  calculateElementalDamage(type) {
    const templateMult = this.baseData.multiplier || {};
    const baseDamage = ROCKY_FIELD_BASE_STATS.damage || 375;
    const templateDmgMult = templateMult[`${type}Damage`] || 0;
    if (templateDmgMult === 0) return 0;
    const scaled = baseDamage * templateDmgMult * this.regionScale * this.stageScale;
    const damageRed = hero?.stats?.reduceEnemyDamagePercent || 0;
    return Math.floor(scaled * (1 - damageRed));
  }

  calculateElementalResistance(type) {
    const templateMult = this.baseData.multiplier || {};
    const baseRes = ROCKY_FIELD_BASE_STATS[`${type}Resistance`];
    if (!baseRes) return 0;
    return Math.floor(
      baseRes * (templateMult[`${type}Resistance`] || 1) * this.regionScale * this.stageScale,
    );
  }

  recalculateStats() {
    this.attackSpeed = this.calculateAttackSpeed();
    this.life = this.calculateLife();
    this.maxLife = this.life;
    this.damage = this.calculateDamage();
    ELEMENT_IDS.forEach((elId) => {
      this[`${elId}Damage`] = this.calculateElementalDamage(elId);
    });
  }
}

export function formatEnemyStat(value, stat) {
  if (value === undefined || value === null) return '-';
  const key = stat?.toLowerCase?.() || '';
  if (key.includes('damage') || key === 'armor' || key.includes('rating') || key.includes('evasion')) {
    const shouldShort = options?.shortNumbers;
    const num = formatNumberValue(value, shouldShort ? { notation: 'compact', maximumFractionDigits: 1 } : undefined);
    return num;
  }
  if (key.includes('resistance')) {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (key === 'attackspeed') {
    return `${value.toFixed(2)}`;
  }
  if (key === 'life') {
    const shouldShort = options?.shortNumbers;
    return formatNumberValue(value, shouldShort ? { notation: 'compact', maximumFractionDigits: 1 } : undefined);
  }
  if (typeof value === 'number') {
    const shouldShort = options?.shortNumbers;
    return formatNumberValue(value, shouldShort ? { notation: 'compact', maximumFractionDigits: 1 } : undefined);
  }
  return String(value);
}

export function logRockyFieldProgress() {
  const stage = typeof game !== 'undefined' ? game.rockyFieldStage : 1;
  const region = typeof game !== 'undefined' ? game.rockyFieldRegion : 'outskirts';

  const enemy = new RockyFieldEnemy(region, stage);
  battleLog.addInfo(tp('rockyField.stageInfo', { stage }));
  battleLog.addInfo(tp('rockyField.enemyName', { name: enemy.name }));
  battleLog.addInfo(tp('rockyField.enemyLife', { life: formatEnemyStat(enemy.maxLife, 'life') }));
  battleLog.addInfo(tp('rockyField.enemyDamage', { damage: formatEnemyStat(enemy.damage, 'damage') }));
  battleLog.addInfo(tp('rockyField.enemyArmor', { armor: formatEnemyStat(enemy.armor, 'armor') }));
}
