/**
 * Unified Math Engine for Bulk Calculations
 * Handles Linear (Arithmetic) and Geometric cost models with BigInt precision where applicable.
 */

const toBigInt = (val) => {
  if (typeof val === 'bigint') return val;
  // Handle scientific notation strings or large numbers
  if (typeof val === 'string' && (val.includes('e') || val.includes('E'))) {
    return BigInt(Math.floor(Number(val)));
  }
  return BigInt(Math.floor(Number(val) || 0));
};

const sqrtBigInt = (value) => {
  if (value < 0n) return 0n;
  if (value < 2n) return value;
  let x0 = value;
  let x1 = (x0 + value / x0) >> 1n;
  while (x1 < x0) {
    x0 = x1;
    x1 = (x0 + value / x0) >> 1n;
  }
  return x0;
};

// --- Legacy Functions (Keep for backward compatibility until refactor is complete) ---

export function floorSumBigInt(n, m, a, b) {
  let nn = toBigInt(n);
  let mm = toBigInt(m);
  let aa = toBigInt(a);
  let bb = toBigInt(b);

  if (nn <= 0n) return 0n;

  let ans = 0n;
  while (true) {
    if (aa >= mm) {
      ans += ((nn - 1n) * nn * (aa / mm)) / 2n;
      aa %= mm;
    }
    if (bb >= mm) {
      ans += nn * (bb / mm);
      bb %= mm;
    }
    const yMax = aa * nn + bb;
    if (yMax < mm) break;
    nn = yMax / mm;
    bb = yMax % mm;
    const temp = mm;
    mm = aa;
    aa = temp;
  }
  return ans;
}

export function floorSumNumber(n, m, a, b) {
  if (n <= 0) return 0;
  const result = floorSumBigInt(n, m, a, b);
  const asNumber = Number(result);
  return Number.isFinite(asNumber) ? asNumber : Infinity;
}

// --- Unified Linear (Arithmetic) Logic ---

/**
 * Calculates the total cost for a linear progression.
 * Formula: Sum = n * Base + Increment * (n * StartLevel + n*(n-1)/2)
 *
 * @param {number|bigint} startLevel - The current level.
 * @param {number|bigint} count - Number of upgrades to buy.
 * @param {number|bigint} base - Base cost.
 * @param {number|bigint} increment - Cost increment per level.
 * @param {number|bigint} scale - Scale factor (e.g. 100 for 2 decimal precision).
 * @returns {number} Total cost as a Number (safe for display/checks, might be Infinity if huge).
 */
export function calcLinearSum(startLevel, count, base, increment, scale = 1) {
  const n = toBigInt(count);
  if (n <= 0n) return 0;

  const sL = toBigInt(startLevel);
  const B = toBigInt(base);
  const I = toBigInt(increment);
  const S = toBigInt(scale);

  // Sum of arithmetic series:
  // Cost(i) = B + I * (sL + i)
  // Total = n*B + I * (n*sL + n*(n-1)/2)
  // To preserve precision with division, we calculate numerator then divide by Scale.

  // Term 1: Base cost part -> n * B
  const term1 = n * B;

  // Term 2: Increment part
  // Sum of indices 0 to n-1 is n*(n-1)/2
  // Sum of levels is n*sL + n*(n-1)/2
  // We can multiply by 2 to defer division: 2*n*sL + n*(n-1)
  const doubleSumLevels = (2n * n * sL) + (n * (n - 1n));
  const term2 = (I * doubleSumLevels) / 2n; // Integer division by 2 is safe here as n*(n-1) is always even

  const totalScaled = term1 + term2;

  // Apply scale
  // Return float to preserve fractional costs (e.g. 0.5 gold) when scaled
  return Number(totalScaled) / Number(S);
}

/**
 * Calculates the maximum number of upgrades purchasable with a budget (Linear).
 * Solves the quadratic equation for n.
 *
 * @param {number|bigint} startLevel
 * @param {number|bigint} budget
 * @param {number|bigint} base
 * @param {number|bigint} increment
 * @param {number|bigint} scale
 * @returns {number} The count.
 */
export function solveLinear(startLevel, budget, base, increment, scale = 1) {
  const Y = toBigInt(budget);
  if (Y <= 0n) return 0;

  const sL = toBigInt(startLevel);
  const B = toBigInt(base);
  const I = toBigInt(increment);
  const S = toBigInt(scale);

  // If increment is 0, it's just Budget / (Base/Scale)
  if (I === 0n) {
    if (B === 0n) return Number.MAX_SAFE_INTEGER; // Free?
    // Cost = n * (B/S) <= Y  =>  n * B <= Y * S
    return Number((Y * S) / B);
  }

  // Inequality:
  // (1/S) * [ n*B + I*(n*sL + n(n-1)/2) ] <= Y
  // 2*n*B + 2*I*n*sL + I*n^2 - I*n <= 2*Y*S
  // I*n^2 + (2B + 2*I*sL - I)*n - 2*Y*S <= 0

  // Quadratic: a*n^2 + b*n + c <= 0
  const a = I;
  const b = (2n * B) + (2n * I * sL) - I;
  const c = -2n * Y * S;

  // n = (-b + sqrt(b^2 - 4ac)) / 2a
  const discriminant = (b * b) - (4n * a * c);
  if (discriminant < 0n) return 0; // Should not happen given c is negative

  const sqrtD = sqrtBigInt(discriminant);
  const num = -b + sqrtD;
  const den = 2n * a;

  const n = num / den;

  if (n < 0n) return 0;
  return Number(n);
}

// --- Unified Geometric Logic ---

/**
 * Calculates sum for geometric progression.
 * Cost(i) = Base * (Multiplier ^ (StartLevel + i))
 *
 * @param {number|bigint} startLevel
 * @param {number|bigint} count
 * @param {number|bigint} base
 * @param {number} multiplier (Float)
 * @param {number|bigint} scale
 */
export function calcGeometricSum(startLevel, count, base, multiplier, scale = 1) {
  let cnt = Number(count);
  let sL = Number(startLevel);
  let B = Number(base) / Number(scale);
  let r = Number(multiplier);

  if (r === 1) return calcLinearSum(startLevel, count, base, 0, scale);

  // First term: a = B * r^sL
  const firstTerm = B * Math.pow(r, sL);

  // Sum = a * (r^cnt - 1) / (r - 1)
  const sum = (firstTerm * (Math.pow(r, cnt) - 1)) / (r - 1);

  if (!Number.isFinite(sum)) return Infinity;
  return sum;
}

/**
 * Calculates max purchasable for geometric progression.
 *
 * @param {number|bigint} startLevel
 * @param {number|bigint} budget
 * @param {number|bigint} base
 * @param {number} multiplier
 * @param {number|bigint} scale
 */
export function solveGeometric(startLevel, budget, base, multiplier, scale = 1) {
  let Y = Number(budget);
  let sL = Number(startLevel);
  let B = Number(base) / Number(scale);
  let r = Number(multiplier);

  if (r === 1) return solveLinear(startLevel, budget, base, 0, scale);
  if (B === 0) return Number.MAX_SAFE_INTEGER;

  // Sum = B * r^sL * (r^n - 1) / (r - 1) <= Y
  // let A = B * r^sL
  // A * (r^n - 1) / (r - 1) <= Y
  // r^n - 1 <= Y * (r - 1) / A
  // r^n <= (Y * (r - 1) / A) + 1
  // n <= log_r( ... )

  const A = B * Math.pow(r, sL);
  const term = (Y * (r - 1)) / A + 1;

  if (term <= 0) return 0;

  const n = Math.log(term) / Math.log(r);
  return Math.floor(n);
}
