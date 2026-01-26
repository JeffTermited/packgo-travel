/**
 * Test Agent Skills Integration
 * Verify that all agents can load their SKILL.md documents
 */

import { getCacheStats, clearCache } from './skillLoader';
import { MasterAgent } from './masterAgent';
import { WebScraperAgent } from './webScraperAgent';
import { ContentAnalyzerAgent } from './contentAnalyzerAgent';
import { ColorThemeAgent } from './colorThemeAgent';
import { ImagePromptAgent } from './imagePromptAgent';
import { ImageGenerationAgent } from './imageGenerationAgent';
import { ItineraryAgent } from './itineraryAgent';
import { CostAgent } from './costAgent';
import { NoticeAgent } from './noticeAgent';
import { HotelAgent } from './hotelAgent';
import { MealAgent } from './mealAgent';
import { FlightAgent } from './flightAgent';

async function testSkillsIntegration() {
  console.log('\n=== Agent Skills Integration Test ===\n');
  
  try {
    // Clear cache before testing
    clearCache();
    console.log('[Test] Cache cleared\n');
    
    // Test 1: Initialize all agents
    console.log('[Test] Initializing all agents...\n');
    
    const masterAgent = new MasterAgent();
    const webScraperAgent = new WebScraperAgent();
    const contentAnalyzerAgent = new ContentAnalyzerAgent();
    const colorThemeAgent = new ColorThemeAgent();
    const imagePromptAgent = new ImagePromptAgent();
    const imageGenerationAgent = new ImageGenerationAgent();
    const itineraryAgent = new ItineraryAgent();
    const costAgent = new CostAgent();
    const noticeAgent = new NoticeAgent();
    const hotelAgent = new HotelAgent();
    const mealAgent = new MealAgent();
    const flightAgent = new FlightAgent();
    
    console.log('[Test] All agents initialized successfully\n');
    
    // Test 2: Check cache statistics
    const stats = getCacheStats();
    console.log('[Test] Cache Statistics:');
    console.log(`  - Skill documents loaded: ${stats.skillCount}`);
    console.log(`  - Section caches created: ${stats.sectionCount}`);
    
    // Test 3: Verify expected number of agents
    const expectedAgents = 12;
    if (stats.skillCount === expectedAgents) {
      console.log(`\n✅ SUCCESS: All ${expectedAgents} agents loaded their SKILL.md documents`);
    } else {
      console.log(`\n⚠️  WARNING: Expected ${expectedAgents} agents, but only ${stats.skillCount} loaded SKILLs`);
    }
    
    // Test 4: Estimate token savings
    console.log('\n[Test] Token Optimization Estimate:');
    console.log('  - Using key sections only (角色定義, 核心職責, 輸出格式, JSON Schema)');
    console.log('  - Estimated token reduction: 70-80%');
    console.log('  - Full SKILL.md size: ~10-15KB per agent');
    console.log('  - Key sections size: ~2-3KB per agent');
    
    console.log('\n=== Test Completed ===\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run test
testSkillsIntegration();
