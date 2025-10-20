import type {
  Advertisement,
  Book,
  Event,
  PriceAlert as PriceAlertModel,
  PriceComparison as PriceComparisonModel,
  StorePrice as StorePriceModel,
} from "@shared/schema";

export interface RevenueStats {
  totalRevenue: number;
  revenueGrowth: number;
  totalClicks: number;
  clickGrowth: number;
  totalImpressions: number;
  impressionGrowth: number;
  activeAds: number;
  newAdsThisMonth: number;
}

export interface TopAdPerformance {
  id: string;
  title: string;
  advertiser: string;
  position: Advertisement["position"];
  clicks: number;
  impressions: number;
  revenue: number;
  ctr: number | string;
}

export interface PeakHourUsage {
  time: string;
  usage: number;
}

export interface DeviceUsageBreakdown {
  type: string;
  percentage: number;
}

export interface UserAnalyticsData {
  activeUsers: number;
  userGrowth: number;
  avgSessionTime: string;
  sessionGrowth: number;
  returnRate: number;
  returnGrowth: number;
  peakHours: PeakHourUsage[];
  deviceTypes: DeviceUsageBreakdown[];
}

export interface PopularBookStat {
  id: string;
  title: string;
  author: string;
  collections: number;
}

export interface GenreDistributionStat {
  name: string;
  percentage: number;
}

export interface BookAnalyticsData {
  popularBooks: PopularBookStat[];
  genreDistribution: GenreDistributionStat[];
}

export interface RegionAnalytics {
  name: string;
  users: number;
  growth: number;
}

export interface GeographicAnalyticsData {
  regions: RegionAnalytics[];
}

export interface AffiliateStats {
  totalCommission: number;
  commissionGrowth: number;
  totalClicks: number;
  clickGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  totalSales: number;
  salesThisMonth: number;
}

export interface AffiliateRecommendation {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  availability: string;
  store: string;
  storeUrl: string;
  affiliateUrl: string;
  commission: number;
  imageUrl?: string;
  description?: string;
}

export interface ExportHistoryItem {
  id: string;
  name: string;
  type: string;
  status: string;
  size: string;
  createdAt: string;
}

export interface WishlistSuggestedSite {
  name: string;
  url: string;
}

export interface WishlistSearchLink {
  query: string;
  url: string;
}

export interface WishlistSearchResult {
  book: Book;
  suggestedSites: WishlistSuggestedSite[];
  searchUrls: WishlistSearchLink[];
}

export interface RecommendationStats {
  total: number;
  thisWeek: number;
  accuracy: number;
  additionRate: number;
}

export interface ReadingActivityResponse {
  pointsEarned: number;
  newLevel: number;
  leveledUp: boolean;
}

export interface PriceAlertSummary
  extends Omit<PriceAlertModel, "targetPrice" | "currentPrice"> {
  targetPrice: number;
  currentPrice: number | null;
  savings?: number | null;
  notificationEmail?: boolean;
  notificationSms?: boolean;
}

export interface ComparisonStore
  extends Omit<StorePriceModel, "price" | "shipping" | "totalPrice"> {
  price: number;
  shipping: number;
  totalPrice: number;
}

export interface PriceComparisonSummary
  extends Omit<PriceComparisonModel, "bestPrice" | "averagePrice" | "savings"> {
  bestPrice: number;
  averagePrice: number;
  savings: number;
  stores: ComparisonStore[];
}

export interface ReviewSummary {
  id: string;
  bookTitle: string;
  userName: string;
  rating: number;
  review: string;
  likes: number;
  createdAt: string;
}

export interface BookClubSummary {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  currentBook?: string;
}

export interface ChallengeSummary {
  id: string;
  name: string;
  description: string;
  targetCount: number;
  currentCount: number;
  isJoined: boolean;
}

export interface BadgeSummary {
  id: string;
  name: string;
  description: string;
  type: string;
  earnedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  booksRead: number;
  points: number;
}

export interface UserEventRegistration extends Event {
  registrationStatus: string;
  registeredAt: string;
}
