const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-26</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Nerfed avatar of nature druid skill.</li>
      <li>Fixed skill tree header on top of screen.</li>
      <li>Added stage lock option in quick access (below enemy).</li>
    </ul>

        <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed building buttons counting towards selling instead of buying.</li>
    </ul>
  `;
}
