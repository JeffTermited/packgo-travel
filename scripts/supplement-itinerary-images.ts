/**
 * 為現有行程補充每日行程圖片
 * 執行方式: npx tsx scripts/supplement-itinerary-images.ts
 */
import mysql from 'mysql2/promise';
import { searchUnsplashPhotos } from '../server/services/unsplashService';
import { ENV } from '../server/_core/env';

async function main() {
  console.log('Starting to supplement itinerary images...');
  
  const conn = await mysql.createConnection(ENV.databaseUrl);
  
  // 獲取所有行程
  const [tours] = await conn.execute(
    'SELECT id, title, itineraryDetailed, destinationCountry, destinationCity FROM tours'
  ) as any;
  
  console.log(`Found ${tours.length} tours to process`);
  
  for (const tour of tours) {
    if (!tour.itineraryDetailed) {
      console.log(`Tour ${tour.id}: No itinerary data, skipping`);
      continue;
    }
    
    try {
      const itineraries = JSON.parse(tour.itineraryDetailed);
      console.log(`Tour ${tour.id} (${tour.title}): ${itineraries.length} days`);
      
      let updated = false;
      
      for (let i = 0; i < itineraries.length; i++) {
        const day = itineraries[i];
        
        // 如果已經有圖片，跳過
        if (day.image) {
          console.log(`  Day ${day.day}: Already has image`);
          continue;
        }
        
        // 搜尋圖片
        const location = day.activities?.[0]?.location || day.title || tour.destinationCity;
        const query = `${location} ${tour.destinationCountry || ''} travel`.trim();
        
        console.log(`  Day ${day.day}: Searching for "${query}"...`);
        
        try {
          const images = await searchUnsplashPhotos(query, 1);
          if (images && images[0]) {
            itineraries[i] = {
              ...day,
              image: images[0],
              imageAlt: `${location} - ${tour.destinationCountry || '旅遊'}`
            };
            updated = true;
            console.log(`  Day ${day.day}: ✓ Found image`);
          } else {
            console.log(`  Day ${day.day}: No image found`);
          }
        } catch (err: any) {
          console.error(`  Day ${day.day}: Error - ${err.message}`);
        }
        
        // 添加延遲避免 API 限制
        await new Promise(r => setTimeout(r, 500));
      }
      
      if (updated) {
        // 更新資料庫
        await conn.execute(
          'UPDATE tours SET itineraryDetailed = ? WHERE id = ?',
          [JSON.stringify(itineraries), tour.id]
        );
        console.log(`Tour ${tour.id}: Updated successfully`);
      }
    } catch (err: any) {
      console.error(`Tour ${tour.id}: Error - ${err.message}`);
    }
  }
  
  await conn.end();
  console.log('Done!');
}

main().catch(console.error);
