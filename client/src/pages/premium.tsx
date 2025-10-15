import NavigationBar from "@/components/navigation-bar";
import PremiumSubscription from "@/components/premium-subscription";
import Advertisement from "@/components/advertisement";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-foreground">Opgradeer na Premium</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Ontsluit advertensievrye blaai, AI-aanbevelings, uitvoeropsies en eksklusiewe gemeenskapsfunksies.
          </p>
        </header>

        <PremiumSubscription />
        <Advertisement position="footer" />
      </main>
    </div>
  );
}
