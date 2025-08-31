import NavigationBar from "@/components/navigation-bar";
import EnhancedExport from "@/components/enhanced-export";
import { useAuth } from "@/hooks/useAuth";

export default function ExportPage() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <EnhancedExport />
      </div>
    </>
  );
}
