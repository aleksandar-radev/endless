#!/usr/bin/env node
/**
 * Skill Conversion Validation Script
 * 
 * This script checks if skill files have been properly converted to the new system.
 * It reports on:
 * - Usage of old vs new scaling functions
 * - Skill types and their stat patterns
 * - Missing synergies
 * - Potential issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_FILES = [
  'warriorSkills.js',
  'rogueSkills.js',
  'vampireSkills.js',
  'paladinSkills.js',
  'berserkerSkills.js',
  'elementalistSkills.js',
  'druidSkills.js',
  'mageSkills.js',
];

const skillsDir = path.join(__dirname, 'src', 'constants', 'skills');

function analyzeSkillFile(filename) {
  const filepath = path.join(skillsDir, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ ${filename}: File not found`);
    return null;
  }
  
  const content = fs.readFileSync(filepath, 'utf-8');
  
  // Check imports
  const hasOldImports = /import.*scaleDownFlat|import.*scaleUpFlat/.test(content);
  const hasNewImports = /import.*getFlatDamage|import.*getDamagePercent|import.*getSynergyBonus/.test(content);
  
  // Count function usage
  const oldFunctionCount = (content.match(/scaleDownFlat\(|scaleUpFlat\(/g) || []).length;
  const newFunctionCount = (content.match(/getFlatDamage\(|getDamagePercent\(|getSynergyBonus\(/g) || []).length;
  
  // Count skill types
  const passiveCount = (content.match(/type: \(\) => 'passive'/g) || []).length;
  const toggleCount = (content.match(/type: \(\) => 'toggle'/g) || []).length;
  const instantCount = (content.match(/type: \(\) => 'instant'/g) || []).length;
  const buffCount = (content.match(/type: \(\) => 'buff'/g) || []).length;
  const summonCount = (content.match(/type: \(\) => 'summon'/g) || []).length;
  
  // Check for synergies
  const synergyCount = (content.match(/synergies:\s*\[/g) || []).length;
  
  // Check for problematic patterns in passives/toggles
  const passiveWithPercent = (content.match(/type: \(\) => 'passive'[\s\S]{0,300}Percent:/g) || []).length;
  const toggleWithPercent = (content.match(/type: \(\) => 'toggle'[\s\S]{0,300}Percent:/g) || []).length;
  
  const totalSkills = passiveCount + toggleCount + instantCount + buffCount + summonCount;
  const synergyPercentage = totalSkills > 0 ? Math.round((synergyCount / totalSkills) * 100) : 0;
  
  const status = {
    filename,
    hasOldImports,
    hasNewImports,
    oldFunctionCount,
    newFunctionCount,
    totalSkills,
    passiveCount,
    toggleCount,
    instantCount,
    buffCount,
    summonCount,
    synergyCount,
    synergyPercentage,
    passiveWithPercent,
    toggleWithPercent,
  };
  
  return status;
}

function printReport(status) {
  const { filename, hasOldImports, hasNewImports, oldFunctionCount, newFunctionCount, 
          totalSkills, passiveCount, toggleCount, instantCount, buffCount, summonCount,
          synergyCount, synergyPercentage, passiveWithPercent, toggleWithPercent } = status;
  
  const isConverted = !hasOldImports && hasNewImports && oldFunctionCount === 0;
  const icon = isConverted ? '✅' : '⚠️';
  
  console.log(`\n${icon} ${filename}`);
  console.log(`   Status: ${isConverted ? 'CONVERTED' : 'NEEDS CONVERSION'}`);
  
  if (hasOldImports) {
    console.log(`   ⚠️  Still imports old scaling functions`);
  }
  if (!hasNewImports && !isConverted) {
    console.log(`   ⚠️  Missing new function imports`);
  }
  
  if (oldFunctionCount > 0) {
    console.log(`   ⚠️  ${oldFunctionCount} calls to old scaling functions`);
  }
  if (newFunctionCount > 0) {
    console.log(`   ✓  ${newFunctionCount} calls to new scaling functions`);
  }
  
  console.log(`   Skills: ${totalSkills} total (${passiveCount} passive, ${toggleCount} toggle, ${instantCount} instant, ${buffCount} buff, ${summonCount} summon)`);
  console.log(`   Synergies: ${synergyCount} (${synergyPercentage}% of skills)`);
  
  if (passiveWithPercent > 0) {
    console.log(`   ⚠️  ${passiveWithPercent} passive skills still have Percent stats`);
  }
  if (toggleWithPercent > 0) {
    console.log(`   ⚠️  ${toggleWithPercent} toggle skills still have Percent stats`);
  }
  
  if (isConverted && synergyCount === 0) {
    console.log(`   💡 Consider adding synergies to this class`);
  }
}

console.log('='.repeat(60));
console.log('Skill System Conversion Validation Report');
console.log('='.repeat(60));

let totalConverted = 0;
let totalNeedsConversion = 0;

SKILL_FILES.forEach(filename => {
  const status = analyzeSkillFile(filename);
  if (status) {
    printReport(status);
    const isConverted = !status.hasOldImports && status.hasNewImports && status.oldFunctionCount === 0;
    if (isConverted) {
      totalConverted++;
    } else {
      totalNeedsConversion++;
    }
  }
});

console.log('\n' + '='.repeat(60));
console.log(`Summary: ${totalConverted}/${SKILL_FILES.length} files converted`);
console.log(`Remaining: ${totalNeedsConversion} files need conversion`);
console.log('='.repeat(60));

if (totalNeedsConversion > 0) {
  console.log('\nNext steps:');
  console.log('1. Review SKILL_CONVERSION_GUIDE.md for detailed instructions');
  console.log('2. Convert remaining skill files following the Warrior skills pattern');
  console.log('3. Run this script again to verify progress');
  process.exit(1);
} else {
  console.log('\n✨ All skill files have been converted! ✨');
  process.exit(0);
}
