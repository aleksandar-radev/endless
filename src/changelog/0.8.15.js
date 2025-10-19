const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-17</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Limited extra damage gained from resource percentage bonuses to 1,000 of the source stat per hero level and added an ascension upgrade that raises that per-level cap.</li>
      <li>Replaced iterative prestige bonus scaling with a direct formula so boss counts of any size compute instantly. (was causing lag or "white" screen on high boss levels)</li>
      <li>Prevented Transmutation and Alternation Orbs from affecting unique or set items and boosted those gear drop rates by 25%.</li>
      <li>Captured a once-per-day local backup for every save slot (kept for seven days) and added a restore control to Options → General.</li>
      <li>Enabled development options that are enabled by typing "edev" anywhere in the browser/app until 31 of October 2025, because of a recent issue that caused many people to lose their progress. (you can also abuse it, but it might kill the fun :))</li>
      <li>Split Options quick-set buttons so you can jump straight to minimum or maximum values for starting stage, stage skip, and related inputs, and apply those values instantly without an extra button.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Ensured prestiging and ascending wait for a forced save so ascension points and bonuses persist reliably between runs.</li>
      <li>Corrected Earth's Embrace description to reflect its life bonus instead of life regeneration.</li>
    </ul>
  `;
}
