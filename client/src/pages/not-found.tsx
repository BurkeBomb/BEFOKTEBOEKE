import { Link } from "wouter";
<<<<<<< HEAD
=======
<<<<<<< HEAD
import NavigationBar from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="border-dashed border-2 border-muted-foreground/30">
          <CardContent className="py-16 text-center space-y-4">
            <div className="text-6xl font-black gradient-mystical text-shadow-glow">404</div>
            <h1 className="text-2xl font-semibold text-foreground">Bladsy nie gevind nie</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Die bladsy waarna jy soek bestaan nie meer nie. Keer terug na jou boekversameling en ontdek nuwe stories.
            </p>
            <Button asChild className="button-mystical text-white">
              <Link href="/">Terug huis toe</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
=======
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
import { Button } from "@/components/ui/button";
import NavigationBar from "@/components/navigation-bar";

export default function NotFound() {
  return (
    <>
      <NavigationBar />
      <div className="p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold">404 - Nie Gevind Nie</h1>
        <Link href="/">
          <Button>Gaan Huis Toe</Button>
        </Link>
      </div>
    </>
<<<<<<< HEAD
=======
>>>>>>> codex/implement-page-layouts-and-navigation
>>>>>>> ae4d0ccb10b928b1a9266823a3b2a13366e31581
  );
}
