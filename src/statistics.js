import { handleSavedData } from './functions.js';
import { formatNumber, formatStatName } from './ui/ui.js';
import { t, tp } from './i18n.js';
import { ROCKY_FIELD_REGIONS } from './rockyField.js';

const ROCKY_FIELD_REGION_IDS = ROCKY_FIELD_REGIONS.map((region) => region.id);

function createRockyFieldRegionMap(source = {}) {
  const result = {};
  ROCKY_FIELD_REGION_IDS.forEach((regionId) => {
    result[regionId] = source?.[regionId] ?? 0;
  });
  return result;
}

function renderSeparatedStat(element, labelText, segments) {
  if (!element) return;
  element.textContent = `${labelText} `;
  segments.forEach((segment, index) => {
    const valueNode = document.createElement('span');
    valueNode.className = 'stage-value';
    valueNode.textContent = segment;
    element.appendChild(valueNode);

    if (index < segments.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'stage-separator breakable-separator';
      separator.textContent = '|||';
      element.appendChild(separator);
    }
  });
}

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
    this.rockyFieldHighestStages = createRockyFieldRegionMap();
    this.rockyFieldEnemiesKilledByRegion = createRockyFieldRegionMap();
    this.offlineRates = { xp: 0, gold: 0, items: 0, materials: 0 };
    this.lastFightActive = Date.now();

    handleSavedData(savedData, this);
    if (typeof this.rockyFieldHighestStage === 'number') {
      this.rockyFieldHighestStages.outskirts = Math.max(
        this.rockyFieldHighestStages.outskirts || 0,
        this.rockyFieldHighestStage,
      );
      delete this.rockyFieldHighestStage;
    }
    this.rockyFieldHighestStages = createRockyFieldRegionMap(this.rockyFieldHighestStages);

    if (typeof this.rockyFieldEnemiesKilled === 'number') {
      this.rockyFieldEnemiesKilledByRegion.outskirts =
        (this.rockyFieldEnemiesKilledByRegion.outskirts || 0) + this.rockyFieldEnemiesKilled;
      delete this.rockyFieldEnemiesKilled;
    }
    this.rockyFieldEnemiesKilledByRegion = createRockyFieldRegionMap(this.rockyFieldEnemiesKilledByRegion);

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
    this.rockyFieldHighestStages = createRockyFieldRegionMap();
    this.rockyFieldEnemiesKilledByRegion = createRockyFieldRegionMap();
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
          <div class="stats-group" id="stats-group-progression">
            <div class="stat-entry" id="stat-total-time-played"></div>
            <div class="stat-entry" id="stat-total-time-in-fights"></div>
            <div class="stat-entry" id="stat-hero-level"></div>
            <div class="stat-entry" id="stat-total-gold"></div>
            <div class="stat-entry" id="stat-total-crystals"></div>
            <div class="stat-entry" id="stat-total-souls"></div>
            <div class="stat-entry" id="stat-total-items-found"></div>
            <div class="stat-entry" id="stat-items-found-by-rarity"></div>
            <div class="stat-entry" id="stat-total-materials-found"></div>
          </div>
          <div class="stats-group" id="stats-group-combat">
            <div class="stat-entry" id="stat-highest-stage"></div>
            <div class="stat-entry" id="stat-rocky-field-highest-stages"></div>
            <div class="stat-entry" id="stat-total-enemies-killed"></div>
            <div class="stat-entry" id="stat-enemies-killed-by-region"></div>
            <div class="stat-entry" id="stat-rocky-field-enemies-killed-by-region"></div>
            <div class="stat-entry" id="stat-enemies-killed-by-rarity"></div>
            <div class="stat-entry" id="stat-highest-boss-level"></div>
            <div class="stat-entry" id="stat-bosses-killed"></div>
            <div class="stat-entry" id="stat-deaths"></div>
            <div class="stat-entry" id="stat-highest-damage"></div>
          </div>
        </div>
    `;
    statisticsTab.appendChild(container);
    this.updateStatisticsUI();
  }

  updateStatisticsUI() {
    const totalTime = document.getElementById('stat-total-time-played');
    if (totalTime) {
      const seconds = Math.floor(this.totalTimePlayed);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      totalTime.textContent = tp('statistics.totalTimePlayed', { hours, minutes });
    }

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

    const heroLevelElem = document.getElementById('stat-hero-level');
    if (heroLevelElem) {
      heroLevelElem.textContent = tp('statistics.heroLevel', { value: formatNumber(this.heroLevel || 0) });
    }

    const totalGold = document.getElementById('stat-total-gold');
    if (totalGold) {
      totalGold.textContent = tp('statistics.totalGoldEarned', { value: formatNumber(this.totalGoldEarned || 0) });
    }

    const totalCrystals = document.getElementById('stat-total-crystals');
    if (totalCrystals) {
      totalCrystals.textContent = tp('statistics.totalCrystalsEarned', {
        value: formatNumber(this.totalCrystalsEarned || 0),
      });
    }

    const totalSouls = document.getElementById('stat-total-souls');
    if (totalSouls) {
      totalSouls.textContent = tp('statistics.totalSoulsEarned', { value: formatNumber(this.totalSoulsEarned || 0) });
    }

    const itemsFound = document.getElementById('stat-total-items-found');
    if (itemsFound) {
      itemsFound.textContent = tp('statistics.totalItemsFound', { value: formatNumber(this.totalItemsFound || 0) });
    }

    const itemsByRarity = document.getElementById('stat-items-found-by-rarity');
    if (itemsByRarity) {
      const segments = Object.entries(this.itemsFound).map(
        ([rarity, count]) => `${formatStatName(rarity)}: ${formatNumber(count || 0)}`,
      );
      renderSeparatedStat(itemsByRarity, t('statistics.itemsFoundByRarity'), segments);
    }

    const materialsFound = document.getElementById('stat-total-materials-found');
    if (materialsFound) {
      materialsFound.textContent = tp('statistics.totalMaterialsFound', {
        value: formatNumber(this.totalMaterialsFound || 0),
      });
    }

    const highestStageElem = document.getElementById('stat-highest-stage');
    if (highestStageElem) {
      const segments = Array.from({ length: 12 }, (_, idx) => {
        const tier = idx + 1;
        return `${t('statistics.tierAbbr')}${tier}: ${formatNumber(this.highestStages[tier] || 0)}`;
      });
      renderSeparatedStat(highestStageElem, t('statistics.highestStages'), segments);
    }

    const rockyFieldHighestStagesElem = document.getElementById('stat-rocky-field-highest-stages');
    if (rockyFieldHighestStagesElem) {
      const segments = ROCKY_FIELD_REGIONS.map((region) => {
        const stage = this.rockyFieldHighestStages?.[region.id] || 0;
        return `${region.name}: ${formatNumber(stage)}`;
      });
      renderSeparatedStat(rockyFieldHighestStagesElem, t('statistics.rockyFieldHighestStages'), segments);
    }

    const totalEnemies = document.getElementById('stat-total-enemies-killed');
    if (totalEnemies) {
      totalEnemies.textContent = tp('statistics.totalEnemiesKilled', {
        value: formatNumber(this.totalEnemiesKilled || 0),
      });
    }

    const enemiesByRegionElem = document.getElementById('stat-enemies-killed-by-region');
    if (enemiesByRegionElem) {
      const segments = Array.from({ length: 12 }, (_, idx) => {
        const tier = idx + 1;
        return `${t('statistics.tierAbbr')}${tier}: ${formatNumber(this.enemiesKilledByZone[tier] || 0)}`;
      });
      renderSeparatedStat(enemiesByRegionElem, t('statistics.enemiesKilledByZone'), segments);
    }

    const rockyFieldEnemiesKilledElem = document.getElementById('stat-rocky-field-enemies-killed-by-region');
    if (rockyFieldEnemiesKilledElem) {
      const segments = ROCKY_FIELD_REGIONS.map((region) => {
        const kills = this.rockyFieldEnemiesKilledByRegion?.[region.id] || 0;
        return `${region.name}: ${formatNumber(kills)}`;
      });
      renderSeparatedStat(rockyFieldEnemiesKilledElem, t('statistics.rockyFieldEnemiesKilledByRegion'), segments);
    }

    const enemiesByRarity = document.getElementById('stat-enemies-killed-by-rarity');
    if (enemiesByRarity) {
      const segments = Object.entries(this.enemiesKilled).map(
        ([rarity, count]) => `${formatStatName(rarity)}: ${formatNumber(count || 0)}`,
      );
      renderSeparatedStat(enemiesByRarity, t('statistics.enemiesKilledByRarity'), segments);
    }

    const highestBossLevelElem = document.getElementById('stat-highest-boss-level');
    if (highestBossLevelElem) {
      highestBossLevelElem.textContent = tp('statistics.highestBossLevel', {
        value: formatNumber(this.highestBossLevel || 0),
      });
    }

    const bossesKilledElem = document.getElementById('stat-bosses-killed');
    if (bossesKilledElem) {
      bossesKilledElem.textContent = tp('statistics.bossesDefeated', { value: formatNumber(this.bossesKilled) });
    }

    const deathsElem = document.getElementById('stat-deaths');
    if (deathsElem) {
      deathsElem.textContent = tp('statistics.deaths', { value: formatNumber(this.deaths || 0) });
    }

    const highestDamageElem = document.getElementById('stat-highest-damage');
    if (highestDamageElem) {
      highestDamageElem.textContent = tp('statistics.highestDamageDealt', {
        value: formatNumber(Math.floor(this.highestDamageDealt) || 0),
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
