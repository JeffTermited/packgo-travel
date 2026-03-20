import fs from 'fs';

const toursTabContent = fs.readFileSync('client/src/components/admin/ToursTab.tsx', 'utf8');
const tourEditDialogContent = fs.readFileSync('client/src/components/admin/TourEditDialog.tsx', 'utf8');
const enContent = fs.readFileSync('client/src/i18n/en.ts', 'utf8');
const zhContent = fs.readFileSync('client/src/i18n/zh-TW.ts', 'utf8');
const esContent = fs.readFileSync('client/src/i18n/es.ts', 'utf8');

function extractUsedKeys(content, prefix) {
  const regex = new RegExp(`t\\('(${prefix}\\.[^']+)'\\)`, 'g');
  const keys = [...content.matchAll(regex)].map(m => m[1].replace(prefix + '.', ''));
  return [...new Set(keys)].sort();
}

function extractDefinedKeys(content, sectionName) {
  const sectionRegex = new RegExp(`${sectionName}:\\s*\\{([\\s\\S]*?)\\n  \\},`);
  const match = content.match(sectionRegex);
  if (!match) return [];
  const sectionContent = match[1];
  return [...sectionContent.matchAll(/^\s+(\w+):/gm)].map(m => m[1]);
}

// Check toursTab
const toursTabUsed = extractUsedKeys(toursTabContent, 'toursTab');
const toursTabEnDefined = extractDefinedKeys(enContent, 'toursTab');
const toursTabZhDefined = extractDefinedKeys(zhContent, 'toursTab');
const toursTabEsDefined = extractDefinedKeys(esContent, 'toursTab');

const toursTabMissingEn = toursTabUsed.filter(k => !toursTabEnDefined.includes(k));
const toursTabMissingZh = toursTabUsed.filter(k => !toursTabZhDefined.includes(k));
const toursTabMissingEs = toursTabUsed.filter(k => !toursTabEsDefined.includes(k));

console.log('=== toursTab ===');
console.log('Missing in en.ts:', toursTabMissingEn);
console.log('Missing in zh-TW.ts:', toursTabMissingZh);
console.log('Missing in es.ts:', toursTabMissingEs);

// Check tourEditDialog
const tourEditUsed = extractUsedKeys(tourEditDialogContent, 'tourEditDialog');
const tourEditEnDefined = extractDefinedKeys(enContent, 'tourEditDialog');
const tourEditZhDefined = extractDefinedKeys(zhContent, 'tourEditDialog');
const tourEditEsDefined = extractDefinedKeys(esContent, 'tourEditDialog');

const tourEditMissingEn = tourEditUsed.filter(k => !tourEditEnDefined.includes(k));
const tourEditMissingZh = tourEditUsed.filter(k => !tourEditZhDefined.includes(k));
const tourEditMissingEs = tourEditUsed.filter(k => !tourEditEsDefined.includes(k));

console.log('\n=== tourEditDialog ===');
console.log('Missing in en.ts:', tourEditMissingEn);
console.log('Missing in zh-TW.ts:', tourEditMissingZh);
console.log('Missing in es.ts:', tourEditMissingEs);
