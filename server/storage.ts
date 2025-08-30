import {
  users,
  books,
  advertisements,
  adClicks,
  adImpressions,
  priceComparisons,
  storePrices,
  priceAlerts,
  events,
  eventAttendees,
  eventAlerts,
  type User,
  type UpsertUser,
  type Book,
  type InsertBook,
  type Advertisement,
  type InsertAdvertisement,
  type AdClick,
  type InsertAdClick,
  type AdImpression,
  type InsertAdImpression,
  type PriceComparison,
  type InsertPriceComparison,
  type StorePrice,
  type InsertStorePrice,
  type PriceAlert,
  type InsertPriceAlert,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or, gte, asc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Book operations
  getBooks(userId: string): Promise<Book[]>;
  getBook(id: string, userId: string): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: string, userId: string, updates: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: string, userId: string): Promise<boolean>;
  searchBooks(query: string, userId: string): Promise<Book[]>;
  getBooksByGenre(genre: string, userId: string): Promise<Book[]>;
  getWishlistBooks(userId: string): Promise<Book[]>;
  toggleWishlist(id: string, userId: string): Promise<Book | undefined>;
  getStats(userId: string): Promise<{
    totalBooks: number;
    wishlistCount: number;
    rareBooks: number;
    genreCount: number;
    genreDistribution: Record<string, number>;
  }>;

  // Advertisement operations
  getAdvertisementsByPosition(position: string): Promise<Advertisement[]>;
  addAdvertisement(ad: InsertAdvertisement): Promise<Advertisement>;
  trackAdClick(adClick: InsertAdClick): Promise<AdClick>;
  trackAdImpression(adImpression: InsertAdImpression): Promise<AdImpression>;
  getRevenueStats(): Promise<{
    totalRevenue: number;
    totalClicks: number;
    totalImpressions: number;
    activeAds: number;
    revenueGrowth: number;
    clickGrowth: number;
    impressionGrowth: number;
    newAdsThisMonth: number;
  }>;
  getTopPerformingAds(): Promise<any[]>;

  // Price comparison operations
  getPriceComparisons(): Promise<any[]>;
  createPriceComparison(data: any): Promise<any>;
  createStorePrice(data: any): Promise<any>;
  createPriceAlert(data: any): Promise<any>;
  getPriceAlerts(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Book operations
  async getBooks(userId: string): Promise<Book[]> {
    return db.select().from(books).where(eq(books.userId, userId)).orderBy(desc(books.createdAt));
  }

  async getBook(id: string, userId: string): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(and(eq(books.id, id), eq(books.userId, userId)));
    return book;
  }

  async createBook(book: InsertBook): Promise<Book> {
    const [newBook] = await db
      .insert(books)
      .values(book)
      .returning();
    return newBook;
  }

  async updateBook(id: string, userId: string, updates: Partial<InsertBook>): Promise<Book | undefined> {
    const [book] = await db
      .update(books)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(books.id, id), eq(books.userId, userId)))
      .returning();
    return book;
  }

  async deleteBook(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(books)
      .where(and(eq(books.id, id), eq(books.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async searchBooks(query: string, userId: string): Promise<Book[]> {
    const lowercaseQuery = `%${query.toLowerCase()}%`;
    return db
      .select()
      .from(books)
      .where(
        and(
          eq(books.userId, userId),
          or(
            ilike(books.title, lowercaseQuery),
            ilike(books.author, lowercaseQuery),
            ilike(books.genre, lowercaseQuery),
            ilike(books.description, lowercaseQuery)
          )
        )
      )
      .orderBy(desc(books.createdAt));
  }

  async getBooksByGenre(genre: string, userId: string): Promise<Book[]> {
    return db
      .select()
      .from(books)
      .where(and(eq(books.userId, userId), eq(books.genre, genre)))
      .orderBy(desc(books.createdAt));
  }

  async getWishlistBooks(userId: string): Promise<Book[]> {
    return db
      .select()
      .from(books)
      .where(and(eq(books.userId, userId), eq(books.isInWishlist, true)))
      .orderBy(desc(books.createdAt));
  }

  async toggleWishlist(id: string, userId: string): Promise<Book | undefined> {
    const book = await this.getBook(id, userId);
    if (!book) return undefined;

    const [updatedBook] = await db
      .update(books)
      .set({ 
        isInWishlist: !book.isInWishlist,
        updatedAt: new Date()
      })
      .where(and(eq(books.id, id), eq(books.userId, userId)))
      .returning();
    return updatedBook;
  }

  async getStats(userId: string): Promise<{
    totalBooks: number;
    wishlistCount: number;
    rareBooks: number;
    genreCount: number;
    genreDistribution: Record<string, number>;
  }> {
    const userBooks = await db.select().from(books).where(eq(books.userId, userId));
    const genreDistribution: Record<string, number> = {};
    
    userBooks.forEach(book => {
      genreDistribution[book.genre] = (genreDistribution[book.genre] || 0) + 1;
    });

    return {
      totalBooks: userBooks.length,
      wishlistCount: userBooks.filter(book => book.isInWishlist).length,
      rareBooks: userBooks.filter(book => book.isRare).length,
      genreCount: Object.keys(genreDistribution).length,
      genreDistribution,
    };
  }

  // Advertisement operations
  async getAdvertisementsByPosition(position: string): Promise<Advertisement[]> {
    return db
      .select()
      .from(advertisements)
      .where(and(eq(advertisements.position, position), eq(advertisements.isActive, true)))
      .orderBy(desc(advertisements.createdAt));
  }

  async addAdvertisement(adData: InsertAdvertisement): Promise<Advertisement> {
    const [ad] = await db
      .insert(advertisements)
      .values(adData)
      .returning();
    return ad;
  }

  async trackAdClick(clickData: InsertAdClick): Promise<AdClick> {
    const [click] = await db
      .insert(adClicks)
      .values(clickData)
      .returning();
    return click;
  }

  async trackAdImpression(impressionData: InsertAdImpression): Promise<AdImpression> {
    const [impression] = await db
      .insert(adImpressions)
      .values(impressionData)
      .returning();
    return impression;
  }

  async getRevenueStats(): Promise<{
    totalRevenue: number;
    totalClicks: number;
    totalImpressions: number;
    activeAds: number;
    revenueGrowth: number;
    clickGrowth: number;
    impressionGrowth: number;
    newAdsThisMonth: number;
  }> {
    // Get total clicks and impressions
    const totalClicks = await db.select().from(adClicks);
    const totalImpressions = await db.select().from(adImpressions);
    const activeAds = await db.select().from(advertisements).where(eq(advertisements.isActive, true));

    // Calculate revenue (simplified - in real app would join with ad costs)
    const totalRevenue = totalClicks.length * 50 + totalImpressions.length * 5; // 50 cents per click, 5 cents per impression

    // For now, return mock growth data - in real app would calculate from historical data
    return {
      totalRevenue,
      totalClicks: totalClicks.length,
      totalImpressions: totalImpressions.length,
      activeAds: activeAds.length,
      revenueGrowth: 15.2,
      clickGrowth: 8.7,
      impressionGrowth: 12.4,
      newAdsThisMonth: 3,
    };
  }

  async getTopPerformingAds(): Promise<any[]> {
    // This would typically be a complex query joining ads, clicks, and impressions
    // For now, return mock data structure
    const adsWithClicks = await db.select().from(advertisements).where(eq(advertisements.isActive, true));
    
    return adsWithClicks.map(ad => ({
      id: ad.id,
      title: ad.title,
      advertiser: ad.advertiser,
      position: ad.position,
      clicks: Math.floor(Math.random() * 100) + 10,
      impressions: Math.floor(Math.random() * 1000) + 100,
      revenue: Math.floor(Math.random() * 5000) + 500,
      ctr: (Math.random() * 5 + 1).toFixed(1),
    }));
  }

  // Price comparison operations
  async getPriceComparisons(): Promise<any[]> {
    const comparisons = await db.select().from(priceComparisons).orderBy(desc(priceComparisons.lastUpdated));
    
    const result = [];
    for (const comparison of comparisons) {
      const stores = await db.select().from(storePrices).where(eq(storePrices.comparisonId, comparison.id));
      result.push({
        ...comparison,
        stores: stores.map(store => ({
          ...store,
          price: store.price / 100, // Convert from cents
          shipping: (store.shipping || 0) / 100,
          totalPrice: store.totalPrice / 100,
        })),
        bestPrice: comparison.bestPrice / 100,
        averagePrice: comparison.averagePrice / 100,
        savings: comparison.savings / 100,
      });
    }
    
    return result;
  }

  async createPriceComparison(data: any): Promise<any> {
    const [comparison] = await db
      .insert(priceComparisons)
      .values(data)
      .returning();
    return comparison;
  }

  async createStorePrice(data: any): Promise<any> {
    const [price] = await db
      .insert(storePrices)
      .values(data)
      .returning();
    return price;
  }

  async createPriceAlert(data: any): Promise<any> {
    const [alert] = await db
      .insert(priceAlerts)
      .values(data)
      .returning();
    return alert;
  }

  async getPriceAlerts(userId: string): Promise<any[]> {
    const alerts = await db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
    
    return alerts.map(alert => ({
      ...alert,
      targetPrice: alert.targetPrice / 100, // Convert from cents
      currentPrice: alert.currentPrice ? alert.currentPrice / 100 : null,
    }));
  }

  async updatePriceAlert(id: string, userId: string, data: any): Promise<any> {
    const [alert] = await db
      .update(priceAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, userId)))
      .returning();
    return alert;
  }

  async deletePriceAlert(id: string, userId: string): Promise<void> {
    await db
      .delete(priceAlerts)
      .where(and(eq(priceAlerts.id, id), eq(priceAlerts.userId, userId)));
  }

  // Event operations
  async getEvents(): Promise<any[]> {
    const allEvents = await db.select().from(events)
      .where(and(eq(events.isActive, true), gte(events.startDate, new Date())))
      .orderBy(asc(events.startDate));
    
    return allEvents.map(event => ({
      ...event,
      price: event.price / 100, // Convert from cents
    }));
  }

  async getEventById(id: string): Promise<any> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return null;
    
    return {
      ...event,
      price: event.price / 100,
    };
  }

  async createEvent(eventData: any): Promise<any> {
    const [event] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return event;
  }

  async registerForEvent(eventId: string, userId: string): Promise<any> {
    // Check if already registered
    const [existing] = await db.select().from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));
    
    if (existing) {
      throw new Error("Already registered for this event");
    }

    // Check event capacity
    const event = await this.getEventById(eventId);
    if (event && event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      throw new Error("Event is full");
    }

    // Register user
    const [registration] = await db
      .insert(eventAttendees)
      .values({
        eventId,
        userId,
        status: "registered",
      })
      .returning();

    // Update attendee count
    await db
      .update(events)
      .set({ 
        currentAttendees: sql`${events.currentAttendees} + 1`,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));

    return registration;
  }

  async cancelEventRegistration(eventId: string, userId: string): Promise<void> {
    await db
      .delete(eventAttendees)
      .where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.userId, userId)));

    // Update attendee count
    await db
      .update(events)
      .set({ 
        currentAttendees: sql`${events.currentAttendees} - 1`,
        updatedAt: new Date()
      })
      .where(eq(events.id, eventId));
  }

  async getUserEvents(userId: string): Promise<any[]> {
    const userRegistrations = await db.select({
      event: events,
      registration: eventAttendees,
    })
    .from(eventAttendees)
    .innerJoin(events, eq(eventAttendees.eventId, events.id))
    .where(eq(eventAttendees.userId, userId))
    .orderBy(asc(events.startDate));

    return userRegistrations.map(({ event, registration }) => ({
      ...event,
      price: event.price / 100,
      registrationStatus: registration.status,
      registeredAt: registration.registeredAt,
    }));
  }
}

export const storage = new DatabaseStorage();
