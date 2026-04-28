import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { EVENTS, fmtDate } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users, Clock } from "lucide-react";

export default function Events() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Events" description="Drives the Events tab in the mobile app"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> New event</Button>} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {EVENTS.map((e) => {
          const pct = Math.round((e.registered / e.capacity) * 100);
          return (
            <div key={e.id} className="ejb-card p-4 ejb-card-hover">
              <div className="flex items-start justify-between mb-2">
                <StatusChip variant="brand" label={e.type} />
                <StatusChip variant={e.status === "Published" ? "paid" : e.status === "Past" ? "neutral" : e.status === "Draft" ? "pending" : "unpaid"} label={e.status} />
              </div>
              <h3 className="font-semibold text-sm leading-tight mb-2">{e.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{e.description}</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /><span className="num">{fmtDate(e.date)}</span></div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /><span className="truncate">{e.location}</span></div>
                <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /><span className="num">{e.registered} / {e.capacity} registered</span></div>
              </div>
              <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50"><tr><th>Title</th><th>Type</th><th>Date</th><th>Location</th><th>RSVP</th><th>Status</th></tr></thead>
          <tbody>
            {EVENTS.map((e) => (
              <tr key={e.id}>
                <td className="font-medium text-sm">{e.title}</td>
                <td><StatusChip variant="brand" label={e.type} /></td>
                <td className="num text-xs">{fmtDate(e.date)}</td>
                <td className="text-xs text-muted-foreground">{e.location}</td>
                <td className="num text-xs">{e.registered} / {e.capacity}</td>
                <td><StatusChip variant={e.status === "Published" ? "paid" : "neutral"} label={e.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
