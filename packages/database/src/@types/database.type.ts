import { DrizzleD1Database } from 'drizzle-orm/d1';

export type DB = Omit<DrizzleD1Database, 'batch'>;
