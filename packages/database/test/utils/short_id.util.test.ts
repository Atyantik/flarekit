import { describe, it, expect } from 'vitest';
import { generateShortId } from '@/utils/short_id.util';

describe('short_id.util', () => {
  it('should generate a short ID with valid length', () => {
    const id = generateShortId();
    expect(id.length).toBeGreaterThanOrEqual(4);
    expect(id.length).toBeLessThanOrEqual(8);
  });

  it('should generate a short ID with valid characters', () => {
    const id = generateShortId();
    expect(id).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      const id = generateShortId();
      expect(ids.has(id)).toBe(false);
      ids.add(id);
    }
  });
});
