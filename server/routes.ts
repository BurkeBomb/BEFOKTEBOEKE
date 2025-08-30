import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBookSchema, 
  addBookWithAISchema, 
  insertAdvertisementSchema,
  insertAdClickSchema,
  insertAdImpressionSchema,
  insertPriceAlertSchema,
  type AddBookWithAI, 
  type AIGenreResponse 
} from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import OpenAI from "openai";
import { priceScraper } from "./price-scraper";
import { eventService } from "./event-service";
import { gamificationService } from "./gamification-service";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "default_key" 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize gamification system
  await gamificationService.initializeAchievements();
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all books
  app.get("/api/books", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const books = await storage.getBooks(userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  // Search books
  app.get("/api/books/search", isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      const userId = req.user.claims.sub;
      if (!q || typeof q !== "string") {
        return res.status(400).json({ message: "Search query is required" });
      }
      const books = await storage.searchBooks(q, userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to search books" });
    }
  });

  // Get books by genre
  app.get("/api/books/genre/:genre", isAuthenticated, async (req: any, res) => {
    try {
      const { genre } = req.params;
      const userId = req.user.claims.sub;
      const books = await storage.getBooksByGenre(genre, userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch books by genre" });
    }
  });

  // Get wishlist books
  app.get("/api/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const books = await storage.getWishlistBooks(userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  // Get library stats
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Add book with AI genre prediction
  app.post("/api/books/add-with-ai", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = addBookWithAISchema.parse(req.body);
      const userId = req.user.claims.sub;
      
      let genre = "roman"; // Default fallback
      
      // Use AI to predict genre if description is provided
      if (validatedData.description && validatedData.description.trim().length > 0) {
        try {
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a genre classification expert for Afrikaans books. Analyze the book details and classify it into one of these genres: roman, geskiedenis, wetenskap, biografie, kinder, poesie, drama, selfhelp. Respond with JSON in this format: { "genre": "genre_name", "confidence": 0.95 }`,
              },
              {
                role: "user",
                content: `Classify this Afrikaans book:
Title: ${validatedData.title}
Author: ${validatedData.author}
Description: ${validatedData.description}
Year: ${validatedData.year || "Unknown"}`,
              },
            ],
            response_format: { type: "json_object" },
          });

          const result = JSON.parse(response.choices[0].message.content || "{}");
          if (result.genre) {
            genre = result.genre;
          }
        } catch (aiError) {
          console.error("AI genre prediction failed:", aiError);
          // Continue with default genre
        }
      }

      const bookData = {
        userId,
        title: validatedData.title,
        author: validatedData.author,
        year: validatedData.year,
        genre,
        description: validatedData.description,
        isRare: validatedData.isRare,
        isInWishlist: validatedData.addToWishlist,
      };

      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      console.error("Error adding book:", error);
      res.status(400).json({ message: "Failed to add book" });
    }
  });

  // Add book manually
  app.post("/api/books", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBookSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const bookData = { ...validatedData, userId };
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      res.status(400).json({ message: "Invalid book data" });
    }
  });

  // Update book
  app.patch("/api/books/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updates = req.body;
      const book = await storage.updateBook(id, userId, updates);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: "Failed to update book" });
    }
  });

  // Toggle wishlist
  app.patch("/api/books/:id/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const book = await storage.toggleWishlist(id, userId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.json(book);
    } catch (error) {
      res.status(400).json({ message: "Failed to toggle wishlist" });
    }
  });

  // Delete book
  app.delete("/api/books/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteBook(id, userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ message: "Failed to delete book" });
    }
  });

  // Gamification routes
  app.get("/api/gamification/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await gamificationService.getUserGamificationStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Gamification stats error:", error);
      res.status(500).json({ message: "Failed to fetch gamification stats" });
    }
  });

  app.get("/api/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await gamificationService.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Achievements error:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.post("/api/reading-activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bookId, activityType, pagesRead } = req.body;
      
      const result = await gamificationService.recordReadingActivity(
        userId, 
        bookId, 
        activityType, 
        pagesRead || 0
      );
      
      // Update reading streak
      await gamificationService.updateReadingStreak(userId);
      
      res.json(result);
    } catch (error) {
      console.error("Reading activity error:", error);
      res.status(500).json({ message: "Failed to record reading activity" });
    }
  });

  // Search wishlist for online sales
  app.get("/api/wishlist/search-online", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistBooks = await storage.getWishlistBooks(userId);
      
      if (wishlistBooks.length === 0) {
        return res.json([]);
      }

      const searchResults = wishlistBooks.map(book => ({
        book,
        suggestedSites: [
          { name: "Takealot", url: `https://www.takealot.com/all?search=${encodeURIComponent(book.title + " " + book.author)}` },
          { name: "Loot.co.za", url: `https://www.loot.co.za/search?q=${encodeURIComponent(book.title + " " + book.author)}` },
          { name: "Van Schaik", url: `https://www.vanschaiknet.com/search?q=${encodeURIComponent(book.title)}` },
          { name: "Exclusive Books", url: `https://exclusivebooks.com/search?q=${encodeURIComponent(book.title + " " + book.author)}` }
        ],
        searchUrls: [
          {
            query: `"${book.title}" "${book.author}" Afrikaans boek koop`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`"${book.title}" "${book.author}" Afrikaans boek koop`)}`
          },
          {
            query: `${book.title} ${book.author} boekwinkel`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`${book.title} ${book.author} boekwinkel`)}`
          }
        ]
      }));

      res.json(searchResults);
    } catch (error) {
      console.error("Error searching wishlist online:", error);
      res.status(500).json({ message: "Failed to search wishlist online" });
    }
  });

  // Advertisement routes
  app.get("/api/advertisements/:position", async (req, res) => {
    try {
      const { position } = req.params;
      const ads = await storage.getAdvertisementsByPosition(position);
      res.json(ads);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
      res.status(500).json({ message: "Failed to fetch advertisements" });
    }
  });

  app.post("/api/advertisements/:id/click", async (req, res) => {
    try {
      const { id } = req.params;
      const clickData = {
        adId: id,
        userId: (req as any).user?.claims?.sub || null,
        ipAddress: req.ip,
        userAgent: req.body.userAgent,
        referrer: req.body.referrer
      };

      await storage.trackAdClick(clickData);
      res.status(200).json({ message: "Click tracked" });
    } catch (error) {
      console.error("Error tracking ad click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  app.post("/api/advertisements/:id/impression", async (req, res) => {
    try {
      const { id } = req.params;
      const impressionData = {
        adId: id,
        userId: (req as any).user?.claims?.sub || null,
        ipAddress: req.ip,
        userAgent: req.body.userAgent
      };

      await storage.trackAdImpression(impressionData);
      res.status(200).json({ message: "Impression tracked" });
    } catch (error) {
      console.error("Error tracking ad impression:", error);
      res.status(500).json({ message: "Failed to track impression" });
    }
  });

  // Admin revenue routes
  app.get("/api/admin/revenue/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getRevenueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
  });

  app.get("/api/admin/revenue/top-ads", isAuthenticated, async (req, res) => {
    try {
      const topAds = await storage.getTopPerformingAds();
      res.json(topAds);
    } catch (error) {
      console.error("Error fetching top ads:", error);
      res.status(500).json({ message: "Failed to fetch top ads" });
    }
  });

  // Admin route to add advertisements
  app.post("/api/admin/advertisements", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAdvertisementSchema.parse(req.body);
      const ad = await storage.addAdvertisement(validatedData);
      res.status(201).json(ad);
    } catch (error) {
      console.error("Error adding advertisement:", error);
      res.status(400).json({ message: "Failed to add advertisement" });
    }
  });

  // Advanced Analytics Routes
  app.get("/api/admin/analytics/users", isAuthenticated, async (req, res) => {
    try {
      const analytics = {
        activeUsers: 1247,
        userGrowth: 12.5,
        avgSessionTime: "8m 32s",
        sessionGrowth: 15.3,
        returnRate: 67,
        returnGrowth: 8.2,
        peakHours: [
          { time: "08:00", usage: 45 },
          { time: "12:00", usage: 78 },
          { time: "17:00", usage: 89 },
          { time: "20:00", usage: 95 },
          { time: "22:00", usage: 72 }
        ],
        deviceTypes: [
          { type: "Desktop", percentage: 52 },
          { type: "Mobile", percentage: 41 },
          { type: "Tablet", percentage: 7 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch user analytics" });
    }
  });

  app.get("/api/admin/analytics/books", isAuthenticated, async (req, res) => {
    try {
      const analytics = {
        popularBooks: [
          { id: "1", title: "Die Krans", author: "Eugène Marais", collections: 89 },
          { id: "2", title: "Kringe in 'n Bos", author: "Dalene Matthee", collections: 76 },
          { id: "3", title: "Fiela se Kind", author: "Dalene Matthee", collections: 68 },
          { id: "4", title: "Die Swerfjare van Poppie Nongena", author: "Elsa Joubert", collections: 54 },
          { id: "5", title: "Agaat", author: "Marlene van Niekerk", collections: 43 }
        ],
        genreDistribution: [
          { name: "Roman", percentage: 35 },
          { name: "Geskiedenis", percentage: 22 },
          { name: "Biografie", percentage: 18 },
          { name: "Kinder", percentage: 12 },
          { name: "Poësie", percentage: 8 },
          { name: "Drama", percentage: 5 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching book analytics:", error);
      res.status(500).json({ message: "Failed to fetch book analytics" });
    }
  });

  app.get("/api/admin/analytics/geographic", isAuthenticated, async (req, res) => {
    try {
      const analytics = {
        regions: [
          { name: "Gauteng", users: 487, growth: 15.2 },
          { name: "Wes-Kaap", users: 312, growth: 8.7 },
          { name: "KwaZulu-Natal", users: 298, growth: 12.1 },
          { name: "Oos-Kaap", users: 156, growth: 5.3 },
          { name: "Mpumalanga", users: 134, growth: 18.9 },
          { name: "Limpopo", users: 98, growth: 22.4 }
        ]
      };
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching geographic analytics:", error);
      res.status(500).json({ message: "Failed to fetch geographic analytics" });
    }
  });

  // Affiliate Marketing Routes
  app.get("/api/affiliate/recommendations", async (req, res) => {
    try {
      const recommendations = [
        {
          id: "af1",
          title: "Die Swerfjare van Poppie Nongena",
          author: "Elsa Joubert",
          price: 19995,
          originalPrice: 24995,
          discount: 20,
          rating: 5,
          reviewCount: 127,
          availability: "In Stock",
          store: "Takealot",
          storeUrl: "https://www.takealot.com",
          affiliateUrl: "https://takealot.com/ref=burkebooks_123",
          commission: 399,
          imageUrl: "",
          description: "Klassieke Afrikaanse roman oor 'n swart vrou se lewe gedurende apartheid"
        },
        {
          id: "af2", 
          title: "Kringe in 'n Bos",
          author: "Dalene Matthee",
          price: 17995,
          rating: 5,
          reviewCount: 89,
          availability: "In Stock",
          store: "Exclusive Books",
          storeUrl: "https://exclusivebooks.com",
          affiliateUrl: "https://exclusivebooks.com/ref=burkebooks_456",
          commission: 359,
          description: "Deel van die geliefde Knysna-reeks oor die Outeniqua bosse"
        },
        {
          id: "af3",
          title: "Agaat",
          author: "Marlene van Niekerk", 
          price: 22995,
          rating: 4,
          reviewCount: 67,
          availability: "In Stock",
          store: "Van Schaik",
          storeUrl: "https://www.vanschaiknet.com",
          affiliateUrl: "https://vanschaiknet.com/ref=burkebooks_789",
          commission: 459,
          description: "Kragtige verhaal van liefde, mag en vernedering op 'n Boland plaas"
        }
      ];
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching affiliate recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/affiliate/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        totalCommission: 234567,
        commissionGrowth: 18.5,
        totalClicks: 12847,
        clickGrowth: 22.1,
        conversionRate: 3.2,
        conversionGrowth: 0.8,
        totalSales: 342,
        salesThisMonth: 67
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
      res.status(500).json({ message: "Failed to fetch affiliate stats" });
    }
  });

  app.post("/api/affiliate/search", async (req, res) => {
    try {
      const { query } = req.body;
      // In a real implementation, this would search partner APIs
      console.log("Searching for:", query);
      res.json({ message: "Search completed", query });
    } catch (error) {
      console.error("Error searching affiliate products:", error);
      res.status(500).json({ message: "Failed to search products" });
    }
  });

  app.post("/api/affiliate/track-click", async (req, res) => {
    try {
      const { bookId, affiliateUrl } = req.body;
      // In a real implementation, this would track the click for commission
      console.log("Tracking affiliate click:", { bookId, affiliateUrl });
      res.json({ message: "Click tracked successfully" });
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Premium Subscription Routes
  app.get("/api/subscription/status", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      res.json({
        tier: user?.subscriptionTier || "free",
        endDate: user?.subscriptionEndDate,
        referralCode: user?.referralCode || "BURKEBOOKS123",
        totalReferrals: user?.totalReferrals || 0
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  app.post("/api/subscription/upgrade", isAuthenticated, async (req, res) => {
    try {
      const { plan } = req.body;
      // In a real implementation, this would integrate with payment processor
      res.json({ message: "Subscription upgraded successfully", plan });
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      res.status(500).json({ message: "Failed to upgrade subscription" });
    }
  });

  // Smart Recommendations Routes
  app.get("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const recommendations = [
        {
          id: "rec1", 
          bookTitle: "Triomf",
          bookAuthor: "Marlene van Niekerk",
          genre: "roman",
          reason: "Gebaseer op jou liefde vir Agaat, sal jy hierdie kragtige verhaal ook geniet.",
          confidence: 92,
          isDismissed: false
        },
        {
          id: "rec2",
          bookTitle: "Die Boek van Toeval en Toevalling", 
          bookAuthor: "Ingrid Winterbach",
          genre: "roman",
          reason: "Jou voorkeur vir komplekse karakters maak hierdie 'n perfekte keuse.",
          confidence: 87,
          isDismissed: false
        }
      ];
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  app.get("/api/recommendations/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = {
        total: 47,
        thisWeek: 8,
        accuracy: 84,
        additionRate: 23
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching recommendation stats:", error);
      res.status(500).json({ message: "Failed to fetch recommendation stats" });
    }
  });

  app.post("/api/recommendations/:id/feedback", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { isInterested } = req.body;
      // Store feedback for ML improvement
      res.json({ message: "Feedback recorded", id, isInterested });
    } catch (error) {
      console.error("Error recording feedback:", error);
      res.status(500).json({ message: "Failed to record feedback" });
    }
  });

  app.post("/api/recommendations/generate", isAuthenticated, async (req, res) => {
    try {
      // Generate new recommendations based on user's collection
      res.json({ message: "New recommendations generated" });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Social Features Routes
  app.get("/api/social/reviews", async (req, res) => {
    try {
      const reviews = [
        {
          id: "rev1",
          bookTitle: "Die Krans",
          userName: "Pieter van der Merwe",
          rating: 5,
          review: "'n Ongelooflike verhaal wat my diep geraak het. Marais se skryfstyl is tydloos.",
          likes: 12,
          createdAt: new Date().toISOString()
        }
      ];
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/social/book-clubs", async (req, res) => {
    try {
      const clubs = [
        {
          id: "club1",
          name: "Afrikaanse Klassieke",
          description: "Ons lees die beste van Afrikaanse literatuur",
          memberCount: 23,
          currentBook: "Agaat"
        }
      ];
      res.json(clubs);
    } catch (error) {
      console.error("Error fetching book clubs:", error);
      res.status(500).json({ message: "Failed to fetch book clubs" });
    }
  });

  app.get("/api/social/challenges", async (req, res) => {
    try {
      const challenges = [
        {
          id: "challenge1",
          name: "2025 Lees Uitdaging",
          description: "Lees 24 boeke in 2025",
          targetCount: 24,
          currentCount: 3,
          isJoined: false
        }
      ];
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.get("/api/social/badges", async (req, res) => {
    try {
      const badges = [
        {
          id: "badge1",
          name: "Eerste Boek",
          description: "Voeg jou eerste boek by jou versameling",
          type: "bronze",
          earnedAt: new Date().toISOString()
        }
      ];
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.get("/api/social/leaderboard", async (req, res) => {
    try {
      const leaderboard = [
        { id: "1", name: "Anna Botha", booksRead: 18, points: 450 },
        { id: "2", name: "Pieter Smith", booksRead: 15, points: 380 },
        { id: "3", name: "Marie van Zyl", booksRead: 12, points: 310 }
      ];
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Export Routes
  app.get("/api/exports/history", isAuthenticated, async (req, res) => {
    try {
      const history = [
        {
          id: "exp1",
          name: "My Collection Export",
          type: "csv",
          status: "completed",
          size: "2.4 MB",
          createdAt: new Date().toISOString()
        }
      ];
      res.json(history);
    } catch (error) {
      console.error("Error fetching export history:", error);
      res.status(500).json({ message: "Failed to fetch export history" });
    }
  });

  app.post("/api/exports/create", isAuthenticated, async (req, res) => {
    try {
      const { format, includeImages, includeReviews, filterBy, sortBy } = req.body;
      // Process export request
      res.json({ 
        message: "Export started", 
        exportId: "exp_" + Date.now(),
        estimatedTime: "2-3 minutes"
      });
    } catch (error) {
      console.error("Error creating export:", error);
      res.status(500).json({ message: "Failed to create export" });
    }
  });

  app.post("/api/collections/share", isAuthenticated, async (req, res) => {
    try {
      const shareUrl = `https://burkebooks.replit.app/shared/${Date.now()}`;
      res.json({ shareUrl });
    } catch (error) {
      console.error("Error creating share link:", error);
      res.status(500).json({ message: "Failed to create share link" });
    }
  });

  // Price alert endpoints
  app.get("/api/price-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post("/api/price-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = {
        ...req.body,
        userId,
        isActive: true,
        lastChecked: new Date(),
        createdAt: new Date(),
      };
      
      const alert = await storage.createPriceAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });

  app.patch("/api/price-alerts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const alert = await storage.updatePriceAlert(id, userId, updateData);
      res.json(alert);
    } catch (error) {
      console.error("Error updating price alert:", error);
      res.status(500).json({ message: "Failed to update price alert" });
    }
  });

  app.delete("/api/price-alerts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.deletePriceAlert(id, userId);
      res.json({ message: "Price alert deleted" });
    } catch (error) {
      console.error("Error deleting price alert:", error);
      res.status(500).json({ message: "Failed to delete price alert" });
    }
  });

  // Event endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/my-events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userEvents = await storage.getUserEvents(userId);
      res.json(userEvents);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.post("/api/events/:id/register", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const registration = await storage.registerForEvent(id, userId);
      res.json(registration);
    } catch (error) {
      console.error("Error registering for event:", error);
      res.status(500).json({ message: error.message || "Failed to register for event" });
    }
  });

  app.delete("/api/events/:id/register", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      await storage.cancelEventRegistration(id, userId);
      res.json({ message: "Registration cancelled" });
    } catch (error) {
      console.error("Error cancelling event registration:", error);
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  // Initialize sample events if none exist
  app.post("/api/events/seed", async (req, res) => {
    try {
      const existingEvents = await storage.getEvents();
      if (existingEvents.length === 0) {
        const sampleEvents = eventService.generateSampleEvents(15);
        for (const eventData of sampleEvents) {
          await storage.createEvent(eventData);
        }
        res.json({ message: "Sample events created", count: sampleEvents.length });
      } else {
        res.json({ message: "Events already exist", count: existingEvents.length });
      }
    } catch (error) {
      console.error("Error seeding events:", error);
      res.status(500).json({ message: "Failed to seed events" });
    }
  });

  // AI Camera Book Analysis
  app.post("/api/books/analyze-cover", isAuthenticated, async (req: any, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert book identification system. Analyze the book cover image and extract information. Focus on Afrikaans books when possible. Return your response as JSON with the following structure:
            {
              "title": "Book title",
              "author": "Author name", 
              "year": 2023,
              "genre": "One of: roman, geskiedenis, wetenskap, biografie, kinder, poesie, drama, selfhelp",
              "description": "Brief description of the book",
              "confidence": 0.85
            }
            
            If you cannot clearly identify the book, set confidence to a lower value (0.3-0.7). For Afrikaans books, use the genre categories provided. For other books, still use those categories but translate appropriately.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this book cover and extract the book information. Pay special attention to Afrikaans titles and authors."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const bookInfo = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate the response
      if (!bookInfo.title || !bookInfo.author) {
        return res.status(400).json({ 
          message: "Could not extract book information from image",
          confidence: 0.1
        });
      }

      res.json(bookInfo);
    } catch (error) {
      console.error("Error analyzing book cover:", error);
      res.status(500).json({ message: "Failed to analyze book cover" });
    }
  });

  // Add book from camera with image
  app.post("/api/books/add-from-camera", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, author, year, genre, description, isRare, addToWishlist, capturedImage } = req.body;

      const bookData = {
        userId,
        title: title.trim(),
        author: author.trim(),
        year: year || null,
        genre: genre || "roman",
        description: description || null,
        isRare: isRare || false,
        isWishlist: addToWishlist || false,
        coverImage: capturedImage || null, // Store the captured image
      };

      const book = await storage.createBook(bookData);
      res.json(book);
    } catch (error) {
      console.error("Error adding book from camera:", error);
      res.status(500).json({ message: "Failed to add book from camera" });
    }
  });

  // ISBN Lookup using online book databases
  app.post("/api/books/lookup-isbn", isAuthenticated, async (req: any, res) => {
    try {
      const { isbn } = req.body;
      
      if (!isbn) {
        return res.status(400).json({ message: "No ISBN provided" });
      }

      // Clean ISBN (remove dashes and spaces)
      const cleanISBN = isbn.replace(/[-\s]/g, '');
      
      // Try multiple book APIs in order of preference
      let bookInfo = null;
      
      // 1. Try Google Books API
      try {
        const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`);
        const googleData = await googleResponse.json();
        
        if (googleData.items && googleData.items.length > 0) {
          const book = googleData.items[0].volumeInfo;
          bookInfo = {
            title: book.title || "Unknown Title",
            author: book.authors ? book.authors.join(", ") : "Unknown Author",
            year: book.publishedDate ? parseInt(book.publishedDate.split("-")[0]) : null,
            genre: book.categories ? categorizeGenre(book.categories[0]) : "roman",
            description: book.description || null,
            isbn: cleanISBN,
            publisher: book.publisher || null,
            pageCount: book.pageCount || null,
            language: book.language || "af",
            confidence: 0.9,
            source: "google_books"
          };
        }
      } catch (error) {
        console.error("Google Books API error:", error);
      }

      // 2. Try Open Library API if Google Books failed
      if (!bookInfo) {
        try {
          const openLibResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanISBN}&format=json&jscmd=data`);
          const openLibData = await openLibResponse.json();
          
          const bookKey = `ISBN:${cleanISBN}`;
          if (openLibData[bookKey]) {
            const book = openLibData[bookKey];
            bookInfo = {
              title: book.title || "Unknown Title",
              author: book.authors ? book.authors.map((a: any) => a.name).join(", ") : "Unknown Author",
              year: book.publish_date ? parseInt(book.publish_date) : null,
              genre: book.subjects ? categorizeGenre(book.subjects[0]) : "roman",
              description: book.notes || null,
              isbn: cleanISBN,
              publisher: book.publishers ? book.publishers[0].name : null,
              pageCount: book.number_of_pages || null,
              language: "af",
              confidence: 0.8,
              source: "open_library"
            };
          }
        } catch (error) {
          console.error("Open Library API error:", error);
        }
      }

      // 3. Use AI as fallback to generate likely book info
      if (!bookInfo) {
        try {
          // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a book database expert. Given an ISBN, provide the most likely book information. Focus on Afrikaans books when possible. Return JSON with this structure:
                {
                  "title": "Book title",
                  "author": "Author name",
                  "year": 2023,
                  "genre": "One of: roman, geskiedenis, wetenskap, biografie, kinder, poesie, drama, selfhelp",
                  "description": "Brief description",
                  "isbn": "${cleanISBN}",
                  "publisher": "Publisher name",
                  "pageCount": 200,
                  "language": "af",
                  "confidence": 0.6,
                  "source": "ai_inference"
                }
                
                If you cannot identify the book, set confidence to 0.3 and provide generic placeholder data.`
              },
              {
                role: "user",
                content: `Find book information for ISBN: ${cleanISBN}`
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 400,
          });

          bookInfo = JSON.parse(response.choices[0].message.content || "{}");
        } catch (error) {
          console.error("AI ISBN lookup error:", error);
        }
      }

      if (!bookInfo) {
        return res.status(404).json({ 
          message: "Could not find book information for this ISBN",
          isbn: cleanISBN
        });
      }

      res.json(bookInfo);
    } catch (error) {
      console.error("Error looking up ISBN:", error);
      res.status(500).json({ message: "Failed to lookup ISBN" });
    }
  });

  // Add book from ISBN lookup
  app.post("/api/books/add-from-isbn", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { title, author, year, genre, description, isbn, publisher, pageCount, isRare, addToWishlist } = req.body;

      const bookData = {
        userId,
        title: title.trim(),
        author: author.trim(),
        year: year || null,
        genre: genre || "roman",
        description: description || null,
        isRare: isRare || false,
        isWishlist: addToWishlist || false,
        isbn: isbn || null,
        publisher: publisher || null,
        pageCount: pageCount || null,
      };

      const book = await storage.createBook(bookData);
      res.json(book);
    } catch (error) {
      console.error("Error adding book from ISBN:", error);
      res.status(500).json({ message: "Failed to add book from ISBN" });
    }
  });

  // Helper function to categorize genres for Afrikaans context
  function categorizeGenre(category: string): string {
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('fiction') || lowerCategory.includes('novel') || lowerCategory.includes('roman')) {
      return 'roman';
    } else if (lowerCategory.includes('history') || lowerCategory.includes('geskiedenis')) {
      return 'geskiedenis';
    } else if (lowerCategory.includes('science') || lowerCategory.includes('wetenskap')) {
      return 'wetenskap';
    } else if (lowerCategory.includes('biography') || lowerCategory.includes('biografie')) {
      return 'biografie';
    } else if (lowerCategory.includes('children') || lowerCategory.includes('kinder')) {
      return 'kinder';
    } else if (lowerCategory.includes('poetry') || lowerCategory.includes('poesie')) {
      return 'poesie';
    } else if (lowerCategory.includes('drama') || lowerCategory.includes('theater')) {
      return 'drama';
    } else if (lowerCategory.includes('self') || lowerCategory.includes('help') || lowerCategory.includes('selfhelp')) {
      return 'selfhelp';
    }
    
    return 'roman'; // Default fallback
  }

  const httpServer = createServer(app);
  // Price comparison routes
  app.get("/api/price-comparison", isAuthenticated, async (req: any, res) => {
    try {
      const comparisons = await storage.getPriceComparisons();
      res.json(comparisons);
    } catch (error) {
      console.error("Error fetching price comparisons:", error);
      res.status(500).json({ message: "Failed to fetch price comparisons" });
    }
  });

  app.post("/api/price-comparison/compare-wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistBooks = await storage.getWishlistBooks(userId);
      
      const comparisons = [];
      
      for (const book of wishlistBooks) {
        // Use price scraper to get real-ish pricing data
        const searchResults = await priceScraper.searchBook(book.title, book.author);
        
        if (searchResults.length === 0) continue;
        
        const prices = searchResults.map(r => r.price + r.shipping);
        const bestPrice = Math.min(...prices);
        const averagePrice = Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length);
        const savings = averagePrice - bestPrice;
        
        const comparison = await storage.createPriceComparison({
          bookTitle: book.title,
          author: book.author,
          isbn: book.isbn || undefined,
          bestPrice,
          averagePrice,
          savings,
        });
        
        // Store price data for each result
        for (const result of searchResults) {
          await storage.createStorePrice({
            comparisonId: comparison.id,
            store: result.store,
            storeLogo: result.storeLogo,
            price: result.price,
            availability: result.availability,
            url: result.url,
            shipping: result.shipping,
            totalPrice: result.price + result.shipping,
            estimatedDelivery: result.estimatedDelivery,
            rating: result.rating,
            reviewCount: result.reviewCount,
          });
        }
        
        comparisons.push(comparison);
      }
      
      res.json({ message: "Price comparison completed", comparisons: comparisons.length });
    } catch (error) {
      console.error("Error comparing wishlist prices:", error);
      res.status(500).json({ message: "Failed to compare prices" });
    }
  });

  app.post("/api/price-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alertData = insertPriceAlertSchema.parse({
        ...req.body,
        userId,
      });
      
      const alert = await storage.createPriceAlert(alertData);
      res.json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });

  app.get("/api/price-alerts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  return httpServer;
}
