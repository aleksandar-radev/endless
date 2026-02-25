const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-02-24</span>
    <hr />

    <span style="color:#4F8A10;">Improvements</span>
    <ul>
      <li>Increased experience gained from Rocky Field enemies.</li>
      <li>Increased damage on bosses by 25%.</li>
      <li>Reduced elemental damage in training cost from 90 to 50.</li>
      <li>Added a Sell Mode toggle to the buildings header when Quick Buy is enabled. Toggling it on makes clicking a building sell it (using the selected quantity) instead of upgrading.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed skills that reduce enemy damage not working on Rocky Field enemies (and breaks the whole game).</li>
      <li>Fixed crystals gained from runes.</li>
      <li>Fixed a bug where prestige bonuses are applied twice, once for 100% of their value and once for 1% of their value, making it total of 101%.</li>
      <li>Fixed all attributes bonuses were not applied correctly (from prestige).</li>
      <li>Fixed resistances from training would give  very low amounts of resistance.</li>
      <li>Fixed scaling of holy light and greater healing skills of paladin. (higher flat, lower scaling of percent healing)</li>
      <li>Fixed tooltips of ascension bonuses.</li>
    </ul>
  `;
}
