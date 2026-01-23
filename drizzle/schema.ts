import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  avatar: varchar("avatar", { length: 512 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tours table for managing travel packages.
 * Stores all tour information including destinations, pricing, and availability.
 */
export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  description: text("description").notNull(),
  duration: int("duration").notNull(), // in days
  price: int("price").notNull(), // in TWD
  imageUrl: varchar("imageUrl", { length: 512 }),
  category: mysqlEnum("category", [
    "group",      // 團體旅遊
    "custom",     // 客製旅遊
    "package",    // 包團旅遊
    "cruise",     // 郵輪旅遊
    "theme"       // 主題旅遊
  ]).default("group").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "soldout"]).default("active").notNull(),
  featured: int("featured").default(0).notNull(), // 0 = not featured, 1 = featured
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  maxParticipants: int("maxParticipants"),
  currentParticipants: int("currentParticipants").default(0).notNull(),
  highlights: text("highlights"), // JSON string of highlights array
  includes: text("includes"),     // JSON string of what's included
  excludes: text("excludes"),     // JSON string of what's excluded
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tour = typeof tours.$inferSelect;
export type InsertTour = typeof tours.$inferInsert;

/**
 * Tour departures table for managing multiple departure dates per tour.
 * Each tour can have multiple departure dates with different pricing.
 */
export const tourDepartures = mysqlTable("tourDepartures", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  departureDate: timestamp("departureDate").notNull(),
  returnDate: timestamp("returnDate").notNull(),
  adultPrice: int("adultPrice").notNull(), // Adult price in TWD
  childPriceWithBed: int("childPriceWithBed"), // Child price with bed
  childPriceNoBed: int("childPriceNoBed"), // Child price without bed
  infantPrice: int("infantPrice"), // Infant price (under 2 years)
  singleRoomSupplement: int("singleRoomSupplement"), // Single room surcharge
  totalSlots: int("totalSlots").notNull(), // Total available slots
  bookedSlots: int("bookedSlots").default(0).notNull(), // Already booked slots
  status: mysqlEnum("status", ["open", "full", "cancelled"]).default("open").notNull(),
  currency: varchar("currency", { length: 3 }).default("TWD").notNull(),
  notes: text("notes"), // Special notes for this departure
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TourDeparture = typeof tourDepartures.$inferSelect;
export type InsertTourDeparture = typeof tourDepartures.$inferInsert;

/**
 * Bookings table for storing all customer reservations.
 * Core transaction table linking users to tour departures.
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  tourId: int("tourId").notNull(),
  departureId: int("departureId").notNull(),
  userId: int("userId"), // Nullable for guest bookings
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }).notNull(),
  numberOfAdults: int("numberOfAdults").default(0).notNull(),
  numberOfChildrenWithBed: int("numberOfChildrenWithBed").default(0).notNull(),
  numberOfChildrenNoBed: int("numberOfChildrenNoBed").default(0).notNull(),
  numberOfInfants: int("numberOfInfants").default(0).notNull(),
  numberOfSingleRooms: int("numberOfSingleRooms").default(0).notNull(),
  totalPrice: int("totalPrice").notNull(), // Total booking price
  depositAmount: int("depositAmount").notNull(), // Deposit amount (20% of total)
  remainingAmount: int("remainingAmount").notNull(), // Remaining balance
  currency: varchar("currency", { length: 3 }).default("TWD").notNull(),
  message: text("message"), // Customer message or special requests
  bookingStatus: mysqlEnum("bookingStatus", [
    "pending",    // Awaiting confirmation
    "confirmed",  // Confirmed by admin
    "completed",  // Trip completed
    "cancelled"   // Cancelled
  ]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", [
    "unpaid",     // No payment received
    "deposit",    // Deposit paid
    "paid",       // Fully paid
    "refunded"    // Refunded
  ]).default("unpaid").notNull(),
  depositDueDate: timestamp("depositDueDate"), // Deadline for deposit payment
  balanceDueDate: timestamp("balanceDueDate"), // Deadline for balance payment
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Booking participants table for storing detailed information of all travelers.
 * Each booking can have multiple participants.
 */
export const bookingParticipants = mysqlTable("bookingParticipants", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  participantType: mysqlEnum("participantType", ["adult", "child", "infant"]).notNull(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  dateOfBirth: timestamp("dateOfBirth"),
  passportNumber: varchar("passportNumber", { length: 50 }),
  passportExpiry: timestamp("passportExpiry"),
  nationality: varchar("nationality", { length: 100 }),
  dietaryRequirements: text("dietaryRequirements"),
  specialNeeds: text("specialNeeds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BookingParticipant = typeof bookingParticipants.$inferSelect;
export type InsertBookingParticipant = typeof bookingParticipants.$inferInsert;

/**
 * Payments table for tracking all payment transactions.
 * Multiple payments can be associated with one booking (deposit + balance).
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("TWD").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", [
    "stripe",
    "paypal",
    "bank_transfer",
    "cash",
    "other"
  ]).notNull(),
  paymentType: mysqlEnum("paymentType", ["deposit", "balance", "full"]).notNull(),
  transactionId: varchar("transactionId", { length: 255 }), // External payment gateway transaction ID
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }), // Stripe Payment Intent ID
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }), // Stripe Checkout Session ID
  paymentStatus: mysqlEnum("paymentStatus", [
    "pending",
    "completed",
    "failed",
    "refunded"
  ]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Inquiries table for customer service requests.
 * Stores all customer inquiries including quick inquiries and custom tour requests.
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // Nullable for guest inquiries
  inquiryType: mysqlEnum("inquiryType", [
    "general",        // General inquiry
    "custom_tour",    // Custom tour planning
    "visa",           // Visa application service
    "group_booking",  // Group booking inquiry
    "complaint",      // Complaint
    "other"
  ]).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  // Custom tour specific fields
  destination: varchar("destination", { length: 255 }),
  numberOfDays: int("numberOfDays"),
  numberOfPeople: int("numberOfPeople"),
  budget: int("budget"),
  preferredDepartureDate: timestamp("preferredDepartureDate"),
  status: mysqlEnum("status", [
    "new",           // New inquiry
    "in_progress",   // Being processed
    "replied",       // Replied to customer
    "resolved",      // Resolved
    "closed"         // Closed
  ]).default("new").notNull(),
  assignedTo: int("assignedTo"), // Admin user ID assigned to handle this inquiry
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Inquiry messages table for conversation threads.
 * Stores all messages exchanged between customer and admin.
 */
export const inquiryMessages = mysqlTable("inquiryMessages", {
  id: int("id").autoincrement().primaryKey(),
  inquiryId: int("inquiryId").notNull(),
  senderId: int("senderId"), // User ID (admin or customer)
  senderType: mysqlEnum("senderType", ["customer", "admin"]).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(), // 0 = unread, 1 = read
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InquiryMessage = typeof inquiryMessages.$inferSelect;
export type InsertInquiryMessage = typeof inquiryMessages.$inferInsert;

/**
 * Newsletter subscribers table.
 * Stores email addresses of users who subscribed to the newsletter.
 */
export const newsletterSubscribers = mysqlTable("newsletterSubscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  subscribedAt: timestamp("subscribedAt").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribedAt"),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
