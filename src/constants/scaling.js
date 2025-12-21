/**
 * Centralized scaling constants for mobs and items in the explore region.
 * These values control how mobs and items scale with region tier and stage.
 */

/**
 * Configuration flag to switch between scaling systems.
 * Set to 'simple' for the new simplified scaling system.
 * Set to 'legacy' to use the old complex scaling system.
 */
export const SCALING_SYSTEM = 'simple';

/**
 * Mob Scaling Constants
 * 
 * Mobs scale based on two factors:
 * 1. Region scaling - multiplicative scaling per region tier
 * 2. Stage scaling - additive percentage scaling per stage from base value
 */

// Multiplier applied to mob stats when moving from one region to the next
// e.g., 5x means region 2 mobs have 5x the stats of region 1 mobs at the same stage
export const MOB_REGION_SCALING_MULTIPLIER = 5;

// Percentage increase per stage based on the base value at stage 1
// e.g., 0.1 means each stage increases mob stats by 10% of the base (stage 1) value
export const MOB_STAGE_SCALING_PERCENT = 0.1;

/**
 * Item Scaling Constants
 * 
 * Items scale based on two factors:
 * 1. Region/tier scaling - multiplicative scaling per item tier
 * 2. Stage scaling - additive percentage scaling per stage from base value
 * 
 * Items have two types of stats:
 * - Flat values (e.g., +100 life, +50 damage)
 * - Percent values (e.g., +10% life, +5% damage)
 */

// Multiplier applied to item flat values when moving from one tier to the next
// e.g., 2x means tier 2 items have 2x the flat stats of tier 1 items at the same level
export const ITEM_FLAT_REGION_SCALING_MULTIPLIER = 2;

// Multiplier applied to item percent values when moving from one tier to the next
// e.g., 1.3x means tier 2 items have 1.3x the percent stats of tier 1 items at the same level
export const ITEM_PERCENT_REGION_SCALING_MULTIPLIER = 1.3;

// Percentage increase per stage for item flat values based on the base value at level 1
// e.g., 0.008 means each level increases flat stats by 0.8% of the base value
export const ITEM_FLAT_STAGE_SCALING_PERCENT = 0.008;

// Percentage increase per stage for item percent values based on the base value at level 1
// e.g., 0.001 means each level increases percent stats by 0.1% of the base value
export const ITEM_PERCENT_STAGE_SCALING_PERCENT = 0.001;
