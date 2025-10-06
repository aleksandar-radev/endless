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
      <li>Gave every Rocky Field region a signature threat&mdash;from 40% faster always-hit lunges and quadruple bulwarks to reflective thorns, percent-life strikes with draining lifesteal, anti-leech sentinels, and relentless summit spirits&mdash;and updated their descriptions to spell out the danger.</li>
      <li>Refined Rocky Field statistics with per-region highest stages, accurate kill tracking, and a reorganized statistics tab layout.</li>
      <li>Elemental allocation sliders now include the elemental portion of extra damage from life, mana, armor, and other resource-based bonuses so you can redistribute it freely.</li>
      <li>Updated the thorns damage indicator with a dedicated spiked badge icon to match the reflected damage theme.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Stopped inventory items from disappearing in split view by scoping inventory refreshes to the active panel.</li>
      <li>Made building upgrade dialogs always display the actual resource cost even when you cannot afford the purchase.</li>
    </ul>
  `;
}
