import { base64UrlEncode } from "@utils/base64.util";

/**
 * Computes the SHA-256 hash of the given ArrayBuffer, encodes it in URL-safe Base64,
 * and truncates it to 22 characters.
 * @param arrayBuffer - The file content as ArrayBuffer.
 * @returns The truncated Base64-encoded SHA-256 hash as a string.
 */
export async function computeShortHash(
  arrayBuffer: ArrayBuffer,
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = new Uint8Array(hashBuffer);

  // Convert ArrayBuffer to binary string
  let hashString = "";
  for (let i = 0; i < hashArray.length; i++) {
    hashString += String.fromCharCode(hashArray[i]);
  }

  // Encode in URL-safe Base64
  const base64Hash = base64UrlEncode(hashString);

  // Truncate to 22 characters for brevity
  return base64Hash.substring(0, 22);
}
