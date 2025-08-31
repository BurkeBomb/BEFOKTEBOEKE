import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import NavigationBar from "@/components/navigation-bar";

export default function NotFound() {
  return (
    <>
      <NavigationBar />
      <div className="p-8 text-center space-y-4">
        <h1 className="text-3xl font-bold">404 - Nie Gevind Nie</h1>
        <Link href="/">
          <Button>Gaan Huis Toe</Button>
        </Link>
      </div>
    </>
  );
}
