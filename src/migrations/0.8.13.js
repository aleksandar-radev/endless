import { getStatDecimalPlaces } from '../constants/stats/stats.js';

const STORED_PERCENT_PER_FLAT = 50;
const BASE_CONVERSION = 0.5;
const PERCENT_DECIMALS = getStatDecimalPlaces('attackSpeedPercent', 2);
const BASE_DECIMALS = Math.max(PERCENT_DECIMALS + 2, 4);

function roundPercent(value) {
  if (!Number.isFinite(value)) return 0;
  const rounded = Number(value.toFixed(PERCENT_DECIMALS));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function roundBase(value) {
  if (!Number.isFinite(value)) return 0;
  const rounded = Number(value.toFixed(BASE_DECIMALS));
  return Object.is(rounded, -0) ? 0 : rounded;
}

function convertFlatToStoredPercent(value) {
  if (!Number.isFinite(value) || value === 0) return 0;
  return roundPercent(value * STORED_PERCENT_PER_FLAT);
}

function convertFlatToBasePercent(value) {
  if (!Number.isFinite(value) || value === 0) return 0;
  return roundBase(value * BASE_CONVERSION);
}

function mergeConvertedRoll(flatRoll, existingPercent) {
  const result =
    existingPercent && typeof existingPercent === 'object' ? { ...existingPercent } : {};

  if (!flatRoll || typeof flatRoll !== 'object') {
    return result;
  }

  if (typeof flatRoll.baseValue === 'number') {
    result.baseValue = convertFlatToBasePercent(flatRoll.baseValue);
  }
  if (typeof flatRoll.min === 'number') {
    result.min = convertFlatToStoredPercent(flatRoll.min);
  }
  if (typeof flatRoll.max === 'number') {
    result.max = convertFlatToStoredPercent(flatRoll.max);
  }

  Object.keys(result).forEach((key) => {
    const val = result[key];
    if (typeof val === 'number' && (!Number.isFinite(val) || val === 0)) {
      delete result[key];
    }
  });

  return result;
}

function convertStatRolls(statRolls) {
  if (!statRolls || typeof statRolls !== 'object') return;
  const flatRoll = statRolls.attackSpeed;
  if (flatRoll === undefined) return;

  const existing =
    statRolls.attackSpeedPercent && typeof statRolls.attackSpeedPercent === 'object'
      ? statRolls.attackSpeedPercent
      : null;

  let converted = null;
  if (flatRoll && typeof flatRoll === 'object') {
    converted = mergeConvertedRoll(flatRoll, existing);
  } else if (Number.isFinite(flatRoll)) {
    const percentValue = convertFlatToStoredPercent(flatRoll);
    if (percentValue) {
      converted = mergeConvertedRoll({ min: flatRoll, max: flatRoll }, existing);
    } else {
      converted = existing && typeof existing === 'object' ? { ...existing } : null;
    }
  } else {
    converted = existing && typeof existing === 'object' ? { ...existing } : null;
  }

  if (converted && Object.keys(converted).length > 0) {
    statRolls.attackSpeedPercent = converted;
  } else {
    delete statRolls.attackSpeedPercent;
  }

  delete statRolls.attackSpeed;

  if (statRolls.attackSpeedPercent === undefined && Object.keys(statRolls).length === 0) {
    delete statRolls.attackSpeedPercent;
  }
}

function convertItemStats(stats) {
  if (!stats || typeof stats !== 'object') return;
  const flat = stats.attackSpeed;
  if (typeof flat !== 'number') {
    if (flat !== undefined) delete stats.attackSpeed;
    return;
  }

  const existing = Number.isFinite(stats.attackSpeedPercent) ? stats.attackSpeedPercent : 0;
  const converted = convertFlatToStoredPercent(flat);
  const total = roundPercent(existing + converted);
  if (total !== 0) {
    stats.attackSpeedPercent = total;
  } else {
    delete stats.attackSpeedPercent;
  }
  delete stats.attackSpeed;
}

function convertBaseValueMap(baseValues) {
  if (!baseValues || typeof baseValues !== 'object') return;
  if (!Object.prototype.hasOwnProperty.call(baseValues, 'attackSpeed')) return;

  const value = baseValues.attackSpeed;
  delete baseValues.attackSpeed;
  if (Number.isFinite(value) && value !== 0) {
    baseValues.attackSpeedPercent = convertFlatToBasePercent(value);
  }
}

function convertMetaData(metaData) {
  if (!metaData || typeof metaData !== 'object') return;

  if (metaData.statRolls && typeof metaData.statRolls === 'object') {
    convertStatRolls(metaData.statRolls);
    if (metaData.statRolls && Object.keys(metaData.statRolls).length === 0) {
      delete metaData.statRolls;
    }
  }

  if (metaData.attackSpeed && typeof metaData.attackSpeed === 'object') {
    const converted = mergeConvertedRoll(metaData.attackSpeed, null);
    if (converted && Object.keys(converted).length > 0) {
      metaData.attackSpeedPercent = converted;
    } else {
      delete metaData.attackSpeedPercent;
    }
    delete metaData.attackSpeed;
  } else if (Number.isFinite(metaData.attackSpeed)) {
    const convertedValue = convertFlatToStoredPercent(metaData.attackSpeed);
    if (convertedValue) {
      metaData.attackSpeedPercent = convertedValue;
    }
    delete metaData.attackSpeed;
  }

  if (Array.isArray(metaData.setBonuses)) {
    metaData.setBonuses = metaData.setBonuses.map((bonus) => {
      if (!bonus || typeof bonus !== 'object') return bonus;
      if (bonus.stats && typeof bonus.stats === 'object') {
        convertItemStats(bonus.stats);
      }
      if (bonus.baseValues && typeof bonus.baseValues === 'object') {
        convertBaseValueMap(bonus.baseValues);
      }
      return bonus;
    });
  }
}

function convertItem(item) {
  if (!item || typeof item !== 'object') return;
  convertItemStats(item.stats);
  convertMetaData(item.metaData);
}

function convertEquippedItems(equipped) {
  if (!equipped || typeof equipped !== 'object') return;
  Object.values(equipped).forEach((item) => {
    convertItem(item);
  });
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));
  data.options = data.options || {};
  data.inventory = data.inventory || {};

  if (Array.isArray(data.inventory.inventoryItems)) {
    data.inventory.inventoryItems = data.inventory.inventoryItems.map((item) => {
      convertItem(item);
      return item;
    });
  }
  convertEquippedItems(data.inventory.equippedItems);

  return { data, result: true };
}
