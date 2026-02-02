# 區塊重疊問題分析

## 問題描述
當用戶向下滾動行程詳情頁面時，兩個區塊（section）發生重疊。

## 分析結果

### 頁面結構
1. **主 Header** (`Header.tsx`): `sticky top-0 z-50` - 高度約 80px (h-20)
2. **Sticky Navigation Tabs** (`TourDetailPeony.tsx` 第 1500 行): `sticky top-0 z-50`

### 問題原因
兩個元素都設置為 `sticky top-0`，當滾動時：
- 主 Header 固定在頂部
- Sticky Navigation Tabs 也固定在頂部
- 由於兩者都是 `top-0`，它們會重疊在一起

### 解決方案
將 Sticky Navigation Tabs 的 `top` 值設為主 Header 的高度（80px），這樣當滾動時，
Sticky Navigation Tabs 會固定在 Header 下方，而不是與 Header 重疊。

修改 TourDetailPeony.tsx 第 1500 行：
- 原本: `className="sticky top-0 z-50 bg-white shadow-sm"`
- 修改為: `className="sticky top-[80px] z-40 bg-white shadow-sm"`

注意：z-index 也應該調整為比 Header 低（z-40 vs z-50），確保 Header 在最上層。
