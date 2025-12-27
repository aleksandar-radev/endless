const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-27</span>
    <hr />

    <span style="color:#FF8A00;">Major Changes - Skill System Overhaul</span>
    <ul>
      <li>
        <strong>Skill Point Cost:</strong> Changed from progressive cost (+1 every 50 levels) to flat 1 skill point per level.
        All existing characters will receive a refund for the difference.
      </li>
      <li>
        <strong>New Scaling System:</strong> Skills now use improved scaling formulas:
        <ul>
          <li>Percentage bonuses transition smoothly from logarithmic growth (early game) to linear growth (end game) after level 200</li>
          <li>Flat damage scales linearly with milestone multipliers every 50 levels</li>
          <li>Chance-based stats have clear caps and linear progression</li>
        </ul>
      </li>
      <li>
        <strong>Synergy System:</strong> Skills can now synergize with each other, providing percentage bonuses and additional effects.
        Check skill descriptions for synergy information (UI display coming soon).
      </li>
      <li>
        <strong>Balance Changes:</strong> Passive and toggle skills now primarily provide flat bonuses instead of percentage bonuses.
        Percentage bonuses are mainly found on instant/buff skills and synergies.
      </li>
    </ul>

    <span style="color:#FF8A00;">Warrior Skills Updated</span>
    <ul>
      <li>All Warrior skills have been refactored to use the new scaling system</li>
      <li>Added synergies between related skills (e.g., Bash synergizes with Battle Cry, Iron Will with Toughness)</li>
      <li>Rebalanced to focus on flat bonuses for passives and toggles</li>
      <li>Instant and buff skills can still provide percentage bonuses for burst power</li>
    </ul>

    <span style="color:#FF8A00;">Known Issues</span>
    <ul>
      <li>Other class skills (Rogue, Vampire, Paladin, Berserker, Elementalist, Druid, Mage) still use the old scaling system and need to be updated</li>
      <li>Synergy information not yet displayed in skill tooltips</li>
      <li>Mixed classes may have balance issues until all skills are updated</li>
    </ul>

    <span style="color:#FF8A00;">Technical Details</span>
    <ul>
      <li>Added getDamagePercent() - Smooth logarithmic-to-linear transition at softcap (level 200)</li>
      <li>Added getFlatDamage() - Linear growth with milestone multipliers every 50 levels</li>
      <li>Added getChanceStat() - Linear scaling with hard caps for chance-based stats</li>
      <li>Added getSynergyBonus() - Calculate percentage multipliers from synergy source skills</li>
      <li>Updated calculateSkillPointCost() to return flat 1 point per level</li>
      <li>Added applySkillSynergies() method to SkillTree class</li>
      <li>Created migration 0.9.1.js to refund skill points from cost structure change</li>
    </ul>
  `;
}
