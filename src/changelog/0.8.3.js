const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-19</span>
    <hr>

    <span style="color:#FF8A00;"> Improvements</span>
    <ul>
      <li>Prestige no longer resets Ascension points or upgrades; Ascension progress persists across prestiges.</li>
      <li>Ascension now preserves all settings/options (same as Prestige), while still resetting all other progress.</li>
    </ul>
  `;
}

