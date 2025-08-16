
const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"><i class="mdi mdi-notebook"></i> 2025-07-30</span>
  <hr>

  <span style="color:#FFA500;"><i class="mdi mdi-star-four-points"></i> Features & Improvements</span>
  <ul>
    <li>Warrior and Paladin reworked to be more competitive (more damage, speed)</li>
    <li>New skills for Paladin and Warrior.</li>
    <li>Added new offensive stats (extra damage from life, armor/elemental penetrations and others.)</li>
    <li>Scaled down all skills on higher levels.</li>
    <li>Added a death sound for enemies. (usefull to know if game is going on or has stopped)</li>
    <li>Balanced enemy damage across all regions and rebalanced enemies (more life, less damage overall).</li>
    <li>Fixed all decimal calculation issues. (resistance display bug)</li>
    <li>Fixed thorns damage bug.</li>
    <li>Fixed inventory replacement when unequipping items.</li>
    <li>Fixed boss not being reset after purchasing reset arena crystal upgrade.</li>
    <li>Adjusted stat scaling on items, reducing scaling at higher levels. Also capped some bonuses on items (like gold, xp bonus).</li>
    <li>Kept boss level, stage, tabs, and fight mode on refresh.</li>
    <li>Disabled leaderboard.</li>
  </ul>
  `;
}
