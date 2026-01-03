
import { ACHIEVEMENT_DEFINITIONS } from './constants/achievements.js';
import { hero, statistics } from './globals.js';
import { showToast } from './ui/ui.js';

export class Achievement {
  constructor(def, claimed = false, reached = false) {
    Object.defineProperties(this, Object.getOwnPropertyDescriptors(def));
    this.claimed = claimed;
    this.reached = reached || claimed; // if claimed, it must have been reached
  }

  // Progress is computed dynamically from statistics
  getProgress() {
    if (this.type === 'event') {
      return this.completed ? 1 : 0;
    }

    if (this.type === 'kill') {
      return Math.min(statistics.totalEnemiesKilled, this.target);
    }
    if (this.type === 'resource' && this.resource) {
      if (this.resource === 'totalGoldEarned') {
        return Math.min(statistics.totalGoldEarned, this.target);
      }
      if (this.resource === 'totalCrystalsEarned') {
        return Math.min(statistics.totalCrystalsEarned, this.target);
      }
    }
    if (this.type === 'level') {
      return Math.min(hero.level, this.target);
    }
    if (this.type === 'stage') {
      if (this.tier) {
        // Specific tier check
        return Math.min(statistics.highestStages?.[this.tier] || 0, this.target);
      }
      // Sum of all stages if no tier specified (or default behavior)
      let totalStages = 0;
      for (let t = 1; t <= 12; t++) {
        totalStages += statistics.highestStages?.[t] || 0;
      }
      return Math.min(totalStages, this.target);
    }
    if (this.type === 'damage') {
      return Math.min(statistics.highestDamageDealt, this.target);
    }
    return 0;
  }

  isComplete() {
    if (this.reached || this.claimed) return true;
    if (this.type === 'event') return this.completed;

    const progress = this.getProgress();
    if (progress >= this.target) {
      this.reached = true;
      return true;
    }
    return false;
  }

  complete() {
    if (this.completed) return;
    this.completed = true;
    this.reached = true;
    showToast(`Achievement Completed: "${this.title}"!`, 'info');
  }

  claim() {
    if (!this.isComplete() || this.claimed) return null;
    this.claimed = true;
    this.reached = true;

    hero.queueRecalculateFromAttributes();

    showToast(`Achievement Unlocked: "${this.title}"!`, 'success');

    return this.reward;
  }

  toJSON() {
    return {
      claimed: this.claimed, completed: this.completed, reached: this.reached,
    };
  }

  static fromJSON(def, data = {}) {
    const ach = new Achievement(def, data.claimed || false, data.reached || false);
    ach.completed = data.completed || data.claimed || false;
    return ach;
  }
}

export default class AchievementTracker {
  constructor(savedData = null) {
    this.achievements = ACHIEVEMENT_DEFINITIONS.map((def) => Achievement.fromJSON(def, savedData?.[def.id]));
  }

  claim(id) {
    const ach = this.achievements.find((a) => a.id === id);
    return ach ? ach.claim() : null;
  }

  checkForCompletion() {
    this.achievements.forEach((ach) => ach.isComplete());
  }

  trigger(eventType, data) {
    this.achievements.forEach((ach) => {
      if (ach.type === 'event' && ach.eventType === eventType && !ach.completed && !ach.claimed) {
        if (ach.condition && ach.condition(data)) {
          ach.complete();
        }
      }
    });
  }

  getBonuses() {
    const bonuses = {};
    this.achievements.forEach((ach) => {
      if (ach.claimed && ach.reward.bonuses) {
        Object.entries(ach.reward.bonuses).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }
    });
    return bonuses;
  }

  getScore() {
    return this.achievements.filter((a) => a.claimed).length;
  }

  getGlobalBonusPercent() {
    return 0;
  }

  toJSON() {
    const data = {};
    this.achievements.forEach((a) => {
      data[a.id] = a.toJSON();
    });
    return data;
  }
}
