import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin-dashboard";
import PremiumPage from "@/pages/premium";
import RecommendationsPage from "@/pages/recommendations";
import SocialPage from "@/pages/social";
import ExportPage from "@/pages/export";
import PriceComparison from "@/pages/price-comparison";
import PriceAlerts from "@/pages/price-alerts";
import EventsPage from "@/pages/events";
import ScannerPage from "@/pages/scanner";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/premium" component={PremiumPage} />
          <Route path="/recommendations" component={RecommendationsPage} />
          <Route path="/social" component={SocialPage} />
          <Route path="/export" component={ExportPage} />
          <Route path="/scanner" component={ScannerPage} />
          <Route path="/price-comparison" component={PriceComparison} />
          <Route path="/price-alerts" component={PriceAlerts} />
          <Route path="/events" component={EventsPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
