import { useState } from "react";
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
  );
}
