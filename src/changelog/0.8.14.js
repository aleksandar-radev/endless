const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-05</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Smoothed out saving with a 5-second debounce, cached encryption, and a live "last saved" HUD indicator so progress is preserved without hammering the browser.</li>
      <li>Show stage controls under enemy option now works for Rocky Field as well.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Stopped material drop rolls in Explore mode from spawning massive allocation loops that caused out-of-memory crashes at extreme stages.</li>
      <li>Removed cached save snapshots from the stored payload so local saves no longer double in size and immediately exceed browser quotas.</li>
    </ul>
  `;
}
