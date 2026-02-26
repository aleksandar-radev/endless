const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-02-26</span>
    <hr />

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed infinite recursion (maximum call stack exceeded) in the Specializations tab caused by skills with level requirements not yet met being wrongly detected as missing from the DOM (introduced in 0.9.3).</li>
    </ul>
  `;
}
