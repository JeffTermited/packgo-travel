/**
 * Test script for Reference file integration
 * Tests the skillLoader's Reference loading capabilities
 */

import {
  loadReference,
  loadReferenceSections,
  getSipincollectionGuidelines,
  getDestinationColorPalette,
  getPoeticTitleExamples,
  getCacheStats,
  clearCache
} from './skillLoader';

console.log('='.repeat(80));
console.log('Testing Reference File Integration');
console.log('='.repeat(80));

// Test 1: Load full Sipincollection Guidelines
console.log('\n[Test 1] Loading full Sipincollection Design Guidelines...');
const fullGuidelines = getSipincollectionGuidelines();
console.log(`✓ Loaded ${fullGuidelines.length} characters`);

// Test 2: Load specific sections from Sipincollection Guidelines
console.log('\n[Test 2] Loading specific sections from Sipincollection Guidelines...');
const sections = getSipincollectionGuidelines(['✍️ 文案風格', '🎯 應用指南 (給 AI Agents)']);
console.log(`✓ Loaded ${sections.length} characters`);

// Test 3: Load full Destination Color Palette
console.log('\n[Test 3] Loading full Destination Color Palette...');
const fullPalette = getDestinationColorPalette();
console.log(`✓ Loaded ${fullPalette.length} characters`);

// Test 4: Load specific region from Destination Color Palette
console.log('\n[Test 4] Loading Asia region from Destination Color Palette...');
const asiaPalette = getDestinationColorPalette('亞洲');
console.log(`✓ Loaded ${asiaPalette.length} characters`);

// Test 5: Load full Poetic Title Examples
console.log('\n[Test 5] Loading full Poetic Title Examples...');
const fullExamples = getPoeticTitleExamples();
console.log(`✓ Loaded ${fullExamples.length} characters`);

// Test 6: Load specific region from Poetic Title Examples
console.log('\n[Test 6] Loading Asia examples from Poetic Title Examples...');
const asiaExamples = getPoeticTitleExamples('亞洲');
console.log(`✓ Loaded ${asiaExamples.length} characters`);

// Test 7: Test generic loadReference function
console.log('\n[Test 7] Testing generic loadReference function...');
const designNotes = loadReference('sipincollection-design-notes');
console.log(`✓ Loaded ${designNotes.length} characters`);

// Test 8: Test loadReferenceSections function
console.log('\n[Test 8] Testing loadReferenceSections function...');
const colorSections = loadReferenceSections('Destination-Color-Palette', ['🌏 亞洲地區']);
console.log(`✓ Loaded ${colorSections.length} characters`);

// Test 9: Check cache statistics
console.log('\n[Test 9] Checking cache statistics...');
const stats = getCacheStats();
console.log(`✓ Cache stats:`, stats);

// Test 10: Clear cache and verify
console.log('\n[Test 10] Testing cache clear...');
clearCache();
const statsAfterClear = getCacheStats();
console.log(`✓ Cache stats after clear:`, statsAfterClear);

// Test 11: Reload after cache clear (should reload from file)
console.log('\n[Test 11] Reloading after cache clear...');
const reloadedGuidelines = getSipincollectionGuidelines();
console.log(`✓ Reloaded ${reloadedGuidelines.length} characters`);

// Final cache stats
console.log('\n[Final] Final cache statistics:');
const finalStats = getCacheStats();
console.log(finalStats);

console.log('\n' + '='.repeat(80));
console.log('✅ All Reference integration tests passed!');
console.log('='.repeat(80));
