import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import Advertisement from "@/components/advertisement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCcw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface StorePrice {
  id: string;
  store: string;
  price: number;
  shipping?: number;
  totalPrice: number;
  availability?: string;
  url?: string;
  estimatedDelivery?: string;
  rating?: number;
  reviewCount?: number;
}

interface PriceComparison {
  id: string;
  bookTitle: string;
  author: string;
  bestPrice: number;
  averagePrice: number;
  savings: number;
  stores: StorePrice[];
  lastUpdated: string;
}

export default function PriceComparisonPage() {
  const [isComparing, setIsComparing] = useState(false);

  const { data: comparisons = [], isPending } = useQuery<PriceComparison[]>({
    queryKey: ["/api/price-comparison"],
  });

  const compareWishlistMutation = useMutation({
    mutationFn: async () => {
      setIsComparing(true);
      return apiRequest("/api/price-comparison/compare-wishlist", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-comparison"] });
    },
    onSettled: () => setIsComparing(false),
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("af-ZA", { style: "currency", currency: "ZAR" }).format(value);

  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Prysvergelyking</h1>
            <p className="text-muted-foreground max-w-3xl">
              Vergelyk aanlyn winkels vir boeke op jou wenslys en vind die beste beskikbare pryse in Suid-Afrika.
            </p>
          </div>
          <Button
            className="flex items-center space-x-2"
            onClick={() => compareWishlistMutation.mutate()}
            disabled={isComparing}
          >
            {isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span>{isComparing ? "Vergelyk tans..." : "Vergelyk Wenslys"}</span>
          </Button>
        </header>

        {isPending ? (
          <Card className="animate-pulse">
            <CardContent className="p-8 space-y-4">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ) : comparisons.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Geen vergelykings beskikbaar nie</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Begin deur jou wenslys te vergelyk. Ons haal pryse by verskeie Suid-Afrikaanse boekwinkels en aanlyn platforms.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {comparisons.map((comparison) => (
              <Card key={comparison.id}>
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl text-foreground">
                      {comparison.bookTitle}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">deur {comparison.author}</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Beste prys</p>
                      <p className="font-semibold text-foreground">{formatCurrency(comparison.bestPrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gemiddeld</p>
                      <p className="font-semibold text-foreground">{formatCurrency(comparison.averagePrice)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Besparing</p>
                      <p className="font-semibold text-green-600">{formatCurrency(comparison.savings)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Winkel</TableHead>
                        <TableHead>Prys</TableHead>
                        <TableHead>Aflewering</TableHead>
                        <TableHead>Totaal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparison.stores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">
                            {store.url ? (
                              <a
                                href={store.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                {store.store}
                              </a>
                            ) : (
                              store.store
                            )}
                          </TableCell>
                          <TableCell>{formatCurrency(store.price)}</TableCell>
                          <TableCell>
                            {store.shipping ? formatCurrency(store.shipping) : "Ingesluit"}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {formatCurrency(store.totalPrice)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {store.availability ?? "Onbekend"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <p className="text-xs text-muted-foreground">
                    Laas opgedateer {new Date(comparison.lastUpdated).toLocaleString()}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Advertisement position="footer" />
      </main>
    </div>
  );
}
