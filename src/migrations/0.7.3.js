export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  // Ensure options persist correctly and default flags exist after this version
  if (!data.options) data.options = {};
  if (typeof data.options.quickTraining !== 'boolean') {
    data.options.quickTraining = false;
  }
  if (typeof data.options.language !== 'string') {
    data.options.language = 'en';
  }

  return { data, result: true };
}
