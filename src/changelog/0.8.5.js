const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-19</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Training bulk buy now splits available gold equally across all eligible upgrades in the active section, instead of spending everything on the first one.</li>
      <li>Added new Ascension upgrade: <b>Item % Bonus Cap +</b> — increases the maximum percentage bonuses on items by 5% per level (cost: 1 point per level).</li>
      <li>Rocky Field enemies now have elemental damages and resistances.</li>
    </ul>

    <!-- <span style="color:#FF8A00;">Fixes</span>
    <ul>
      <li>Fixed re-calculation bug when initially loading game.</li>
    </ul> -->
  `;
}
