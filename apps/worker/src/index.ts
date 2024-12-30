import type { ExportedHandler } from '@cloudflare/workers-types';
import { getDBClient, listStorageRecords } from '@services/database';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const DB = await getDBClient(this, env.DB);
		let storageRecords: Record<string, unknown>[] = [];
		try {
			storageRecords = await listStorageRecords(DB);
		} catch {
			// Do nothing
		}

		const data = {
			ctx,
			storageRecords,
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
