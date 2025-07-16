export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  if (data.training.upgradeLevels.critDamage > 300) {
    // If critDamage is above 300, reset it to 300
    data.training.upgradeLevels.critDamage = 300;
  }

  // Adjust prestige bonuses to new values
  const beforeBonuses = {
    totalDamagePercent: { min: 0.5, max: 0.99 },
    lifePercent: { min: 0.5, max: 0.99 },
    manaPercent: { min: 0.5, max: 0.99 },
    bonusExperiencePercent: { min: 0.7, max: 1.3 },
    bonusGoldPercent: { min: 0.7, max: 1.3 },
    allAttributes: { min: 50, max: 100 },
    allAttributesPercent: { min: 0.15, max: 0.4 },
    cooldownReductionPercent: { min: 0.15, max: 0.4 },
    buffDurationPercent: { min: 0.15, max: 0.4 },
    // manaCostReductionPercent: { min: 0.15, max: 0.4 },
  };
  const afterBonuses = {
    totalDamagePercent: { min: 0.2, max: 0.4 },
    lifePercent: { min: 0.2, max: 0.5 },
    manaPercent: { min: 0.2, max: 0.5 },
    bonusExperiencePercent: { min: 0.1, max: 0.4 },
    bonusGoldPercent: { min: 0.1, max: 0.4 },
    allAttributes: { min: 40, max: 75 },
    allAttributesPercent: { min: 0.05, max: 0.25 },
    cooldownReductionPercent: { min: 0.05, max: 0.2 },
    buffDurationPercent: { min: 0.05, max: 0.2 },
    // manaCostReductionPercent: { min: 0.15, max: 0.4 },
  };

  if (data.prestige && typeof data.prestige.bonuses === 'object' && data.prestige.bonuses !== null) {
    const bonusesAfter050 = {};
    for (const stat in data.prestige.bonuses) {
      if (beforeBonuses[stat] && afterBonuses[stat] && typeof data.prestige.bonuses[stat] === 'number') {
        const before = beforeBonuses[stat];
        const after = afterBonuses[stat];
        const value = data.prestige.bonuses[stat];
        // Calculate reduction ratio based on max values
        const reductionRatio = after.max / before.max;
        const newValue = value * reductionRatio;
        bonusesAfter050[stat] = newValue;
        data.prestige.bonuses[stat] = newValue;
        // Also update hero.permaStats if present
        if (data.hero && data.hero.permaStats && typeof data.hero.permaStats[stat] === 'number') {
          data.hero.permaStats[stat] = data.hero.permaStats[stat] * reductionRatio;
        }
      } else {
        bonusesAfter050[stat] = data.prestige.bonuses[stat];
      }
    }
  }


  return {
    data,
    result: true,
  };
}

