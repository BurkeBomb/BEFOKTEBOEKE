import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import EventAlertModal from "@/components/event-alert-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Users, Bell, Loader2, Check, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@shared/schema";

const eventTypeLabels: Record<string, string> = {
  book_reading: "Boeklesing",
  poetry_night: "Poësie aand",
  author_talk: "Outeur gesprek",
  book_club: "Boekklub",
  workshop: "Werkswinkel",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("af-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

function formatDateRange(start: string, end?: string | null) {
  const startDate = new Date(start);
  const formatter = new Intl.DateTimeFormat("af-ZA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  const startLabel = formatter.format(startDate);
  if (!end) return startLabel;
  const endDate = new Date(end);
  return `${startLabel} — ${formatter.format(endDate)}`;
}

export default function EventsPage() {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const eventsQuery = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const myEventsQuery = useQuery({
    queryKey: ["/api/events/my-events"],
  });

  const registeredMap = useMemo(() => {
    const map = new Map<string, any>();
    myEventsQuery.data?.forEach((event: any) => {
      map.set(event.id, event);
    });
    return map;
  }, [myEventsQuery.data]);

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest(`/api/events/${eventId}/register`, "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Geregistreer",
        description: "Jy is aangemeld vir die gebeurtenis!",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Kon nie registreer nie",
        description: error instanceof Error ? error.message : "Probeer weer later.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest(`/api/events/${eventId}/register`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/my-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Registrasie gekanselleer",
        description: "Ons het jou plek vrygestel.",
      });
    },
    onError: () => {
      toast({
        title: "Kon nie kanselleer nie",
        description: "Probeer asseblief weer.",
        variant: "destructive",
      });
    },
  });

  const isLoading = eventsQuery.isLoading || myEventsQuery.isLoading;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Literêre gebeurtenisse</h1>
            <p className="text-slate-600">
              Vind boekbekendstellings, poësie-aande en werkswinkels regoor Suid-Afrika.
            </p>
          </div>
          <Button variant="outline" onClick={() => setAlertsOpen(true)}>
            <Bell className="h-4 w-4 mr-2" />
            Stel kennisgewings op
          </Button>
        </header>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="h-64 animate-pulse bg-slate-200/70" />
            ))}
          </div>
        )}

        {eventsQuery.isError && (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p className="text-slate-600">Kon nie gebeurtenisse laai nie.</p>
              <Button onClick={() => eventsQuery.refetch()} variant="outline">
                Probeer weer
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {eventsQuery.data?.map((event) => {
              const registration = registeredMap.get(event.id);
              const isRegistered = Boolean(registration);
              const capacityLeft = event.maxAttendees
                ? Math.max(0, event.maxAttendees - (event.currentAttendees || 0))
                : null;

              return (
                <Card key={event.id}>
                  <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold text-slate-900">{event.title}</CardTitle>
                      <CardDescription>{event.description}</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        {eventTypeLabels[event.eventType] ?? event.eventType}
                      </Badge>
                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                        {formatCurrency(event.price || 0)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <CalendarDays className="h-4 w-4 mt-1 text-slate-500" />
                        <span>{formatDateRange(event.startDate, event.endDate)}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-slate-500" />
                        <span>
                          {event.venue}, {event.city}
                        </span>
                      </div>
                      {event.featuredAuthor && (
                        <div>
                          <span className="font-medium text-slate-700">Uitgeligte outeur:</span>{" "}
                          {event.featuredAuthor}
                        </div>
                      )}
                      {event.featuredBook && (
                        <div>
                          <span className="font-medium text-slate-700">Uitgeligte boek:</span>{" "}
                          {event.featuredBook}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span>
                          {event.currentAttendees ?? 0} geregistreer
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                        </span>
                      </div>
                      {capacityLeft !== null && (
                        <Badge variant={capacityLeft > 0 ? "secondary" : "destructive"}>
                          {capacityLeft > 0 ? `${capacityLeft} plekke oor` : "Vol"
                          }
                        </Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm text-slate-500">
                        {event.organizer} • {event.organizerContact || "Geen kontak beskikbaar"}
                      </div>
                      {isRegistered ? (
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-700">
                            <Check className="h-3 w-3 mr-1" /> Geregistreer
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => cancelMutation.mutate(event.id)}
                            disabled={cancelMutation.isPending}
                          >
                            {cancelMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Kanselleer
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => registerMutation.mutate(event.id)}
                          disabled={registerMutation.isPending || capacityLeft === 0}
                        >
                          {registerMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Users className="h-4 w-4 mr-2" />
                          )}
                          Bespreek plek
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">My registrasies</CardTitle>
                <CardDescription>
                  Bestuur jou komende gebeurtenisse en hou rekord van vorige bywoning.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myEventsQuery.data?.length ? (
                  myEventsQuery.data.map((registration: any) => (
                    <div key={registration.id} className="p-3 rounded-lg border border-slate-200 space-y-1">
                      <p className="font-semibold text-slate-900">{registration.title}</p>
                      <p className="text-sm text-slate-600">
                        {formatDateRange(registration.startDate, registration.endDate)}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        Status: {registration.registrationStatus}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">Geen registrasies nog nie.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <EventAlertModal open={alertsOpen} onOpenChange={setAlertsOpen} />
    </div>
  );
}
