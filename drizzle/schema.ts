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