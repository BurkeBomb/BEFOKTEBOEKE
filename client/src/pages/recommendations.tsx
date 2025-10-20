import NavigationBar from "@/components/navigation-bar";
import SmartRecommendations from "@/components/smart-recommendations";
import AffiliateMarketing from "@/components/affiliate-marketing";
import AdvertisementComponent from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Aanbevelings laboratorium</h1>
          <p className="text-slate-600">
            Ontdek nuwe Afrikaanse boeke, verfyn jou voorkeure en stuur terugvoer aan ons AI.
          </p>
        </header>

        <SmartRecommendations />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Vennootaanbevelings
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
