/**
 * Script to check for missing translations across all language files
 * Run with: node scripts/check-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LANGUAGES_DIR = path.join(__dirname, '..', 'src', 'languages');
const LANGUAGE_CODES = ['en', 'es', 'zh'];

// Extract keys from a language file content
function extractKeys(content) {
  const keyRegex = /^\s+['"]([^'"]+)['"]:/gm;
  const keys = [];
  let match;

  while ((match = keyRegex.exec(content)) !== null) {
    keys.push(match[1]);
  }

  return keys;
}

// Read all translation files from a language folder
function readLanguageFiles(langCode) {
  const langDir = path.join(LANGUAGES_DIR, langCode);
  
  if (!fs.existsSync(langDir)) {
    console.error(`Error: Language directory ${langCode}/ not found`);
    return null;
  }

  const stat = fs.statSync(langDir);
  if (!stat.isDirectory()) {
    console.error(`Error: ${langCode} is not a directory`);
    return null;
  }

  const allKeys = [];
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    const filePath = path.join(langDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const keys = extractKeys(content);
    allKeys.push(...keys);
  }

  // Find duplicate keys
  const duplicates = allKeys.reduce((acc, key) => {
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const duplicateKeys = Object.entries(duplicates)
    .filter(([_, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));

  return {
    filename: `${langCode}/`,
    keys: allKeys,
    keySet: new Set(allKeys),
    duplicates: duplicateKeys,
  };
}

// Main function
function checkTranslations() {
  console.log('Checking translations across all language files...\n');
  console.log('='.repeat(80));

  // Read all language files
  const languages = LANGUAGE_CODES.map(readLanguageFiles).filter(Boolean);

  if (languages.length === 0) {
    console.error('No language files found!');
    process.exit(1);
  }

  // Display key counts
  console.log('\n📊 Key Counts:\n');
  languages.forEach((lang) => {
    const uniqueKeys = lang.keySet.size;
    const totalKeys = lang.keys.length;
    const hasDupes = totalKeys !== uniqueKeys;
    console.log(
      `  ${lang.filename.padEnd(10)} ${totalKeys} keys (${uniqueKeys} unique)${hasDupes ? ' ⚠️  DUPLICATES!' : ''}`,
    );
  });

  // Check for duplicates in any file
  let hasDuplicates = false;
  languages.forEach((lang) => {
    if (lang.duplicates.length > 0) {
      hasDuplicates = true;
      console.log(`\n⚠️  ${lang.filename} has ${lang.duplicates.length} duplicate key(s):`);
      lang.duplicates.forEach(({ key, count }) => {
        console.log(`     - '${key}' appears ${count} times`);
      });
    }
  });

  if (hasDuplicates) {
    console.log('\n' + '='.repeat(80));
    console.log('\n❌ Found duplicate keys in language files!');
    console.log('   Please remove duplicates before checking translations.\n');
    process.exit(1);
  }

  // Find the reference language (usually the one with the most keys)
  const referenceLang = languages.reduce((max, lang) => (lang.keySet.size > max.keySet.size ? lang : max));

  console.log(`\n📖 Using ${referenceLang.filename} as reference (${referenceLang.keySet.size} unique keys)`);
  console.log('='.repeat(80));

  let totalMissing = 0;
  let hasIssues = false;

  // Check each language against the reference
  languages.forEach((lang) => {
    if (lang.filename === referenceLang.filename) return;

    const missingKeys = [...referenceLang.keySet].filter((key) => !lang.keySet.has(key));
    const extraKeys = [...lang.keySet].filter((key) => !referenceLang.keySet.has(key));

    if (missingKeys.length > 0 || extraKeys.length > 0) {
      hasIssues = true;
      console.log(`\n🔍 ${lang.filename}:`);

      if (missingKeys.length > 0) {
        console.log(`\n  ❌ Missing ${missingKeys.length} keys:`);
        missingKeys.slice(0, 20).forEach((key) => {
          console.log(`     - ${key}`);
        });
        if (missingKeys.length > 20) {
          console.log(`     ... and ${missingKeys.length - 20} more`);
        }
        totalMissing += missingKeys.length;
      }

      if (extraKeys.length > 0) {
        console.log(`\n  ⚠️  Extra ${extraKeys.length} keys (not in reference):`);
        extraKeys.slice(0, 10).forEach((key) => {
          console.log(`     - ${key}`);
        });
        if (extraKeys.length > 10) {
          console.log(`     ... and ${extraKeys.length - 10} more`);
        }
      }
    }
  });

  console.log('\n' + '='.repeat(80));

  if (!hasIssues) {
    console.log('\n✅ All language files are in sync!');
    console.log('   All translations are complete and no duplicates found.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Found issues with translations!');
    console.log(`   Total missing keys across all languages: ${totalMissing}\n`);
    process.exit(1);
  }
}

// Run the check
checkTranslations();
