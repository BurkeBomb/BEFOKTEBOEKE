import NavigationBar from "@/components/navigation-bar";
import AdminRevenueDashboard from "@/components/admin-revenue-dashboard";
<<<<<<< HEAD
=======
<<<<<<< HEAD
import AdvancedAnalytics from "@/components/advanced-analytics";
import Advertisement from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Administrateur Dashboard</h1>
          <p className="text-muted-foreground max-w-3xl">
            Monitor advertensie-inkomste, gebruikersgroei en inhoudsprestasie om BURKEBOOKS se besigheidsdoelwitte te dryf.
          </p>
        </header>

        <AdminRevenueDashboard />
        <AdvancedAnalytics />

        <div className="grid gap-6 lg:grid-cols-2">
          <Advertisement position="sidebar" />
          <Card>
            <CardHeader>
              <CardTitle>Operasionele Wenke</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Monitor gereeld prestasie van advertensies en optimaliseer kreatiewe op grond van klikdata om inkomste te verhoog.
              </p>
              <p>
                Gebruik AI-aanbevelingsdata om nuwe bemarkingsveldtogte vir gewilde genres te beplan.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
=======
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
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
<<<<<<< HEAD
=======
>>>>>>> codex/implement-page-layouts-and-navigation
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
  );
}
