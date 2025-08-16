const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"><i class="mdi mdi-notebook"></i> 2025-08-10</span>
  <hr>

  <span style="color:#FFA500;"><i class="mdi mdi-star-four-points"></i> Features & Improvements</span>
  <ul>
    <li>Tracked items found by rarity in statistics.</li>
    <li>Added highest boss level tracking and prestige bonuses scaling.</li>
    <li>Added modal controls and reroll functionality to prestige system.</li>
    <li>Added claim all quests button.</li>
    <li>Added item filtering and advanced tooltips for items.</li>
    <li>Added inventory sorting options.</li>
    <li>Added countdown timer for buildings.</li>
    <li>Added 'Show All Stats' option in UI.</li>
    <li>Added rate counters for damage and XP tracking.</li>
    <li>Added extra damage stats: life regen and evasion percentages in offense stats and UI.</li>
    <li>Added summon bat skill to vampire.</li>
    <li>Added slider for training to purchase arbitrary amount.</li>
    <li>Added enemies killed per region statistics.</li>
    <li>Added reset stage skip option & crystal upgrade.</li>
    <li>Added more soul shop bonuses and resistance % bonuses to items.</li>
    <li>Added item upgrade cost by tier.</li>
    <li>Added prestige history.</li>
  </ul>

  <span style="color:#1E90FF;"><i class="mdi mdi-wrench"></i> Improvements & Refactoring</span>
  <ul>
    <li>Refactored boss and enemy resistance calculations and scaling.</li>
    <li>Refactored stats display logic and material handling in inventory.</li>
    <li>Refactored warrior, paladin, rogue, vampire, and druid skills for balance and clarity.</li>
    <li>Refactored combat calculations and region resistance attributes.</li>
  </ul>

  <span style="color:#4F8A10;"><i class="mdi mdi-refresh"></i> Balance Changes</span>
  <ul>
    <li>Adjusted enemy scaling, resistances, and boss scaling for lower tiers and various environments.</li>
    <li>Adjusted berserker, warrior, druid, and vampire skills for cooldown, crit, life steal, and mana cost.</li>
    <li>Adjusted prestige requirements and bonuses, reduced soul shop upgrade costs.</li>
    <li>Adjusted hit chance, resistance reduction, and scaling for mobs and items.</li>
    <li>Increased armor, hit chance, evasion cap, and item scaling for higher rarities and tiers.</li>
    <li>Reduced extra damage from life scaling on paladin and nerfed mage summon elemental.</li>
    <li>Increased overall mana cost of skills per level.</li>
    <li>Limited highest item level to highest reached stage for region.</li>
    <li>Increased salvage materials and gold for higher tier items.</li>
    <li>Reduced prestige requirements and lower prestige bonuses.</li>
    <li>Made higher tier items more powerful, increased scaling for low tier zones.</li>
    <li>Switching zones resets stage; mana and life not healed when fight stopped.</li>
    <li>XP required increases every 50 levels.</li>
  </ul>

  <span style="color:#FF0000;"><i class="mdi mdi-wrench"></i> Fixes</span>
  <ul>
    <li>Fixed lag for dev tools and material drop chance issues.</li>
    <li>Fixed inventory and materials centering on Firefox.</li>
    <li>Fixed item dupe bug and item stat reduction calculations.</li>
    <li>Fixed bug where toggle skills do not work with multiple actives.</li>
    <li>Fixed gold/xp display values and cooldown/duration decimal places.</li>
  </ul>
  `;
}
