import { describe, it, expect, vi } from 'vitest';
import { scheduledHandler } from '@/handlers/scheduled.handler';
import { initDBInstance } from '@flarekit/database';

vi.mock('@flarekit/database', () => ({
  initDBInstance: vi.fn(),
}));

describe('scheduledHandler', () => {
  it('clears storage when cron starts with */2', async () => {
    const deleteFn = vi.fn();
    const env = { STORAGE: { delete: deleteFn } } as any;

    const getList = vi.fn().mockResolvedValue([
      { id: 1, key: 'a' },
      { id: 2, key: 'b' },
    ]);
    const bulkDelete = vi.fn().mockResolvedValue(undefined);
    (initDBInstance as unknown as any).mockReturnValue({
      storage: { getList, bulkDelete },
    });

    const waitUntil = vi.fn(async (p: Promise<void>) => {
      await p;
    });
    const ctx = { waitUntil } as any;

    const event = { cron: '*/2 * * * *' } as any;
    scheduledHandler(event, env, ctx);

    expect(waitUntil).toHaveBeenCalled();
    await waitUntil.mock.calls[0][0];
    expect(getList).toHaveBeenCalled();
    expect(deleteFn).toHaveBeenCalledTimes(2);
    expect(deleteFn).toHaveBeenCalledWith('a');
    expect(deleteFn).toHaveBeenCalledWith('b');
    expect(bulkDelete).toHaveBeenCalledWith([1, 2], true);
  });

  it('skips cleanup when cron does not match', async () => {
    const deleteFn = vi.fn();
    const env = { STORAGE: { delete: deleteFn } } as any;

    const getList = vi.fn();
    const bulkDelete = vi.fn();
    (initDBInstance as unknown as any).mockReturnValue({
      storage: { getList, bulkDelete },
    });

    const waitUntil = vi.fn(async (p: Promise<void>) => {
      await p;
    });
    const ctx = { waitUntil } as any;

    scheduledHandler({ cron: '* * * * *' } as any, env, ctx);
    await waitUntil.mock.calls[0][0];
    expect(getList).not.toHaveBeenCalled();
    expect(deleteFn).not.toHaveBeenCalled();
    expect(bulkDelete).not.toHaveBeenCalled();
  });
});
