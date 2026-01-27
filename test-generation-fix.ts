/**
 * Test script to trigger AI tour generation and verify data completeness
 * Tests the fix for missing detailed fields (hotels, meals, flights, etc.)
 */

import { generateTourFromUrlInternal } from "./server/tourGenerator";
import { Job } from "bullmq";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Mock BullMQ Job for testing
class MockJob {
  private progress: any = {};
  
  async updateProgress(data: any) {
    this.progress = data;
    console.log(`📊 Progress: ${data.percentage}% - ${data.message}`);
    return Promise.resolve();
  }
  
  getProgress() {
    return this.progress;
  }
}

async function testGeneration() {
  console.log("🚀 Starting AI tour generation test...\n");
  
  const testUrl = "https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T";
  const testUserId = 1; // Admin user ID
  
  const startTime = Date.now();
  
  try {
    // Create mock job
    const mockJob = new MockJob() as any;
    
    // Generate tour
    console.log("📝 Generating tour from URL:", testUrl);
    const result = await generateTourFromUrlInternal(testUrl, testUserId, mockJob);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n✅ Generation completed in ${duration} seconds`);
    console.log("Result:", result);
    
    if (result.success && result.tourId) {
      console.log(`\n🔍 Verifying data completeness for tour ID: ${result.tourId}`);
      
      // Connect to database
      const conn = await mysql.createConnection(process.env.DATABASE_URL!);
      
      // Query tour data
      const [rows] = await conn.execute(
        `SELECT 
          id, title, 
          itineraryDetailed, 
          costExplanation, 
          noticeDetailed, 
          hotels, 
          meals, 
          flights 
        FROM tours 
        WHERE id = ?`,
        [result.tourId]
      );
      
      const tour = (rows as any[])[0];
      
      console.log("\n📊 Data Completeness Report:");
      console.log("================================");
      console.log(`Tour ID: ${tour.id}`);
      console.log(`Title: ${tour.title}`);
      console.log("");
      
      // Check each field
      const fields = [
        { name: "itineraryDetailed", label: "每日行程" },
        { name: "costExplanation", label: "費用說明" },
        { name: "noticeDetailed", label: "注意事項" },
        { name: "hotels", label: "飯店介紹" },
        { name: "meals", label: "餐飲介紹" },
        { name: "flights", label: "航班資訊" },
      ];
      
      let completeCount = 0;
      let totalCount = fields.length;
      
      for (const field of fields) {
        const value = tour[field.name];
        const isComplete = value !== null && value !== "";
        const status = isComplete ? "✅" : "❌";
        
        if (isComplete) completeCount++;
        
        console.log(`${status} ${field.label} (${field.name}): ${isComplete ? "有資料" : "無資料"}`);
        
        if (isComplete && value) {
          try {
            const parsed = JSON.parse(value);
            const itemCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
            console.log(`   └─ 包含 ${itemCount} 個項目`);
          } catch (e) {
            console.log(`   └─ 資料長度: ${value.length} 字元`);
          }
        }
      }
      
      console.log("");
      console.log("================================");
      console.log(`完整度: ${completeCount}/${totalCount} (${((completeCount/totalCount)*100).toFixed(1)}%)`);
      
      await conn.end();
      
      if (completeCount === totalCount) {
        console.log("\n🎉 SUCCESS! All fields are populated correctly!");
      } else {
        console.log("\n⚠️  WARNING: Some fields are missing data!");
      }
    }
    
  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

// Run test
testGeneration();
