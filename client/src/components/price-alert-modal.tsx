import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, TrendingDown } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle?: string;
  author?: string;
  currentPrice?: number;
}

export default function PriceAlertModal({
  isOpen,
  onClose,
  bookTitle = "",
  author = "",
  currentPrice = 0
}: PriceAlertModalProps) {
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9) || 200);
  const [email, setEmail] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAlertMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/price-alerts", data);
    },
    onSuccess: () => {
      toast({
        title: "Prys Waarskuwing Geskep",
        description: `Jy sal 'n kennisgewing kry wanneer "${bookTitle}" onder ${formatPrice(targetPrice)} val.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts"] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Fout",
        description: "Kon nie prys waarskuwing skep nie",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTargetPrice(Math.floor(currentPrice * 0.9) || 200);
    setEmail("");
    setSmsNumber("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookTitle || !author) {
      toast({
        title: "Fout",
        description: "Boek inligting ontbreek",
        variant: "destructive",
      });
      return;
    }

    if (targetPrice <= 0) {
      toast({
        title: "Fout",
        description: "Teikenprys moet groter as R0 wees",
        variant: "destructive",
      });
      return;
    }

    createAlertMutation.mutate({
      bookTitle,
      author,
      targetPrice: targetPrice * 100, // Convert to cents
      currentPrice: currentPrice * 100,
      notificationEmail: email || undefined,
      notificationSms: smsNumber || undefined,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('af-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(price / 100);
  };

  const savings = currentPrice - targetPrice;
  const savingsPercentage = currentPrice > 0 ? ((savings / currentPrice) * 100).toFixed(1) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>Skep Prys Waarskuwing</span>
          </DialogTitle>
          <DialogDescription>
            Kry 'n kennisgewing wanneer hierdie boek se prys val
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Book Info */}
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="font-medium text-sm">{bookTitle}</h4>
            <p className="text-sm text-muted-foreground">deur {author}</p>
            {currentPrice > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Huidige prys: {formatPrice(currentPrice * 100)}
              </p>
            )}
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Teikenprys</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                R
              </span>
              <Input
                id="targetPrice"
                type="number"
                min="1"
                step="0.01"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="pl-8"
                placeholder="200.00"
                required
              />
            </div>
            {savings > 0 && (
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <TrendingDown className="h-4 w-4" />
                <span>Besparing: {formatPrice(savings * 100)} ({savingsPercentage}%)</span>
              </div>
            )}
          </div>

          {/* Notification Options */}
          <div className="space-y-3">
            <Label>Kennisgewing Opsies (opsioneel)</Label>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-normal">E-pos Adres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jou@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sms" className="text-sm font-normal">SMS Nommer</Label>
              <Input
                id="sms"
                type="tel"
                value={smsNumber}
                onChange={(e) => setSmsNumber(e.target.value)}
                placeholder="+27 82 123 4567"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              As jy geen kontak besonderhede verskaf nie, sal jy slegs in-app kennisgewings kry
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Kanselleer
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createAlertMutation.isPending}
            >
              {createAlertMutation.isPending ? "Skep..." : "Skep Waarskuwing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}