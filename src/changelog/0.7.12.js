const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"> 2025-08-23</span>
  <hr>

  <span style="color:#FF8C00;"> Fixes</span>
  <ul>
    <li>Fixed a bug limiting buildings to 3. Now the limit is 5 (as many as there are buildings)</li>
    <li>Fixed a wrong labels on shop shop and crystal shop.</li>
  </ul>
  `;
}
