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
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed building reward timers when network conditions are poor.</li>
      <li>Fixed input getting out of focus in skill tree.</li>
      <li>Corrected Battlecry skill description to mention only the damage boost.</li>
      <li>Battle log now respects the short number notation option.</li>
      <li>Fixed ascension Crystal Gain % bonus not increasing crystal rewards from all sources.</li>
    </ul>
  `;
}
