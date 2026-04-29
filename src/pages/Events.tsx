import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { EVENTS, fmtDate } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, MapPin, Users, Clock, Calendar } from "lucide-react";

export default function Events() {
  const upcoming = EVENTS.filter(e => e.status === "Published" || e.status === "Draft");
  const past = EVENTS.filter(e => e.status === "Past");

  const renderCard = (e: typeof EVENTS[number]) => {
    const pct = Math.round((e.registered / e.capacity) * 100);
    const nearFull = pct > 85;
    return (
      <div key={e.id} className="ejb-card p-4 ejb-card-hover animate-fade-in">
        <div className="flex items-start justify-between mb-2">
          <StatusChip variant="brand" label={e.type} />
          <StatusChip variant={e.status === "Published" ? "paid" : e.status === "Past" ? "neutral" : e.status === "Draft" ? "pending" : "unpaid"} label={e.status} />
        </div>
        <h3 className="font-semibold text-sm leading-tight mb-2">{e.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /><span className="num">{fmtDate(e.date)}</span></div>
          <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span className="truncate">{e.location}</span></div>
          <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /><span className="num">{e.registered} / {e.capacity}</span> {nearFull && <span className="chip chip-pending ml-1">Near full</span>}</div>
        </div>
        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${nearFull ? "bg-[hsl(var(--ejb-amber))]" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px]">
          <span className="text-muted-foreground">Cost {e.cost ? `EGP ${e.cost.toLocaleString()}` : "Free"}</span>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Open roster →</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Events" description={`${upcoming.length} upcoming · ${past.length} past · drives the Events tab in the mobile app`}
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> New event</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { l: "Upcoming", v: upcoming.length, sub: "Next 60 days" },
          { l: "Avg attendance", v: "78%", sub: "Last 6 months" },
          { l: "Total RSVPs", v: EVENTS.reduce((s, e) => s + e.registered, 0), sub: "Across all events" },
          { l: "Revenue (events)", v: "EGP 617K", sub: "From paid events" },
        ].map((s) => (
          <div key={s.l} className="ejb-card p-3">
            <div className="ejb-eyebrow">{s.l}</div>
            <div className="text-xl font-bold num tracking-tight mt-1">{s.v}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[["upcoming", `Upcoming · ${upcoming.length}`], ["past", `Past · ${past.length}`], ["calendar", "Calendar"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="upcoming">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{upcoming.map(renderCard)}</div>
        </TabsContent>
        <TabsContent value="past">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{past.map(renderCard)}</div>
        </TabsContent>
        <TabsContent value="calendar">
          {(() => {
            const year = 2026, month = 4; // May 2026
            const firstDow = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const cells: (number | null)[] = [];
            for (let i = 0; i < firstDow; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            while (cells.length % 7) cells.push(null);
            const eventsByDay: Record<number, typeof EVENTS> = {};
            EVENTS.forEach((e) => {
              const d = new Date(e.date);
              if (d.getFullYear() === year && d.getMonth() === month) {
                const day = d.getDate();
                eventsByDay[day] = eventsByDay[day] ?? [];
                eventsByDay[day].push(e);
              }
            });
            return (
              <div className="ejb-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">May 2026</h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Published</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[hsl(var(--ejb-amber))]" /> Draft</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> Past</span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="bg-secondary/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center py-1.5">{d}</div>
                  ))}
                  {cells.map((c, i) => {
                    const evs = c ? (eventsByDay[c] ?? []) : [];
                    return (
                      <div key={i} className="bg-card min-h-[88px] p-1.5 text-left">
                        {c && <div className="text-[11px] font-medium num text-muted-foreground mb-1">{c}</div>}
                        <div className="space-y-1">
                          {evs.map((e) => {
                            const tone = e.status === "Draft" ? "bg-[hsl(var(--ejb-amber))]/15 text-[hsl(var(--ejb-amber))] border-[hsl(var(--ejb-amber))]/30"
                              : e.status === "Past" ? "bg-secondary text-muted-foreground border-border"
                              : "bg-primary/10 text-primary border-primary/30";
                            return (
                              <button key={e.id} className={`w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded border ${tone} truncate`} title={e.title}>
                                {e.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
