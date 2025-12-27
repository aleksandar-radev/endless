import { RUNES } from '../constants/runes.js';

export async function run(data) {
  if (!data || !data.runes) return { data, result: false };

  const normalize = (arr = []) =>
    (arr || []).map((r) => {
      if (!r) return null;
      const minimal = { id: r.id };
      // Only persist conversion percent override for conversion runes
      const base = RUNES.find((x) => x.id === r.id);
      if (base?.conversion) {
        const percent = typeof r?.conversion?.percent === 'number' ? r.conversion.percent : base.conversion.percent;
        minimal.conversion = { percent };
      }
      return minimal;
    });

  try {
    data.runes.equipped = normalize(data.runes.equipped);
    data.runes.inventory = normalize(data.runes.inventory);
  } catch {
    // If structure unexpected, skip migration
    return { data, result: false };
  }

  return { data, result: true };
}
