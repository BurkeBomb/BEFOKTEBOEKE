import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Plus, RefreshCcw } from "lucide-react";
import NavigationBar from "@/components/navigation-bar";
import StatsCards from "@/components/stats-cards";
import AddBookDialog from "@/components/add-book-dialog";
import BookCard from "@/components/book-card";
import BookShareModal from "@/components/book-share-modal";
import WishlistSection from "@/components/wishlist-section";
import WishlistSearch from "@/components/wishlist-search";
import SmartRecommendations from "@/components/smart-recommendations";
import ReadingProgressTracker from "@/components/reading-progress-tracker";
import AchievementsPanel from "@/components/achievements-panel";
import AffiliateMarketing from "@/components/affiliate-marketing";
import AdvertisementComponent from "@/components/advertisement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/components/language-provider";

type StatsResponse = {
  totalBooks: number;
  wishlistCount: number;
  rareBooks: number;
  genreCount: number;
  genreDistribution: Record<string, number>;
};

export default function Home() {
  const t = useTranslation();
  const [shareBook, setShareBook] = useState<Book | null>(null);

  const statsQuery = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  const booksQuery = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const latestBooks = useMemo(() => {
    if (!booksQuery.data) return [] as Book[];
    return [...booksQuery.data].sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    }).slice(0, 6);
  }, [booksQuery.data]);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {t.dashboardHeading}
            </h1>
            <p className="text-slate-600 max-w-2xl">
              {t.dashboardSubheading}
            </p>
          </div>
          <AddBookDialog
            trigger={
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Voeg boek by
              </Button>
            }
          />
        </section>

        <StatsCards stats={statsQuery.data} />

        <section className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900">
                  {t.latestBooks}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => booksQuery.refetch()}
                  disabled={booksQuery.isFetching}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <RefreshCcw className={`h-4 w-4 mr-2 ${booksQuery.isFetching ? "animate-spin" : ""}`} />
                  {booksQuery.isFetching ? t.refresh : t.refresh}
                </Button>
              </CardHeader>
              <CardContent>
                {booksQuery.isLoading && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Skeleton key={index} className="h-72 rounded-xl" />
                    ))}
                  </div>
                )}

                {booksQuery.isError && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <p className="text-slate-600">Kon nie boeke laai nie.</p>
                    <Button onClick={() => booksQuery.refetch()} variant="outline">
                      {t.tryAgain}
                    </Button>
                  </div>
                )}

                {!booksQuery.isLoading && !booksQuery.isError && latestBooks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <p className="text-lg font-medium text-slate-700">{t.emptyLibraryCta}</p>
                    <AddBookDialog
                      trigger={
                        <Button size="sm" variant="secondary" className="bg-purple-100 text-purple-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Voeg nou by
                        </Button>
                      }
                    />
                  </div>
                )}

                {!booksQuery.isLoading && !booksQuery.isError && latestBooks.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {latestBooks.map((book) => (
                      <BookCard key={book.id} book={book} onShare={setShareBook} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-slate-900">
                  Wenslys hulpmiddels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <WishlistSection />
                <WishlistSearch />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <SmartRecommendations />
            <ReadingProgressTracker />
            <AchievementsPanel />
            <AffiliateMarketing />
            <AdvertisementComponent position="sidebar" />
          </div>
        </section>
      </main>

      {shareBook && (
        <BookShareModal
          open={Boolean(shareBook)}
          onOpenChange={(open) => {
            if (!open) {
              setShareBook(null);
            }
          }}
          book={shareBook}
        />
      )}
    </div>
  );
}
