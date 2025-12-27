# Skill System Conversion Guide

## Overview
This guide explains how to convert the remaining skill files (Rogue, Vampire, Paladin, Berserker, Elementalist, Druid, Mage) from the old scaling system to the new system.

## Conversion Pattern

### 1. Update Imports
**OLD:**
```javascript
import { scaleDownFlat, scaleUpFlat } from '../../common.js';
```

**NEW:**
```javascript
import { getFlatDamage, getDamagePercent, getSynergyBonus } from '../../common.js';
```

### 2. Skill Type Guidelines

#### Passive Skills
**Rule:** Remove most % bonuses, convert to flat bonuses.

**OLD:**
```javascript
effect: (level) => ({
  damage: scaleUpFlat(level, 5, 5, 0.2),
  damagePercent: scaleDownFlat(level, 2),
  armorPercent: scaleDownFlat(level, 2.5),
})
```

**NEW:**
```javascript
effect: (level) => ({
  damage: getFlatDamage(level, 8, 1.5, 50, 1.2),
  armor: getFlatDamage(level, 5, 1, 50, 1.2),
  // Remove damagePercent and armorPercent for passives
})
```

#### Toggle Skills
**Rule:** Rarely have % bonuses, focus on flat bonuses.

**OLD:**
```javascript
effect: (level) => ({
  fireDamage: scaleUpFlat(level, 4, 5, 0.5),
  fireDamagePercent: scaleDownFlat(level, 7),
})
```

**NEW:**
```javascript
effect: (level) => ({
  fireDamage: getFlatDamage(level, 6, 1.5, 50, 1.2),
  // Remove fireDamagePercent for toggles
})
```

#### Instant/Buff Skills
**Rule:** Can have both flat and % bonuses for burst power.

**OLD:**
```javascript
effect: (level) => ({
  damage: scaleUpFlat(level, 10, 5, 0.2),
  damagePercent: scaleDownFlat(level, 8, 5),
})
```

**NEW:**
```javascript
effect: (level) => ({
  damage: getFlatDamage(level, 15, 2, 50, 1.2),
  damagePercent: getDamagePercent(level, 10, 15, 200, 0.5),
})
```

### 3. Function Parameters

#### getFlatDamage(level, baseDamage, perLevelIncrease, milestoneInterval, milestoneMultiplier)
- `baseDamage`: Starting value at level 1 (e.g., 10)
- `perLevelIncrease`: Flat increase per level (e.g., 1.5)
- `milestoneInterval`: Levels between milestone bonuses (usually 50)
- `milestoneMultiplier`: Multiplier at each milestone (usually 1.2 = 20% increase)

**Example:** `getFlatDamage(level, 10, 1.5, 50, 1.2)`
- Level 1: 10
- Level 10: 10 + 9*1.5 = 23.5
- Level 50: (10 + 49*1.5) * 1.2 = 100.2 (milestone bonus applied)

#### getDamagePercent(level, baseValue, growthFactor, softcapLevel, linearSlope)
- `baseValue`: Starting % at level 1 (e.g., 5 for 5%)
- `growthFactor`: Controls logarithmic growth rate (e.g., 10-20)
- `softcapLevel`: Where transition to linear occurs (usually 200)
- `linearSlope`: Per-level increase after softcap (e.g., 0.5)

**Example:** `getDamagePercent(level, 5, 15, 200, 0.5)`
- Level 1: 5%
- Level 10: 5 + 15*ln(10) ≈ 39.5%
- Level 200: 5 + 15*ln(200) ≈ 84.6%
- Level 201: 84.6 + 0.5 = 85.1%

#### getSynergyBonus(sourceLevel, baseBonus, perLevelBonus, maxBonus)
- `sourceLevel`: Level of the skill providing the synergy
- `baseBonus`: Starting bonus % at level 1 (e.g., 2 for 2%)
- `perLevelBonus`: Bonus increase per level (e.g., 0.5)
- `maxBonus`: Maximum synergy bonus % (e.g., 100 for 100% = double effect)

**Example:** `getSynergyBonus(sourceLevel, 2, 0.5, 80)`
- Level 1: 2%
- Level 10: 2 + 9*0.5 = 6.5%
- Level 100: 2 + 99*0.5 = 51.5%
- Level 200: 80% (capped)

### 4. Adding Synergies

Add synergies to skills that logically complement each other:

```javascript
synergies: [
  {
    sourceSkillId: 'relatedSkill',
    calculateBonus: (sourceLevel) => getSynergyBonus(sourceLevel, 2, 0.5, 80),
    // Optional: Add additional flat bonuses from the synergy
    additionalEffects: (sourceLevel) => ({
      damage: getFlatDamage(sourceLevel, 5, 0.5, 50, 1.1),
    }),
  },
],
```

**Synergy Guidelines:**
- Early tier skills can synergize with higher tier skills
- Offensive skills synergize with other offensive skills
- Defensive skills synergize with other defensive skills
- Avoid circular synergies (A→B→A)
- Typical synergy bonus: 50-100% at max level

### 5. Special Cases

#### Chance-Based Stats (crit, block, etc.)
Keep using Math.min with caps, but use getDamagePercent for scaling:

**OLD:**
```javascript
critChance: Math.min(scaleDownFlat(level, 0.1), 20),
```

**NEW:**
```javascript
critChance: Math.min(getDamagePercent(level, 1, 2, 200, 0.1), 20),
```

#### Stats with Complex Scaling
For stats like `extraDamageFromArmorPercent`, use getDamagePercent and divide by 100:

**OLD:**
```javascript
extraDamageFromArmorPercent: Math.min(0.014 * scaleDownFlat(level), 1.5),
```

**NEW:**
```javascript
extraDamageFromArmorPercent: Math.min(getDamagePercent(level, 0.5, 0.5, 200, 0.1) / 100, 1.5),
```

#### Summon Stats
For summons, use getDamagePercent for percentOfPlayerDamage:

**OLD:**
```javascript
summonStats: (level) => ({
  percentOfPlayerDamage: 5 + scaleDownFlat(level, 4),
  attackSpeed: 4,
})
```

**NEW:**
```javascript
summonStats: (level) => ({
  percentOfPlayerDamage: 5 + getDamagePercent(level, 5, 8, 200, 0.5),
  attackSpeed: 4,
})
```

## Checklist for Each Skill File

- [ ] Update imports (remove scaleDownFlat/scaleUpFlat, add new functions)
- [ ] Convert all passive skills (remove % bonuses, use flat bonuses)
- [ ] Convert all toggle skills (remove most % bonuses)
- [ ] Convert instant/buff skills (can keep both flat and %)
- [ ] Add synergies to 30-50% of skills
- [ ] Test in-game to ensure balance
- [ ] Update any related translation keys if needed

## Files to Convert

1. [ ] /src/constants/skills/rogueSkills.js (61 instances)
2. [ ] /src/constants/skills/vampireSkills.js (62 instances)
3. [ ] /src/constants/skills/paladinSkills.js (75 instances)
4. [ ] /src/constants/skills/berserkerSkills.js (60 instances)
5. [ ] /src/constants/skills/elementalistSkills.js (77 instances)
6. [ ] /src/constants/skills/druidSkills.js (94 instances)
7. [ ] /src/constants/skills/mageSkills.js (59 instances)

## Example: Complete Skill Conversion

### Before:
```javascript
shadowDance: {
  id: 'shadowDance',
  name: () => t('skill.shadowDance.name'),
  type: () => 'passive',
  requiredLevel: () => SKILL_LEVEL_TIERS[0],
  icon: () => 'dagger',
  description: () => t('skill.shadowDance'),
  maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
  effect: (level) => ({
    damagePercent: scaleDownFlat(level, 1, 20, 400, 0.5),
    critChance: Math.min(scaleDownFlat(level, 0.07), 20),
    agility: scaleUpFlat(level, 4),
  }),
},
```

### After:
```javascript
shadowDance: {
  id: 'shadowDance',
  name: () => t('skill.shadowDance.name'),
  type: () => 'passive',
  requiredLevel: () => SKILL_LEVEL_TIERS[0],
  icon: () => 'dagger',
  description: () => t('skill.shadowDance'),
  maxLevel: () => DEFAULT_MAX_SKILL_LEVEL,
  effect: (level) => ({
    // Removed damagePercent for passive skill
    agility: getFlatDamage(level, 6, 1, 50, 1.15),
    critChance: Math.min(getDamagePercent(level, 1.5, 2, 200, 0.15), 20),
  }),
  synergies: [
    {
      sourceSkillId: 'evasion',
      calculateBonus: (sourceLevel) => getSynergyBonus(sourceLevel, 1.5, 0.4, 60),
    },
  ],
},
```

## Testing

After converting a skill file:
1. Load the game with that class
2. Allocate points to various skills
3. Check skill tooltips for correct values
4. Verify synergies are being applied
5. Test skill effects in combat
6. Check for any JavaScript errors in console

## Notes

- The new system is designed for infinite progression with a smooth transition at level 200
- Synergies add strategic depth to skill allocation
- Flat bonuses prevent exponential power creep
- % bonuses on instant/buff skills provide burst power without permanent scaling issues
