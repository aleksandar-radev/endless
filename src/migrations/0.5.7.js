export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  if (data.options?.resetRequired) {
    data.options.resetRequired = true;
  }

  return {
    data,
    result: true,
  };
}
