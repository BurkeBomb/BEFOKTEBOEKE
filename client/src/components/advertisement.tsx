import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Advertisement } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AdvertisementProps {
  position: 'banner' | 'sidebar' | 'footer' | 'inline';
  className?: string;
}

export default function AdvertisementComponent({ position, className = "" }: AdvertisementProps) {
  const [impressionTracked, setImpressionTracked] = useState(false);
  
  const { data: ads, isLoading } = useQuery({
    queryKey: ["/api/advertisements", position],
    queryFn: ({ queryKey, signal }) => {
      const [, slot] = queryKey as [string, AdvertisementProps["position"]];
      return apiRequest(`/api/advertisements/${slot}`, { signal });
    },
  });

  const trackImpressionMutation = useMutation({
    mutationFn: async (adId: string) => {
      await apiRequest(`/api/advertisements/${adId}/impression`, "POST", {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    },
  });

  const trackClickMutation = useMutation({
    mutationFn: async (adId: string) => {
      await apiRequest(`/api/advertisements/${adId}/click`, "POST", {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });
    },
  });

  const currentAd = ads?.[0] as Advertisement;

  // Track impression when ad becomes visible
  useEffect(() => {
    if (currentAd && !impressionTracked) {
      const timer = setTimeout(() => {
        trackImpressionMutation.mutate(currentAd.id);
        setImpressionTracked(true);
      }, 1000); // Track after 1 second of visibility

      return () => clearTimeout(timer);
    }
  }, [currentAd, impressionTracked, trackImpressionMutation]);

  const handleAdClick = (ad: Advertisement) => {
    trackClickMutation.mutate(ad.id);
    window.open(ad.targetUrl, '_blank');
  };

  if (isLoading || !currentAd) {
    return null;
  }

  return (
    <Card className={`bg-secondary/30 border-border hover:bg-secondary/50 transition-colors cursor-pointer ${className}`}>
      <CardContent className="p-4" onClick={() => handleAdClick(currentAd)}>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Geadverteer
          </Badge>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </div>
        
        {currentAd.imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img 
              src={currentAd.imageUrl} 
              alt={currentAd.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-1">
            {currentAd.title}
          </h4>
          {currentAd.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {currentAd.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              deur {currentAd.advertiser}
            </span>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Klik vir meer</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}