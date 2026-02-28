const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-02-28</span>
    <hr />

    <span style="color:#00529B;">Features</span>
    <ul>
      <li>Limited experience gain upgrade in soul shop to a maximum of 500 levels.</li>
      <li>Removed max level limits from Mana Shield and Crimson Aegis. Added infinitely scaling mana bonus to Mana Shield and life bonus to Crimson Aegis.</li>
      <li>Added a new <strong>Combat</strong> sub-tab in the Stats screen with derived calculations vs the current enemy: Chance to Hit, Armor Reduction, Evade Chance, per-element Resistance Reduction, expected Avg Hit, expected DPS, and penetration impact.</li>
      <li>Added detailed combat tooltips for Avg Hit, DPS, and physical/elemental penetration bonuses in the Combat sub-tab.</li>
      <li>Hovering a stat in the Stats tab now shows an advanced breakdown of bonus sources (including quests, achievements, ascension, runes, and ad multipliers where applicable).</li>
      <li>Armor, Evasion, Attack Rating, and elemental resistance rows now display their additive bonus percentages in parentheses for consistency with other stats.</li>
      <li>Several intermediate/aggregator stats are now hidden from the main stats panels to keep the UI focused on player-facing values.</li>
      <li>Added new localized labels for combat and stat-breakdown UI content in English, Spanish, and Chinese.</li>
      <li>Disabled milestone multipliers for skills to provide more consistent growth.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed rune scaling so <strong>PerLevel</strong> stats no longer receive tier/stage scaling multipliers.</li>
      <li>Fixed runes dropping with level 1 instead of matching the defeated enemy's level in Rocky Fields.</li>
      <li>Fixed arena skip rune doesnt have tier scaling and always provides 1 boss skip (it will now provide 6 for tier 6 runes).</li>
      <li>Made both Pathfinder and Arena Skip runes Unique and updated their tooltips to dynamically show their exact skip values.</li>
    </ul>
  `;
}
