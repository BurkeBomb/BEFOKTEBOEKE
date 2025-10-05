import NavigationBar from "@/components/navigation-bar";
import EnhancedExport from "@/components/enhanced-export";
import Advertisement from "@/components/advertisement";

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Uitvoer en Deel</h1>
          <p className="text-muted-foreground max-w-3xl">
            Skep professionele verslae van jou versameling, deel jou katalogus en rugsteun jou data met een klik.
          </p>
        </header>

        <EnhancedExport />
        <Advertisement position="inline" />
      </main>
    </div>
  );
}
