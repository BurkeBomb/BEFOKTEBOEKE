import NavigationBar from "@/components/navigation-bar";
import SocialFeatures from "@/components/social-features";
import AdvertisementComponent from "@/components/advertisement";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <section className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Gemeenskapsplein</h1>
          <p className="text-slate-600">
            Deel resensies, sluit by boekklubs aan en neem deel aan uitdagings saam met ander Afrikaans lesers.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <SocialFeatures />
          <AdvertisementComponent position="sidebar" />
        </div>
      </main>
    </div>
  );
}
