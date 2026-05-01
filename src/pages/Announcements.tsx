import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip, variantForPriority } from "@/components/StatusChip";
import { fmtDateTime, Announcement, COMMITTEES, AREAS_OF_FOCUS, AudienceType } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/EmptyState";
import { Plus, Bell, Pin, Image as ImageIcon, Link2, Send, X, Search } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { toast } from "sonner";

const PRIORITY_DOT: Record<string, string> = {
  Urgent: "bg-destructive",
  High: "bg-[hsl(var(--ejb-amber))]",
  Medium: "bg-[hsl(var(--info))]",
  Low: "bg-muted-foreground",
};

export default function Announcements() {
  const announcements = useDemoStore((s) => s.announcements);
  const addAnnouncement = useDemoStore((s) => s.addAnnouncement);
  const members = useDemoStore((s) => s.members);
  const { query: globalQ } = useGlobalSearch();

  const [tab, setTab] = useState<"published" | "scheduled" | "drafts" | "compose">("published");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<Announcement["priority"]>("Medium");
  const [category, setCategory] = useState("General");
  const [audienceType, setAudienceType] = useState<AudienceType>("All members");
  const [committeeId, setCommitteeId] = useState<string>(COMMITTEES[0].id);
  const [areaOfFocus, setAreaOfFocus] = useState<string>(AREAS_OF_FOCUS[0]);
  const [city, setCity] = useState<string>("Cairo");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [memberPickerQ, setMemberPickerQ] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [pin, setPin] = useState(true);
  const [push, setPush] = useState(true);

  const cities = useMemo(() => Array.from(new Set(members.map((m) => m.city))).sort(), [members]);

  // Resolve recipients
  const resolvedRecipients = useMemo(() => {
    switch (audienceType) {
      case "All members": return members;
      case "Paid only": return members.filter((m) => m.paymentStatus === "Paid");
      case "Specific committee": return members.filter((m) => m.committees.some((c) => c.id === committeeId));
      case "Specific Area of Focus": return members.filter((m) => m.areasOfFocus.includes(areaOfFocus));
      case "Specific city": return members.filter((m) => m.city === city);
      case "Specific person": return members.filter((m) => memberIds.includes(m.id));
      default: return members;
    }
  }, [audienceType, members, committeeId, areaOfFocus, city, memberIds]);
  const audienceCount = resolvedRecipients.length;

  const audienceSummary = (): string => {
    switch (audienceType) {
      case "All members": return `All members (${audienceCount})`;
      case "Paid only": return `Paid members (${audienceCount})`;
      case "Specific committee": return `${COMMITTEES.find(c => c.id === committeeId)?.name ?? ""} committee (${audienceCount})`;
      case "Specific Area of Focus": return `${areaOfFocus} focus (${audienceCount})`;
      case "Specific city": return `${city} (${audienceCount})`;
      case "Specific person": {
        if (memberIds.length === 0) return "0 recipients";
        const first = members.find((m) => m.id === memberIds[0])?.name ?? "Recipient";
        return memberIds.length === 1 ? first : `${first} + ${memberIds.length - 1} other${memberIds.length > 2 ? "s" : ""}`;
      }
      default: return `${audienceCount} recipients`;
    }
  };

  const filtered = useMemo(() => {
    if (!globalQ) return announcements;
    const q = globalQ.toLowerCase();
    return announcements.filter((a) => `${a.title} ${a.body} ${a.category}`.toLowerCase().includes(q));
  }, [announcements, globalQ]);

  const reset = () => { setTitle(""); setBody(""); setScheduledFor(""); setMemberIds([]); setMemberPickerQ(""); };

  const publish = (status: "Published" | "Scheduled" | "Draft") => {
    if (!title.trim() || !body.trim()) { toast.error("Title and body required"); return; }
    if (status === "Scheduled" && !scheduledFor) { toast.error("Pick a schedule date/time"); return; }
    if (audienceType === "Specific person" && memberIds.length === 0) { toast.error("Pick at least one recipient"); return; }
    const audienceSpec = {
      type: audienceType,
      committeeId: audienceType === "Specific committee" ? committeeId : undefined,
      areaOfFocus: audienceType === "Specific Area of Focus" ? areaOfFocus : undefined,
      city: audienceType === "Specific city" ? city : undefined,
      memberIds: audienceType === "Specific person" ? memberIds : undefined,
    };
    const perRecipient = audienceType === "Specific person"
      ? resolvedRecipients.map((m) => ({ memberId: m.id, delivered: status === "Published", opened: false }))
      : undefined;
    addAnnouncement({
      title, body, priority, category,
      audience: audienceSummary(),
      audienceSpec,
      recipientCount: audienceCount,
      perRecipient,
      status,
      scheduledFor: status === "Scheduled" ? scheduledFor : undefined,
    });
    const verb = status === "Published" ? "Published" : status === "Scheduled" ? "Scheduled" : "Draft saved";
    const desc = status === "Published" ? `Sent to ${audienceCount} members${push ? " · push delivered" : ""}` : status === "Scheduled" ? `Will publish ${scheduledFor}` : "Available in Drafts";
    toast.success(verb, { description: desc });
    reset();
    setTab(status === "Draft" ? "drafts" : status === "Scheduled" ? "scheduled" : "published");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Announcements"
        description="Drives the Updates tab in the mobile app · push enabled members: 487"
        actions={<Button size="sm" className="h-9" onClick={() => setTab("compose")}><Plus className="h-3.5 w-3.5 mr-1.5" /> New announcement</Button>}
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[
            ["published", `Published · ${filtered.filter(a => a.status === "Published").length}`],
            ["scheduled", `Scheduled · ${filtered.filter(a => a.status === "Scheduled").length}`],
            ["drafts", `Drafts · ${filtered.filter(a => a.status === "Draft").length}`],
            ["compose", "Compose"],
          ].map(([v, l]) => (
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
                {filtered.filter(a => a.status === "Published").map((a) => (
                  <tr key={a.id} className="hover:bg-secondary/40 cursor-pointer">
                    <td><div className="font-medium text-sm max-w-[280px] truncate">{a.title}</div></td>
                    <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                    <td className="text-xs">{a.category}</td>
                    <td className="text-xs text-muted-foreground">{a.audience}</td>
                    <td className="num text-xs text-muted-foreground">{a.publishedAt && fmtDateTime(a.publishedAt)}</td>
                    <td className="text-xs">{a.author}</td>
                    <td className="num text-xs">{a.reach ? `${a.reach.sent} / ${a.reach.total}` : "-"}</td>
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
                {filtered.filter(a => a.status === "Scheduled").map((a) => (
                  <tr key={a.id}>
                    <td className="font-medium text-sm">{a.title}</td>
                    <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                    <td className="text-xs">{a.audience}</td>
                    <td className="num text-xs text-muted-foreground">{a.scheduledFor && fmtDateTime(a.scheduledFor)}</td>
                    <td className="text-xs">{a.author}</td>
                    <td><Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast("Edit flow opened (demo only)")}>Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.filter(a => a.status === "Scheduled").length === 0 && (
              <div className="p-6"><EmptyState icon={Bell} title="No scheduled announcements" description="Schedule one from the Compose tab." compact /></div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          {filtered.filter(a => a.status === "Draft").length === 0 ? (
            <EmptyState icon={Bell} title="No drafts yet" description="Drafts you save in the composer will land here for the team to review before publishing." />
          ) : (
            <div className="ejb-card overflow-hidden">
              <table className="w-full data-table">
                <thead className="bg-secondary/50"><tr><th>Title</th><th>Priority</th><th>Audience</th><th>Author</th><th></th></tr></thead>
                <tbody>
                  {filtered.filter(a => a.status === "Draft").map((a) => (
                    <tr key={a.id}>
                      <td className="font-medium text-sm">{a.title}</td>
                      <td><StatusChip variant={variantForPriority(a.priority)} label={a.priority} dot /></td>
                      <td className="text-xs">{a.audience}</td>
                      <td className="text-xs">{a.author}</td>
                      <td><Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTab("compose")}>Open</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Announcement["priority"])} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                      <option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="ejb-eyebrow">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                      <option>Event</option><option>Member benefit</option><option>Policy</option><option>Press</option><option>Partner news</option><option>General</option>
                    </select>
                  </div>
                  <div>
                    <label className="ejb-eyebrow">Schedule</label>
                    <input type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm" />
                  </div>
                </div>

                {/* Audience picker */}
                <div className="rounded-md border border-border p-3 space-y-3 bg-secondary/30">
                  <div className="flex items-center justify-between">
                    <label className="ejb-eyebrow">Audience</label>
                    <span className="text-[11px] text-muted-foreground">Resolved: <strong className="text-foreground num">{audienceCount}</strong> recipient{audienceCount === 1 ? "" : "s"}</span>
                  </div>
                  <select value={audienceType} onChange={(e) => setAudienceType(e.target.value as AudienceType)} className="w-full h-9 px-3 border border-border rounded-md bg-card text-sm">
                    <option>All members</option>
                    <option>Paid only</option>
                    <option>Specific committee</option>
                    <option>Specific Area of Focus</option>
                    <option>Specific city</option>
                    <option>Specific person</option>
                  </select>

                  {audienceType === "Specific committee" && (
                    <select value={committeeId} onChange={(e) => setCommitteeId(e.target.value)} className="w-full h-9 px-3 border border-border rounded-md bg-card text-sm">
                      {COMMITTEES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}

                  {audienceType === "Specific Area of Focus" && (
                    <select value={areaOfFocus} onChange={(e) => setAreaOfFocus(e.target.value)} className="w-full h-9 px-3 border border-border rounded-md bg-card text-sm">
                      {AREAS_OF_FOCUS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  )}

                  {audienceType === "Specific city" && (
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-9 px-3 border border-border rounded-md bg-card text-sm">
                      {cities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  )}

                  {audienceType === "Specific person" && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input value={memberPickerQ} onChange={(e) => setMemberPickerQ(e.target.value)} placeholder="Search by name, company, email…" className="pl-8 h-8" />
                      </div>
                      {memberPickerQ.trim() && (
                        <div className="max-h-44 overflow-y-auto border border-border rounded-md bg-card divide-y divide-border">
                          {members
                            .filter((m) => !memberIds.includes(m.id))
                            .filter((m) => `${m.name} ${m.company} ${m.email}`.toLowerCase().includes(memberPickerQ.toLowerCase()))
                            .slice(0, 8)
                            .map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => { setMemberIds([...memberIds, m.id]); setMemberPickerQ(""); }}
                                className="w-full flex items-center gap-2 p-2 text-left hover:bg-secondary/60"
                              >
                                <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{m.name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{m.company} · {m.email}</div>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                      {memberIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {memberIds.map((id) => {
                            const m = members.find((mm) => mm.id === id);
                            if (!m) return null;
                            return (
                              <span key={id} className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 bg-card border border-border rounded-full text-[11px]">
                                <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                                {m.name}
                                <button type="button" onClick={() => setMemberIds(memberIds.filter((x) => x !== id))} className="text-muted-foreground hover:text-destructive">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
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
                  <Button variant="ghost" size="sm" onClick={() => publish("Draft")}>Save draft</Button>
                  <Button variant="outline" size="sm" onClick={() => publish("Scheduled")}>Schedule</Button>
                  <Button size="sm" onClick={() => publish("Published")}>
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
