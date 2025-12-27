const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-24</span>
    <hr />

    <span style="color:#FF8A00;"> Improvements</span>
    <ul>
      <li>
        Some bonuses on items were increased (elemental damages, others), and overall item bonuses increased for higher
        tier items. (tier 12 around 1.7x)
      </li>
    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>Fixed a bug where when you die, you continue fighting.</li>
    </ul>
  `;
}
