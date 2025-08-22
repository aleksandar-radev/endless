export function run(rawData) {
  // No structural data migrations required for 0.7.9
  // Ensure options.version advances to 0.7.9 after migrations run
  const data = JSON.parse(JSON.stringify(rawData || {}));
  if (data.options) {
    data.options.version = '0.7.9';
  }
  return { data, result: true };
}
