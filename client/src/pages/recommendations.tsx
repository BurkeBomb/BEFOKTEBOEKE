import NavigationBar from "@/components/navigation-bar";
import SmartRecommendations from "@/components/smart-recommendations";
<<<<<<< HEAD
=======
<<<<<<< HEAD
import Advertisement from "@/components/advertisement";

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Slim Aanbevelings</h1>
          <p className="text-muted-foreground max-w-3xl">
            Ons AI bekyk jou versameling en leeskalender om nuwe Afrikaanse boeke te vind wat jy sal geniet.
          </p>
        </header>

        <SmartRecommendations />
        <Advertisement position="inline" />
      </main>
    </div>
=======
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
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
<<<<<<< HEAD
=======
>>>>>>> codex/implement-page-layouts-and-navigation
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
  );
}
