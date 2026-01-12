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
    const regionMult = region?.multiplier || {};

    // Calculate region and stage scaling like explore enemies
    this.tier = tier;
    this.regionScale = Math.pow(ROCKY_FIELD_REGION_MULTIPLIER, tier - 1);
    this.stageScale = 1 + (stage - 1) * ROCKY_FIELD_STAGE_SCALING;

    // Apply damage reduction from hero stats
    const damageRed = hero?.stats?.reduceEnemyDamagePercent || 0;
    const hpRed = hero?.stats?.reduceEnemyHpPercent || 0;
    const speedRed = hero?.stats?.reduceEnemyAttackSpeedPercent || 0;

    // Template multipliers for per-enemy variation
    const templateMult = template.multiplier || {};

    // Life
    const baseLife = ROCKY_FIELD_BASE_STATS.life || 5000;
    this.life = Math.floor(
      baseLife * (templateMult.life || 1) * (regionMult.life || 1)
        * this.regionScale * this.stageScale * (1 - hpRed),
    );
    this.maxLife = this.life;

    // Damage
    const baseDamage = ROCKY_FIELD_BASE_STATS.damage || 375;
    this.damage = Math.floor(
      baseDamage * (templateMult.damage || 1) * (regionMult.damage || 1)
        * this.regionScale * this.stageScale * (1 - damageRed),
    );

    // Armor
    const baseArmor = ROCKY_FIELD_BASE_STATS.armor;
    this.armor = Math.floor(
      baseArmor * (templateMult.armor || 1) * (regionMult.armor || 1)
        * this.regionScale * this.stageScale,
    );

    // Evasion
    const baseEvasion = ROCKY_FIELD_BASE_STATS.evasion;
    this.evasion = Math.floor(
      baseEvasion * (templateMult.evasion || 1) * this.regionScale * this.stageScale,
    );

    // Attack Rating
    const baseAttackRating = ROCKY_FIELD_BASE_STATS.attackRating;
    this.attackRating = Math.floor(
      baseAttackRating * (templateMult.attackRating || 1) * this.regionScale * this.stageScale,
    );

    // Attack Speed (doesn't scale with tier/stage)
    this.attackSpeed = (templateMult.attackSpeed || 1) * (regionMult.attackSpeed || 1) * (1 - speedRed);

    // Elemental Resistances
    ELEMENT_IDS.forEach((elId) => {
      const resistKey = `${elId}Resistance`;
      const baseRes = ROCKY_FIELD_BASE_STATS[resistKey];
      this[resistKey] = Math.floor(
        baseRes * (templateMult[resistKey] || 1) * this.regionScale * this.stageScale,
      );
    });

    // Elemental Damages
    ELEMENT_IDS.forEach((elId) => {
      const dmgKey = `${elId}Damage`;
      const templateDmgMult = templateMult[dmgKey] || 0;
      if (templateDmgMult > 0) {
        this[dmgKey] = Math.floor(
          baseDamage * templateDmgMult * this.regionScale * this.stageScale * (1 - damageRed),
        );
      } else {
        this[dmgKey] = 0;
      }
    });

    // XP and Gold with diminishing returns
    const baseXp = ROCKY_FIELD_BASE_STATS.xp || 120;
    const baseGold = ROCKY_FIELD_BASE_STATS.gold || 140;

    const diminishing = xpDiminishingFactor(stage);
    const xpScaled = computeScaledReward(
      baseXp * (templateMult.xp || 1) * (regionMult.xp || 1) * this.regionScale,
      stage, 0.1, 1, diminishing,
    );
    const goldScaled = computeScaledReward(
      baseGold * (templateMult.gold || 1) * (regionMult.gold || 1) * this.regionScale,
      stage, 0.1, 1, diminishing,
    );

    this.xp = Math.floor(xpScaled);
    this.gold = Math.floor(goldScaled);

    // Initialize currentLife
    this.currentLife = this.life;
    this.lastAttack = Date.now();
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
