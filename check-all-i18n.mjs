import fs from 'fs';
import path from 'path';

const enContent = fs.readFileSync('client/src/i18n/en.ts', 'utf8');
const zhContent = fs.readFileSync('client/src/i18n/zh-TW.ts', 'utf8');
const esContent = fs.readFileSync('client/src/i18n/es.ts', 'utf8');

// Admin component files to check
const adminFiles = [
  'client/src/components/admin/ToursTab.tsx',
  'client/src/components/admin/TourEditDialog.tsx',
  'client/src/components/admin/SkillsTab.tsx',
  'client/src/components/admin/TranslationsTab.tsx',
  'client/src/components/admin/DeparturesManagement.tsx',
  'client/src/components/admin/GenerationProgress.tsx',
  'client/src/components/admin/Admin.tsx',
];

function extractUsedKeys(content) {
  const regex = /t\('([^']+)'\)/g;
  const keys = [...content.matchAll(regex)].map(m => m[1]);
  return [...new Set(keys)].sort();
}

function extractAllDefinedKeys(content) {
  // Extract all key paths from the language file
  const keys = new Set();
  
  // Match section names and their keys
  const sectionRegex = /(\w+):\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(content)) !== null) {
    const sectionName = sectionMatch[1];
    const sectionContent = sectionMatch[2];
    const keyRegex = /^\s+(\w+):/gm;
    let keyMatch;
    while ((keyMatch = keyRegex.exec(sectionContent)) !== null) {
      keys.add(`${sectionName}.${keyMatch[1]}`);
    }
  }
  return keys;
}

const enKeys = extractAllDefinedKeys(enContent);
const zhKeys = extractAllDefinedKeys(zhContent);
const esKeys = extractAllDefinedKeys(esContent);

let totalMissingEn = 0;
let totalMissingZh = 0;
let totalMissingEs = 0;

for (const file of adminFiles) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const usedKeys = extractUsedKeys(content);
  
  const missingEn = usedKeys.filter(k => !enKeys.has(k));
  const missingZh = usedKeys.filter(k => !zhKeys.has(k));
  const missingEs = usedKeys.filter(k => !esKeys.has(k));
  
  if (missingEn.length > 0 || missingZh.length > 0 || missingEs.length > 0) {
    console.log(`\n=== ${path.basename(file)} ===`);
    if (missingEn.length > 0) {
      console.log(`  Missing in en.ts (${missingEn.length}):`, missingEn);
      totalMissingEn += missingEn.length;
    }
    if (missingZh.length > 0) {
      console.log(`  Missing in zh-TW.ts (${missingZh.length}):`, missingZh);
      totalMissingZh += missingZh.length;
    }
    if (missingEs.length > 0) {
      console.log(`  Missing in es.ts (${missingEs.length}):`, missingEs);
      totalMissingEs += missingEs.length;
    }
  } else {
    console.log(`✓ ${path.basename(file)} - all keys present`);
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total missing in en.ts: ${totalMissingEn}`);
console.log(`Total missing in zh-TW.ts: ${totalMissingZh}`);
console.log(`Total missing in es.ts: ${totalMissingEs}`);
