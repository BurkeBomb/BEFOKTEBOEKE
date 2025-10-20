import NavigationBar from "@/components/navigation-bar";
import AdminRevenueDashboard from "@/components/admin-revenue-dashboard";
import AdvancedAnalytics from "@/components/advanced-analytics";
import AffiliateMarketing from "@/components/affiliate-marketing";
import AdvertisementComponent from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Bestuursentrum</h1>
          <p className="text-slate-600">
            Monitor advertensie prestasie, gebruikersaktiwiteit en premium vennootskappe.
          </p>
        </section>

        <AdminRevenueDashboard />

        <AdvancedAnalytics />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Vennootskap prestasie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliateMarketing />
            </CardContent>
          </Card>
          <AdvertisementComponent position="sidebar" />
        </div>
      </main>
    </div>
  );
}
