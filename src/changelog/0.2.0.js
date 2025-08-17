const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"> 2025-07-04</span>

<hr>

<span style="color:#1E90FF;"> New Features</span>
<ul>
  <li><b>Salvage System:</b> New salvage system added, including auto-salvage.</li>
  <li><b>New Stats:</b> Evasion and Elemental Resistances introduced.</li>
  <li><b>Early Quest Rewards:</b> Some early quests now also reward items.</li>
  <li><b>New Materials:</b> Added <i>enchantment scroll</i>, <i>alternation orb</i>, <i>greater xp potion</i>.</li>
</ul>

<span style="color:#FFA500;"> Balance Changes</span>
<ul>
  <li><b>Training:</b> Now has maximum level for some stats. Costs have been adjusted.</li>
  <li><b>Item Stats:</b> Reworked for more stable progression throughout the game.</li>
  <li><b>Enemies:</b> Reworked; now have armor, evasion, resistances, and elemental damages.</li>
  <li><b>Buildings:</b> Increased cost for buildings.</li>
  <li><b>Class Paths:</b> Instantly receive Warrior at level 1; other class paths unlock as you progress.</li>
  <li><b>Skills:</b> All class skills reworked to provide mostly percentage bonuses, making each class viable for
    different builds.</li>
  <li><b>Dexterity:</b> Now provides Evasion instead of Critical Damage.</li>
  <li><b>Soul Shop:</b> Damage boost now buffs total damage instead of just physical damage.</li>
</ul>
`;
}