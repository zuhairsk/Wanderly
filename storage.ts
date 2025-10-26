import { type User, type InsertUser, type Attraction, type InsertAttraction, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserFavorites(userId: string, favorites: string[]): Promise<void>;

  // Attraction operations
  getAllAttractions(): Promise<Attraction[]>;
  getAttraction(id: string): Promise<Attraction | undefined>;
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;
  updateAttraction(id: string, attraction: Partial<InsertAttraction>): Promise<Attraction | undefined>;
  deleteAttraction(id: string): Promise<boolean>;

  // Review operations
  getReviewsByAttraction(attractionId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateAttractionRating(attractionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private attractions: Map<string, Attraction>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.attractions = new Map();
    this.reviews = new Map();
    this.seedData();
  }

  // Dev utility: clear all and reseed
  public resetAndSeed(): void {
    this.users.clear();
    this.attractions.clear();
    this.reviews.clear();
    this.seedData();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserFavorites(userId: string, favorites: string[]): Promise<void> {
    const user = this.users.get(userId);
    if (!user) return;
    user.favorites = [...favorites];
    this.users.set(userId, user);
  }

  // Attraction operations
  async getAllAttractions(): Promise<Attraction[]> {
    return Array.from(this.attractions.values());
  }

  async getAttraction(id: string): Promise<Attraction | undefined> {
    return this.attractions.get(id);
  }

  async createAttraction(insertAttraction: InsertAttraction): Promise<Attraction> {
    const id = randomUUID();
    const attraction: Attraction = {
      ...insertAttraction,
      id,
      images: insertAttraction.images ? [...insertAttraction.images] : [],
      amenities: insertAttraction.amenities ? [...insertAttraction.amenities] : [],
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date(),
    };
    this.attractions.set(id, attraction);
    return attraction;
  }

  async updateAttraction(id: string, updates: Partial<InsertAttraction>): Promise<Attraction | undefined> {
    const attraction = this.attractions.get(id);
    if (!attraction) return undefined;

    const updated: Attraction = {
      ...attraction,
      ...updates,
      images: updates.images ? [...updates.images] : attraction.images,
      amenities: updates.amenities ? [...updates.amenities] : attraction.amenities,
    };
    this.attractions.set(id, updated);
    return updated;
  }

  async deleteAttraction(id: string): Promise<boolean> {
    return this.attractions.delete(id);
  }

  // Review operations
  async getReviewsByAttraction(attractionId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((review) => review.attractionId === attractionId);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((review) => review.userId === userId);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    await this.updateAttractionRating(insertReview.attractionId);
    return review;
  }

  async updateAttractionRating(attractionId: string): Promise<void> {
    const attraction = this.attractions.get(attractionId);
    if (!attraction) return;

    const reviews = await this.getReviewsByAttraction(attractionId);
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    attraction.averageRating = averageRating;
    attraction.reviewCount = reviews.length;
    this.attractions.set(attractionId, attraction);
  }

  // Seed data
  private seedData(): void {
    // Create admin user
    const adminId = randomUUID();
    this.users.set(adminId, {
      id: adminId,
      username: "admin",
      email: "admin@wanderly.com",
      password: "hashed_admin123", // In real app, use bcrypt
      role: "admin",
      favorites: [],
      createdAt: new Date(),
    });

    // Load comprehensive Indian attractions data from JSON
    try {
      const jsonPath = join(process.cwd(), 'server', 'data', 'indian-attractions.json');
      const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
      
      // Convert JSON data to InsertAttraction format and add ratings
      const attractionsData: InsertAttraction[] = jsonData.attractions.map((attr: any) => ({
        name: attr.name,
        category: attr.category,
        description: attr.description,
        location: attr.location,
        images: attr.images,
        price: attr.price,
        distance: attr.distance,
        hours: attr.hours,
        phone: attr.phone,
        website: attr.website,
        amenities: attr.amenities,
        travelInfo: attr.travelInfo,
      }));

      // Add attractions with ratings from JSON
      attractionsData.forEach((data, index) => {
        const id = randomUUID();
        const jsonAttr = jsonData.attractions[index]; // Use index instead of find
        
        // Get rating from JSON or use a default
        const jsonRating = jsonAttr?.rating || 4.0;
        const jsonReviewCount = jsonAttr?.reviewCount || Math.floor(Math.random() * 2000) + 500;
        
        this.attractions.set(id, {
          id,
          name: data.name,
          category: data.category,
          description: data.description,
          location: data.location,
          images: data.images ? [...data.images] : [],
          price: data.price,
          distance: data.distance,
          hours: data.hours ?? null,
          phone: data.phone ?? null,
          website: data.website ?? null,
          amenities: data.amenities ? [...data.amenities] : [],
          travelInfo: data.travelInfo ?? null,
          averageRating: jsonRating, // Use rating from JSON
          reviewCount: jsonReviewCount, // Use review count from JSON
          createdAt: new Date(),
        });
      });

      console.log(`✅ Loaded ${attractionsData.length} Indian attractions with ratings and reviews`);

    } catch (error) {
      console.error('❌ Error loading JSON data:', error);
      
      // Fallback to basic data if JSON loading fails
      const fallbackAttractions: InsertAttraction[] = [
        {
          name: "Red Fort (Lal Qila)",
          category: "historic",
          description: "UNESCO World Heritage Site - Mughal emperor's residence and symbol of India's independence.",
          location: { lat: 28.6562, lng: 77.2410, address: "Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi" },
          images: ["https://images.unsplash.com/photo-1603261206756-3ea0f3f94a5a?auto=format&fit=crop&w=800&h=600&q=60"],
          price: "$$",
          distance: 0,
          hours: "Tue-Sun: 9:30 AM - 4:30 PM",
          phone: "+91-11-23277705",
          website: "www.redfort.gov.in",
          amenities: ["Museum", "Guided Tours", "Parking", "Audio Guide"],
          travelInfo: {
            fromLocation: "New Delhi Railway Station",
            options: [
              {
                mode: "Metro",
                duration: "25 minutes",
                cost: "₹20-40",
                companies: ["Delhi Metro"],
                recommended: true,
                pros: "Fast and efficient",
                cons: "Walking required from station"
              }
            ],
            bestOption: {
              mode: "Metro",
              reason: "Best balance of cost, time, and convenience",
              estimatedCost: "₹30"
            }
          }
        }
      ];

      fallbackAttractions.forEach((data) => {
        const id = randomUUID();
        this.attractions.set(id, {
          id,
          name: data.name,
          category: data.category,
          description: data.description,
          location: data.location,
          images: data.images ? [...data.images] : [],
          price: data.price,
          distance: data.distance,
          hours: data.hours ?? null,
          phone: data.phone ?? null,
          website: data.website ?? null,
          amenities: data.amenities ? [...data.amenities] : [],
          travelInfo: data.travelInfo ?? null,
          averageRating: 4.3,
          reviewCount: 12500,
          createdAt: new Date(),
        });
      });
    }

    // Add some sample reviews
    const attractionIds = Array.from(this.attractions.keys());
    if (attractionIds.length > 0) {
      const sampleReviews: InsertReview[] = [
        {
          userId: adminId,
          attractionId: attractionIds[0],
          rating: 5,
          comment: "Absolutely stunning! The architecture is magnificent and the history is fascinating. Perfect for a day trip with family.",
        },
        {
          userId: adminId,
          attractionId: attractionIds[0],
          rating: 4.5,
          comment: "Beautiful monument with amazing photo opportunities. The guided tour was very informative.",
        },
      ];

      sampleReviews.forEach((data) => {
        const id = randomUUID();
        this.reviews.set(id, {
          ...data,
          id,
          createdAt: new Date(),
        });
      });

      // Don't update ratings for seeded reviews since we already set them from JSON
      // attractionIds.forEach((id) => {
      //   const attraction = this.attractions.get(id);
      //   if (attraction && attraction.averageRating === 0) {
      //     // Only update if no rating was set from JSON
      //     this.updateAttractionRating(id);
      //   }
      // });
    }
  }
}

export const storage = new MemStorage();
