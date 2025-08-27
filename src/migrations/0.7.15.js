export function run(rawData) {
  // No structural data migrations required for 0.7.13
  const data = JSON.parse(JSON.stringify(rawData || {}));
  return { data, result: true };
}