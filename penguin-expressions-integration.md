# 企鵝表情整合功能

## S3 上傳的表情圖像 URLs

| 表情 | URL |
|------|-----|
| 預設/揮手 (waving) | https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/WkOQbHIhVnUckSkg.png |
| 思考 (thinking) | https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/SjvtTEmhuOMPCozg.png |
| 開心 (happy) | https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/qvHPuVaTsuielbwl.png |
| 困惑 (confused) | https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/vyzjOiHzLOerStch.png |
| 原始頭像 (default) | https://files.manuscdn.com/user_upload_by_module/session_file/310519663159191204/bJsbScmQpKmVdhut.png |

## 表情切換邏輯

1. **對話框開啟時**: 顯示揮手表情 (waving) → 2秒後切換為預設表情
2. **用戶發送訊息時**: 顯示思考表情 (thinking) + 彈跳動畫
3. **AI 回應成功時**: 顯示開心表情 (happy) → 3秒後切換為預設表情
4. **AI 回應失敗時**: 顯示困惑表情 (confused) → 3秒後切換為預設表情
5. **用戶給正面回饋時**: 顯示開心表情 (happy) → 2秒後切換為預設表情

## 整合的組件

- `AITravelAdvisorDialog.tsx`: 對話框組件，包含表情切換邏輯
- `Home.tsx`: 首頁浮動按鈕，使用揮手企鵝圖像

## 動畫效果

- 表情切換時有 scale 放大動畫 (300ms)
- 思考狀態時企鵝有彈跳動畫
- 載入指示器使用三個跳動的圓點
