import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 text-center px-6">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2">404</p>
      <h1 className="text-4xl font-black mb-4">Bladsy nie gevind nie</h1>
      <p className="text-slate-400 max-w-md mb-6">
        Die bladsy waarna jy soek bestaan nie meer nie of is na 'n nuwe boekrak verskuif.
      </p>
      <Button asChild size="lg" variant="secondary">
        <Link href="/">Keer terug huis toe</Link>
      </Button>
    </div>
  );
}
