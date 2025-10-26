import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertAttractionSchema, insertReviewSchema } from "@shared/schema";
import { generateToken, hashPassword, comparePasswords, authenticateToken, requireAdmin, type AuthRequest } from "./auth";
import { googleMapsService, calculateDistanceFromUser, getAccurateRatings } from "./services/google-maps";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password and create user
      const hashedPassword = hashPassword(userData.password);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate token
      const token = generateToken(user.id, user.email, user.role);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          favorites: user.favorites,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(credentials.email);
      if (!user || !comparePasswords(credentials.password, user.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id, user.email, user.role);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          favorites: user.favorites,
        },
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        favorites: user.favorites,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Attraction routes
  app.get("/api/attractions", async (req, res) => {
    try {
      const attractions = await storage.getAllAttractions();
      res.json(attractions);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get attractions" });
    }
  });

  // Nearby search (currently supports attractions)
  app.get("/api/nearby", async (req, res) => {
    try {
      const { lat, lng, type = "attraction", radiusKm = "5" } = req.query as Record<string, string>;
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radius = Math.max(0, parseFloat(radiusKm));

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return res.status(400).json({ message: "lat and lng are required as numbers" });
      }

      function toRad(d: number) { return (d * Math.PI) / 180; }
      function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
        const R = 6371; // km
        const dLat = toRad(b.lat - a.lat);
        const dLng = toRad(b.lng - a.lng);
        const lat1 = toRad(a.lat);
        const lat2 = toRad(b.lat);
        const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
      }

      if (type === "attraction") {
        const all = await storage.getAllAttractions();
        const center = { lat: latitude, lng: longitude };
        const nearby = all
          .map((a) => ({
            ...a,
            distanceKm: haversineKm(center, { lat: a.location.lat, lng: a.location.lng }),
          }))
          .filter((a) => a.distanceKm <= radius)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 12);
        return res.json(nearby);
      }

      return res.status(400).json({ message: "Unsupported type. Use type=attraction." });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to search nearby" });
    }
  });

  // Development-only: reseed in-memory data without restart
  app.post("/api/dev/reseed", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({ message: "Forbidden" });
      }
      storage.resetAndSeed();
      res.json({ message: "Reseeded in-memory data" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to reseed" });
    }
  });

  app.get("/api/attractions/:id", async (req, res) => {
    try {
      const attraction = await storage.getAttraction(req.params.id);
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get attraction" });
    }
  });

  app.post("/api/attractions", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const attractionData = insertAttractionSchema.parse(req.body);
      const attraction = await storage.createAttraction(attractionData);
      res.status(201).json(attraction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create attraction" });
    }
  });

  app.put("/api/attractions/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const attractionData = insertAttractionSchema.partial().parse(req.body);
      const attraction = await storage.updateAttraction(req.params.id, attractionData);
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update attraction" });
    }
  });

  app.delete("/api/attractions/:id", authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
      const success = await storage.deleteAttraction(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json({ message: "Attraction deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete attraction" });
    }
  });

  // Review routes
  app.get("/api/reviews/:attractionId", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByAttraction(req.params.attractionId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get reviews" });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create review" });
    }
  });

  // User favorites routes
  app.get("/api/users/:id/favorites", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const favorites = await Promise.all(
        (user.favorites || []).map((id) => storage.getAttraction(id))
      );

      res.json(favorites.filter((a) => a !== undefined));
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get favorites" });
    }
  });

  app.post("/api/users/:id/favorites", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user!.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { attractionId } = req.body;
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const favorites = user.favorites || [];
      if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        await storage.updateUserFavorites(req.params.id, favorites);
      }

      res.json({ favorites });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add favorite" });
    }
  });

  app.delete("/api/users/:id/favorites/:attractionId", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (req.user!.id !== req.params.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const favorites = (user.favorites || []).filter((id) => id !== req.params.attractionId);
      await storage.updateUserFavorites(req.params.id, favorites);

      res.json({ favorites });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to remove favorite" });
    }
  });

  app.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get reviews" });
    }
  });

  // Distance calculation routes
  app.post("/api/attractions/:id/distance", async (req, res) => {
    try {
      const { userLocation, mode = 'driving' } = req.body;
      const attraction = await storage.getAttraction(req.params.id);
      
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }

      if (!userLocation || !userLocation.lat || !userLocation.lng) {
        return res.status(400).json({ message: "User location is required" });
      }

      const distanceResult = await calculateDistanceFromUser(
        userLocation,
        attraction.location,
        mode
      );

      res.json({
        attractionId: attraction.id,
        attractionName: attraction.name,
        distance: distanceResult.distance,
        duration: distanceResult.duration,
        mode: distanceResult.mode,
        userLocation,
        attractionLocation: attraction.location
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to calculate distance" });
    }
  });

  // Get accurate ratings for attractions
  app.get("/api/attractions/:id/ratings", async (req, res) => {
    try {
      const attraction = await storage.getAttraction(req.params.id);
      
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }

      const ratings = await getAccurateRatings(attraction.name, attraction.location);
      
      res.json({
        attractionId: attraction.id,
        attractionName: attraction.name,
        rating: ratings.rating,
        reviewCount: ratings.reviewCount,
        currentRating: attraction.averageRating,
        currentReviewCount: attraction.reviewCount
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get ratings" });
    }
  });

  // Get nearby attractions with accurate distances
  app.post("/api/attractions/nearby", async (req, res) => {
    try {
      const { userLocation, radius = 50, limit = 20 } = req.body; // radius in km, limit number of results
      
      if (!userLocation || !userLocation.lat || !userLocation.lng) {
        return res.status(400).json({ message: "User location is required" });
      }

      const allAttractions = await storage.getAllAttractions();
      const nearbyAttractions = [];

      for (const attraction of allAttractions) {
        const distanceResult = await calculateDistanceFromUser(
          userLocation,
          attraction.location,
          'driving'
        );

        if (distanceResult.distance <= radius) {
          nearbyAttractions.push({
            ...attraction,
            calculatedDistance: distanceResult.distance,
            calculatedDuration: distanceResult.duration
          });
        }
      }

      // Sort by distance and limit results
      nearbyAttractions.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
      const limitedResults = nearbyAttractions.slice(0, limit);

      res.json({
        userLocation,
        radius,
        count: limitedResults.length,
        attractions: limitedResults
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to get nearby attractions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
