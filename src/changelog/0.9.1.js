const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-26</span>
    <hr />

    <span style="color:#FF8A00;">Major Updates</span>
    <ul>
      <li>
        <strong>Item Subtype System:</strong> Weapons now have unique variants!
        <ul>
          <li>Swords: Short Sword, Long Sword, Rapier, Greatsword (4 variants)</li>
          <li>Axes: Hatchet, Battle Axe, Greataxe (3 variants)</li>
          <li>Daggers: Knife, Stiletto (2 variants)</li>
          <li>Maces: Club, War Hammer (2 variants)</li>
          <li>Bows: Short Bow, Long Bow, Crossbow (3 variants)</li>
          <li>Wands: Fire/Frost/Storm/Earth Wand (4 variants)</li>
          <li>Staves: Fire/Frost/Storm/Earth Staff (4 variants)</li>
        </ul>
      </li>
      <li>
        <strong>Weighted Drop System:</strong> Different subtypes have different drop rates
        <ul>
          <li>Common subtypes (30% weight): Short Sword, Hatchet, Knife, etc.</li>
          <li>Uncommon subtypes (20-25% weight): Rapier, Battle Axe, Long Bow</li>
          <li>Rare subtypes (15% weight): Greatsword, Greataxe, War Hammer, Crossbow</li>
        </ul>
      </li>
      <li>
        <strong>Stat Multipliers:</strong> Subtypes modify stats and caps
        <ul>
          <li>Greatsword: +50% flat damage, +20% damage% (cap 1440%), -30% attack speed</li>
          <li>Short Sword: -20% flat damage, +30% attack speed (cap 1040%), +10% crit</li>
          <li>Fire Wand: +20% fire damage, +40% fire damage% (cap 1680%)</li>
          <li>Stiletto: -25% flat damage, +30% crit chance, +15% crit damage</li>
        </ul>
      </li>
    </ul>

    <span style="color:#FF8A00;">Flexible Item System</span>
    <ul>
      <li>
        <strong>Weapon Differentiation:</strong>
        <ul>
          <li>Axes: 40-125% higher base damage than swords, but attack slower</li>
          <li>Maces: Highest damage (60-135% more than swords), slowest attack speed</li>
          <li>Daggers: 40-35% lower damage, but 20% higher attack speed cap and better crit chance</li>
          <li>Bows: Moderate ranged damage (20-14% lower than swords)</li>
          <li>Wands: No physical damage, 50% higher elemental damage, better crit for magic builds</li>
          <li>Staves: No physical damage, 75% higher elemental damage, better magic stats</li>
        </ul>
      </li>
      <li>
        <strong>Magic Weapon Focus:</strong> Wands and Staves can no longer roll physical damage stats, making them
        purely elemental/magic focused.
      </li>
    </ul>

    <span style="color:#FF8A00;">Percent Stat Rebalance (CRITICAL)</span>
    <ul>
      <li>
        <strong>Decoupled Scaling:</strong> Percent stats NO LONGER scale with item level
        <ul>
          <li>Flat stats (damage, life, armor) scale infinitely with level</li>
          <li>Percent stats (damagePercent, lifePercent, etc.) scale ONLY with tier</li>
          <li>Prevents exponential power growth at endgame levels</li>
        </ul>
      </li>
      <li>
        <strong>Tier-Based Scaling:</strong> Explicit percent ranges per tier (12 tiers total)
        <ul>
          <li>Tier 1-3: 100%, 200%, 300%</li>
          <li>Tier 4-6: 450%, 600%, 750%</li>
          <li>Tier 7-9: 900%, 1100%, 1300%</li>
          <li>Tier 10-12: 1550%, 1750%, 2000%</li>
          <li>Predictable, easy to balance, no confusing exponential math</li>
        </ul>
      </li>
      <li>
        <strong>Variable Min Values:</strong> Percent stats now roll from 1% to tier-scaled maximum
        <ul>
          <li>Even legendary items can roll low % bonuses (adds excitement to drops)</li>
          <li>Common items with max rolls are competitive (skill matters more than rarity)</li>
        </ul>
      </li>
      <li>
        <strong>Dynamic Caps:</strong> No hardcoded percent caps - all depend on tier scaling
        <ul>
          <li>Tier 12 items can reach 2000% in any percent stat</li>
          <li>Caps scale naturally with tier progression</li>
          <li>Subtype multipliers can push beyond base tier limits (Greatsword at T12: 2400% damage%)</li>
        </ul>
      </li>
    </ul>

    <span style="color:#FF8A00;">Technical</span>
    <ul>
      <li>Implemented per-item-type stat override system.</li>
      <li>Removed all hardcoded percent caps - now dynamic based on tier.</li>
      <li>Removed level scaling from all percent stats.</li>
      <li>Replaced tierScaling function with tierScalingMaxPercent object (12 tiers: 100% to 2000%).</li>
      <li>Updated item.js getLevelScale() to use tierScalingMaxPercent object with tier 12 fallback.</li>
      <li>Updated item.js calculateStatValue() to use dynamic caps.</li>
      <li>Updated item.js getStatMinMax() to correctly display percent stat ranges (1% to tierMax).</li>
      <li>Marked ITEM_PERCENT_STAGE_SCALING_PERCENT as deprecated (legacy system only).</li>
      <li>Created itemSubtypes.js with weighted subtype system.</li>
      <li>Updated Item class to support subtypes with multipliers.</li>
      <li>Subtype multipliers affect both stat ranges and caps.</li>
      <li>Subtypes can force two-handed override.</li>
      <li>Added helper functions to eliminate code duplication (40+ lines reduced).</li>
      <li>Introduced ~40 named constants (no magic numbers).</li>
      <li>All changes are backward compatible - existing items unchanged.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed advanced tooltips showing incorrect percent stat ranges (e.g., 118-1200% instead of 1-2000%).</li>
      <li>Tooltips now correctly show percent stat ranges based on tier and subtype multipliers.</li>
    </ul>

    <span style="color:#FF8A00;">Balance</span>
    <ul>
      <li>Each weapon type now has distinct identity and purpose.</li>
      <li>Subtypes provide 20-50% variance in playstyle within same weapon type.</li>
      <li>Percent stats bounded to prevent endgame power creep.</li>
      <li>Flat stats provide consistent, linear progression.</li>
      <li>Tier/rarity more important for percent stats (no level scaling).</li>
      <li>Max-roll common items can compete with low-roll legendaries.</li>
      <li>Rare subtypes (15% drop chance) provide meaningful upgrades.</li>
    </ul>

    <span style="color:#FF8A00;">Save Data Optimization</span>
    <ul>
      <li>Optimized save data structure for items by removing redundant fields (subtypeData, nameKey, etc.).</li>
      <li>Existing items will be automatically migrated to the new format.</li>
    </ul>
  `;
}
