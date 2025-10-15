import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  ExternalLink, 
  Search, 
  ShoppingCart, 
  Star,
  TrendingUp,
  DollarSign,
  Package
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  availability: string;
  store: string;
  storeUrl: string;
  affiliateUrl: string;
  commission: number;
  imageUrl?: string;
  description?: string;
}

interface AffiliatePartnerStats {
  totalCommission: number;
  commissionGrowth: number;
  totalClicks: number;
  clickGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  totalSales: number;
  salesThisMonth: number;
}

export default function AffiliateMarketing() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery<BookRecommendation[]>({
    queryKey: ["/api/affiliate/recommendations"],
  });

  const { data: partnerStats } = useQuery<AffiliatePartnerStats>({
    queryKey: ["/api/affiliate/stats"],
  });

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest(`/api/affiliate/search`, "POST", { query });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate/recommendations"] });
    },
    onError: () => {
      toast({
        title: "Soektog Misluk",
        description: "Kon nie boeke soek nie. Probeer weer.",
        variant: "destructive",
      });
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (data: { bookId: string; affiliateUrl: string }) => {
      await apiRequest(`/api/affiliate/track-click`, "POST", data);
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchMutation.mutate(searchQuery);
    }
  };

  const handleAffiliateClick = (book: BookRecommendation) => {
    trackClickMutation.mutate({
      bookId: book.id,
      affiliateUrl: book.affiliateUrl
    });
    window.open(book.affiliateUrl, "_blank");
  };

  const formatCurrency = (amountInCents: number) => {
    const amount = amountInCents / 100;
    return new Intl.NumberFormat("af-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Affiliate Bemarking</h2>
        <p className="text-muted-foreground">
          Verdien kommissie deur boeke aan jou gebruikers aan te beveel
        </p>
      </div>

      {/* Partner Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Affiliate Inkomste</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(partnerStats?.totalCommission || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{partnerStats?.commissionGrowth || 0}% hierdie maand
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Klieke</CardTitle>
            <ExternalLink className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {partnerStats?.totalClicks?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{partnerStats?.clickGrowth || 0}% vanaf verlede week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Omskakeling</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {partnerStats?.conversionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              +{partnerStats?.conversionGrowth || 0}% verbetering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verkope</CardTitle>
            <Package className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {partnerStats?.totalSales || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {partnerStats?.salesThisMonth || 0} hierdie maand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Soek Aanbevelings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="Soek vir Afrikaanse boeke..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={searchMutation.isPending}
            >
              {searchMutation.isPending ? "Soek..." : "Soek"}
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted h-48 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations?.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-muted relative">
                    {book.imageUrl ? (
                      <img 
                        src={book.imageUrl} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    {book.discount && (
                      <Badge className="absolute top-2 right-2 bg-destructive">
                        -{book.discount}%
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-foreground text-sm line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                    </div>

                    <div className="flex items-center space-x-1 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < book.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({book.reviewCount})
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground">
                          {formatCurrency(book.price)}
                        </span>
                        {book.originalPrice && book.originalPrice > book.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(book.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant="outline" className="text-xs">
                          {book.store}
                        </Badge>
                        <span className="text-xs text-primary font-medium">
                          +{formatCurrency(book.commission)} kommissie
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleAffiliateClick(book)}
                      className="w-full"
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Koop by {book.store}
                    </Button>
                  </CardContent>
                </Card>
              )) || (
                <div className="col-span-full text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Geen aanbevelings gevind nie
                  </h3>
                  <p className="text-muted-foreground">
                    Probeer soek vir spesifieke boeke of genres
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}