// Auto-import all version files using Vite's import.meta.glob
const versionModules = import.meta.glob('./*.js', { eager: true });

// Filter out the changelog.js file itself and create the CHANGELOG object
const CHANGELOG = {};

Object.entries(versionModules).forEach(([path, module]) => {
  // Extract version from path (e.g., './0.7.15.js' -> '0.7.15')
  const version = path.replace('./', '').replace('.js', '');

  // Skip the changelog.js file
  if (version === 'changelog') return;

  // Create the changelog entry
  CHANGELOG[version] = {
    version: version,
    run: module.default || module,
  };
});

export { CHANGELOG };
