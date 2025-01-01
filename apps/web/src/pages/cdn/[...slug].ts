import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    if (!params.slug) {
      return new Response("Not Found", { status: 404 });
    }
    const object = await locals.runtime.env.STORAGE.get(params.slug);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(object.body, {
      headers: {
        "Content-Type":
          object.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        Expires: "Fri, 31 Dec 9999 23:59:59 GMT", // or any date far in the future
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error fetching file", { status: 500 });
  }
};
