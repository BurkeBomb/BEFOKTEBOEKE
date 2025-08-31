import NavigationBar from "@/components/navigation-bar";
import PremiumSubscription from "@/components/premium-subscription";
import { useAuth } from "@/hooks/useAuth";

export default function PremiumPage() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <PremiumSubscription />
      </div>
    </>
  );
}
