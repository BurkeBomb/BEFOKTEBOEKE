import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import EventAlertModal from "@/components/event-alert-modal";
import Advertisement from "@/components/advertisement";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Bell } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventItem {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  venue: string;
  city: string;
  startDate: string;
  endDate?: string;
  price: number;
  maxAttendees?: number;
  currentAttendees: number;
  featuredAuthor?: string;
  featuredBook?: string;
  tags?: string[] | null;
}

export default function EventsPage() {
  const { toast } = useToast();
  const [isAlertOpen, setAlertOpen] = useState(false);

  const { data: events = [], isPending } = useQuery<EventItem[]>({
    queryKey: ["/api/events"],
  });

  const { data: myEvents = [] } = useQuery<EventItem[]>({
    queryKey: ["/api/events/my-events"],
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: string) => apiRequest("POST", `/api/events/${eventId}/register`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Geregistreer",
        description: "Jy is geregistreer vir hierdie gebeurtenis.",
      });
    },
    onError: () => {
      toast({
        title: "Kon nie registreer nie",
        description: "Maak seker daar is nog plek beskikbaar en probeer weer.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (eventId: string) => apiRequest("DELETE", `/api/events/${eventId}/register`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Registrasie gekanselleer",
        description: "Ons het jou plek vir die gebeurtenis vrygestel.",
      });
    },
  });

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("af-ZA", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("af-ZA", { style: "currency", currency: "ZAR" }).format(value);

  const isRegistered = (eventId: string) => myEvents.some((event) => event.id === eventId);

  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Literêre Gebeure</h1>
            <p className="text-muted-foreground max-w-3xl">
              Ontdek boekbekendstellings, outeursgesprekke en werkswinkels dwarsdeur Suid-Afrika. Reserveer jou plek of stel waarskuwings op.
            </p>
          </div>
          <Button variant="outline" className="flex items-center space-x-2" onClick={() => setAlertOpen(true)}>
            <Bell className="h-4 w-4" />
            <span>Stel herinnering in</span>
          </Button>
        </header>

        {isPending ? (
          <Card className="animate-pulse">
            <CardContent className="p-8 space-y-3">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center space-y-3">
              <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Geen komende gebeurtenisse nie</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Meld aan vir herinnerings om nuus te kry oor toekomstige literêre happenings in jou omgewing.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold text-foreground">{event.title}</h2>
                        <Badge variant="secondary">{event.eventType.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> {formatDate(event.startDate)}
                        {event.endDate && (
                          <span className="text-xs text-muted-foreground">- {formatDate(event.endDate)}</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> {event.venue}, {event.city}
                      </p>
                      {event.featuredAuthor && (
                        <p className="text-sm text-muted-foreground">Gasspreker: {event.featuredAuthor}</p>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground max-w-3xl">{event.description}</p>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start gap-3">
                      <div className="text-sm text-muted-foreground">
                        {event.price > 0 ? formatCurrency(event.price) : "Gratis toegang"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.currentAttendees}/{event.maxAttendees ?? "∞"} plekke
                        </span>
                      </div>
                      <Button
                        onClick={() =>
                          isRegistered(event.id)
                            ? cancelMutation.mutate(event.id)
                            : registerMutation.mutate(event.id)
                        }
                        disabled={registerMutation.isPending || cancelMutation.isPending}
                        className="mt-2"
                      >
                        {isRegistered(event.id) ? "Kanselleer registrasie" : "Reserveer plek"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Advertisement position="footer" />
      </main>

      <EventAlertModal open={isAlertOpen} onOpenChange={setAlertOpen} />
    </div>
  );
}
