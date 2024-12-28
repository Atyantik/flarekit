/**
 * Encodes a binary string to URL-safe Base64.
 * Works in both Node.js and browser-like environments.
 * @param binaryStr - The binary string to encode.
 * @returns The URL-safe Base64 encoded string.
 */
export function base64UrlEncode(binaryStr: string): string {
  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(binaryStr, "binary")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } else if (typeof btoa === "function") {
    // Browser-like environment
    return btoa(binaryStr)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  } else {
    throw new Error("No Base64 encoding method available.");
  }
}

/**
 * Decodes a URL-safe Base64 string to a binary string.
 * Works in both Node.js and browser-like environments.
 * @param base64UrlStr - The URL-safe Base64 string to decode.
 * @returns The decoded binary string.
 */
export function base64UrlDecode(base64UrlStr: string): string {
  // Replace URL-safe characters back to standard Base64 characters
  let base64 = base64UrlStr.replace(/-/g, "+").replace(/_/g, "/");

  // Pad with '=' characters to make the length a multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  if (typeof Buffer !== "undefined") {
    // Node.js environment
    return Buffer.from(base64, "base64").toString("binary");
  } else if (typeof atob === "function") {
    // Browser-like environment
    return atob(base64);
  } else {
    throw new Error("No Base64 decoding method available.");
  }
}
