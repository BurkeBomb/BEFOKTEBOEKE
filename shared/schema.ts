import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // free, premium, pro
  subscriptionEndDate: timestamp("subscription_end_date"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  totalReferrals: integer("total_referrals").default(0),
  // Gamification fields
  totalPointsEarned: integer("total_points_earned").default(0),
  currentLevel: integer("current_level").default(1),
  booksRead: integer("books_read").default(0),
  pagesRead: integer("pages_read").default(0),
  readingStreak: integer("reading_streak").default(0), // days
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  author: text("author").notNull(),
  year: integer("year"),
  genre: varchar("genre").notNull(),
  description: text("description"),
  isbn: varchar("isbn"),
  publisher: text("publisher"),
  pageCount: integer("page_count"),
  series: text("series"),
  condition: varchar("condition").default("good"), // mint, good, fair, poor
  purchasePrice: integer("purchase_price"), // in cents
  currentValue: integer("current_value"), // in cents
  purchaseDate: timestamp("purchase_date"),
  location: text("location"), // shelf location
  isRare: boolean("is_rare").default(false),
  isInWishlist: boolean("is_in_wishlist").default(false),
  isLent: boolean("is_lent").default(false),
  lentTo: text("lent_to"),
  lentDate: timestamp("lent_date"),
  barcode: varchar("barcode"),
  coverImage: text("cover_image"), // base64 encoded image data from camera
  personalRating: integer("personal_rating"), // 1-5 stars
  personalReview: text("personal_review"),
  readingStatus: varchar("reading_status").default("unread"), // unread, reading, read
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Advertisement system tables
export const advertisements = pgTable("advertisements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),
  advertiser: text("advertiser").notNull(),
  position: varchar("position").notNull(), // 'banner', 'sidebar', 'footer', 'inline'
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  costPerClick: integer("cost_per_click").default(0), // in cents
  costPerImpression: integer("cost_per_impression").default(0), // in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adClicks = pgTable("ad_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").notNull().references(() => advertisements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

export const adImpressions = pgTable("ad_impressions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  adId: varchar("ad_id").notNull().references(() => advertisements.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

// Social and community features
export const bookReviews = pgTable("book_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  isPublic: boolean("is_public").default(true),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const readingChallenges = pgTable("reading_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  challengeType: varchar("challenge_type").notNull(), // monthly, yearly, genre-specific
  targetCount: integer("target_count").notNull(),
  currentCount: integer("current_count").default(0),
  year: integer("year").notNull(),
  month: integer("month"), // for monthly challenges
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeType: varchar("badge_type").notNull(), // first-book, genre-explorer, speed-reader, etc
  badgeName: varchar("badge_name").notNull(),
  badgeDescription: text("badge_description"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const bookClubs = pgTable("book_clubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  currentBookId: varchar("current_book_id").references(() => books.id),
  meetingSchedule: varchar("meeting_schedule"), // weekly, monthly, etc
  isPublic: boolean("is_public").default(true),
  memberCount: integer("member_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookClubMembers = pgTable("book_club_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clubId: varchar("club_id").notNull().references(() => bookClubs.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role").default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookTitle: varchar("book_title").notNull(),
  bookAuthor: varchar("book_author").notNull(),
  genre: varchar("genre"),
  reason: text("reason"), // AI-generated reason for recommendation
  confidence: integer("confidence"), // 1-100
  isInterested: boolean("is_interested"), // user feedback
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exportRequests = pgTable("export_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exportType: varchar("export_type").notNull(), // csv, pdf, excel, json
  status: varchar("status").default("pending"), // pending, processing, completed, failed
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  books: many(books),
  adClicks: many(adClicks),
  adImpressions: many(adImpressions),
}));

export const booksRelations = relations(books, ({ one }) => ({
  user: one(users, {
    fields: [books.userId],
    references: [users.id],
  }),
}));

export const advertisementsRelations = relations(advertisements, ({ many }) => ({
  clicks: many(adClicks),
  impressions: many(adImpressions),
}));

export const adClicksRelations = relations(adClicks, ({ one }) => ({
  advertisement: one(advertisements, {
    fields: [adClicks.adId],
    references: [advertisements.id],
  }),
  user: one(users, {
    fields: [adClicks.userId],
    references: [users.id],
  }),
}));

export const adImpressionsRelations = relations(adImpressions, ({ one }) => ({
  advertisement: one(advertisements, {
    fields: [adImpressions.adId],
    references: [advertisements.id],
  }),
  user: one(users, {
    fields: [adImpressions.userId],
    references: [users.id],
  }),
}));

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const addBookWithAISchema = z.object({
  title: z.string().min(1, "Titel is vereist"),
  author: z.string().min(1, "Outeur is vereist"),
  year: z.number().int().positive().optional(),
  description: z.string().optional(),
  isRare: z.boolean().default(false),
  addToWishlist: z.boolean().default(false),
});

// Schema exports for advertisements
export const insertAdvertisementSchema = createInsertSchema(advertisements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdClickSchema = createInsertSchema(adClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertAdImpressionSchema = createInsertSchema(adImpressions).omit({
  id: true,
  viewedAt: true,
});

// Achievement badges system
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  category: varchar("category").notNull(), // reading, collection, social, special
  requirement: integer("requirement").notNull(), // threshold number
  requirementType: varchar("requirement_type").notNull(), // books_read, pages_read, collection_size, streak, etc.
  pointsReward: integer("points_reward").default(0),
  rarity: varchar("rarity").default("common"), // common, rare, epic, legendary
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements - junction table
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: integer("progress").default(0), // current progress towards achievement
});

// Reading activities for tracking progress
export const readingActivities = pgTable("reading_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: varchar("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  activityType: varchar("activity_type").notNull(), // started_reading, finished_reading, pages_read
  pagesRead: integer("pages_read").default(0),
  pointsEarned: integer("points_earned").default(0),
  activityDate: timestamp("activity_date").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type ReadingActivity = typeof readingActivities.$inferSelect;
export type InsertReadingActivity = typeof readingActivities.$inferInsert;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;
export type AddBookWithAI = z.infer<typeof addBookWithAISchema>;

// Advertisement types
export type Advertisement = typeof advertisements.$inferSelect;
export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type AdClick = typeof adClicks.$inferSelect;
export type InsertAdClick = z.infer<typeof insertAdClickSchema>;
export type AdImpression = typeof adImpressions.$inferSelect;
export type InsertAdImpression = z.infer<typeof insertAdImpressionSchema>;

// AI Genre Prediction Response
export const aiGenreResponseSchema = z.object({
  genre: z.enum(["roman", "geskiedenis", "wetenskap", "biografie", "kinder", "poesie", "drama", "selfhelp"]),
  confidence: z.number().min(0).max(1),
});

export type AIGenreResponse = z.infer<typeof aiGenreResponseSchema>;

// Price comparison tables
export const priceComparisons = pgTable("price_comparisons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookTitle: varchar("book_title").notNull(),
  author: varchar("author").notNull(),
  isbn: varchar("isbn"),
  bestPrice: integer("best_price").notNull(), // in cents
  averagePrice: integer("average_price").notNull(), // in cents
  savings: integer("savings").notNull().default(0), // in cents
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storePrices = pgTable("store_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  comparisonId: varchar("comparison_id").references(() => priceComparisons.id, { onDelete: "cascade" }),
  store: varchar("store").notNull(),
  storeLogo: varchar("store_logo").notNull(),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency").default("ZAR"),
  availability: varchar("availability").notNull(), // 'in_stock', 'limited', 'out_of_stock', 'pre_order'
  url: text("url").notNull(),
  shipping: integer("shipping").default(0), // in cents
  totalPrice: integer("total_price").notNull(), // in cents
  estimatedDelivery: varchar("estimated_delivery").notNull(),
  rating: integer("rating").default(4),
  reviewCount: integer("review_count").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  bookTitle: varchar("book_title").notNull(),
  author: varchar("author").notNull(),
  isbn: varchar("isbn"),
  targetPrice: integer("target_price").notNull(), // in cents
  currentPrice: integer("current_price"), // in cents
  isActive: boolean("is_active").default(true),
  lastChecked: timestamp("last_checked").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPriceComparisonSchema = createInsertSchema(priceComparisons).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertStorePriceSchema = createInsertSchema(storePrices).omit({
  id: true,
  updatedAt: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
  lastChecked: true,
});

export type PriceComparison = typeof priceComparisons.$inferSelect;
export type InsertPriceComparison = z.infer<typeof insertPriceComparisonSchema>;
export type StorePrice = typeof storePrices.$inferSelect;
export type InsertStorePrice = z.infer<typeof insertStorePriceSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

// Events system for book readings and poetry nights
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  eventType: varchar("event_type").notNull(), // 'book_reading', 'poetry_night', 'author_talk', 'book_club', 'workshop'
  venue: varchar("venue").notNull(),
  address: varchar("address"),
  city: varchar("city").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  price: integer("price").default(0), // in cents, 0 for free events
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  organizer: varchar("organizer").notNull(),
  organizerContact: varchar("organizer_contact"),
  featuredAuthor: varchar("featured_author"),
  featuredBook: varchar("featured_book"),
  tags: text("tags").array(),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  requiresBooking: boolean("requires_booking").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventAttendees = pgTable("event_attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id),
  userId: varchar("user_id").references(() => users.id),
  status: varchar("status").default("registered"), // 'registered', 'attended', 'cancelled'
  registeredAt: timestamp("registered_at").defaultNow(),
  notes: text("notes"),
});

export const eventAlerts = pgTable("event_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  eventType: varchar("event_type"), // filter by event type
  city: varchar("city"), // filter by city
  author: varchar("author"), // filter by featured author
  keywords: text("keywords").array(), // keywords to watch for
  isActive: boolean("is_active").default(true),
  lastNotified: timestamp("last_notified"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEventAttendee = typeof eventAttendees.$inferInsert;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type InsertEventAlert = typeof eventAlerts.$inferInsert;
export type EventAlert = typeof eventAlerts.$inferSelect;

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentAttendees: true,
});

export const insertEventAlertSchema = createInsertSchema(eventAlerts).omit({
  id: true,
  createdAt: true,
  lastNotified: true,
});
