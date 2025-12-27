export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  return { data, result: true };
}
