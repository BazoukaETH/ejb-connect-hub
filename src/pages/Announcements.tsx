import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForPriority } from "@/components/StatusChip";
import { ANNOUNCEMENTS, fmtDateTime } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Announcements() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Announcements"
        description="Drives the Updates tab in the mobile app"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> New announcement</Button>}
      />
      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr><th>Title</th><th>Priority</th><th>Category</th><th>Audience</th><th>When</th><th>Author</th><th>Reach</th><th>Open rate</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ANNOUNCEMENTS.map((a) => (
              <tr key={a.id}>
                <td><div className="font-medium text-sm max-w-[280px] truncate">{a.title}</div></td>
                <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                <td className="text-xs">{a.category}</td>
                <td className="text-xs text-muted-foreground">{a.audience}</td>
                <td className="num text-xs text-muted-foreground">{a.publishedAt ? fmtDateTime(a.publishedAt) : a.scheduledFor ? `Scheduled · ${fmtDateTime(a.scheduledFor)}` : "—"}</td>
                <td className="text-xs">{a.author}</td>
                <td className="num text-xs">{a.reach ? `${a.reach.sent} / ${a.reach.total}` : "—"}</td>
                <td className="num text-xs">{a.openRate != null ? `${a.openRate}%` : "—"}</td>
                <td><StatusChip variant={a.status === "Published" ? "paid" : a.status === "Scheduled" ? "info" : "neutral"} label={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="ejb-card p-5">
          <h3 className="text-sm font-semibold mb-3">Composer</h3>
          <div className="space-y-3 text-sm">
            <input placeholder="Title" className="w-full h-10 px-3 border border-border rounded-md bg-card font-medium" />
            <textarea placeholder="Body. Supports bold, italic, lists, links." className="w-full h-32 px-3 py-2 border border-border rounded-md bg-card text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select className="h-9 px-3 border border-border rounded-md bg-card text-sm"><option>Priority: Medium</option><option>Urgent</option><option>High</option><option>Low</option></select>
              <select className="h-9 px-3 border border-border rounded-md bg-card text-sm"><option>Category: General</option><option>Event</option><option>Member benefit</option><option>Policy</option><option>Press</option><option>Partner news</option></select>
              <select className="h-9 px-3 border border-border rounded-md bg-card text-sm"><option>Audience: All members</option><option>Specific committee</option><option>Paid only</option><option>Board only</option></select>
              <input type="datetime-local" className="h-9 px-3 border border-border rounded-md bg-card text-sm" />
            </div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Send push notification (est. 500 recipients)</label>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" /> Pin to top</label>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm">Save draft</Button>
              <Button variant="outline" size="sm">Schedule</Button>
              <Button size="sm">Publish now</Button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">Mobile preview</h3>
          <div className="rounded-[28px] border-[8px] border-foreground/90 bg-[hsl(var(--ejb-light-gray))] p-4 aspect-[9/19] max-w-[300px] mx-auto">
            <div className="bg-card rounded-lg p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1.5"><span className="h-1.5 w-1.5 rounded-full bg-destructive" /><span className="text-[10px] uppercase font-semibold text-destructive">Urgent</span></div>
              <div className="text-xs font-bold leading-tight">Last Call: EJB x CIF 2026 Registrations Close Friday</div>
              <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-3">Members who plan to attend the Cairo International Forum representing EJB must register by Friday 2 May.</div>
              <div className="text-[9px] text-muted-foreground mt-2">28 Apr 2026 · 10:30</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
