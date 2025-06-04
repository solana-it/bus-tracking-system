import { 
  User, InsertUser, Bus, InsertBus, Route, InsertRoute,
  Schedule, InsertSchedule, Booking, InsertBooking,
  LocationUpdate, InsertLocationUpdate, Review, InsertReview
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Bus operations
  getBus(id: number): Promise<Bus | undefined>;
  getBusesByOwner(ownerId: number): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: number, bus: Partial<Bus>): Promise<Bus | undefined>;
  deleteBus(id: number): Promise<boolean>;
  
  // Route operations
  getRoute(id: number): Promise<Route | undefined>;
  getAllRoutes(): Promise<Route[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  getRouteByLocations(fromLocation: string, toLocation: string): Promise<Route | undefined>;
  
  // Schedule operations
  getSchedule(id: number): Promise<Schedule | undefined>;
  getSchedulesByBus(busId: number): Promise<Schedule[]>;
  getSchedulesByRoute(routeId: number): Promise<Schedule[]>;
  getSchedulesByDateRange(fromDate: Date, toDate: Date): Promise<Schedule[]>;
  searchSchedules(fromLocation: string, toLocation: string, date: Date): Promise<(Schedule & { bus: Bus, route: Route })[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<Schedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<(Booking & { schedule: Schedule & { bus: Bus, route: Route } })[]>;
  getBookingsBySchedule(scheduleId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Location update operations
  createLocationUpdate(update: InsertLocationUpdate): Promise<LocationUpdate>;
  getLatestLocationUpdate(busId: number): Promise<LocationUpdate | undefined>;
  
  // Review operations
  getReviewsByBus(busId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private buses: Map<number, Bus>;
  private routes: Map<number, Route>;
  private schedules: Map<number, Schedule>;
  private bookings: Map<number, Booking>;
  private locationUpdates: Map<number, LocationUpdate>;
  private reviews: Map<number, Review>;
  
  sessionStore: session.SessionStore;
  
  private nextUserId: number;
  private nextBusId: number;
  private nextRouteId: number;
  private nextScheduleId: number;
  private nextBookingId: number;
  private nextLocationUpdateId: number;
  private nextReviewId: number;

  constructor() {
    this.users = new Map();
    this.buses = new Map();
    this.routes = new Map();
    this.schedules = new Map();
    this.bookings = new Map();
    this.locationUpdates = new Map();
    this.reviews = new Map();
    
    this.nextUserId = 1;
    this.nextBusId = 1;
    this.nextRouteId = 1;
    this.nextScheduleId = 1;
    this.nextBookingId = 1;
    this.nextLocationUpdateId = 1;
    this.nextReviewId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize with some default routes
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add some common routes in Sri Lanka
    const commonRoutes = [
      { fromLocation: "Colombo", toLocation: "Kandy", distance: 115, estimatedDuration: 180 },
      { fromLocation: "Colombo", toLocation: "Galle", distance: 125, estimatedDuration: 150 },
      { fromLocation: "Colombo", toLocation: "Jaffna", distance: 395, estimatedDuration: 540 },
      { fromLocation: "Kandy", toLocation: "Nuwara Eliya", distance: 80, estimatedDuration: 120 },
      { fromLocation: "Colombo", toLocation: "Negombo", distance: 40, estimatedDuration: 60 },
      { fromLocation: "Colombo", toLocation: "Anuradhapura", distance: 200, estimatedDuration: 270 }
    ];
    
    for (const route of commonRoutes) {
      this.createRoute(route);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }
  
  // Bus operations
  async getBus(id: number): Promise<Bus | undefined> {
    return this.buses.get(id);
  }
  
  async getBusesByOwner(ownerId: number): Promise<Bus[]> {
    return Array.from(this.buses.values()).filter(
      (bus) => bus.ownerId === ownerId
    );
  }
  
  async createBus(insertBus: InsertBus): Promise<Bus> {
    const id = this.nextBusId++;
    const bus: Bus = { ...insertBus, id };
    this.buses.set(id, bus);
    return bus;
  }
  
  async updateBus(id: number, partialBus: Partial<Bus>): Promise<Bus | undefined> {
    const existingBus = this.buses.get(id);
    if (!existingBus) return undefined;
    
    const updatedBus = { ...existingBus, ...partialBus };
    this.buses.set(id, updatedBus);
    return updatedBus;
  }
  
  async deleteBus(id: number): Promise<boolean> {
    return this.buses.delete(id);
  }
  
  // Route operations
  async getRoute(id: number): Promise<Route | undefined> {
    return this.routes.get(id);
  }
  
  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }
  
  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.nextRouteId++;
    const route: Route = { ...insertRoute, id };
    this.routes.set(id, route);
    return route;
  }
  
  async getRouteByLocations(fromLocation: string, toLocation: string): Promise<Route | undefined> {
    return Array.from(this.routes.values()).find(
      (route) => 
        route.fromLocation.toLowerCase() === fromLocation.toLowerCase() && 
        route.toLocation.toLowerCase() === toLocation.toLowerCase()
    );
  }
  
  // Schedule operations
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }
  
  async getSchedulesByBus(busId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.busId === busId
    );
  }
  
  async getSchedulesByRoute(routeId: number): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => schedule.routeId === routeId
    );
  }
  
  async getSchedulesByDateRange(fromDate: Date, toDate: Date): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter(
      (schedule) => {
        const departureTime = new Date(schedule.departureTime);
        return departureTime >= fromDate && departureTime <= toDate;
      }
    );
  }
  
  async searchSchedules(fromLocation: string, toLocation: string, date: Date): Promise<(Schedule & { bus: Bus, route: Route })[]> {
    const matchingRoutes = Array.from(this.routes.values()).filter(
      (route) => 
        route.fromLocation.toLowerCase() === fromLocation.toLowerCase() && 
        route.toLocation.toLowerCase() === toLocation.toLowerCase()
    );
    
    if (matchingRoutes.length === 0) return [];
    
    const routeIds = matchingRoutes.map(route => route.id);
    
    // Start of day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    // End of day
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    const matchingSchedules = Array.from(this.schedules.values()).filter(
      (schedule) => {
        if (!routeIds.includes(schedule.routeId)) return false;
        
        const departureTime = new Date(schedule.departureTime);
        return departureTime >= startDate && departureTime <= endDate && schedule.available;
      }
    );
    
    return matchingSchedules.map(schedule => {
      const bus = this.buses.get(schedule.busId)!;
      const route = this.routes.get(schedule.routeId)!;
      return { ...schedule, bus, route };
    });
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.nextScheduleId++;
    const schedule: Schedule = { ...insertSchedule, id };
    this.schedules.set(id, schedule);
    return schedule;
  }
  
  async updateSchedule(id: number, partialSchedule: Partial<Schedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...partialSchedule };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }
  
  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingsByUser(userId: number): Promise<(Booking & { schedule: Schedule & { bus: Bus, route: Route } })[]> {
    const userBookings = Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId
    );
    
    return userBookings.map(booking => {
      const schedule = this.schedules.get(booking.scheduleId)!;
      const bus = this.buses.get(schedule.busId)!;
      const route = this.routes.get(schedule.routeId)!;
      
      return { 
        ...booking, 
        schedule: { 
          ...schedule, 
          bus, 
          route 
        } 
      };
    });
  }
  
  async getBookingsBySchedule(scheduleId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.scheduleId === scheduleId
    );
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.nextBookingId++;
    const bookingTime = new Date();
    const booking: Booking = { ...insertBooking, id, bookingTime };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const existingBooking = this.bookings.get(id);
    if (!existingBooking) return undefined;
    
    const updatedBooking = { ...existingBooking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }
  
  // Location update operations
  async createLocationUpdate(insertUpdate: InsertLocationUpdate): Promise<LocationUpdate> {
    const id = this.nextLocationUpdateId++;
    const timestamp = new Date();
    const update: LocationUpdate = { ...insertUpdate, id, timestamp };
    this.locationUpdates.set(id, update);
    return update;
  }
  
  async getLatestLocationUpdate(busId: number): Promise<LocationUpdate | undefined> {
    const busUpdates = Array.from(this.locationUpdates.values()).filter(
      (update) => update.busId === busId
    );
    
    if (busUpdates.length === 0) return undefined;
    
    // Sort by timestamp (descending) and return the most recent
    return busUpdates.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }
  
  // Review operations
  async getReviewsByBus(busId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.busId === busId
    );
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.nextReviewId++;
    const timestamp = new Date();
    const review: Review = { ...insertReview, id, timestamp };
    this.reviews.set(id, review);
    return review;
  }
}

export const storage = new MemStorage();
