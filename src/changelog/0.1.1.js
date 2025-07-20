const html = String.raw;
export default function run() {
  return html`
<h2>2025-06-17</h2>
<ul>
  <li>Added a "Starting Stage" option, allowing you to choose your starting stage based on your crystal upgrades.</li>
  <li>Fixed: healing / damage popups above hero not always correctly shown (color/text bug)</li>
  <li>Mana requirement for some skills have been reworked.</li>
  <li>Reduced scaling of items of higher rarity. Mythic items are now not 30 times as strong as common items, but only
    ~5-6 times as strong.</li>
  <li>Fixed a bug where upgrading the level of an item would not always correctly update the item stats.</li>
</ul>
<br>
<strong>Note: if you have "bugged" items, you might want to salvage them.</strong>
`;
}