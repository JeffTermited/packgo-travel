/**
 * Real Tour Test Script
 * 測試使用真實的雄獅旅遊行程 URL
 */

import { MasterAgent } from './masterAgent';

async function testRealTour() {
  console.log('='.repeat(80));
  console.log('🧪 Real Tour Test - Lion Travel URL');
  console.log('='.repeat(80));
  console.log();

  const testUrl = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';
  
  console.log(`📍 Test URL: ${testUrl}`);
  console.log();

  const masterAgent = new MasterAgent();
  
  console.log('⏱️  Starting MasterAgent execution...');
  console.log(`🕐 Start Time: ${new Date().toISOString()}`);
  console.log();

  const startTime = Date.now();

  try {
    const result = await masterAgent.execute({ url: testUrl });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log();
    console.log('='.repeat(80));
    console.log('✅ MasterAgent Execution Completed');
    console.log('='.repeat(80));
    console.log();
    console.log(`⏱️  Total Duration: ${duration}s`);
    console.log(`🕐 End Time: ${new Date().toISOString()}`);
    console.log();

    // Display result summary
    if (result.success && result.data) {
      const data = result.data;
      
      console.log('📊 Result Summary:');
      console.log('-'.repeat(80));
      console.log(`✓ Title: ${data.title || 'N/A'}`);
      console.log(`✓ Description Length: ${data.description?.length || 0} chars`);
      console.log(`✓ Country: ${data.country || 'N/A'}`);
      console.log(`✓ City: ${data.city || 'N/A'}`);
      console.log(`✓ Days: ${data.days || 'N/A'}`);
      console.log(`✓ Price: ${data.price || 'N/A'}`);
      console.log(`✓ Highlights: ${data.highlights?.length || 0} items`);
      console.log(`✓ Itinerary Days: ${data.itinerary?.length || 0} days`);
      console.log(`✓ Images: ${data.images?.length || 0} images`);
      console.log(`✓ Color Theme: ${data.colorTheme?.primary || 'N/A'}`);
      console.log();

      // Display title (check if keyword-dense style)
      if (data.title) {
        console.log('📝 Generated Title:');
        console.log('-'.repeat(80));
        console.log(data.title);
        console.log();
        
        // Check if title follows Lion Travel style
        const hasProductLevel = /^(旗艦|經典|特選|smart tour)/i.test(data.title);
        const hasSeparators = data.title.includes('｜') || data.title.includes('.');
        const keywordCount = data.title.split(/[｜.]/).length;
        
        console.log('🎯 Title Style Analysis:');
        console.log(`  - Has Product Level Prefix: ${hasProductLevel ? '✓' : '✗'}`);
        console.log(`  - Has Separators (｜ or .): ${hasSeparators ? '✓' : '✗'}`);
        console.log(`  - Keyword Count: ${keywordCount} ${keywordCount >= 5 ? '✓' : '✗ (should be 5-8)'}`);
        console.log();
      }

      // Display highlights
      if (data.highlights && data.highlights.length > 0) {
        console.log('🌟 Highlights:');
        console.log('-'.repeat(80));
        data.highlights.forEach((highlight, index) => {
          console.log(`  ${index + 1}. ${highlight}`);
        });
        console.log();
      }

      // Display color theme
      if (data.colorTheme) {
        console.log('🎨 Color Theme:');
        console.log('-'.repeat(80));
        console.log(`  Primary: ${data.colorTheme.primary}`);
        console.log(`  Secondary: ${data.colorTheme.secondary || 'N/A'}`);
        console.log(`  Accent: ${data.colorTheme.accent || 'N/A'}`);
        console.log();
      }

      // Display images
      if (data.images && data.images.length > 0) {
        console.log('🖼️  Generated Images:');
        console.log('-'.repeat(80));
        data.images.forEach((image, index) => {
          console.log(`  ${index + 1}. ${image.description || 'No description'}`);
          console.log(`     URL: ${image.url}`);
        });
        console.log();
      }

      // Display itinerary summary
      if (data.itinerary && data.itinerary.length > 0) {
        console.log('📅 Itinerary Summary:');
        console.log('-'.repeat(80));
        data.itinerary.forEach((day, index) => {
          console.log(`  Day ${index + 1}: ${day.title || 'No title'}`);
          console.log(`    Activities: ${day.activities?.length || 0}`);
          console.log(`    Meals: ${day.meals || 'N/A'}`);
          console.log(`    Accommodation: ${day.accommodation || 'N/A'}`);
        });
        console.log();
      }

    } else {
      console.log('❌ Error:', result.error || 'Unknown error');
    }

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log();
    console.log('='.repeat(80));
    console.log('❌ MasterAgent Execution Failed');
    console.log('='.repeat(80));
    console.log();
    console.log(`⏱️  Duration before failure: ${duration}s`);
    console.log(`🕐 Failure Time: ${new Date().toISOString()}`);
    console.log();
    console.log('Error Details:');
    console.error(error);
  }

  console.log();
  console.log('='.repeat(80));
  console.log('🏁 Test Completed');
  console.log('='.repeat(80));
}

// Run the test
testRealTour().catch(console.error);
