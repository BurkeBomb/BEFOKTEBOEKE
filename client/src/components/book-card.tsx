import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Heart, Gem, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  onShare?: (book: Book) => void;
}

const genreColors: Record<string, string> = {
  roman: "bg-red-500",
  geskiedenis: "bg-amber-500",
  wetenskap: "bg-emerald-500",
  biografie: "bg-violet-500",
  kinder: "bg-orange-500",
  poesie: "bg-pink-500",
  drama: "bg-indigo-500",
  selfhelp: "bg-cyan-500",
};

const genreLabels: Record<string, string> = {
  roman: "Roman",
  geskiedenis: "Geskiedenis",
  wetenskap: "Wetenskap",
  biografie: "Biografie",
  kinder: "Kinder",
  poesie: "Poësie",
  drama: "Drama",
  selfhelp: "Selfhelp",
};

export default function BookCard({ book, onShare }: BookCardProps) {
  const [isWishlistToggling, setIsWishlistToggling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      setIsWishlistToggling(true);
      return apiRequest("PATCH", `/api/books/${book.id}/wishlist`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: book.isInWishlist ? "Verwyder van wenslys" : "Bygevoeg by wenslys",
        description: `"${book.title}" is ${book.isInWishlist ? "verwyder van" : "bygevoeg by"} jou wenslys.`,
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon nie wenslys update nie. Probeer weer.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsWishlistToggling(false);
    },
  });

  const handleGoogleSearch = () => {
    const query = `"${book.title}" "${book.author}" afrikaans boek`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow animate-slide-up">
      <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 relative">
        {/* Placeholder for book cover */}
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📖</div>
            <div className="text-xs px-2 text-center font-medium">{book.title}</div>
          </div>
        </div>
        
        {/* Genre badge */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "text-white text-xs px-2 py-1 rounded-full font-medium",
            genreColors[book.genre] || "bg-slate-500"
          )}>
            {genreLabels[book.genre] || book.genre}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
            onClick={() => toggleWishlistMutation.mutate()}
            disabled={isWishlistToggling}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                book.isInWishlist ? "fill-pink-500 text-pink-500" : "text-slate-400"
              )}
            />
          </Button>
          
          {onShare && (
            <Button
              variant="secondary"
              size="sm"
              className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
              onClick={() => onShare(book)}
              title="Deel op sosiale media"
            >
              <Share2 className="h-4 w-4 text-blue-500" />
            </Button>
          )}
          
          {book.isRare && (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center" title="Skaars boek">
              <Gem className="text-white h-4 w-4" />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">{book.title}</h3>
        <p className="text-slate-600 text-sm mb-2">{book.author}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{book.year || "Onbekend"}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoogleSearch}
            className="text-blue-500 hover:text-blue-600 font-medium p-0 h-auto flex items-center space-x-1"
          >
            <span>Soek</span>
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
