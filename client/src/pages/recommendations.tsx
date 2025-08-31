import NavigationBar from "@/components/navigation-bar";
import SmartRecommendations from "@/components/smart-recommendations";
import { useAuth } from "@/hooks/useAuth";

export default function RecommendationsPage() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <SmartRecommendations />
      </div>
    </>
  );
}
