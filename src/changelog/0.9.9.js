const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-04-28</span>
    <hr />

    <span style="color:#9F6000;">Improvements</span>
    <ul>
      <li>Progression-gated tier-scaled runes now show their Rocky Field tier, and level when required, in the tooltip.</li>
      <li>Runes without level-scaling stats now only require unlocking their Rocky Field tier before they can be equipped.</li>
    </ul>
  `;
}