# 灰底白字對比度問題分析

## 問題描述
用戶反映行程詳情頁面中有多處「灰底白字」的元素，導致文字難以閱讀。用戶希望改為「白底黑字」或其他高對比度配色。

## 已識別的問題元素

### 1. DAY 標籤
- 位置：每日行程區塊頂部
- 當前樣式：`style={{ backgroundColor: themeColor.secondary }}` + `text-white`
- 問題：當 themeColor.secondary 是淺色（如灰色）時，白字看不清
- 解決方案：改為白底黑字，或確保背景色足夠深

### 2. 目的地標籤（Hero Section）
- 位置：Hero Section 中的國家標籤
- 當前樣式：`style={{ backgroundColor: themeColor.secondary }}` + `text-white`
- 問題：同上

### 3. 餐食區塊標題
- 位置：「今日餐食」區塊
- 當前樣式：使用主題色作為標題顏色
- 問題：當主題色是淺色時，文字對比度不足

## 解決方案

### 方案 A：改為白底黑字（用戶偏好）
- DAY 標籤：白底 + 黑字 + 邊框
- 目的地標籤：白底 + 黑字 + 邊框
- 餐食標題：深色文字

### 方案 B：確保背景色足夠深
- 使用 themeColor.primary（較深）而非 themeColor.secondary
- 或添加最小亮度檢查，確保背景色足夠深

## 實施計劃
採用方案 A，將所有標籤改為白底黑字設計，更清晰易讀。
