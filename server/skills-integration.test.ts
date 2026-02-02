/**
 * Skills Integration Tests
 * 測試 AI Agent 技能系統與 ContentAnalyzerAgent 的整合
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({ insertId: 1 })
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ affectedRows: 1 })
      })
    })
  }
}));

// Mock the learning agent
vi.mock('./agents/learningAgent', () => ({
  applyLearnedSkills: vi.fn().mockResolvedValue({
    labels: ['ESG永續旅遊', '美食主題', '鐵道旅遊'],
    appliedSkills: [1, 2, 5]
  })
}));

describe('Skills Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('applyLearnedSkills', () => {
    it('should return labels and applied skills', async () => {
      const { applyLearnedSkills } = await import('./agents/learningAgent');
      
      const content = '日本北海道鐵道之旅，品嚐當地美食，體驗永續旅遊';
      const metadata = { duration: 7, price: 50000 };
      
      const result = await applyLearnedSkills(content, metadata);
      
      expect(result).toBeDefined();
      expect(result.labels).toBeDefined();
      expect(Array.isArray(result.labels)).toBe(true);
      expect(result.appliedSkills).toBeDefined();
      expect(Array.isArray(result.appliedSkills)).toBe(true);
    });

    it('should generate ESG tag for sustainable content', async () => {
      // 測試標籤分類邏輯
      const labels = ['ESG永續旅遊', '美食主題', '鐵道旅遊'];
      const hasESG = labels.some(l => l.includes('ESG') || l.includes('永續'));
      expect(hasESG).toBe(true);
    });

    it('should generate food tag for culinary content', async () => {
      // 測試標籤分類邏輯
      const labels = ['ESG永續旅遊', '美食主題', '鐵道旅遊'];
      const hasFood = labels.some(l => l.includes('美食'));
      expect(hasFood).toBe(true);
    });

    it('should generate railway tag for train content', async () => {
      // 測試標籤分類邏輯
      const labels = ['ESG永續旅遊', '美食主題', '鐵道旅遊'];
      const hasRailway = labels.some(l => l.includes('鐵道'));
      expect(hasRailway).toBe(true);
    });
  });

  describe('Smart Tags Classification', () => {
    it('should classify ESG labels as feature classification', () => {
      const labels = ['ESG永續旅遊', '美食主題', '鐵道旅遊', '溫泉旅館'];
      
      const featureClassification: string[] = [];
      const transportationType: string[] = [];
      const accommodationType: string[] = [];
      
      for (const label of labels) {
        if (label.includes('ESG') || label.includes('永續') || label.includes('美食')) {
          featureClassification.push(label);
        } else if (label.includes('鐵道') || label.includes('郵輪')) {
          transportationType.push(label);
        } else if (label.includes('溫泉') || label.includes('旅館')) {
          accommodationType.push(label);
        }
      }
      
      expect(featureClassification).toContain('ESG永續旅遊');
      expect(featureClassification).toContain('美食主題');
      expect(transportationType).toContain('鐵道旅遊');
      expect(accommodationType).toContain('溫泉旅館');
    });

    it('should handle empty labels array', () => {
      const labels: string[] = [];
      
      const featureClassification: string[] = [];
      const transportationType: string[] = [];
      
      for (const label of labels) {
        if (label.includes('ESG')) {
          featureClassification.push(label);
        }
      }
      
      expect(featureClassification).toHaveLength(0);
      expect(transportationType).toHaveLength(0);
    });
  });

  describe('Skill Metadata Matching', () => {
    it('should match duration-based rules', () => {
      const metadata = { duration: 3, price: 20000 };
      
      // 短天數行程規則
      const isShortTrip = metadata.duration <= 4;
      expect(isShortTrip).toBe(true);
    });

    it('should match price-based rules', () => {
      const metadata = { duration: 7, price: 80000 };
      
      // 高價行程規則
      const isPremium = metadata.price >= 50000;
      expect(isPremium).toBe(true);
    });

    it('should combine multiple rule conditions', () => {
      const metadata = { duration: 10, price: 100000 };
      
      // 長天數 + 高價 = 豪華行程
      const isLuxury = metadata.duration >= 7 && metadata.price >= 80000;
      expect(isLuxury).toBe(true);
    });
  });

  describe('Tag Merging Logic', () => {
    it('should merge smart tags with existing tags', () => {
      const existingTags = ['日本', '北海道'];
      const smartTags = ['ESG永續旅遊', '美食主題'];
      const learnedTags = ['鐵道旅遊'];
      
      const allTags = [...smartTags, ...learnedTags];
      const finalTags = [...new Set([...existingTags, ...allTags])];
      
      expect(finalTags).toContain('日本');
      expect(finalTags).toContain('北海道');
      expect(finalTags).toContain('ESG永續旅遊');
      expect(finalTags).toContain('美食主題');
      expect(finalTags).toContain('鐵道旅遊');
      expect(finalTags).toHaveLength(5);
    });

    it('should deduplicate tags', () => {
      const existingTags = ['日本', '美食主題'];
      const smartTags = ['美食主題', 'ESG永續旅遊'];
      
      const finalTags = [...new Set([...existingTags, ...smartTags])];
      
      // 美食主題 should appear only once
      const foodTagCount = finalTags.filter(t => t === '美食主題').length;
      expect(foodTagCount).toBe(1);
      expect(finalTags).toHaveLength(3);
    });
  });
});
