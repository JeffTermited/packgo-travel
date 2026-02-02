import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, unique } from "drizzle-orm/mysql-core";

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
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. Now optional for traditional auth. */
  openId: varchar("openId", { length: 64 }).unique(),
  /** Google OAuth identifier. Unique per user. */
  googleId: varchar("googleId", { length: 255 }).unique(),
  /** Password hash for traditional auth (bcrypt) */
  password: varchar("password", { length: 255 }),
  /** Token for password reset */
  resetPasswordToken: varchar("resetPasswordToken", { length: 255 }),
  /** Expiration time for password reset token */
  resetPasswordExpires: timestamp("resetPasswordExpires"),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  avatar: varchar("avatar", { length: 512 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  /** Login security fields */
  loginAttempts: int("loginAttempts").default(0).notNull(), // Number of failed login attempts
  lockoutUntil: timestamp("lockoutUntil"), // Account locked until this time
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tours table for managing travel packages.
 * Stores all tour information including destinations, pricing, and availability.
 * Enhanced with detailed location, flight, and accommodation information.
 */
export const tours = mysqlTable("tours", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Information
  title: text("title").notNull(),
  productCode: varchar("productCode", { length: 50 }), // 產品代碼 (e.g., 26JO217BRC-T)
  description: text("description").notNull(),
  
  // Location Information - Departure
  departureCountry: varchar("departureCountry", { length: 100 }).default("台灣"), // 出發國家
  departureCity: text("departureCity").default("桃園"), // 出發城市
  departureAirportCode: varchar("departureAirportCode", { length: 10 }), // 出發機場代碼 (e.g., TPE)
  departureAirportName: varchar("departureAirportName", { length: 100 }), // 出發機場名稱
  
  // Location Information - Destination
  destinationCountry: text("destinationCountry").notNull(), // 目的地國家
  destinationCity: text("destinationCity").notNull(), // 目的地城市 (支援多個城市)
  destinationRegion: varchar("destinationRegion", { length: 100 }), // 目的地區域 (e.g., 那霸)
  destinationAirportCode: varchar("destinationAirportCode", { length: 10 }), // 目的地機場代碼 (e.g., OKA)
  destinationAirportName: varchar("destinationAirportName", { length: 100 }), // 目的地機場名稱
  destination: text("destination").notNull(), // Legacy field for compatibility
  
  // Duration & Pricing
  duration: int("duration").notNull(), // in days
  nights: int("nights"), // number of nights
  price: int("price").notNull(), // in TWD
  priceUnit: varchar("priceUnit", { length: 20 }).default("人/起"), // 價格單位
  
  // Flight Information - Outbound
  outboundAirline: varchar("outboundAirline", { length: 100 }), // 去程航空公司
  outboundFlightNo: varchar("outboundFlightNo", { length: 20 }), // 去程航班號
  outboundDepartureTime: varchar("outboundDepartureTime", { length: 10 }), // 去程出發時間 (e.g., 06:55)
  outboundArrivalTime: varchar("outboundArrivalTime", { length: 10 }), // 去程抵達時間 (e.g., 09:15)
  outboundFlightDuration: varchar("outboundFlightDuration", { length: 20 }), // 去程飛行時間 (e.g., 1h20m)
  
  // Flight Information - Inbound
  inboundAirline: varchar("inboundAirline", { length: 100 }), // 回程航空公司
  inboundFlightNo: varchar("inboundFlightNo", { length: 20 }), // 回程航班號
  inboundDepartureTime: varchar("inboundDepartureTime", { length: 10 }), // 回程出發時間
  inboundArrivalTime: varchar("inboundArrivalTime", { length: 10 }), // 回程抵達時間
  inboundFlightDuration: varchar("inboundFlightDuration", { length: 20 }), // 回程飛行時間
  
  // Accommodation Information
  hotelName: varchar("hotelName", { length: 255 }), // 酒店名稱
  hotelGrade: varchar("hotelGrade", { length: 50 }), // 酒店等級 (e.g., 五星級, 四星級)
  hotelNights: int("hotelNights"), // 住宿晚數
  hotelLocation: varchar("hotelLocation", { length: 255 }), // 酒店位置
  hotelDescription: text("hotelDescription"), // 酒店介紹
  hotelFacilities: text("hotelFacilities"), // JSON array of facilities
  hotelRoomType: varchar("hotelRoomType", { length: 100 }), // 房型
  hotelRoomSize: varchar("hotelRoomSize", { length: 50 }), // 房間大小 (e.g., 30-35平方米)
  hotelCheckIn: varchar("hotelCheckIn", { length: 10 }), // 入住時間 (e.g., 15:00)
  hotelCheckOut: varchar("hotelCheckOut", { length: 10 }), // 退房時間 (e.g., 11:00)
  hotelSpecialOffers: text("hotelSpecialOffers"), // JSON array of special offers
  hotelImages: text("hotelImages"), // JSON array of image URLs
  hotelWebsite: varchar("hotelWebsite", { length: 512 }), // 酒店官網
  
  // Destination Description
  destinationDescription: text("destinationDescription"), // 目的地介紹
  
  
  // Daily Itinerary
  dailyItinerary: text("dailyItinerary"), // JSON array of daily activities
  
  // Pricing Details
  includes: text("includes"), // JSON array of what's included
  excludes: text("excludes"), // JSON array of what's excluded
  optionalTours: text("optionalTours"), // JSON array of optional tours with price
  
  // Tags & Features
  tags: text("tags"), // JSON array of tags (e.g., 特色住宿, 獨家企劃)
  highlights: text("highlights"), // JSON array of highlights
  promotionText: text("promotionText"), // 促銷文字 (e.g., 過年大促銷)
  
  // Images
  imageUrl: varchar("imageUrl", { length: 512 }), // Main image
  galleryImages: text("galleryImages"), // JSON array of gallery image URLs with metadata
  
  // === New Fields for Luxury Design ===
  // Hero Section
  heroImage: varchar("heroImage", { length: 512 }), // Full-screen hero background image
  heroImageAlt: text("heroImageAlt"), // Hero image alt text for SEO
  heroSubtitle: text("heroSubtitle"), // Hero subtitle - tour highlights summary
  
  // Color Theme
  colorTheme: text("colorTheme"), // JSON format: {primary, secondary, accent, text, textLight, background, backgroundDark}
  
  // Key Features (for vertical text layout)
  keyFeatures: text("keyFeatures"), // JSON array of key features with poetic phrases
  
  // Poetic Content (elegant descriptions for different sections)
  poeticTitle: text("poeticTitle"), // Poetic title (e.g., "北海道二世谷雅奢６日")
  poeticContent: text("poeticContent"), // JSON object: {intro, accommodation, dining, experience, closing}
  poeticSubtitle: text("poeticSubtitle"), // Poetic subtitle (e.g., "越獅境踏野原魂，追遷徙逐天地心")
  
  // Feature Images (for sipincollection.com style)
  featureImages: text("featureImages"), // JSON array: [{url, alt, caption, position: 'large'|'small'}]
  
  // === New Fields for AI-Generated Detailed Content ===
  // Detailed Itinerary (generated by ItineraryAgent)
  itineraryDetailed: text("itineraryDetailed"), // JSON array: [{day, title, activities: [{time, title, description, transportation, location}], meals: {breakfast, lunch, dinner}, accommodation}]
  
  // Cost Explanation (generated by CostAgent)
  costExplanation: text("costExplanation"), // JSON object: {included: [], excluded: [], additionalCosts: [], notes}
  
  // Detailed Notice (generated by NoticeAgent)
  noticeDetailed: text("noticeDetailed"), // JSON object: {preparation: [], culturalNotes: [], healthSafety: [], emergency: []}
  
  // Detailed Content Blocks (for sipincollection.com style)
  attractions: text("attractions"), // JSON array: [{name, description (100-200 words), image, imageAlt}]
  hotels: text("hotels"), // JSON array: [{name, stars, description (100-150 words), image, imageAlt}]
  meals: text("meals"), // JSON array: [{name, description, image, imageAlt}]
  flights: text("flights"), // JSON object: {airline, outbound: {time, duration}, inbound: {time, duration}, features: []}
  
  // Category & Status
  category: mysqlEnum("category", [
    "group",      // 團體旅遊
    "custom",     // 客製旅遊
    "package",    // 包團旅遊
    "cruise",     // 郵輪旅遊
    "theme"       // 主題旅遊
  ]).default("group").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "soldout"]).default("active").notNull(),
  featured: int("featured").default(0).notNull(), // 0 = not featured, 1 = featured
  
  // Availability
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  maxParticipants: int("maxParticipants"),
  currentParticipants: int("currentParticipants").default(0).notNull(),
  availableSeats: int("availableSeats"), // 可賣席次
  
  // Notes & Reminders
  specialReminders: text("specialReminders"), // 行程特殊提醒
  notes: text("notes"), // 行程備註
  safetyGuidelines: text("safetyGuidelines"), // 安全守則
  flightRules: text("flightRules"), // 團體航班規定事項
  
  // Legacy fields for compatibility
  airline: varchar("airline", { length: 100 }), // Airline company (legacy)
  specialActivities: text("specialActivities"), // JSON string of special activities array
  
  // Source information (for auto-generated tours)
  sourceUrl: varchar("sourceUrl", { length: 1024 }), // 來源網址
  isAutoGenerated: int("isAutoGenerated").default(0), // 是否為自動生成
  originalityScore: decimal("originalityScore", { precision: 5, scale: 2 }), // 原創性評分 (0-100)
  
  // Warning Flags (for Partial Success tracking)
  // ⚠️ Tech Lead 審查意見：錯誤日誌的可視化
  // 當 P1 Agent 失敗並觸發 Fallback 時，Admin 後台必須能看到警告狀態。
  // JSON 格式：{colorTheme?: {failed, fallbackUsed, reason}, heroContent?: {...}, features?: {...}, imageGeneration?: {hero?: {...}, features?: {...}}}
  warningFlags: text("warningFlags"), // JSON string of warning flags
  
  // Metadata
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


/**
 * Image library table for storing uploaded images.
 * Allows users to reuse images across different tours and sections.
 */
export const imageLibrary = mysqlTable("imageLibrary", {
  id: int("id").autoincrement().primaryKey(),
  url: varchar("url", { length: 1024 }).notNull(), // S3 URL
  filename: varchar("filename", { length: 255 }), // Original filename
  mimeType: varchar("mimeType", { length: 100 }), // MIME type (image/jpeg, etc.)
  fileSize: int("fileSize"), // File size in bytes
  width: int("width"), // Image width in pixels
  height: int("height"), // Image height in pixels
  tags: text("tags"), // JSON array of tags for search
  uploadedBy: int("uploadedBy").notNull(), // User ID who uploaded
  tourId: int("tourId"), // Optional: associated tour ID
  usageCount: int("usageCount").default(0).notNull(), // How many times this image is used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImageLibraryItem = typeof imageLibrary.$inferSelect;
export type InsertImageLibraryItem = typeof imageLibrary.$inferInsert;


/**
 * Homepage content table for storing editable homepage sections.
 * Allows admins to edit hero, destinations, and other homepage content.
 */
export const homepageContent = mysqlTable("homepageContent", {
  id: int("id").autoincrement().primaryKey(),
  sectionKey: varchar("sectionKey", { length: 100 }).notNull().unique(), // e.g., 'hero', 'destinations', 'trustpilot'
  content: text("content").notNull(), // JSON content for the section
  updatedBy: int("updatedBy"), // User ID who last updated
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HomepageContent = typeof homepageContent.$inferSelect;
export type InsertHomepageContent = typeof homepageContent.$inferInsert;

/**
 * Destinations table for storing editable destination cards.
 * Allows admins to manage destination cards on the homepage.
 */
export const destinations = mysqlTable("destinations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., '歐洲'
  label: varchar("label", { length: 100 }), // e.g., 'Europe'
  image: varchar("image", { length: 1024 }), // Image URL
  region: varchar("region", { length: 100 }), // e.g., 'europe'
  sortOrder: int("sortOrder").default(0).notNull(), // Display order
  isActive: boolean("isActive").default(true).notNull(), // Whether to show on homepage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = typeof destinations.$inferInsert;


/**
 * Agent Skills table for storing learned knowledge and rules.
 * Allows AI agents to learn from PDF documents and apply knowledge in future generations.
 */
export const agentSkills = mysqlTable("agentSkills", {
  id: int("id").autoincrement().primaryKey(),
  
  // Skill identification
  skillType: mysqlEnum("skillType", [
    "feature_classification",  // 特色分類（ESG、美食、文化等）
    "tag_rule",               // 標籤規則（天數、價格等）
    "itinerary_structure",    // 行程結構模式
    "highlight_detection",    // 亮點識別
    "transportation_type",    // 交通類型識別
    "meal_classification",    // 餐食分類
    "accommodation_type"      // 住宿類型
  ]).notNull(),
  
  // Superpowers-style skill category
  skillCategory: mysqlEnum("skillCategory", [
    "technique",   // 技術 - 具體方法，有明確步驟可循
    "pattern",     // 模式 - 思考問題的方式
    "reference"    // 參考 - API 文檔、語法指南
  ]).default("technique").notNull(),
  
  skillName: varchar("skillName", { length: 100 }).notNull(), // 技能名稱
  skillNameEn: varchar("skillNameEn", { length: 100 }), // 英文名稱
  
  // Version control
  version: int("version").default(1).notNull(),
  previousVersionId: int("previousVersionId"), // 指向前一版本
  
  // Matching rules
  keywords: text("keywords").notNull(), // JSON array of trigger keywords
  rules: text("rules").notNull(), // JSON object defining conditions and actions
  
  // Output configuration
  outputLabels: text("outputLabels"), // JSON array of output labels
  outputFormat: text("outputFormat"), // JSON schema for structured output
  
  // Metadata
  description: text("description"), // 技能描述
  source: varchar("source", { length: 255 }), // 學習來源（如 PDF 檔名）
  sourceUrl: varchar("sourceUrl", { length: 1024 }), // 來源 URL
  
  // Superpowers-style documentation fields
  whenToUse: text("whenToUse"), // 觸發條件（何時使用此技能）
  corePattern: text("corePattern"), // 核心模式（技術/模式的核心邏輯）
  quickReference: text("quickReference"), // 快速參考（常用操作速查表）
  commonMistakes: text("commonMistakes"), // 常見錯誤（避免的陷阱）
  realWorldImpact: text("realWorldImpact"), // 實際影響（使用此技能的效果）
  
  // Dependencies
  dependsOn: text("dependsOn"), // JSON array of skill IDs this skill depends on
  
  // TDD-style test cases
  testCases: text("testCases"), // JSON array of test cases
  lastTestedAt: timestamp("lastTestedAt"), // 最後測試時間
  testPassRate: decimal("testPassRate", { precision: 3, scale: 2 }), // 測試通過率
  
  // Quality metrics
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("1.00"), // 信心度（0-1）
  usageCount: int("usageCount").default(0).notNull(), // 使用次數
  successCount: int("successCount").default(0).notNull(), // 成功次數
  lastUsedAt: timestamp("lastUsedAt"), // 最後使用時間
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isBuiltIn: boolean("isBuiltIn").default(false).notNull(), // 是否為內建技能
  
  // Audit
  createdBy: int("createdBy"), // 創建者（null 表示系統自動學習）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

/**
 * Skill Application Logs table for tracking skill usage history.
 * Records when and how skills are applied during tour generation.
 */
export const skillApplicationLogs = mysqlTable("skillApplicationLogs", {
  id: int("id").autoincrement().primaryKey(),
  skillId: int("skillId").notNull(),
  tourId: int("tourId"), // 可能為 null（預覽模式）
  
  // Application context
  inputContent: text("inputContent"), // 輸入內容摘要
  matchScore: decimal("matchScore", { precision: 3, scale: 2 }), // 匹配分數
  
  // Results
  outputResult: text("outputResult"), // JSON - 應用結果
  success: boolean("success").default(true).notNull(),
  errorMessage: text("errorMessage"), // 錯誤訊息（如果失敗）
  
  // Timing
  appliedAt: timestamp("appliedAt").defaultNow().notNull(),
  processingTimeMs: int("processingTimeMs"), // 處理時間（毫秒）
});

export type SkillApplicationLog = typeof skillApplicationLogs.$inferSelect;
export type InsertSkillApplicationLog = typeof skillApplicationLogs.$inferInsert;

/**
 * Learning Sessions table for tracking PDF learning history.
 * Records each learning session when new knowledge is extracted from PDFs.
 */
export const learningSessions = mysqlTable("learningSessions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Source information
  sourceType: mysqlEnum("sourceType", ["pdf", "url", "manual"]).notNull(),
  sourceName: varchar("sourceName", { length: 255 }).notNull(), // 檔名或 URL
  sourceContent: text("sourceContent"), // 原始內容摘要
  
  // Learning results
  skillsLearned: int("skillsLearned").default(0).notNull(), // 學習到的技能數量
  skillIds: text("skillIds"), // JSON array of created skill IDs
  
  // Status
  status: mysqlEnum("status", [
    "pending",     // 等待處理
    "processing",  // 處理中
    "completed",   // 完成
    "failed",      // 失敗
    "cancelled"    // 取消
  ]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  
  // Audit
  initiatedBy: int("initiatedBy").notNull(), // 發起者
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type LearningSession = typeof learningSessions.$inferSelect;
export type InsertLearningSession = typeof learningSessions.$inferInsert;


/**
 * User Favorites table for storing user's favorite tours.
 * Allows users to save tours for later viewing.
 */
export const userFavorites = mysqlTable("userFavorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who favorited
  tourId: int("tourId").notNull(), // Tour that was favorited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint to prevent duplicate favorites
  uniqueUserTour: unique().on(table.userId, table.tourId),
}));

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

/**
 * User Browsing History table for storing user's recently viewed tours.
 * Allows users to see their browsing history.
 */
export const userBrowsingHistory = mysqlTable("userBrowsingHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // User who viewed
  tourId: int("tourId").notNull(), // Tour that was viewed
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  viewCount: int("viewCount").default(1).notNull(), // Number of times viewed
});

export type UserBrowsingHistory = typeof userBrowsingHistory.$inferSelect;
export type InsertUserBrowsingHistory = typeof userBrowsingHistory.$inferInsert;
