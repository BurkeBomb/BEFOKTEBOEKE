<<<<<<< HEAD
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Book } from "@shared/schema";
import NavigationBar from "@/components/navigation-bar";
import StatsCards from "@/components/stats-cards";
import SearchFilters from "@/components/search-filters";
import WishlistSection from "@/components/wishlist-section";
import AchievementsPanel from "@/components/achievements-panel";
import SmartRecommendations from "@/components/smart-recommendations";
import Advertisement from "@/components/advertisement";
import AffiliateMarketing from "@/components/affiliate-marketing";
import BookCard from "@/components/book-card";
import AddBookDialog from "@/components/add-book-dialog";
import AddBookModal from "@/components/add-book-modal";
import BookShareModal from "@/components/book-share-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookPlus, Share2, Sparkles } from "lucide-react";

interface StatsResponse {
  totalBooks: number;
  wishlistCount: number;
  rareBooks: number;
  genreCount: number;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortBy, setSortBy] = useState("title");
  const [isAIAddOpen, setAIAddOpen] = useState(false);
  const [shareBook, setShareBook] = useState<Book | null>(null);

  const { data: books = [], isPending: isBooksPending } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  const filteredBooks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    let result = books;

    if (normalizedQuery) {
      result = result.filter((book) => {
        const haystack = `${book.title} ${book.author} ${book.genre} ${book.description ?? ""}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }

    if (genreFilter !== "all") {
      result = result.filter((book) => book.genre === genreFilter);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "author":
          return a.author.localeCompare(b.author);
        case "year":
          return (b.year ?? 0) - (a.year ?? 0);
        case "genre":
          return a.genre.localeCompare(b.genre);
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [books, genreFilter, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Welkom terug</p>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
              Jou Afrikaanse boekversameling
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Gebruik AI om boeke te katalogiseer, ontdek nuwe aanbevelings en hou jou wenslys dop.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <AddBookDialog
              trigger={
                <Button className="h-12 px-5 font-medium flex items-center space-x-2">
                  <BookPlus className="h-5 w-5" />
                  <span>Voeg Boek By</span>
                </Button>
              }
            />
            <Button
              variant="outline"
              className="h-12 px-5 font-medium flex items-center space-x-2"
              onClick={() => setAIAddOpen(true)}
            >
              <Sparkles className="h-5 w-5" />
              <span>AI Voeg Boek</span>
            </Button>
          </div>
        </section>

        <StatsCards stats={stats} />

        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          genreFilter={genreFilter}
          onGenreChange={setGenreFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            <Advertisement position="banner" className="hidden lg:block" />
            {isBooksPending ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-full animate-pulse">
                    <CardContent className="p-0">
                      <div className="h-64 bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <Card className="border-dashed border-2 border-muted-foreground/20">
                <CardContent className="py-16 text-center space-y-3">
                  <Share2 className="h-10 w-10 mx-auto text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-foreground">Geen boeke gevind nie</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Pas jou filters aan of voeg jou eerste boek by met die AI hulpmiddel.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onShare={setShareBook} />
                ))}
              </div>
            )}

            <SmartRecommendations />
            <AffiliateMarketing />
          </div>

          <div className="space-y-8">
            <WishlistSection />
            <AchievementsPanel />
            <Advertisement position="sidebar" />
          </div>
        </div>
      </main>

      {shareBook && (
        <BookShareModal
          open={Boolean(shareBook)}
          onOpenChange={(open) => {
            if (!open) setShareBook(null);
          }}
          book={shareBook}
        />
      )}

      <AddBookModal isOpen={isAIAddOpen} onClose={() => setAIAddOpen(false)} />
    </div>
=======
import NavigationBar from "@/components/navigation-bar";
import StatsCards from "@/components/stats-cards";
import WishlistSection from "@/components/wishlist-section";
import AchievementsPanel from "@/components/achievements-panel";
import SmartRecommendations from "@/components/smart-recommendations";
import AdvertisementComponent from "@/components/advertisement";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <NavigationBar />
      <div className="p-6 space-y-6">
        <StatsCards />
        <SmartRecommendations />
        <div className="grid gap-6 md:grid-cols-2">
          <WishlistSection />
          <AchievementsPanel />
        </div>
        <AdvertisementComponent position="inline" />
      </div>
    </>
>>>>>>> codex/implement-page-layouts-and-navigation
  );
}
