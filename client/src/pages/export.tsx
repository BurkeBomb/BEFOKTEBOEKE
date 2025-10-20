import NavigationBar from "@/components/navigation-bar";
import EnhancedExport from "@/components/enhanced-export";
import AdvertisementComponent from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Uitvoer en verslae</h1>
          <p className="text-slate-600">
            Skep professionele verslae van jou versameling vir versekeringsdoeleindes, deel of persoonlike argivering.
          </p>
        </section>

        <EnhancedExport />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">
              Vennoot aanbevelings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdvertisementComponent position="banner" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
