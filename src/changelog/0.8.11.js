const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-28</span>
    <hr />

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>
        XP, gold, item quantity, and item rarity bonuses on gear scale with tier-based percentage caps instead of being
        limited to 100% (making them cap at 1200% for tier 12 gear).
      </li>
      <li>
        Removed quick buy separate options, and made it just 1 (you should probably go adjust your options). Quick buy
        and bulk buy available for training, skills and soul shop.
      </li>
      <li>
        Added Armor Penetration and Elemental Penetration training along with new item rolls for weapons, gloves, and
        jewelry.
      </li>
      <li>Enabled All Attributes rolls on all non-weapon equipment.</li>
    </ul>

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>
        Corrected Rocky Field elemental resistance scaling so high-tier enemies gain resistances alongside their armor.
      </li>
      <li>Ensured thorns damage triggers even when the hero blocks an attack.</li>
      <li>Again, fixed soul shop quick buy functionality.</li>
    </ul>
  `;
}
