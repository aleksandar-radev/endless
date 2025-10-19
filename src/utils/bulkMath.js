const toBigInt = (value) => (typeof value === 'bigint' ? value : BigInt(value));

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
