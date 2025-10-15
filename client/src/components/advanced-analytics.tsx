import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Users,
  BookOpen,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Target
} from "lucide-react";

interface UserAnalytics {
  activeUsers: number;
  userGrowth: number;
  avgSessionTime: string;
  sessionGrowth: number;
  returnRate: number;
  returnGrowth: number;
  peakHours: Array<{ time: string; usage: number }>;
  deviceTypes: Array<{ type: string; percentage: number }>;
}

interface BookAnalytics {
  popularBooks: Array<{ id: string; title: string; author: string; collections: number }>;
  genreDistribution: Array<{ name: string; percentage: number }>;
}

interface GeographicAnalytics {
  regions: Array<{ name: string; users: number; growth: number }>;
}

export default function AdvancedAnalytics() {
  const { data: userAnalytics, isLoading } = useQuery<UserAnalytics>({
    queryKey: ["/api/admin/analytics/users"],
  });

  const { data: bookAnalytics } = useQuery<BookAnalytics>({
    queryKey: ["/api/admin/analytics/books"],
  });

  const { data: geographicData } = useQuery<GeographicAnalytics>({
    queryKey: ["/api/admin/analytics/geographic"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted rounded-lg"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Gevorderde Analise</h2>
        <p className="text-muted-foreground">
          Diepgaande insigte oor gebruikers, boeke, en platform prestasie
        </p>
      </div>

      {/* User Behavior Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiewe Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userAnalytics?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{userAnalytics?.userGrowth || 0}% hierdie maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gemiddelde Sessie</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userAnalytics?.avgSessionTime || '0m'}
            </div>
            <p className="text-xs text-muted-foreground">
              +{userAnalytics?.sessionGrowth || 0}% vanaf verlede week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terugkeer Koers</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {userAnalytics?.returnRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{userAnalytics?.returnGrowth || 0}% verbetering
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Books and Genres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Gewildste Boeke</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookAnalytics?.popularBooks?.map((book: any, index: number) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{book.title}</h4>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {book.collections} versamelings
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  Geen data beskikbaar nie
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Genre Verspreiding</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookAnalytics?.genreDistribution?.map((genre: any) => (
                <div key={genre.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{genre.name}</span>
                    <span className="text-muted-foreground">{genre.percentage}%</span>
                  </div>
                  <Progress value={genre.percentage} className="h-2" />
                </div>
              )) || (
                <p className="text-muted-foreground text-center py-4">
                  Geen data beskikbaar nie
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Geografiese Verspreiding</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geographicData?.regions?.map((region: any) => (
              <div 
                key={region.name} 
                className="p-4 border border-border rounded-lg text-center"
              >
                <h4 className="font-semibold text-foreground">{region.name}</h4>
                <div className="text-2xl font-bold text-primary mt-2">
                  {region.users}
                </div>
                <p className="text-xs text-muted-foreground">gebruikers</p>
                <Badge 
                  variant={region.growth > 0 ? "default" : "secondary"}
                  className="mt-2"
                >
                  {region.growth > 0 ? '+' : ''}{region.growth}%
                </Badge>
              </div>
            )) || (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Geen geografiese data beskikbaar nie</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Gebruikspatrone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Piek Gebruikstye</h4>
              <div className="space-y-3">
                {userAnalytics?.peakHours?.map((hour: any) => (
                  <div key={hour.time} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">{hour.time}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={hour.usage} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {hour.usage}%
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Geen data beskikbaar nie</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Toestel Tipes</h4>
              <div className="space-y-3">
                {userAnalytics?.deviceTypes?.map((device: any) => (
                  <div key={device.type} className="flex justify-between items-center">
                    <span className="text-sm text-foreground">{device.type}</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={device.percentage} className="w-20 h-2" />
                      <span className="text-xs text-muted-foreground w-8">
                        {device.percentage}%
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground">Geen data beskikbaar nie</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}