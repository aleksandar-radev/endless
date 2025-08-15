export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  return { data, result: true };
}
