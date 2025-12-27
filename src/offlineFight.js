import { hero, inventory, statistics, game, dataManager } from './globals.js';
import { getTimeNow } from './common.js';
import { ITEM_TYPES, ALL_ITEM_TYPES, ITEM_RARITY, RARITY_ORDER } from './constants/items.js';
import { getCurrentRegion } from './region.js';
import { t } from './i18n.js';
import { distributeMaterials } from './materialsUtil.js';
import { ENEMY_RARITY } from './constants/enemies.js';
import { MATERIALS } from './constants/materials.js';
import { rollSpecialItemDrop } from './uniqueItems.js';

export async function collectOfflineFightRewards() {
  const nowLocal = Date.now();
  const nowServer = await getTimeNow();
  const lastServer = statistics.lastFightActive || nowServer;
  const lastLocal = statistics.lastFightActiveLocal || nowLocal;
  let elapsed = Math.floor((nowServer - lastServer) / 1000);
  const fallbackElapsed = Math.floor((nowLocal - lastLocal) / 1000);
  // Allow future saves to update last combat timestamp
  dataManager.enableLastFightTime = true;
  if (!Number.isFinite(elapsed)) elapsed = 0;
  if (!Number.isFinite(fallbackElapsed) || fallbackElapsed < 0) {
    // Ignore invalid fallback calculations
  } else if (elapsed < fallbackElapsed) {
    elapsed = fallbackElapsed;
  }
  if (elapsed < 0) elapsed = 0;
  if (elapsed < 1) {
    statistics.lastFightActive = nowServer;
    statistics.lastFightActiveLocal = nowLocal;
    dataManager.saveGame();
    return null;
  }
  const rates = statistics.offlineRates || {};
  const xp = Math.floor((rates.xp || 0) * elapsed);
  const gold = Math.floor((rates.gold || 0) * elapsed);
  const items = Math.floor((rates.items || 0) * elapsed);
  const matsQty = Math.floor((rates.materials || 0) * elapsed);
  if (xp <= 0 && gold <= 0 && items <= 0 && matsQty <= 0) {
    statistics.lastFightActive = nowServer;
    statistics.lastFightActiveLocal = nowLocal;
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
  if (xp > 0) bonuses.push({
    name: t('combat.fight'), type: 'XP', amount: xp, times, interval,
  });
  if (gold > 0) bonuses.push({
    name: t('combat.fight'), type: t('resource.gold.name'), amount: gold, times, interval,
  });
  if (items > 0) bonuses.push({
    name: t('combat.fight'), type: t('inventory.items'), amount: items, times, interval,
  });
  if (matsQty > 0)
    bonuses.push({
      name: t('combat.fight'), type: t('inventory.materials'), amount: matsQty, times, interval,
    });

  const apply = async () => {
    if (xp > 0) hero.gainExp(xp);
    if (gold > 0) hero.gainGold(gold);
    const region = getCurrentRegion();
    const types = ALL_ITEM_TYPES;
    const level = Math.max(1, Math.floor(game.stage));
    const maxItems = 100;
    const itemCount = Math.min(items, maxItems);
    for (let i = 0; i < itemCount; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const specialDrop = rollSpecialItemDrop({
        tier: region.tier,
        level,
        preferredType: type,
      });
      const item = specialDrop?.item || inventory.createItem(type, level, null, region.tier);
      inventory.addItemToInventory(item);
    }
    // Salvage overflow offline items in aggregate if auto-salvage is configured; otherwise ignore
    const overflow = Math.max(0, items - itemCount);
    if (overflow > 0 && Array.isArray(inventory.autoSalvageRarities) && inventory.autoSalvageRarities.length > 0) {
      // Build rarity weights identical to inventory.generateRarity(), restricted to auto-salvage rarities
      const ENEMY_RARITY_ORDER = Object.keys(ENEMY_RARITY);
      const enemy = game.currentEnemy;
      const enemyRank = enemy?.rarity ? ENEMY_RARITY_ORDER.indexOf(enemy.rarity) : 0;
      const maxRank = ENEMY_RARITY_ORDER.length - 1;
      const boostFactor = maxRank > 0 ? enemyRank / maxRank : 0;
      const rarityBonus = hero.stats.itemRarityPercent || 0;

      const included = new Set(inventory.autoSalvageRarities);
      const rarityEntries = Object.entries(ITEM_RARITY)
        .filter(([key]) => included.has(ITEM_RARITY[key].name))
        .map(([key, config]) => {
          const rarityIndex = RARITY_ORDER.indexOf(config.name);
          const weight = config.chance * (1 + boostFactor * rarityIndex) * (1 + rarityBonus * rarityIndex);
          return {
            name: config.name, index: rarityIndex, weight,
          };
        });
      const weightSum = rarityEntries.reduce((s, e) => s + e.weight, 0);
      if (weightSum > 0 && rarityEntries.length) {
        // Allocate counts per rarity using floor + fractional ordering for remainders
        const rarityCounts = new Map();
        let allocated = 0;
        const fractional = [];
        for (const e of rarityEntries) {
          const exact = (e.weight / weightSum) * overflow;
          const base = Math.floor(exact);
          if (base > 0) {
            rarityCounts.set(e.name, base);
            allocated += base;
          }
          const fraction = exact - base;
          if (fraction > 0) {
            fractional.push({
              entry: e, fraction, jitter: Math.random(),
            });
          }
        }
        let rem = overflow - allocated;
        if (rem > 0 && fractional.length > 0) {
          fractional.sort((a, b) => b.fraction - a.fraction || a.jitter - b.jitter);
          const assignCount = Math.min(rem, fractional.length);
          for (let i = 0; i < assignCount; i++) {
            const { entry } = fractional[i];
            rarityCounts.set(entry.name, (rarityCounts.get(entry.name) || 0) + 1);
          }
          rem -= assignCount;
        }
        // Fallback for any residual due to floating point drift (bounded by available rarities)
        if (rem > 0) {
          const fallback = Math.min(rem, rarityEntries.length);
          for (let i = 0; i < fallback; i++) {
            const pick = rarityEntries[Math.floor(Math.random() * rarityEntries.length)];
            if (!pick) break;
            rarityCounts.set(pick.name, (rarityCounts.get(pick.name) || 0) + 1);
          }
        }

        // Aggregate salvage outputs
        let totalGold = 0;
        let crystals = 0;
        const matsAgg = {
          [MATERIALS.armor_upgrade_stone.id]: 0,
          [MATERIALS.weapon_upgrade_core.id]: 0,
          [MATERIALS.jewelry_upgrade_gem.id]: 0,
        };
        const armorTypes = ITEM_TYPES.armor.items.length;
        const weaponTypes = ITEM_TYPES.weapon.items.length;
        const jewelryTypes = ITEM_TYPES.jewelry.items.length;
        const totalTypes = armorTypes + weaponTypes + jewelryTypes;

        for (const [rarityName, count] of rarityCounts.entries()) {
          if (rarityName === ITEM_RARITY.MYTHIC.name) crystals += count;
          if (count <= 0) continue;

          if (!inventory.salvageUpgradeMaterials) {
            // Gold salvage per item for this rarity
            const rarityIndex = Math.max(0, RARITY_ORDER.indexOf(rarityName));
            const goldPer = Math.floor(25 * level * Math.max(rarityIndex / 2 + 1, 1) * Math.max(region.tier * 3, 1));
            totalGold += goldPer * count;
          } else {
            // Materials salvage: split by category proportions and apply qty formula per item
            const rarityAmounts = {
              NORMAL: 1, MAGIC: 1.5, RARE: 2, EPIC: 2.5, LEGENDARY: 3, MYTHIC: 3.5,
            };
            const qtyPer = Math.floor(
              (rarityAmounts[rarityName] || 1) * Math.max(level / 200, 1) * Math.max(region.tier, 1),
            );
            if (qtyPer > 0) {
              const armorCount = Math.floor((armorTypes / totalTypes) * count);
              const weaponCount = Math.floor((weaponTypes / totalTypes) * count);
              const jewelryCount = Math.max(0, count - armorCount - weaponCount);
              matsAgg[MATERIALS.armor_upgrade_stone.id] += armorCount * qtyPer;
              matsAgg[MATERIALS.weapon_upgrade_core.id] += weaponCount * qtyPer;
              matsAgg[MATERIALS.jewelry_upgrade_gem.id] += jewelryCount * qtyPer;
            }
          }
        }

        if (crystals > 0) hero.gainCrystals(crystals);
        if (!inventory.salvageUpgradeMaterials && totalGold > 0) hero.gainGold(totalGold);
        if (inventory.salvageUpgradeMaterials) {
          // Remove zero entries
          Object.keys(matsAgg).forEach((k) => {
            if (!matsAgg[k]) delete matsAgg[k];
          });
          inventory.bulkAddMaterials(matsAgg);
        }
      }
    }
    if (matsQty > 0) {
      const distrib = distributeMaterials(matsQty);
      inventory.bulkAddMaterials(distrib);
    }
    const refreshedLocal = Date.now();
    const refreshedServer = await getTimeNow();
    statistics.lastFightActive = refreshedServer;
    statistics.lastFightActiveLocal = refreshedLocal;
  };

  return { bonuses, apply };
}
