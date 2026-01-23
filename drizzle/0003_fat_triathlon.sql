ALTER TABLE `payments` ADD `stripePaymentIntentId` varchar(255);--> statement-breakpoint
ALTER TABLE `payments` ADD `stripeCheckoutSessionId` varchar(255);