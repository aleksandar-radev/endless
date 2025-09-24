const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-01-23</span>
    <hr>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Fixed stage lock bug where the stage lock setting would remain enabled and locked at a specific value after prestige, even when the stage lock crystal shop upgrade was not repurchased. Stage lock options are now properly reset to their default disabled state after each prestige.</li>
    </ul>
  `;
}