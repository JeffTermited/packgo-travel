# 對比度問題修正筆記

## 已確認的問題位置

根據用戶截圖和瀏覽器檢視，發現以下對比度問題：

### 1. DAY 標籤（白字灰底）- DailyItinerarySection.tsx
- 位置：行程卡片左上角的 Day Badge
- 問題：DAY 標籤使用白色文字，但背景色可能是淺色（如淺灰色）
- 修正方案：確保 Day Badge 背景使用深色（colorTheme.accent），或增加文字陰影

### 2. 目的地標籤（白字灰底）
- 位置：Hero 區塊或卡片上的目的地標籤
- 問題：標籤使用 bg-white/20 背景，在淺色圖片上難以辨識
- 修正方案：增加背景不透明度或添加深色邊框

### 3. 今日餐食標題（灰字淺背景）- DailyItinerarySection.tsx
- 位置：餐食區塊的標題和圖標
- 問題：使用 text-gray-500 顏色，對比度不足
- 修正方案：改用 text-gray-700 或 text-gray-800

### 4. 景點列表時間軸圓點（灰色難以辨識）
- 位置：景點列表中的時間軸圓點
- 問題：圓點使用淺灰色
- 修正方案：使用 colorTheme.accent 或更深的顏色

### 5. 景點描述文字（灰字對比度不足）
- 位置：景點列表中的描述文字
- 問題：文字使用淺灰色
- 修正方案：改用 text-gray-700 或 text-gray-800

## 需要修正的檔案

1. DailyItinerarySection.tsx - 餐食區塊的 text-gray-500 改為 text-gray-700
2. HeroSection.tsx - 關鍵字標籤的背景透明度
3. 其他組件中的 text-gray-400/500 改為 text-gray-600/700
