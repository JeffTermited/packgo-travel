CREATE TABLE `agentSkills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillType` enum('feature_classification','tag_rule','itinerary_structure','highlight_detection','transportation_type','meal_classification','accommodation_type') NOT NULL,
	`skillName` varchar(100) NOT NULL,
	`skillNameEn` varchar(100),
	`keywords` text NOT NULL,
	`rules` text NOT NULL,
	`outputLabels` text,
	`outputFormat` text,
	`description` text,
	`source` varchar(255),
	`sourceUrl` varchar(1024),
	`confidence` decimal(3,2) DEFAULT '1.00',
	`usageCount` int NOT NULL DEFAULT 0,
	`successCount` int NOT NULL DEFAULT 0,
	`lastUsedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`isBuiltIn` boolean NOT NULL DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agentSkills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learningSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceType` enum('pdf','url','manual') NOT NULL,
	`sourceName` varchar(255) NOT NULL,
	`sourceContent` text,
	`skillsLearned` int NOT NULL DEFAULT 0,
	`skillIds` text,
	`status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`initiatedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `learningSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skillApplicationLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skillId` int NOT NULL,
	`tourId` int,
	`inputContent` text,
	`matchScore` decimal(3,2),
	`outputResult` text,
	`success` boolean NOT NULL DEFAULT true,
	`errorMessage` text,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`processingTimeMs` int,
	CONSTRAINT `skillApplicationLogs_id` PRIMARY KEY(`id`)
);
