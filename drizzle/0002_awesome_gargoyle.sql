CREATE TABLE `bookingParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`participantType` enum('adult','child','infant') NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`gender` enum('male','female','other'),
	`dateOfBirth` timestamp,
	`passportNumber` varchar(50),
	`passportExpiry` timestamp,
	`nationality` varchar(100),
	`dietaryRequirements` text,
	`specialNeeds` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookingParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`departureId` int NOT NULL,
	`userId` int,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(50) NOT NULL,
	`numberOfAdults` int NOT NULL DEFAULT 0,
	`numberOfChildrenWithBed` int NOT NULL DEFAULT 0,
	`numberOfChildrenNoBed` int NOT NULL DEFAULT 0,
	`numberOfInfants` int NOT NULL DEFAULT 0,
	`numberOfSingleRooms` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL,
	`depositAmount` int NOT NULL,
	`remainingAmount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'TWD',
	`message` text,
	`bookingStatus` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentStatus` enum('unpaid','deposit','paid','refunded') NOT NULL DEFAULT 'unpaid',
	`depositDueDate` timestamp,
	`balanceDueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`inquiryType` enum('general','custom_tour','visa','group_booking','complaint','other') NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(50),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`destination` varchar(255),
	`numberOfDays` int,
	`numberOfPeople` int,
	`budget` int,
	`preferredDepartureDate` timestamp,
	`status` enum('new','in_progress','replied','resolved','closed') NOT NULL DEFAULT 'new',
	`assignedTo` int,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiryMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inquiryId` int NOT NULL,
	`senderId` int,
	`senderType` enum('customer','admin') NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inquiryMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'TWD',
	`paymentMethod` enum('stripe','paypal','bank_transfer','cash','other') NOT NULL,
	`paymentType` enum('deposit','balance','full') NOT NULL,
	`transactionId` varchar(255),
	`paymentStatus` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tourDepartures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tourId` int NOT NULL,
	`departureDate` timestamp NOT NULL,
	`returnDate` timestamp NOT NULL,
	`adultPrice` int NOT NULL,
	`childPriceWithBed` int,
	`childPriceNoBed` int,
	`infantPrice` int,
	`singleRoomSupplement` int,
	`totalSlots` int NOT NULL,
	`bookedSlots` int NOT NULL DEFAULT 0,
	`status` enum('open','full','cancelled') NOT NULL DEFAULT 'open',
	`currency` varchar(3) NOT NULL DEFAULT 'TWD',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tourDepartures_id` PRIMARY KEY(`id`)
);
