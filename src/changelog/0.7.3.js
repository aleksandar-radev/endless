const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-15</span>
    <hr />

    <span style="color:#FFA500;"> Features & Improvements</span>
    <ul>
      <li>
        Added language selection (currently english and spanish, where most things remain in english. Will soon add
        other languages (chinese as requested))
      </li>
      <li>New tier sorting options; sorting moved to the options (previously salvage)</li>
      <li>Experience bar added to the character UI</li>
      <li>Quest rewards now include materials. Currently only experience potions for reached stages</li>
      <li>Death tracking added to Statistics</li>
      <li>Quick Training option to buy upgrades without opening a dialog</li>
      <li>Improved item and attribute tooltips with clearer grouping and details</li>
      <li>Enhanced prestige info (card details, preserved options) and prestige level shown</li>
      <li>Most options now persist across prestiges</li>
      <li>Inventory + Stats split view available</li>
    </ul>

    <span style="color:#1E90FF;"> Balance Changes</span>
    <ul>
      <li>
        Adjusted XP and gold from enemies and bosses; fixed bonus XP/gold issues. Now experience bonus and gold bonus
        are calculated correctly.
      </li>
      <li>
        Reduced scaling for higher-tier items; unified item stat multipliers. Now normal rarity items are as strong as
        mythic items, just with fewer bonuses.
      </li>
      <li>Increased stage quest rewards in higher-tier zones</li>
      <li>Lower cap for Paladin extra damage from Life passive</li>
      <li>Training cost for elemental damage set to 180</li>
      <li>
        Prestige progression: level requirement increase reduced from 50 to 25. There is a cap at 1000 level, where
        further prestiges will not increase the level requirement.
      </li>
      <li>Crystal Shop prices adjusted for skill tree, attributes reset, continuous play.</li>
      <li>Early prestige bonus from boss kills increased.</li>
    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>
        Damage calculations unified so all damage types are applied correctly. (was a bug with elemental storm skill
        damage calculation)
      </li>
      <li>Optimized material drop calculation. Drop of multiple materials should not be causing lag.</li>
      <li>Various UI polish (enemy stats readability, toggle effects apply instantly)</li>
      <li>Fixed highest boss level not kept after resetting boss level</li>
      <li>Fixed material icons sometimes not showing the correct icon</li>
      <li>Fixed red dot indicator on inventory not shown if item automatically salvaged</li>
      <li>Fixed materials from item salvage now not included in counter bar</li>
    </ul>
  `;
}
