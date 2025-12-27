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
    </ul>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Improved overall design and especially mobile experience.</li>
      <li>Most if not all texts are not translated for all existing languagese correctly.</li>
      <li>Slight performance improvements.</li>
      <li>Elemental Allocation now includes a Physical % split for resource-based extra damage bonuses.</li>
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
        Added a death penalty. When you die, an ailment gets applied to the hero, reducing gold and xp gains by 50% for
        the next 20 seconds. Also, the minimum death timer is now 2 seconds and the maximum is 30 seconds.
      </li>
      <li>Added a new item type: Dagger.</li>
      <li>Increased inventory capacity to 210 slots and material capacity to 120 slots for better grid alignment.</li>
    </ul>

    <span style="color:#FF8A00;">Technical</span>
    <ul>
      <li>
        Added a scaling system configuration flag to easily switch between the new simplified scaling and the legacy
        scaling system if needed.
      </li>
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
    </ul>
  `;
}
