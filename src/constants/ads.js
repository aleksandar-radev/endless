export const AD_BONUS_DURATION = 10 * 60 * 1000; // 10 minutes

export const AD_BONUSES = [
  {
    type: 'totalDamagePercent',
    value: 100, // 2x Damage
    isMultiplicative: true,
    icon: 'sword.png',
  },
  {
    type: 'lifePercent',
    value: 100, // 2x Life
    isMultiplicative: true,
    icon: 'vitality-potion.svg',
  },
  {
    type: 'armorPercent',
    value: 100, // 2x Armor
    isMultiplicative: true,
    icon: 'shield.png',
  },
  {
    type: 'allResistancePercent',
    value: 100, // 2x All Resistance
    isMultiplicative: true,
    icon: 'lightning.png',
  },
  {
    type: 'evasionPercent',
    value: 100, // 2x Evasion
    isMultiplicative: true,
    icon: 'agility-potion.svg',
  },
  {
    type: 'attackRatingPercent',
    value: 100, // 2x Attack Rating
    isMultiplicative: true,
    icon: 'precision.svg',
  },
  {
    type: 'xpBonusPercent',
    value: 100, // 2x Experience
    isMultiplicative: true,
    icon: 'experience-potion.svg',
  },
  {
    type: 'goldGainPercent',
    value: 100, // 2x Gold
    isMultiplicative: true,
    icon: 'gold.svg',
  },
];
