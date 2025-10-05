const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-10-05</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Allow moving of items on mobile by clicking to select an item and clicking on slot you want to move it to.</li>
      <li>Enchantment scroll dialog now stays open so multiple items can be enchanted back-to-back.</li>
      <li>Rebalanced rocky field rune conversion ranges so each region steps up in roughly even full-number tiers, topping out at 150% in the summit.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>      
      <li>Stopped inventory items from disappearing in split view by scoping inventory refreshes to the active panel.</li>
    </ul>
  `;
}
