import { dataManager, game, hero, statistics } from './globals.js';
import { BOSS_REGIONS } from './constants/bossRegions.js';

export function getBossRegions() {
  return BOSS_REGIONS;
}

function getHighestBossLevel(currentHero = hero, currentStatistics = statistics) {
  const statGetterValue =
    typeof currentStatistics?.get === 'function' ? currentStatistics.get('highestBossLevel') : undefined;
  if (Number.isFinite(statGetterValue)) {
    return statGetterValue;
  }

  const directValue = currentStatistics?.highestBossLevel;
  if (Number.isFinite(directValue)) {
    return directValue;
  }

  const heroBossLevel = currentHero?.bossLevel;
  return Number.isFinite(heroBossLevel) ? heroBossLevel : 0;
}

function isRegionUnlocked(region, currentHero = hero, currentStatistics = statistics) {
  const heroLevel = Number.isFinite(currentHero?.level) ? currentHero.level : 0;
  const highestBossLevel = getHighestBossLevel(currentHero, currentStatistics);
  const unlockHeroLevel = Number.isFinite(region.unlockLevel) ? region.unlockLevel : 1;
  const unlockBossLevel = Number.isFinite(region.unlockBossLevel) ? region.unlockBossLevel : 0;

  return heroLevel >= unlockHeroLevel && highestBossLevel >= unlockBossLevel;
}

export function getCurrentBossRegion() {
  if (!game.currentBossRegionId) {
    game.currentBossRegionId = BOSS_REGIONS[0].id;
  }
  return BOSS_REGIONS.find((region) => region.id === game.currentBossRegionId) || BOSS_REGIONS[0];
}

export function setCurrentBossRegion(regionId) {
  if (regionId === game.currentBossRegionId) {
    return false;
  }
  game.currentBossRegionId = regionId;
  dataManager?.saveGame?.();
  return true;
}

export function getUnlockedBossRegions(currentHero = hero, currentStatistics = statistics) {
  return BOSS_REGIONS.filter((region) => isRegionUnlocked(region, currentHero, currentStatistics));
}

export function getNextLockedBossRegion(currentHero = hero, currentStatistics = statistics) {
  return BOSS_REGIONS.find((region) => !isRegionUnlocked(region, currentHero, currentStatistics));
}
