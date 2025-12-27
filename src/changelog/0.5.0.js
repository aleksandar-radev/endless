const html = String.raw;
export default function run() {
  return html` <span style="color:#4F8A10;"> 2025-07-16</span>
    <hr />

    <span style="color:#FFA500;"> Balance Changes</span>
    <ul>
      <li>Adjusted blockChance training cost and max level.</li>
      <li>Reduced XP and gold per level for bosses and monsters.</li>
      <li>Increased HP regen from Perseverance</li>
      <li>Reduced overall damage bonuses for all damage sources.</li>
      <li>Reduced prestige bonuses by nearly half.</li>
      <li>Reduced overall xp gained by enemies (which is somewhat mitigated by reaching higher stages).</li>
      <li>
        Elementalist inherent bonuses reduced. 15 all elemental damage to 8 all elemental damage. But gained a % bonus
        to intelligence (10)
      </li>
      <li>Reduced souls obtained by killing bosses by a factor of ~3.</li>
      <li>Increased boss scaling per level.</li>
      <li>Reduced damage bonus from Soul Shop by half.</li>
      <li>Rogue nerfs.</li>
      <li>Lowered enemy scaling overall. Higher stages will have weaker enemies. Especially on higher tiers.</li>
    </ul>

    <span style="color:#FFA500;"> Bug Fixes</span>
    <ul>
      <li>
        Fixed damage calculation for hero: % damage bonus and % total damage bonus were stacking incorrectly, causing
        very high values.
      </li>
      <li>Hotfix: after killing a boss, the next was unable to be defeated.</li>
    </ul>

    <span style="color:#FFA500;"> Features & Improvements</span>
    <ul>
      <li>Added minimum cooldown (20% of total) and new cooldown calculation</li>
      <li>Added in-house login and logout functionality, including logout button.</li>
    </ul>`;
}
