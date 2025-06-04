import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("passenger"), // passenger, bus_owner, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Bus Schema
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  busNumber: text("bus_number").notNull(),
  capacity: integer("capacity").notNull(),
  hasAc: boolean("has_ac").default(false),
  hasWifi: boolean("has_wifi").default(false),
  hasUsb: boolean("has_usb").default(false),
  seatLayout: json("seat_layout").notNull(),
});

export const insertBusSchema = createInsertSchema(buses).omit({
  id: true,
});

// Route Schema
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  fromLocation: text("from_location").notNull(),
  toLocation: text("to_location").notNull(),
  distance: integer("distance"),
  estimatedDuration: integer("estimated_duration").notNull(), // in minutes
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

// Schedule Schema
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull(),
  routeId: integer("route_id").notNull(),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),
  price: integer("price").notNull(),
  available: boolean("available").default(true),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

// Booking Schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  scheduleId: integer("schedule_id").notNull(),
  seats: json("seats").notNull(), // Array of seat numbers
  totalPrice: integer("total_price").notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, completed
  bookingTime: timestamp("booking_time").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  bookingTime: true,
});

// Location Update Schema (for bus tracking)
export const locationUpdates = pgTable("location_updates", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  speed: integer("speed"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertLocationUpdateSchema = createInsertSchema(locationUpdates).omit({
  id: true,
  timestamp: true,
});

// Review Schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  busId: integer("bus_id").notNull(),
  scheduleId: integer("schedule_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  timestamp: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;

export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type LocationUpdate = typeof locationUpdates.$inferSelect;
export type InsertLocationUpdate = z.infer<typeof insertLocationUpdateSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Extended schemas with complex relations
export type BusWithOwner = Bus & { owner: User };
export type ScheduleWithDetails = Schedule & { bus: Bus; route: Route };
export type BookingWithDetails = Booking & { user: User; schedule: ScheduleWithDetails };
