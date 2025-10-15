import NavigationBar from "@/components/navigation-bar";
import SmartRecommendations from "@/components/smart-recommendations";
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
  );
}
