import type { ExportedHandler } from '@cloudflare/workers-types';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const data = {
			ctx,
			headers: Object.fromEntries(request.headers.entries()),
			env: Object.keys(env),
			method: request.method,
			url: request.url,
		};
		return new Response(JSON.stringify(data, null, 2), {
			headers: { 'content-type': 'application/json' },
		});
	},
	// eslint-disable-next-line no-undef
} satisfies ExportedHandler<Env>;
