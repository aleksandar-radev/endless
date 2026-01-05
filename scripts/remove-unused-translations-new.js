/**
 * Script to remove translation keys from language files based on the
 * static usage report from `scripts/check-unused-translations.js`.
 *
 * SAFETY DEFAULTS:
 * - Dry-run by default (no files changed).
 * - Removes only keys that contain a dot (.) by default.
 * - Requires `--apply` to write.
 *
 * Usage:
 *   node scripts/check-unused-translations.js --out scripts/.tmp/translation-usage-report.json
 *   node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json
 *   node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json --apply
 *
 * Options:
 *   --report <path>     JSON output from check-unused-translations (required)
 *   --config <path>     Config JSON (default: scripts/translation-usage.config.json if present)
 *   --apply             Actually write changes
 *   --include-nondotted Also remove keys without '.' (DANGEROUS)
 *   --max <n>           Print up to N keys (default: 50)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {
    report: null,
    config: null,
    apply: false,
    includeNondotted: false,
    includeNondottedAll: false,
    only: [],
    max: 50,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--apply') {
      args.apply = true;
    } else if (a === '--include-nondotted') {
      args.includeNondotted = true;
    } else if (a === '--include-nondotted-all') {
      args.includeNondotted = true;
      args.includeNondottedAll = true;
    } else if (a === '--only') {
      const raw = argv[i + 1] || '';
      args.only = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      i += 1;
    } else if (a === '--max') {
      const val = Number(argv[i + 1]);
      if (!Number.isNaN(val) && val > 0) args.max = val;
      i += 1;
    } else if (a === '--report') {
      args.report = argv[i + 1] || null;
      i += 1;
    } else if (a === '--config') {
      args.config = argv[i + 1] || null;
      i += 1;
    }
  }

  return args;
}

function safeReadJson(absPath) {
  try {
    const raw = fs.readFileSync(absPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function rel(repoRoot, absPath) {
  return path.relative(repoRoot, absPath).split(path.sep).join('/');
}

function findPropertyRanges(source, key) {
  const ranges = [];
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keyRegex = new RegExp(`^\\s+['\"]${escapedKey}['\"]\\s*:`, 'gm');
  let match;

  while ((match = keyRegex.exec(source)) !== null) {
    const start = match.index;
    let i = keyRegex.lastIndex;

    let depthParen = 0;
    let depthBracket = 0;
    let depthBrace = 0;
    let inString = null;
    let escaped = false;

    while (i < source.length && /\s/.test(source[i])) i += 1;

    for (; i < source.length; i += 1) {
      const ch = source[i];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === '\\') {
          escaped = true;
          continue;
        }
        if (ch === inString) {
          inString = null;
        }
        continue;
      }

      if (ch === "'" || ch === '"' || ch === '`') {
        inString = ch;
        continue;
      }

      if (ch === '(') depthParen += 1;
      else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
      else if (ch === '[') depthBracket += 1;
      else if (ch === ']') depthBracket = Math.max(0, depthBracket - 1);
      else if (ch === '{') depthBrace += 1;
      else if (ch === '}') {
        if (depthBrace === 0) {
          ranges.push({ start, end: i });
          break;
        }
        depthBrace = Math.max(0, depthBrace - 1);
      } else if (ch === ',' && depthParen === 0 && depthBracket === 0 && depthBrace === 0) {
        ranges.push({ start, end: i + 1 });
        break;
      }
    }
  }

  return ranges;
}

function applyRanges(source, ranges) {
  if (ranges.length === 0) return source;
  const sorted = [...ranges].sort((a, b) => b.start - a.start);
  let out = source;
  for (const r of sorted) {
    out = out.slice(0, r.start) + out.slice(r.end);
  }
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(__dirname, '..');

  if (!args.report) {
    console.error('Missing required --report <path>.');
    process.exit(1);
  }

  const reportAbs = path.resolve(repoRoot, args.report);
  const report = safeReadJson(reportAbs);
  if (!report) {
    console.error(`Could not read report JSON: ${rel(repoRoot, reportAbs)}`);
    process.exit(1);
  }

  const defaultConfigPath = path.resolve(repoRoot, 'scripts', 'translation-usage.config.json');
  const configPath = args.config
    ? path.resolve(repoRoot, args.config)
    : fs.existsSync(defaultConfigPath)
      ? defaultConfigPath
      : null;
  const config = configPath ? safeReadJson(configPath) || {} : {};

  const languagesDir = path.resolve(repoRoot, config.languagesDir || 'src/languages');
  const languageFolders = config.languageFolders || ['en', 'es', 'zh'];

  const candidates = Array.isArray(report.likelyUnusedKeys) ? report.likelyUnusedKeys : [];

  const normalizeKey = (k) => String(k).trim().replace(/\s+/g, ' ');
  const onlySet = new Set((args.only || []).map(normalizeKey));

  const isAllCapsKey = (k) => /^[A-Z0-9_]+$/.test(k);

  const keysToRemove = candidates
    .filter((k) => typeof k === 'string' && k.length > 0)
    .filter((k) => (onlySet.size > 0 ? onlySet.has(normalizeKey(k)) : true))
    .filter((k) => {
      const hasDot = k.includes('.');
      const hasWhitespace = /\s/.test(k);

      if (!args.includeNondotted) {
        return hasDot && !hasWhitespace;
      }

      if (hasDot) return !hasWhitespace;

      if (args.includeNondottedAll) return true;

      return hasWhitespace && !isAllCapsKey(k);
    })
    .sort();

  console.log('Removing unused translation keys (based on report)...');
  console.log(`Report: ${rel(repoRoot, reportAbs)}`);
  console.log(`Mode: ${args.apply ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Keys selected: ${keysToRemove.length} (include-nondotted=${args.includeNondotted})`);
  if (args.includeNondotted && !args.includeNondottedAll) {
    console.log('Non-dotted mode: removing only non-dotted keys with spaces (and not ALLCAPS).');
  }
  if (onlySet.size > 0) {
    console.log(`Only removing explicitly listed keys: ${onlySet.size}`);
  }

  if (keysToRemove.length > 0) {
    console.log('\nSample keys:');
    keysToRemove.slice(0, args.max).forEach((k) => console.log(`  - ${k}`));
    if (keysToRemove.length > args.max) console.log(`  ... and ${keysToRemove.length - args.max} more`);
  }

  let totalRemoved = 0;
  const perFileRemoved = {};

  for (const langFolder of languageFolders) {
    const langDirAbs = path.resolve(languagesDir, langFolder);
    if (!fs.existsSync(langDirAbs)) {
      console.warn(`Skipping missing language folder: ${rel(repoRoot, langDirAbs)}`);
      continue;
    }

    const files = fs.readdirSync(langDirAbs).filter(f => f.endsWith('.js'));
    
    for (const filename of files) {
      const abs = path.join(langDirAbs, filename);
      const before = fs.readFileSync(abs, 'utf-8');
      let after = before;
      let removedHere = 0;

      for (const key of keysToRemove) {
        const ranges = findPropertyRanges(after, key);
        if (ranges.length > 0) {
          after = applyRanges(after, ranges);
          removedHere += ranges.length;
        }
      }

      const relPath = rel(repoRoot, abs);
      perFileRemoved[relPath] = removedHere;
      totalRemoved += removedHere;

      if (args.apply && after !== before) {
        fs.writeFileSync(abs, after, 'utf-8');
      }
    }
  }

  console.log('\nRemoved entries (properties) per file:');
  Object.entries(perFileRemoved).forEach(([file, count]) => {
    console.log(`  - ${file}: ${count}`);
  });
  console.log(`\nTotal removed properties: ${totalRemoved}`);

  if (!args.apply) {
    console.log('\nDry-run only. Re-run with --apply to write changes.');
  }

  process.exit(0);
}

main();
