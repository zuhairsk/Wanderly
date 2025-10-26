import { pgTable, text, varchar, real, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "user" or "admin"
  favorites: jsonb("favorites").notNull().default([]).$type<string[]>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Travel info types
export type TravelOption = {
  mode: string;
  duration: string;
  cost: string;
  recommended?: boolean;
  pros?: string;
  cons?: string;
  bookingLinks?: string[];
  companies?: string[];
  available?: boolean;
  note?: string;
};

export type TravelInfo = {
  fromLocation: string;
  options: TravelOption[];
  bestOption: {
    mode: string;
    reason: string;
    estimatedCost?: string;
  };
};

// Attractions table
export const attractions = pgTable("attractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // "nature", "museum", "adventure", "dining", "historic", "shopping"
  description: text("description").notNull(),
  location: jsonb("location").notNull().$type<{ lat: number; lng: number; address: string }>(),
  images: jsonb("images").notNull().default([]).$type<string[]>(),
  price: text("price").notNull(), // "free", "$", "$$", "$$$"
  distance: real("distance").notNull(), // in miles
  hours: text("hours"),
  phone: text("phone"),
  website: text("website"),
  amenities: jsonb("amenities").notNull().default([]).$type<string[]>(),
  travelInfo: jsonb("travel_info").$type<TravelInfo>(),
  averageRating: real("average_rating").notNull().default(0),
  reviewCount: real("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAttractionSchema = createInsertSchema(attractions).omit({
  id: true,
  averageRating: true,
  reviewCount: true,
  createdAt: true,
});

export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type Attraction = typeof attractions.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  attractionId: text("attraction_id").notNull(),
  rating: real("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().min(1).max(5),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
