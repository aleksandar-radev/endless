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
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fix crystals gained from runes.</li>
      <li>Fix a bug where prestige bonuses are applied twice, once for 100% of their value and once for 1% of their value, making it total of 101%.</li>
      <li>Fix a bug where all attributes bonuses were not applied correctly (from prestige).</li>
      <li>Fix a bug where resistances from training would give  very low amounts of resistance.</li>
    </ul>
  `;
}
