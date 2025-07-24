export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  // Migration logic for 0.5.11 (currently no changes needed)

  return {
    data,
    result: true,
  };
}
