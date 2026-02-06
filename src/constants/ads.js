export const AD_BONUS_DURATION = 30 * 60 * 1000; // 30 minutes

export const AD_BONUSES = [
  {
    type: 'totalDamagePercent',
    value: 30, // 2x Damage
    isMultiplicative: true,
    icon: 'sword.png',
  },
  {
    type: 'lifePercent',
    value: 50, // 2x Life
    isMultiplicative: true,
    icon: 'belt.png',
  },
  {
    type: 'armorPercent',
    value: 60, // 2x Armor
    isMultiplicative: true,
    icon: 'shield.png',
  },
  {
    type: 'allResistancePercent',
    value: 60, // 2x All Resistance
    isMultiplicative: true,
    icon: 'lightning.png',
  },
  {
    type: 'evasionPercent',
    value: 60, // 2x Evasion
    isMultiplicative: true,
    icon: 'boots.png',
  },
  {
    type: 'attackRatingPercent',
    value: 50, // 2x Attack Rating
    isMultiplicative: true,
    icon: 'bow.png',
  },
  {
    type: 'xpBonusPercent',
    value: 50, // 2x Experience
    isMultiplicative: true,
    icon: 'amulet.png',
  },
  {
    type: 'goldGainPercent',
    value: 50, // 2x Gold
    isMultiplicative: true,
    icon: 'materials.png',
  },
];
