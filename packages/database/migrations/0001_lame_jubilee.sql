CREATE TABLE `storage_info` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_id` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp),
	FOREIGN KEY (`storage_id`) REFERENCES `storage`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_storage_info_storage_id` ON `storage_info` (`storage_id`);
