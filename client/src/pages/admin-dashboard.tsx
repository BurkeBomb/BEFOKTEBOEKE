import NavigationBar from "@/components/navigation-bar";
import AdminRevenueDashboard from "@/components/admin-revenue-dashboard";
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <AdminRevenueDashboard />
      </div>
    </>
  );
}
