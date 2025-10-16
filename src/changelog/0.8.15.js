const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-16</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Replaced iterative prestige bonus scaling with a direct formula so boss counts of any size compute instantly. (was causing lag or "white" screen on high boss levels)</li>
      <li>Prevented Transmutation and Alternation Orbs from affecting unique or set items and boosted those gear drop rates by 25%.</li>
      <li>Captured a once-per-day local backup for every save slot (kept for seven days) and added a restore control to Options → General.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Ensured prestiging and ascending wait for a forced save so ascension points and bonuses persist reliably between runs.</li>
      <li>Corrected Earth's Embrace description to reflect its life bonus instead of life regeneration.</li>
    </ul>
  `;
}
