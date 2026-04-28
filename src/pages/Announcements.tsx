import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip, variantForPriority } from "@/components/StatusChip";
import { ANNOUNCEMENTS, fmtDateTime } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Bell, Pin, Image as ImageIcon, Link2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PRIORITY_DOT: Record<string, string> = {
  Urgent: "bg-destructive",
  High: "bg-[hsl(var(--ejb-amber))]",
  Medium: "bg-[hsl(var(--info))]",
  Low: "bg-muted-foreground",
};

export default function Announcements() {
  const [title, setTitle] = useState("Last Call: EJB x CIF 2026 Registrations Close Friday");
  const [body, setBody] = useState("Members who plan to attend the Cairo International Forum representing EJB must register by Friday 2 May. Limited delegate slots remain.");
  const [priority, setPriority] = useState<"Urgent" | "High" | "Medium" | "Low">("Urgent");
  const [audience, setAudience] = useState("All members");
  const [pin, setPin] = useState(true);
  const [push, setPush] = useState(true);

  const audienceCount = audience === "Paid only" ? 372 : audience === "Board only" ? 12 : 500;

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Announcements"
        description="Drives the Updates tab in the mobile app · push enabled members: 487"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> New announcement</Button>}
      />

      <Tabs defaultValue="published">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[["published", "Published"], ["scheduled", "Scheduled"], ["drafts", "Drafts"], ["compose", "Compose"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="published">
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr><th>Title</th><th>Priority</th><th>Category</th><th>Audience</th><th>When</th><th>Author</th><th>Reach</th><th>Open rate</th><th>Status</th></tr>
              </thead>
              <tbody>
                {ANNOUNCEMENTS.filter(a => a.status === "Published").map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/40 cursor-pointer">
                    <td><div className="font-medium text-sm max-w-[280px] truncate">{a.title}</div></td>
                    <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                    <td className="text-xs">{a.category}</td>
                    <td className="text-xs text-muted-foreground">{a.audience}</td>
                    <td className="num text-xs text-muted-foreground">{a.publishedAt && fmtDateTime(a.publishedAt)}</td>
                    <td className="text-xs">{a.author}</td>
                    <td className="num text-xs">{a.reach ? `${a.reach.sent} / ${a.reach.total}` : "—"}</td>
                    <td className="num text-xs">
                      {a.openRate != null && (
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-[hsl(var(--success))]" style={{ width: `${a.openRate}%` }} />
                          </div>
                          {a.openRate}%
                        </div>
                      )}
                    </td>
                    <td><StatusChip variant="paid" label="Published" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="scheduled">
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50"><tr><th>Title</th><th>Priority</th><th>Audience</th><th>Scheduled for</th><th>Author</th><th></th></tr></thead>
              <tbody>
                {ANNOUNCEMENTS.filter(a => a.status === "Scheduled").map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-sm">{a.title}</td>
                    <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                    <td className="text-xs">{a.audience}</td>
                    <td className="num text-xs text-muted-foreground">{a.scheduledFor && fmtDateTime(a.scheduledFor)}</td>
                    <td className="text-xs">{a.author}</td>
                    <td><Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <EmptyState icon={Bell} title="No drafts yet" description="Drafts you save in the composer will land here for the team to review before publishing." />
        </TabsContent>

        <TabsContent value="compose">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            <div className="ejb-card p-5">
              <h3 className="text-sm font-semibold mb-3">Composer</h3>
              <div className="space-y-3 text-sm">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full h-10 px-3 border border-border rounded-md bg-card font-medium" />
                <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body. Supports bold, italic, lists, links." className="w-full h-32 px-3 py-2 border border-border rounded-md bg-card text-sm" />

                <div className="flex items-center gap-1 text-muted-foreground text-xs">
                  <button className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center"><strong>B</strong></button>
                  <button className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center italic">I</button>
                  <button className="h-7 px-2 rounded hover:bg-secondary text-xs">• List</button>
                  <button className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center"><Link2 className="h-3.5 w-3.5" /></button>
                  <button className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center"><ImageIcon className="h-3.5 w-3.5" /></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="ejb-eyebrow">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                      <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="ejb-eyebrow">Category</label>
                    <select className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                      <option>Event</option><option>Member benefit</option><option>Policy</option><option>Press</option><option>Partner news</option><option>General</option>
                    </select>
                  </div>
                  <div>
                    <label className="ejb-eyebrow">Audience</label>
                    <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                      <option>All members</option><option>Paid only</option><option>Specific committee</option><option>Board only</option>
                    </select>
                  </div>
                  <div>
                    <label className="ejb-eyebrow">Schedule</label>
                    <input type="datetime-local" className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm" />
                  </div>
                </div>

                <div className="rounded-md bg-secondary/40 border border-border p-3 space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
                    Send push notification <span className="text-muted-foreground">· est. {audienceCount} recipients</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} />
                    Pin to top of Updates feed for 7 days
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="ghost" size="sm">Save draft</Button>
                  <Button variant="outline" size="sm">Schedule</Button>
                  <Button size="sm" onClick={() => toast({ title: "Announcement published", description: `Sent to ${audienceCount} members.` })}>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Publish now
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="ejb-eyebrow">Live mobile preview</h3>
                <span className="text-[10px] text-muted-foreground">EJB Member App · iOS</span>
              </div>
              <div className="rounded-[36px] border-[10px] border-foreground/90 bg-[hsl(var(--ejb-light-gray))] p-3 max-w-[280px] mx-auto shadow-xl">
                {/* notch */}
                <div className="h-5 flex items-center justify-center">
                  <div className="h-1 w-12 rounded-full bg-foreground/20" />
                </div>
                <div className="px-1 pt-2 pb-3 flex items-center justify-between text-[10px] font-semibold">
                  <span className="num">9:41</span>
                  <span>Updates</span>
                  <Bell className="h-3 w-3" />
                </div>
                <div className="bg-card rounded-xl p-3 shadow-sm animate-fade-in">
                  {pin && (
                    <div className="flex items-center gap-1 text-[9px] text-primary mb-1.5">
                      <Pin className="h-2.5 w-2.5" /> PINNED
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
                    <span className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: priority === "Urgent" ? "hsl(var(--destructive))" : priority === "High" ? "hsl(var(--ejb-amber))" : "hsl(var(--info))" }}>
                      {priority}
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-tight">{title || "Announcement title"}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5 line-clamp-3">{body || "Announcement body preview."}</div>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground mt-2 pt-2 border-t border-border">
                    <span>Now · EJB</span>
                    <span>{audience}</span>
                  </div>
                </div>
                {push && (
                  <div className="mt-2 bg-foreground/90 text-background rounded-lg p-2 text-[10px] animate-slide-in-right">
                    <div className="font-semibold">EJB</div>
                    <div className="opacity-90 line-clamp-2">{title || "New announcement"}</div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-3">Updates as you type</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
