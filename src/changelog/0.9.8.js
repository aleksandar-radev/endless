const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-03-20</span>
    <hr />

    <span style="color:#00529B;">Features</span>
    <ul>
      <li>Added a new <strong>Gamble Shop</strong> where you can spend gold to obtain random items of a selected tier.</li>
      <li>Gambled items scale with the highest stage reached in the selected tier and can roll any rarity, including Unique and Set items.</li>
      <li>Items won from gambling go to a temporary stash where you can inspect, sell, or move them to your inventory.</li>
    </ul>


    <span style="color:#9F6000;">Improvements</span>
    <ul>
      <li>Achievements now persist through prestige/ascend. They have around 4x greater highest level, but much reduced rewards.</li>
      <li>Reduced achievement target scaling by about 2x across the board.</li>
      <li>Increased XP needed on higher levels.</li>
      <li>Buff druid's Wild Communion specialization skill.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed Shapeshifter druid snake form (and overall poison damages).</li>
      <li>Fixed rune search functionality in the inventory to correctly find and highlight matching runes by filtering unique stats.</li>
      <li>Improved rune search to allow multiple search terms to match independently.</li>
      <li>Fixed missing CSS styles for the dimming and highlighting of matched runes and their tabs.</li>
      <li>Fixed crystal costs in crystal shop to always be full numbers (no decimals anymore).</li>
      <li>Fixed overkill damage on Arena.</li>
      <li>Fixed arena boss skip and stage skip options not applying correctly when initially unlocked.</li>
      <li>Reduced rune stage scaling by a factor of 2.</li>
      <li>Fixed arena skip rune effect not applying sometimes.</li>
      <li>Fixed Elemental Ascension skill giving 0% bonus at all levels for the extraDamageFromAllResistancesPercent stat.</li>
    </ul>
  `;
}
