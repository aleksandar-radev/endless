import { handleSavedData } from './functions.js';
import { formatNumber, formatStatName } from './ui/ui.js';
import { t, tp } from './i18n.js';

/**
 * @class Statistics
 * Handles game statistics tracking and UI updates.
 */
export default class Statistics {
  constructor(savedData = null) {
    this.bossesKilled = 0;
    this.highestBossLevel = 0;
    this.totalEnemiesKilled = 0;
    this.enemiesKilled = {
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.itemsFound = {
      normal: 0,
      magic: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalGoldFromCombat = 0;
    this.totalExpFromCombat = 0;
    this.totalCrystalsEarned = 0;
    this.totalSoulsEarned = 0;
    this.totalItemsFound = 0;
    this.totalMaterialsFound = 0;
    this.totalMaterialsDropped = 0;
    this.totalTimePlayed = 0;
    this.highestStages = {};
    for (let i = 1; i <= 12; i++) this.highestStages[i] = 0;
    this.enemiesKilledByZone = {};
    for (let i = 1; i <= 12; i++) this.enemiesKilledByZone[i] = 0;
    this.totalTimeInFights = 0;
    this.deaths = 0;
    this.heroLevel = 1;
    this.offlineRates = { xp: 0, gold: 0, items: 0, materials: 0 };
    this.lastFightActive = Date.now();

    handleSavedData(savedData, this);
    if (this.enemiesKilled?.total != null) {
      this.totalEnemiesKilled = this.enemiesKilled.total;
      delete this.enemiesKilled.total;
    }
    this.lastUpdate = Date.now();
  }

  resetStatistics() {
    this.bossesKilled = 0;
    this.highestBossLevel = 0;
    this.totalEnemiesKilled = 0;
    this.enemiesKilled = {
      normal: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.itemsFound = {
      normal: 0,
      magic: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
      mythic: 0,
    };
    this.highestDamageDealt = 0;
    this.totalGoldEarned = 0;
    this.totalGoldFromCombat = 0;
    this.totalExpFromCombat = 0;
    this.totalCrystalsEarned = 0;
    this.totalSoulsEarned = 0;
    this.totalItemsFound = 0;
    this.totalMaterialsFound = 0;
    this.totalMaterialsDropped = 0;
    this.totalTimePlayed = 0;
    for (let i = 1; i <= 12; i++) this.highestStages[i] = 0;
    for (let i = 1; i <= 12; i++) this.enemiesKilledByZone[i] = 0;
    this.totalTimeInFights = 0;
    this.deaths = 0;
    this.heroLevel = 1;
    this.offlineRates = { xp: 0, gold: 0, items: 0, materials: 0 };
    this.lastFightActive = Date.now();
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
    container.className = 'statistics-container highest-stages-container';
    container.innerHTML = `
        <div class="stats-display">
          <div id="stat-total-time-played"></div>
          <div id="stat-total-time-in-fights"></div>
          <div id="stat-highest-stage"></div>
          <div id="stat-total-gold"></div>
          <div id="stat-total-crystals"></div>
          <div id="stat-total-souls"></div>
          <div id="stat-items-found"></div>
          <div id="stat-items-found-by-rarity"></div>
          <div id="stat-materials-found"></div>
          <div id="stat-total-enemies-killed"></div>
          <div id="stat-enemies-killed-by-rarity"></div>
          <div id="stat-enemies-killed-by-zone"></div>
          <div id="stat-highest-boss-level"></div>
          <div id="stat-hero-level"></div>
          <div id="stat-bosses-killed"></div>
          <div id="stat-deaths"></div>
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
      bossesKilledElem.textContent = tp('statistics.bossesDefeated', { value: formatNumber(this.bossesKilled) });
    }

    // Deaths
    const deathsElem = document.getElementById('stat-deaths');
    if (deathsElem) {
      deathsElem.textContent = tp('statistics.deaths', { value: formatNumber(this.deaths || 0) });
    }

    // Highest Boss Level Defeated
    const highestBossLevelElem = document.getElementById('stat-highest-boss-level');
    if (highestBossLevelElem) {
      highestBossLevelElem.textContent = tp('statistics.highestBossLevel', { value: formatNumber(this.highestBossLevel || 0) });
    }

    // Hero Level
    const heroLevelElem = document.getElementById('stat-hero-level');
    if (heroLevelElem) {
      heroLevelElem.textContent = tp('statistics.heroLevel', { value: formatNumber(this.heroLevel || 0) });
    }

    // Total Time Played (resets on reset)
    const totalTime = document.getElementById('stat-total-time-played');
    if (totalTime) {
      const seconds = Math.floor(this.totalTimePlayed);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      totalTime.textContent = tp('statistics.totalTimePlayed', { hours, minutes });
    }

    // Total Enemies Killed
    const totalEnemies = document.getElementById('stat-total-enemies-killed');
    if (totalEnemies) {
      totalEnemies.textContent = tp('statistics.totalEnemiesKilled', { value: formatNumber(this.totalEnemiesKilled || 0) });
    }

    // Enemies Killed by Rarity
    const enemiesByRarity = document.getElementById('stat-enemies-killed-by-rarity');
    if (enemiesByRarity) {
      const parts = [];
      const entries = Object.entries(this.enemiesKilled);
      entries.forEach(([rarity, count], idx) => {
        const span = document.createElement('span');
        span.className = 'stage-value';
        span.textContent = `${formatStatName(rarity)}: ${formatNumber(count || 0)}`;
        parts.push(span);
        if (idx < entries.length - 1) {
          const sep = document.createElement('span');
          sep.className = 'stage-separator breakable-separator';
          sep.textContent = '|||';
          parts.push(sep);
        }
      });
      enemiesByRarity.textContent = t('statistics.enemiesKilledByRarity') + ' ';
      parts.forEach((el) => enemiesByRarity.appendChild(el));
    }

    // Enemies Killed by Zone
    const enemiesByZone = document.getElementById('stat-enemies-killed-by-zone');
    if (enemiesByZone) {
      const parts = [];
      for (let i = 1; i <= 12; i++) {
        const span = document.createElement('span');
        span.className = 'stage-value';
        span.textContent = `${t('statistics.tierAbbr')}${i}: ${formatNumber(this.enemiesKilledByZone[i] || 0)}`;
        parts.push(span);
        if (i < 12) {
          const sep = document.createElement('span');
          sep.className = 'stage-separator breakable-separator';
          sep.textContent = '|||';
          parts.push(sep);
        }
      }
      enemiesByZone.textContent = t('statistics.enemiesKilledByZone') + ' ';
      parts.forEach((el) => enemiesByZone.appendChild(el));
    }

    // Highest Damage Dealt
    const highestDamage = document.getElementById('stat-highest-damage');
    if (highestDamage) {
      highestDamage.textContent = tp('statistics.highestDamageDealt', { value: formatNumber(Math.floor(this.highestDamageDealt) || 0) });
    }

    // Total Gold Earned
    const totalGold = document.getElementById('stat-total-gold');
    if (totalGold) {
      totalGold.textContent = tp('statistics.totalGoldEarned', { value: formatNumber(this.totalGoldEarned || 0) });
    }

    // Total Crystals Earned
    const totalCrystals = document.getElementById('stat-total-crystals');
    if (totalCrystals) {
      totalCrystals.textContent = tp('statistics.totalCrystalsEarned', { value: formatNumber(this.totalCrystalsEarned || 0) });
    }

    // Total Souls Earned
    const totalSouls = document.getElementById('stat-total-souls');
    if (totalSouls) {
      totalSouls.textContent = tp('statistics.totalSoulsEarned', { value: formatNumber(this.totalSoulsEarned || 0) });
    }

    // Total Items Found
    const itemsFound = document.getElementById('stat-items-found');
    if (itemsFound) {
      itemsFound.textContent = tp('statistics.totalItemsFound', { value: formatNumber(this.totalItemsFound || 0) });
    }

    // Items Found by Rarity
    const itemsByRarity = document.getElementById('stat-items-found-by-rarity');
    if (itemsByRarity) {
      const parts = [];
      const entries = Object.entries(this.itemsFound);
      entries.forEach(([rarity, count], idx) => {
        const span = document.createElement('span');
        span.className = 'stage-value';
        span.textContent = `${formatStatName(rarity)}: ${formatNumber(count || 0)}`;
        parts.push(span);
        if (idx < entries.length - 1) {
          const sep = document.createElement('span');
          sep.className = 'stage-separator breakable-separator';
          sep.textContent = '|||';
          parts.push(sep);
        }
      });
      itemsByRarity.textContent = t('statistics.itemsFoundByRarity') + ' ';
      parts.forEach((el) => itemsByRarity.appendChild(el));
    }

    // Total Materials Found
    const materialsFound = document.getElementById('stat-materials-found');
    if (materialsFound) {
      materialsFound.textContent = tp('statistics.totalMaterialsFound', { value: formatNumber(this.totalMaterialsFound || 0) });
    }

    // Highest Stages Reached
    const highestStage = document.getElementById('stat-highest-stage');
    if (highestStage) {
      const parts = [];
      for (let i = 1; i <= 12; i++) {
        const span = document.createElement('span');
        span.className = 'stage-value';
        span.textContent = `${t('statistics.tierAbbr')}${i}: ${formatNumber(this.highestStages[i] || 0)}`;
        parts.push(span);
        if (i < 12) {
          const sep = document.createElement('span');
          sep.className = 'stage-separator breakable-separator'; // add class for styling
          sep.textContent = '|||';
          parts.push(sep);
        }
      }
      highestStage.textContent = t('statistics.highestStages') + ' ';
      parts.forEach((el) => highestStage.appendChild(el));
    }

    // Total Time In Fights
    const timeInFights = document.getElementById('stat-total-time-in-fights');
    if (timeInFights) {
      const seconds = Math.floor(this.totalTimeInFights);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      timeInFights.textContent = tp('statistics.totalTimeInFights', {
        hours,
        minutes,
        seconds: seconds % 60,
      });
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

  // getter function
  get(category, subcategory = null) {
    if (subcategory) {
      return this[category] ? this[category][subcategory] : 0;
    }
    return this[category] || 0;
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
