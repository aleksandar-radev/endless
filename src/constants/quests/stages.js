import { tp } from '../../i18n.js';
const BASE = import.meta.env.VITE_BASE_PATH;

const BASE_STAGE_QUESTS = [
  {
    target: 10,
    reward: { gold: 1200, materials: [{ id: 'experience_potion', qty: 1 }] },
    icon: `<img src="${BASE}/icons/dexterity-potion.svg" alt="stage"/>`,
  },
  {
    target: 25,
    reward: {
      gold: 2400, crystals: 1, materials: [{ id: 'greater_experience_potion', qty: 1 }],
    },
    icon: `<img src="${BASE}/icons/dexterity-potion.svg" alt="stage"/>`,
  },
  {
    target: 50,
    reward: {
      gold: 8000, crystals: 2, materials: [{ id: 'experience_potion', qty: 2 }],
    },
    icon: `<img src="${BASE}/icons/dexterity-potion.svg" alt="stage"/>`,
  },
  {
    target: 100,
    reward: {
      gold: 18000, crystals: 4, materials: [{ id: 'huge_experience_potion', qty: 2 }],
    },
    icon: `<img src="${BASE}/icons/dexterity-potion.svg" alt="stage"/>`,
  },
  {
    target: 200,
    reward: { gold: 32000, crystals: 6 },
    icon: `<img src="${BASE}/icons/earth.png" alt="earth"/>`,
  },
  {
    target: 300,
    reward: { gold: 40000, crystals: 8 },
    icon: `<img src="${BASE}/icons/earth.png" alt="earth"/>`,
  },
  {
    target: 500,
    reward: { gold: 100000, crystals: 15 },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
  {
    target: 1000,
    reward: { gold: 200000, crystals: 25 },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
  {
    target: 2500,
    reward: { gold: 600000, crystals: 40 },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
  {
    target: 5000,
    reward: { gold: 1600000, crystals: 75 },
    icon: `<img src="${BASE}/icons/moon.svg" alt="night"/>`,
  },
];

export const STAGE_QUESTS = [];

for (let tier = 1; tier <= 12; tier++) {
  BASE_STAGE_QUESTS.forEach((base) => {
    // Scale rewards for higher tiers (tier 12 gets ~6x rewards compared to tier 1)
    const scale = 1 + (tier - 1) * 7; // tier 1: 1x, tier 12: ~66x
    const scaledGold = Math.round(base.reward.gold * scale);
    const scaledCrystals = base.reward.crystals ? Math.max(1, Math.round(base.reward.crystals * scale)) : undefined;
    const scaledMaterials = base.reward.materials
      ? base.reward.materials.map((m) => ({
        id: m.id,
        qty: Math.max(1, Math.round(m.qty * scale)),
      }))
      : undefined;

    STAGE_QUESTS.push({
      id: `stage_${base.target}_t${tier}`,
      category: 'stages',
      get title() {
        return tp('Reach stage {target} (Tier {tier})', { target: base.target, tier });
      },
      get description() {
        return tp('Reach stage {target} in tier {tier}.', { target: base.target, tier });
      },
      type: 'stage',
      tier,
      target: base.target,
      reward: {
        gold: scaledGold,
        ...(scaledCrystals !== undefined ? { crystals: scaledCrystals } : {}),
        ...(scaledMaterials ? { materials: scaledMaterials } : {}),
      },
      icon: base.icon,
    });
  });
}
