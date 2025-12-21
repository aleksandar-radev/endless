const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-21</span>
    <hr>

    <span style="color:#FF8A00;">Balance Changes</span>
    <ul>
      <li>Completely redesigned mob and item scaling for the Explore region to be simpler and more consistent.</li>
      <li>Mobs now scale 5x per region tier (multiplicative from previous tier).</li>
      <li>Mobs now scale 10% per stage based on the base value at stage 1.</li>
      <li>Item flat values now scale 2x per tier (multiplicative from previous tier).</li>
      <li>Item percent values now scale 1.3x per tier (multiplicative from previous tier).</li>
      <li>Item flat values now scale 0.8% per level based on the base value at level 1.</li>
      <li>Item percent values now scale 0.1% per level based on the base value at level 1.</li>
    </ul>

    <span style="color:#FF8A00;">Technical</span>
    <ul>
      <li>Added a scaling system configuration flag to easily switch between the new simplified scaling and the legacy scaling system if needed.</li>
      <li>Removed complex tier-based scaling logic from enemy calculations.</li>
      <li>Consolidated scaling constants in a centralized location for easier balancing.</li>
    </ul>
  `;
}
