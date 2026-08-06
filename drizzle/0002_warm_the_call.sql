ALTER TABLE `products` ADD `is_active` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `deleted_at` text;