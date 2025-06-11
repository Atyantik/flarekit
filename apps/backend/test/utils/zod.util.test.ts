import { describe, it, expect } from 'vitest';
import { isValidJsonArray, isValidJsonObject } from '@/utils/zod.util';

describe('zod.util helpers', () => {
  it('validates JSON arrays', () => {
    expect(isValidJsonArray('[1,2]')).toBe(true);
    expect(isValidJsonArray('not json')).toBe(false);
    expect(isValidJsonArray('{"a":1}')).toBe(false);
    expect(isValidJsonArray()).toBe(true);
  });

  it('validates JSON objects', () => {
    expect(isValidJsonObject('{"a":1}')).toBe(true);
    expect(isValidJsonObject('[1]')).toBe(false);
    expect(isValidJsonObject('oops')).toBe(false);
    expect(isValidJsonObject()).toBe(true);
  });
});
