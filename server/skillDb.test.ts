import { describe, it, expect, vi, beforeEach } from "vitest";
import { applySkillRules } from "./skillDb";
import { AgentSkill } from "../drizzle/schema";

describe("skillDb", () => {
  describe("applySkillRules", () => {
    it("should apply keyword-based rules correctly", () => {
      const mockSkill = {
        id: 1,
        skillType: "feature_classification",
        skillName: "ESG 永續旅遊識別",
        skillNameEn: "ESG Sustainable Tourism",
        keywords: JSON.stringify(["ESG", "永續", "環保", "低碳"]),
        rules: JSON.stringify({
          conditions: [
            { type: "keyword", keywords: ["ESG", "永續"], outputLabel: "ESG永續" },
            { type: "keyword", keywords: ["環保", "低碳"], outputLabel: "環保旅遊" }
          ]
        }),
        outputLabels: JSON.stringify(["ESG永續", "環保旅遊"]),
        outputFormat: null,
        description: "識別 ESG 永續旅遊相關行程",
        source: null,
        sourceUrl: null,
        confidence: "1.00",
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null,
        isActive: true,
        isBuiltIn: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AgentSkill;

      // Test with ESG content
      const content1 = "ESG永續旅遊｜紐西蘭南北島13日";
      const labels1 = applySkillRules(mockSkill, content1);
      expect(labels1).toContain("ESG永續");

      // Test with 環保 content
      const content2 = "環保低碳旅遊行程";
      const labels2 = applySkillRules(mockSkill, content2);
      expect(labels2).toContain("環保旅遊");

      // Test with no matching content
      const content3 = "一般旅遊行程";
      const labels3 = applySkillRules(mockSkill, content3);
      expect(labels3.length).toBe(0);
    });

    it("should apply range-based rules correctly", () => {
      const mockSkill = {
        id: 2,
        skillType: "tag_rule",
        skillName: "天數標籤規則",
        skillNameEn: "Duration Tag Rules",
        keywords: JSON.stringify(["天", "日"]),
        rules: JSON.stringify({
          conditions: [
            { type: "range", field: "duration", min: 10, outputLabel: "深度旅遊" },
            { type: "range", field: "duration", min: 7, max: 9, outputLabel: "經典行程" },
            { type: "range", field: "duration", max: 4, outputLabel: "輕旅行" }
          ]
        }),
        outputLabels: JSON.stringify(["深度旅遊", "經典行程", "輕旅行"]),
        outputFormat: null,
        description: "根據行程天數自動生成對應標籤",
        source: null,
        sourceUrl: null,
        confidence: "1.00",
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null,
        isActive: true,
        isBuiltIn: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AgentSkill;

      // Test with 13 days (深度旅遊)
      const labels1 = applySkillRules(mockSkill, "行程內容", { duration: 13 });
      expect(labels1).toContain("深度旅遊");

      // Test with 8 days (經典行程)
      const labels2 = applySkillRules(mockSkill, "行程內容", { duration: 8 });
      expect(labels2).toContain("經典行程");

      // Test with 3 days (輕旅行)
      const labels3 = applySkillRules(mockSkill, "行程內容", { duration: 3 });
      expect(labels3).toContain("輕旅行");
    });

    it("should apply price-based rules correctly", () => {
      const mockSkill = {
        id: 3,
        skillType: "tag_rule",
        skillName: "價格標籤規則",
        skillNameEn: "Price Tag Rules",
        keywords: JSON.stringify(["價格", "費用"]),
        rules: JSON.stringify({
          conditions: [
            { type: "range", field: "price", min: 80000, outputLabel: "精緻行程" },
            { type: "range", field: "price", max: 30000, outputLabel: "超值優惠" }
          ]
        }),
        outputLabels: JSON.stringify(["精緻行程", "超值優惠"]),
        outputFormat: null,
        description: "根據行程價格自動生成對應標籤",
        source: null,
        sourceUrl: null,
        confidence: "1.00",
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null,
        isActive: true,
        isBuiltIn: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AgentSkill;

      // Test with high price (精緻行程)
      const labels1 = applySkillRules(mockSkill, "行程內容", { price: 150000 });
      expect(labels1).toContain("精緻行程");

      // Test with low price (超值優惠)
      const labels2 = applySkillRules(mockSkill, "行程內容", { price: 25000 });
      expect(labels2).toContain("超值優惠");
    });

    it("should remove duplicate labels", () => {
      const mockSkill = {
        id: 4,
        skillType: "feature_classification",
        skillName: "重複測試",
        skillNameEn: "Duplicate Test",
        keywords: JSON.stringify(["測試"]),
        rules: JSON.stringify({
          conditions: [
            { type: "keyword", keywords: ["測試"], outputLabel: "測試標籤" },
            { type: "keyword", keywords: ["測試"], outputLabel: "測試標籤" }
          ]
        }),
        outputLabels: JSON.stringify(["測試標籤"]),
        outputFormat: null,
        description: "測試重複標籤移除",
        source: null,
        sourceUrl: null,
        confidence: "1.00",
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null,
        isActive: true,
        isBuiltIn: false,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AgentSkill;

      const labels = applySkillRules(mockSkill, "測試內容");
      // Should only have one "測試標籤" even though two conditions matched
      expect(labels.filter(l => l === "測試標籤").length).toBe(1);
    });

    it("should use default outputLabels when no conditions match but keywords do", () => {
      const mockSkill = {
        id: 5,
        skillType: "feature_classification",
        skillName: "預設標籤測試",
        skillNameEn: "Default Label Test",
        keywords: JSON.stringify(["美食", "料理"]),
        rules: JSON.stringify({
          conditions: []
        }),
        outputLabels: JSON.stringify(["美食之旅"]),
        outputFormat: null,
        description: "測試預設標籤",
        source: null,
        sourceUrl: null,
        confidence: "1.00",
        usageCount: 0,
        successCount: 0,
        lastUsedAt: null,
        isActive: true,
        isBuiltIn: false,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as AgentSkill;

      const labels = applySkillRules(mockSkill, "美食料理行程");
      expect(labels).toContain("美食之旅");
    });
  });
});
