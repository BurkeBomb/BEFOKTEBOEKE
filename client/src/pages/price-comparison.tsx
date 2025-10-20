import NavigationBar from "@/components/navigation-bar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCcw, ShoppingCart, Sparkles } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("af-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function PriceComparison() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const comparisonsQuery = useQuery({
    queryKey: ["/api/price-comparison"],
  });

  const compareMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/price-comparison/compare-wishlist");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-comparison"] });
      toast({
        title: "Vergelykings opgedateer",
        description: "Ons het jou wenslys pryse herbereken.",
      });
    },
    onError: () => {
      toast({
        title: "Kon nie vergelyk nie",
        description: "Maak seker jou wenslys het boeke en probeer weer.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Prysvergelykings</h1>
            <p className="text-slate-600">
              Monitor beste pryse vir jou wenslys en vind die beste winkelkeuses in Suid-Afrika.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/price-comparison"] })}
              disabled={comparisonsQuery.isFetching}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${comparisonsQuery.isFetching ? "animate-spin" : ""}`} />
              Herlaai data
            </Button>
            <Button
              onClick={() => compareMutation.mutate()}
              disabled={compareMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {compareMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Vergelyk wenslys
            </Button>
          </div>
        </header>

        {comparisonsQuery.isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-64 animate-pulse bg-slate-200/70" />
            ))}
          </div>
        )}

        {comparisonsQuery.isError && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-slate-600">Kon nie pryse laai nie.</p>
              <Button onClick={() => comparisonsQuery.refetch()} variant="outline">
                Probeer weer
              </Button>
            </CardContent>
          </Card>
        )}

        {comparisonsQuery.data?.length === 0 && !comparisonsQuery.isLoading && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <ShoppingCart className="h-10 w-10 text-slate-400 mx-auto" />
              <p className="text-slate-600">Geen pryse beskikbaar nie. Vergelyk jou wenslys om te begin.</p>
              <Button onClick={() => compareMutation.mutate()} disabled={compareMutation.isPending}>
                Vergelyk nou
              </Button>
            </CardContent>
          </Card>
        )}

        {comparisonsQuery.data?.map((comparison: any) => (
          <Card key={comparison.id}>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  {comparison.bookTitle}
                </CardTitle>
                <p className="text-sm text-slate-500">deur {comparison.author}</p>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Beste prys: {formatCurrency(comparison.bestPrice)}
                </Badge>
                <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                  Gemiddeld: {formatCurrency(comparison.averagePrice)}
                </Badge>
                {comparison.savings > 0 && (
                  <Badge className="bg-purple-100 text-purple-700">
                    Spaar {formatCurrency(comparison.savings)}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Winkel</TableHead>
                    <TableHead>Beskikbaarheid</TableHead>
                    <TableHead className="text-right">Prys</TableHead>
                    <TableHead className="text-right">Versending</TableHead>
                    <TableHead className="text-right">Totaal</TableHead>
                    <TableHead className="text-right">Gradering</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.stores?.map((store: any) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{store.store}</div>
                        {store.estimatedDelivery && (
                          <p className="text-xs text-slate-500">Aflewering: {store.estimatedDelivery}</p>
                        )}
                      </TableCell>
                      <TableCell>{store.availability || "Onbekend"}</TableCell>
                      <TableCell className="text-right">{formatCurrency(store.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(store.shipping || 0)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(store.totalPrice)}</TableCell>
                      <TableCell className="text-right text-sm text-slate-500">
                        {store.rating ? `${store.rating}/5` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
