/**
 * Script to report translation keys that appear unused in the codebase.
 *
 * IMPORTANT: This is a best-effort, static scan.
 * - It only detects keys referenced as string literals (e.g. t('foo.bar')).
 * - Dynamic keys (e.g. t(`stats.${group}.${name}`)) cannot be fully resolved.
 *   Use `scripts/translation-usage.config.json` to ignore dynamic namespaces.
 *
 * Run with:
 *   node scripts/check-unused-translations.js
 *
 * Options:
 *   --config <path>   Path to JSON config (default: scripts/translation-usage.config.json if present)
 *   --json            Output machine-readable JSON
 *   --max <n>         Max keys to print per section (default: 50)
 *   --strict          Exit 1 if any unused/missing keys are found (after ignores)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG = {
  languagesDir: 'src/languages',
  languageFiles: ['en.js', 'es.js', 'zh.js'],
  referenceLanguageFile: 'en.js',
  scan: [
    { dir: 'src', exts: ['.js'] },
    { file: 'index.html' },
  ],
  ignoreKeys: [],
  // Regex strings. Example: '^stats\\.'
  ignoreKeyPatterns: [],
};

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = {
    config: null,
    json: false,
    max: 50,
    strict: false,
    out: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--json') {
      args.json = true;
    } else if (a === '--strict') {
      args.strict = true;
    } else if (a === '--max') {
      const val = Number(argv[i + 1]);
      if (!Number.isNaN(val) && val > 0) args.max = val;
      i += 1;
    } else if (a === '--config') {
      args.config = argv[i + 1] || null;
      i += 1;
    } else if (a === '--out') {
      args.out = argv[i + 1] || null;
      i += 1;
    }
  }

  return args;
}

function extractTranslationKeysFromLanguageFile(content) {
  // Matches lines like:   'some.key': 'Value',  or  "some.key": ...
  // This intentionally mirrors the existing check-translations.js behavior but supports "..." too.
  const keyRegex = /^\s+['\"]([^'\"]+)['\"]\s*:/gm;
  const keys = [];
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

function walkDirRecursive(rootDir, exts) {
  const out = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!exts || exts.length === 0) {
        out.push(abs);
        continue;
      }
      const ext = path.extname(entry.name);
      if (exts.includes(ext)) out.push(abs);
    }
  }

  if (fs.existsSync(rootDir)) walk(rootDir);
  return out;
}

function collectScanFiles(repoRoot, scanConfig) {
  const files = new Set();

  for (const item of scanConfig) {
    if (item.file) {
      const abs = path.resolve(repoRoot, item.file);
      if (fs.existsSync(abs)) files.add(abs);
      continue;
    }

    if (item.dir) {
      const absDir = path.resolve(repoRoot, item.dir);
      const found = walkDirRecursive(absDir, item.exts || []);
      found.forEach((f) => files.add(f));
    }
  }

  return [...files];
}

function extractUsedKeysFromContent(content, allKeys) {
  const used = new Set();
  const dynamicPrefixes = new Set();

  const looksDynamic = (value) => typeof value === 'string' && value.includes('${');

  const extractAllStaticStringLiterals = (src) => {
    const out = [];
    let i = 0;
    while (i < src.length) {
      const ch = src[i];
      if (ch === '\'' || ch === '"') {
        const quote = ch;
        i += 1;
        let buf = '';
        let escaped = false;
        while (i < src.length) {
          const c = src[i];
          if (escaped) {
            // Keep escaped chars as-is; translation keys rarely rely on escapes.
            buf += c;
            escaped = false;
            i += 1;
            continue;
          }
          if (c === '\\') {
            escaped = true;
            i += 1;
            continue;
          }
          if (c === quote) {
            i += 1;
            break;
          }
          // Avoid multiline literals; stop if line breaks appear.
          if (c === '\n' || c === '\r') {
            break;
          }
          buf += c;
          i += 1;
        }
        if (buf) out.push(buf);
        continue;
      }

      if (ch === '`') {
        // Template literal: only treat as static if it has no ${...}
        i += 1;
        let buf = '';
        let escaped = false;
        let hasExpr = false;
        while (i < src.length) {
          const c = src[i];
          if (escaped) {
            buf += c;
            escaped = false;
            i += 1;
            continue;
          }
          if (c === '\\') {
            escaped = true;
            i += 1;
            continue;
          }
          if (c === '$' && src[i + 1] === '{') {
            hasExpr = true;
          }
          if (c === '`') {
            i += 1;
            break;
          }
          buf += c;
          i += 1;
        }
        if (buf && !hasExpr) out.push(buf);
        continue;
      }

      i += 1;
    }
    return out;
  };

  // t('foo.bar') / tp("foo.bar")
  const callLiteralRegex = /\b(?:t|tp)\(\s*(['\"])([^'\"\\\n\r]+)\1/gm;
  let m;
  while ((m = callLiteralRegex.exec(content)) !== null) {
    const key = m[2];
    if (!looksDynamic(key)) used.add(key);
  }

  // t(`prefix.${x}`) / tp(`prefix.${x}`) -> collect prefix
  const callTemplatePrefixRegex = /\b(?:t|tp)\(\s*`([^`$\\\n\r]*?)\$\{/gm;
  while ((m = callTemplatePrefixRegex.exec(content)) !== null) {
    const prefix = m[1];
    if (prefix) dynamicPrefixes.add(prefix);
  }

  // t('prefix.' + something) / tp("prefix." + ...)
  const callConcatPrefixRegex = /\b(?:t|tp)\(\s*(['\"])([^'\"\\\n\r]*?)\1\s*\+/gm;
  while ((m = callConcatPrefixRegex.exec(content)) !== null) {
    const prefix = m[2];
    if (prefix) dynamicPrefixes.add(prefix);
  }

  // data-i18n="..." and variants like data-i18n-title="..."
  const dataAttrRegex = /\bdata-i18n(?:-[a-z-]+)?=(?:"([^"]+)"|'([^']+)')/gm;
  while ((m = dataAttrRegex.exec(content)) !== null) {
    const key = m[1] || m[2];
    if (key && !looksDynamic(key)) used.add(key);
  }

  const allLiterals = extractAllStaticStringLiterals(content);
  allLiterals.forEach((lit) => {
    if (!lit || looksDynamic(lit)) return;
    if (allKeys && allKeys.has(lit)) used.add(lit);
  });

  return { usedKeys: used, dynamicPrefixes };
}

function compileIgnoreMatchers(config) {
  const ignoreKeys = new Set(config.ignoreKeys || []);
  const ignoreRegexes = [];

  for (const pattern of config.ignoreKeyPatterns || []) {
    try {
      ignoreRegexes.push(new RegExp(pattern));
    } catch {
      // ignore invalid pattern
    }
  }

  function isIgnored(key) {
    if (ignoreKeys.has(key)) return true;
    for (const re of ignoreRegexes) {
      if (re.test(key)) return true;
    }
    return false;
  }

  return { isIgnored };
}

function rel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).split(path.sep).join('/');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(__dirname, '..');

  const defaultConfigPath = path.resolve(repoRoot, 'scripts', 'translation-usage.config.json');
  const configPath = args.config
    ? path.resolve(repoRoot, args.config)
    : (fs.existsSync(defaultConfigPath) ? defaultConfigPath : null);

  const fileConfig = configPath ? safeReadJson(configPath) : null;
  const config = { ...DEFAULT_CONFIG, ...(fileConfig || {}) };

  const languagesDirAbs = path.resolve(repoRoot, config.languagesDir);
  const referenceFile = config.referenceLanguageFile || config.languageFiles?.[0];
  const referenceAbs = path.resolve(languagesDirAbs, referenceFile);

  if (!referenceFile || !fs.existsSync(referenceAbs)) {
    const msg = `Reference language file not found: ${rel(repoRoot, referenceAbs)}`;
    if (args.json) {
      console.log(JSON.stringify({ ok: false, error: msg }, null, 2));
    } else {
      console.error(msg);
    }
    process.exit(1);
  }

  const referenceContent = fs.readFileSync(referenceAbs, 'utf-8');
  const allKeysList = extractTranslationKeysFromLanguageFile(referenceContent);
  const allKeys = new Set(allKeysList);

  const scanFilesAll = collectScanFiles(repoRoot, config.scan || DEFAULT_CONFIG.scan);
  const scanFiles = scanFilesAll.filter((absPath) => {
    const normalized = path.resolve(absPath);
    const langDirWithSep = languagesDirAbs.endsWith(path.sep)
      ? languagesDirAbs
      : (languagesDirAbs + path.sep);
    return !normalized.startsWith(langDirWithSep);
  });

  const usedKeys = new Set();
  const dynamicPrefixes = new Set();
  const keyOccurrences = new Map();

  for (const absFile of scanFiles) {
    const content = fs.readFileSync(absFile, 'utf-8');
    const { usedKeys: fileUsed, dynamicPrefixes: fileDyn } = extractUsedKeysFromContent(content, allKeys);

    fileDyn.forEach((p) => dynamicPrefixes.add(p));

    fileUsed.forEach((k) => {
      usedKeys.add(k);
      if (!keyOccurrences.has(k)) keyOccurrences.set(k, new Set());
      keyOccurrences.get(k).add(rel(repoRoot, absFile));
    });
  }

  const { isIgnored } = compileIgnoreMatchers(config);

  const missingKeys = [...usedKeys].filter((k) => !allKeys.has(k) && !isIgnored(k)).sort();

  const potentiallyUnused = [...allKeys]
    .filter((k) => !usedKeys.has(k) && !isIgnored(k))
    .sort();

  const dynamicPrefixList = [...dynamicPrefixes].sort();
  const dynamicCoveredUnused = potentiallyUnused.filter((k) =>
    dynamicPrefixList.some((p) => p && k.startsWith(p)),
  );
  const likelyUnused = potentiallyUnused.filter((k) => !dynamicCoveredUnused.includes(k));

  const result = {
    ok: missingKeys.length === 0 && potentiallyUnused.length === 0,
    configPath: configPath ? rel(repoRoot, configPath) : null,
    referenceLanguageFile: rel(repoRoot, referenceAbs),
    counts: {
      totalKeysInReference: allKeys.size,
      staticallyDetectedUsedKeys: usedKeys.size,
      missingKeys: missingKeys.length,
      potentiallyUnusedKeys: potentiallyUnused.length,
      potentiallyUnusedKeysCoveredByObservedDynamicPrefixes: dynamicCoveredUnused.length,
      likelyUnusedKeys: likelyUnused.length,
      observedDynamicPrefixes: dynamicPrefixes.size,
      scannedFiles: scanFiles.length,
    },
    missingKeys,
    potentiallyUnusedKeys: potentiallyUnused,
    likelyUnusedKeys: likelyUnused,
    observedDynamicPrefixes: dynamicPrefixList,
  };

  if (args.out) {
    const outAbs = path.resolve(repoRoot, args.out);
    fs.mkdirSync(path.dirname(outAbs), { recursive: true });
    fs.writeFileSync(outAbs, JSON.stringify(result, null, 2) + '\n', 'utf-8');
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('Checking translation key usage (static scan)...');
    if (result.configPath) console.log(`Config: ${result.configPath}`);
    console.log(`Reference: ${result.referenceLanguageFile}`);
    console.log('='.repeat(80));
    console.log(`Scanned files: ${result.counts.scannedFiles}`);
    console.log(`Keys in reference: ${result.counts.totalKeysInReference}`);
    console.log(`Statically found used keys: ${result.counts.staticallyDetectedUsedKeys}`);
    console.log(`Observed dynamic prefixes: ${result.counts.observedDynamicPrefixes}`);

    if (dynamicPrefixList.length > 0) {
      console.log('\nDynamic prefixes seen (review + consider adding to ignoreKeyPatterns):');
      dynamicPrefixList.slice(0, args.max).forEach((p) => console.log(`  - ${p}`));
      if (dynamicPrefixList.length > args.max) {
        console.log(`  ... and ${dynamicPrefixList.length - args.max} more`);
      }
    }

    if (missingKeys.length > 0) {
      console.log(`\n❌ Missing keys referenced in code: ${missingKeys.length}`);
      missingKeys.slice(0, args.max).forEach((k) => console.log(`  - ${k}`));
      if (missingKeys.length > args.max) {
        console.log(`  ... and ${missingKeys.length - args.max} more`);
      }
    }

    if (potentiallyUnused.length > 0) {
      console.log(`\n⚠️  Potentially unused keys (after ignores): ${potentiallyUnused.length}`);
      console.log(`   - Covered by observed dynamic prefixes: ${dynamicCoveredUnused.length}`);
      console.log(`   - More likely unused (not covered): ${likelyUnused.length}`);

      if (likelyUnused.length > 0) {
        console.log('\nMore likely unused (review carefully before removing):');
        likelyUnused.slice(0, args.max).forEach((k) => console.log(`  - ${k}`));
        if (likelyUnused.length > args.max) {
          console.log(`  ... and ${likelyUnused.length - args.max} more`);
        }
      }

      if (dynamicCoveredUnused.length > 0) {
        console.log('\nPotentially unused but under dynamic prefixes (high false-positive risk):');
        dynamicCoveredUnused.slice(0, args.max).forEach((k) => console.log(`  - ${k}`));
        if (dynamicCoveredUnused.length > args.max) {
          console.log(`  ... and ${dynamicCoveredUnused.length - args.max} more`);
        }
      }
    }

    if (missingKeys.length === 0 && potentiallyUnused.length === 0) {
      console.log('\n✅ No missing or unused keys detected (given current ignores).');
    }

    console.log('\nNote: This script does not delete keys. Treat results as a review list.');
  }

  if (args.strict && (missingKeys.length > 0 || potentiallyUnused.length > 0)) {
    process.exit(1);
  }
  process.exit(0);
}

main();
