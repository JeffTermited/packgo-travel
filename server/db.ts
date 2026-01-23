import { eq, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  tours, InsertTour, Tour,
  tourDepartures, InsertTourDeparture, TourDeparture,
  bookings, InsertBooking, Booking,
  bookingParticipants, InsertBookingParticipant, BookingParticipant,
  payments, InsertPayment, Payment,
  inquiries, InsertInquiry, Inquiry,
  inquiryMessages, InsertInquiryMessage, InquiryMessage
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// Tour Management Functions
// ============================================

/**
 * Get all tours with optional filtering
 */
export async function getAllTours(filters?: {
  category?: string;
  status?: string;
  featured?: boolean;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tours: database not available");
    return [];
  }

  // For now, return all tours without filtering
  // TODO: Implement proper filtering with drizzle-orm
  const result = await db.select().from(tours);
  return result;
}

/**
 * Get a single tour by ID
 */
export async function getTourById(id: number): Promise<Tour | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get tour: database not available");
    return undefined;
  }

  const result = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new tour
 */
export async function createTour(tour: InsertTour): Promise<Tour> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(tours).values(tour);
  const insertId = Number(result[0].insertId);
  
  const newTour = await getTourById(insertId);
  if (!newTour) {
    throw new Error("Failed to retrieve created tour");
  }
  
  return newTour;
}

/**
 * Update an existing tour
 */
export async function updateTour(id: number, updates: Partial<InsertTour>): Promise<Tour> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(tours).set(updates).where(eq(tours.id, id));
  
  const updatedTour = await getTourById(id);
  if (!updatedTour) {
    throw new Error("Failed to retrieve updated tour");
  }
  
  return updatedTour;
}

/**
 * Delete a tour
 */
export async function deleteTour(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(tours).where(eq(tours.id, id));
}

// ============================================
// Tour Departure Management Functions
// ============================================

/**
 * Get all departures for a specific tour
 */
export async function getTourDepartures(tourId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get departures: database not available");
    return [];
  }

  const result = await db.select().from(tourDepartures).where(eq(tourDepartures.tourId, tourId));
  return result;
}

/**
 * Get a single departure by ID
 */
export async function getDepartureById(id: number): Promise<TourDeparture | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get departure: database not available");
    return undefined;
  }

  const result = await db.select().from(tourDepartures).where(eq(tourDepartures.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new departure
 */
export async function createDeparture(departure: InsertTourDeparture): Promise<TourDeparture> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(tourDepartures).values(departure);
  const insertId = Number(result[0].insertId);
  
  const newDeparture = await getDepartureById(insertId);
  if (!newDeparture) {
    throw new Error("Failed to retrieve created departure");
  }
  
  return newDeparture;
}

/**
 * Update an existing departure
 */
export async function updateDeparture(id: number, updates: Partial<InsertTourDeparture>): Promise<TourDeparture> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(tourDepartures).set(updates).where(eq(tourDepartures.id, id));
  
  const updatedDeparture = await getDepartureById(id);
  if (!updatedDeparture) {
    throw new Error("Failed to retrieve updated departure");
  }
  
  return updatedDeparture;
}

/**
 * Delete a departure
 */
export async function deleteDeparture(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(tourDepartures).where(eq(tourDepartures.id, id));
}

// ============================================
// Booking Management Functions
// ============================================

/**
 * Get all bookings with optional filtering
 */
export async function getAllBookings(filters?: {
  userId?: number;
  bookingStatus?: string;
  paymentStatus?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get bookings: database not available");
    return [];
  }

  let query = db.select().from(bookings);
  
  // Apply userId filter if provided
  if (filters?.userId) {
    query = query.where(eq(bookings.userId, filters.userId)) as any;
  }
  
  const result = await query;
  return result;
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: number): Promise<Booking | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get booking: database not available");
    return undefined;
  }

  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new booking
 */
export async function createBooking(booking: InsertBooking): Promise<Booking> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(bookings).values(booking);
  const insertId = Number(result[0].insertId);
  
  const newBooking = await getBookingById(insertId);
  if (!newBooking) {
    throw new Error("Failed to retrieve created booking");
  }
  
  return newBooking;
}

/**
 * Update an existing booking
 */
export async function updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(bookings).set(updates).where(eq(bookings.id, id));
  
  const updatedBooking = await getBookingById(id);
  if (!updatedBooking) {
    throw new Error("Failed to retrieve updated booking");
  }
  
  return updatedBooking;
}

/**
 * Get all participants for a booking
 */
export async function getBookingParticipants(bookingId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get participants: database not available");
    return [];
  }

  const result = await db.select().from(bookingParticipants).where(eq(bookingParticipants.bookingId, bookingId));
  return result;
}

/**
 * Create a new booking participant
 */
export async function createBookingParticipant(participant: InsertBookingParticipant): Promise<BookingParticipant> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(bookingParticipants).values(participant);
  const insertId = Number(result[0].insertId);
  
  const participants = await db.select().from(bookingParticipants).where(eq(bookingParticipants.id, insertId)).limit(1);
  if (participants.length === 0) {
    throw new Error("Failed to retrieve created participant");
  }
  
  return participants[0];
}

// ============================================
// Payment Management Functions
// ============================================

/**
 * Get all payments for a booking
 */
export async function getBookingPayments(bookingId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  const result = await db.select().from(payments).where(eq(payments.bookingId, bookingId));
  return result;
}

/**
 * Create a new payment record
 */
export async function createPayment(payment: InsertPayment): Promise<Payment> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(payments).values(payment);
  const insertId = Number(result[0].insertId);
  
  const paymentRecords = await db.select().from(payments).where(eq(payments.id, insertId)).limit(1);
  if (paymentRecords.length === 0) {
    throw new Error("Failed to retrieve created payment");
  }
  
  return paymentRecords[0];
}

/**
 * Update payment status by Stripe Payment Intent ID
 */
export async function updatePaymentStatus(stripePaymentIntentId: string, status: string, paidAt?: Date): Promise<Payment> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updates: any = { paymentStatus: status };
  if (paidAt) {
    updates.paidAt = paidAt;
  }

  await db.update(payments).set(updates).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId));
  
  const paymentRecords = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, stripePaymentIntentId)).limit(1);
  if (paymentRecords.length === 0) {
    throw new Error("Failed to retrieve updated payment");
  }
  
  return paymentRecords[0];
}

// ============================================
// Inquiry Management Functions
// ============================================

/**
 * Get all inquiries with optional filtering
 */
export async function getAllInquiries(filters?: {
  status?: string;
  inquiryType?: string;
  assignedTo?: number;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inquiries: database not available");
    return [];
  }

  let query = db.select().from(inquiries);
  
  // Apply userId filter if provided
  if (filters?.userId) {
    query = query.where(eq(inquiries.userId, filters.userId)) as any;
  }
  
  const result = await query;
  return result;
}

/**
 * Get a single inquiry by ID
 */
export async function getInquiryById(id: number): Promise<Inquiry | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inquiry: database not available");
    return undefined;
  }

  const result = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new inquiry
 */
export async function createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(inquiries).values(inquiry);
  const insertId = Number(result[0].insertId);
  
  const newInquiry = await getInquiryById(insertId);
  if (!newInquiry) {
    throw new Error("Failed to retrieve created inquiry");
  }
  
  return newInquiry;
}

/**
 * Update an existing inquiry
 */
export async function updateInquiry(id: number, updates: Partial<InsertInquiry>): Promise<Inquiry> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(inquiries).set(updates).where(eq(inquiries.id, id));
  
  const updatedInquiry = await getInquiryById(id);
  if (!updatedInquiry) {
    throw new Error("Failed to retrieve updated inquiry");
  }
  
  return updatedInquiry;
}

/**
 * Get all messages for an inquiry
 */
export async function getInquiryMessages(inquiryId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get inquiry messages: database not available");
    return [];
  }

  const result = await db.select().from(inquiryMessages).where(eq(inquiryMessages.inquiryId, inquiryId));
  return result;
}

/**
 * Create a new inquiry message
 */
export async function createInquiryMessage(message: InsertInquiryMessage): Promise<InquiryMessage> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(inquiryMessages).values(message);
  const insertId = Number(result[0].insertId);
  
  const messages = await db.select().from(inquiryMessages).where(eq(inquiryMessages.id, insertId)).limit(1);
  if (messages.length === 0) {
    throw new Error("Failed to retrieve created message");
  }
  
  return messages[0];
}

// Update user profile (name, phone, address)
export async function updateUserProfile(
  userId: number,
  data: { name?: string; phone?: string; address?: string }
): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.address !== undefined) updateData.address = data.address;

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));

  // Return updated user
  const [updated] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return updated;
}

// Update user avatar
export async function updateUserAvatar(
  userId: number,
  avatarUrl: string | null
): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(users)
    .set({ avatar: avatarUrl })
    .where(eq(users.id, userId));

  // Return updated user
  const [updated] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return updated;
}
