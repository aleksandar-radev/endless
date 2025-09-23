import { dataManager, game, hero } from './globals.js';
import { BOSS_REGIONS } from './constants/bossRegions.js';

export function getBossRegions() {
  return BOSS_REGIONS;
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

export function getUnlockedBossRegions(currentHero = hero) {
  const level = currentHero?.level || 0;
  return BOSS_REGIONS.filter((region) => level >= (region.unlockLevel || 1));
}

export function getNextLockedBossRegion(currentHero = hero) {
  const level = currentHero?.level || 0;
  return BOSS_REGIONS.find((region) => level < (region.unlockLevel || 1));
}
