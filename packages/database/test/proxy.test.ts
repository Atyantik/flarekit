import { describe, it, expect, vi } from 'vitest';
import { createFlarekitServices } from '../src/proxy';
import type { Ctx } from '../src/types';
import { env, createExecutionContext } from 'cloudflare:test';
import { drizzle } from 'drizzle-orm/d1';

describe('createFlarekitServices', () => {
  it('should wrap each function to omit the final Ctx param and preserve non-function props', () => {
    // Mocked Ctx
    const ctx = {
      db: drizzle(env.DB),
      cache: env.CACHE,
      queue: env.QUEUE,
    };

    // Example original functions
    const addFn = vi.fn((a: number, b: number, _: Ctx) => a + b);
    const greetFn = vi.fn((name: string, _: Ctx) => `Hello, ${name}`);

    // Example of a nested “namespace” object
    const services = {
      math: {
        add: addFn,
        pi: 3.14, // Non-function prop
      },
      messages: {
        greet: greetFn,
        greetingPrefix: 'Hello, ', // Non-function prop
      },
    };

    // Wrap the services
    const wrappedServices = createFlarekitServices(ctx, services);

    // 1. Check that the wrapped versions are indeed functions (for function props)
    expect(typeof wrappedServices.math.add).toBe('function');
    expect(typeof wrappedServices.messages.greet).toBe('function');

    // 2. Check that non-function properties are copied over
    expect(wrappedServices.math.pi).toBe(3.14);
    expect(wrappedServices.messages.greetingPrefix).toBe('Hello, ');

    // 3. Call the newly wrapped functions without providing ctx
    const sum = wrappedServices.math.add(2, 3);
    expect(sum).toBe(5); // 2 + 3 = 5
    // The original addFn should have been called with the appended ctx
    expect(addFn).toHaveBeenCalledWith(2, 3, ctx);

    const greeting = wrappedServices.messages.greet('Alice');
    expect(greeting).toBe('Hello, Alice');
    expect(greetFn).toHaveBeenCalledWith('Alice', ctx);
  });
});
