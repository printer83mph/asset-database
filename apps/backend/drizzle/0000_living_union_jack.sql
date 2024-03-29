CREATE TABLE `asset` (
	`path` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`description` text,
	`keywords` text
);
--> statement-breakpoint
CREATE TABLE `user` (
	`pennkey` text PRIMARY KEY NOT NULL,
	`hashed_password` text NOT NULL,
	`salt` text NOT NULL,
	`school` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `version` (
	`asset_path` text NOT NULL,
	`semver` text NOT NULL,
	`reference` text NOT NULL,
	`author` text NOT NULL,
	`changes` text NOT NULL,
	PRIMARY KEY(`asset_path`, `semver`),
	FOREIGN KEY (`asset_path`) REFERENCES `asset`(`path`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`author`) REFERENCES `user`(`pennkey`) ON UPDATE no action ON DELETE no action
);
