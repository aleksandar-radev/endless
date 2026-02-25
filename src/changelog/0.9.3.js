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
      <li>Ascension bonus for All damages now gives elemental damage only, and is added to "Damage Allocation" dialog, to allocate the element you want.</li>
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
      <li>Fixed specialization bulk cost getting hidden after update (e.g. level up).</li>
      <li>Fixed Shadowdancer's Shadow Clone passive and Weaponmaster's Animated Weapons skills reducing summon damage when it is low level (e.g. below 100% bonus).</li>
      <li>Fixed Vampiric rune sometimes providing no bonus at all. Also, reducing the max bonus it can give to 1%. (also, it doesn't scale with tier anymore)</li>
    </ul>

    <span style="color:#4F8A10;">New Content</span>
    <ul>
      <li>Added Swiftcast Rune: reduces skill cooldowns (2–10%).</li>
      <li>Added Persistence Rune: increases buff duration (5–25%).</li>
    </ul>
  `;
}
