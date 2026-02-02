import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

// Mock the skillDb module
vi.mock("../skillDb", () => ({
  getAllSkills: vi.fn(),
  createSkill: vi.fn(),
  matchSkillsToContent: vi.fn(),
  applySkillRules: vi.fn(),
  incrementSkillUsage: vi.fn(),
  logSkillApplication: vi.fn(),
  seedBuiltInSkills: vi.fn(),
}));

import { learnFromPdfContent, applyLearnedSkills, initializeBuiltInSkills } from "./learningAgent";
import { invokeLLM } from "../_core/llm";
import * as skillDb from "../skillDb";

describe("learningAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("learnFromPdfContent", () => {
    it("should successfully learn skills from PDF content", async () => {
      // Mock LLM response with extracted skills
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              skills: [{
                skillType: "feature_classification",
                skillName: "ESG永續旅遊",
                skillNameEn: "ESG Sustainable Travel",
                keywords: ["ESG", "永續", "環保", "碳中和"],
                rules: {
                  conditions: [{
                    type: "keyword",
                    keywords: ["ESG", "永續"],
                    outputLabel: "ESG永續旅遊"
                  }]
                },
                outputLabels: ["ESG永續旅遊"],
                description: "識別ESG永續旅遊特色的技能"
              }]
            })
          }
        }]
      };
      
      vi.mocked(invokeLLM).mockResolvedValue(mockLLMResponse as any);
      vi.mocked(skillDb.getAllSkills).mockResolvedValue([]);
      vi.mocked(skillDb.createSkill).mockResolvedValue(1);

      const result = await learnFromPdfContent(
        "ESG永續旅遊 紐西蘭南北島13日 冰河健行",
        "雄獅旅遊",
        "https://example.com/tour.pdf",
        1
      );

      expect(result.success).toBe(true);
      expect(result.skillsLearned).toBe(1);
      expect(result.skillIds).toContain(1);
      expect(skillDb.createSkill).toHaveBeenCalledTimes(1);
    });

    it("should skip existing skills", async () => {
      const mockLLMResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              skills: [{
                skillType: "feature_classification",
                skillName: "ESG永續旅遊",
                keywords: ["ESG"],
                rules: { conditions: [] },
                outputLabels: ["ESG永續旅遊"],
                description: "Test"
              }]
            })
          }
        }]
      };
      
      vi.mocked(invokeLLM).mockResolvedValue(mockLLMResponse as any);
      // Return existing skill with same name
      vi.mocked(skillDb.getAllSkills).mockResolvedValue([{
        id: 1,
        skillType: "feature_classification",
        skillName: "ESG永續旅遊",
        keywords: "[]",
        rules: "{}",
        isActive: true,
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }] as any);

      const result = await learnFromPdfContent(
        "ESG永續旅遊內容",
        "測試來源"
      );

      expect(result.success).toBe(true);
      expect(result.skillsLearned).toBe(0);
      expect(skillDb.createSkill).not.toHaveBeenCalled();
    });

    it("should handle LLM parse errors gracefully", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: "invalid json"
          }
        }]
      } as any);
      vi.mocked(skillDb.getAllSkills).mockResolvedValue([]);

      const result = await learnFromPdfContent(
        "Test content",
        "Test source"
      );

      expect(result.success).toBe(true);
      expect(result.skillsLearned).toBe(0);
      expect(result.errors).toBeDefined();
    });

    it("should handle empty skills response", async () => {
      vi.mocked(invokeLLM).mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({ skills: [] })
          }
        }]
      } as any);
      vi.mocked(skillDb.getAllSkills).mockResolvedValue([]);

      const result = await learnFromPdfContent(
        "Generic content without special features",
        "Test source"
      );

      expect(result.success).toBe(true);
      expect(result.skillsLearned).toBe(0);
    });
  });

  describe("applyLearnedSkills", () => {
    it("should apply matching skills and return labels", async () => {
      const mockSkill = {
        id: 1,
        skillType: "feature_classification",
        skillName: "ESG永續旅遊",
        keywords: JSON.stringify(["ESG", "永續"]),
        rules: JSON.stringify({
          conditions: [{
            type: "keyword",
            keywords: ["ESG", "永續"],
            outputLabel: "ESG永續旅遊"
          }]
        }),
        outputLabels: JSON.stringify(["ESG永續旅遊"]),
        isActive: true,
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(skillDb.matchSkillsToContent).mockResolvedValue([{
        skill: mockSkill as any,
        score: 0.8,
        matchedKeywords: ["ESG", "永續"]
      }]);
      vi.mocked(skillDb.applySkillRules).mockReturnValue(["ESG永續旅遊"]);
      vi.mocked(skillDb.incrementSkillUsage).mockResolvedValue();
      vi.mocked(skillDb.logSkillApplication).mockResolvedValue(1);

      const result = await applyLearnedSkills(
        "ESG永續旅遊 紐西蘭行程",
        { duration: 13, price: 200000 }
      );

      expect(result.labels).toContain("ESG永續旅遊");
      expect(result.appliedSkills).toContain(1);
      expect(skillDb.incrementSkillUsage).toHaveBeenCalledWith(1, true);
    });

    it("should return empty labels when no skills match", async () => {
      vi.mocked(skillDb.matchSkillsToContent).mockResolvedValue([]);

      const result = await applyLearnedSkills("普通行程內容");

      expect(result.labels).toEqual([]);
      expect(result.appliedSkills).toEqual([]);
    });

    it("should deduplicate labels", async () => {
      const mockSkill1 = {
        id: 1,
        skillType: "feature_classification",
        skillName: "Skill1",
        keywords: "[]",
        rules: "{}",
        isActive: true,
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockSkill2 = {
        id: 2,
        skillType: "feature_classification",
        skillName: "Skill2",
        keywords: "[]",
        rules: "{}",
        isActive: true,
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(skillDb.matchSkillsToContent).mockResolvedValue([
        { skill: mockSkill1 as any, score: 0.8, matchedKeywords: [] },
        { skill: mockSkill2 as any, score: 0.7, matchedKeywords: [] }
      ]);
      // Both skills return the same label
      vi.mocked(skillDb.applySkillRules).mockReturnValue(["共同標籤"]);
      vi.mocked(skillDb.incrementSkillUsage).mockResolvedValue();
      vi.mocked(skillDb.logSkillApplication).mockResolvedValue(1);

      const result = await applyLearnedSkills("Test content");

      // Should only have one instance of the label
      expect(result.labels.filter(l => l === "共同標籤").length).toBe(1);
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(skillDb.matchSkillsToContent).mockRejectedValue(new Error("DB error"));

      const result = await applyLearnedSkills("Test content");

      expect(result.labels).toEqual([]);
      expect(result.appliedSkills).toEqual([]);
    });
  });

  describe("initializeBuiltInSkills", () => {
    it("should call seedBuiltInSkills", async () => {
      vi.mocked(skillDb.seedBuiltInSkills).mockResolvedValue();

      await initializeBuiltInSkills();

      expect(skillDb.seedBuiltInSkills).toHaveBeenCalledTimes(1);
    });

    it("should handle errors gracefully", async () => {
      vi.mocked(skillDb.seedBuiltInSkills).mockRejectedValue(new Error("Seed error"));

      // Should not throw
      await expect(initializeBuiltInSkills()).resolves.not.toThrow();
    });
  });
});
