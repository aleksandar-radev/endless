const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-25</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Instant skills are now split into <b>attack</b> and <b>spell</b> types. Attack skills behave like regular strikes (they can miss and trigger life/mana steal), while spells never miss, only apply their listed damage types, and received roughly 4× stronger damage bonuses so they remain competitive. Omni steal continues to apply to both.</li>
      <li>Skill tooltips now label instant abilities as attack skills or spells right next to their type badge for quicker identification.</li>
      <li>Training elemental damage upgrades have been merged into a single <b>Elemental Damage</b> option that costs 90 gold per level and unlocks distribution sliders accessible from Training and the Stats tab for fine-tuning how both training and intelligence elemental damage are split.</li>
      <li>Rocky Field conversion runes now roll between 10% and 150% everywhere. And can drop on any stage and region (lower chance on lower stages or weaker regions)</li>
      <li>The arena now features multiple boss regions.</li>
    </ul>

    
    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stage lock bug where the stage lock setting would remain enabled and locked at a specific value after prestige, even when the stage lock crystal shop upgrade was not repurchased. Stage lock options are now properly reset to their default disabled state after each prestige.</li>
    </ul>
  `;
}
