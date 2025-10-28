import Item from './item.js';
import { UNIQUE_ITEMS, ITEM_SETS } from './constants/uniqueSets.js';

const UNIQUE_MAP = new Map(UNIQUE_ITEMS.map((item) => [item.id, item]));
const SET_MAP = new Map(ITEM_SETS.map((set) => [set.id, set]));

const MIN_SPECIAL_TIER = 1;
const MAX_SPECIAL_TIER = 12;
const SET_MIN_DENOMINATOR = 176;
const SET_MAX_DENOMINATOR = 400;
const UNIQUE_MIN_DENOMINATOR = 200;
const UNIQUE_MAX_DENOMINATOR = 320;

function rollInRange(min, max) {
  if (min === max) return min;
  return min + Math.random() * (max - min);
}

function normalizeLevel(level) {
  if (Number.isNaN(level) || !Number.isFinite(level)) return 0;
  return Math.max(0, Math.round(level));
}

function buildItemWithStats(definition, level, tier, rarity, extraMeta = {}) {
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const helper = new Item(definition.type, normalizedLevel, rarity, normalizedTier, {}, { ...extraMeta });
  const multiplier = helper.getMultiplier();
  const stats = {};

  const statRolls = {};

  definition.stats.forEach(({ stat, min, max }) => {
    const baseValue = rollInRange(min, max);
    const tierBonus = helper.getTierBonus(stat);
    const scale = helper.getLevelScale(stat, normalizedLevel);
    const value = helper.calculateStatValue({
      baseValue,
      tierBonus,
      multiplier,
      scale,
      stat,
    });
    stats[stat] = value;

    statRolls[stat] = {
      baseValue,
    };
  });

  const metaData = {
    ...extraMeta,
    statRolls: {
      ...(extraMeta.statRolls || {}),
      ...statRolls,
    },
  };
  return new Item(definition.type, normalizedLevel, rarity, normalizedTier, stats, metaData);
}

function rollSetBonusValues(setDefinition, tier, level) {
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const helper = new Item(setDefinition.items[0]?.type || 'ARMOR', normalizedLevel, 'SET', normalizedTier, {}, {});
  const multiplier = helper.getMultiplier();

  return setDefinition.setBonuses.map((bonus) => {
    const stats = {};
    const baseValues = {};
    (bonus.stats || []).forEach(({ stat, min, max }) => {
      const baseValue = rollInRange(min, max);
      const tierBonus = helper.getTierBonus(stat);
      const scale = helper.getLevelScale(stat, normalizedLevel);
      const value = helper.calculateStatValue({
        baseValue,
        tierBonus,
        multiplier,
        scale,
        stat,
      });
      stats[stat] = value;
      baseValues[stat] = baseValue;
    });

    return {
      pieces: bonus.pieces,
      nameKey: bonus.nameKey,
      stats,
      baseValues,
      active: false,
    };
  });
}

function cloneSetBonuses(bonuses) {
  return (bonuses || []).map((bonus) => ({
    ...bonus,
    stats: { ...(bonus.stats || {}) },
    baseValues: { ...(bonus.baseValues || {}) },
    active: Boolean(bonus.active),
  }));
}

export function getUniqueItemDefinitions() {
  return UNIQUE_ITEMS;
}

export function getItemSetDefinitions() {
  return ITEM_SETS;
}

export function createUniqueItemById(id, tier = 1, level = 1) {
  const definition = UNIQUE_MAP.get(id);
  if (!definition) return null;
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const meta = {
    ...('nameKey' in definition ? { nameKey: definition.nameKey } : {}),
    uniqueId: definition.id,
    unique: true,
  };
  return buildItemWithStats(definition, normalizedLevel, normalizedTier, 'UNIQUE', meta);
}

function createSetPieceItem(setDefinition, pieceDefinition, tier, level, rolledBonuses) {
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const meta = {
    nameKey: pieceDefinition.nameKey,
    descriptionKey: pieceDefinition.descriptionKey,
    setId: setDefinition.id,
    setNameKey: setDefinition.nameKey,
    setPieceId: pieceDefinition.id,
    setTotalPieces: setDefinition.items.length,
    setPiecesEquipped: 0,
    setBonuses: cloneSetBonuses(rolledBonuses),
    set: true,
  };
  return buildItemWithStats(pieceDefinition, normalizedLevel, normalizedTier, 'SET', meta);
}

export function createSetItemsById(id, tier = 1, level = 1) {
  const setDefinition = SET_MAP.get(id);
  if (!setDefinition) return [];
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const rolledBonuses = rollSetBonusValues(setDefinition, normalizedTier, normalizedLevel);
  return setDefinition.items.map((piece) =>
    createSetPieceItem(setDefinition, piece, normalizedTier, normalizedLevel, rolledBonuses),
  );
}

export function computeSetBonuses(equippedItems = []) {
  const totalBonuses = {};
  const grouped = new Map();

  equippedItems.forEach((item) => {
    if (!item?.metaData?.setId) {
      if (item?.metaData) {
        item.metaData.setPiecesEquipped = 0;
        if (Array.isArray(item.metaData.setBonuses)) {
          item.metaData.setBonuses = cloneSetBonuses(item.metaData.setBonuses);
        }
      }
      return;
    }
    const setId = item.metaData.setId;
    if (!grouped.has(setId)) {
      const setDef = SET_MAP.get(setId);
      if (!setDef) return;
      grouped.set(setId, { definition: setDef, items: [] });
    }
    grouped.get(setId).items.push(item);
  });

  grouped.forEach(({ definition, items }) => {
    if (!items.length) return;
    const piecesEquipped = items.length;
    const normalizedTier = Math.max(
      1,
      Math.round(items.reduce((sum, item) => sum + (item.tier || 1), 0) / items.length),
    );

    const storedBonuses = items[0]?.metaData?.setBonuses;
    const averageLevel = items.length
      ? items.reduce((sum, item) => sum + normalizeLevel(item.level), 0) / items.length
      : 0;
    const baseBonuses = cloneSetBonuses(
      storedBonuses && storedBonuses.length
        ? storedBonuses
        : rollSetBonusValues(definition, normalizedTier, averageLevel),
    );

    baseBonuses.forEach((bonus) => {
      const isActive = piecesEquipped >= bonus.pieces;
      bonus.active = isActive;
      if (isActive) {
        Object.entries(bonus.stats || {}).forEach(([stat, value]) => {
          totalBonuses[stat] = (totalBonuses[stat] || 0) + value;
        });
      }
    });

    items.forEach((item) => {
      if (!item.metaData) item.metaData = {};
      item.metaData.setPiecesEquipped = piecesEquipped;
      item.metaData.setTotalPieces = definition.items.length;
      item.metaData.setBonuses = cloneSetBonuses(baseBonuses);
    });
  });

  return totalBonuses;
}

function interpolateDenominator(tier, minDenominator, maxDenominator) {
  const clampedTier = Math.min(MAX_SPECIAL_TIER, Math.max(MIN_SPECIAL_TIER, Math.round(tier)));
  if (MAX_SPECIAL_TIER === MIN_SPECIAL_TIER) {
    return maxDenominator;
  }
  const progress = (clampedTier - MIN_SPECIAL_TIER) / (MAX_SPECIAL_TIER - MIN_SPECIAL_TIER);
  return minDenominator + progress * (maxDenominator - minDenominator);
}

export function getSpecialItemDropChances(tier) {
  const setDenominator = interpolateDenominator(tier, SET_MIN_DENOMINATOR, SET_MAX_DENOMINATOR);
  const uniqueDenominator = interpolateDenominator(tier, UNIQUE_MIN_DENOMINATOR, UNIQUE_MAX_DENOMINATOR);
  return {
    set: setDenominator > 0 ? 1 / setDenominator : 0,
    unique: uniqueDenominator > 0 ? 1 / uniqueDenominator : 0,
  };
}

export function createRandomUniqueItem(tier = 1, level = 1, preferredType = null) {
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const pool = preferredType
    ? UNIQUE_ITEMS.filter((item) => item.type === preferredType)
    : UNIQUE_ITEMS;
  const candidates = pool.length ? pool : UNIQUE_ITEMS;
  if (!candidates.length) return null;
  const definition = candidates[Math.floor(Math.random() * candidates.length)];
  return createUniqueItemById(definition.id, normalizedTier, normalizedLevel);
}

export function createRandomSetPiece(tier = 1, level = 1, preferredType = null) {
  const normalizedTier = Math.max(1, Math.round(tier));
  const normalizedLevel = normalizeLevel(level);
  const pairs = [];
  ITEM_SETS.forEach((set) => {
    set.items.forEach((piece) => {
      if (!preferredType || piece.type === preferredType) {
        pairs.push({ set, piece });
      }
    });
  });
  const candidates = pairs.length
    ? pairs
    : ITEM_SETS.flatMap((set) => set.items.map((piece) => ({ set, piece })));
  if (!candidates.length) return null;
  const selection = candidates[Math.floor(Math.random() * candidates.length)];
  const bonuses = rollSetBonusValues(selection.set, normalizedTier, normalizedLevel);
  return createSetPieceItem(selection.set, selection.piece, normalizedTier, normalizedLevel, bonuses);
}

export function rollSpecialItemDrop({ tier = 1, level = 1, preferredType = null } = {}) {
  const { set: setChance, unique: uniqueChance } = getSpecialItemDropChances(tier);
  if (uniqueChance > 0 && Math.random() < uniqueChance) {
    const uniqueItem = createRandomUniqueItem(tier, level, preferredType);
    if (uniqueItem) {
      return { item: uniqueItem, rarity: 'UNIQUE' };
    }
  }
  if (setChance > 0 && Math.random() < setChance) {
    const setItem = createRandomSetPiece(tier, level, preferredType);
    if (setItem) {
      return { item: setItem, rarity: 'SET' };
    }
  }
  return null;
}
