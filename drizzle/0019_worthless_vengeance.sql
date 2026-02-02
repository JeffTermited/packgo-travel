CREATE TABLE `imageLibrary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`url` varchar(1024) NOT NULL,
	`filename` varchar(255),
	`mimeType` varchar(100),
	`fileSize` int,
	`width` int,
	`height` int,
	`tags` text,
	`uploadedBy` int NOT NULL,
	`tourId` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `imageLibrary_id` PRIMARY KEY(`id`)
);
