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
      <li>Hovering a stat in the Stats tab now shows an advanced breakdown of bonus sources (including quests, achievements, ascension, runes, and others).</li>
      <li>Armor, Evasion, Attack Rating, and elemental resistance rows now display their additive bonus percentages in parentheses for consistency with other stats.</li>
      <li>Several intermediate/aggregator stats are now hidden from the main stats panels to keep the UI focused on player-facing values.</li>
      <li>Disabled milestone multipliers for skills to provide more consistent growth.</li>
      <li>@@@Added inventory tabs@@@.</li>
      <li>Rune stat values now use short number notation when the option is enabled.</li>
      <li>Runes now require the player to have reached the rune's tier region and level before equipping.</li>
      <li>If a rune is already equipped but the player no longer meets its requirements (e.g. after ascending), it is moved back to inventory or disabled.</li>
      <li>Added new <strong>Attribute Scholar Rune</strong> (unique) that grants +1 to +6 attribute points per level based on tier.</li>
      <li>Increased base rune equip slots from 1 to 3.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed rune scaling so <strong>PerLevel</strong> stats no longer receive tier/stage scaling multipliers.</li>
      <li>Fixed runes dropping with level 1 instead of matching the defeated enemy's level in Rocky Fields.</li>
      <li>Fixed arena skip rune doesnt have tier scaling and always provides 1 boss skip (it will now provide 6 for tier 6 runes).</li>
      <li>Made both Pathfinder and Arena Skip runes Unique and updated their tooltips to dynamically show their exact skip values.</li>
      <li>Fixed boss loot item level. Now the level on items better match explore drops.</li>
      <li>Reduced Attributes Per Level ascension upgrade cost to 10 ascension points, increasing by 2 per level.</li>
      <li>Fixed skill hotkeys triggering while typing in input fields (e.g. Lock at Stage, bulk skill allocation).</li>
    </ul>
  `;
}
