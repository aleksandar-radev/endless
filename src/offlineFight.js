import { hero, inventory, statistics, game, dataManager } from './globals.js';
import { getTimeNow } from './common.js';
import { ITEM_TYPES } from './constants/items.js';
import { MATERIALS } from './constants/materials.js';
import { getCurrentRegion } from './region.js';
import { t } from './i18n.js';

function distributeMaterials(total) {
  const region = getCurrentRegion();
  const enemy = game.currentEnemy;
  const allowedExclusive = [...(enemy?.canDrop || []), ...(region.canDrop || [])];
  const mats = Object.values(MATERIALS)
    .filter((m) => m.dropChance > 0)
    .filter((m) => !m.exclusive || allowedExclusive.includes(m.id));
  const regionMultiplier = region.multiplier.materialDrop || 1;
  const enemyMultiplier = enemy?.baseData?.multiplier.materialDrop || 1;
  const multiplier = regionMultiplier * enemyMultiplier;
  const regionWeights = region.materialDropWeights || {};
  const enemyWeights = enemy?.baseData?.materialDropWeights || {};
  const weights = mats.map((m) => {
    const w = (regionWeights[m.id] || 0) + (enemyWeights[m.id] || 0);
    return m.dropChance * multiplier * (w > 0 ? w : 1);
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const counts = {};
  let allocated = 0;
  mats.forEach((m, idx) => {
    const count = Math.floor((weights[idx] / totalWeight) * total);
    if (count > 0) {
      counts[m.id] = count;
      allocated += count;
    }
  });
  let remaining = total - allocated;
  while (remaining > 0) {
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < mats.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        const id = mats[i].id;
        counts[id] = (counts[id] || 0) + 1;
        break;
      }
    }
    remaining--;
  }
  return counts;
}

export async function collectOfflineFightRewards() {
  const now = await getTimeNow();
  const last = statistics.lastFightActive || now;
  const elapsed = Math.floor((now - last) / 1000);
  // Allow future saves to update last combat timestamp
  dataManager.enableLastFightTime = true;
  if (elapsed < 60) {
    statistics.lastFightActive = now;
    dataManager.saveGame();
    return null;
  }
  const rates = statistics.offlineRates || {};
  const xp = Math.floor((rates.xp || 0) * elapsed);
  const gold = Math.floor((rates.gold || 0) * elapsed);
  const items = Math.floor((rates.items || 0) * elapsed);
  const matsQty = Math.floor((rates.materials || 0) * elapsed);
  if (xp <= 0 && gold <= 0 && items <= 0 && matsQty <= 0) {
    statistics.lastFightActive = now;
    dataManager.saveGame();
    return null;
  }

  let times = elapsed;
  let interval = 'sec';
  if (elapsed % 3600 === 0) {
    times = elapsed / 3600;
    interval = 'hour';
  } else if (elapsed % 60 === 0) {
    times = elapsed / 60;
    interval = 'min';
  }

  const bonuses = [];
  if (xp > 0)
    bonuses.push({ name: t('combat.fight'), type: 'XP', amount: xp, times, interval });
  if (gold > 0)
    bonuses.push({ name: t('combat.fight'), type: t('resource.gold.name'), amount: gold, times, interval });
  if (items > 0)
    bonuses.push({ name: t('combat.fight'), type: t('inventory.items'), amount: items, times, interval });
  if (matsQty > 0)
    bonuses.push({ name: t('combat.fight'), type: t('inventory.materials'), amount: matsQty, times, interval });

  const apply = async () => {
    if (xp > 0) hero.gainExp(xp);
    if (gold > 0) hero.gainGold(gold);
    const region = getCurrentRegion();
    const types = Object.values(ITEM_TYPES);
    const level = Math.max(1, Math.floor(game.stage));
    const maxItems = 100;
    const itemCount = Math.min(items, maxItems);
    for (let i = 0; i < itemCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const item = inventory.createItem(type, level, null, region.tier);
      inventory.addItemToInventory(item);
    }
    if (matsQty > 0) {
      const distrib = distributeMaterials(matsQty);
      for (const [id, qty] of Object.entries(distrib)) {
        inventory.addMaterial({ id, qty });
        statistics.increment('totalMaterialsDropped', null, qty);
      }
    }
    statistics.lastFightActive = await getTimeNow();
  };

  return { bonuses, apply };
}
