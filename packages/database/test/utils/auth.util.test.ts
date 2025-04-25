import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/utils/auth.util';

describe('auth.util', () => {
  describe('hashPassword', () => {
    it('should generate a valid password hash with default parameters', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:[0-9a-f]{64}$/,
      );
    });

    it('should generate consistent hash with same salt', async () => {
      const password = 'testPassword123';
      const salt = 'test-salt';
      const hash1 = await hashPassword(password, salt);
      const hash2 = await hashPassword(password, salt);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes with different salts', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle different iteration counts', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password, undefined, 1000);
      const hash2 = await hashPassword(password, undefined, 2000);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should throw error for invalid hash format', async () => {
      const password = 'testPassword123';
      const invalidHash = 'invalid-hash-format';

      await expect(verifyPassword(password, invalidHash)).rejects.toThrow(
        'Invalid stored passwordHash format',
      );
    });

    it('should work with custom iteration count', async () => {
      const password = 'testPassword123';
      const iterations = 50000;
      const hash = await hashPassword(password, undefined, iterations);
      const isValid = await verifyPassword(password, hash, iterations);

      expect(isValid).toBe(true);
    });
  });
});
