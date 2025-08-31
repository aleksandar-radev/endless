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
      <li>Scaling logic for enemies reworked.</li>
      <li>Added offline progress.</li>
      <li>Added 5 slots for characters.</li>
      <li>Reworked item scaling.</li>
      <li>Improved performance of bulk buying. (also increased limit to 1m, which when you try to bulk buy max will still cause lagging, after clicking the "max" button. Adviced not to. For big numbers, use input field)</li>
      <li>Added a new fighting mode: Rocky Field.</li>
      <li>Added runes.</li>

    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>Equipped items no longer disappear in split view.</li>
      <li>Re-rolling or transmuting a modifier on item now properly shows the updated values (previously sometimes showed html).</li>
    </ul>
  `;
}
