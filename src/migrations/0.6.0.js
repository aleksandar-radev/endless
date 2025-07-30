export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  // leaderboard removed anyway
  data.options.resetRequired = false;

  return {
    data,
    result: true,
  };
}
