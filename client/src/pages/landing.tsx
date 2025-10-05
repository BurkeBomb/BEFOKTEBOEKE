import { Link } from "wouter";
import { Sparkles, ShieldCheck, Users, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LanguageSelector from "@/components/language-selector";
import { useTranslation } from "@/components/language-provider";

export default function Landing() {
  const t = useTranslation();

  const featureCards = [
    {
      icon: Sparkles,
      title: "AI Aanbevelings",
      description: "Ontvang persoonlike voorstelle gebaseer op jou versameling en leesgeskiedenis.",
    },
    {
      icon: Users,
      title: "Gemeenskapsfunksies",
      description: "Sluit aan by boekklubs, deel resensies en neem deel aan leesuitdagings.",
    },
    {
      icon: Library,
      title: "Slim Organisering",
      description: "Bestuur skaars boeke, wenslyste en uitleenstatus vanaf een plek.",
    },
    {
      icon: ShieldCheck,
      title: "Pryswaarskuwings",
      description: "Vergelyk pryse en kry outomaties kennisgewings wanneer pryse daal.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <div>
            <p className="text-2xl font-black gradient-mystical text-shadow-glow">BURKEBOOKS</p>
            <p className="text-sm text-muted-foreground">Afrikaanse Boekversameling</p>
          </div>
        </div>
        <LanguageSelector />
      </header>

      <main className="flex-1">
        <section className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 lg:py-20 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              ✨ AI vir boekliefhebbers
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-balance">
              {t.landingHeroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {t.landingHeroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <Button size="lg" className="button-mystical text-white px-6 py-5 text-base" asChild>
                <a href="/api/login">{t.landingPrimaryCta}</a>
              </Button>
              <Button variant="outline" size="lg" className="px-6 py-5 text-base" asChild>
                <Link href="#features">{t.landingSecondaryCta}</Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground pt-4">
              <span>⚡ Geen installasie nodig</span>
              <span>•</span>
              <span>🔐 Replit OpenID beveiligde aanmelding</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 via-orange-100 to-transparent rounded-3xl blur-2xl opacity-80" />
            <Card className="relative overflow-hidden border-none shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span>Wat maak BURKEBOOKS uniek?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Hou jou versameling in lyn met markpryse, ontdek nuwe skrywers, en bou 'n
                  gemeenskap rondom die boeke wat jy liefhet. BURKEBOOKS kombineer AI, data en menslike verbinding.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>Volledige biblioteekbestuur met uitleenopsporing en toestandnotas.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>Realtime advertensie-inkomste dashboard vir kommersiële gebruikers.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="mt-1 text-primary">•</span>
                    <span>PWA-ondersteuning vir mobiele toegang, selfs wanneer jy vanlyn is.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="features" className="px-6 md:px-12 lg:px-20 xl:px-32 pb-20 space-y-8">
          <h2 className="text-3xl font-bold text-foreground text-center">Bou vir moderne versamelaars</h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="h-full border border-orange-100/60 shadow-sm">
                <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {feature.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 md:px-12 lg:px-20 xl:px-32 py-8 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p>© {new Date().getFullYear()} BURKEBOOKS. Alle regte voorbehou.</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Funksies</a>
            <a href="/api/login" className="hover:text-foreground transition-colors">Aanmelden</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
