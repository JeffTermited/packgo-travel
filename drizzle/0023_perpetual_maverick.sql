ALTER TABLE `agentSkills` ADD `skillCategory` enum('technique','pattern','reference') DEFAULT 'technique' NOT NULL;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `version` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `previousVersionId` int;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `whenToUse` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `corePattern` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `quickReference` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `commonMistakes` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `realWorldImpact` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `dependsOn` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `testCases` text;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `lastTestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `agentSkills` ADD `testPassRate` decimal(3,2);