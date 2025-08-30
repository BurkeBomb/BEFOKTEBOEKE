import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, ExternalLink, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WishlistSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const { data: searchResults, refetch, isLoading, error } = useQuery({
    queryKey: ["/api/wishlist/search-online"],
    enabled: false, // Don't auto-fetch, only on manual trigger
    retry: false,
  });

  const handleSearchOnline = async () => {
    setIsSearching(true);
    try {
      await refetch();
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to search for online sales. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Soek Wenslys Aanlyn</h3>
        <Button
          onClick={handleSearchOnline}
          disabled={isSearching || isLoading}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          {isSearching || isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Soek Verkope
        </Button>
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className="grid gap-4">
          {searchResults.map((result: any, index: number) => (
            <Card key={result.book.id} className="border border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      {result.book.title}
                    </CardTitle>
                    <p className="text-sm text-slate-600">{result.book.author}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {result.book.genre}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">
                    Aanbevole Webwerwe:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {result.suggestedSites.map((site: any, siteIndex: number) => (
                      <Button
                        key={siteIndex}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto p-2"
                        onClick={() => window.open(site.url, '_blank')}
                      >
                        <ShoppingCart className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="truncate">{site.name}</span>
                        <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-900 mb-2">
                    Google Soekresultate:
                  </h4>
                  <div className="space-y-1">
                    {result.searchUrls.slice(0, 2).map((search: any, searchIndex: number) => (
                      <Button
                        key={searchIndex}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-left h-auto p-2 w-full"
                        onClick={() => window.open(search.url, '_blank')}
                      >
                        <Search className="h-3 w-3 mr-2 flex-shrink-0" />
                        <span className="text-xs text-slate-600 truncate">
                          {search.query}
                        </span>
                        <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {searchResults && searchResults.length === 0 && (
        <div className="text-center py-8 bg-slate-50 rounded-lg">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Geen wenslys items nie</h3>
          <p className="mt-1 text-sm text-slate-500">
            Voeg eers boeke by jou wenslys om vir verkope te soek.
          </p>
        </div>
      )}

      {!searchResults && !isLoading && (
        <div className="text-center py-8 bg-blue-50 rounded-lg">
          <Search className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Soek vir jou wenslys items</h3>
          <p className="mt-1 text-sm text-slate-500">
            Klik "Soek Verkope" om aanlyn verkope te vind vir boeke in jou wenslys.
          </p>
        </div>
      )}
    </div>
  );
}