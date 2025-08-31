import NavigationBar from "@/components/navigation-bar";
import StatsCards from "@/components/stats-cards";
import WishlistSection from "@/components/wishlist-section";
import AchievementsPanel from "@/components/achievements-panel";
import SmartRecommendations from "@/components/smart-recommendations";
import AdvertisementComponent from "@/components/advertisement";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <NavigationBar />
      <div className="p-6 space-y-6">
        <StatsCards />
        <SmartRecommendations />
        <div className="grid gap-6 md:grid-cols-2">
          <WishlistSection />
          <AchievementsPanel />
        </div>
        <AdvertisementComponent position="inline" />
      </div>
    </>
  );
}
