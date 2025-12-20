// Centralized constants for ailments

export const AILMENTS = {
  bleed: {
    id: 'bleed',
    duration: 2000,
    tickRate: 100, // Process DoT every 100ms
  },
  burn: {
    id: 'burn',
    duration: 5000,
    tickRate: 100,
    baseDamageMultiplier: 1.5, // Base multiplier for burn damage calculation (burnShare)
  },
  shock: {
    id: 'shock',
    duration: 3000,
    baseDamageTakenBonus: 0.5, // Base +50% damage taken (0.5)
  },
  freeze: {
    id: 'freeze',
    duration: 1000,
  },
  shatter: {
    id: 'shatter',
    damageMultiplier: 3, // 3x damage on shatter
  },
};
