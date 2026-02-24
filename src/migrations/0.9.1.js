export function run(rawData) {
  // No structural data migrations required for 0.8.3
  const data = JSON.parse(JSON.stringify(rawData || {}));
  // Ensure options container exists
  data.options = data.options || {};
  // Version will be set by DataManager after migrations complete
  return { data, result: true };
}
