CREATE TABLE `storage` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`original_name` text NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`hash` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp),
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storage_key_unique` ON `storage` (`key`);--> statement-breakpoint
CREATE INDEX `idx_r2_storage_key` ON `storage` (`key`);