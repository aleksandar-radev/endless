const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-19</span>
    <hr />

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Reduced xp and gold gains for enemies in the Rocky Field.</li>
      <li>
        Greatly optimized offline reward collection: materials are now distributed in bulk by weighted percentages and
        applied in a single update.
      </li>
      <li>
        Material Depot now grants multiple materials per payout using the same high‑performance bulk distribution.
      </li>
      <li>
        Offline item rewards capped to 100 items added to inventory to prevent slowdowns. Overflow is ignored when
        auto‑salvage is disabled.
      </li>
    </ul>

    <span style="color:#FF8A00;">Fixes</span>
    <ul>
      <li>Fixed re-calculation bug when initially loading game.</li>
    </ul>
  `;
}
