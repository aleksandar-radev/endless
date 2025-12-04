# Scripts

This directory contains utility scripts for the Endless project.

## Available Scripts

### check-translations.js

Checks that all language files have the same translation keys and reports any missing translations or duplicate keys.

**Usage:**
```bash
npm run check-translations
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
