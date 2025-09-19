export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));
  data.options = data.options || {};
  return { data, result: true };
}
