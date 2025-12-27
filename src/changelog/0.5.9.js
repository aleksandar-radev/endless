const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-07-24</span>
    <hr />

    <span style="color:#FFA500;"> Features & Improvements</span>
    <ul>
      <li>Added Item Quantity % and Item Rarity % stats.</li>
      <li>Added starting crystals bonus to prestige.</li>
      <li>Refined mobile equip flow and enhanced mobile inventory functionality.</li>
      <li>Added number formatting for all high numbers.</li>
      <li>Added stage skip as an option.</li>
      <li>Reduced gold and XP gain on items.</li>
      <li>Fixed gold calculation bug for statistics.</li>
      <li>Some skills reworked.</li>
      <li>Added all resistance stat.</li>
      <li>Adjusted highest stage tracking and now track highest stage for each zone.</li>
      <li>Updated thorns damage calculation to use total damage taken.</li>
      <li>Prevented background throttling for Desktop app.</li>
    </ul>
  `;
}
