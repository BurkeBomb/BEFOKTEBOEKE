import { Search, Grid3X3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  genreFilter: string;
  onGenreChange: (genre: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  genreFilter,
  onGenreChange,
  sortBy,
  onSortChange,
}: SearchFiltersProps) {
  return (
    <div className="search-mystical p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 py-4 h-14 text-base bg-input/50 border-primary/20 focus:border-primary/60 focus:ring-primary/30 rounded-2xl backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 text-sm">
          <Select value={genreFilter} onValueChange={onGenreChange}>
            <SelectTrigger className="w-[180px] h-12 border-gray-200/50 focus:border-orange-300 focus:ring-orange-200 rounded-xl bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Genres</SelectItem>
                <SelectItem value="roman">Roman</SelectItem>
                <SelectItem value="geskiedenis">Geskiedenis</SelectItem>
                <SelectItem value="wetenskap">Wetenskap</SelectItem>
                <SelectItem value="biografie">Biografie</SelectItem>
                <SelectItem value="kinder">Kinderboeke</SelectItem>
                <SelectItem value="poesie">Poësie</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="selfhelp">Selfhelp</SelectItem>
              </SelectContent>
            </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px] h-12 border-gray-200/50 focus:border-orange-300 focus:ring-orange-200 rounded-xl bg-white/80 backdrop-blur-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Sorteer: Titel</SelectItem>
                <SelectItem value="author">Sorteer: Outeur</SelectItem>
                <SelectItem value="year">Sorteer: Jaar</SelectItem>
                <SelectItem value="genre">Sorteer: Genre</SelectItem>
              </SelectContent>
            </Select>

          <Button variant="outline" size="sm" className="button-modern h-12 px-4 border-gray-200/50 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-xl bg-white/80 backdrop-blur-sm">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
