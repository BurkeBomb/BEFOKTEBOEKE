import { useState } from "react";
import NavigationBar from "@/components/navigation-bar";
import EventAlertModal from "@/components/event-alert-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function EventsPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <NavigationBar />
      <div className="p-6 space-y-4">
        <Button onClick={() => setOpen(true)}>Skep Gebeurtenis Herinnering</Button>
        <EventAlertModal open={open} onOpenChange={setOpen} />
      </div>
    </>
  );
}
