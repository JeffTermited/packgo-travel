import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tours, InsertTour, Tour } from "../drizzle/schema";
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
