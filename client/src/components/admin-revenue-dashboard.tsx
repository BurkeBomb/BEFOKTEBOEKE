import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, MousePointer, Eye, Calendar } from "lucide-react";
import type { RevenueStats, TopAdPerformance } from "@/types/api";

export default function AdminRevenueDashboard() {
  const { data: revenueStats, isLoading } = useQuery<RevenueStats>({
    queryKey: ["/api/admin/revenue/stats"],
  });

  const { data: topAdsData } = useQuery<TopAdPerformance[]>({
    queryKey: ["/api/admin/revenue/top-ads"],
  });

  const topAds = useMemo(() => {
    return (topAdsData ?? []).map((ad) => ({
      ...ad,
      ctr: typeof ad.ctr === "string" ? Number(ad.ctr) : ad.ctr,
    }));
  }, [topAdsData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('af-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Inkomste Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor jou advertensie-inkomste en prestasie statistieke
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Inkomste</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(revenueStats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{revenueStats?.revenueGrowth || 0}% vanaf verlede maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertensie Klieke</CardTitle>
            <MousePointer className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {revenueStats?.totalClicks?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{revenueStats?.clickGrowth || 0}% vanaf verlede maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertensie Kyke</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {revenueStats?.totalImpressions?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{revenueStats?.impressionGrowth || 0}% vanaf verlede maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiewe Advertensies</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {revenueStats?.activeAds || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {revenueStats?.newAdsThisMonth || 0} nuwe hierdie maand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Ads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Top Presterende Advertensies</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAds.map((ad, index) => (
              <div 
                key={ad.id} 
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{ad.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {ad.advertiser} • {ad.position}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{ad.clicks}</p>
                    <p className="text-muted-foreground">Klieke</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{ad.impressions}</p>
                    <p className="text-muted-foreground">Kyke</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-primary">
                      {formatCurrency(ad.revenue)}
                    </p>
                    <p className="text-muted-foreground">Inkomste</p>
                  </div>
                  <Badge
                    variant={ad.ctr > 2 ? "default" : "secondary"}
                    className={ad.ctr > 2 ? "bg-primary" : ""}
                  >
                    {ad.ctr}% CTR
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart would go here - can be added later with a charting library */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Inkomste Tendense</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            Grafiek sal hier vertoon word - integreer met charting library vir gedetailleerde analise
          </div>
        </CardContent>
      </Card>
    </div>
  );
}