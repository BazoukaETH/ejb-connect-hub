import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Smartphone, Pencil } from "lucide-react";

const SECTIONS = [
  { title: "Home tiles", desc: "Find a Member · Committees · Announcements · Documents" },
  { title: "Home greeting", desc: "Hi, {first name}! · Welcome subtitle" },
  { title: "Featured event", desc: "Annual Business Summit 2026 — pinned" },
  { title: "Featured announcement", desc: "Last Call: EJB x CIF 2026 — pinned" },
  { title: "Partners strip", desc: "5 active partners shown in Platinum → Silver order" },
  { title: "Bottom nav labels", desc: "Home · Network · Updates · Hub · Profile" },
  { title: "Maintenance banner", desc: "Off — schedule by date" },
  { title: "App version notes", desc: "v3.4.0 — Improved RSVP flow" },
];

export default function AppContent() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="App content" description="Configure everything members see in the mobile app" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SECTIONS.map((s) => (
          <div key={s.title} className="ejb-card p-4 ejb-card-hover">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-md bg-accent text-accent-foreground flex items-center justify-center"><Smartphone className="h-4 w-4" /></div>
                <div>
                  <h3 className="text-sm font-semibold">{s.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs"><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">Last published 2 days ago</span>
              <Button size="sm" variant="outline" className="h-7 text-xs">Publish to app</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
