export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  data.options.resetRequired = true;

  return {
    data,
    result: true,
  };
}
