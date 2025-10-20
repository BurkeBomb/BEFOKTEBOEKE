import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import NavigationBar from "@/components/navigation-bar";
import PriceAlertModal from "@/components/price-alert-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Bell, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Book } from "@shared/schema";

function formatCurrency(value: number | null | undefined) {
  const amount = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("af-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amount);
}

export default function PriceAlertsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const alertsQuery = useQuery({
    queryKey: ["/api/price-alerts"],
  });

  const booksQuery = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const selectedBook = useMemo(
    () => booksQuery.data?.find((book) => book.id === selectedBookId),
    [booksQuery.data, selectedBookId],
  );

  const deleteAlertMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/price-alerts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts"] });
      toast({
        title: "Waarskuwing verwyder",
        description: "Ons sal jou nie meer vir hierdie boek in kennis stel nie.",
      });
    },
    onError: () => {
      toast({
        title: "Kon nie verwyder nie",
        description: "Probeer asseblief weer.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAlert = () => {
    if (!selectedBook) {
      toast({
        title: "Kies 'n boek",
        description: "Kies eers 'n boek uit jou biblioteek om 'n waarskuwing te skep.",
      });
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl font-black text-slate-900">Prys waarskuwings</h1>
          <p className="text-slate-600">
            Bly op hoogte wanneer jou gunsteling boeke afprys of beskikbaar raak by plaaslike handelaars.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="w-full sm:w-72">
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies 'n boek" />
                </SelectTrigger>
                <SelectContent>
                  {booksQuery.data?.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} — {book.author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateAlert} disabled={!booksQuery.data || booksQuery.isLoading}>
              <Bell className="h-4 w-4 mr-2" />
              Skep waarskuwing
            </Button>
          </div>
        </header>

        {alertsQuery.isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="h-32 animate-pulse bg-slate-200/70" />
            ))}
          </div>
        )}

        {alertsQuery.isError && (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <p className="text-slate-600">Kon nie waarskuwings laai nie.</p>
              <Button onClick={() => alertsQuery.refetch()} variant="outline">
                Probeer weer
              </Button>
            </CardContent>
          </Card>
        )}

        {alertsQuery.data?.length === 0 && !alertsQuery.isLoading && (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-slate-600">Geen waarskuwings nie. Skep jou eerste waarskuwing hierbo.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {alertsQuery.data?.map((alert: any) => (
            <Card key={alert.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    {alert.bookTitle}
                  </CardTitle>
                  <CardDescription>deur {alert.author}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Teiken: {formatCurrency(alert.targetPrice)}
                  </Badge>
                  {alert.currentPrice && (
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                      Huidig: {formatCurrency(alert.currentPrice)}
                    </Badge>
                  )}
                  {alert.savings && alert.savings > 0 && (
                    <Badge className="bg-purple-100 text-purple-700">
                      Spaar {formatCurrency(alert.savings)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <div>
                    <span className="font-medium text-slate-700">Geskep:</span>{" "}
                    {new Date(alert.createdAt).toLocaleDateString("af-ZA")}
                  </div>
                  <div>
                    <span className="font-medium text-slate-700">Kennisgewings:</span>{" "}
                    {alert.notificationEmail ? "E-pos" : ""}
                    {alert.notificationEmail && alert.notificationSms ? " + " : ""}
                    {alert.notificationSms ? "SMS" : !alert.notificationEmail ? "Geen" : ""}
                  </div>
                  {alert.lastNotifiedAt && (
                    <div>
                      <span className="font-medium text-slate-700">Laas kennis gegee:</span>{" "}
                      {new Date(alert.lastNotifiedAt).toLocaleString("af-ZA")}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                    disabled={deleteAlertMutation.isPending}
                  >
                    {deleteAlertMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Verwyder
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {selectedBook && (
        <PriceAlertModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          bookTitle={selectedBook.title}
          author={selectedBook.author}
          currentPrice={(selectedBook.currentValue || 0) / 100}
        />
      )}
    </div>
  );
}
