export type Language = "af" | "en" | "nl";

export type Translation = {
  home: string;
  premium: string;
  recommendations: string;
  community: string;
  scanner: string;
  export: string;
  prices: string;
  alerts: string;
  eventsPage: string;
  admin: string;
  logout: string;
  welcomeHeadline: string;
  welcomeSubheading: string;
  getStarted: string;
  login: string;
  discoverFeatures: string;
  dashboardHeading: string;
  dashboardSubheading: string;
  latestBooks: string;
  emptyLibraryCta: string;
  refresh: string;
  tryAgain: string;
};

export const translations: Record<Language, Translation> = {
  af: {
    home: "Tuis",
    premium: "Premium",
    recommendations: "Aanbevelings",
    community: "Gemeenskap",
    scanner: "Skandeerder",
    export: "Uitvoer",
    prices: "Pryse",
    alerts: "Waarskuwings",
    eventsPage: "Gebeurtenisse",
    admin: "Admin",
    logout: "Teken uit",
    welcomeHeadline: "Bou jou Afrikaanse boek heelal",
    welcomeSubheading: "Bestuur jou versameling, ontdek nuwe boeke en bly op hoogte van literêre gebeure in Suid-Afrika.",
    getStarted: "Begin nou",
    login: "Teken in",
    discoverFeatures: "Ontdek funksies",
    dashboardHeading: "Welkom terug by jou boekkosmos",
    dashboardSubheading: "Hou tred met jou versameling, AI-aanbevelings en gemeenskapsaktiwiteit.",
    latestBooks: "Onlangse toevoegings",
    emptyLibraryCta: "Voeg jou eerste boek by om te begin!",
    refresh: "Verfris",
    tryAgain: "Probeer weer",
  },
  en: {
    home: "Home",
    premium: "Premium",
    recommendations: "Recommendations",
    community: "Community",
    scanner: "Scanner",
    export: "Export",
    prices: "Prices",
    alerts: "Alerts",
    eventsPage: "Events",
    admin: "Admin",
    logout: "Sign out",
    welcomeHeadline: "Build your Afrikaans book universe",
    welcomeSubheading: "Manage your collection, discover new titles and stay in sync with literary events across South Africa.",
    getStarted: "Get started",
    login: "Log in",
    discoverFeatures: "Discover features",
    dashboardHeading: "Welcome back to your library cosmos",
    dashboardSubheading: "Track your collection, AI suggestions and community activity.",
    latestBooks: "Latest additions",
    emptyLibraryCta: "Add your first book to get started!",
    refresh: "Refresh",
    tryAgain: "Try again",
  },
  nl: {
    home: "Start",
    premium: "Premium",
    recommendations: "Aanbevelingen",
    community: "Gemeenschap",
    scanner: "Scanner",
    export: "Exporteren",
    prices: "Prijzen",
    alerts: "Alerts",
    eventsPage: "Evenementen",
    admin: "Beheer",
    logout: "Afmelden",
    welcomeHeadline: "Bouw je Afrikaanse boekenuniversum",
    welcomeSubheading: "Beheer je collectie, ontdek nieuwe boeken en volg literaire evenementen in Zuid-Afrika.",
    getStarted: "Aan de slag",
    login: "Inloggen",
    discoverFeatures: "Ontdek functies",
    dashboardHeading: "Welkom terug bij je bibliotheek kosmos",
    dashboardSubheading: "Volg je collectie, AI-aanbevelingen en community-activiteit.",
    latestBooks: "Nieuwste toevoegingen",
    emptyLibraryCta: "Voeg je eerste boek toe om te beginnen!",
    refresh: "Vernieuwen",
    tryAgain: "Probeer opnieuw",
  },
};
