import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Crown, 
  Brain, 
  Users, 
  Download, 
  Scan,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Bell,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelector from "@/components/language-selector";
import { useTranslation } from "@/components/language-provider";

export default function NavigationBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const t = useTranslation();

  const navigationItems = [
    { path: "/", icon: Home, label: t.home, color: "text-primary" },
    { path: "/premium", icon: Crown, label: t.premium, color: "text-amber-500", badge: (user as any)?.subscriptionTier === 'free' ? 'Upgrade' : null },
    { path: "/recommendations", icon: Brain, label: "Recommendations", color: "text-purple-500" },
    { path: "/social", icon: Users, label: "Community", color: "text-blue-500" },
    { path: "/scanner", icon: Scan, label: "Scanner", color: "text-green-500" },
    { path: "/export", icon: Download, label: "Export", color: "text-orange-500" },
    { path: "/price-comparison", icon: DollarSign, label: "Prices", color: "text-green-500" },
    { path: "/price-alerts", icon: Bell, label: "Alerts", color: "text-red-500" },
    { path: "/events", icon: Calendar, label: t.eventsPage, color: "text-purple-500" }
  ];

  const isActivePath = (path: string) => {
    if (path === "/") {
      return location === "/";
    }
    return location.startsWith(path);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="nav-mystical hidden lg:flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-xl font-bold text-white text-shadow-glow">✦</span>
          </div>
          <div>
            <span className="text-2xl font-black gradient-mystical text-shadow-glow">BURKEBOOKS</span>
            <div className="text-sm text-primary/80 -mt-1 font-medium">✨ Mystical Collection ✨</div>
          </div>
        </div>

        <nav className="flex items-center space-x-2">
          {navigationItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={isActivePath(item.path) ? "default" : "ghost"}
                size="sm"
                className={`flex items-center space-x-2 relative h-12 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  isActivePath(item.path) 
                    ? 'button-mystical text-white' 
                    : 'hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActivePath(item.path) ? 'text-white' : item.color}`} />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-orange-100 text-orange-800">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-3">
          <LanguageSelector />
          <div className="w-px h-8 bg-primary/30"></div>
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="h-12 px-4 rounded-xl hover:bg-primary/10 hover:text-primary font-medium">
              <Settings className="h-5 w-5 mr-2" />
              {t.admin}
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-12 px-4 rounded-xl hover:bg-destructive/10 hover:text-destructive font-medium"
            onClick={() => window.location.href = '/api/logout'}
          >
            <LogOut className="h-5 w-5 mr-2" />
            {t.logout}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
            <span className="text-lg font-bold text-foreground">BURKEBOOKS</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mt-4 pb-4 border-t border-border pt-4">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={`h-4 w-4 mr-2 ${isActivePath(item.path) ? 'text-primary-foreground' : item.color}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              ))}
              
              <div className="border-t border-border pt-2 mt-2">
                <div className="mb-2 px-2">
                  <LanguageSelector />
                </div>
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    {t.admin}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.logout}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </>
  );
}