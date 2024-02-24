CREATE TABLE `asset` (
	`path` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `version` (
	`asset_path` text NOT NULL,
	`semver` text NOT NULL,
	`author` text NOT NULL,
	`keywords` text,
	`changes` text NOT NULL,
	PRIMARY KEY(`asset_path`, `semver`),
	FOREIGN KEY (`asset_path`) REFERENCES `asset`(`path`) ON UPDATE no action ON DELETE no action
);
