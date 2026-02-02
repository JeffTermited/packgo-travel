import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  isFavorite: vi.fn(),
  getUserFavorites: vi.fn(),
  getUserFavoriteIds: vi.fn(),
  recordBrowsingHistory: vi.fn(),
  getUserBrowsingHistory: vi.fn(),
  clearBrowsingHistory: vi.fn(),
}));

import * as db from './db';

describe('Favorites Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a tour to favorites', async () => {
      (db.addFavorite as any).mockResolvedValue(undefined);
      
      await db.addFavorite(1, 100);
      
      expect(db.addFavorite).toHaveBeenCalledWith(1, 100);
      expect(db.addFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a tour from favorites', async () => {
      (db.removeFavorite as any).mockResolvedValue(undefined);
      
      await db.removeFavorite(1, 100);
      
      expect(db.removeFavorite).toHaveBeenCalledWith(1, 100);
      expect(db.removeFavorite).toHaveBeenCalledTimes(1);
    });
  });

  describe('isFavorite', () => {
    it('should return true if tour is in favorites', async () => {
      (db.isFavorite as any).mockResolvedValue(true);
      
      const result = await db.isFavorite(1, 100);
      
      expect(result).toBe(true);
      expect(db.isFavorite).toHaveBeenCalledWith(1, 100);
    });

    it('should return false if tour is not in favorites', async () => {
      (db.isFavorite as any).mockResolvedValue(false);
      
      const result = await db.isFavorite(1, 200);
      
      expect(result).toBe(false);
      expect(db.isFavorite).toHaveBeenCalledWith(1, 200);
    });
  });

  describe('getUserFavorites', () => {
    it('should return list of favorite tours', async () => {
      const mockTours = [
        { id: 1, title: 'Tour 1', price: 10000 },
        { id: 2, title: 'Tour 2', price: 20000 },
      ];
      (db.getUserFavorites as any).mockResolvedValue(mockTours);
      
      const result = await db.getUserFavorites(1);
      
      expect(result).toEqual(mockTours);
      expect(result.length).toBe(2);
      expect(db.getUserFavorites).toHaveBeenCalledWith(1);
    });

    it('should return empty array if no favorites', async () => {
      (db.getUserFavorites as any).mockResolvedValue([]);
      
      const result = await db.getUserFavorites(1);
      
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('getUserFavoriteIds', () => {
    it('should return list of favorite tour IDs', async () => {
      const mockIds = [1, 2, 3];
      (db.getUserFavoriteIds as any).mockResolvedValue(mockIds);
      
      const result = await db.getUserFavoriteIds(1);
      
      expect(result).toEqual(mockIds);
      expect(result.length).toBe(3);
      expect(db.getUserFavoriteIds).toHaveBeenCalledWith(1);
    });
  });
});

describe('Browsing History Database Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordBrowsingHistory', () => {
    it('should record a tour view', async () => {
      (db.recordBrowsingHistory as any).mockResolvedValue(undefined);
      
      await db.recordBrowsingHistory(1, 100);
      
      expect(db.recordBrowsingHistory).toHaveBeenCalledWith(1, 100);
      expect(db.recordBrowsingHistory).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserBrowsingHistory', () => {
    it('should return browsing history with default limit', async () => {
      const mockTours = [
        { id: 1, title: 'Tour 1' },
        { id: 2, title: 'Tour 2' },
      ];
      (db.getUserBrowsingHistory as any).mockResolvedValue(mockTours);
      
      const result = await db.getUserBrowsingHistory(1);
      
      expect(result).toEqual(mockTours);
      expect(db.getUserBrowsingHistory).toHaveBeenCalledWith(1);
    });

    it('should return browsing history with custom limit', async () => {
      const mockTours = [{ id: 1, title: 'Tour 1' }];
      (db.getUserBrowsingHistory as any).mockResolvedValue(mockTours);
      
      const result = await db.getUserBrowsingHistory(1, 5);
      
      expect(result).toEqual(mockTours);
      expect(db.getUserBrowsingHistory).toHaveBeenCalledWith(1, 5);
    });
  });

  describe('clearBrowsingHistory', () => {
    it('should clear all browsing history for user', async () => {
      (db.clearBrowsingHistory as any).mockResolvedValue(undefined);
      
      await db.clearBrowsingHistory(1);
      
      expect(db.clearBrowsingHistory).toHaveBeenCalledWith(1);
      expect(db.clearBrowsingHistory).toHaveBeenCalledTimes(1);
    });
  });
});
