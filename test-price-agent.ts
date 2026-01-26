/**
 * 測試 PriceAgent 價格抓取功能
 */

import { PriceAgent } from "./server/agents/priceAgent";

async function testPriceAgent() {
  console.log("=== Testing PriceAgent ===\n");
  
  const testUrl = "https://travel.liontravel.com/detail?NormGroupID=ffaabdeb-b371-441d-9a6b-c93e65db57c4&GroupID=26EU214CI-T&TourSource=Lion&Platform=APP";
  
  console.log("Test URL:", testUrl);
  console.log("\nStarting price extraction...\n");
  
  const priceAgent = new PriceAgent();
  
  try {
    const startTime = Date.now();
    const result = await priceAgent.execute(testUrl);
    const duration = (Date.now() - startTime) / 1000;
    
    console.log("\n=== Result ===");
    console.log("Success:", result.success);
    console.log("Duration:", duration.toFixed(1), "seconds");
    
    if (result.success && result.data) {
      console.log("\nExtracted Data:");
      console.log("- Price:", result.data.price);
      console.log("- Price Unit:", result.data.priceUnit);
      console.log("- Currency:", result.data.currency);
      console.log("- Original Text:", result.data.originalPriceText);
      
      if (result.data.departureDates && result.data.departureDates.length > 0) {
        console.log("\nDeparture Dates:");
        result.data.departureDates.forEach((d, i) => {
          console.log(`  ${i + 1}. Date: ${d.date}, Price: ${d.price}, Status: ${d.status}`);
        });
      }
    } else {
      console.log("\nError:", result.error);
    }
  } catch (error) {
    console.error("\nTest failed with error:", error);
  } finally {
    await priceAgent.closeBrowser();
  }
  
  console.log("\n=== Test Complete ===");
}

testPriceAgent();
