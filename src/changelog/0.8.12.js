const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-09-28</span>
    <hr>

    <!-- <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>XP, gold, item quantity, and item rarity bonuses on gear scale with tier-based percentage caps instead of being limited to 100% (making them cap at 1200% for tier 12 gear).</li>
    </ul> -->

    <span style="color:#FF8A00;">Bug Fixes</span>
    <ul>
      <li>Skill tree reset now refunds all skill points earned from ascension bonuses and runes.</li>
      <li>Stopped ascension soul shop cap increases from affecting extra material drop chance and drop cap upgrades.</li>
    </ul>
  `;
}
