import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  ThumbsUp, 
  ThumbsDown, 
  BookOpen, 
  Sparkles,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  bookTitle: string;
  bookAuthor: string;
  genre: string;
  reason: string;
  confidence: number;
  isInterested?: boolean;
  isDismissed: boolean;
}

export default function SmartRecommendations() {
  const { toast } = useToast();

  const { data: recommendations, isLoading } = useQuery<Recommendation[]>({
    queryKey: ["/api/recommendations"],
  });

  const { data: recommendationStats } = useQuery({
    queryKey: ["/api/recommendations/stats"],
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: { id: string; isInterested: boolean }) => {
      return await apiRequest(`/api/recommendations/${data.id}/feedback`, "POST", {
        isInterested: data.isInterested
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Terugvoer Gestuur",
        description: "Dankie! Ons sal beter aanbevelings maak.",
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/recommendations/${id}/dismiss`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
    },
  });

  const generateMoreMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/recommendations/generate`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recommendations"] });
      toast({
        title: "Nuwe Aanbevelings",
        description: "Ons het nuwe boeke vir jou gevind!",
      });
    },
  });

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "Baie Geskik";
    if (confidence >= 60) return "Geskik";
    return "Moontlik Geskik";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <span>Slimme Aanbevelings</span>
          </h2>
          <p className="text-muted-foreground">
            AI-aangedrewe boek aanbevelings gebaseer op jou versameling
          </p>
        </div>
        
        <Button 
          onClick={() => generateMoreMutation.mutate()}
          disabled={generateMoreMutation.isPending}
          className="flex items-center space-x-2"
        >
          <Sparkles className="h-4 w-4" />
          <span>
            {generateMoreMutation.isPending ? "Genereer..." : "Genereer Meer"}
          </span>
        </Button>
      </div>

      {/* Recommendation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Aanbevelings</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {recommendationStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {recommendationStats?.thisWeek || 0} hierdie week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akkuraatheid</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {recommendationStats?.accuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              gebaseer op jou terugvoer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bygevoeging Koers</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {recommendationStats?.additionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              van aanbevelings bygevoeg
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations?.filter(r => !r.isDismissed).map((rec) => (
          <Card key={rec.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {rec.bookTitle}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={getConfidenceColor(rec.confidence)}
                    >
                      {rec.confidence}% {getConfidenceLabel(rec.confidence)}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-2">
                    deur <span className="font-medium">{rec.bookAuthor}</span>
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="secondary">{rec.genre}</Badge>
                  </div>
                  
                  <p className="text-sm text-foreground mb-4">
                    <span className="font-medium">Hoekom ons dink jy sal dit geniet:</span> {rec.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => feedbackMutation.mutate({ id: rec.id, isInterested: true })}
                    disabled={feedbackMutation.isPending || rec.isInterested === true}
                    className={rec.isInterested === true ? "bg-green-100 text-green-700" : ""}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Interessant
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => feedbackMutation.mutate({ id: rec.id, isInterested: false })}
                    disabled={feedbackMutation.isPending || rec.isInterested === false}
                    className={rec.isInterested === false ? "bg-red-100 text-red-700" : ""}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Nie Interessant
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      // Navigate to add book with pre-filled data
                      // This would open the add book modal with the recommendation data
                    }}
                  >
                    <BookOpen className="h-4 w-4 mr-1" />
                    Voeg by Versameling
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissMutation.mutate(rec.id)}
                  >
                    Versteek
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Geen Aanbevelings Beskikbaar
              </h3>
              <p className="text-muted-foreground mb-4">
                Voeg meer boeke by jou versameling sodat ons beter aanbevelings kan maak
              </p>
              <Button onClick={() => generateMoreMutation.mutate()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Genereer Aanbevelings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendation Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Aanbeveling Tipes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Gebaseer op Versameling</h4>
              <p className="text-sm text-muted-foreground">
                Aanbevelings gebaseer op die genres en outeurs in jou huidige versameling
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Seisoenale Aanbevelings</h4>
              <p className="text-sm text-muted-foreground">
                Spesiale aanbevelings gebaseer op die tyd van die jaar en geleenthede
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Gewilde Keuses</h4>
              <p className="text-sm text-muted-foreground">
                Tans gewilde boeke onder ander BURKEBOOKS gebruikers
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Genre Verkenning</h4>
              <p className="text-sm text-muted-foreground">
                Ontdek nuwe genres gebaseer op jou lees voorkeure
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}