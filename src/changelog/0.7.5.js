const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-16</span>
    <hr />

    <span style="color:#0078d7;"> Improvements</span>
    <ul>
      <li>Combat: added a chance-to-hit calculation to make attacks feel less deterministic.</li>
      <li>
        Enemies & bosses: reworked scaling so bosses scale a bit less aggressively and give slightly less XP and gold.
      </li>
      <li>Stats UI: improved display and layout of the stats panel; visibility logic cleaned up for a clearer view.</li>
      <li>Items: increased attack rating on items for better balance.</li>
      <li>Reduced inherent bonuses on the Elementalist. So he's more aligned with others classes starting out.</li>
    </ul>

    <span style="color:#FF8C00;"> Fixes & polish</span>
    <ul>
      <li>Tab indicator now shows correctly across the UI.</li>
    </ul>
  `;
}
