import { ROCKY_FIELD_ENEMIES } from './constants/enemies/rocky_field.js';
import { scaleStat } from './common.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';

export const ROCKY_FIELD_ZONES = [
  { id: 'outskirts', name: 'Outskirts', description: 'The edge of the rocky expanse.', unlockStage: 1 },
  { id: 'boulders', name: 'Boulder Basin', description: 'Boulders scatter this wide basin.', unlockStage: 500 },
  { id: 'caves', name: 'Hidden Caves', description: 'Dark caverns hide unseen threats.', unlockStage: 1000 },
  { id: 'cliffs', name: 'Sheer Cliffs', description: 'Treacherous cliffs tower above.', unlockStage: 2000 },
  { id: 'valley', name: 'Silent Valley', description: 'A quiet valley with lurking danger.', unlockStage: 4000 },
  { id: 'summit', name: 'Windy Summit', description: 'Blistering winds dominate the peak.', unlockStage: 5000 },
];

export function getRockyFieldEnemies(zoneId) {
  return ROCKY_FIELD_ENEMIES.filter((e) => e.zone === zoneId);
}

const ELEMENT_IDS = Object.keys(ELEMENTS);

export function getRockyFieldRunePercent() {
  return Math.floor(Math.random() * 80) + 1;
}

export class RockyFieldEnemy {
  constructor(zoneId, level) {
    this.zoneId = zoneId;
    this.level = level;

    const zoneEnemies = getRockyFieldEnemies(zoneId);
    const baseData = zoneEnemies[Math.floor(Math.random() * zoneEnemies.length)];
    if (!baseData) {
      throw new Error(`No enemies defined for zone "${zoneId}"`);
    }
    this.baseData = baseData;

    this.name = baseData.name;
    this.image = baseData.image;
    this.special = baseData.special || [];
    this.runeDrop = baseData.runeDrop || [];

    const stats = baseData.baseStats || {};

    this.attackSpeed = stats.attackSpeed || 1;
    this.life = scaleStat(stats.life || 0, level);
    this.damage = scaleStat(stats.damage || 0, level);
    this.armor = scaleStat(stats.armor || 0, level);
    this.evasion = scaleStat(stats.evasion || 0, level);
    this.attackRating = scaleStat(stats.attackRating || 0, level);
    this.xp = scaleStat(stats.xp || 0, level);
    this.gold = scaleStat(stats.gold || 0, level);

    ELEMENT_IDS.forEach((id) => {
      this[`${id}Damage`] = scaleStat(stats[`${id}Damage`] || 0, level);
      this[`${id}Resistance`] = scaleStat(stats[`${id}Resistance`] || 0, level);
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
  zones: ROCKY_FIELD_ZONES,
  getEnemies: getRockyFieldEnemies,
};
