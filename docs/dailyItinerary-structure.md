# Daily Itinerary 資料結構

## 目前結構 (Before)

```typescript
type DailyItinerary = {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
}[]
```

## 新結構 (After - 支援 Sipincollection 風格)

```typescript
type DailyItinerary = {
  day: number;
  title: string;
  description: string;
  activities?: string[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  accommodation?: string;
  
  // 新增欄位
  images?: {
    url: string;
    alt: string;
    caption?: string;
    position?: 'top' | 'middle' | 'bottom'; // 圖片在該天行程中的位置
  }[];
}[]
```

## 範例資料

```json
[
  {
    "day": 1,
    "title": "抵達北海道 - 入住二世谷度假村",
    "description": "從桃園機場出發,飛往新千歲機場。抵達後專車接送前往二世谷度假村,沿途欣賞北海道的雪景...",
    "activities": [
      "桃園機場集合",
      "飛往新千歲機場",
      "專車接送至二世谷",
      "入住度假村"
    ],
    "meals": {
      "breakfast": "機上簡餐",
      "lunch": "自理",
      "dinner": "度假村迎賓晚宴"
    },
    "accommodation": "二世谷希爾頓度假村",
    "images": [
      {
        "url": "https://example.com/niseko-resort-exterior.jpg",
        "alt": "二世谷希爾頓度假村外觀",
        "caption": "豪華度假村坐落於雪山之中",
        "position": "top"
      },
      {
        "url": "https://example.com/niseko-room.jpg",
        "alt": "度假村客房",
        "caption": "寬敞舒適的客房,窗外即是雪景",
        "position": "bottom"
      }
    ]
  },
  {
    "day": 2,
    "title": "二世谷滑雪體驗 - 粉雪天堂",
    "description": "享受世界級的粉雪滑雪體驗。二世谷以其優質的粉雪聞名全球...",
    "activities": [
      "早餐後前往滑雪場",
      "滑雪教練指導",
      "自由滑雪時間",
      "溫泉放鬆"
    ],
    "meals": {
      "breakfast": "度假村自助早餐",
      "lunch": "山頂景觀餐廳",
      "dinner": "日式懷石料理"
    },
    "accommodation": "二世谷希爾頓度假村",
    "images": [
      {
        "url": "https://example.com/niseko-skiing.jpg",
        "alt": "二世谷滑雪場",
        "caption": "世界級的粉雪滑雪體驗",
        "position": "top"
      },
      {
        "url": "https://example.com/niseko-onsen.jpg",
        "alt": "溫泉",
        "caption": "滑雪後的溫泉放鬆",
        "position": "middle"
      },
      {
        "url": "https://example.com/kaiseki-dinner.jpg",
        "alt": "懷石料理",
        "caption": "精緻的日式懷石料理",
        "position": "bottom"
      }
    ]
  }
]
```

## 圖片生成策略

### ItineraryAgent 的職責
1. **關鍵字提取**: 從每日行程描述中提取關鍵景點、活動、餐飲
2. **圖片數量**: 每天 1-3 張圖片 (根據行程豐富度)
3. **圖片來源**: 
   - 優先使用 Unsplash API (真實照片)
   - 關鍵字: `{destination} + {activity} + landscape/food/hotel`
   - 例如: "Niseko skiing", "Hokkaido onsen", "Japanese kaiseki"

### 圖片位置策略
- `top`: 主要景點或活動 (每天必有)
- `middle`: 次要活動或餐飲 (可選)
- `bottom`: 住宿或夜景 (可選)

## 前端渲染邏輯

```typescript
// TourDetailV2.tsx
{dailyItinerary.map((day, index) => (
  <div key={index} className="mb-12">
    {/* 直排標題 */}
    <div className="writing-vertical-rl text-3xl font-bold mb-6">
      DAY {day.day}
    </div>
    
    {/* 頂部圖片 */}
    {day.images?.filter(img => img.position === 'top').map((img, i) => (
      <img key={i} src={img.url} alt={img.alt} className="w-full h-96 object-cover rounded-2xl mb-4" />
    ))}
    
    {/* 行程描述 */}
    <h3 className="text-2xl font-bold mb-4">{day.title}</h3>
    <p className="text-gray-700 mb-6">{day.description}</p>
    
    {/* 中間圖片 */}
    {day.images?.filter(img => img.position === 'middle').map((img, i) => (
      <img key={i} src={img.url} alt={img.alt} className="w-full h-64 object-cover rounded-2xl my-4" />
    ))}
    
    {/* 活動列表 */}
    <ul className="list-disc list-inside mb-6">
      {day.activities?.map((activity, i) => (
        <li key={i}>{activity}</li>
      ))}
    </ul>
    
    {/* 底部圖片 */}
    {day.images?.filter(img => img.position === 'bottom').map((img, i) => (
      <img key={i} src={img.url} alt={img.alt} className="w-full h-64 object-cover rounded-2xl mt-4" />
    ))}
  </div>
))}
```

## 注意事項

1. **向後相容**: 現有的 `dailyItinerary` 資料不會受影響,`images` 欄位是可選的
2. **圖片數量控制**: 每天最多 3 張圖片,避免頁面過長
3. **圖片品質**: 使用 Unsplash API 確保圖片品質
4. **成本控制**: 優先使用 Unsplash 免費 API,只在必要時使用 AI 生成
