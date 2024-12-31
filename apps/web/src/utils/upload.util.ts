import type { R2Bucket } from "@cloudflare/workers-types";
import { fileExists, uploadFile, validateFile } from "@utils/r2-storage.util";
import { computeShortHash } from "@utils/hash.util";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  createStorageRecord,
  getStorageRecordFromKey,
  type SelectStorageType,
} from "@services/database";

/**
 * Generates a unique key for the file using its hash and name.
 * @param hashHex - The SHA-256 hash of the file.
 * @param fileName - The original name of the file.
 * @returns A unique key string.
 */
function generateKey(hashHex: string, fileName: string): string {
  return `${hashHex}-${fileName}`;
}

/**
 * Handles the upload process of an image.
 * @param formData - The parsed form data from the request.
 * @param storage - The R2 storage binding.
 * @param cdnUrlEnv - The CDN_URL from environment variables.
 * @param mode - The current environment mode.
 * @param requestUrl - The original request URL.
 * @returns The URL of the uploaded image.
 * @throws Error if any step fails.
 */
async function handleUpload(
  formFile: File,
  storage: R2Bucket,
  db: DrizzleD1Database,
): Promise<SelectStorageType & { url: string }> {
  // Validate the image
  const file = validateFile(formFile);

  // Read the file content as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Compute SHA-256 hash
  const hashHex = await computeShortHash(arrayBuffer);

  // Generate unique key
  const key = generateKey(hashHex, file.name);

  // Check if file exists
  const exists = await fileExists(storage, key);

  if (!exists) {
    // Upload the file if it doesn't exist
    await uploadFile(storage, key, arrayBuffer, file.type);
  }

  // Check if the DB Entry exists!
  let fileFromKey = await getStorageRecordFromKey(key, db);
  if (!fileFromKey) {
    await createStorageRecord(
      {
        key,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        hash: hashHex,
      },
      db,
    );
    fileFromKey = await getStorageRecordFromKey(key, db);
  }

  // Construct the CDN URL
  const fileUrl = `/cdn/${key}`;
  return {
    ...fileFromKey,
    url: fileUrl,
  };
}

/**
 * Handles the File Upload from the request.
 * @param file - The uploaded file.
 * @param locals - The request locals.
 * @returns The URL of the uploaded image.
 * @throws Error if any step fails.
 */
export const handleFile = async (file: File, locals: globalThis.App.Locals) => {
  // @ts-expect-error we are using STORAGE from wrangler and types which has different
  // signatures than the one from the worker
  const storage = locals.runtime.env.STORAGE as R2Bucket;
  const cache = locals.runtime.env.CACHE;
  if (!storage) {
    throw new Error("You need to add storage binding to the environment.");
  }
  const { dbClient } = locals;
  try {
    // Handle the upload process
    const fileData = await handleUpload(file, storage, dbClient);
    // Empty the cache
    cache.delete("storage_records");
    // Respond with the image URL
    return fileData;
  } catch (error) {
    let errorMessage = "Failed to upload image. Please try again later.";
    let status = 500;
    if (error instanceof Error) {
      console.error("Error uploading image:", error.message);

      // Determine error type for appropriate response
      status = error.message.includes("No image file") ? 400 : 500;
      errorMessage =
        status === 400
          ? error.message
          : "Failed to upload image. Please try again later.";
    }
    throw new Error(errorMessage);
  }
};
