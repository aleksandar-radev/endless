const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"> 2025-08-18</span>
  <hr>

  <span style="color:#0078d7;"> Improvements</span>
  <ul>
    <li>Added 2 new buildings: Experience Workshop and Material Depot.</li>
    <li>Added bulk buy option in training.</li>
    <li>Improve design of class name (font, color) and add level next to it.</li>
    <li>item stat scaling has been changed a little. Bonuses will scale a little faster on lower levels. Some modifiers have been increased (like armor, evasion, mana and others).</li>
    <li>Added current bonus for prestige. Now its clear what % bonus you currently have from killing bosses.</li>
    <li>Salvage buttons and overall style was changed.</li>
    <li>Increased responsiveness for inventory, salvage and prestige tabs overall.</li>
    <li>Changed legendary items color to some type of green (dark orange before).</li>
    <li>Added an option to display numeric cooldowns for skills.</li>
    <li>Upon death, skill cooldowns are now being reset.</li>
    <li>Moved life regen from total % next to life regen in training, so all elemental damages show next to each other better on big screens.</li>
    <li>Added tabs for options, to better organize settings.</li>
    <li>Background for inventory items is not darker.</li>
    <li>Improved performance for multiple level ups.</li>
    <li>Reversed battle log, and is not frozen by default to avoid additional lag.</li>
    <li>All options are now preserved between prestiges, apart from the ones that are purchased from the crystal shop.</li>
    <li>Buildings can now be upgraded without opening the map. (Map itself might be removed in the future.)</li>
    <li>Improved overall performance a little.</li>
    <li>Added an option to allow numeric inputs for buying upgrades (training, soul shop). With 10k limit.</li>
    <li>Added an option to allow bulk purchase in training. (buying all upgrades at once, for the same amount)</li>
    <li>Added hero level tracking in statistics. Now you can see what level you did your prestige in history</li>
    <li>Reduced gold gains from higher tier enemies a little.</li>
    <li>Added a new language: Chinese. Still not everything is translated, although many things already are.</li>
    <li>Berserker class reworked (remains mostly the same, but should be stronger).</li>
    <li>Percent damage from life, armor, evasion have been nerfed (nearly 2 times weaker now).</li>
    <li>Vitality bonusees on vampire have been reduced a little.</li>
    <li>Warrior armor bonuses have been reduced a little</li>
    <li>Text on filter input in inventory is now dark, to be better visible.</li>
    <li>Increased maximum allowed size for save on server, so there should be no problems with saving progress anymore.</li>
    <li>Vampire draining touch skill description has been improved.</li>
    <li>Overall attack rating and evasion has been reduced by 40% for all enemies and 30% for bosses.</li>
    <li>Remove level cap on all druid skills.</li>
    <li>Changed function calculating xp requirement per level.</li>
  </ul>

  <span style="color:#FF8C00;"> Fixes & polish</span>
  <ul>
    <li>Fixed a bug causing most damage calculations to be doubled.</li>
    <li>Fixed a bug when upon gaining souls/crystals/gold the UI was not updating correctly for the shops.</li>
    <li>Added additional guard to avoid getting rewards from killing an enemy after prestige.</li>
    <li>Fixed a bug where sometimes reseting boss level could cause issues.</li>
    <li>Fixed a bug where drag and drop on trash always salvaged items for gold.</li>
  </ul>
  `;
}
