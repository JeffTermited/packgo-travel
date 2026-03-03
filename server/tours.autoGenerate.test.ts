import { describe, it, expect, vi } from 'vitest';

/**
 * Test suite for the auto-generate tour functionality
 * Tests the Manus API integration and tour data extraction
 */

describe('Auto-generate Tour API', () => {
  // Test the Manus API helper functions
  describe('Manus API Helper', () => {
    it('should have MANUS_API_KEY environment variable set if Manus API is used', () => {
      // MANUS_API_KEY is no longer required - the project now uses invokeLLM() directly.
      // This test is kept as a soft check (warn only, not fail).
      const apiKey = process.env.MANUS_API_KEY;
      if (!apiKey) {
        console.warn('[tours.autoGenerate.test] MANUS_API_KEY not set - Manus external API is deprecated in this project');
      } else {
        expect(typeof apiKey).toBe('string');
        expect(apiKey.length).toBeGreaterThan(0);
      }
    });
  });

  // Test the tour data structure
  describe('Tour Data Structure', () => {
    const sampleTourData = {
      title: '沖繩春日逍遙遊｜那霸市中心精品酒店四日自由行',
      productCode: '26JO217BRC-T',
      promotionText: '過年大促銷',
      duration: 4,
      nights: 3,
      price: 30999,
      departureCountry: '台灣',
      departureCity: '桃園',
      departureAirportCode: 'TPE',
      destinationCountry: '日本',
      destinationCity: '那霸',
      destinationAirportCode: 'OKA',
      outboundAirline: '長榮航空',
      outboundDepartureTime: '06:55',
      outboundArrivalTime: '09:15',
      hotelName: '嘉新酒店 HOTEL COLLECTIVE',
      hotelGrade: '星等酒店',
      hotelNights: 3,
    };

    it('should have required basic fields', () => {
      expect(sampleTourData.title).toBeDefined();
      expect(sampleTourData.price).toBeGreaterThan(0);
      expect(sampleTourData.duration).toBeGreaterThan(0);
    });

    it('should have departure location fields', () => {
      expect(sampleTourData.departureCountry).toBe('台灣');
      expect(sampleTourData.departureCity).toBe('桃園');
      expect(sampleTourData.departureAirportCode).toBe('TPE');
    });

    it('should have destination location fields', () => {
      expect(sampleTourData.destinationCountry).toBe('日本');
      expect(sampleTourData.destinationCity).toBe('那霸');
      expect(sampleTourData.destinationAirportCode).toBe('OKA');
    });

    it('should have flight information', () => {
      expect(sampleTourData.outboundAirline).toBeDefined();
      expect(sampleTourData.outboundDepartureTime).toMatch(/^\d{2}:\d{2}$/);
      expect(sampleTourData.outboundArrivalTime).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should have hotel information', () => {
      expect(sampleTourData.hotelName).toBeDefined();
      expect(sampleTourData.hotelGrade).toBeDefined();
      expect(sampleTourData.hotelNights).toBeGreaterThan(0);
    });
  });

  // Test JSON parsing for tour fields
  describe('JSON Field Parsing', () => {
    const parseJSON = (str: string | null | undefined, defaultValue: any[] = []) => {
      if (!str) return defaultValue;
      try {
        return JSON.parse(str);
      } catch {
        return defaultValue;
      }
    };

    it('should parse valid JSON arrays', () => {
      const tags = '["特色住宿", "獨家企劃", "刷卡好康"]';
      const result = parseJSON(tags);
      expect(result).toEqual(['特色住宿', '獨家企劃', '刷卡好康']);
    });

    it('should return default value for null', () => {
      const result = parseJSON(null);
      expect(result).toEqual([]);
    });

    it('should return default value for undefined', () => {
      const result = parseJSON(undefined);
      expect(result).toEqual([]);
    });

    it('should return default value for invalid JSON', () => {
      const result = parseJSON('invalid json');
      expect(result).toEqual([]);
    });

    it('should parse attractions with nested objects', () => {
      const attractions = JSON.stringify([
        { name: '古宇利島', description: '美麗的珊瑚礁島' },
        { name: '美麗海水族館', description: '世界最大水族館之一' }
      ]);
      const result = parseJSON(attractions);
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('古宇利島');
    });
  });

  // Test URL validation
  describe('URL Validation', () => {
    const isValidUrl = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    it('should validate correct URLs', () => {
      expect(isValidUrl('https://travel.liontravel.com/detail?id=123')).toBe(true);
      expect(isValidUrl('https://www.example.com/tour')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });
});
