import { MATERIALS } from './constants/materials.js';
import { getCurrentRegion } from './region.js';
import { game, hero } from './globals.js';

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
  const baseTotal = Math.max(0, Number(total || 0));
  const materialQuantityMultiplier = 1 + (hero?.stats?.materialQuantityPercent || 0);
  const qty = Math.max(0, Math.floor(baseTotal * materialQuantityMultiplier));
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

  // First pass: deterministic floor allocation while tracking fractional remainder
  const counts = {};
  let allocated = 0;
  const fractional = [];
  for (let i = 0; i < mats.length; i++) {
    const exact = (weights[i] / totalWeight) * qty;
    const base = Math.floor(exact);
    if (base > 0) {
      counts[mats[i].id] = base;
      allocated += base;
    }
    const fraction = exact - base;
    if (fraction > 0) {
      fractional.push({ id: mats[i].id, fraction, jitter: Math.random() });
    }
  }

  let remaining = qty - allocated;
  if (remaining > 0 && fractional.length > 0) {
    fractional.sort((a, b) => (b.fraction - a.fraction) || (a.jitter - b.jitter));
    const assignCount = Math.min(remaining, fractional.length);
    for (let i = 0; i < assignCount; i++) {
      const { id } = fractional[i];
      counts[id] = (counts[id] || 0) + 1;
    }
    remaining -= assignCount;
  }

  // Fallback for any residual remainder caused by floating point imprecision (bounded by unique materials)
  if (remaining > 0) {
    const fallback = Math.min(remaining, mats.length);
    for (let i = 0; i < fallback; i++) {
      const pick = mats[Math.floor(Math.random() * mats.length)]?.id;
      if (!pick) break;
      counts[pick] = (counts[pick] || 0) + 1;
    }
  }

  return counts;
}

