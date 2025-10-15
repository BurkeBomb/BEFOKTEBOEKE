export type Language = "af" | "en" | "nl";

export interface Translation {
  home: string;
  premium: string;
  eventsPage: string;
  admin: string;
  logout: string;
  landingHeroTitle: string;
  landingHeroSubtitle: string;
  landingPrimaryCta: string;
  landingSecondaryCta: string;
}

export const translations: Record<Language, Translation> = {
  af: {
    home: "Tuis",
    premium: "Premium",
    eventsPage: "Gebeure",
    admin: "Admin",
    logout: "Teken uit",
    landingHeroTitle: "Bestuur jou Afrikaanse boekversameling met styl",
    landingHeroSubtitle:
      "BURKEBOOKS gee jou AI-aangedrewe organisering, prysvergelyking en 'n lewendige gemeenskap vir boekliefhebbers.",
    landingPrimaryCta: "Meld aan met Replit",
    landingSecondaryCta: "Verken funksies",
  },
  en: {
    home: "Home",
    premium: "Premium",
    eventsPage: "Events",
    admin: "Admin",
    logout: "Log out",
    landingHeroTitle: "Curate your Afrikaans library with intelligence",
    landingHeroSubtitle:
      "BURKEBOOKS combines AI tools, social discovery, and smart pricing so your collection always shines.",
    landingPrimaryCta: "Sign in with Replit",
    landingSecondaryCta: "See the features",
  },
  nl: {
    home: "Start",
    premium: "Premium",
    eventsPage: "Evenementen",
    admin: "Beheer",
    logout: "Afmelden",
    landingHeroTitle: "Beheer je Afrikaanse boekencollectie met gemak",
    landingHeroSubtitle:
      "BURKEBOOKS biedt AI, sociale functies en prijsvergelijking zodat je verzameling georganiseerd en actueel blijft.",
    landingPrimaryCta: "Inloggen met Replit",
    landingSecondaryCta: "Ontdek functies",
  },
};
