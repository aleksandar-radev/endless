const html = String.raw;
export default function run() {
  return html`
<span style="color:#4F8A10;">🗓️ 2025-06-17</span>

<hr>

<span style="color:#1E90FF;">✨ New Features</span>

<ul>
  <li><b>Building Map for Offline Production:</b> <span style="color:gold;">Gold Mine</span>, <span
      style="color:lightblue;">Crystal Lab</span>, <span style="color:#B8860B;">Soul Forge</span> now generate resources
    over time, both in-game and offline.</li>
</ul>

<span style="color:#FFA500;">⚖️ Balance Changes</span>

<ul>
  <li><b>Soul Shop Upgrades:</b> Costs now increase by a flat amount per level.</li>
  <li><b>Item Tier Scaling:</b> Item tier bonuses are now <span style="color:red;">4–8× lower</span> than before.</li>
  <li><b>Percentage Stat Scaling:</b> Lower values for damage percent increases and similar stats.</li>
  <li><b>Quest Item Rewards:</b> Rewards are now one tier lower than before.</li>
</ul>

<span style="color:#32CD32;">🛠️ Fixes</span>

<ul>
  <li><b>Soul Shop Bonuses:</b> Bonuses now display correctly.</li>
  <li><b>Material Tracking:</b> Now counts all materials found, not just +1 per find.</li>
</ul>

<span style="color:#FFD700;">📊 UI & Stats</span>

<ul>
  <li>Added more stats to the <b>Stats</b> tab for display.</li>
  <li>Improved performance for stat allocation.</li>
</ul>
`;
}