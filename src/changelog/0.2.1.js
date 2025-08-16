const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"><i class="mdi mdi-calendar"></i> 2025-07-04</span>

<hr>

<span style="color:#1E90FF;"><i class="mdi mdi-star-four-points"></i> New Features</span>
<ul>
  <li><b>New Elements:</b> Water and Lightning elements added. (No new skills or interactions yet)</li>
  <li><b>Materials Auto consume:</b> Added a crystal upgrade for auto consumption of materials.</li>
</ul>

<span style="color:#FFA500;"><i class="mdi mdi-scale-balance"></i> Balance Changes</span>
<ul>
  <li><b>Boss:</b> Few adjustments, increased xp/gold gains.</li>
</ul>
<span style="color:#FFA500;"><i class="mdi mdi-bug"></i> Bug fixes</span>
<ul>
  <li>Killing a boss was giving the rewards for the next boss</li>
  <li>elemental resistances not showing correctly for bosses</li>
  <li>elemental damages for bosses not incrementing per boss level</li>
</ul>
`;
}