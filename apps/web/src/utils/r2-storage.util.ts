import type { R2Bucket } from "@cloudflare/workers-types";

/**
 * Validates the uploaded file.
 * @param file - The uploaded file.
 * @returns The validated File object.
 * @throws Error if validation fails.
 */
export function validateFile(file: File | null): File {
  if (!file || !(file instanceof File)) {
    throw new Error('No image file provided or invalid file type.');
  }
  return file;
}

/**
 * Checks if a file with the specified key exists in R2.
 * @param storage - The R2 storage binding.
 * @param key - The unique key of the file.
 * @returns A boolean indicating existence.
 */
export async function fileExists(
  storage: R2Bucket,
  key: string,
): Promise<boolean> {
  try {
    const file = await storage.get(key);
    return !!file;
  } catch {
    return false;
  }
}

/**
 * Uploads the file to R2 storage.
 * @param storage - The R2 storage binding.
 * @param key - The unique key for the file.
 * @param arrayBuffer - The file content as ArrayBuffer.
 * @param contentType - The MIME type of the file.
 */
export async function uploadFile(
  storage: R2Bucket,
  key: string,
  arrayBuffer: ArrayBuffer,
  contentType: string,
): Promise<void> {
  await storage.put(key, arrayBuffer, {
    httpMetadata: {
      contentType,
    },
  });
}

/**
 * Constructs the CDN URL based on the environment.
 * @param mode - The current environment mode ('production' or others).
 * @param cdnUrl - The CDN base URL from environment variables.
 * @param requestUrl - The original request URL.
 * @param key - The unique key of the uploaded file.
 * @returns The full CDN URL as a string.
 */
export function constructCdnUrl(
  mode: string,
  cdnUrl: string | undefined,
  requestUrl: string,
  key: string,
): string {
  const isProduction = mode === 'production';
  const baseCdnUrl =
    isProduction && typeof cdnUrl === 'string' && cdnUrl.length
      ? cdnUrl
      : new URL('/cdn/', requestUrl);
  return new URL(key, baseCdnUrl).toString();
}
