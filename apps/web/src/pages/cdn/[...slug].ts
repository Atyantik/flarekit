import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({params, locals}) => {
  try {
    const object = await locals.runtime.env.STORAGE.get(params.slug);
    if (!object) {
      return new Response("Not Found", { status: 404 });
    }

    return new Response(object.body, {
      headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream" },
    });
  } catch (err) {
    console.error(err);
    return new Response("Error fetching file", { status: 500 });
  }
}