export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  // Remove deprecated prestige bonuses: allAttributes (flat only)
  if (data.prestige && data.prestige.bonuses && typeof data.prestige.bonuses === 'object') {
    if ('allAttributes' in data.prestige.bonuses) {
      delete data.prestige.bonuses.allAttributes;
    }
    // Keep allAttributesPercent intact per design
  }

  // Ensure options container exists (common pattern)
  data.options = data.options || {};

  return { data, result: true };
}

