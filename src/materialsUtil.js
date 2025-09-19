import { MATERIALS } from './constants/materials.js';
import { getCurrentRegion } from './region.js';
import { game } from './globals.js';

/**
 * Distribute a total quantity of materials across eligible materials using weighted chances.
 * Weights consider region/enemy multipliers, per-material dropChance, and configured weights.
 *
 * @param {number} total - total quantity to distribute (>= 0)
 * @param {Object} [opts]
 * @param {string[]} [opts.allowedIds] - restrict distribution to this set of material ids
 * @returns {Record<string, number>} mapping of material id -> qty (only positive quantities included)
 */
export function distributeMaterials(total, opts = {}) {
  const qty = Math.max(0, Math.floor(total || 0));
  if (qty === 0) return {};

  const region = getCurrentRegion();
  const enemy = game.currentEnemy;

  // Determine allowed exclusives from both enemy and region
  const allowedExclusive = [...(enemy?.canDrop || []), ...(region.canDrop || [])];

  // Build eligible material list
  let mats = Object.values(MATERIALS)
    .filter((m) => m.dropChance > 0)
    .filter((m) => !m.exclusive || allowedExclusive.includes(m.id));

  if (opts?.allowedIds?.length) {
    const allowSet = new Set(opts.allowedIds);
    mats = mats.filter((m) => allowSet.has(m.id));
  }

  if (!mats.length) return {};

  const regionMultiplier = region.multiplier?.materialDrop || 1;
  const enemyMultiplier = enemy?.baseData?.multiplier?.materialDrop || 1;
  const multiplier = regionMultiplier * enemyMultiplier;
  const regionWeights = region.materialDropWeights || {};
  const enemyWeights = enemy?.baseData?.materialDropWeights || {};

  // Compute final weights per material
  const weights = mats.map((m) => {
    const w = (regionWeights[m.id] || 0) + (enemyWeights[m.id] || 0);
    // Ensure a minimum weight of 1 when no custom weight is present
    const extra = w > 0 ? w : 1;
    return Math.max(0, (m.dropChance || 0) * multiplier * extra);
  });

  let totalWeight = weights.reduce((sum, w) => sum + w, 0);
  // Fallback to uniform distribution if all weights are zero
  if (totalWeight <= 0) {
    weights.fill(1);
    totalWeight = mats.length;
  }

  // First pass: deterministic floor allocation
  const counts = {};
  let allocated = 0;
  for (let i = 0; i < mats.length; i++) {
    const share = Math.floor((weights[i] / totalWeight) * qty);
    if (share > 0) {
      counts[mats[i].id] = share;
      allocated += share;
    }
  }

  // Distribute remainder via weighted picks; remainder is bounded by mats.length
  let remaining = qty - allocated;
  while (remaining > 0) {
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < mats.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        const id = mats[i].id;
        counts[id] = (counts[id] || 0) + 1;
        break;
      }
    }
    remaining--;
  }

  return counts;
}

