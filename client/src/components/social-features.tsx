import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Star, 
  Trophy,
  Target,
  BookOpen,
  Award,
  Calendar,
  Crown
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SocialFeatures() {
  const [activeTab, setActiveTab] = useState("reviews");
  const [newReview, setNewReview] = useState({ bookId: "", rating: 5, review: "" });
  const { toast } = useToast();

  const { data: reviews } = useQuery({
    queryKey: ["/api/social/reviews"],
  });

  const { data: bookClubs } = useQuery({
    queryKey: ["/api/social/book-clubs"],
  });

  const { data: challenges } = useQuery({
    queryKey: ["/api/social/challenges"],
  });

  const { data: badges } = useQuery({
    queryKey: ["/api/social/badges"],
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/social/leaderboard"],
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return await apiRequest("/api/social/reviews", "POST", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/reviews"] });
      setNewReview({ bookId: "", rating: 5, review: "" });
      toast({
        title: "Resensie Bygevoeg",
        description: "Jou resensie is suksesvol gedeel!",
      });
    },
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      return await apiRequest(`/api/social/challenges/${challengeId}/join`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/challenges"] });
      toast({
        title: "Uitdaging Aanvaar",
        description: "Jy het by die lees uitdaging aangesluit!",
      });
    },
  });

  const createBookClubMutation = useMutation({
    mutationFn: async (clubData: any) => {
      return await apiRequest("/api/social/book-clubs", "POST", clubData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/book-clubs"] });
      toast({
        title: "Boekklub Geskep",
        description: "Jou nuwe boekklub is gereed!",
      });
    },
  });

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-muted-foreground'
        }`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <span>Sosiale Gemeenskap</span>
        </h2>
        <p className="text-muted-foreground">
          Deel jou lees ervaring met ander boekliefhebbers
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b">
        {[
          { id: "reviews", label: "Resensies", icon: MessageSquare },
          { id: "clubs", label: "Boekklubs", icon: Users },
          { id: "challenges", label: "Uitdagings", icon: Target },
          { id: "badges", label: "Prestasies", icon: Award },
          { id: "leaderboard", label: "Ranglys", icon: Trophy }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center space-x-2"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skryf 'n Resensie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Soek na 'n boek om te resenseer..."
                value={newReview.bookId}
                onChange={(e) => setNewReview(prev => ({ ...prev, bookId: e.target.value }))}
              />
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Beoordeling:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                    >
                      <Star 
                        className={`h-5 w-5 ${
                          star <= newReview.rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Deel jou gedagtes oor hierdie boek..."
                value={newReview.review}
                onChange={(e) => setNewReview(prev => ({ ...prev, review: e.target.value }))}
                rows={4}
              />

              <Button 
                onClick={() => addReviewMutation.mutate(newReview)}
                disabled={!newReview.bookId || !newReview.review}
              >
                Publiseer Resensie
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {reviews?.map((review: any) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{review.bookTitle}</h4>
                      <p className="text-sm text-muted-foreground">deur {review.userName}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-3">{review.review}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Heart className="h-4 w-4 mr-1" />
                        {review.likes}
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('af-ZA')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Geen resensies nog nie. Wees die eerste!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Book Clubs Tab */}
      {activeTab === "clubs" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skep 'n Nuwe Boekklub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Boekklub naam..." />
              <Textarea placeholder="Beskryf jou boekklub..." rows={3} />
              <Button onClick={() => createBookClubMutation.mutate({})}>
                Skep Boekklub
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookClubs?.map((club: any) => (
              <Card key={club.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{club.name}</h4>
                    <Badge variant="secondary">{club.memberCount} lede</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{club.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Huidige boek: {club.currentBook || "Geen"}
                    </div>
                    <Button size="sm">Sluit Aan</Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Geen boekklubs beskikbaar nie</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Challenges Tab */}
      {activeTab === "challenges" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges?.map((challenge: any) => (
              <Card key={challenge.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{challenge.name}</h4>
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{challenge.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Vordering:</span>
                      <span>{challenge.currentCount}/{challenge.targetCount}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (challenge.currentCount / challenge.targetCount) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => joinChallengeMutation.mutate(challenge.id)}
                    disabled={challenge.isJoined}
                  >
                    {challenge.isJoined ? "Reeds Aangesluit" : "Sluit Aan"}
                  </Button>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-8">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Geen aktiewe uitdagings nie</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {activeTab === "badges" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {badges?.map((badge: any) => (
              <Card key={badge.id} className="text-center">
                <CardContent className="p-4">
                  <div className="flex justify-center mb-2">
                    {badge.type === 'gold' && <Crown className="h-8 w-8 text-yellow-500" />}
                    {badge.type === 'silver' && <Award className="h-8 w-8 text-gray-400" />}
                    {badge.type === 'bronze' && <Award className="h-8 w-8 text-amber-600" />}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <span className="text-xs text-muted-foreground">
                    Verdien op {new Date(badge.earnedAt).toLocaleDateString('af-ZA')}
                  </span>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-full text-center py-8">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Begin lees om prestasies te ontsluit!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === "leaderboard" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Maandelikse Ranglys</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard?.map((user: any, index: number) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{user.name}</h4>
                      <p className="text-xs text-muted-foreground">{user.booksRead} boeke gelees</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{user.points} punte</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Ranglys sal binnekort beskikbaar wees</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}