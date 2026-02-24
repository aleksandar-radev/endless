const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-21</span>
    <hr />

  <span style="color:#FF8A00;">Rebalance</span>
    <ul>
      <li>Increased thorns damage from ascension upgrades.</li>
      <li>Reduced thorns damage from Thorned bulwark skill by 30%.</li>
      <li>Increased overall life and defensive stats on skills.</li>
      <li>Reduced staff elemental bonuses (there was multiplier for flat and % bonuses, reduced from 1.75x to 1.4 for flat and 1.4 to 1.25 for %).</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed overheal bonuses for Slayer specialization of berserker.</li>
      <li>Fixed Shadowdancer specialization causing NaN damage to appear.</li>
      <li>Fixed items dropped by bosses. No longer NaN as bonuses on items (was caused by tier not being capped for bosses).</li>
      <li>Fixed performance issues with the new Journal tab, it was updating too frequently, rebuilding the whole html inside.</li>
      <li>Fixed an issue with 1h maces being handled as if they are 2h maces.</li>
      <li>Fixed all resistances and all resistances % bonuses sometimes not handled correctly (resulting in usually higher values).</li>
    </ul>
  `;
}
