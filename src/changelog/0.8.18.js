const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-30</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Reduced exploration item and material bonuses across every region, with higher tiers receiving the largest cuts.</li>
      <li>Standardized item-based percentage caps at 1200%, while limiting bonus experience, gold, item rarity, item quantity, and material quantity to 400% before ascension upgrades.</li>
      <li>Introduced a material quantity bonus for rings and amulets that scales material drops similarly to item quantity.</li>
      <li>Added class specializations. Each class gets 3 specializations.</li>
      <li>Improved design for login dialog</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stat range on items, so they always display the correct values.</li>
      <li>Fixed descriptions on last 4 arena regions, to match the bonus provided.</li>
      <li>Updated the stats panel so the displayed thorns damage combines all bonus percentages additively, matching the reflected amount.</li>
      <li>Fixed potential damage calculation for skills (doesn't include crit and double damage chance)</li>
      <li>Fixed tooltip for starting souls ascension bonus.</li>
    </ul>
  `;
}
