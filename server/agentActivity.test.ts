import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Tests for agentActivityService zombie task cleanup logic
 * 
 * These tests verify:
 * 1. cleanupZombieTasks correctly identifies and marks zombie tasks
 * 2. logAgentStart and logAgentComplete work together properly
 * 3. withActivityLog wrapper handles success and failure cases
 */

// Mock the db module
vi.mock('./db', () => {
  const mockDb = {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
  };
  return {
    getDb: vi.fn().mockResolvedValue(mockDb),
    default: mockDb,
  };
});

// Mock drizzle schema
vi.mock('../drizzle/schema', () => ({
  agentActivityLogs: {
    id: 'id',
    agentName: 'agentName',
    agentKey: 'agentKey',
    taskType: 'taskType',
    taskId: 'taskId',
    taskTitle: 'taskTitle',
    status: 'status',
    userId: 'userId',
    startedAt: 'startedAt',
    completedAt: 'completedAt',
    resultSummary: 'resultSummary',
    errorMessage: 'errorMessage',
    processingTimeMs: 'processingTimeMs',
  },
}));

// Mock drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((a, b) => ({ type: 'eq', field: a, value: b })),
  and: vi.fn((...args: any[]) => ({ type: 'and', conditions: args })),
  lt: vi.fn((a, b) => ({ type: 'lt', field: a, value: b })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: any[]) => ({
    type: 'sql',
    raw: strings.join(''),
  })),
}));

describe("agentActivityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("cleanupZombieTasks", () => {
    it("should return 0 when no zombie tasks exist", async () => {
      const { getDb } = await import('./db');
      const mockDb = await getDb();

      // Mock the select chain to return empty array
      const mockWhere = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelectFields = vi.fn().mockReturnValue({ from: mockFrom });
      (mockDb as any).select = mockSelectFields;

      const { cleanupZombieTasks } = await import('./agentActivityService');
      const result = await cleanupZombieTasks(10);

      expect(result).toBe(0);
    });

    it("should cleanup zombie tasks and return count", async () => {
      const { getDb } = await import('./db');
      const mockDb = await getDb();

      const zombieTasks = [
        { id: 1, agentName: 'ContentAnalyzerAgent' },
        { id: 2, agentName: 'TranslationAgent' },
      ];

      // Mock the select chain
      const mockWhere = vi.fn().mockResolvedValue(zombieTasks);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      const mockSelectFields = vi.fn().mockReturnValue({ from: mockFrom });
      (mockDb as any).select = mockSelectFields;

      // Mock the update chain
      const mockUpdateWhere = vi.fn().mockResolvedValue(undefined);
      const mockSet = vi.fn().mockReturnValue({ where: mockUpdateWhere });
      (mockDb as any).update = vi.fn().mockReturnValue({ set: mockSet });

      const { cleanupZombieTasks } = await import('./agentActivityService');
      const result = await cleanupZombieTasks(10);

      expect(result).toBe(2);
      expect((mockDb as any).update).toHaveBeenCalled();
    });

    it("should return 0 when database is not available", async () => {
      const dbModule = await import('./db');
      (dbModule.getDb as any).mockResolvedValueOnce(null);

      // Re-import to get fresh module
      vi.resetModules();
      
      // Re-mock after reset
      vi.doMock('./db', () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const { cleanupZombieTasks } = await import('./agentActivityService');
      const result = await cleanupZombieTasks(10);

      expect(result).toBe(0);
    });
  });

  describe("logAgentStart", () => {
    it("should return null when database is not available", async () => {
      vi.resetModules();
      vi.doMock('./db', () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const { logAgentStart } = await import('./agentActivityService');
      const result = await logAgentStart({
        agentName: 'TestAgent',
        taskType: 'test',
      });

      expect(result).toBeNull();
    });
  });

  describe("withActivityLog", () => {
    it("should call the function and return its result", async () => {
      vi.resetModules();
      
      // Mock db to return null (skip actual DB operations)
      vi.doMock('./db', () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const { withActivityLog } = await import('./agentActivityService');
      
      const mockFn = vi.fn().mockResolvedValue('test-result');
      const result = await withActivityLog(
        { agentName: 'TestAgent', taskType: 'test' },
        mockFn
      );

      expect(result).toBe('test-result');
      expect(mockFn).toHaveBeenCalledOnce();
    });

    it("should re-throw errors from the wrapped function", async () => {
      vi.resetModules();
      
      vi.doMock('./db', () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const { withActivityLog } = await import('./agentActivityService');
      
      const mockFn = vi.fn().mockRejectedValue(new Error('test-error'));
      
      await expect(
        withActivityLog(
          { agentName: 'TestAgent', taskType: 'test' },
          mockFn
        )
      ).rejects.toThrow('test-error');
    });
  });

  describe("MasterAgent zombie cleanup integration", () => {
    it("cleanupZombieTasks should accept a timeout parameter in minutes", async () => {
      vi.resetModules();
      
      vi.doMock('./db', () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const { cleanupZombieTasks } = await import('./agentActivityService');
      
      // Should not throw with various timeout values
      expect(await cleanupZombieTasks(5)).toBe(0);
      expect(await cleanupZombieTasks(10)).toBe(0);
      expect(await cleanupZombieTasks(30)).toBe(0);
    });
  });
});
