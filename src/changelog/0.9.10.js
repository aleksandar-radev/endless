const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2026-04-28</span>
    <hr />

    <span style="color:#9F6000;">Bug fixes</span>
    <ul>
      <li>Fixed a bug where the displayed XP requirement to level up was calculated incorrectly, causing the player to appear to have enough XP without leveling up.</li>
    </ul>
  `;
}
