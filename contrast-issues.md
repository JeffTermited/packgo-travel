# 對比度問題分析

## 截圖觀察結果

從用戶提供的截圖和瀏覽器檢視中發現以下問題：

### 1. DAY 標籤（白字灰底）
- 位置：DailyItinerarySection 組件中的 Day Badge
- 問題：DAY 1 標籤使用白色文字在淺灰色背景上，對比度不足
- 截圖：Screenshot2026-02-02at2.46.49PM.png

### 2. 目的地標籤（白字灰底）
- 位置：HeroSection 或卡片上的目的地標籤
- 問題：「台灣」等標籤使用白色文字在淺灰色背景上
- 截圖：Screenshot2026-02-02at2.46.45PM.png

### 3. 今日餐食標題（灰字淺背景）
- 位置：DailyItinerarySection 中的餐食區塊
- 問題：「今日餐食」標題和圖標使用灰色，對比度不足
- 截圖：Screenshot2026-02-02at2.47.17PM.png

### 4. 時間軸圓點（灰色難以辨識）
- 位置：景點列表中的時間軸圓點
- 問題：圓點使用淺灰色，在白色背景上難以辨識
- 截圖：Screenshot2026-02-02at2.47.41PM.png

### 5. 景點描述文字（灰字對比度不足）
- 位置：景點列表中的描述文字
- 問題：文字使用淺灰色，對比度不足
- 截圖：Screenshot2026-02-02at2.47.49PM.png

## 需要修正的組件

1. DailyItinerarySection.tsx - Day Badge 和餐食區塊
2. HeroSection.tsx - 目的地標籤
3. FeaturesSection.tsx - 特色標籤
4. 景點列表相關組件 - 時間軸圓點和描述文字
