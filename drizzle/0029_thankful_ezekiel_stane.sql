CREATE TABLE `llmUsageLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`taskType` varchar(100),
	`taskId` varchar(100),
	`model` varchar(100) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`cacheCreationInputTokens` int NOT NULL DEFAULT 0,
	`cacheReadInputTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`estimatedCostUsd` varchar(20) DEFAULT '0.000000',
	`processingTimeMs` int,
	`wasFromCache` boolean NOT NULL DEFAULT false,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llmUsageLogs_id` PRIMARY KEY(`id`)
);
