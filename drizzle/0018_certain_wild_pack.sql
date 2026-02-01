ALTER TABLE `tours` MODIFY COLUMN `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `departureCity` text DEFAULT ('桃園');--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `destinationCountry` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `destination` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `promotionText` text;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `heroImageAlt` text;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `poeticTitle` text;