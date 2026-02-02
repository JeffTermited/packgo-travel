/**
 * 智能標籤生成器測試
 */

import { describe, it, expect } from "vitest";
import { generateSmartTags, mergeWithExistingTags } from "./tagGenerator";

describe("tagGenerator", () => {
  describe("generateSmartTags", () => {
    it("應該根據天數生成深度旅遊標籤", () => {
      const tags = generateSmartTags({ days: 13 });
      expect(tags).toContain("深度旅遊");
    });

    it("應該根據天數生成經典行程標籤", () => {
      const tags = generateSmartTags({ days: 8 });
      expect(tags).toContain("經典行程");
    });

    it("應該根據天數生成輕旅行標籤", () => {
      const tags = generateSmartTags({ days: 3 });
      expect(tags).toContain("輕旅行");
    });

    it("應該根據高價格生成精緻行程標籤", () => {
      const tags = generateSmartTags({ price: 150000 });
      expect(tags).toContain("精緻行程");
    });

    it("應該根據低價格生成超值優惠標籤", () => {
      const tags = generateSmartTags({ price: 15000 });
      expect(tags).toContain("超值優惠");
    });

    it("應該根據 tourType 生成交通標籤 - 鳴日號", () => {
      const tags = generateSmartTags({}, "MINGRI_TRAIN");
      expect(tags).toContain("鐵道");
      expect(tags).toContain("觀光列車");
    });

    it("應該根據 tourType 生成交通標籤 - 郵輪", () => {
      const tags = generateSmartTags({}, "CRUISE");
      expect(tags).toContain("郵輪");
    });

    it("應該根據 tourType 生成交通標籤 - 航空", () => {
      const tags = generateSmartTags({}, "FLIGHT");
      expect(tags).toContain("航空");
    });

    it("應該從文字內容識別美食之旅", () => {
      const tags = generateSmartTags({
        title: "日本美食之旅",
        description: "品嚐米其林料理",
      });
      expect(tags).toContain("美食之旅");
    });

    it("應該從文字內容識別溫泉標籤", () => {
      const tags = generateSmartTags({
        description: "享受頂級溫泉泡湯體驗",
      });
      expect(tags).toContain("溫泉");
    });

    it("應該從文字內容識別永續旅遊", () => {
      const tags = generateSmartTags({
        title: "ESG永續旅遊｜紐西蘭",
      });
      expect(tags).toContain("永續旅遊");
    });

    it("應該限制最多 6 個標籤", () => {
      const tags = generateSmartTags({
        days: 13,
        price: 150000,
        title: "ESG永續旅遊美食之旅",
        description: "溫泉泡湯、健行登山、攝影打卡",
      }, "FLIGHT");
      expect(tags.length).toBeLessThanOrEqual(6);
    });

    it("應該正確處理紐西蘭冰河行程", () => {
      const tags = generateSmartTags({
        days: 13,
        price: 200000,
        title: "紐西蘭南北島13日",
        description: "冰河健行·峽灣星宿",
        destinationCountry: "紐西蘭",
      }, "FLIGHT");
      expect(tags).toContain("深度旅遊");
      expect(tags).toContain("精緻行程");
      expect(tags).toContain("航空");
    });

    it("應該正確處理台灣輕旅行", () => {
      const tags = generateSmartTags({
        days: 3,
        price: 15000,
        title: "澎湖南海雙島探險",
        destinationCountry: "台灣",
      });
      expect(tags).toContain("輕旅行");
      expect(tags).toContain("超值優惠");
    });
  });

  describe("mergeWithExistingTags", () => {
    it("應該合併現有標籤和生成的標籤", () => {
      const existing = ["原有標籤1", "原有標籤2"];
      const generated = ["生成標籤1", "生成標籤2"];
      const merged = mergeWithExistingTags(existing, generated);
      expect(merged).toContain("原有標籤1");
      expect(merged).toContain("生成標籤1");
    });

    it("應該處理 JSON 字串格式的現有標籤", () => {
      const existing = JSON.stringify(["原有標籤"]);
      const generated = ["生成標籤"];
      const merged = mergeWithExistingTags(existing, generated);
      expect(merged).toContain("原有標籤");
      expect(merged).toContain("生成標籤");
    });

    it("應該去除重複標籤", () => {
      const existing = ["重複標籤", "原有標籤"];
      const generated = ["重複標籤", "生成標籤"];
      const merged = mergeWithExistingTags(existing, generated);
      const duplicateCount = merged.filter((t) => t === "重複標籤").length;
      expect(duplicateCount).toBe(1);
    });

    it("應該限制最多 8 個標籤", () => {
      const existing = ["1", "2", "3", "4", "5"];
      const generated = ["6", "7", "8", "9", "10"];
      const merged = mergeWithExistingTags(existing, generated);
      expect(merged.length).toBeLessThanOrEqual(8);
    });

    it("應該處理 null 或 undefined 的現有標籤", () => {
      const merged1 = mergeWithExistingTags(null, ["生成標籤"]);
      const merged2 = mergeWithExistingTags(undefined, ["生成標籤"]);
      expect(merged1).toContain("生成標籤");
      expect(merged2).toContain("生成標籤");
    });

    it("應該處理無效 JSON 字串", () => {
      const merged = mergeWithExistingTags("invalid json", ["生成標籤"]);
      expect(merged).toContain("生成標籤");
    });
  });
});
