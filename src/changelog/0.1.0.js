const html = String.raw;
export function run() {
  return html`
<h2>2025-06-17</h2>
<ul>
  <li>Experience, gold and material drop rates increased a little.</li>
  <li>Completed quests are now visible in a modal view.</li>
  <li>Bugfix: Material drops are not counted correctly.</li>
  <li>Bugfix: Boss reward text fixed to not show "undefined" when no reward is given.</li>
  <li>Bugfix: Thorns damage is now an integer value. Fixed a bug where there were many decimal places.</li>
  <li>Item tooltips now show item tier.</li>
</ul>
`;
}