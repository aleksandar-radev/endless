const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-26</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Add different colors for damages based on highest.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed building reward timers when network conditions are poor.</li>
      <li>Fixed input getting out of focus in skill tree.</li>
    </ul>
  `;
}