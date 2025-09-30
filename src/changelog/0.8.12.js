const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-28</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Enabled dual wielding for swords, axes, wands, and shields with smarter slot selection.</li>
      <li>Converted maces and staves into two-handed weapons with doubled stat rolls and proper off-hand restrictions.</li>
      <li>Added flat and percent thorns damage as possible shield affixes.</li>
      <li>Improved thorns damage scaling with new training options and global damage bonuses.</li>
      <li>Introduced the Paladin's Thorned Bulwark passive at level 25, letting endurance grant thorns damage and clarifying how thorns scale.</li>
      <li>Reduce max level of ascension bonus for chance to hit.</li>
      <li>Increase xp and gold gain from rocky field.</li>
      <li>Optimized offline reward distribution for building materials and salvaged items to avoid long stalls when massive quantities are generated.</li>
      <li>Greatly accelerated offline fight reward application even when only experience and gold are collected by batching level-up calculations.</li>
      <li>Bulk buy option now adds a skill tree bulk allocate control that splits skill points evenly across every eligible skill.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Skill tree reset now refunds all skill points earned from ascension bonuses and runes.</li>
      <li>Stopped ascension soul shop cap increases from affecting extra material drop chance and drop cap upgrades.</li>
      <li>Resource-scaling damage bonuses now include stats granted by runes that convert other attributes into life or mana. (e.g. res to mana conversion now applies before extra damage from mana is added. Same with life.)</li>
      <li>Fixed the offline eligibility icons so they return to the red ✖ whenever offline progress is no longer available.</li>
    </ul>
  `;
}
