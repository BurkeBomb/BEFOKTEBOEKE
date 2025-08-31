import { Button } from "@/components/ui/button";
import AdvertisementComponent from "@/components/advertisement";
import LanguageSelector from "@/components/language-selector";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-6 text-center">
      <AdvertisementComponent position="banner" className="w-full max-w-md" />
      <h1 className="text-3xl font-bold">Welkom by BurkeBooks</h1>
      <p className="text-muted-foreground">Bestuur jou boekversameling met gemak.</p>
      <Button onClick={() => (window.location.href = "/api/login")}>
        Teken In
      </Button>
      <LanguageSelector />
    </div>
  );
}
