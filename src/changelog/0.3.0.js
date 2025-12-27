const html = String.raw;
export default function run() {
  return html` <span style="color:#4F8A10;"> 2025-07-09</span>
    <hr />

    <h3 style="color:#c42e2e; margin: 10px 0px;">
      Progress was not reset for this update, although, it is highly recommended to do so for optimal experience.
    </h3>

    <hr />

    <span style="color:#1E90FF;"> New Features</span>
    <ul>
      <li>Added 2 new classes: Mage and Druid.</li>
      <li>Added new quests.</li>
      <li>Added Intelligence and Perseverance attributes.</li>
      <li>
        Added new XP potion, that now provides % experience instead of flat amount. Reworked the existing greater xp
        potion to also provide % experience.
      </li>
      <li>Added new item types: Wands and Staves.</li>
      <li>Added new salvage system. You can get a crystal upgrade that allows you to salvage items for materials.</li>
      <li>
        Added Prestige system. Upon reaching some requirements, you can reset your progress and gain a reward that is
        persistent across prestiges.
      </li>
      <li>Few new bosses added.</li>
    </ul>

    <span style="color:#FFA500;"> Balance Changes</span>
    <ul>
      <li>Increased experience requirement for higher levels.</li>
      <li>Decreased % stats bonuses on items.</li>
      <li>Made item level from rewards be the highest reached stage. So far it took the hero level.</li>
      <li>Reduced cost of buildings, to make them more viable.</li>
      <li>
        Reduced strength inherit bonus to 0.34 (from 0.5). Reduced agility inherit bonus from 7 to 4 for attack rating,
        but it now also provides 0.2 damage.
      </li>
      <li>Reworked regions scalings to make them more consistent. XP and Gold bonuses greatly reduced.</li>
      <li>Starting stage crystal upgrade now has increased cost on higher levels.</li>
      <li>Reduced vampire strength percentage bonuses from skills.</li>
      <li>Greatly increased the drop quantity of item level upgrade materials, based on enemy level.</li>
    </ul>

    <span style="color:#FFA500;"> Bug Fixes</span>
    <ul>
      <li>Fixed enchantment scroll did upgrade the rarity of an item, but didn't give extra stats.</li>
      <li>Fixed a bug where soul shop upgrade for damage boost will give 100x less value.</li>
    </ul>`;
}
