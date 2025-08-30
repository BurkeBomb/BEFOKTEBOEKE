import { db } from "./db";
import { users, achievements, userAchievements, readingActivities, books } from "@shared/schema";
import { eq, count, sum, desc } from "drizzle-orm";

// Default achievements data
const DEFAULT_ACHIEVEMENTS = [
  // Reading Achievements
  { name: "First Steps", description: "Read your first book", icon: "📖", category: "reading", requirement: 1, requirementType: "books_read", pointsReward: 50, rarity: "common" },
  { name: "Page Turner", description: "Read 5 books", icon: "📚", category: "reading", requirement: 5, requirementType: "books_read", pointsReward: 100, rarity: "common" },
  { name: "Bookworm", description: "Read 25 books", icon: "🐛", category: "reading", requirement: 25, requirementType: "books_read", pointsReward: 250, rarity: "rare" },
  { name: "Library Master", description: "Read 50 books", icon: "🏛️", category: "reading", requirement: 50, requirementType: "books_read", pointsReward: 500, rarity: "epic" },
  { name: "Speed Reader", description: "Read 1000 pages", icon: "⚡", category: "reading", requirement: 1000, requirementType: "pages_read", pointsReward: 200, rarity: "rare" },
  { name: "Marathon Reader", description: "Read 5000 pages", icon: "🏃", category: "reading", requirement: 5000, requirementType: "pages_read", pointsReward: 750, rarity: "epic" },
  
  // Collection Achievements
  { name: "Collector", description: "Add 10 books to your collection", icon: "📦", category: "collection", requirement: 10, requirementType: "collection_size", pointsReward: 100, rarity: "common" },
  { name: "Curator", description: "Add 50 books to your collection", icon: "🎨", category: "collection", requirement: 50, requirementType: "collection_size", pointsReward: 300, rarity: "rare" },
  { name: "Librarian", description: "Add 100 books to your collection", icon: "👩‍🏫", category: "collection", requirement: 100, requirementType: "collection_size", pointsReward: 600, rarity: "epic" },
  { name: "Archive Master", description: "Add 250 books to your collection", icon: "📜", category: "collection", requirement: 250, requirementType: "collection_size", pointsReward: 1000, rarity: "legendary" },
  
  // Streak Achievements
  { name: "Daily Reader", description: "Read for 3 days in a row", icon: "🔥", category: "reading", requirement: 3, requirementType: "reading_streak", pointsReward: 75, rarity: "common" },
  { name: "Consistent Reader", description: "Read for 7 days in a row", icon: "📅", category: "reading", requirement: 7, requirementType: "reading_streak", pointsReward: 150, rarity: "rare" },
  { name: "Dedicated Reader", description: "Read for 30 days in a row", icon: "💪", category: "reading", requirement: 30, requirementType: "reading_streak", pointsReward: 500, rarity: "epic" },
  { name: "Reading Legend", description: "Read for 100 days in a row", icon: "👑", category: "reading", requirement: 100, requirementType: "reading_streak", pointsReward: 1500, rarity: "legendary" },
  
  // Special Achievements
  { name: "Genre Explorer", description: "Read books from 5 different genres", icon: "🗺️", category: "special", requirement: 5, requirementType: "genres_read", pointsReward: 200, rarity: "rare" },
  { name: "Afrikaans Enthusiast", description: "Read 10 Afrikaans books", icon: "🇿🇦", category: "special", requirement: 10, requirementType: "afrikaans_books", pointsReward: 300, rarity: "epic" },
];

export class GamificationService {
  
  // Initialize achievements in database
  async initializeAchievements() {
    try {
      const existingAchievements = await db.select().from(achievements);
      
      if (existingAchievements.length === 0) {
        await db.insert(achievements).values(DEFAULT_ACHIEVEMENTS);
        console.log("Default achievements initialized");
      }
    } catch (error) {
      console.error("Error initializing achievements:", error);
    }
  }

  // Calculate user level based on points
  calculateLevel(points: number): number {
    // Level formula: every 500 points = 1 level, with exponential growth
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  // Calculate points needed for next level
  calculatePointsForNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  // Record reading activity and award points
  async recordReadingActivity(userId: string, bookId: string, activityType: string, pagesRead: number = 0) {
    try {
      let pointsEarned = 0;
      
      // Calculate points based on activity
      switch (activityType) {
        case "started_reading":
          pointsEarned = 10;
          break;
        case "finished_reading":
          pointsEarned = 100;
          break;
        case "pages_read":
          pointsEarned = Math.floor(pagesRead / 10) * 5; // 5 points per 10 pages
          break;
        default:
          pointsEarned = 5;
      }

      // Record the activity
      await db.insert(readingActivities).values({
        userId,
        bookId,
        activityType,
        pagesRead,
        pointsEarned,
      });

      // Update user stats
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length > 0) {
        const currentUser = user[0];
        const newTotalPoints = (currentUser.totalPointsEarned || 0) + pointsEarned;
        const newLevel = this.calculateLevel(newTotalPoints);
        
        const updates: any = {
          totalPointsEarned: newTotalPoints,
          currentLevel: newLevel,
          lastActivityDate: new Date(),
        };

        if (activityType === "finished_reading") {
          updates.booksRead = (currentUser.booksRead || 0) + 1;
        }
        
        if (pagesRead > 0) {
          updates.pagesRead = (currentUser.pagesRead || 0) + pagesRead;
        }

        await db.update(users).set(updates).where(eq(users.id, userId));
        
        // Check for new achievements
        await this.checkAndUnlockAchievements(userId);
        
        return { pointsEarned, newLevel, leveledUp: newLevel > currentUser.currentLevel };
      }
      
      return { pointsEarned, newLevel: 1, leveledUp: false };
    } catch (error) {
      console.error("Error recording reading activity:", error);
      throw error;
    }
  }

  // Check and unlock achievements for a user
  async checkAndUnlockAchievements(userId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return [];

      const currentUser = user[0];
      
      // Get user's current achievements
      const userAchievementsResult = await db
        .select({ achievementId: userAchievements.achievementId })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));
      
      const unlockedAchievementIds = userAchievementsResult.map(ua => ua.achievementId);
      
      // Get all achievements the user hasn't unlocked yet
      const availableAchievements = await db
        .select()
        .from(achievements);
      
      const newlyUnlocked = [];
      
      for (const achievement of availableAchievements) {
        if (unlockedAchievementIds.includes(achievement.id)) continue;
        
        let currentProgress = 0;
        let hasAchieved = false;
        
        // Check if user meets the requirement
        switch (achievement.requirementType) {
          case "books_read":
            currentProgress = currentUser.booksRead || 0;
            hasAchieved = currentProgress >= achievement.requirement;
            break;
            
          case "pages_read":
            currentProgress = currentUser.pagesRead || 0;
            hasAchieved = currentProgress >= achievement.requirement;
            break;
            
          case "collection_size":
            const bookCount = await db
              .select({ count: count() })
              .from(books)
              .where(eq(books.userId, userId));
            currentProgress = bookCount[0]?.count || 0;
            hasAchieved = currentProgress >= achievement.requirement;
            break;
            
          case "reading_streak":
            currentProgress = currentUser.readingStreak || 0;
            hasAchieved = currentProgress >= achievement.requirement;
            break;
        }
        
        if (hasAchieved) {
          // Unlock the achievement
          await db.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
            progress: currentProgress,
          });
          
          // Award points
          await db.update(users)
            .set({
              totalPointsEarned: (currentUser.totalPointsEarned || 0) + (achievement.pointsReward || 0)
            })
            .where(eq(users.id, userId));
          
          newlyUnlocked.push(achievement);
        }
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error("Error checking achievements:", error);
      return [];
    }
  }

  // Get user's achievements with progress
  async getUserAchievements(userId: string) {
    try {
      const userAchievementsResult = await db
        .select({
          achievement: achievements,
          unlockedAt: userAchievements.unlockedAt,
          progress: userAchievements.progress,
        })
        .from(userAchievements)
        .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
        .where(eq(userAchievements.userId, userId))
        .orderBy(desc(userAchievements.unlockedAt));

      return userAchievementsResult;
    } catch (error) {
      console.error("Error getting user achievements:", error);
      return [];
    }
  }

  // Get user's gamification stats
  async getUserGamificationStats(userId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return null;

      const currentUser = user[0];
      const currentPoints = currentUser.totalPointsEarned || 0;
      const currentLevel = currentUser.currentLevel || 1;
      const pointsForNextLevel = this.calculatePointsForNextLevel(currentLevel);
      const pointsToNextLevel = pointsForNextLevel - currentPoints;

      // Get achievement count
      const achievementCount = await db
        .select({ count: count() })
        .from(userAchievements)
        .where(eq(userAchievements.userId, userId));

      return {
        totalPoints: currentPoints,
        currentLevel,
        pointsToNextLevel: Math.max(0, pointsToNextLevel),
        booksRead: currentUser.booksRead || 0,
        pagesRead: currentUser.pagesRead || 0,
        readingStreak: currentUser.readingStreak || 0,
        longestStreak: currentUser.longestStreak || 0,
        achievementCount: achievementCount[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error getting gamification stats:", error);
      return null;
    }
  }

  // Update reading streak
  async updateReadingStreak(userId: string) {
    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user.length === 0) return;

      const currentUser = user[0];
      const today = new Date();
      const lastActivity = currentUser.lastActivityDate;

      if (!lastActivity) {
        // First activity
        await db.update(users).set({
          readingStreak: 1,
          longestStreak: Math.max(1, currentUser.longestStreak || 0),
          lastActivityDate: today,
        }).where(eq(users.id, userId));
        return;
      }

      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        const newStreak = (currentUser.readingStreak || 0) + 1;
        await db.update(users).set({
          readingStreak: newStreak,
          longestStreak: Math.max(newStreak, currentUser.longestStreak || 0),
          lastActivityDate: today,
        }).where(eq(users.id, userId));
      } else if (daysDiff > 1) {
        // Streak broken
        await db.update(users).set({
          readingStreak: 1,
          lastActivityDate: today,
        }).where(eq(users.id, userId));
      }
      // Same day = no change to streak
    } catch (error) {
      console.error("Error updating reading streak:", error);
    }
  }
}

export const gamificationService = new GamificationService();