const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;">📝 2025-07-19</span>
<hr>

<span style="color:#FFA500;">⚖️ Balance Changes</span>
<ul>
  <li>Added life regen % of total in shop and increased regen in shop.</li>
  <li>Limited item level upgrade to hero level.</li>
  <li>Added cost cap to buildings</li>
</ul>

<span style="color:#FFA500;">🪲 Bug Fixes</span>
<ul>
  <li>Fixed a bug with Mind Control mage skill.</li>
  <li>Fixed issue where changing local was triggering offline bonuses.</li>
  <li>Fixed login dialog. If still not working, try clearing cache and reload.</li>
  <li>Fixed a bug where prestiging was unlimited. Prestige now causes reload, to avoid issues with updating the whole
    UI.</li>
</ul>`;
}