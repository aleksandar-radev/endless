export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  // leaderboard removed anyway

  if (data.options?.resetRequired) {
    data.options.resetRequired = false;
  }

  return {
    data,
    result: true,
  };
}
