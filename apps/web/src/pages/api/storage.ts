import type { APIRoute } from "astro";
import { listStorageRecords } from "@services/database";

/**
 * POST route handler for uploading images to R2.
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const cache = locals.runtime.env.CACHE;
    const cachedStorageRecords = await cache.get("storage_records");
    if (cachedStorageRecords) {
      return new Response(cachedStorageRecords, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }
    const storageRecords = await listStorageRecords(locals.dbClient);
    await cache.put("storage_records", JSON.stringify(storageRecords));
    return new Response(JSON.stringify(storageRecords), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (ex) {
    return new Response(
      JSON.stringify({
        error: ex instanceof Error ? ex.message : "An error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Respond with the image URL
};
