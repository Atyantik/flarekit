import { describe, it, expect } from 'vitest';
import { slugify, extendSlugify } from '@/utils/slugify.util';

describe('slugify.util', () => {
  describe('slugify', () => {
    it('should convert basic strings to slugs', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Test String 123')).toBe('test-string-123');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello & World')).toBe('hello-and-world');
      expect(slugify('Test $ String')).toBe('test-dollar-string');
    });

    it('should handle non-ASCII characters', () => {
      expect(slugify('Café')).toBe('cafe');
      expect(slugify('Héllò Wörld')).toBe('hello-world');
    });

    it('should respect locale-specific replacements', () => {
      expect(slugify('Äpfel', { locale: 'de' })).toBe('aepfel');
      expect(slugify('&', { locale: 'fr' })).toBe('et');
    });

    it('should handle custom options', () => {
      expect(slugify('Hello World', { replacement: '_' })).toBe('hello_world');
      expect(slugify('Hello World', { lower: false })).toBe('Hello-World');
      expect(slugify('  Hello World  ', { trim: false })).toBe('-hello-world-');
    });
    it('should throw error for non-string input', () => {
      expect(() => slugify(123 as any)).toThrow(
        'slugify: input must be a string',
      );
    });

    it('should handle strict mode', () => {
      expect(slugify('Hello! World?', { strict: true })).toBe('hello-world');
    });
  });

  describe('extendSlugify', () => {
    it('should extend character map with custom replacements', () => {
      extendSlugify({ '@': 'at' });
      expect(slugify('test@example')).toBe('testatexample');
    });

    it('should preserve existing mappings after extension', () => {
      extendSlugify({ '#': 'hash' });
      expect(slugify('test#example')).toBe('testhashexample');
      expect(slugify('test$example')).toBe('testdollarexample');
    });
  });
});
