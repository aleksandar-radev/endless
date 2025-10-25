const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-25</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Limited extra damage gained from resource percentage bonuses to 1,000 of the source stat per hero level and added an ascension upgrade that raises that per-level cap.</li>
      <li>Split Options quick-set buttons so you can jump straight to minimum or maximum values for starting stage, stage skip, and related inputs, and apply those values instantly without an extra button.</li>
      <li>Rebalanced many skills across all classes to improve early-game performance and reduce the gap between different playstyles.</li>
      <li>Clarified ignore enemy armor/resistance modifiers in skill and item tooltips by removing misleading numeric values.</li>
      <li>Locked equipment stat re-roll buttons once a stat hits its maximum possible value to prevent accidentally losing perfect rolls.</li>
      <li>Raised the global quick-buy limit to 1,000,000,000 so bulk actions share the same generous ceiling.</li>
      <li>Reworked Soul Shop max calculations to stay lightning fast even with billions of available souls.</li>
      <li>Added total potential damage to instant skill tooltips.</li>
      <li>Added bottom border on prestige bonuses, so it's more visible how strong the bonus is (0-100%).</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Stabilized offline reward detection so closing the browser without manually closing the tab still grants the accumulated bonuses on the next login.</li>
    </ul>
  `;
}
