# 行程詳情頁面設計草稿（基於璽品旅遊風格）

## 設計概念

打造一個高端奢華的行程詳情頁面，透過全屏大圖、動態配色、優雅的直式文字排版和詩意文案，營造出獨特的旅遊體驗感。

## 頁面結構

### 1. Hero 區域（全屏大圖）

**設計特點：**
- 全屏背景大圖（100vh）
- 深色漸層遮罩（從透明到黑色，確保文字可讀性）
- 置中的標題和副標題
- 向下滾動提示圖標

**HTML 結構：**
```tsx
<section className="relative h-screen w-full">
  {/* 背景圖片 */}
  <div 
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: `url(${tour.heroImage})` }}
  />
  
  {/* 深色漸層遮罩 */}
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
  
  {/* 內容 */}
  <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
    {/* 行程類別標籤 */}
    <div className="mb-4 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm">
      {tour.category}
    </div>
    
    {/* 主標題 */}
    <h1 className="text-5xl md:text-7xl font-serif font-bold text-center mb-6">
      {tour.title}
    </h1>
    
    {/* 副標題（行程亮點摘要）*/}
    <p className="text-lg md:text-xl text-center max-w-4xl opacity-90">
      {tour.heroSubtitle}
    </p>
    
    {/* 向下滾動提示 */}
    <div className="absolute bottom-8 animate-bounce">
      <ChevronDown className="w-8 h-8" />
    </div>
  </div>
</section>
```

**CSS 樣式：**
```css
/* 使用動態配色系統 */
:root {
  --color-primary: #4A90E2;
  --color-secondary: #7FB3D5;
  --color-accent: #F39C12;
  --color-text: #2C3E50;
  --color-text-light: #ECF0F1;
  --color-background: #F5F5F5;
  --color-background-dark: #2C3E50;
}

/* Hero 區域動畫 */
.hero-section {
  animation: fadeIn 1.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### 2. 浮動導航條

**設計特點：**
- 滾動到一定位置後出現
- 半透明背景 + 毛玻璃效果
- 包含快速跳轉連結（行程亮點、每日行程、費用說明、預訂）

**HTML 結構：**
```tsx
<nav 
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled ? 'translate-y-0' : '-translate-y-full'
  }`}
>
  <div className="bg-white/90 backdrop-blur-md shadow-md">
    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
      {/* 行程標題（縮小版）*/}
      <div className="text-lg font-semibold truncate max-w-md">
        {tour.title}
      </div>
      
      {/* 快速跳轉連結 */}
      <div className="hidden md:flex items-center gap-6">
        <a href="#highlights" className="text-sm hover:text-primary transition">
          行程亮點
        </a>
        <a href="#itinerary" className="text-sm hover:text-primary transition">
          每日行程
        </a>
        <a href="#pricing" className="text-sm hover:text-primary transition">
          費用說明
        </a>
        <Button 
          className="rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
        >
          立即預訂
        </Button>
      </div>
    </div>
  </div>
</nav>
```

### 3. 關鍵特色區塊（大字直式排版）

**設計特點：**
- 大字關鍵詞（直式排版）
- 詩意文案（橫式排版）
- 圖文交錯佈局
- 金色點綴

**HTML 結構：**
```tsx
<section className="py-20 bg-background">
  <div className="container mx-auto px-4">
    {tour.keyFeatures.map((feature, index) => (
      <div 
        key={feature.id}
        className={`flex flex-col md:flex-row items-center gap-12 mb-20 ${
          index % 2 === 1 ? 'md:flex-row-reverse' : ''
        }`}
      >
        {/* 圖片區域 */}
        {feature.image && (
          <div className="w-full md:w-1/2">
            <img 
              src={feature.image}
              alt={feature.imageAlt}
              className="w-full h-[500px] object-cover rounded-2xl shadow-xl"
            />
          </div>
        )}
        
        {/* 文字區域 */}
        <div className={`w-full ${feature.image ? 'md:w-1/2' : 'md:w-full text-center'}`}>
          {/* 大字關鍵詞（直式排版）*/}
          <div className="flex items-start gap-8 mb-8">
            <h2 
              className="text-6xl md:text-8xl font-serif font-bold writing-mode-vertical-rl"
              style={{ color: 'var(--color-primary)' }}
            >
              {feature.keyword}
            </h2>
            
            {/* 詩意文案 */}
            <div className="flex-1">
              {feature.phrases.map((phrase, i) => (
                <p 
                  key={i}
                  className="text-2xl md:text-3xl font-serif mb-4 opacity-80"
                >
                  {phrase}
                </p>
              ))}
            </div>
          </div>
          
          {/* 描述文字 */}
          <p className="text-lg text-gray-600 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    ))}
  </div>
</section>
```

**CSS 樣式：**
```css
/* 直式文字排版 */
.writing-mode-vertical-rl {
  writing-mode: vertical-rl;
  text-orientation: upright;
}
```

### 4. 行程亮點卡片

**設計特點：**
- 圖片卡片（3 欄網格佈局）
- 金色標籤（右下角）
- Hover 效果（放大、陰影）

**HTML 結構：**
```tsx
<section id="highlights" className="py-20 bg-white">
  <div className="container mx-auto px-4">
    {/* 區塊標題 */}
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
        行程亮點
      </h2>
      <div 
        className="w-24 h-1 mx-auto"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    </div>
    
    {/* 亮點卡片網格 */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {tour.highlights.map((highlight) => (
        <div 
          key={highlight.id}
          className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          {/* 圖片 */}
          <div className="relative h-[400px] overflow-hidden">
            <img 
              src={highlight.image}
              alt={highlight.imageAlt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* 深色漸層遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            
            {/* 金色標籤 */}
            <div 
              className="absolute bottom-4 right-4 px-4 py-2 rounded-full text-white text-sm font-semibold"
              style={{ backgroundColor: highlight.labelColor }}
            >
              {highlight.subtitle}
            </div>
          </div>
          
          {/* 文字內容 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-serif font-bold mb-2">
              {highlight.title}
            </h3>
            <p className="text-sm opacity-90">
              {highlight.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### 5. 每日行程區塊

**設計特點：**
- 時間軸設計
- 圖文交錯
- 展開/收合功能

**HTML 結構：**
```tsx
<section id="itinerary" className="py-20 bg-background">
  <div className="container mx-auto px-4">
    {/* 區塊標題 */}
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
        每日行程
      </h2>
      <div 
        className="w-24 h-1 mx-auto"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    </div>
    
    {/* 時間軸 */}
    <div className="relative">
      {/* 垂直線 */}
      <div 
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: 'var(--color-primary)' }}
      />
      
      {/* 每日行程項目 */}
      {tour.dailyItinerary.map((day, index) => (
        <div key={day.id} className="relative pl-20 pb-12">
          {/* 圓點 */}
          <div 
            className="absolute left-6 top-2 w-5 h-5 rounded-full border-4 border-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          
          {/* 日期標籤 */}
          <div className="inline-block px-4 py-2 bg-white rounded-full shadow-md mb-4">
            <span className="font-semibold">Day {index + 1}</span>
          </div>
          
          {/* 行程內容 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-serif font-bold mb-4">
              {day.title}
            </h3>
            
            {/* 行程圖片 */}
            {day.images && day.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {day.images.map((img, i) => (
                  <img 
                    key={i}
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ))}
              </div>
            )}
            
            {/* 行程描述 */}
            <p className="text-gray-600 leading-relaxed mb-4">
              {day.description}
            </p>
            
            {/* 餐食與住宿 */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span>{day.meals}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <span>{day.accommodation}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### 6. 費用說明區塊

**設計特點：**
- 清晰的價格表格
- 包含/不包含項目列表
- 金色點綴

**HTML 結構：**
```tsx
<section id="pricing" className="py-20 bg-white">
  <div className="container mx-auto px-4">
    {/* 區塊標題 */}
    <div className="text-center mb-12">
      <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
        費用說明
      </h2>
      <div 
        className="w-24 h-1 mx-auto"
        style={{ backgroundColor: 'var(--color-accent)' }}
      />
    </div>
    
    {/* 價格資訊 */}
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-xl p-8 text-white text-center">
        <div className="text-lg mb-2">起價</div>
        <div className="text-5xl font-bold mb-2">
          NT$ {tour.price.toLocaleString()}
        </div>
        <div className="text-sm opacity-90">{tour.priceUnit}</div>
      </div>
    </div>
    
    {/* 包含/不包含項目 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* 包含項目 */}
      <div className="bg-background rounded-2xl p-8">
        <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
          費用包含
        </h3>
        <ul className="space-y-3">
          {tour.includes.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 不包含項目 */}
      <div className="bg-background rounded-2xl p-8">
        <h3 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
          <XCircle className="w-6 h-6 text-gray-400" />
          費用不包含
        </h3>
        <ul className="space-y-3">
          {tour.excludes.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <X className="w-5 h-5 mt-0.5 flex-shrink-0 text-gray-400" />
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
</section>
```

### 7. 預訂按鈕區塊（固定在底部）

**設計特點：**
- 固定在頁面底部
- 半透明背景 + 毛玻璃效果
- 大按鈕（金色）

**HTML 結構：**
```tsx
<div className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-lg border-t">
  <div className="container mx-auto px-4 py-4 flex items-center justify-between">
    {/* 價格資訊 */}
    <div>
      <div className="text-sm text-gray-600">起價</div>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
        NT$ {tour.price.toLocaleString()}
      </div>
    </div>
    
    {/* 預訂按鈕 */}
    <Button 
      size="lg"
      className="rounded-full px-12 text-lg font-semibold"
      style={{ backgroundColor: 'var(--color-accent)' }}
    >
      立即預訂
    </Button>
  </div>
</div>
```

## 動態配色系統實作

### 1. 根據目的地自動選擇配色

```typescript
// 配色方案對照表
const colorSchemes: Record<string, ColorTheme> = {
  '日本': {
    primary: '#FFB6C1', // 櫻花粉
    secondary: '#4A90E2', // 富士藍
    accent: '#F39C12', // 金色
    text: '#2C3E50',
    textLight: '#ECF0F1',
    background: '#F5F5F5',
    backgroundDark: '#2C3E50'
  },
  '歐洲': {
    primary: '#D4AF37', // 古典金
    secondary: '#9B59B6', // 優雅紫
    accent: '#E74C3C', // 酒紅
    text: '#2C3E50',
    textLight: '#ECF0F1',
    background: '#F5F5F5',
    backgroundDark: '#2C3E50'
  },
  '東南亞': {
    primary: '#27AE60', // 熱帶綠
    secondary: '#F39C12', // 陽光橙
    accent: '#3498DB', // 海洋藍
    text: '#2C3E50',
    textLight: '#ECF0F1',
    background: '#F5F5F5',
    backgroundDark: '#2C3E50'
  },
  // ... 其他配色方案
};

// 根據目的地獲取配色
function getColorTheme(destinationCountry: string): ColorTheme {
  return colorSchemes[destinationCountry] || colorSchemes['日本']; // 預設為日本配色
}
```

### 2. 應用配色到頁面

```typescript
// 在 TourDetail 組件中
useEffect(() => {
  if (tour) {
    // 解析配色主題（如果資料庫有儲存）
    const theme = tour.colorTheme 
      ? JSON.parse(tour.colorTheme) 
      : getColorTheme(tour.destinationCountry);
    
    // 應用 CSS 變數
    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });
  }
}, [tour]);
```

## 圖片生成與上傳流程

### 1. 使用 Manus 圖片生成 API

```typescript
import { generateImage } from "./server/_core/imageGeneration";
import { storagePut } from "./server/storage";

// 生成 Hero 圖片
async function generateHeroImage(tour: Tour): Promise<string> {
  const prompt = `A stunning landscape photo of ${tour.destinationCity}, ${tour.destinationCountry}, high quality, professional photography, golden hour lighting`;
  
  // 生成圖片
  const { url: tempImageUrl } = await generateImage({ prompt });
  
  // 下載圖片並上傳到 S3
  const response = await fetch(tempImageUrl);
  const imageBuffer = await response.arrayBuffer();
  
  const fileKey = `tours/${tour.id}/hero-${Date.now()}.jpg`;
  const { url: s3Url } = await storagePut(
    fileKey,
    Buffer.from(imageBuffer),
    'image/jpeg'
  );
  
  return s3Url;
}

// 生成行程亮點圖片
async function generateHighlightImages(tour: Tour): Promise<string[]> {
  const imageUrls: string[] = [];
  
  for (const highlight of tour.highlights) {
    const prompt = `${highlight.title}, ${tour.destinationCity}, beautiful scenery, professional photography`;
    
    const { url: tempImageUrl } = await generateImage({ prompt });
    const response = await fetch(tempImageUrl);
    const imageBuffer = await response.arrayBuffer();
    
    const fileKey = `tours/${tour.id}/highlight-${highlight.id}-${Date.now()}.jpg`;
    const { url: s3Url } = await storagePut(
      fileKey,
      Buffer.from(imageBuffer),
      'image/jpeg'
    );
    
    imageUrls.push(s3Url);
  }
  
  return imageUrls;
}
```

### 2. 整合到 AI 自動生成流程

```typescript
// 在 autoGenerate mutation 中
const heroImageUrl = await generateHeroImage(tourData);
const highlightImageUrls = await generateHighlightImages(tourData);

// 更新行程資料
await db.update(tours)
  .set({
    heroImage: heroImageUrl,
    highlights: JSON.stringify(
      tourData.highlights.map((h, i) => ({
        ...h,
        image: highlightImageUrls[i]
      }))
    )
  })
  .where(eq(tours.id, tourData.id));
```

## 響應式設計

### 手機版調整

- Hero 區域高度調整為 70vh
- 標題字體縮小（text-4xl）
- 關鍵特色區塊改為單欄佈局
- 行程亮點卡片改為單欄佈局
- 浮動導航條隱藏部分連結，改為漢堡選單

### 平板版調整

- Hero 區域高度調整為 80vh
- 標題字體適中（text-5xl）
- 關鍵特色區塊改為雙欄佈局
- 行程亮點卡片改為雙欄佈局

## 效能優化

### 圖片載入優化

- 使用 lazy loading
- 使用 WebP 格式
- 提供多種尺寸（srcset）

### 動畫效果

- 使用 Intersection Observer 實作滾動動畫
- 避免過度使用動畫影響效能

## 總結

這個設計草稿提供了一個完整的行程詳情頁面架構，結合了璽品旅遊的高端設計風格和現代網頁技術。透過動態配色系統和 AI 圖片生成，每個行程都能呈現獨特的視覺風格，提升用戶體驗和品牌形象。
