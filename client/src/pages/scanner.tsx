import { useState } from "react";
import NavigationBar from "@/components/navigation-bar";
import BarcodeScanner from "@/components/barcode-scanner";
<<<<<<< HEAD
import CameraBookScanner from "@/components/camera-book-scanner";
import Advertisement from "@/components/advertisement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Camera } from "lucide-react";

export default function ScannerPage() {
  const [isBarcodeOpen, setBarcodeOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background/70">
      <NavigationBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Skan Jou Boeke</h1>
          <p className="text-muted-foreground max-w-3xl">
            Gebruik jou kamera of strepieskode-leser om boeke vinnig by te voeg en AI te laat help met identifikasie en metadata.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" /> ISBN Barcode Skan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Gebruik die agterkamera van jou toestel om ISBN-kodes te lees en outomaties boekdata te laai.</p>
              <Button onClick={() => setBarcodeOpen(true)} className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Begin barcode skandering</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> AI Omslagontleding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Neem 'n foto van 'n boekomslag en laat AI skrywer, titel en beskrywing voorspel.</p>
              <Button onClick={() => setCameraOpen(true)} className="flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Open kamera skandeerder</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Advertisement position="inline" />
      </main>

      <BarcodeScanner open={isBarcodeOpen} onOpenChange={setBarcodeOpen} />
      <CameraBookScanner open={isCameraOpen} onOpenChange={setCameraOpen} />
    </div>
=======
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function ScannerPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavigationBar />
      <div className="p-6 space-y-4">
        <Button onClick={() => setOpen(true)}>Open Skaner</Button>
        <BarcodeScanner open={open} onOpenChange={setOpen} />
      </div>
    </>
>>>>>>> codex/implement-page-layouts-and-navigation
  );
}
