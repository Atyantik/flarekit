import { describe, it, expect } from 'vitest';
import { base64UrlEncode, base64UrlDecode } from '../../src/utils/base64.util';

describe('Base64 URL Encoding and Decoding', () => {
  it('should encode and decode a simple binary string correctly', () => {
    const input = 'Hello, World!';
    const encoded = base64UrlEncode(input);
    const decoded = base64UrlDecode(encoded);
    expect(decoded).toBe(input);
  });

  it('should produce URL-safe Base64 strings', () => {
    const input = '\x00\xFF\xEF'; // Binary string with special characters
    const encoded = base64UrlEncode(input);

    // Check for URL-safe replacements
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    // Decode and verify
    const decoded = base64UrlDecode(encoded);
    expect(decoded).toBe(input);
  });

  it('should handle empty strings', () => {
    const input = '';
    const encoded = base64UrlEncode(input);
    const decoded = base64UrlDecode(encoded);

    expect(encoded).toBe(''); // Encoded empty string should also be empty
    expect(decoded).toBe(input);
  });

  it('should handle strings with special characters', () => {
    const input = 'A string with special characters! @#$%^&*()';
    const encoded = base64UrlEncode(input);
    const decoded = base64UrlDecode(encoded);

    expect(decoded).toBe(input);
  });

  it('should pad Base64 strings properly during decoding', () => {
    const input = 'This is a test';
    const encoded = base64UrlEncode(input);
    const decoded = base64UrlDecode(encoded);

    // Padding is implicit during decoding; verify round-trip consistency
    expect(decoded).toBe(input);
  });

  it('should throw an error when encoding/decoding is not supported', () => {
    const originalBuffer = global.Buffer;
    const originalBtoa = global.btoa;

    // Simulate an unsupported environment
    // @ts-ignore
    global.Buffer = undefined;
    // @ts-ignore
    global.btoa = undefined;

    expect(() => base64UrlEncode('test')).toThrow(
      'No Base64 encoding method available.',
    );

    // Restore the global objects
    global.Buffer = originalBuffer;
    global.btoa = originalBtoa;
  });

  it('should encode and decode using btoa', () => {
    const originalBuffer = global.Buffer;
    const originalBtoa = global.btoa;

    // Remove Buffer to simulate browser-like environment
    // @ts-ignore
    global.Buffer = undefined;

    const input = 'Hello, World!';
    const encoded = base64UrlEncode(input);
    const decoded = base64UrlDecode(encoded);

    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    expect(decoded).toBe(input);
    global.Buffer = originalBuffer;
  });
});
