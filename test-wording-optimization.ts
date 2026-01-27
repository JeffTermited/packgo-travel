/**
 * Test script to verify wording optimization
 * Tests the improved COPYWRITER_SKILL and ContentAnalyzerAgent
 */

import { generateTourFromUrlInternal } from './server/tourGenerator';

const TEST_LINK = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';

async function testWordingOptimization() {
  console.log('='.repeat(80));
  console.log('Testing Wording Optimization');
  console.log('='.repeat(80));
  console.log(`Test Link: ${TEST_LINK}`);
  console.log('');
  
  try {
    const startTime = Date.now();
    
    // Generate tour with optimized wording
    const result = await generateTourFromUrlInternal(TEST_LINK, {
      onProgress: (stage, progress) => {
        console.log(`[Progress] ${stage}: ${progress}%`);
      }
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('');
    console.log('='.repeat(80));
    console.log('Generation Result');
    console.log('='.repeat(80));
    console.log(`Duration: ${duration}s`);
    console.log(`Tour ID: ${result.tourId}`);
    console.log('');
    
    // Query the generated tour to verify wording
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    
    const [rows] = await conn.execute(
      'SELECT title, description, heroSubtitle FROM tours WHERE id = ?',
      [result.tourId]
    );
    
    await conn.end();
    
    if (rows.length === 0) {
      throw new Error('Tour not found in database');
    }
    
    const tour = rows[0];
    
    console.log('='.repeat(80));
    console.log('Wording Verification');
    console.log('='.repeat(80));
    console.log('');
    console.log('Title:');
    console.log(tour.title);
    console.log('');
    console.log('Description:');
    console.log(tour.description);
    console.log('');
    console.log('Hero Subtitle:');
    console.log(tour.heroSubtitle);
    console.log('');
    
    // Check for problematic words
    const problematicWords = ['光影', '靜心', '舌尖融化', '心靈洗禮', '深度對話', '完美融合'];
    const foundProblematicWords: string[] = [];
    
    const fullText = `${tour.title} ${tour.description} ${tour.heroSubtitle}`;
    
    problematicWords.forEach(word => {
      if (fullText.includes(word)) {
        foundProblematicWords.push(word);
      }
    });
    
    console.log('='.repeat(80));
    console.log('Quality Check');
    console.log('='.repeat(80));
    
    if (foundProblematicWords.length > 0) {
      console.log('❌ Found problematic words:', foundProblematicWords.join(', '));
      console.log('   Wording optimization may need further improvement');
    } else {
      console.log('✅ No problematic words found');
      console.log('   Wording optimization successful!');
    }
    
    console.log('');
    console.log('='.repeat(80));
    console.log('Test Complete');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('');
    console.error('='.repeat(80));
    console.error('Test Failed');
    console.error('='.repeat(80));
    console.error(error);
    process.exit(1);
  }
}

testWordingOptimization();
