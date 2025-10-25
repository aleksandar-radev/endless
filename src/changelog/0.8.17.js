const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-30</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Renamed the Berserker's Earthquake skill to Glacial Tremor to better match its cold-focused damage.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Prevented life-costing instant skills from activating when the hero lacks enough life, eliminating self-defeating casts.</li>
    </ul>
  `;
}
