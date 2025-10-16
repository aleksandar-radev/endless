const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-16</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Replaced iterative prestige bonus scaling with a direct formula so boss counts of any size compute instantly. (was causing lag or "white" screen on high boss levels)</li>
      <li>Prevented Transmutation and Alternation Orbs from affecting unique or set items and boosted those gear drop rates by 25%.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Ensured prestiging and ascending wait for a forced save so ascension points and bonuses persist reliably between runs.</li>
    </ul>
  `;
}
