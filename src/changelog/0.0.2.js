const html = String.raw;
export default function run() {
  return html`
<h2>2025-06-14</h2>
<ul>
  <li>Remove increased material drop rate for materials on higher stages. They are stable throughout all stages now.
  </li>
  <li>Soul shop rebalance. Most things are now more expensive.</li>
  <li>Fixed Soul Shop's "Extra Life". It now grants one resurrection per run.</li>
  <li>Resurrection can happen twice per run. Once with soul shop upgrade, and once with bonuses from items.</li>
  <li>Fixed Bonus Gold and Bonus Experience from Soul Shop. They are now displayed as percentages.</li>
  <li>Material drop rates are now consistent across all stages, with extra material drops only from Soul Shop upgrades.
    (compared to previously where higher stages had increased drop rates)</li>
  <li>Damage, healing, and combat notifications are now clearer and color-coded in battle.</li>
  <li>Fixed: Player and enemy health/mana bars update more reliably after combat events.</li>
</ul>
`;
}