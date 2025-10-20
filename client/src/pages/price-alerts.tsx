import { useState } from "react";
<<<<<<< HEAD
import { useMutation, useQuery } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import PriceAlertModal from "@/components/price-alert-modal";
import Advertisement from "@/components/advertisement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PriceAlert {
  id: string;
  bookTitle: string;
  author: string;
  targetPrice: number;
  currentPrice: number | null;
  notificationEmail?: string;
  notificationSms?: string;
  createdAt: string;
  isActive: boolean;
}

export default function PriceAlertsPage() {
  const { toast } = useToast();
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");
  const [draftPrice, setDraftPrice] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);

  const { data: alerts = [], isPending } = useQuery<PriceAlert[]>({
    queryKey: ["/api/price-alerts"],
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/price-alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts"] });
      toast({
        title: "Waarskuwing verwyder",
        description: "Die prys waarskuwing is suksesvol uitgevee.",
      });
    },
    onError: () => {
      toast({
        title: "Kon nie waarskuwing verwyder nie",
        description: "Probeer asseblief weer.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!draftTitle.trim() || !draftAuthor.trim()) {
      toast({
        title: "Vul boekinligting in",
        description: "Titel en outeur is nodig om 'n waarskuwing te skep.",
        variant: "destructive",
      });
      return;
    }
    setModalOpen(true);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("af-ZA", { style: "currency", currency: "ZAR" }).format(value);

  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Pryswaarskuwings</h1>
          <p className="text-muted-foreground max-w-3xl">
            Skep kennisgewings vir skaars boeke en ontvang e-pos of SMS wanneer pryse jou teiken bereik.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Skep nuwe waarskuwing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="alert-title">Titel</Label>
                <Input
                  id="alert-title"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  placeholder="bv. Fiela se Kind"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-author">Outeur</Label>
                <Input
                  id="alert-author"
                  value={draftAuthor}
                  onChange={(event) => setDraftAuthor(event.target.value)}
                  placeholder="bv. Dalene Matthee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-price">Huidige raming (opsioneel)</Label>
                <Input
                  id="alert-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={draftPrice}
                  onChange={(event) => setDraftPrice(event.target.value)}
                  placeholder="250"
                />
              </div>
            </div>
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Skep waarskuwing</span>
            </Button>
          </CardContent>
        </Card>

        {isPending ? (
          <Card className="animate-pulse">
            <CardContent className="p-8 space-y-3">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ) : alerts.length === 0 ? (
          <Card>
            <CardContent className="py-14 text-center space-y-3">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Geen waarskuwings nie</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Gebruik die vorm hierbo om jou eerste waarskuwing op te stel en bly op hoogte van prysdalings.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{alert.bookTitle}</h3>
                      <p className="text-sm text-muted-foreground">deur {alert.author}</p>
                      <div className="flex items-center gap-6 text-sm mt-3">
                        <div>
                          <p className="text-muted-foreground">Teiken</p>
                          <p className="font-semibold text-foreground">{formatCurrency(alert.targetPrice)}</p>
                        </div>
                        {alert.currentPrice !== null && (
                          <div>
                            <p className="text-muted-foreground">Huidig</p>
                            <p className="font-semibold text-muted-foreground">{formatCurrency(alert.currentPrice)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p
                            className={cn(
                              "font-semibold",
                              alert.isActive ? "text-green-600" : "text-muted-foreground"
                            )}
                          >
                            {alert.isActive ? "Aktief" : "Onderbreek"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 self-start"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Verwyder</span>
                    </Button>
                  </div>

                  {(alert.notificationEmail || alert.notificationSms) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {alert.notificationEmail && <p>E-pos: {alert.notificationEmail}</p>}
                      {alert.notificationSms && <p>SMS: {alert.notificationSms}</p>}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Geskep {new Date(alert.createdAt).toLocaleString()}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Advertisement position="footer" />
      </main>

      <PriceAlertModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setDraftPrice("");
          setDraftTitle("");
          setDraftAuthor("");
        }}
        bookTitle={draftTitle}
        author={draftAuthor}
        currentPrice={draftPrice ? Number(draftPrice) : 0}
      />
    </div>
=======
import NavigationBar from "@/components/navigation-bar";
import PriceAlertModal from "@/components/price-alert-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function PriceAlerts() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavigationBar />
      <div className="p-6 space-y-4">
        <Button onClick={() => setOpen(true)}>Skep Pryswaarskuwing</Button>
        <PriceAlertModal isOpen={open} onClose={() => setOpen(false)} />
      </div>
    </>
>>>>>>> codex/implement-page-layouts-and-navigation
  );
}
