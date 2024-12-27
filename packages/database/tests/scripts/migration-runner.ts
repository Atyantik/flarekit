import { promises as fs } from "fs";
import type { AnyD1Database } from "drizzle-orm/d1";
import path from "path";

export const applyMigrations = async (db: AnyD1Database, migrationsDir: string) => {
  const migrationFiles = await fs.readdir(migrationsDir);

  for (const file of migrationFiles) {
    if (file.endsWith(".sql")) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = await fs.readFile(migrationPath, "utf-8");
      console.log(`Applying migration: ${file}`);
      await db.prepare(sql).all();
    }
  }
};
