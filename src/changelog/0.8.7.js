const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-19</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Instant skills are now split into <b>attack</b> and <b>spell</b> types. Attack skills behave like regular strikes (they can miss and trigger life/mana steal), while spells never miss, only apply their listed damage types, and received roughly 4× stronger damage bonuses so they remain competitive. Omni steal continues to apply to both.</li>
      <li>Skill tooltips now label instant abilities as attack skills or spells right next to their type badge for quicker identification.</li>
    </ul>
  `;
}
