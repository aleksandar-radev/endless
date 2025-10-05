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

export function formatSeparatedStat(labelText, segments) {
  const separator = '<span class="stage-separator breakable-separator">|||</span>';
  const formattedSegments = segments
    .map((segment) => `<span class="stage-value">${segment}</span>`)
    .join(separator);
  return `${labelText} ${formattedSegments}`;
}

function renderSeparatedStat(element, labelText, segments) {
  if (!element) return;
  element.innerHTML = formatSeparatedStat(labelText, segments);
}

export function buildStatisticsDisplayEntries(source = {}) {
  const stats = source || {};

  const clampSeconds = (value) => {
    const numericValue = Number(value);
    const seconds = Number.isFinite(numericValue) ? Math.floor(Math.max(0, numericValue)) : 0;
    return seconds;
  };

  const totalTimePlayedSeconds = clampSeconds(stats.totalTimePlayed);
  const totalTimePlayedHours = Math.floor(totalTimePlayedSeconds / 3600);
  const totalTimePlayedMinutes = Math.floor((totalTimePlayedSeconds % 3600) / 60);

  const totalTimeInFightsSeconds = clampSeconds(stats.totalTimeInFights);
  const totalTimeInFightsHours = Math.floor(totalTimeInFightsSeconds / 3600);
  const totalTimeInFightsMinutes = Math.floor((totalTimeInFightsSeconds % 3600) / 60);

  const highestStages = stats.highestStages || {};
  const enemiesKilledByZone = stats.enemiesKilledByZone || {};
  const itemsFound = stats.itemsFound || {};
  const enemiesKilled = stats.enemiesKilled || {};
  const rockyFieldHighestStages = stats.rockyFieldHighestStages || {};
  const rockyFieldEnemiesKilledByRegion = stats.rockyFieldEnemiesKilledByRegion || {};

  const highestStageSegments = Array.from({ length: 12 }, (_, idx) => {
    const tier = idx + 1;
    const value = formatNumber(highestStages[tier] || 0);
    return `${t('statistics.tierAbbr')}${tier}: ${value}`;
  });

  const enemiesByZoneSegments = Array.from({ length: 12 }, (_, idx) => {
    const tier = idx + 1;
    const value = formatNumber(enemiesKilledByZone[tier] || 0);
    return `${t('statistics.tierAbbr')}${tier}: ${value}`;
  });

  const rockyFieldHighestSegments = ROCKY_FIELD_REGIONS.map((region) => {
    const value = formatNumber(rockyFieldHighestStages?.[region.id] || 0);
    return `${region.name}: ${value}`;
  });

  const rockyFieldEnemiesSegments = ROCKY_FIELD_REGIONS.map((region) => {
    const value = formatNumber(rockyFieldEnemiesKilledByRegion?.[region.id] || 0);
    return `${region.name}: ${value}`;
  });

  const rarityOrderItems = ['normal', 'magic', 'rare', 'epic', 'legendary', 'mythic'];
  const itemsByRaritySegments = rarityOrderItems.map((rarity) => {
    const value = formatNumber(itemsFound?.[rarity] || 0);
    return `${formatStatName(rarity)}: ${value}`;
  });

  const rarityOrderEnemies = ['normal', 'rare', 'epic', 'legendary', 'mythic'];
  const enemiesByRaritySegments = rarityOrderEnemies.map((rarity) => {
    const value = formatNumber(enemiesKilled?.[rarity] || 0);
    return `${formatStatName(rarity)}: ${value}`;
  });

  return [
    {
      id: 'stat-total-time-played',
      type: 'text',
      text: tp('statistics.totalTimePlayed', {
        hours: totalTimePlayedHours,
        minutes: totalTimePlayedMinutes,
      }),
    },
    {
      id: 'stat-total-time-in-fights',
      type: 'text',
      text: tp('statistics.totalTimeInFights', {
        hours: totalTimeInFightsHours,
        minutes: totalTimeInFightsMinutes,
        seconds: totalTimeInFightsSeconds % 60,
      }),
    },
    {
      id: 'stat-hero-level',
      type: 'text',
      text: tp('statistics.heroLevel', { value: formatNumber(stats.heroLevel || 0) }),
    },
    {
      id: 'stat-total-gold',
      type: 'text',
      text: tp('statistics.totalGoldEarned', { value: formatNumber(stats.totalGoldEarned || 0) }),
    },
    {
      id: 'stat-total-crystals',
      type: 'text',
      text: tp('statistics.totalCrystalsEarned', {
        value: formatNumber(stats.totalCrystalsEarned || 0),
      }),
    },
    {
      id: 'stat-total-souls',
      type: 'text',
      text: tp('statistics.totalSoulsEarned', { value: formatNumber(stats.totalSoulsEarned || 0) }),
    },
    {
      id: 'stat-total-items-found',
      type: 'text',
      text: tp('statistics.totalItemsFound', { value: formatNumber(stats.totalItemsFound || 0) }),
    },
    {
      id: 'stat-items-found-by-rarity',
      type: 'segments',
      label: t('statistics.itemsFoundByRarity'),
      segments: itemsByRaritySegments,
    },
    {
      id: 'stat-total-materials-found',
      type: 'text',
      text: tp('statistics.totalMaterialsFound', {
        value: formatNumber(stats.totalMaterialsFound || 0),
      }),
    },
    {
      id: 'stat-highest-stage',
      type: 'segments',
      label: t('statistics.highestStages'),
      segments: highestStageSegments,
    },
    {
      id: 'stat-rocky-field-highest-stages',
      type: 'segments',
      label: t('statistics.rockyFieldHighestStages'),
      segments: rockyFieldHighestSegments,
    },
    {
      id: 'stat-total-enemies-killed',
      type: 'text',
      text: tp('statistics.totalEnemiesKilled', {
        value: formatNumber(stats.totalEnemiesKilled || 0),
      }),
    },
    {
      id: 'stat-enemies-killed-by-region',
      type: 'segments',
      label: t('statistics.enemiesKilledByZone'),
      segments: enemiesByZoneSegments,
    },
    {
      id: 'stat-rocky-field-enemies-killed-by-region',
      type: 'segments',
      label: t('statistics.rockyFieldEnemiesKilledByRegion'),
      segments: rockyFieldEnemiesSegments,
    },
    {
      id: 'stat-enemies-killed-by-rarity',
      type: 'segments',
      label: t('statistics.enemiesKilledByRarity'),
      segments: enemiesByRaritySegments,
    },
    {
      id: 'stat-highest-boss-level',
      type: 'text',
      text: tp('statistics.highestBossLevel', {
        value: formatNumber(stats.highestBossLevel || 0),
      }),
    },
    {
      id: 'stat-bosses-killed',
      type: 'text',
      text: tp('statistics.bossesDefeated', { value: formatNumber(stats.bossesKilled || 0) }),
    },
    {
      id: 'stat-deaths',
      type: 'text',
      text: tp('statistics.deaths', { value: formatNumber(stats.deaths || 0) }),
    },
    {
      id: 'stat-highest-damage',
      type: 'text',
      text: tp('statistics.highestDamageDealt', {
        value: formatNumber(Math.floor(stats.highestDamageDealt || 0)),
      }),
    },
  ];
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
    const entries = buildStatisticsDisplayEntries(this);
    entries.forEach((entry) => {
      const element = document.getElementById(entry.id);
      if (!element) return;
      if (entry.type === 'segments') {
        renderSeparatedStat(element, entry.label, entry.segments);
      } else {
        element.textContent = entry.text;
      }
    });
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
