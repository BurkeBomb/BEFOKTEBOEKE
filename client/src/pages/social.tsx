import NavigationBar from "@/components/navigation-bar";
import SocialFeatures from "@/components/social-features";
<<<<<<< HEAD
import Advertisement from "@/components/advertisement";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gemeenskap</h1>
          <p className="text-muted-foreground max-w-3xl">
            Bou jou leesnetwerk, deel resensies en vorm nuwe boekklubs met Afrikaanse lesers regoor die wêreld.
          </p>
        </header>

        <SocialFeatures />
        <Advertisement position="footer" />
      </main>
    </div>
=======
import { useAuth } from "@/hooks/useAuth";

export default function SocialPage() {
  const { user } = useAuth();
  return (
    <>
      <NavigationBar />
      <div className="p-6">
        <SocialFeatures />
      </div>
    </>
>>>>>>> codex/implement-page-layouts-and-navigation
  );
}
