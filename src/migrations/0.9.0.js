import { SKILL_POINT_COST_PER_LEVEL } from '../skillTree.js';

export const run = (rawData) => {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  const cleanItem = (item) => {
    if (!item) return;

    // Ensure metaData exists
    if (!item.metaData) item.metaData = {};

    // Move properties to metaData if missing there, then delete from item
    const props = ['nameKey', 'descriptionKey', 'uniqueId', 'setId', 'setNameKey'];
    props.forEach((prop) => {
      if (item[prop] !== undefined) {
        if (item.metaData[prop] === undefined) {
          item.metaData[prop] = item[prop];
        }
        delete item[prop];
      }
    });

    // subtypeData should just be deleted, it is re-derived
    if (item.subtypeData) {
      delete item.subtypeData;
    }
  };

  if (data.inventory) {
    if (data.inventory.equippedItems) {
      Object.values(data.inventory.equippedItems).forEach((item) => cleanItem(item));
    }
    if (data.inventory.inventoryItems && Array.isArray(data.inventory.inventoryItems)) {
      data.inventory.inventoryItems.forEach((item) => cleanItem(item));
    }
  }

  // Migration for skill system overhaul
  // The skill cost structure changed from progressive (1 + level/50) to flat per level
  // This means players should get refunded skill points based on the old cost structure

  if (data.skillTree && data.skillTree.skills) {
    let refundPoints = 0;

    // Calculate refund based on old cost structure for regular skills only
    // Specialization skills use a different point system and should not be refunded
    Object.values(data.skillTree.skills).forEach((skill) => {
      const level = skill.level || 0;
      if (level > 0) {
        // Old cost calculation: sum of (1 + floor(currentLevel / 50)) for each level
        // This is more complex, but we'll refund the difference
        for (let i = 0; i < level; i++) {
          const oldCost = 1 + Math.floor(i / 50);
          const newCost = SKILL_POINT_COST_PER_LEVEL;
          refundPoints += (oldCost - newCost);
        }
      }
    });

    // Add refunded points
    if (refundPoints > 0) {
      data.skillTree.skillPoints = (data.skillTree.skillPoints || 0) + refundPoints;
      data.skillTree.totalEarnedSkillPoints = (data.skillTree.totalEarnedSkillPoints || 0) + refundPoints;
    }
  }

  if (data.ascension && data.ascension.upgrades) {
    let refund = 0;

    if (data.ascension.upgrades.thornsDamagePercent) {
      refund += data.ascension.upgrades.thornsDamagePercent; // Cost was 1 per level
      delete data.ascension.upgrades.thornsDamagePercent;
    }

    if (data.ascension.upgrades.elementalDamagePercent) {
      refund += data.ascension.upgrades.elementalDamagePercent; // Cost was 1 per level
      delete data.ascension.upgrades.elementalDamagePercent;
    }

    if (data.ascension.upgrades.reduceEnemyAttackSpeedPercent) {
      const level = data.ascension.upgrades.reduceEnemyAttackSpeedPercent;
      // Cost formula was: 5 + lvl * 5
      // Total spent = 5*L + 5 * (L-1)*L / 2
      const spent = 5 * level + 5 * (level * (level - 1)) / 2;
      refund += spent;
      delete data.ascension.upgrades.reduceEnemyAttackSpeedPercent;
    }

    if (refund > 0) {
      data.ascension.points = (data.ascension.points || 0) + refund;
    }
  }

  // Runes System Rework Migration
  // - Removes conversion runes (they are no longer supported)
  // - Renames 'bonus' to 'stats' on existing runes
  // - Adds default tier to runes without one
  const migrateRune = (rune) => {
    if (!rune) return rune;

    // Conversion runes (have 'conversion' prop) are removed
    if (rune.conversion) {
      return null;
    }

    // Rename bonus → stats for existing unique runes
    if (rune.bonus && !rune.stats) {
      rune.stats = rune.bonus;
      delete rune.bonus;
    }

    // Add tier if missing (default to 1)
    if (rune.tier === undefined) {
      rune.tier = 1;
    }

    return rune;
  };

  // Migrate equipped runes
  if (data.runes?.equipped) {
    data.runes.equipped = data.runes.equipped.map(migrateRune).filter(Boolean);
  }

  // Migrate inventory runes
  if (data.runes?.inventory) {
    data.runes.inventory = data.runes.inventory.map(migrateRune).filter(Boolean);
  }

  return { data, result: true };
};
