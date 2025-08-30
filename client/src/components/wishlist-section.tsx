import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function WishlistSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: wishlistBooks = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/wishlist"],
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return apiRequest("PATCH", `/api/books/${bookId}/wishlist`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Verwyder van wenslys",
        description: "Boek is verwyder van jou wenslys.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon nie boek verwyder nie. Probeer weer.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Heart className="text-pink-500 h-5 w-5" />
            <h2 className="text-xl font-bold text-slate-900">My Wenslys</h2>
          </div>
          <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg animate-pulse">
              <div className="w-12 h-16 bg-slate-200 rounded flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Heart className="text-pink-500 h-5 w-5" />
          <span>My Wenslys</span>
        </h2>
        <span className="text-sm text-slate-600">{wishlistBooks.length} items</span>
      </div>

      {wishlistBooks.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Jou wenslys is leeg</h3>
          <p className="mt-1 text-sm text-slate-500">
            Klik op die hartjie op enige boek om dit by jou wenslys by te voeg.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistBooks.map((book) => (
            <div
              key={book.id}
              className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-16 bg-slate-200 rounded flex-shrink-0 flex items-center justify-center text-xs">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">{book.title}</h4>
                <p className="text-sm text-slate-600 truncate">{book.author}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromWishlistMutation.mutate(book.id)}
                className="text-slate-400 hover:text-red-500 p-1 h-auto"
                disabled={removeFromWishlistMutation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
