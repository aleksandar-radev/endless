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
      <li>Alternation and Transmutation Orb dialogs now display roll percentiles when advanced tooltips are enabled.</li>
      <li>Added <span style="color:#4F8A10;">Set</span> and <span style="color:#8B5C2A;">Unique</span> items.</li>
      <li>Skipped inventory refreshes when items are auto-salvaged to avoid unnecessary overhead.</li>
      <li>Reduced mana cost of Rage overflow (Berserker skill). Made Rage Mastery give life, instead of take life. Increased scaling of reckless swing.</li>
      <li>Reworked attack speed into a base-plus-percent model so percentage bonuses clearly scale the base while flat bonuses add afterward.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Stopped inventory items from disappearing in split view by scoping inventory refreshes to the active panel.</li>
      <li>Made building upgrade dialogs always display the actual resource cost even when you cannot afford the purchase.</li>
      <li>Ensured damage conversions respect each skill's allowed damage types so off-element bonuses no longer bleed into ability breakdowns.</li>
      <li>Synchronized the offline eligibility counter and combat region indicator so both reset correctly after eligibility is lost.</li>
      <li>Fixed hero and enemy attack timers so attack speed bonuses scale smoothly instead of being rounded to 100&nbsp;ms breakpoints.</li>
    </ul>
  `;
}
