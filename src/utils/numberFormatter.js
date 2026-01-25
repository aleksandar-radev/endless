export function formatNumber(value, useShortNumbers = false, separator = ',') {
  if (value === null || value === undefined) return value;

  const num = Number(value);
  if (!Number.isFinite(num)) return num.toString();
  if (useShortNumbers && !Number.isNaN(num)) {
    const abs = Math.abs(num);
    if (abs >= 1000) {
      const suffixes = [
        '',
        'K',
        'M',
        'B',
        'T',
        'Qa',
        'Qi',
        'Sx',
        'Sp',
        'Oc',
        'No',
        'Dc',
        'Ud',
        'Dd',
        'Td',
        'Qad',
        'Qid',
        'Sxd',
        'Spd',
        'Ocd',
        'Nod',
        'Vg',
        'Uvg',
      ];
      const tier = Math.floor(Math.log10(abs) / 3);
      const suffix = suffixes[tier] || `e${tier * 3}`;
      const scaled = num / Math.pow(10, tier * 3);
      const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
      return `${parseFloat(scaled.toFixed(digits))}${suffix}`;
    }
  }

  const parts = value.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return parts.join('.');
}
