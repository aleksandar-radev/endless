const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;"> 2025-09-21</span>
    <hr>

    <span style="color:#FF8A00;">Improvements</span>
    <ul>
      <li>Counters Bar: added an offline eligibility indicator (red ✖ until you have at least 1 minute in fights, then green ✔).</li>
      <li>Combat Modes: added a compact offline eligibility icon at the far right with tooltip explaining eligibility and conditions.</li>
      <li>All attributes flat removed from prestige bonuses (in earlier version).</li>
      <li>Prestige: show total crystals in the prestige modal.</li>
      <li>Skills bar: abilities in <b>skill slots</b> are now sorted deterministically by class skill order, not by unlock order.</li>
      <li>Options: added <b>Show Roll Percentiles</b>. When enabled, item tooltips and prestige cards display roll quality (0–100%) instead of min/max ranges.</li>
      <li>Changed xp and gold calculation rewards for all enemies and bosses. Higher stages now are always better.</li>
    </ul>

    <span style="color:#FF8A00;">Fixes</span>
    <ul>
      <li>Offline progress rates are now recorded only after at least 60 seconds of fight time; before that, offline rates remain zero to prevent unintended offline rewards.</li>
      <li>Rate counters (Damage/XP/Gold/Items/Materials per period) now reset immediately after collecting offline rewards to prevent inflated initial values and compounding growth when going offline repeatedly.</li>
      <li>Fix materials from building are not being auto-consumed when crystal upgrade is purchased.</li>
    </ul>
  `;
}
