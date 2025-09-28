const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-26</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Added upgrade-all and max controls to equipment material upgrade dialogs.</li>
      <li>Added a prestige card reroll option to randomize bonus values on a chosen card with an increasing crystal cost.</li>
      <li>Add different colors for damages based on highest.</li>
      <li>Limit passive life and mana regeneration updates to 5 times per second and hide their battle log entries.</li>
      <li>Add % bonuses after the flat values on simple stats view (when show all stats option is disabled).</li>
      <li>Renamed Soul Shop upgrades to match their bonuses and doubled the Total Damage % upgrade cost while increasing its value to 1% per level.</li>
      <li>Added a Flat Penetration % stat and Soul Shop upgrade that boosts flat armor and elemental penetration by 5% per level.</li>
      <li>Display life and mana steal or per-hit gains above the hero as floating combat text.</li>
      <li>Reduced vitality bonuses on vampire a little.</li>
      <li>Expanded rune conversions to cover defensive, mana, evasion and resistance stats, and upgraded the rune inventory with 10 tabs plus shared frozen slots that are ignored by bulk salvage.</li>
      <li>Raised rocky field common rune drop chance, reshaped conversion rolls to produce a broader spread with rare 100%+ highs, and reduced rune salvage crystal yields.</li>
      <li>Added a rune search filter that highlights matching slots and tabs and updated sorting to surface unique runes and the highest conversion rates first.</li>
      <li>Crystal shop stage options now apply to Rocky Field enemies just like Explore combat.</li>
      <li>Elementalist's lightning strike cooldown increased to 3500ms and % damages reduced.</li>
      <li>Slightly reduced hp on enemies and increase gold gains (on Explore).</li>
      <li>Reworked all combat modes and regions, to have much more variety.</li>
      <li>Allow partial sell of buildings. Managed by the same system as upgrades.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed building reward timers when network conditions are poor.</li>
      <li>Fixed input getting out of focus in skill tree.</li>
      <li>Corrected Battlecry skill description to mention only the damage boost.</li>
      <li>Battle log now respects the short number notation option.</li>
      <li>Fixed ascension Crystal Gain % bonus not increasing crystal rewards from all sources.</li>
      <li>Rune conversions now operate on fully modified totals, so resource and resistance swaps transfer the expected amounts.</li>
      <li>Ensured conversion runes that touch damage stats also add their values to the destination stat instead of removing the source without a gain.</li>
      <li>Resolved equipped runes being shifted into frozen inventory slots after reloading.</li>
      <li>Stopped equipping duplicate runes simultaneously and fixed conversion stacking so each rune moves its full percentage from the original stat.</li>
    </ul>
  `;
}
