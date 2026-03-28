CREATE TABLE `agentActivityLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(100) NOT NULL,
	`agentKey` varchar(100),
	`taskType` varchar(100),
	`taskId` varchar(100),
	`taskTitle` varchar(500),
	`status` enum('started','completed','failed','idle') NOT NULL DEFAULT 'started',
	`resultSummary` text,
	`errorMessage` varchar(1000),
	`processingTimeMs` int,
	`userId` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `agentActivityLogs_id` PRIMARY KEY(`id`)
);
