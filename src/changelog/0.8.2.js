const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-24</span>
    <hr />

    <span style="color:#FF8A00;"> Improvements</span>
    <ul>
      <li>Battle log now shows the cause of damage (auto attack or skill).</li>
      <li>
        Added many new Ascension upgrades: enemy attack speed reduction, cost reductions (training/buildings/crystal
        shop/soul shop), cap increases (attack speed, crit chance, block chance, resurrection), crystal gain %, and
        several combat stats (crit chance/damage, attack rating, hit chance, armor/elemental penetration, block, life
        regen, all res %).
      </li>
      <li>
        Ascension purchase effects now apply immediately where applicable (life/mana upgrades heal/restore instantly;
        shop/training UIs refresh to reflect new cost reductions).
      </li>
      <li>Added ascension. It removes all progress, apart from ascension bonuses.</li>
      <li>
        Ascension now requires 20 prestiges and grants points based on starting crystals, with in-game info and disabled
        button until requirements are met.
      </li>
      <li>Going to any shop tab now immediately updates it, showing what is affordable.</li>
      <li>Percent health and mana regen now increases the % of total bonus.</li>
      <li>Add tooltips for all options, to provide more information about their effects.</li>
      <li>Add mana steal and omni steal stats.</li>
      <li>
        Added "max" button for stage options and now they are automatically set to their maximum value on upgrade. (if
        set to 0 or max).
      </li>
      <li>Added quick access option for stage options below enemy.</li>
      <li>Added option to show large numbers with abbreviations (e.g., 1M for 1,000,000).</li>
      <li>Scaling logic for enemies reworked.</li>
      <li>Added offline progress.</li>
      <li>Added 5 slots for characters.</li>
      <li>Reworked item scaling.</li>
      <li>
        Improved performance of bulk buying. (also increased limit to 1m, which when you try to bulk buy max will still
        cause lagging, after clicking the "max" button. Adviced not to. For big numbers, use input field)
      </li>
      <li>Added a new fighting mode: Rocky Field.</li>
      <li>Added runes.</li>
      <li>Reduced initial rewards from prestige and increased % scaling from arena.</li>
      <li>Reduced experience building scaling and increased cost scaling.</li>
      <li>Added class preview dialog.</li>
      <li>Added crystal shop upgrade to reset soul shop for 300 crystals.</li>
      <li>Added stage lock crystal upgrade to hold progression at a chosen stage.</li>
      <li>Added context menu options for materials in inventory.</li>
      <li>Added colors for different types of skills in skill tree.</li>
      <li>Added short number notation option for large numbers display.</li>
      <li>Added level limits to soul shop upgrades.</li>
      <li>Reduced soul gain by arena bosses by 3x.</li>
      <li>added limit to the % bonuses on items. (which would be possibly surpassed with some upgrades)</li>
      <li>Regeneration of both life and mana is now working outside of combat.</li>
      <li>Added limit on attack speed on items</li>
      <li>Added strength/agility bonuses on axe/mace</li>
      <li>Added crit and double damage modifiers on wands/staves.</li>
      <li>
        Optimized attribute recalculation by batching requests into animation frames, greatly improving responsiveness.
      </li>
    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>
        Fixed Ascension Life upgrade not granting life immediately after purchase; it now recalculates stats and heals
        for the gained amount.
      </li>
      <li>Equipped items no longer disappear in split view.</li>
      <li>
        Re-rolling or transmuting a modifier on item now properly shows the updated values (previously sometimes showed
        html).
      </li>
      <li>Fixed bug where some enemies will not have attack speed</li>
      <li>Fixed alternation orb bug</li>
    </ul>
  `;
}
