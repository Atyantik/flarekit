import { describe, it, expect } from 'vitest';
import { toSQLiteUTCString } from '@/utils/date.util';

describe('date.util', () => {
  describe('toSQLiteUTCString', () => {
    it('should return null for null or undefined input', () => {
      expect(toSQLiteUTCString(null)).toBeNull();
      expect(toSQLiteUTCString(undefined)).toBeNull();
    });

    it('should handle SQLite format strings correctly', () => {
      const sqliteDate = '2023-01-01 12:00:00';
      expect(toSQLiteUTCString(sqliteDate)).toBe('2023-01-01 12:00:00');
    });

    it('should handle ISO date strings correctly', () => {
      const isoDate = '2023-01-01T12:00:00Z';
      expect(toSQLiteUTCString(isoDate)).toBe('2023-01-01 12:00:00');
    });

    it('should handle Date objects correctly', () => {
      const date = new Date('2023-01-01T12:00:00Z');
      expect(toSQLiteUTCString(date)).toBe('2023-01-01 12:00:00');
    });

    it('should handle dates with timezone offsets', () => {
      const dateWithOffset = '2023-01-01T12:00:00+05:30';
      expect(toSQLiteUTCString(dateWithOffset)).toBe('2023-01-01 06:30:00');
    });

    it('should throw error for invalid date strings', () => {
      expect(() => toSQLiteUTCString('invalid-date')).toThrow(
        'Invalid date format',
      );
      expect(() => toSQLiteUTCString('2023-13-01 12:00:00')).toThrow(
        'Invalid date format',
      );
    });

    it('should handle dates with milliseconds', () => {
      const dateWithMs = '2023-01-01T12:00:00.123Z';
      expect(toSQLiteUTCString(dateWithMs)).toBe('2023-01-01 12:00:00');
    });

    it('should handle dates with different formats', () => {
      const formats = [
        '2023-01-01',
        '2023/01/01',
        '01/01/2023',
        '2023-01-01T12:00:00.000Z',
      ];

      formats.forEach((format) => {
        expect(() => toSQLiteUTCString(format)).not.toThrow();
      });
    });
  });
});
