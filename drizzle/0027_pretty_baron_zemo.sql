CREATE TABLE `translationJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jobType` enum('tour_full','tour_update','batch_tours','ui_elements','custom') NOT NULL,
	`entityType` varchar(50),
	`entityIds` text,
	`targetLanguages` text NOT NULL,
	`status` enum('pending','processing','completed','failed','partial') NOT NULL DEFAULT 'pending',
	`totalItems` int NOT NULL DEFAULT 0,
	`completedItems` int NOT NULL DEFAULT 0,
	`failedItems` int NOT NULL DEFAULT 0,
	`results` text,
	`errors` text,
	`processingTimeMs` int,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`startedAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `translationJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('tour','tour_departure','page','ui_element','notification') NOT NULL,
	`entityId` int NOT NULL,
	`fieldName` varchar(100) NOT NULL,
	`sourceLanguage` varchar(10) NOT NULL DEFAULT 'zh-TW',
	`targetLanguage` varchar(10) NOT NULL,
	`originalText` text NOT NULL,
	`translatedText` text NOT NULL,
	`translatedBy` varchar(100),
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translations_id` PRIMARY KEY(`id`),
	CONSTRAINT `translations_entityType_entityId_fieldName_targetLanguage_unique` UNIQUE(`entityType`,`entityId`,`fieldName`,`targetLanguage`)
);
--> statement-breakpoint
CREATE INDEX `entity_idx` ON `translations` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `lang_idx` ON `translations` (`targetLanguage`);