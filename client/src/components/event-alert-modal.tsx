import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Bell, MapPin, User, Tag } from "lucide-react";

interface EventAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EventAlertModal({ open, onOpenChange }: EventAlertModalProps) {
  const [eventType, setEventType] = useState("");
  const [city, setCity] = useState("");
  const [author, setAuthor] = useState("");
  const [keywords, setKeywords] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: any) => {
      return apiRequest("POST", "/api/event-alerts", alertData);
    },
    onSuccess: () => {
      toast({
        title: "Gebeurtenis Herinnering Geskep",
        description: "Jy sal genotifiseer word wanneer toepaslike gebeurtenisse beskikbaar is",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-alerts"] });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Kon nie herinnering skep nie",
        description: "Probeer asseblief weer later",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEventType("");
    setCity("");
    setAuthor("");
    setKeywords("");
    setEmailNotifications(true);
    setSmsNotifications(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywordArray = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const alertData = {
      eventType: eventType || null,
      city: city || null,
      author: author || null,
      keywords: keywordArray.length > 0 ? keywordArray : null,
      emailNotifications,
      smsNotifications,
    };

    createAlertMutation.mutate(alertData);
  };

  const eventTypeOptions = [
    { value: "", label: "Alle Gebeurtenisse" },
    { value: "book_reading", label: "Boeklesings" },
    { value: "poetry_night", label: "Poësie-aande" },
    { value: "author_talk", label: "Outeurspraatjies" },
    { value: "book_club", label: "Boekklubs" },
    { value: "workshop", label: "Werkswinkels" },
  ];

  const southAfricanCities = [
    "Kaapstad", "Johannesburg", "Durban", "Pretoria", "Port Elizabeth",
    "Bloemfontein", "East London", "Pietermaritzburg", "Stellenbosch", "Potchefstroom"
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-purple-500" />
            <span>Gebeurtenis Herinneringe</span>
          </DialogTitle>
          <DialogDescription>
            Ontvang kennisgewings wanneer nuwe literatuur gebeurtenisse wat aan jou kriteria voldoen beskikbaar is.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="eventType" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Gebeurtenis Tipe</span>
            </Label>
            <select
              id="eventType"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {eventTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Los leeg vir kennisgewings oor alle tipes gebeurtenisse
            </p>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Stad</span>
            </Label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Alle Stede</option>
              {southAfricanCities.map(cityName => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div className="space-y-2">
            <Label htmlFor="author" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Spesifieke Outeur</span>
            </Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="bv. Marlene van Niekerk"
            />
            <p className="text-xs text-muted-foreground">
              Ontvang kennisgewings wanneer hierdie outeur by gebeurtenisse optree
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <Label htmlFor="keywords">Sleutelwoorde</Label>
            <Textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="poësie, klassieke literatuur, Afrikaanse kultuur"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Skei sleutelwoorde met kommas. Kennisgewings word gestuur vir gebeurtenisse wat hierdie woorde bevat.
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <Label>Kennisgewingsvoorkeure</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
              <Label htmlFor="email" className="text-sm">
                E-pos kennisgewings
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sms"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
              <Label htmlFor="sms" className="text-sm">
                SMS kennisgewings
              </Label>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Kanselleer
            </Button>
            <Button
              type="submit"
              disabled={createAlertMutation.isPending}
              className="flex-1"
            >
              {createAlertMutation.isPending ? "Besig om te skep..." : "Skep Herinnering"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}