export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  data.statistics = data.statistics || {};
  data.statistics.highestStages = data.statistics.highestStages || {};

  const heroStage = data.hero?.highestStage;
  const statStage = data.statistics.highestStageReached;
  const highest = statStage ?? heroStage ?? 1;

  if (highest != null) {
    data.statistics.highestStages['1'] = highest;
  }

  if (data.hero) {
    delete data.hero.highestStage;
  }
  if (data.statistics.highestStageReached != null) {
    delete data.statistics.highestStageReached;
  }

  return { data, result: true };
}
