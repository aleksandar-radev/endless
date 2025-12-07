const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-05</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Reduced exploration item and material bonuses across every region, with higher tiers receiving the largest cuts.</li>
      <li>Standardized item-based percentage caps at 1200%, while limiting bonus experience, gold, item rarity, item quantity, and material quantity to 400% before ascension upgrades.</li>
      <li>Introduced a material quantity bonus for rings and amulets that scales material drops similarly to item quantity.</li>
      <li>Added class specializations. Each class gets 3 specializations.</li>
      <li>Improved design for login dialog</li>
      <li>Added all resistance $ bonus in prestige bonuses.</li>
      <li>Increased life regen bonus flat and percent in ascension upgrades and reduced in soul shop upgrades.</li>
      <li>Increased resistance bonus from perseverance to 3 per point (2 before), reduced armor bonus from endurance to 4 per point (5 before), and increased life per point for vitality to 6 per point (5 before).</li>
      <li>Extended advanced tooltips to show more information, including actual ascension bonus.</li>
      <li>Increased life and life regen gained from training.</li>
      <li>Add extra damage from all resistances stat.</li>
      <li>Disallow equipping of 2 shields.</li>
      <li>Add bow and arrows as items.</li>
      <li>Add ascension upgrade to persist runes through ascensions and prestiges.</li>
      <li>Reduced extra damage from "resource" cap to 500 for level, from 1000. And ascension upgrade to 10 put point, compared to 20 before. (2x nerf, in favor of increased percentages on the skills)</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stat range on items, so they always display the correct values.</li>
      <li>Fixed descriptions on last 4 arena regions, to match the bonus provided.</li>
      <li>Updated the stats panel so the displayed thorns damage combines all bonus percentages additively, matching the reflected amount.</li>
      <li>Fixed potential damage calculation for skills (doesn't include crit and double damage chance)</li>
      <li>Fixed tooltip for starting souls ascension bonus.</li>
      <li>Fixed display values for all cost reduction ascension upgrades. (1% instead of 0.01)</li>
    </ul>
  `;
}
