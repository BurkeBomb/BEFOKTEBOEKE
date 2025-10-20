import NavigationBar from "@/components/navigation-bar";
import PremiumSubscription from "@/components/premium-subscription";
import AffiliateMarketing from "@/components/affiliate-marketing";
import AdvertisementComponent from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-2 text-center">
          <h1 className="text-3xl font-black text-slate-900">Premium lidmaatskap</h1>
          <p className="text-slate-600">
            Ontsluit AI-gedrewe insigte, advertensievrye lees en gevorderde versamelaar tools.
          </p>
        </section>

        <PremiumSubscription />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Eksklusiewe vennootskappe
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
