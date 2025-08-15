export function run(rawData) {
  // No data migrations required for 0.7.6
  let data = JSON.parse(JSON.stringify(rawData || {}));

  return { data, result: true };
}
