const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-03-20</span>
    <hr />

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed rune search functionality in the inventory to correctly find and highlight matching runes by filtering unique stats.</li>
      <li>Improved rune search to allow multiple search terms to match independently.</li>
      <li>Fixed missing CSS styles for the dimming and highlighting of matched runes and their tabs.</li>
    </ul>
  `;
}
