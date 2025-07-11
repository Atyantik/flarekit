import { base64UrlEncode } from '@utils/base64.util';

/**
 * Computes the SHA-256 hash of the given ArrayBuffer, encodes it in URL-safe Base64,
 * and truncates it to 32 characters.
 * @param arrayBuffer - The file content as ArrayBuffer.
 * @returns The truncated Base64-encoded SHA-256 hash as a string.
 */
export async function computeShortHash(
  arrayBuffer: ArrayBuffer,
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert ArrayBuffer to binary string
  let hashString = '';
  for (let i = 0; i < hashArray.length; i++) {
    hashString += String.fromCharCode(hashArray[i]);
  }

  // Encode in URL-safe Base64
  let base64Hash = base64UrlEncode(hashString);

  // Remove _,- from the string
  base64Hash = base64Hash.replaceAll(/[_-]/g, '');

  // Truncate to 32 characters for brevity
  return base64Hash.substring(0, 32);
}

/**
 * Generates a random value, computes its SHA-256 hash, encodes it in URL-safe Base64,
 * and truncates it to 32 characters. This is suitable for generating unique, short, random hashes.
 * @returns The truncated Base64-encoded SHA-256 hash as a string.
 */
export async function computeRandomHash(): Promise<string> {
  // Generate 32 random bytes for strong entropy
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  // Convert random bytes to ArrayBuffer
  const arrayBuffer = randomBytes.buffer;

  return computeShortHash(arrayBuffer);
}
