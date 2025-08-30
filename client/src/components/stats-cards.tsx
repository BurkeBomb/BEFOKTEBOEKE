import { Book, Heart, Gem, Tags } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalBooks: number;
    wishlistCount: number;
    rareBooks: number;
    genreCount: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stats-mystical animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-8 bg-slate-200 rounded w-12" />
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Totale Boeke",
      value: stats.totalBooks,
      icon: Book,
      color: "blue",
    },
    {
      title: "Wenslys",
      value: stats.wishlistCount,
      icon: Heart,
      color: "pink",
    },
    {
      title: "Skaars Boeke",
      value: stats.rareBooks,
      icon: Gem,
      color: "yellow",
    },
    {
      title: "Genres",
      value: stats.genreCount,
      icon: Tags,
      color: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="stats-mystical animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center shadow-lg border border-primary/20">
              <card.icon className="text-primary h-7 w-7" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
