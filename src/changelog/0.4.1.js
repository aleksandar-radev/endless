const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;">📝 2025-07-14</span>
<hr>

<span style="color:#FFA500;">⚖️ Balance Changes</span>
<ul>
  <li>Increase cooldown and reduce duration of all skills.</li>
  <li>Add resistance reduction based on region. Each region now reduces your overall resistance by 5.</li>
  <li>Overall item drop chance increased.</li>
  <li>Adjust scaling for bosses/enemies. Now enemies on higher tiers are much stronger and more rewarding.</li>
  <li>Reduced prestige requirements. From level 5000 to level 500, and boss level from 500 to 200.</li>
  <li>Removed level/crystal requirements from class paths, increase skill tree reset price to 50 crystals.</li>
  <li>Gold mine cost reduced further.</li>
  <li>Reduced soul upgrade costs.</li>
  <li>Dexterity now provides 5 evasion, 4 before.</li>
  <li>Change +10 skill to +25 bulk upgrade.</li>
  <li>Rebalanced some stats & all skills. Especially Paladin.</li>
</ul>

<span style="color:#FFA500;">🪲 Bug Fixes</span>
<ul>
  <li>Fixed material sorting. Materials can now be dragged and dropped.</li>
  <li>Fixed enemy defeat handling to prevent multiple kills in the same tick.</li>
  <li>Fixed life regeneration bug. (for % of life)</li>
</ul>

<span style="color:#FFA500;">✨ Features & Improvements</span>
<ul>
  <li>Add total earned tracking for buildings and update UI accordingly.</li>
</ul>`;
}