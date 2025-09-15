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
import { ITEM_RARITY } from './constants/items.js';
import { updateStatsAndAttributesUI } from './ui/statsAndAttributesUi.js';
import { updateQuestsUI } from './ui/questUi.js';
import { selectBoss, updateBossUI } from './ui/bossUi.js';

import { audioManager } from './audio.js';
import { battleLog } from './battleLog.js';
import { t, tp } from './i18n.js';
import { RockyFieldEnemy, getRockyFieldRunePercent } from './rockyField.js';
import { renderRunesUI } from './ui/runesUi.js';
import { getRuneName } from './runes.js';
import { RUNES } from './constants/runes.js';

const BASE = import.meta.env.VITE_BASE_PATH;
import { ELEMENTS } from './constants/common.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);
const UNIQUE_RUNE_SET = new Set(RUNES.filter((r) => r.unique).map((r) => r.id));

export function enemyAttack(currentTime) {
  if (!game || !hero || !game.currentEnemy) return;
  if (game.currentEnemy.canAttack(currentTime)) {
    // Check for evasion first

    const alwaysHit = game.currentEnemy.special?.includes('alwaysHit');
    const hitChance = calculateHitChance(
      game.currentEnemy.attackRating,
      hero.stats.evasion,
      alwaysHit ? 1 : undefined,
    );
    const isEvaded = !alwaysHit && Math.random() * 100 > hitChance;

    if (isEvaded) {
      // Show "EVADED" text
      createDamageNumber({ text: 'EVADED', isPlayer: true, color: '#FFD700' });
      battleLog.addBattle(t('battleLog.evadedAttack'));
    } else {
      const isBlocked = Math.random() * 100 < hero.stats.blockChance;

      if (isBlocked) {
        // Calculate and apply block healing
        const healAmount = hero.calculateBlockHealing();

        // Show "BLOCKED" text instead of damage number
        createDamageNumber({ text: 'BLOCKED', isPlayer: true, color: '#66bd02' });
        battleLog.addBattle(t('battleLog.blockedAttack'));
        if (healAmount > 0) {
          createDamageNumber({ text: `+${Math.floor(healAmount)}`, isPlayer: true, color: '#4CAF50' });
          battleLog.addBattle(tp('battleLog.healedLife', { value: Math.floor(healAmount) }));
        }
      } else {
        // Use PoE2 armor formula for physical damage reduction
        const physicalDamageRaw = game.currentEnemy.damage;
        const armorReduction = calculateArmorReduction(hero.stats.armor, physicalDamageRaw) / 100;
        const physicalDamage = Math.floor(physicalDamageRaw * (1 - armorReduction));

        const elementalDamage = {};
        ELEMENT_IDS.forEach((id) => {
          const reduction =
            calculateResistanceReduction(
              hero.stats[`${id}Resistance`],
              game.currentEnemy[`${id}Damage`],
            ) / 100;
          elementalDamage[id] = game.currentEnemy[`${id}Damage`] * (1 - reduction);
        });

        let totalDamage =
          physicalDamage + ELEMENT_IDS.reduce((sum, id) => sum + elementalDamage[id], 0);

        const breakdown = { physical: physicalDamage, ...elementalDamage };

        // Calculate thorns damage based on the final damage taken
        const thornsDamage = hero.calculateTotalThornsDamage(totalDamage);
        // only if there is some thorns damage to deal, only paladin
        if (thornsDamage - totalDamage > 1) {
          game.damageEnemy(thornsDamage);
        }


        const fireId = ELEMENTS.fire.id;
        const fireReflect = Math.floor(
          hero.stats[`reflect${fireId.charAt(0).toUpperCase()}${fireId.slice(1)}Damage`] || 0,
        );
        if (fireReflect > 1) {
          game.damageEnemy(fireReflect);
          updateEnemyStats();
        }

        game.damagePlayer(totalDamage, breakdown);
      }
    }

    // Record the enemy's last attack time
    if(game.currentEnemy) {
      game.currentEnemy.lastAttack = currentTime;
    }
  }
}

export function playerAttack(currentTime) {
  if (!game || !game.currentEnemy) return;
  const timeBetweenAttacks = 1000 / hero.stats.attackSpeed;

  if (currentTime - game.lastPlayerAttack >= timeBetweenAttacks) {
    if (game.currentEnemy.currentLife > 0) {

      // Calculate if attack hits
      const heroAttackRating = hero.stats.attackRating;

      const alwaysEvade = game.currentEnemy.special?.includes('alwaysEvade');
      const hitChance = alwaysEvade
        ? 0
        : calculateHitChance(
          heroAttackRating,
          game.currentEnemy.evasion,
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
        const { damage, isCritical, breakdown } = hero.calculateDamageAgainst(game.currentEnemy, {});

        const lifePerHit = (hero.stats.lifePerHit || 0) * (1 + (hero.stats.lifePerHitPercent || 0) / 100);
        const lifeStealAmount = damage * (hero.stats.lifeSteal || 0) / 100;
        const manaStealAmount = damage * (hero.stats.manaSteal || 0) / 100;
        const omniStealAmount = damage * (hero.stats.omniSteal || 0) / 100;
        game.healPlayer(lifeStealAmount + lifePerHit + omniStealAmount);

        const manaRestore = (manaPerHit > 0 ? manaPerHit : 0) + manaStealAmount + omniStealAmount;
        if (manaRestore > 0) {
          game.restoreMana(manaRestore);
        }

        game.damageEnemy(damage, isCritical, breakdown);
      }
      if (manaPerHit < 0) {
        game.restoreMana(manaPerHit);
      }
      if (game.fightMode === 'arena') {
        updateBossUI();
      }
    }
    game.lastPlayerAttack = currentTime;
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
      game.currentEnemy = new RockyFieldEnemy(game.rockyFieldZone, game.rockyFieldStage);
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
      game.lastPlayerAttack = Date.now();
      if (game.currentEnemy) {
        game.currentEnemy.lastAttack = Date.now();
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
      text += `+${gold} gold, `;
    }
    if (crystals) {
      hero.gainCrystals(crystals);
      text += `+${crystals} crystals, `;
    }
    if (souls) {
      hero.gainSouls(souls + Math.floor(hero.bossLevel * 0.001)); // +0.01% per boss level
      text += `+${souls + Math.floor(hero.bossLevel * 0.001)} souls, `;
    }
    if (materials && materials.length) {
      materials.forEach(({ id, qty }) => {
        inventory.addMaterial({ id, qty });
        statistics.increment('totalMaterialsDropped', null, qty);
      });
    }
    showToast(text, 'success');
    statistics.increment('bossesKilled', null, 1);
    const runeBonuses = runes.getBonusEffects();
    const skipMax = (ascension.getBonuses()?.arenaBossSkip || 0) + (runeBonuses.arenaBossSkip || 0);
    const skips = Math.min(options.arenaBossSkip || 0, skipMax);
    hero.bossLevel += 1 + skips;
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
      const newItem = inventory.createItem(itemType, itemLevel, undefined, region.tier);
      inventory.addItemToInventory(newItem);
      const rarityName = ITEM_RARITY[newItem.rarity]?.name || newItem.rarity;
      battleLog.addDrop(tp('battleLog.droppedItem', { rarity: rarityName, type: t(newItem.type) }));

      showLootNotification(newItem);
    }

    const materialDropChance = enemy.rollForMaterialDrop();

    if (Math.random() * 100 < materialDropChance) {
      // First (guaranteed) drop
      const mat = inventory.getRandomMaterial();
      let qty = 1;
      if (inventory.isUpgradeMaterial(mat)) {
        const enemyLvl = enemy.level || game.stage;
        qty = inventory.getScrapPackSize(enemyLvl);
      }
      inventory.addMaterial({ id: mat.id, qty });
      statistics.increment('totalMaterialsDropped', null, qty);
      battleLog.addDrop(tp('battleLog.droppedMaterial', { name: mat.name, qty }));
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
        // Aggregate materials to minimize inventory operations and notifications
        const aggregate = new Map();
        const enemyLvl = enemy.level || game.stage;
        for (let i = 0; i < extraDrops; i++) {
          const extraMat = inventory.getRandomMaterial();
          let extraQty = 1;
          if (inventory.isUpgradeMaterial(extraMat)) {
            extraQty = inventory.getScrapPackSize(enemyLvl);
          }
          const key = extraMat.id;
          if (!aggregate.has(key)) aggregate.set(key, { mat: extraMat, qty: 0 });
          aggregate.get(key).qty += extraQty;
        }

        for (const { mat: aMat, qty: totalQty } of aggregate.values()) {
          inventory.addMaterial({ id: aMat.id, qty: totalQty });
          statistics.increment('totalMaterialsDropped', null, totalQty);
          battleLog.addDrop(tp('battleLog.droppedMaterial', { name: aMat.name, qty: totalQty }));
        }
      }
    }

    // fix a bug where stage gets incremented when game stopped.
    if (game.gameStarted) {
      game.incrementStage();
    }

    statistics.increment('totalEnemiesKilled');
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
      if (commonPool.length && Math.random() < 1 / 500) {
        runeId = commonPool[Math.floor(Math.random() * commonPool.length)];
        percent = getRockyFieldRunePercent(game.rockyFieldZone, game.rockyFieldStage);
      } else if (uniquePool.length && Math.random() < 1 / 50000) {
        runeId = uniquePool[Math.floor(Math.random() * uniquePool.length)];
        percent = getRockyFieldRunePercent(game.rockyFieldZone, game.rockyFieldStage);
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
  }
  // END REGION HANDLING

  const expGained = Math.floor(baseExpGained * (1 + hero.stats.bonusExperiencePercent));
  const goldGained = Math.floor(baseGoldGained * (1 + hero.stats.bonusGoldPercent));

  hero.gainGold(goldGained);
  hero.gainExp(expGained);

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
    game.currentEnemy = new RockyFieldEnemy(game.rockyFieldZone, game.rockyFieldStage);
    updateEnemyStats();
  }

  if (game.currentEnemy) {
    updateStatsAndAttributesUI();
    game.currentEnemy.lastAttack = Date.now();
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
  notification.innerHTML = `Found: <img src="${rune.icon}" class="icon" alt="rune"/> ${name}`;
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

export function createDamageNumber({ text = '', isPlayer = false, isCritical = false, color = '' } = {}) {
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
  damageEl.className = isCritical ? 'damage-number critical' : 'damage-number';
  let displayText = text;
  if (options?.shortNumbers) {
    const num = Number(text);
    if (!Number.isNaN(num)) {
      const str = String(text).trim();
      const sign = str.startsWith('-') ? '-' : str.startsWith('+') ? '+' : '';
      displayText = `${sign}${formatNumber(Math.abs(num))}`;
    }
  }
  damageEl.innerHTML = isCritical
    ? `<img src="${BASE}/icons/critical.svg" class="icon" alt="${t('icon.critical')}"/> ` + displayText
    : displayText;
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
