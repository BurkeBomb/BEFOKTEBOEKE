import NavigationBar from "@/components/navigation-bar";
import BarcodeScanner from "@/components/barcode-scanner";
import CameraBookScanner from "@/components/camera-book-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Skandeerder laboratorium</h1>
          <p className="text-slate-600">
            Gebruik jou kamera om boeke te skandeer en outomaties by jou versameling te voeg.
          </p>
        </header>

        <Alert className="bg-blue-50 border-blue-200 text-blue-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wenk</AlertTitle>
          <AlertDescription>
            Maak seker jy gee kameratoegang toe wanneer jy die skandeerders gebruik vir die beste ervaring.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-900">Skandeer opsies</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="barcode">
              <TabsList>
                <TabsTrigger value="barcode">Barcode skandeerder</TabsTrigger>
                <TabsTrigger value="camera">Omslag analise</TabsTrigger>
              </TabsList>
              <TabsContent value="barcode" className="pt-6">
                <BarcodeScanner />
              </TabsContent>
              <TabsContent value="camera" className="pt-6">
                <CameraBookScanner />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
