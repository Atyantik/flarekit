import { describe, it, expect, vi } from 'vitest';
import { queueHandler } from '@/handlers/queue.handler';

describe('queueHandler', () => {
  it('acknowledges all messages', async () => {
    const ackAll = vi.fn();
    const batch = { messages: [{ id: 1 }], ackAll } as any;
    await queueHandler(batch);
    expect(ackAll).toHaveBeenCalled();
  });
});
