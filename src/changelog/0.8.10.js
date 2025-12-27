const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-28</span>
    <hr />

    <!-- <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Nerfed avatar of nature druid skill.</li>
    </ul> -->

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed Soul Shop Max quick buys showing shared allocations instead of each upgrade's true maximum.</li>
      <li>Restored building upgrade cost display even when the selected upgrade is currently unaffordable.</li>
      <li>
        Corrected Rocky Field elemental resistance scaling so high-tier enemies gain resistances alongside their armor.
      </li>
    </ul>
  `;
}
