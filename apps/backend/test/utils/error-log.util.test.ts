import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logError, generateRequestId } from '../../src/utils/error-log.util';
import { ValidationError } from '../../src/classes/ValidationError.class';
import type { Context } from 'hono';
import type { AppContext } from '../../src/types';

const createContext = (): Context<AppContext> => {
  const headers: Record<string, string> = {
    'user-agent': 'test-agent',
    'cf-connecting-ip': '127.0.0.1',
  };
  return {
    req: {
      method: 'GET',
      path: '/test',
      header: (name: string) => headers[name.toLowerCase()],
    },
  } as unknown as Context<AppContext>;
};

describe('error-log utilities', () => {
  describe('generateRequestId', () => {
    it('creates a unique request id', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('logError', () => {
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;
    const ctx = createContext();

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it('formats application error logs', () => {
      const err = new ValidationError('oops', []);
      logError(err, 'req1', ctx);

      expect(warnSpy).toHaveBeenCalledOnce();
      const [prefix, payload] = warnSpy.mock.calls[0] as [string, string];
      expect(prefix).toBe('[APPLICATION ERROR]');

      const data = JSON.parse(payload);
      expect(data.requestId).toBe('req1');
      expect(data.errorCode).toBe(err.code);
      expect(data.request.method).toBe('GET');
      expect(Array.isArray(data.stack)).toBe(true);
    });

    it('logs severe errors using console.error', () => {
      const err = new ValidationError('oops', []);
      logError(err, 'req1', ctx, { severe: true });
      expect(errorSpy).toHaveBeenCalledOnce();
    });
  });
});
