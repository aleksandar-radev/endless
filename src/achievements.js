import { ACHIEVEMENT_DEFINITIONS } from './constants/achievements.js';
import { hero, statistics } from './globals.js';
import { showToast } from './ui/ui.js';
import { t, tp } from './i18n.js';

export class Achievement {
  constructor(def, data = {}) {
    Object.defineProperties(this, Object.getOwnPropertyDescriptors(def));
    this.level = data.level || 1;
    this.claimed = data.claimed || false;
    this.reached = data.reached || false;
    this.activeReward = data.activeReward || null;
    this.currentValue = data.currentValue || 0; // For event-based counters

    // Legacy migration
    if (this.type === 'event' && (data.completed || data.claimed) && !this.currentValue) {
      this.currentValue = this.target || 1;
      this.reached = true;
    }

    this.updateScaling();
  }

  updateScaling() {
    // If no scaling config, standard behavior
    if (!this.baseTarget && !this.targetMultiplier) {
      return;
    }

    // Scaling Targets
    if (this.baseTarget) {
      const mult = this.targetMultiplier || 1;
      this.target = Math.floor(this.baseTarget * Math.pow(mult, this.level - 1));
    }

    // Scaling Rewards
    if (this.baseReward) {
      const newReward = JSON.parse(JSON.stringify(this.baseReward));

      if (newReward.bonuses) {
        for (const key in newReward.bonuses) {
          const baseVal = newReward.bonuses[key];
          let newVal = baseVal;

          if (this.rewardScaleType === 'recursive_tier') {
            let factorial = 1;
            for(let i = 1; i <= this.level; i++) factorial *= i;
            newVal = baseVal * factorial;
          } else if (this.rewardMultiplier) {
            newVal = baseVal * Math.pow(this.rewardMultiplier, this.level - 1);
          }

          newReward.bonuses[key] = newVal;
        }
      }
      this.reward = newReward;
    }
  }

  getProgress() {
    if (this.type === 'event') {
      return this.currentValue;
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
        return Math.min(statistics.highestStages?.[this.tier] || 0, this.target);
      }
      let totalStages = 0;
      for (let t = 1; t <= 12; t++) {
        totalStages += statistics.highestStages?.[t] || 0;
      }
      return Math.min(totalStages, this.target);
    }
    if (this.type === 'damage') {
      return Math.min(statistics.highestDamageDealt, this.target);
    }
    if (this.type === 'survival') {
      return Math.min(statistics.highestDamageTakenSurvived || 0, this.target);
    }
    return 0;
  }

  isComplete() {
    if (this.claimed && (!this.targetMultiplier || (this.maxLevel && this.level >= this.maxLevel))) return true;

    if (this.reached) return true;

    const progress = this.getProgress();
    if (progress >= this.target) {
      this.reached = true;
      return true;
    }
    return false;
  }

  complete() {
    // Used for one-off completions mainly, but 'reached' is calculated dynamically now for most
    if (this.reached) return;
    this.reached = true;
    showToast(tp('achievements.toast.completed', { title: t(this.title) }), 'info');
  }

  claim() {
    if (!this.isComplete()) return null;

    // Check if already maxed
    if (this.maxLevel && this.level >= this.maxLevel && this.claimed) return null;
    if (this.claimed && !this.targetMultiplier) return null;

    // Apply Reward
    this.activeReward = this.reward;

    // Handle Scaling / Level Up
    if (this.targetMultiplier || this.baseTarget) {
      this.claimed = true; // Mark current level as claimed

      // If not at max level, proceed to next
      if (!this.maxLevel || this.level < this.maxLevel) {
        this.level++;
        this.reached = false;
        this.claimed = false; // Reset claimed for new level
        this.updateScaling();

        // Auto-check if next level is already met (e.g. high level player)
        if (this.getProgress() >= this.target) {
          this.reached = true;
        }
        showToast(tp('achievements.toast.upgraded', { level: this.level }), 'success');
      } else {
        showToast(tp('achievements.toast.maxed', { title: t(this.title) }), 'success');
      }
    } else {
      this.claimed = true;
      showToast(tp('achievements.toast.unlocked', { title: t(this.title) }), 'success');
    }

    hero.queueRecalculateFromAttributes();
    return this.activeReward;
  }

  toJSON() {
    return {
      claimed: this.claimed,
      completed: this.completed, // Legacy
      reached: this.reached,
      level: this.level,
      activeReward: this.activeReward,
      currentValue: this.currentValue,
    };
  }

  static fromJSON(def, data = {}) {
    return new Achievement(def, data);
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
      if (ach.type === 'event' && ach.eventType === eventType) {
        // If already maxed, no need to track
        if (ach.maxLevel && ach.level >= ach.maxLevel && ach.claimed) return;

        if (ach.condition && ach.condition(data)) {
          ach.currentValue++;
          if (ach.currentValue >= ach.target && !ach.reached) {
            ach.complete();
          }
        }
      }
    });
  }

  getBonuses() {
    const bonuses = {};
    this.achievements.forEach((ach) => {
      const rewardToUse = ach.activeReward || (ach.claimed ? ach.reward : null);

      if (rewardToUse && rewardToUse.bonuses) {
        Object.entries(rewardToUse.bonuses).forEach(([stat, value]) => {
          bonuses[stat] = (bonuses[stat] || 0) + value;
        });
      }
    });
    return bonuses;
  }

  getScore() {
    return this.achievements.reduce((acc, ach) => {
      // Only count if fully maxed/completed
      // For scaling achievements, they are only "done" when the final level is claimed.
      if (ach.targetMultiplier || ach.baseTarget) {
        // Scaling achievement
        if (ach.maxLevel && ach.level >= ach.maxLevel && ach.claimed) {
          return acc + 1;
        }
        return acc;
      }

      // Single achievement
      if (ach.claimed) return acc + 1;

      return acc;
    }, 0);
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