import NavigationBar from "@/components/navigation-bar";
import WishlistSearch from "@/components/wishlist-search";
import { useAuth } from "@/hooks/useAuth";

export default function PriceComparison() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <WishlistSearch />
      </div>
    </>
  );
}
