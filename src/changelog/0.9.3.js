const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-02-24</span>
    <hr />

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Increased experience gained from Rocky Field enemies.</li>
      <li>Fix crystals gained from runes.</li>
      <li>Fix a bug where prestige bonuses are applied twice, once for 100% of their value and once for 1% of their value, making it total of 101%.</li>
    </ul>
  `;
}
