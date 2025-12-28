const html = String.raw;
export default function run() {
  return html`
    <span style="color:#4F8A10;">2025-12-28</span>
    <hr />

    <span style="color:#FF8A00;">Major Updates</span>
    <ul>
      <li>
        <strong>Quest Bonuses System:</strong> Quests now provide permanent bonuses for the current prestige run!
        <ul>
          <li>Bonuses are similar to prestige bonuses but reset on prestige (like material potions)</li>
          <li>Includes both flat bonuses (strength, life, critChance) and percent bonuses (damagePercent, goldPercent, etc.)</li>
          <li>Quest bonuses integrate seamlessly with hero stats calculation</li>
          <li>Quests can now reward materials, items, AND permanent bonuses</li>
        </ul>
      </li>
    </ul>

    <span style="color:#FF8A00;">Quest Bonus Rewards</span>
    <ul>
      <li>
        <strong>Kill Quests:</strong>
        <ul>
          <li>1,000 enemies: +1% damage</li>
          <li>2,500 enemies: +2% bonus gold</li>
          <li>5,000 enemies: +1% crit chance</li>
          <li>10,000 enemies: +2% bonus experience</li>
          <li>25,000 enemies: +50 life</li>
          <li>50,000 enemies: +1% item rarity</li>
          <li>100,000 enemies: +2% damage, +10 strength</li>
          <li>250,000 enemies: +3% material quantity</li>
        </ul>
      </li>
      <li>
        <strong>Progression Quests:</strong>
        <ul>
          <li>Level 50: +5 vitality</li>
          <li>Level 100: +3 all attributes</li>
          <li>Level 200: +1% all attributes</li>
          <li>Level 500: +2% life</li>
          <li>100,000 damage: +5% crit damage</li>
          <li>1,000,000 damage: +3% damage</li>
          <li>10,000,000 damage: +0.1 attack speed</li>
        </ul>
      </li>
      <li>
        <strong>Drop Quests:</strong>
        <ul>
          <li>150 items found: +1% item quantity</li>
          <li>750 items found: +2% item rarity</li>
          <li>150 materials collected: +1% material quantity</li>
          <li>750 materials collected: +2% material quantity</li>
        </ul>
      </li>
      <li>
        <strong>Resource Quests:</strong>
        <ul>
          <li>150,000 gold earned: +1% bonus gold</li>
          <li>1,500,000 gold earned: +2% bonus gold</li>
          <li>50,000,000 gold earned: +5% bonus gold</li>
        </ul>
      </li>
    </ul>

    <span style="color:#FF8A00;">Technical</span>
    <ul>
      <li>Added getQuestsBonuses() method to QuestTracker class to aggregate bonuses from claimed quests</li>
      <li>Updated Quest.claim() to add bonuses to hero.permaStats when reward contains bonuses</li>
      <li>Integrated quest bonuses into hero stats calculation (calculatePercentBonuses, applyFinalCalculations)</li>
      <li>Quest bonuses are separated from permaStats during calculation (similar to prestige bonuses)</li>
      <li>Quest bonuses automatically reset on prestige via setGlobals({ reset: true })</li>
      <li>Added quest bonuses to stat breakdown for debugging</li>
    </ul>

    <span style="color:#FF8A00;">Balance</span>
    <ul>
      <li>Quest bonuses provide meaningful progression within a prestige run</li>
      <li>Bonuses are balanced to incentivize different types of gameplay (combat, farming, progression)</li>
      <li>Early quests provide flat bonuses, later quests provide percent bonuses</li>
      <li>Bonuses reset on prestige to maintain game balance and progression curve</li>
    </ul>
  `;
}
