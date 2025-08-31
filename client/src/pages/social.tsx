import NavigationBar from "@/components/navigation-bar";
import SocialFeatures from "@/components/social-features";
import { useAuth } from "@/hooks/useAuth";

export default function SocialPage() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <SocialFeatures />
      </div>
    </>
  );
}
