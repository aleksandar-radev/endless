const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-24</span>
    <hr>

    <span style="color:#FF8A00;"> Improvements</span>
    <ul>
      <li>Going to any shop tab now immediately updates it, showing what is affordable. </li>
      <li>Percent health and mana regen now increases the % of total bonus.</li>
      <li>Add tooltips for all options, to provide more information about their effects.</li>
      <li>Add mana steal and omni steal stats.</li>
      <li>Added "max" button for stage options and now they are automatically set to their maximum value on upgrade. (if set to 0 or max).</li>
      <li>Added quick access option for stage options below enemy.</li>
    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>Equipped items no longer disappear in split view.</li>
    </ul>
  `;
}
