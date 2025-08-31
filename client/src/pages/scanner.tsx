import { useState } from "react";
import NavigationBar from "@/components/navigation-bar";
import BarcodeScanner from "@/components/barcode-scanner";
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
  );
}
