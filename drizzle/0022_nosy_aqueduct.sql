CREATE TABLE `userBrowsingHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tourId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`viewCount` int NOT NULL DEFAULT 1,
	CONSTRAINT `userBrowsingHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tourId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userFavorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `userFavorites_userId_tourId_unique` UNIQUE(`userId`,`tourId`)
);
