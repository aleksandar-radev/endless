const BASE_STAGE_QUESTS = [
  { target: 10, reward: { gold: 300 }, icon: '🗺️' },
  { target: 25, reward: { gold: 600, crystals: 1 }, icon: '🗺️' },
  { target: 50, reward: { gold: 2000, crystals: 1 }, icon: '🗺️' },
  { target: 100, reward: { gold: 4500, crystals: 1 }, icon: '🗺️' },
  { target: 200, reward: { gold: 8000, crystals: 2 }, icon: '🌍' },
  { target: 300, reward: { gold: 10000, crystals: 3 }, icon: '🌍' },
  { target: 500, reward: { gold: 25000, crystals: 5 }, icon: '🌌' },
  { target: 1000, reward: { gold: 50000, crystals: 10 }, icon: '🌌' },
  { target: 2500, reward: { gold: 150000, crystals: 25 }, icon: '🌌' },
  { target: 5000, reward: { gold: 400000, crystals: 50 }, icon: '🌌' },
];

export const STAGE_QUESTS = [];

for (let tier = 1; tier <= 12; tier++) {
  BASE_STAGE_QUESTS.forEach((base) => {
    STAGE_QUESTS.push({
      id: `stage_${base.target}_t${tier}`,
      category: 'stages',
      title: `Reach stage ${base.target} (Tier ${tier})`,
      description: `Reach stage ${base.target} in tier ${tier}.`,
      type: 'stage',
      tier,
      target: base.target,
      reward: base.reward,
      icon: base.icon,
    });
  });
}
