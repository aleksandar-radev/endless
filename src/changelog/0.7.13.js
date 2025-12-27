const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-08-24</span>
    <hr />

    <span style="color:#4F8A10;"> New</span>
    <ul>
      <li>Transmutation Orb: new item added to the game. It will change a modifier on an item when used.</li>
    </ul>

    <span style="color:#FF8A00;"> Improvements</span>
    <ul>
      <li>Quick/bulk purchase options improved for Training, Soul Shop and Crystal Shop. (performance wise)</li>
    </ul>

    <span style="color:#FF0000;"> Fixes</span>
    <ul>
      <li>Fixed equip button not showing in some cases after opening Options.</li>
      <li>Fixed the special case where player and enemy could both die at the same moment.</li>
      <li>Fixed various labels and minor bugs across shops and UI.</li>
      <li>Fixed description of warrior battle cry skill.</li>
    </ul>
  `;
}
