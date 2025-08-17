export function run(rawData) {
  // No data migrations required for 0.7.7
  let data = JSON.parse(JSON.stringify(rawData || {}));

  return { data, result: true };
}
