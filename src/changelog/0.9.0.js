const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-21</span>
    <hr />

    <span style="color:#FF8A00;">Major Updates</span>
    <ul>
      <li>Completely redesigned mob and item scaling for the Explore region to be simpler and more consistent.</li>
      <li>Mobs now scale 5x per region tier (multiplicative from previous tier).</li>
      <li>Mobs now scale 10% per stage based on the base value at stage 1.</li>
      <li>Item flat values now scale 2x per tier (multiplicative from previous tier).</li>
      <li>Item percent values now scale 1.3x per tier (multiplicative from previous tier).</li>
      <li>Item flat values now scale 0.8% per level based on the base value at level 1.</li>
      <li>Item percent values now scale 0.1% per level based on the base value at level 1.</li>
      <li>Reworked scaling of enemies and added the option to switch to legacy scaling system.</li>
      <li><strong>Quest Bonuses System:</strong> Quests now provide permanent bonuses for the current prestige run!</li>
      <li>Changes to attributes: Vitality now provides 0.1 life regen per point, and perseverance is reduced to 0.2 life regen per point (0.5 before). Wisdom now provides 0.08 compared to 0.05 mana regeneration per point. And endurance now provides 0.1 thorns damage per point. Dexterity provides 1 attack rating per point in addition to its previous effects.</li>
      <li>Combined training, crystal shop, soul shop and buildings tabs into a single "Shop" tab with 4 subtabs.</li>
      <li>Removed life steal from training.</li>
      <li>Changed icons for all elements (fire, cold, lightning, earth, water, air).</li>
      <li>Changed icons for all items.</li>
      <li>Enchantment scroll removed from drops. It can be obtainable only from quests now.</li>
      <li>Buildings tab now has quick buy feature.</li>
      <li>Cooldown reduction and buff duration removed from prestige bonuses. They can now appear on items. (ring, amulet, wand/staff)</li>
      <li>Summons can now stack, so the more cd/duration you have, the more summons you can have at the same time.</li>
      <li>Added "Achievements".</li>
    </ul>
  
    <span style="color:#FF8A00;">Skill System</span>
    <ul>
      <li>
        <strong>Skill Point Cost:</strong> Changed from progressive cost (+1 every 50 levels) to flat 1 skill point per level.
        All existing characters will receive a refund for the difference.
      </li>
      <li>
        <strong>New Scaling System:</strong> Skills now use improved scaling formulas:
        <ul>
          <li>Percentage bonuses transition smoothly from logarithmic growth (early game) to linear growth (end game) after level X</li>
          <li>Flat damage scales linearly with milestone multipliers every X levels</li>
          <li>Chance-based stats have clear caps and linear progression</li>
        </ul>
      </li>
      <li>
        <strong>Synergy System:</strong> Skills can now synergize with each other, providing percentage bonuses and additional effects.
      </li>
    </ul>

    <span style="color:#FF8A00;">Weapon Subtype System</span>
    <ul>
      <li>
        <strong>Item Subtype System:</strong> Weapons now have unique variants!
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
          <li>Greatsword: +50% flat damage, +20% damage%, -30% attack speed</li>
          <li>Short Sword: -20% flat damage, +30% attack speed, +10% crit</li>
          <li>Fire Wand: +20% fire damage, +40% fire damage%</li>
          <li>Stiletto: -25% flat damage, +30% crit chance, +15% crit damage</li>
        </ul>
      </li>
    </ul>

        <span style="color:#FF8A00;">Percent Stat Rebalance</span>
    <ul>
      <li>
        <strong>Decoupled Scaling:</strong> Percent stats NO LONGER scale with item level
        <ul>
          <li>Flat stats (damage, life, armor) scale infinitely with level</li>
          <li>Percent stats (damagePercent, lifePercent, etc.) scale ONLY with tier</li>
        </ul>
      </li>
      <li>
        <strong>Tier-Based Scaling:</strong> Explicit percent ranges per tier (12 tiers total)
        <ul>
          <li>Tier 1-3: 100%, 200%, 300%</li>
          <li>Tier 4-6: 450%, 600%, 750%</li>
          <li>Tier 7-9: 900%, 1100%, 1300%</li>
          <li>Tier 10-12: 1550%, 1750%, 2000%</li>
        </ul>
      </li>

        <strong>Dynamic Caps:</strong> No hardcoded percent caps - all depend on tier scaling
        <ul>
          <li>Tier 12 items can reach 2000% in any percent stat</li>
          <li>Caps scale naturally with tier progression</li>
          <li>Subtype multipliers can push beyond base tier limits (Greatsword at T12: 2400% damage%)</li>
        </ul>
      </li>
    </ul>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Elemental allocation changed to "Damage Allocation" and it now also includes thorns damage.</li>
      <li>Equipping bow makes the enemy attack with a delay of 1.5 seconds.</li>
      <li>Removed "Elemental Damage %" from ascension upgrades.</li>
      <li>Throns damage no longer benefits from damage % bonuses. Only total damage %.</li>
      <li>Block chance stays at 0 when no shield is equipped.</li>
      <li>Improved overall design and especially mobile experience.</li>
      <li>Added total potential damage to summon skill tooltips and details.</li>
      <li>Most if not all texts are not translated for all existing languagese correctly.</li>
      <li>Slight performance improvements.</li>
      <li>Elemental Allocation now includes a Physical % split for resource-based extra damage bonuses.</li>
      <li>Moved Elemental Allocation button to Stats tab only (removed from Training subtab).</li>
      <li>Life steal, mana steal and omni steal now cannot appear on items.</li>
      <li>
        Reduced exploration item and material bonuses across every region, with higher tiers receiving the largest cuts.
      </li>
      <li>
        Standardized item-based percentage caps at 1200%, while limiting bonus experience, gold, item rarity, item
        quantity, and material quantity to 400% before ascension upgrades.
      </li>
      <li>
        Introduced a material quantity bonus for rings and amulets that scales material drops similarly to item
        quantity.
      </li>
      <li>Added class specializations. Each class gets 3 specializations.</li>
      <li>Improved design for login dialog</li>
      <li>Added all resistance % bonus in prestige bonuses.</li>
      <li>Increased life regen bonus flat and percent in ascension upgrades and reduced in soul shop upgrades.</li>
      <li>
        Increased resistance bonus from perseverance to 3 per point (2 before), reduced armor bonus from endurance to 4
        per point (5 before), and increased life per point for vitality to 6 per point (5 before).
      </li>
      <li>Extended advanced tooltips to show more information, including actual ascension bonus.</li>
      <li>Increased life and life regen gained from training.</li>
      <li>Add extra damage from all resistances stat.</li>
      <li>Disallow equipping of 2 shields.</li>
      <li>Add bow and arrows as items.</li>
      <li>Add ascension upgrade to persist runes through ascensions and prestiges.</li>
      <li>
        Reduced extra damage from "resource" cap to 500 for level, from 1000. And ascension upgrade to 10 put point,
        compared to 20 before. (2x nerf, in favor of increased percentages on the skills)
      </li>
      <li>Animated Weapons and Summon bats skills can now critically hit.</li>
      <li>Chance to hit reduced to 12% for items. (20 before)</li>
      <li>Added ascension upgrade for bonus attibute points on level.</li>
      <li>Attack rating flat bonus from ascension upgrades increased to 8000, from 1000.</li>
      <li>Paladin's Divine judgement skill cooldown reduced to 12s from 30s.</li>
      <li>
        Life regen percent of total life (and mana) now are not affected by life regen % and mana regen % bonuses.
      </li>
      <li>Slightly reduced the drop chance of items and materials.</li>
      <li>Redesigned the enemy stats panel and added XP/Gold reward preview.</li>
      <li>
        Added a death penalty. When you die, an ailment (warmup) gets applied to the hero, reducing gold and xp gains by 50% for the next 30 seconds.
      </li>
      <li>
        The minimum death timer is now 2 seconds and the maximum is 30 seconds.
      </li>
      <li>Added a new item type: Dagger.</li>
      <li>Increased inventory capacity to 210 slots and material capacity to 120 slots for better grid alignment.</li>
      <li>Improved item tooltip layout to better handle multiple items and prevent off-screen clipping.</li>
      <li>Improved equipping control: right-clicking weapons or rings now allows choosing which hand/slot to equip them in.</li>
      <li>Added "Equip left hand" and "Equip right hand" in inventory context menu for items (right click on item).</li>
      <li>Paladin skill thornedBulwark now provides 0.2 bonus to thorns damage per point in endurance. (because endurance has 0.1 inherently)</li>
      <li>Added thorns damage and thornsDamage% in ascension bonuses.</li>
      <li style="color:#00AA00;">Continuous Play (auto-continue after death) is now the default behavior and the crystal shop upgrade has been removed; the Auto Spell Cast crystal upgrade has also been removed — spells now auto-cast by default.</li>
      <li>Allowed Alternation Orbs to be used on Unique and Set items.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stat range on items, so they always display the correct values.</li>
      <li>Fixed descriptions on last 4 arena regions, to match the bonus provided.</li>
      <li>
        Updated the stats panel so the displayed thorns damage combines all bonus percentages additively, matching the
        reflected amount.
      </li>
      <li>Fixed potential damage calculation for skills (doesn't include crit and double damage chance)</li>
      <li>Fixed tooltip for starting souls ascension bonus.</li>
      <li>Fixed display values for all cost reduction ascension upgrades. (1% instead of 0.01)</li>
      <li>Fixed descriptions of all tooltips for all stats.</li>
    </ul>
  `;
}
