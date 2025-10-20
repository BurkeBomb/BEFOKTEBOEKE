import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, CheckCircle, Plus, Target, Zap } from "lucide-react";
import type { ReadingActivityResponse } from "@/types/api";

interface ReadingProgressTrackerProps {
  bookId: string;
  bookTitle: string;
  totalPages?: number;
  currentPages?: number;
  readingStatus: "unread" | "reading" | "read";
  onStatusUpdate?: () => void;
}

export default function ReadingProgressTracker({
  bookId,
  bookTitle,
  totalPages = 0,
  currentPages = 0,
  readingStatus,
  onStatusUpdate
}: ReadingProgressTrackerProps) {
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [isLogging, setIsLogging] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const recordActivityMutation = useMutation<ReadingActivityResponse, unknown, { activityType: string; pages?: number }>({
    mutationFn: async ({ activityType, pages }) => {
      const response = await apiRequest("POST", "/api/reading-activity", {
        bookId,
        activityType,
        pagesRead: pages || 0,
      });
      return await response.json() as ReadingActivityResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      onStatusUpdate?.();
      
      if (data.pointsEarned > 0) {
        toast({
          title: "Points Earned!",
          description: `You earned ${data.pointsEarned} points! ${data.leveledUp ? `🎉 Level up! You're now level ${data.newLevel}!` : ''}`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record reading activity",
        variant: "destructive",
      });
    },
  });

  const handleStartReading = () => {
    recordActivityMutation.mutate({ activityType: "started_reading" });
  };

  const handleFinishReading = () => {
    recordActivityMutation.mutate({ activityType: "finished_reading" });
  };

  const handleLogPages = () => {
    if (pagesRead > 0) {
      recordActivityMutation.mutate({ activityType: "pages_read", pages: pagesRead });
      setPagesRead(0);
      setIsLogging(false);
    }
  };

  const progressPercentage = totalPages > 0 ? Math.min((currentPages / totalPages) * 100, 100) : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Reading Progress
          </span>
          <Badge variant={readingStatus === "read" ? "default" : readingStatus === "reading" ? "secondary" : "outline"}>
            {readingStatus === "read" ? "Completed" : readingStatus === "reading" ? "In Progress" : "Not Started"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {totalPages > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pages: {currentPages} / {totalPages}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {readingStatus === "unread" && (
            <Button 
              onClick={handleStartReading} 
              disabled={recordActivityMutation.isPending}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Start Reading
            </Button>
          )}
          
          {readingStatus === "reading" && (
            <>
              <Button 
                onClick={handleFinishReading}
                disabled={recordActivityMutation.isPending}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark Complete
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setIsLogging(!isLogging)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Log Pages
              </Button>
            </>
          )}
          
          {readingStatus === "read" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Book completed!
            </div>
          )}
        </div>

        {/* Page Logging Interface */}
        {isLogging && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <Label htmlFor="pages-read">Pages Read Today</Label>
            <div className="flex gap-2">
              <Input
                id="pages-read"
                type="number"
                min="1"
                max={totalPages || 1000}
                value={pagesRead}
                onChange={(e) => setPagesRead(Number(e.target.value))}
                placeholder="Number of pages"
              />
              <Button 
                onClick={handleLogPages}
                disabled={pagesRead <= 0 || recordActivityMutation.isPending}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Log
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              You'll earn {Math.floor(pagesRead / 10) * 5} points for reading {pagesRead} pages
            </p>
          </div>
        )}

        {recordActivityMutation.isPending && (
          <div className="text-sm text-muted-foreground">Recording progress...</div>
        )}
      </CardContent>
    </Card>
  );
}