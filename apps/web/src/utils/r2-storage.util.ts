import type { R2Bucket } from "@cloudflare/workers-types";

/**
 * Validates the uploaded file.
 * @param file - The uploaded file.
 * @returns The validated File object.
 * @throws Error if validation fails.
 */
export function validateFile(file: File | null): File {
  if (!file || !(file instanceof File)) {
    throw new Error("No file provided or invalid file type.");
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
