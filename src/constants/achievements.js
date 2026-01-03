export const ACHIEVEMENT_DEFINITIONS = [
  // Level Achievements (Sparse)
  {
    id: 'reach_level_50',
    title: 'achievements.data.reach_level_50.title',
    description: 'achievements.data.reach_level_50.desc',
    type: 'level',
    target: 50,
    reward: { bonuses: { bonusExperiencePercent: 0.05 } },
    icon: 'text:L50',
  },

  // Unique / Event-based Achievements
  {
    id: 'one_shot_kill',
    title: 'achievements.data.one_shot_kill.title',
    description: 'achievements.data.one_shot_kill.desc',
    type: 'event',
    eventType: 'kill',
    condition: (data) => data.isOneShot,
    target: 1,
    reward: { bonuses: { allAttributes: 5 } },
    icon: 'text:1HIT',
  },
  {
    id: 'zero_to_hero',
    title: 'achievements.data.zero_to_hero.title',
    description: 'achievements.data.zero_to_hero.desc',
    type: 'event',
    eventType: 'xp',
    condition: (data) => data.leveledUpFromZero,
    target: 1,
    reward: { bonuses: { bonusExperiencePercent: 0.1 } },
    icon: 'text:Z2H',
  },
  {
    id: 'summon_one_shot',
    title: 'achievements.data.summon_one_shot.title',
    description: 'achievements.data.summon_one_shot.desc',
    type: 'event',
    eventType: 'kill',
    condition: (data) => data.isOneShot && data.sourceType === 'summon',
    target: 1,
    reward: { bonuses: { summonDamageBuffPercent: 0.1 } },
    icon: 'text:SUM',
  },

  // Gold Achievements (Sparse)
  {
    id: 'earn_1b_gold',
    title: 'achievements.data.earn_1b_gold.title',
    description: 'achievements.data.earn_1b_gold.desc',
    type: 'resource',
    resource: 'totalGoldEarned',
    target: 1000000000,
    reward: { bonuses: { bonusGoldPercent: 0.10 } },
    icon: 'text:G1B',
  },
];
