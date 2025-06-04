import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { 
  insertBusSchema, insertRouteSchema, insertScheduleSchema, 
  insertBookingSchema, insertLocationUpdateSchema, insertReviewSchema 
} from "@shared/schema";
import { z } from "zod";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a bus owner
const isBusOwner = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.role === "bus_owner") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only bus owners can access this resource" });
};

// Middleware to check if user is an admin
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Only admins can access this resource" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle different message types
        if (data.type === 'subscribe') {
          // Store the subscription info in the ws object
          (ws as any).subscriptions = (ws as any).subscriptions || [];
          (ws as any).subscriptions.push(data.channel);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
  });
  
  // Broadcast to all clients subscribed to a specific channel
  const broadcast = (channel: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && (client as any).subscriptions?.includes(channel)) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Bus Owner Routes
  
  // Bus Management
  app.get("/api/buses", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.role === "bus_owner") {
        const buses = await storage.getBusesByOwner(req.user.id);
        res.json(buses);
      } else if (req.user?.role === "admin") {
        // Admin can see all buses
        const busOwners = await storage.getUsersByRole("bus_owner");
        const allBuses = [];
        
        for (const owner of busOwners) {
          const ownerBuses = await storage.getBusesByOwner(owner.id);
          allBuses.push(...ownerBuses.map(bus => ({ ...bus, ownerName: owner.name })));
        }
        
        res.json(allBuses);
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/buses", isBusOwner, async (req, res) => {
    try {
      const busData = insertBusSchema.parse({
        ...req.body,
        ownerId: req.user!.id
      });
      
      const bus = await storage.createBus(busData);
      res.status(201).json(bus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/buses/:id", isAuthenticated, async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const bus = await storage.getBus(busId);
      
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Check if user is the owner or admin
      if (req.user?.role === "bus_owner" && bus.ownerId !== req.user.id && req.user?.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to view this bus" });
      }
      
      res.json(bus);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/buses/:id", isBusOwner, async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const existingBus = await storage.getBus(busId);
      
      if (!existingBus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Check if user is the owner
      if (existingBus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this bus" });
      }
      
      const busData = insertBusSchema.partial().parse(req.body);
      const updatedBus = await storage.updateBus(busId, busData);
      
      res.json(updatedBus);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/buses/:id", isBusOwner, async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const existingBus = await storage.getBus(busId);
      
      if (!existingBus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Check if user is the owner
      if (existingBus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this bus" });
      }
      
      const deleted = await storage.deleteBus(busId);
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete bus" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Route Management
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getAllRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/routes", isAdmin, async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      
      // Check if route already exists
      const existingRoute = await storage.getRouteByLocations(
        routeData.fromLocation,
        routeData.toLocation
      );
      
      if (existingRoute) {
        return res.status(400).json({ message: "Route already exists" });
      }
      
      const route = await storage.createRoute(routeData);
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Schedule Management
  app.get("/api/schedules", isBusOwner, async (req, res) => {
    try {
      // Get all buses owned by this owner
      const buses = await storage.getBusesByOwner(req.user!.id);
      const busIds = buses.map(bus => bus.id);
      
      // Get schedules for all buses
      const allSchedules = [];
      for (const busId of busIds) {
        const schedules = await storage.getSchedulesByBus(busId);
        allSchedules.push(...schedules);
      }
      
      // Enhance schedules with route information
      const schedulesWithRoutes = await Promise.all(
        allSchedules.map(async schedule => {
          const route = await storage.getRoute(schedule.routeId);
          return { ...schedule, route };
        })
      );
      
      res.json(schedulesWithRoutes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/schedules", isBusOwner, async (req, res) => {
    try {
      const scheduleData = insertScheduleSchema.parse(req.body);
      
      // Verify the bus belongs to the owner
      const bus = await storage.getBus(scheduleData.busId);
      if (!bus || bus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to create schedules for this bus" });
      }
      
      // Verify the route exists
      const route = await storage.getRoute(scheduleData.routeId);
      if (!route) {
        return res.status(400).json({ message: "Invalid route" });
      }
      
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/schedules/:id", isBusOwner, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const existingSchedule = await storage.getSchedule(scheduleId);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Verify the bus belongs to the owner
      const bus = await storage.getBus(existingSchedule.busId);
      if (!bus || bus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this schedule" });
      }
      
      const scheduleData = insertScheduleSchema.partial().parse(req.body);
      
      // If busId is being updated, verify the new bus belongs to the owner
      if (scheduleData.busId) {
        const newBus = await storage.getBus(scheduleData.busId);
        if (!newBus || newBus.ownerId !== req.user!.id) {
          return res.status(403).json({ message: "You don't have permission to assign this bus" });
        }
      }
      
      // If routeId is being updated, verify it exists
      if (scheduleData.routeId) {
        const route = await storage.getRoute(scheduleData.routeId);
        if (!route) {
          return res.status(400).json({ message: "Invalid route" });
        }
      }
      
      const updatedSchedule = await storage.updateSchedule(scheduleId, scheduleData);
      res.json(updatedSchedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/schedules/:id", isBusOwner, async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const existingSchedule = await storage.getSchedule(scheduleId);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      // Verify the bus belongs to the owner
      const bus = await storage.getBus(existingSchedule.busId);
      if (!bus || bus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to delete this schedule" });
      }
      
      const deleted = await storage.deleteSchedule(scheduleId);
      
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(500).json({ message: "Failed to delete schedule" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Passenger Routes
  
  // Search Schedules
  app.get("/api/search", async (req, res) => {
    try {
      const { from, to, date } = req.query;
      
      if (!from || !to || !date) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const searchDate = new Date(date as string);
      
      if (isNaN(searchDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      const schedules = await storage.searchSchedules(
        from as string,
        to as string,
        searchDate
      );
      
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Get Bus Details
  app.get("/api/buses/:id/details", async (req, res) => {
    try {
      const busId = parseInt(req.params.id);
      const bus = await storage.getBus(busId);
      
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      // Get reviews
      const reviews = await storage.getReviewsByBus(busId);
      
      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;
        
      const busDetails = {
        ...bus,
        reviews,
        averageRating
      };
      
      res.json(busDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Booking Management
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Verify the schedule exists
      const schedule = await storage.getSchedule(bookingData.scheduleId);
      if (!schedule) {
        return res.status(400).json({ message: "Invalid schedule" });
      }
      
      // Verify the schedule is available
      if (!schedule.available) {
        return res.status(400).json({ message: "Schedule is not available for booking" });
      }
      
      // Get the bus to check seating
      const bus = await storage.getBus(schedule.busId);
      if (!bus) {
        return res.status(400).json({ message: "Bus not found" });
      }
      
      // Check if seats are valid
      if (!Array.isArray(bookingData.seats) || bookingData.seats.length === 0) {
        return res.status(400).json({ message: "No seats selected" });
      }
      
      // Get all bookings for this schedule to check seat availability
      const existingBookings = await storage.getBookingsBySchedule(schedule.scheduleId);
      const bookedSeats = existingBookings.flatMap(booking => 
        booking.status !== "cancelled" ? booking.seats : []
      );
      
      // Check if any of the requested seats are already booked
      const requestedSeats = bookingData.seats as string[];
      const overlappingSeats = requestedSeats.filter(seat => bookedSeats.includes(seat));
      
      if (overlappingSeats.length > 0) {
        return res.status(400).json({ 
          message: "Some seats are already booked", 
          unavailableSeats: overlappingSeats 
        });
      }
      
      const booking = await storage.createBooking(bookingData);
      
      // Notify bus owner about new booking via WebSocket
      broadcast(`bus_owner_${schedule.busId}`, {
        type: "new_booking",
        booking
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user!.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/bookings/:id", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify the booking belongs to the user or user is the bus owner
      if (booking.userId !== req.user!.id) {
        // Check if user is the bus owner
        const schedule = await storage.getSchedule(booking.scheduleId);
        if (!schedule) {
          return res.status(404).json({ message: "Schedule not found" });
        }
        
        const bus = await storage.getBus(schedule.busId);
        if (!bus || (req.user!.role === "bus_owner" && bus.ownerId !== req.user!.id)) {
          return res.status(403).json({ message: "You don't have permission to view this booking" });
        }
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/bookings/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.getBooking(bookingId);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify the booking belongs to the user or user is the bus owner
      if (booking.userId !== req.user!.id) {
        // Check if user is the bus owner
        const schedule = await storage.getSchedule(booking.scheduleId);
        if (!schedule) {
          return res.status(404).json({ message: "Schedule not found" });
        }
        
        const bus = await storage.getBus(schedule.busId);
        if (!bus || (req.user!.role === "bus_owner" && bus.ownerId !== req.user!.id)) {
          return res.status(403).json({ message: "You don't have permission to cancel this booking" });
        }
      }
      
      // Update booking status to cancelled
      const updatedBooking = await storage.updateBookingStatus(bookingId, "cancelled");
      
      if (!updatedBooking) {
        return res.status(500).json({ message: "Failed to cancel booking" });
      }
      
      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Bus Location Tracking
  app.post("/api/location", isBusOwner, async (req, res) => {
    try {
      const locationData = insertLocationUpdateSchema.parse(req.body);
      
      // Verify the bus belongs to the owner
      const bus = await storage.getBus(locationData.busId);
      if (!bus || bus.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "You don't have permission to update this bus's location" });
      }
      
      const locationUpdate = await storage.createLocationUpdate(locationData);
      
      // Broadcast location update to all clients tracking this bus
      broadcast(`bus_location_${locationData.busId}`, {
        type: "location_update",
        location: locationUpdate
      });
      
      res.status(201).json(locationUpdate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/location/:busId", async (req, res) => {
    try {
      const busId = parseInt(req.params.busId);
      const bus = await storage.getBus(busId);
      
      if (!bus) {
        return res.status(404).json({ message: "Bus not found" });
      }
      
      const locationUpdate = await storage.getLatestLocationUpdate(busId);
      
      if (!locationUpdate) {
        return res.status(404).json({ message: "No location data available for this bus" });
      }
      
      res.json(locationUpdate);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Reviews
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Verify the bus exists
      const bus = await storage.getBus(reviewData.busId);
      if (!bus) {
        return res.status(400).json({ message: "Bus not found" });
      }
      
      // Verify the schedule exists
      const schedule = await storage.getSchedule(reviewData.scheduleId);
      if (!schedule) {
        return res.status(400).json({ message: "Schedule not found" });
      }
      
      // Verify user has a booking for this schedule
      const userBookings = await storage.getBookingsByUser(req.user!.id);
      const hasBooking = userBookings.some(booking => 
        booking.schedule.id === reviewData.scheduleId && booking.status === "completed"
      );
      
      if (!hasBooking) {
        return res.status(403).json({ message: "You can only review buses you have traveled in" });
      }
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/reviews/:busId", async (req, res) => {
    try {
      const busId = parseInt(req.params.busId);
      const reviews = await storage.getReviewsByBus(busId);
      
      // Enhance reviews with user names
      const enhancedReviews = await Promise.all(
        reviews.map(async review => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            username: user ? user.name : "Anonymous"
          };
        })
      );
      
      res.json(enhancedReviews);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
