import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Award, Crown, Medal } from "lucide-react";

interface Achievement {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    pointsReward: number;
  };
  unlockedAt: Date;
  progress: number;
}

interface GamificationStats {
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  booksRead: number;
  pagesRead: number;
  readingStreak: number;
  longestStreak: number;
  achievementCount: number;
}

export default function AchievementsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<GamificationStats>({
    queryKey: ["/api/gamification/stats"],
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800 border-gray-300";
      case "rare": return "bg-blue-100 text-blue-800 border-blue-300";
      case "epic": return "bg-purple-100 text-purple-800 border-purple-300";
      case "legendary": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case "common": return <Medal className="h-4 w-4" />;
      case "rare": return <Star className="h-4 w-4" />;
      case "epic": return <Award className="h-4 w-4" />;
      case "legendary": return <Crown className="h-4 w-4" />;
      default: return <Medal className="h-4 w-4" />;
    }
  };

  const categories = ["all", "reading", "collection", "social", "special"];
  
  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.achievement.category === selectedCategory);

  if (achievementsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.currentLevel}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.booksRead}</div>
              <div className="text-sm text-muted-foreground">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats?.readingStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          
          {stats && stats.pointsToNextLevel > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {stats.currentLevel + 1}</span>
                <span>{stats.pointsToNextLevel} points to go</span>
              </div>
              <Progress 
                value={((stats.totalPoints % 500) / 500) * 100} 
                className="w-full" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((userAchievement) => (
          <Card key={userAchievement.achievement.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" role="img" aria-label={userAchievement.achievement.name}>
                    {userAchievement.achievement.icon}
                  </span>
                  <CardTitle className="text-base">{userAchievement.achievement.name}</CardTitle>
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getRarityColor(userAchievement.achievement.rarity)} flex items-center gap-1`}
                >
                  {getRarityIcon(userAchievement.achievement.rarity)}
                  {userAchievement.achievement.rarity}
                </Badge>
              </div>
              <CardDescription>{userAchievement.achievement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                </span>
                <span className="font-medium text-primary">
                  +{userAchievement.achievement.pointsReward} points
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground">No achievements yet</h3>
          <p className="text-muted-foreground mb-6">Start reading to unlock your first achievements!</p>
        </div>
      )}
    </div>
  );
}