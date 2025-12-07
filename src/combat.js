import {
  updatePlayerLife,
  updateEnemyStats,
  updateResources,
  updateStageUI,
  updateRockyFieldRegionSelector,
  updateBuffIndicators,
  updateTabIndicators,
  showToast,
  showDeathScreen,
  formatNumber,
} from './ui/ui.js';
import Enemy from './enemy.js';
import { hero, game, inventory, crystalShop, statistics, skillTree, dataManager, runtime, options, runes, ascension } from './globals.js';
import { ITEM_RARITY, ITEM_TYPES } from './constants/items.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';
import { selectBoss, updateBossUI } from './ui/bossUi.js';
import { getCurrentBossRegion } from './bossRegion.js';

import { audioManager } from './audio.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { RockyFieldEnemy, getRockyFieldRunePercent } from './rockyField.js';
import { renderRunesUI } from './ui/runesUi.js';
import { getRuneName, getRuneIcon } from './runes.js';
import { RUNES } from './constants/runes.js';
import { rollSpecialItemDrop } from './uniqueItems.js';

const BASE = import.meta.env.VITE_BASE_PATH;
import { ELEMENTS } from './constants/common.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);
const UNIQUE_RUNE_SET = new Set(RUNES.filter((r) => r.unique).map((r) => r.id));
const COMMON_RUNE_DROP_CHANCE = 1 / 175;
const UNIQUE_RUNE_DROP_CHANCE = 1 / 50000;
const RUNE_DROP_RATE_MULTIPLIER = 1.5;
const EXTRA_DROP_SIMULATION_THRESHOLD = 50;

function gaussianRandom() {
  const u1 = Math.random() || 1e-12;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sampleBinomial(trials, probability) {
  if (!Number.isFinite(trials) || trials <= 0) return 0;
  if (!Number.isFinite(probability) || probability <= 0) return 0;
  if (probability >= 1) return Math.floor(trials);

  const totalTrials = Math.floor(trials);
  if (totalTrials <= EXTRA_DROP_SIMULATION_THRESHOLD) {
    let successes = 0;
    for (let i = 0; i < totalTrials; i++) {
      if (Math.random() < probability) successes++;
    }
    return successes;
  }

  const mean = totalTrials * probability;
  const variance = totalTrials * probability * (1 - probability);
  const stdDev = Math.sqrt(Math.max(0, variance));
  if (stdDev === 0) return Math.round(mean);

  const sample = Math.round(mean + stdDev * gaussianRandom());
  return Math.max(0, Math.min(totalTrials, sample));
}

function sampleUpgradeMaterialQuantity(dropCount, enemyLevel) {
  if (dropCount <= 0) return 0;
  // Always return 1 per drop, no scaling with enemy level
  return dropCount;
}

function sampleMaterialDrops(extraDrops, pool) {
  const allocation = new Map();
  if (!pool || !Number.isFinite(extraDrops) || extraDrops <= 0) return allocation;

  const drops = Math.floor(extraDrops);
  if (drops <= EXTRA_DROP_SIMULATION_THRESHOLD) {
    for (let i = 0; i < drops; i++) {
      const mat = inventory.getRandomMaterialFromPool(pool);
      if (!mat) continue;
      const existing = allocation.get(mat) || { mat, drops: 0 };
      existing.drops += 1;
      allocation.set(mat, existing);
    }
    return allocation;
  }

  const { materials, weights } = pool;
  let remainingDrops = drops;
  let remainingWeight = pool.totalWeight;

  for (let i = 0; i < materials.length && remainingDrops > 0; i++) {
    const mat = materials[i];
    const weight = weights[i];
    if (!mat || weight <= 0) continue;

    let dropsForMaterial = 0;
    if (i === materials.length - 1 || remainingWeight <= weight) {
      dropsForMaterial = remainingDrops;
      remainingDrops = 0;
    } else {
      const probability = Math.min(1, Math.max(0, weight / remainingWeight));
      dropsForMaterial = sampleBinomial(remainingDrops, probability);
      remainingDrops -= dropsForMaterial;
      remainingWeight = Math.max(0, remainingWeight - weight);
    }

    if (dropsForMaterial > 0) {
      const existing = allocation.get(mat) || { mat, drops: 0 };
      existing.drops += dropsForMaterial;
      allocation.set(mat, existing);
    }
  }

  return allocation;
}

export function enemyAttack(currentTime) {
  if (!game || !hero) return;

  while (game.currentEnemy) {
    const enemy = game.currentEnemy;
    const attackSpeed = enemy?.attackSpeed || 0;
    if (!Number.isFinite(attackSpeed) || attackSpeed <= 0) break;

    const timeBetweenAttacks = 1000 / attackSpeed;
    if (currentTime - enemy.lastAttack < timeBetweenAttacks) {
      break;
    }

    // advance the internal timer by the scheduled attack interval so any extra delay is
    // carried over to future ticks instead of being rounded to the 100 ms game loop
    enemy.lastAttack += timeBetweenAttacks;

    // Check for evasion first
    const alwaysHit = enemy.special?.includes('alwaysHit');
    const enemySpecials = enemy.special || [];
    const enemySpecialData = enemy.specialData || {};
    const hitChance = calculateHitChance(
      enemy.attackRating,
      hero.stats.evasion,
      alwaysHit ? 1 : undefined,
    );
    const isEvaded = !alwaysHit && Math.random() * 100 > hitChance;

    if (isEvaded) {
      // Show "EVADED" text
      createDamageNumber({ text: 'EVADED', isPlayer: true, color: '#FFD700' });
      battleLog.addBattle(t('battleLog.evadedAttack'));
    } else {
      // Use PoE2 armor formula for physical damage reduction
      const physicalDamageRaw = enemy.damage;
      const armorReduction = calculateArmorReduction(hero.stats.armor, physicalDamageRaw) / 100;
      let physicalDamage = Math.floor(physicalDamageRaw * (1 - armorReduction));

      const elementalDamage = {};
      ELEMENT_IDS.forEach((id) => {
        const reduction =
          calculateResistanceReduction(
            hero.stats[`${id}Resistance`],
            enemy[`${id}Damage`],
          ) / 100;
        elementalDamage[id] = enemy[`${id}Damage`] * (1 - reduction);
      });

      let totalDamage = physicalDamage + ELEMENT_IDS.reduce((sum, id) => sum + elementalDamage[id], 0);

      if (game.fightMode === 'arena' && hero.stats.arenaDamageReductionPercent) {
        // min 5% damage taken
        const multiplier = Math.max(0.2, 1 - hero.stats.arenaDamageReductionPercent);
        totalDamage *= multiplier;
        // Scale breakdown components for consistency (though mainly visual/logging)
        physicalDamage = Math.floor(physicalDamage * multiplier);
        ELEMENT_IDS.forEach((id) => {
          elementalDamage[id] = Math.floor(elementalDamage[id] * multiplier);
        });
      }

      const breakdown = { physical: physicalDamage, ...elementalDamage };

      if (enemySpecials.includes('percentLifeOnHit')) {
        const percentLife = Number.isFinite(enemySpecialData.percentLifeOnHit)
          ? enemySpecialData.percentLifeOnHit
          : 5;
        const extraDamage = Math.floor((hero.stats.life || 0) * percentLife / 100);
        if (extraDamage > 0) {
          totalDamage += extraDamage;
        }
      }

      // Calculate thorns damage based on the hero's thorns stats
      const thornsResult = hero.calculateTotalThornsDamage(totalDamage);
      if (thornsResult && thornsResult.damage > 0) {
        game.damageEnemy(thornsResult.damage, thornsResult.isCritical, null, 'thornsDamage', null, {
          color: '#FFFFFF',
          source: 'thornsDamage',
        });
      }

      const isBlocked = Math.random() * 100 < hero.stats.blockChance;

      if (isBlocked) {
        // Calculate and apply block healing
        const healAmount = hero.calculateBlockHealing();

        // Show "BLOCKED" text instead of damage number
        createDamageNumber({ text: 'BLOCKED', isPlayer: true, color: '#66bd02' });
        battleLog.addBattle(t('battleLog.blockedAttack'));
        if (healAmount > 0) {
          createDamageNumber({ text: `+${Math.floor(healAmount)}`, isPlayer: true, color: '#4CAF50' });
          battleLog.addBattle(tp('battleLog.healedLife', { value: formatNumber(Math.floor(healAmount)) }));
        }
      } else {
        const fireId = ELEMENTS.fire.id;
        const fireReflect = Math.floor(
          hero.stats[`reflect${fireId.charAt(0).toUpperCase()}${fireId.slice(1)}Damage`] || 0,
        );
        if (fireReflect > 1) {
          game.damageEnemy(fireReflect, false, null, 'reflectFireDamage');
          updateEnemyStats();
        }

        game.damagePlayer(totalDamage, breakdown);

        if (hero.stats.retaliateWhenHit) {
          const { damage, isCritical } = hero.calculateDamageAgainst(enemy, {});
          game.damageEnemy(damage, isCritical, null, 'retaliation', null, {
            color: '#FF4500',
            source: 'retaliation',
          });
        }

        if (enemySpecials.includes('lifeSteal')) {
          const lifeStealPercent = Number.isFinite(enemySpecialData.lifeStealPercent)
            ? enemySpecialData.lifeStealPercent
            : 20;
          const healAmount = Math.floor(totalDamage * lifeStealPercent / 100);
          const healed = enemy.heal(healAmount);
          if (healed > 0) {
            createDamageNumber({ text: `+${Math.floor(healed)}`, isPlayer: false, color: '#4CAF50' });
            updateEnemyStats();
          }
        }
      }
    }

    if (!game.gameStarted || hero.stats.currentLife <= 0) {
      break;
    }

    // If the enemy was defeated (or swapped) during this attack, stop processing further
    if (!game.currentEnemy || game.currentEnemy !== enemy) {
      break;
    }
  }
}

export function playerAttack(currentTime) {
  if (!game || !game.currentEnemy) return;

  const attackSpeed = hero.stats.attackSpeed;
  if (!Number.isFinite(attackSpeed) || attackSpeed <= 0) {
    return;
  }

  const timeBetweenAttacks = 1000 / attackSpeed;

  while (game.currentEnemy && currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    game.lastPlayerAttack += timeBetweenAttacks;

    const enemy = game.currentEnemy;
    if (!enemy || enemy.currentLife <= 0) {
      break;
    }

    // Calculate if attack hits
    const heroAttackRating = hero.stats.attackRating;

    const alwaysEvade = enemy.special?.includes('alwaysEvade');
    const hitChance = alwaysEvade
      ? 0
      : calculateHitChance(
        heroAttackRating,
        enemy.evasion,
        undefined,
        hero.stats.chanceToHitPercent || 0,
      );

    const roll = Math.random() * 100;
    const neverMiss = hero.stats.attackNeverMiss > 0 && !alwaysEvade;

    const manaPerHit = (hero.stats.manaPerHit || 0) * (1 + (hero.stats.manaPerHitPercent || 0) / 100);

    if (!neverMiss && (alwaysEvade || roll > hitChance)) {
      createDamageNumber({ text: 'MISS', color: '#888888' });
      battleLog.addBattle(t('battleLog.missedAttack'));
    } else {
      const { damage, isCritical, breakdown } = hero.calculateDamageAgainst(enemy, {});
      const enemySpecials = enemy.special || [];
      const enemySpecialData = enemy.specialData || {};

      const lifePerHit = (hero.stats.lifePerHit || 0) * (1 + (hero.stats.lifePerHitPercent || 0) / 100);
      const lifeStealAmount = damage * (hero.stats.lifeSteal || 0) / 100;
      const manaStealAmount = damage * (hero.stats.manaSteal || 0) / 100;
      const omniStealAmount = damage * (hero.stats.omniSteal || 0) / 100;

      const disallowLeech = enemySpecials.includes('noLeech');
      const adjustedLifePerHit = disallowLeech ? Math.min(lifePerHit, 0) : lifePerHit;
      const adjustedLifeStealAmount = disallowLeech ? Math.min(lifeStealAmount, 0) : lifeStealAmount;
      const adjustedOmniStealAmount = disallowLeech ? Math.min(omniStealAmount, 0) : omniStealAmount;

      const totalLifeChange = adjustedLifeStealAmount + adjustedLifePerHit + adjustedOmniStealAmount;
      const lifeDisplayAmount = Math.floor(Math.abs(totalLifeChange));
      if (lifeDisplayAmount >= 1) {
        const lifeColor = totalLifeChange >= 0 ? '#4CAF50' : '#FF5252';
        const lifeSign = totalLifeChange >= 0 ? '+' : '-';
        createDamageNumber({ text: `${lifeSign}${lifeDisplayAmount}`, isPlayer: true, color: lifeColor });
      }
      game.healPlayer(totalLifeChange);

      const manaRestore = (manaPerHit > 0 ? manaPerHit : 0) + manaStealAmount + omniStealAmount;
      const manaDisplayAmount = Math.floor(Math.abs(manaRestore));
      if (manaRestore > 0 && manaDisplayAmount >= 1) {
        createDamageNumber({ text: `+${manaDisplayAmount}`, isPlayer: true, color: '#1E90FF' });
      }
      if (manaRestore !== 0) {
        game.restoreMana(manaRestore);
      }

      game.damageEnemy(damage, isCritical, breakdown);

      if (enemySpecials.includes('thornsAura')) {
        const thornsPercent = Number.isFinite(enemySpecialData.thornsPercent)
          ? enemySpecialData.thornsPercent
          : 10;
        const thornsDamage = Math.floor(damage * thornsPercent / 100);
        if (thornsDamage > 0) {
          game.damagePlayer(thornsDamage, { thornsDamage });
        }
      }
    }
    if (manaPerHit < 0) {
      const manaCostDisplay = Math.floor(Math.abs(manaPerHit));
      if (manaCostDisplay >= 1) {
        createDamageNumber({ text: `-${manaCostDisplay}`, isPlayer: true, color: '#1E90FF' });
      }
      game.restoreMana(manaPerHit);
    }
    if (game.fightMode === 'arena') {
      updateBossUI();
    }

    if (!game.gameStarted || game._justDefeated || !game.currentEnemy) {
      break;
    }
  }
}

// Remove any duplicate definitions and keep this single version
export function playerDeath() {
  statistics.increment('deaths');
  const shouldContinue = crystalShop.crystalUpgrades.continuousPlay;
  game.gameStarted = false;

  const timerReduction = (crystalShop.crystalUpgrades.deathTimerReduction || 0) * 0.5;
  // Death timer only applies in explore mode. Arena (boss) deaths revive immediately.
  let deathTimer = 0;
  if (game.fightMode === 'explore') {
    // Use the current stage for death timer calculations
    const baseDeathTimer = 1 + 0.5 * Math.floor(game.stage / 100);
    deathTimer = Math.max(0, baseDeathTimer - timerReduction);
  }
  battleLog.addBattle(t('battleLog.died'));

  // Disable the fight/stop button while the death screen is active
  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.disabled = true;
    // keep visual cue (optional): dim the button while disabled
    startBtn.style.opacity = '0.6';
    startBtn.style.cursor = 'not-allowed';
  }

  showDeathScreen(deathTimer, () => {
    if (!shouldContinue) {
      if (startBtn) {
        startBtn.textContent = 'Fight';
        startBtn.style.backgroundColor = '#059669';
      }
    }

    if (game.fightMode === 'arena') {
      // If in arena, reset boss state and player health
      game.resetAllLife(); // <-- Ensure player health is reset
      updateBossUI();
    } else if (game.fightMode === 'explore') {
      // Reset everything regardless of continue state
      game.stage = game.getStartingStage();
      updateStageUI();
      game.currentEnemy = new Enemy(game.stage);
      game.resetAllLife();
    } else if (game.fightMode === 'rockyField') {
      // Reset rocky field stage and enemy, restore player resources
      game.rockyFieldStage = game.getStartingStage();
      updateStageUI();
      game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
      game.resetAllLife();
      updateRockyFieldRegionSelector();
    }

    // reset ressurect counts
    game.resurrectCount = 0;
    game.soulShopResurrectCount = 0;

    // Update all UI elements
    if (game.currentEnemy) {
      updateEnemyStats();
    }
    updateResources();
    updateStatsAndAttributesUI();
    updatePlayerLife();

    // Reset buffs, cooldowns, and indicators
    skillTree.stopAllBuffs();
    skillTree.resetAllCooldowns();
    updateBuffIndicators();

    // If continuing, restart the game state
    if (shouldContinue) {
      game.gameStarted = true;
      const currentTime = Date.now();
      game.lastPlayerAttack = currentTime;
      if (game.currentEnemy) {
        game.currentEnemy.lastAttack = currentTime;
      }
    }

    // Re-enable the fight/stop button now that death screen finished
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.style.opacity = '';
      startBtn.style.cursor = '';
    }
  });
}

export async function defeatEnemy() {
  // If a prestige is in progress, skip granting rewards from this kill
  if (runtime.prestigeInProgress) {
    // clear the justDefeated guard and return early without applying rewards
    game._justDefeated = false;
    return;
  }

  const enemy = game.currentEnemy;
  const initialFightMode = game.fightMode;
  let baseExpGained = 1;
  let baseGoldGained = 1;

  // Play enemy death sound
  audioManager.play('enemyDeath');

  if (initialFightMode === 'arena') {
    baseExpGained = enemy.xp;
    baseGoldGained = enemy.gold;

    const { crystals, gold, materials, souls } = enemy.reward;
    let text = 'Boss defeated! ';
    if (gold) {
      hero.gainGold(gold);
      statistics.increment('totalGoldFromCombat', null, gold);
      text += `+${gold} gold, `;
    }
    if (crystals) {
      hero.gainCrystals(crystals);
      text += `+${crystals} crystals, `;
    }
    if (souls) {
      const baseSouls = souls + Math.floor(hero.bossLevel * 0.001);
      hero.gainSouls(baseSouls);
      text += `+${baseSouls} souls, `;
    }
    // Guaranteed material drops
    if (materials && materials.length) {
      materials.forEach(({ id, qty }) => {
        inventory.addMaterial({ id, qty });
        statistics.increment('totalMaterialsDropped', null, qty);
      });
    }

    // Extra drops if allowed
    if (hero.stats.allowBossLoot) {
      // Random Item Drop from Boss
      // Uses standard drop chance calculation (same as explore)
      // Tier based on boss level: <50 = Tier 1, 50-99 = Tier 2, etc.
      const dropTier = Math.floor(hero.bossLevel / 50) + 1;
      const itemLevel = hero.bossLevel;
      // Use explore drop chance logic
      const itemDropChance = 3 * (1 + hero.stats.itemQuantityPercent);

      if (Math.random() * 100 <= itemDropChance) {
        // Random item type
        const types = Object.values(ITEM_TYPES);
        const itemType = types[Math.floor(Math.random() * types.length)];

        // Roll special unique item or standard item
        const specialDrop = rollSpecialItemDrop({
          tier: dropTier,
          level: itemLevel,
          preferredType: itemType,
        });
        const newItem = specialDrop?.item || inventory.createItem(itemType, itemLevel, undefined, dropTier);

        inventory.addItemToInventory(newItem);
        const rarityName = ITEM_RARITY[newItem.rarity]?.name || newItem.rarity;
        battleLog.addDrop(tp('battleLog.droppedItem', { rarity: rarityName, type: t(newItem.type) }));
        showLootNotification(newItem);
      }

      // Random Material Drop from Boss
      // Uses standard material drop chance (2.5 base)
      const materialDropChance = 2.5 * (1 + hero.stats.extraMaterialDropPercent);
      if (Math.random() * 100 < materialDropChance) {
        const mat = inventory.getRandomMaterial();
        if (mat) {
          let qty = 1;
          if (inventory.isUpgradeMaterial(mat)) {
            qty = inventory.getScrapPackSize(hero.bossLevel);
          }
          // Apply material quantity multiplier
          const materialQuantityMultiplier = 1 + (hero.stats.materialQuantityPercent || 0);
          qty = Math.max(1, Math.round(qty * materialQuantityMultiplier));

          inventory.addMaterial({ id: mat.id, qty });
          statistics.increment('totalMaterialsDropped', null, qty);
          battleLog.addDrop(tp('battleLog.droppedMaterial', { name: mat.name, qty: formatNumber(qty) }));
          showMaterialNotification(mat);
        }
      }
    }

    showToast(text, 'success');
    statistics.increment('bossesKilled', null, 1);
    const runeBonuses = runes.getBonusEffects();
    const skipMax = (ascension.getBonuses()?.arenaBossSkip || 0) + (runeBonuses.arenaBossSkip || 0);
    const optionSkips = Math.min(options.arenaBossSkip || 0, skipMax);
    const regionSkipBonus = Math.max(0, Number(getCurrentBossRegion()?.bossSkipBonus) || 0);
    const totalSkips = optionSkips + regionSkipBonus;
    hero.bossLevel += 1 + totalSkips;
    // should update highestBossLevel only if the value is higher
    if (hero.bossLevel > statistics.get('highestBossLevel')) {
      statistics.set('highestBossLevel', null, hero.bossLevel);
    }
    document.dispatchEvent(
      new CustomEvent('bossKilled', {
        detail: { level: hero.bossLevel },
      }),
    );
  } else if (initialFightMode === 'explore') {
    baseExpGained = enemy.xp;
    baseGoldGained = enemy.gold;

    const dropChance = enemy.calculateDropChance() * (1 + hero.stats.itemQuantityPercent);
    if (Math.random() * 100 <= dropChance) {
      const itemLevel = enemy.calculateItemLevel(game.stage);
      const itemType = enemy.getRandomItemType();
      const region = enemy.region;
      const specialDrop = rollSpecialItemDrop({
        tier: region.tier,
        level: itemLevel,
        preferredType: itemType,
      });
      const newItem = specialDrop?.item || inventory.createItem(itemType, itemLevel, undefined, region.tier);
      inventory.addItemToInventory(newItem);
      const rarityName = ITEM_RARITY[newItem.rarity]?.name || newItem.rarity;
      battleLog.addDrop(tp('battleLog.droppedItem', { rarity: rarityName, type: t(newItem.type) }));

      showLootNotification(newItem);
    }

    const materialDropChance = enemy.rollForMaterialDrop();
    const materialQuantityMultiplier = 1 + (hero.stats.materialQuantityPercent || 0);

    if (Math.random() * 100 < materialDropChance) {
      // First (guaranteed) drop
      const mat = inventory.getRandomMaterial();
      let qty = 1;
      if (inventory.isUpgradeMaterial(mat)) {
        const enemyLvl = enemy.level || game.stage;
        qty = inventory.getScrapPackSize(enemyLvl);
      }
      qty = Math.max(1, Math.round(qty * materialQuantityMultiplier));
      inventory.addMaterial({ id: mat.id, qty });
      statistics.increment('totalMaterialsDropped', null, qty);
      battleLog.addDrop(tp('battleLog.droppedMaterial', { name: mat.name, qty: formatNumber(qty) }));
      showMaterialNotification(mat);

      // Calculate extra drops in a single calculation instead of performing many RNG loops.
      const maxExtraRolls = Math.max(0, Math.floor(hero.stats.extraMaterialDropMax || 0));
      const p = Math.max(0, Math.min(materialDropChance / 100, 1));

      let extraDrops = 0;
      if (maxExtraRolls <= 20) {
        // For small numbers just do exact Bernoulli trials (cheap).
        for (let i = 0; i < maxExtraRolls; i++) {
          if (Math.random() < p) extraDrops++;
        }
      } else {
        // For larger numbers approximate the binomial with a normal sample (fast, constant-time).
        const mean = maxExtraRolls * p;
        const variance = maxExtraRolls * p * (1 - p);
        const std = Math.sqrt(Math.max(0, variance));
        // Box-Muller transform to get a normal deviate
        const u1 = Math.random() || 1e-12;
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        extraDrops = Math.round(Math.max(0, mean + z0 * std));
      }

      if (extraDrops > 0) {
        const materialPool = inventory.getMaterialDropPool();
        const aggregate = new Map();
        const enemyLvl = enemy.level || game.stage;

        if (materialPool) {
          const distribution = sampleMaterialDrops(extraDrops, materialPool);
          for (const { mat, drops } of distribution.values()) {
            if (!mat || drops <= 0) continue;
            const key = mat.id;
            if (!aggregate.has(key)) aggregate.set(key, { mat, qty: 0 });
            const entry = aggregate.get(key);
            if (inventory.isUpgradeMaterial(mat)) {
              entry.qty += sampleUpgradeMaterialQuantity(drops, enemyLvl);
            } else {
              entry.qty += drops;
            }
          }
        } else {
          for (let i = 0; i < extraDrops; i++) {
            const fallbackMat = inventory.getRandomMaterial();
            if (!fallbackMat) continue;
            const key = fallbackMat.id;
            if (!aggregate.has(key)) aggregate.set(key, { mat: fallbackMat, qty: 0 });
            const entry = aggregate.get(key);
            if (inventory.isUpgradeMaterial(fallbackMat)) {
              entry.qty += inventory.getScrapPackSize(enemyLvl);
            } else {
              entry.qty += 1;
            }
          }
        }

        for (const { mat: aMat, qty: totalQty } of aggregate.values()) {
          if (!totalQty) continue;
          const adjustedQty = Math.max(1, Math.round(totalQty * materialQuantityMultiplier));
          inventory.addMaterial({ id: aMat.id, qty: adjustedQty });
          statistics.increment('totalMaterialsDropped', null, adjustedQty);
          battleLog.addDrop(tp('battleLog.droppedMaterial', { name: aMat.name, qty: formatNumber(adjustedQty) }));
        }
      }
    }

    // fix a bug where stage gets incremented when game stopped.
    if (game.gameStarted) {
      game.incrementStage();
    }

    statistics.increment('totalEnemiesKilled');
    statistics.increment('rockyFieldEnemiesKilledByRegion', game.rockyFieldRegion);
    statistics.increment('enemiesKilled', enemy.rarity.toLowerCase());
    statistics.increment('enemiesKilledByZone', enemy.region.tier);
  } else if (initialFightMode === 'rockyField') {
    baseExpGained = enemy.xp;
    baseGoldGained = enemy.gold;

    if (enemy.runeDrop) {
      const uniquePool = enemy.runeDrop.filter((id) => UNIQUE_RUNE_SET.has(id));
      const commonPool = enemy.runeDrop.filter((id) => !UNIQUE_RUNE_SET.has(id));
      let runeId;
      let percent;
      const boostedCommonChance = Math.min(1, COMMON_RUNE_DROP_CHANCE * RUNE_DROP_RATE_MULTIPLIER);
      const boostedUniqueChance = Math.min(1, UNIQUE_RUNE_DROP_CHANCE * RUNE_DROP_RATE_MULTIPLIER);
      if (commonPool.length && Math.random() < boostedCommonChance) {
        runeId = commonPool[Math.floor(Math.random() * commonPool.length)];
        percent = getRockyFieldRunePercent(game.rockyFieldRegion, game.rockyFieldStage);
      } else if (uniquePool.length && Math.random() < boostedUniqueChance) {
        runeId = uniquePool[Math.floor(Math.random() * uniquePool.length)];
        percent = getRockyFieldRunePercent(game.rockyFieldRegion, game.rockyFieldStage);
      }
      if (runeId) {
        const rune = runes.addRune(runeId, percent);
        if (rune) {
          const name = getRuneName(rune, options.shortElementalNames);
          battleLog.addDrop(tp('battleLog.droppedRune', { name }));
          showRuneNotification(rune);
          renderRunesUI();
          dataManager.saveGame();
        }
      }
    }

    if (game.gameStarted) {
      game.incrementRockyFieldStage();
      updateRockyFieldRegionSelector();
    }

    statistics.increment('totalEnemiesKilled');
    statistics.increment('rockyFieldEnemiesKilledByRegion', game.rockyFieldRegion);
  }
  // END REGION HANDLING

  const expGained = Math.floor(baseExpGained * (1 + hero.stats.bonusExperiencePercent));
  const goldGained = Math.floor(baseGoldGained * (1 + hero.stats.bonusGoldPercent));

  hero.gainGold(goldGained);
  hero.gainExp(expGained);

  // Track combat-specific XP and gold for rate calculations
  statistics.increment('totalGoldFromCombat', null, goldGained);
  statistics.increment('totalExpFromCombat', null, expGained);

  updateQuestsUI();

  // Update tab indicators for new items/materials dropped
  updateTabIndicators();

  // Continue existing UI updates
  updateResources();
  updateStatsAndAttributesUI();
  updateStageUI();

  dataManager.saveGame();

  // remove current enemy before spawning next after a delay
  game.currentEnemy = null;

  // Add 500ms delay between monster kills before spawning next enemy/boss
  await new Promise((resolve) => setTimeout(resolve, 500));

  // If combat stopped or a prestige started during the delay, don't spawn a new enemy
  if (runtime.prestigeInProgress) {
    game._justDefeated = false;
    return;
  }

  if (game.fightMode === 'arena') {
    selectBoss();
  } else if (game.fightMode === 'explore') {
    game.currentEnemy = new Enemy(game.stage);
    updateEnemyStats();
  } else if (game.fightMode === 'rockyField') {
    game.currentEnemy = new RockyFieldEnemy(game.rockyFieldRegion, game.rockyFieldStage);
    updateEnemyStats();
  }

  if (game.currentEnemy) {
    updateStatsAndAttributesUI();
    const currentTime = Date.now();
    game.lastPlayerAttack = currentTime;
    game.currentEnemy.lastAttack = currentTime;
  }

  // clear defeat guard so next enemy can be damaged
  game._justDefeated = false;
}

function showRuneNotification(rune) {
  if (!options?.showNotifications) return;
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = '#4db34d';
  const name = getRuneName(rune, options.shortElementalNames);
  notification.innerHTML = `Found: <img src="${getRuneIcon(rune)}" class="icon" alt="rune"/> ${name}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function showMaterialNotification(mat) {
  if (!options?.showNotifications) return;
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = '#FFD700';
  notification.innerHTML = `Found: ${mat.icon} ${mat.name}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

function showLootNotification(item) {
  if (!options?.showNotifications) return;
  const notification = document.createElement('div');
  notification.className = 'loot-notification';
  notification.style.color = ITEM_RARITY[item.rarity].color;
  notification.textContent = `Found: ${item.getDisplayName()}`;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

export function calculateHitChance(attackRating, evasion, cap = 0.9, bonus = 0) {
  let raw = 1.5 * attackRating / (attackRating + evasion);
  raw = Math.max(0.1, raw); // Ensure raw chance is never below 10%
  raw = Math.max(0, raw) + bonus;
  const capped = Math.max(1 - cap, Math.min(raw, cap));
  const result = Math.min(capped, 1);
  return Math.round(result * 100);
}

export function calculateEvasionChance(evasion, attackRating, cap = 0.9, bonus = 0) {
  // Evasion chance is simply 1 - hit chance (after capping)
  const hitChance = calculateHitChance(attackRating, evasion, cap, bonus);
  return 100 - hitChance;
}

export function calculateArmorReduction(armor, damage, cap = 0.9) {
  if (damage <= 0) return 0;
  const reduction = armor / (armor + 3 * damage);
  return Math.max(0, Math.min(reduction, cap)) * 100;
}

export function calculateResistanceReduction(resistance, damage, cap = 0.9) {
  if (damage <= 0) return 0;
  const reduction = resistance / (resistance + 5 * damage);
  return Math.max(0, Math.min(reduction, cap)) * 100;
}

/**
 * Determines the CSS class for a damage number based on the damage breakdown.
 * Returns the class name of the damage type with the highest value.
 * @param {Object} breakdown - The damage breakdown object
 * @returns {string} The CSS class name for the damage number
 */
export function getDamageTypeClass(breakdown) {
  if (!breakdown) return 'physical'; // Default class for physical damage

  // Find the damage type with the highest value
  let maxDamage = 0;
  let dominantType = 'physical';

  Object.entries(breakdown).forEach(([type, damage]) => {
    const damageValue = Math.floor(damage || 0);
    if (damageValue > maxDamage) {
      maxDamage = damageValue;
      dominantType = type;
    }
  });

  return dominantType;
}

export function createDamageNumber({
  text = '',
  isPlayer = false,
  isCritical = false,
  color = '',
  breakdown = null,
  source = null,
  icon = null,
} = {}) {
  if (!options?.showCombatText) return;
  const target = isPlayer ? '#character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  // Use parent container for positioning
  const parent = avatar.parentElement;
  // Make sure parent is positioned
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const damageEl = document.createElement('div');

  // Build CSS classes
  let className = 'damage-number';
  if (isCritical) {
    className += ' critical';
  }

  // Add damage type class if no explicit color provided and breakdown exists
  if (!color && breakdown) {
    const damageTypeClass = getDamageTypeClass(breakdown);
    className += ` ${damageTypeClass}`;
  }

  if (source) {
    className += ` source-${source}`;
  }

  damageEl.className = className;

  let displayText = text;
  if (options?.shortNumbers) {
    const num = Number(text);
    if (!Number.isNaN(num)) {
      const str = String(text).trim();
      const sign = str.startsWith('-') ? '-' : str.startsWith('+') ? '+' : '';
      displayText = `${sign}${formatNumber(Math.abs(num))}`;
    }
  }
  let resolvedIcon = icon;
  if (!resolvedIcon && source === 'thornsDamage') {
    resolvedIcon = 'thorns';
  }

  const iconMarkup = resolvedIcon
    ? `<span class="damage-icon damage-icon-${resolvedIcon}" aria-hidden="true"></span>`
    : '';

  const criticalMarkup = isCritical
    ? `<img src="${BASE}/icons/critical.svg" class="icon" alt="${t('icon.critical')}"/>`
    : '';

  const contentParts = [];
  if (iconMarkup) contentParts.push(iconMarkup);
  if (criticalMarkup) contentParts.push(criticalMarkup);
  contentParts.push(displayText);
  damageEl.innerHTML = contentParts.join(' ');

  // Apply explicit color if provided (for special cases like MISS, EVADED, etc.)
  if (color) {
    damageEl.style.color = color;
  }

  // Get avatar's position relative to parent
  const avatarRect = avatar.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const offsetX = avatarRect.left - parentRect.left;
  const offsetY = avatarRect.top - parentRect.top;

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;

  damageEl.style.position = 'absolute';
  damageEl.style.left = `${offsetX + avatar.offsetWidth / 2 + randomX}px`;
  damageEl.style.top = `${offsetY + avatar.offsetHeight / 2 + randomY}px`;

  parent.appendChild(damageEl);
  setTimeout(() => damageEl.remove(), 1000);
}

export function createCombatText(text, isPlayer = true) {
  if (!options?.showCombatText) return;
  // Allow targeting enemy or player
  const target = isPlayer ? '#character-avatar' : '.enemy-avatar';
  const avatar = document.querySelector(target);
  const parent = avatar.parentElement;
  if (getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }

  const textEl = document.createElement('div');
  textEl.className = 'damage-number level-up';
  textEl.textContent = text;
  textEl.style.color = '#FFD700';

  const avatarRect = avatar.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const offsetX = avatarRect.left - parentRect.left;
  const offsetY = avatarRect.top - parentRect.top;

  const randomX = Math.random() * 40 - 20;
  const randomY = Math.random() * 40 - 20;

  textEl.style.position = 'absolute';
  textEl.style.left = `${offsetX + avatar.offsetWidth / 2 + randomX}px`;
  textEl.style.top = `${offsetY + avatar.offsetHeight / 2 + randomY}px`;

  parent.appendChild(textEl);
  setTimeout(() => textEl.remove(), 1000);
}
