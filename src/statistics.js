import { handleSavedData } from './functions.js';

/**
 * @class Statistics
 * Handles game statistics tracking and UI updates.
 */
export default class Statistics {
  constructor(savedData = null) {
    this.bossesKilled = 0;
    this.enemiesKilled = {
      total: 0,
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalCrystalsEarned = 0;
    this.totalSoulsEarned = 0;
    this.totalItemsFound = 0;
    this.totalMaterialsFound = 0;
    this.totalTimePlayed = 0;
    this.highestStageReached = 0;
    this.totalTimeInFights = 0;

    handleSavedData(savedData, this);
    this.lastUpdate = Date.now();
  }

  resetStatistics() {
    this.bossesKilled = 0;
    this.enemiesKilled = {
      total: 0,
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalCrystalsEarned = 0;
    this.totalSoulsEarned = 0;
    this.totalItemsFound = 0;
    this.totalMaterialsFound = 0;
    this.totalTimePlayed = 0;
    this.highestStageReached = 0;
    this.totalTimeInFights = 0;
    this.updateStatisticsUI();
  }

  /**
   * Initialize statistics UI (no reset button logic here).
   */
  initializeStatisticsUI() {
    // Create statistics UI structure dynamically
    const statisticsTab = document.getElementById('statistics');
    if (!statisticsTab) return;
    statisticsTab.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'statistics-container';
    container.innerHTML = `
        <div class="stats-display">
          <div id="stat-total-time-played"></div>
          <div id="stat-total-time-in-fights"></div>
          <div id="stat-highest-stage"></div>
          <div id="stat-total-gold"></div>
          <div id="stat-total-crystals"></div>
          <div id="stat-total-souls"></div>
          <div id="stat-items-found"></div>
          <div id="stat-materials-found"></div>
          <div id="stat-enemies-killed"></div>
          <div id="stat-bosses-killed"></div>
          <div id="stat-highest-damage"></div>
        </div>
    `;
    statisticsTab.appendChild(container);
    this.updateStatisticsUI();
  }

  updateStatisticsUI() {
    // Bosses Killed
    const bossesKilledElem = document.getElementById('stat-bosses-killed');
    if (bossesKilledElem) {
      bossesKilledElem.textContent = `Bosses Defeated: ${this.bossesKilled}`;
    }

    // Total Time Played (resets on reset)
    const totalTime = document.getElementById('stat-total-time-played');
    if (totalTime) {
      const seconds = Math.floor(this.totalTimePlayed);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      totalTime.textContent = `Total Time Played: ${hours}h ${minutes}m`;
    }

    // Total Enemies Killed
    const enemiesKilled = document.getElementById('stat-enemies-killed');
    if (enemiesKilled) {
      enemiesKilled.textContent = `Total Enemies Killed: ${this.enemiesKilled.total || 0}`;
    }

    // Highest Damage Dealt
    const highestDamage = document.getElementById('stat-highest-damage');
    if (highestDamage) {
      highestDamage.textContent = `Highest Damage Dealt: ${Math.floor(this.highestDamageDealt) || 0}`;
    }

    // Total Gold Earned
    const totalGold = document.getElementById('stat-total-gold');
    if (totalGold) {
      totalGold.textContent = `Total Gold Earned: ${this.totalGoldEarned || 0}`;
    }

    // Total Crystals Earned
    const totalCrystals = document.getElementById('stat-total-crystals');
    if (totalCrystals) {
      totalCrystals.textContent = `Total Crystals Earned: ${this.totalCrystalsEarned || 0}`;
    }

    // Total Souls Earned
    const totalSouls = document.getElementById('stat-total-souls');
    if (totalSouls) {
      totalSouls.textContent = `Total Souls Earned: ${this.totalSoulsEarned || 0}`;
    }

    // Total Items Found
    const itemsFound = document.getElementById('stat-items-found');
    if (itemsFound) {
      itemsFound.textContent = `Total Items Found: ${this.totalItemsFound || 0}`;
    }

    // Total Materials Found
    const materialsFound = document.getElementById('stat-materials-found');
    if (materialsFound) {
      materialsFound.textContent = `Total Materials Found: ${this.totalMaterialsFound || 0}`;
    }

    // Highest Stage Reached
    const highestStage = document.getElementById('stat-highest-stage');
    if (highestStage) {
      highestStage.textContent = `Highest Stage Reached: ${this.highestStageReached || 1}`;
    }

    // Total Time In Fights
    const timeInFights = document.getElementById('stat-total-time-in-fights');
    if (timeInFights) {
      const seconds = Math.floor(this.totalTimeInFights);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      timeInFights.textContent = `Total Time In Fights: ${hours}h ${minutes}m ${seconds % 60}s`;
    }
  }

  increment(category, subcategory = null, amount = 1) {
    if (subcategory) {
      if (!this[category][subcategory]) {
        this[category][subcategory] = 0;
      }
      this[category][subcategory] += amount;
    } else {
      if (!this[category]) {
        this[category] = 0;
      }
      this[category] += amount;
    }
    this.updateStatisticsUI();
  }

  set(category, subcategory = null, value) {
    if (subcategory) {
      if (this[category]) {
        this[category][subcategory] = value;
      }
    } else {
      this[category] = value;
    }
    this.updateStatisticsUI();
  }

  update() {
    const now = Date.now();
    const deltaSeconds = (now - this.lastUpdate) / 1000;
    this.totalTimePlayed += deltaSeconds;
    this.lastUpdate = now;
    this.updateStatisticsUI();
  }

  // Add a method to increment totalTimeInFights
  addFightTime(seconds) {
    this.totalTimeInFights += seconds;
    this.updateStatisticsUI();
  }
}

// No changes needed in this file for the move; just ensure UI initialization targets the new tab if necessary.
