# Scaling System Documentation

## Overview
This document explains the new simplified scaling system for mobs and items in the explore region.

## Scaling System Configuration

The scaling system can be toggled between two modes:
- **In Development**: Use the dropdown in the Options menu (Game tab) - look for "[DEV] Scaling System"
- **In Code**: Change `options.scalingSystem` default value in `src/options.js`

Values:
- `'simple'` - New simplified scaling system (default)
- `'legacy'` - Original complex scaling system

**Note**: The options dropdown is only visible when `VITE_ENV !== 'production'` (development/local builds only).

## Scaling Constants Location

All scaling constants are defined as static properties in the `EnemyBase` class in `src/enemyBase.js`:

```javascript
class EnemyBase {
  static MOB_REGION_SCALING_MULTIPLIER = 5;
  static MOB_STAGE_SCALING_PERCENT = 0.1;
  static ITEM_FLAT_REGION_SCALING_MULTIPLIER = 2;
  static ITEM_PERCENT_REGION_SCALING_MULTIPLIER = 1.3;
  static ITEM_FLAT_STAGE_SCALING_PERCENT = 0.008;
  static ITEM_PERCENT_STAGE_SCALING_PERCENT = 0.001;
  // ...
}
```

The scaling system selection is stored in `options.scalingSystem` and accessed throughout the codebase via the global `options` object.

## Mob Scaling (Explore Region Only)

### Region Scaling
Mobs scale multiplicatively by region tier:
- **Multiplier**: 5x per region tier
- **Formula**: `multiplier^(tier - 1)`
- **Examples**:
  - Tier 1: 5^0 = 1x (base)
  - Tier 2: 5^1 = 5x
  - Tier 3: 5^2 = 25x
  - Tier 4: 5^3 = 125x

### Stage Scaling
Mobs scale additively by stage within a region:
- **Percentage**: 10% per stage from base value
- **Formula**: `base * (1 + (stage - 1) * 0.1)`
- **Examples** (with 100 base life):
  - Stage 1: 100 * 1.0 = 100
  - Stage 2: 100 * 1.1 = 110
  - Stage 3: 100 * 1.2 = 120
  - Stage 10: 100 * 1.9 = 190

### Combined Example
For a mob in Tier 2, Stage 10 with 100 base life:
1. Region scaling: 100 * 5 = 500
2. Stage scaling: 500 * (1 + 9 * 0.1) = 500 * 1.9 = 950 life

### Stats Affected
All mob stats use this scaling:
- Life
- Damage (physical and elemental)
- Armor
- Evasion
- Attack Rating
- Elemental Resistances
- XP and Gold (also affected by diminishing returns)

## Item Scaling

### Flat Value Stats
Examples: +50 life, +20 damage, +30 armor

**Region/Tier Scaling**:
- **Multiplier**: 2x per tier
- **Formula**: `2^(tier - 1)`
- **Examples**:
  - Tier 1: 2^0 = 1x (base)
  - Tier 2: 2^1 = 2x
  - Tier 3: 2^2 = 4x
  - Tier 4: 2^3 = 8x

**Level Scaling**:
- **Percentage**: 0.8% per level from base value
- **Formula**: `1 + (level - 1) * 0.008`
- **Examples**:
  - Level 1: 1.0x
  - Level 10: 1 + 9 * 0.008 = 1.072x
  - Level 100: 1 + 99 * 0.008 = 1.792x

**Combined Example**:
Tier 2, Level 50 item with 50 base damage:
1. Tier scaling: 50 * 2 = 100
2. Level scaling: 100 * (1 + 49 * 0.008) = 100 * 1.392 = 139.2 damage

### Percent Value Stats
Examples: +10% life, +5% damage, +8% armor

**Region/Tier Scaling**:
- **Multiplier**: 1.3x per tier
- **Formula**: `1.3^(tier - 1)`
- **Examples**:
  - Tier 1: 1.3^0 = 1x (base)
  - Tier 2: 1.3^1 = 1.3x
  - Tier 3: 1.3^2 = 1.69x
  - Tier 4: 1.3^3 = 2.197x

**Level Scaling**:
- **Percentage**: 0.1% per level from base value
- **Formula**: `1 + (level - 1) * 0.001`
- **Examples**:
  - Level 1: 1.0x
  - Level 10: 1 + 9 * 0.001 = 1.009x
  - Level 100: 1 + 99 * 0.001 = 1.099x

**Combined Example**:
Tier 2, Level 50 item with 10% base life bonus:
1. Tier scaling: 10% * 1.3 = 13%
2. Level scaling: 13% * (1 + 49 * 0.001) = 13% * 1.049 = 13.637%

## Implementation Details

### Mob Stat Calculation Flow
1. Get base stat from enemy data
2. Apply simple or legacy scaling based on `SCALING_SYSTEM`
3. Apply region multiplier (from region config)
4. Apply rarity multiplier (normal/rare/epic/legendary/mythic)
5. Apply enemy-specific multiplier (if any)
6. Apply hero stat reductions (for HP and damage)

### Item Stat Calculation Flow
1. Roll random base value from stat min/max range
2. Apply tier bonus
3. Apply rarity multiplier
4. Apply level scaling (with isPercent flag)
5. Apply two-handed multiplier (if applicable)
6. Apply limits and caps

## Adjusting the Scaling

All scaling constants are defined as static properties in the `EnemyBase` class in `src/enemyBase.js`:

```javascript
class EnemyBase {
  // Change these values to adjust scaling
  static MOB_REGION_SCALING_MULTIPLIER = 5;        // Change this to adjust region scaling
  static MOB_STAGE_SCALING_PERCENT = 0.1;          // Change this to adjust stage scaling
  
  static ITEM_FLAT_REGION_SCALING_MULTIPLIER = 2;  // Change this to adjust tier scaling
  static ITEM_FLAT_STAGE_SCALING_PERCENT = 0.008;  // Change this to adjust level scaling
  
  static ITEM_PERCENT_REGION_SCALING_MULTIPLIER = 1.3;  // Change this to adjust tier scaling
  static ITEM_PERCENT_STAGE_SCALING_PERCENT = 0.001;    // Change this to adjust level scaling
}
```

## Migration Notes

### Switching Between Systems

**In Development**:
1. Open the game
2. Go to Options → Game tab
3. Find the "[DEV] Scaling System" dropdown
4. Select "Simple (New)" or "Legacy (Old)"
5. Reload the page

**In Production**:
The dropdown is hidden in production builds. To switch systems in production, you must change the code:
1. Open `src/options.js`
2. In the constructor, find the line: `this.scalingSystem = data.scalingSystem || 'simple';`
3. Change the default from `'simple'` to `'legacy'` or vice versa
4. Rebuild and redeploy

### Why Keep Legacy System?
- Allows for A/B testing between systems
- Provides fallback if issues are found
- Enables gradual migration if needed
- Facilitates balance comparison

## Areas Not Affected

This scaling system **only** affects the explore region. The following are unchanged:
- **Arena bosses** - Use their own scaling system
- **Rocky field enemies** - Use their own scaling system
- **Region multipliers** - Still applied on top of base scaling
- **Rarity multipliers** - Still applied on top of base scaling
- **Hero stat reductions** - Still reduce enemy stats as before
