const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-30</span>
    <hr>

    <!-- <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Renamed the Berserker's Earthquake skill to Glacial Tremor to better match its cold-focused damage.</li>
      <li>Opened four new boss regions featuring stronger enemies, but rewarding arena skip bonuses.</li>
      <li>High stage enemies now do not drop extra upgrade materials, its always 1.</li>
      <li>Stats panel now shows the combined thorns damage bonus percentage alongside the flat value.</li>
    </ul> -->

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stat range on items, so they always display the correct values.</li>
    </ul>
  `;
}
