const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-XX-XX</span>
    <hr>

    <span style="color:#FF8A00;">Major Updates - Skill System Redesign</span>
    <ul>
      <li><strong>New Skill Cost System:</strong> Skills now cost a flat 1 Skill Point per level (changed from progressive cost of +1 SP every 50 levels).</li>
      <li><strong>Skill Point Refund:</strong> All players will receive a refund of excess skill points spent under the old system.</li>
      <li><strong>New Skill Scaling Functions:</strong> Implemented segmented scaling for skill bonuses:
        <ul>
          <li>Early game: Non-linear growth (logarithmic/square root) for powerful initial progression</li>
          <li>End game: Linear growth after level 200 softcap for infinite scaling</li>
          <li>Smooth transitions ensure no jumps or kinks in progression</li>
        </ul>
      </li>
      <li><strong>Skill Synergy System:</strong> Some skills now provide bonuses to related skills (e.g., Iron Will benefits from Toughness, Power Strike benefits from Iron Will).</li>
    </ul>

    <span style="color:#FF8A00;">Skill Changes</span>
    <ul>
      <li><strong>Toggle Skills:</strong> Removed percentage bonuses, now provide only flat bonuses to prevent multiplicative stacking issues.</li>
      <li><strong>Passive Skills:</strong> Rebalanced to provide appropriate mix of flat and percentage bonuses.</li>
      <li><strong>Milestone System:</strong> Flat damage increases now get multiplier jumps every 50 levels (e.g., 1.2x at level 50, 1.44x at level 100, etc.).</li>
      <li><strong>Chance-based Stats:</strong> Skills providing critical chance, block chance, etc., now have appropriate hard caps.</li>
      <li><strong>Warrior Skills:</strong> Completely rebalanced with new scaling system (all 21 skills updated).</li>
      <li><strong>Other Classes:</strong> Similar updates needed for Rogue, Vampire, Paladin, Berserker, Elementalist, Druid, and Mage (in progress).</li>
    </ul>

    <span style="color:#FF8A00;">Technical</span>
    <ul>
      <li>Added three new scaling functions: <code>getPercentBonus()</code>, <code>getFlatBonus()</code>, and <code>getChanceBonus()</code>.</li>
      <li>Implemented synergy calculation system in skill tree.</li>
      <li>Created migration script to refund skill points from old cost system.</li>
    </ul>

    <span style="color:#FF8A00;">Known Issues</span>
    <ul>
      <li>Skill synergies not yet displayed in UI tooltips (functionality works, UI pending).</li>
      <li>Only Warrior class fully updated; other classes need similar treatment.</li>
      <li>UI needs update to reflect flat 1 SP cost per level.</li>
    </ul>
  `;
}
