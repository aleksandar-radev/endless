// This script obfuscates all JavaScript files in the dist directory after Vite build
import JavaScriptObfuscator from 'javascript-obfuscator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function obfuscateFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 1,
    renameGlobals: true,
    identifierNamesGenerator: 'hexadecimal',
    transformObjectKeys: true,
  });
  fs.writeFileSync(filePath, obfuscated.getObfuscatedCode(), 'utf8');
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (file.endsWith('.js')) {
      obfuscateFile(fullPath);
    }
  });
}

walk(path.join(__dirname, 'dist'));
console.log('Obfuscation complete.');
