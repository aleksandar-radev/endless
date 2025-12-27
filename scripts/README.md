# Scripts

This directory contains utility scripts for the Endless project.

## Available Scripts

### check-translations.js

Checks that all language files have the same translation keys and reports any missing translations or duplicate keys.

**Usage:**

```bash
pnpm check-translations
```

**What it does:**

- Scans all language files in `src/languages/`
- **Detects duplicate keys within each file** - catches when the same key appears multiple times
- Compares **actual key names** across all languages (en.js, es.js, zh.js)
- Reports missing keys and extra keys for each language
- Uses the language with the most unique keys as reference (usually en.js)
- Exits with code 0 if all translations are in sync, 1 if there are issues

**Example output when translations are in sync:**

```
📊 Key Counts:

  en.js      1309 keys (1309 unique)
  es.js      1309 keys (1309 unique)
  zh.js      1309 keys (1309 unique)

✅ All language files are in sync!
   All translations are complete and no duplicates found.
```

**Example output when duplicates found:**

```
📊 Key Counts:

  en.js      1311 keys (1309 unique) ⚠️  DUPLICATES!
  es.js      1309 keys (1309 unique)
  zh.js      1309 keys (1309 unique)

⚠️  en.js has 2 duplicate key(s):
     - 'skill.bloodFrenzy' appears 2 times
     - 'skill.deadlyPrecision' appears 2 times

❌ Found duplicate keys in language files!
```

**Example output when translations are missing:**

```
❌ Found issues with translations!
   Total missing keys across all languages: 5

🔍 es.js:

  ❌ Missing 3 keys:
     - some.translation.key
     - another.key
     ...
```

## Adding New Scripts

When adding new scripts to this directory:

1. Create the script file with a descriptive name
2. Add appropriate documentation at the top of the file
3. Add a corresponding npm script in `package.json`
4. Update this README with usage instructions

### check-unused-translations.js

Reports translation keys that appear unused in the codebase.

This is a **static best-effort** scan. It only finds keys referenced as string literals (e.g. `t('foo.bar')`).
Some translation keys are built dynamically at runtime (e.g. stats names), so this script is intentionally conservative and supports ignores.

**Usage:**

```bash
pnpm check-unused-translations
```

**Config:**

- Default config: `scripts/translation-usage.config.json`
- Use `ignoreKeyPatterns` for dynamic namespaces (regex strings), e.g. `^stats\\.`.

**Strict mode (CI-friendly):**

```bash
node scripts/check-unused-translations.js --strict
```

### remove-unused-translations.js

Removes translation keys from language files using the JSON report produced by `check-unused-translations.js`.

This is **dangerous** if your code uses dynamic lookups like `t(variable)`.
For safety, it defaults to **dry-run** and only removes keys that contain a dot (`.`).

**Dry-run (recommended first):**

```bash
node scripts/check-unused-translations.js --out scripts/.tmp/translation-usage-report.json
node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json
```

**Apply changes:**

```bash
node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json --apply
```

**More aggressive (high risk):**

```bash
node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json --apply --include-nondotted
```

**Maximum aggressive (very high risk):**

```bash
node scripts/remove-unused-translations.js --report scripts/.tmp/translation-usage-report.json --apply --include-nondotted-all
```
