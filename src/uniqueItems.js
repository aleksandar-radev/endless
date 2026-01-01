import Item, { AVAILABLE_STATS } from './item.js';
import { SET_ITEMS } from './constants/setItems.js';
import { UNIQUE_ITEMS } from './constants/uniqueItems.js';
import { ITEM_IDS, RARITY_KEYS } from './constants/items.js';

const DROP_CHANCES = {
  SET: 1 / 200,    // 0.5%
  UNIQUE: 1 / 250, // 0.4%
};

export function rollSpecialItemDrop({
  tier = 1, level = 1, preferredType = null,
} = {}) {
  if (Math.random() < DROP_CHANCES.UNIQUE) {
    const item = createRandomUniqueItem(tier, level, preferredType);
    if (item) return { item, rarity: RARITY_KEYS.UNIQUE };
  }

  if (Math.random() < DROP_CHANCES.SET) {
    const item = createRandomSetPiece(tier, level, preferredType);
    if (item) return { item, rarity: RARITY_KEYS.SET };
  }

  return null;
}

function applyDefinitionStats(item, statsDefinition) {
  if (!statsDefinition) return;
  Object.keys(statsDefinition).forEach((stat) => {
    // scaleStat uses the item's tier/level and respects the definition's multipliers
    // because getStatRange (called by scaleStat) looks up the definition in UNIQUE_ITEMS/SET_ITEMS
    // via item.metaData.uniqueId or item.metaData.setId
    item.stats[stat] = item.scaleStat({ stat });
  });
}

function calculateSetBonusValues(setDefinition, tier, level) {
  // Create a temporary dummy item to leverage the scaling logic in Item.js
  const dummyItem = new Item({
    type: ITEM_IDS.HELMET,
    level,
    rarity: 'SET',
    tier,
  });

  return (setDefinition.setBonuses || []).map((bonus) => {
    const stats = {};
    Object.entries(bonus.stats || {}).forEach(([stat, range]) => {
      const statConfig = AVAILABLE_STATS[stat];
      if (!statConfig) return;

      let min = range.minMultiplier || 1;
      let max = range.maxMultiplier || 1;

      const baseMin = statConfig.min || 1;
      const baseMax = statConfig.tierScalingMaxPercent?.[tier] || statConfig.max || 1;

      const absMin = baseMin * min;
      const absMax = baseMax * max;

      const val = Math.random() * (absMax - absMin) + absMin;

      const scaling = typeof statConfig.scaling === 'function' ? statConfig.scaling(level, tier) : 1;
      stats[stat] = val * scaling;
    });

    return {
      pieces: bonus.pieces,
      nameKey: bonus.nameKey,
      stats,
      active: false,
    };
  });
}

export function createUniqueItemById(id, tier = 1, level = 1) {
  const definition = UNIQUE_ITEMS[id];
  if (!definition) return null;

  const item = new Item({
    type: definition.type,
    level,
    rarity: RARITY_KEYS.UNIQUE,
    tier,
    existingStats: {},
    metaData: {
      uniqueId: definition.id,
      nameKey: definition.nameKey,
      unique: true,
    },
  });

  applyDefinitionStats(item, definition.stats);
  return item;
}

export function createRandomUniqueItem(tier = 1, level = 1, preferredType = null) {
  const allDefs = Object.values(UNIQUE_ITEMS);
  const pool = preferredType ? allDefs.filter((i) => i.type === preferredType) : allDefs;
  const candidates = pool.length ? pool : allDefs;

  if (!candidates.length) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return createUniqueItemById(pick.id, tier, level);
}

function createSetPiece(setDef, pieceDef, tier, level, setBonuses) {
  const item = new Item({
    type: pieceDef.type,
    level,
    rarity: 'SET',
    tier,
    existingStats: {},
    metaData: {
      setId: setDef.id,
      setNameKey: setDef.nameKey,
      setPieceId: pieceDef.id,
      nameKey: pieceDef.nameKey,
      descriptionKey: pieceDef.descriptionKey,
      setTotalPieces: setDef.items.length,
      setPiecesEquipped: 0,
      setBonuses: JSON.parse(JSON.stringify(setBonuses)),
      set: true,
    },
  });

  applyDefinitionStats(item, pieceDef.stats);
  return item;
}

export function createSetItemsById(setId, tier = 1, level = 1) {
  const setDef = SET_ITEMS[setId];
  if (!setDef) return [];

  const rolledBonuses = calculateSetBonusValues(setDef, tier, level);
  return setDef.items.map((piece) => createSetPiece(setDef, piece, tier, level, rolledBonuses));
}

export function createRandomSetPiece(tier = 1, level = 1, preferredType = null) {
  const allSets = Object.values(SET_ITEMS);
  const candidates = [];

  allSets.forEach((set) => {
    set.items.forEach((piece) => {
      if (!preferredType || piece.type === preferredType) {
        candidates.push({ set, piece });
      }
    });
  });

  if (!candidates.length && preferredType) {
    allSets.forEach((set) => {
      set.items.forEach((piece) => candidates.push({ set, piece }));
    });
  }

  if (!candidates.length) return null;

  const { set, piece } = candidates[Math.floor(Math.random() * candidates.length)];

  const bonuses = calculateSetBonusValues(set, tier, level);
  return createSetPiece(set, piece, tier, level, bonuses);
}

export function computeSetBonuses(equippedItems = []) {
  const totalBonuses = {};
  const setsFound = new Map();

  equippedItems.forEach((item) => {
    if (!item?.metaData?.setId) return;

    const setId = item.metaData.setId;
    if (!setsFound.has(setId)) {
      setsFound.set(setId, []);
    }
    setsFound.get(setId).push(item);
  });

  setsFound.forEach((items, setId) => {
    const setDef = SET_ITEMS[setId];
    if (!setDef) return;

    const piecesEquipped = items.length;

    // Determine the bonuses to use.
    // We use the bonuses stored on the FIRST item as the "source of truth" for the set stats
    // to avoid recalculating random values and to keep consistency.
    // If missing, we fallback to calculating based on average level.
    let activeBonuses = items[0].metaData.setBonuses;

    if (!activeBonuses || !activeBonuses.length) {
      const avgTier = Math.max(1, Math.round(items.reduce((s, i) => s + (i.tier || 1), 0) / piecesEquipped));
      const avgLevel = items.reduce((s, i) => s + (i.level || 1), 0) / piecesEquipped;
      activeBonuses = calculateSetBonusValues(setDef, avgTier, avgLevel);
    } else {
      activeBonuses = JSON.parse(JSON.stringify(activeBonuses));
    }

    activeBonuses.forEach((bonus) => {
      const isActive = piecesEquipped >= bonus.pieces;
      bonus.active = isActive;

      if (isActive && bonus.stats) {
        Object.entries(bonus.stats).forEach(([stat, value]) => {
          totalBonuses[stat] = (totalBonuses[stat] || 0) + value;
        });
      }
    });

    items.forEach((item) => {
      item.metaData.setPiecesEquipped = piecesEquipped;
      item.metaData.setBonuses = JSON.parse(JSON.stringify(activeBonuses));
    });
  });
  return totalBonuses;
}
