import { Link } from "wouter";
import { BookOpen, Sparkles, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LanguageSelector from "@/components/language-selector";
import AdvertisementComponent from "@/components/advertisement";
import { useTranslation } from "@/components/language-provider";

const featureCards = [
  {
    icon: BookOpen,
    title: "Afrikaanse katalogus",
    description: "Volg elke boek in jou versameling met slim filters en AI-gegenereerde genre-insigte.",
  },
  {
    icon: Sparkles,
    title: "Slim aanbevelings",
    description: "Ontvang persoonlike voorstelle wat jou smaak en leesvordering respekteer.",
  },
  {
    icon: Users,
    title: "Gemeenskap",
    description: "Sluit by leesklubs, deel resensies en ontdek literêre gebeurtenisse naby jou.",
  },
  {
    icon: Shield,
    title: "Premium hulpmiddels",
    description: "Berei waardeverslae, prysvergelykings en versamelaar-analise vir skaars boeke voor.",
  },
];

export default function Landing() {
  const t = useTranslation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="max-w-6xl mx-auto w-full px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-xl">
            <span className="text-xl font-bold">BB</span>
          </div>
          <div>
            <p className="font-black text-2xl tracking-tight">BURKEBOOKS</p>
            <p className="text-xs text-slate-300 uppercase tracking-[0.3em]">Afrikaanse biblioteek</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Button asChild variant="secondary">
            <a href="/api/login">{t.login}</a>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-4 relative">
            <div className="max-w-3xl space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-50">
                {t.welcomeHeadline}
              </h1>
              <p className="text-lg sm:text-xl text-slate-300">
                {t.welcomeSubheading}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="shadow-lg shadow-purple-500/30" asChild>
                  <a href="/api/login">{t.getStarted}</a>
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-100" asChild>
                  <Link href="#features">{t.discoverFeatures}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-slate-900/60 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-16 grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="bg-slate-900/80 border-slate-800">
                <CardContent className="p-6 space-y-4">
                  <feature.icon className="h-10 w-10 text-purple-400" />
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/80 border-t border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-12 grid gap-6 md:grid-cols-3">
            <AdvertisementComponent position="banner" className="md:col-span-3" />
            <AdvertisementComponent position="sidebar" />
            <AdvertisementComponent position="inline" />
            <AdvertisementComponent position="footer" />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-6 text-sm text-center text-slate-500">
        © {new Date().getFullYear()} BurkeBooks. Afrikaans biblioteek bestuur met liefde.
      </footer>
    </div>
  );
}
