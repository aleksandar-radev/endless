const html = String.raw;
export default function run() {
  return html`
  <span style="color:#4F8A10;"><i class="mdi mdi-notebook"></i> 2025-07-10</span>
<hr>

<span style="color:#FFA500;"><i class="mdi mdi-scale-balance"></i> Balance Changes</span>
<ul>
  <li>Life regeneration skills for warrior reworked a little.</li>
</ul>

<span style="color:#FFA500;"><i class="mdi mdi-bug"></i> Bug Fixes</span>
<ul>
  <li>Fixed damage of instant skills not calculated correctly when there are active toggle skills.</li>
</ul>`;
}