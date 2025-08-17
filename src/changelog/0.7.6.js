const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"> 2025-08-16</span>
  <hr>

  <span style="color:#FF8C00;"> Fixes & polish</span>
  <ul>
    <li>Options: sound slider now doesn't play sounds when set to 0. Was causing issues on phones while some music app was on.</li>
  </ul>
  `;
}
