const html = String.raw;
export default function run() {
  return html`
<h2>2025-06-14</h2>
<ul>
  <li>Added a responsive sidebar with a toggle button for mobile and desktop layouts.</li>
  <li>Added a cloud save/load bar to the Options tab</li>
  <li>Added a "View Changelog" button and modal in the Options tab.</li>
  <li>Added a "View Upcoming Changes" button and modal in the Options tab.</li>
  <li>Improved quest tracking and reset logic. (fixed a bug where quests were not counted as completed on reload / or
    cloud load)</li>
</ul>
`;
}