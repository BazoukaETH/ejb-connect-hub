import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, MapPin, Clock, Users, CheckCircle2, Search,
  UserPlus, Download, QrCode, Trash2, Inbox,
} from "lucide-react";
import { useDemoStore, rsvpCounts, RsvpStatus } from "@/store/demo";
import { fmtDateTime } from "@/data/mock";
import { toast } from "sonner";

const STATUSES: RsvpStatus[] = ["Going", "Maybe", "Declined", "Waitlisted", "No response"];

export default function EventDetail() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const event = useDemoStore((s) => s.events.find((e) => e.id === id));
  const rsvps = useDemoStore((s) => s.rsvps);
  const members = useDemoStore((s) => s.members);
  const setRsvpStatus = useDemoStore((s) => s.setRsvpStatus);
  const toggleCheckIn = useDemoStore((s) => s.toggleCheckIn);
  const bulkRsvpAction = useDemoStore((s) => s.bulkRsvpAction);
  const addRsvp = useDemoStore((s) => s.addRsvp);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | RsvpStatus | "checked-in">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [addOpen, setAddOpen] = useState(false);
  const [pickMember, setPickMember] = useState<string>("");
  const [pickStatus, setPickStatus] = useState<RsvpStatus>("Going");
  const [bulkConfirm, setBulkConfirm] = useState<null | "remove" | "waitlist" | "check-in">(null);

  const counts = useMemo(() => rsvpCounts(rsvps, id), [rsvps, id]);

  const eventRsvps = useMemo(() => rsvps.filter((r) => r.eventId === id), [rsvps, id]);

  const rows = useMemo(() => {
    return eventRsvps
      .map((r) => ({ r, m: members.find((mm) => mm.id === r.memberId) }))
      .filter(({ m, r }) => {
        if (!m) return false;
        if (q && !`${m.name} ${m.company} ${m.membershipNo}`.toLowerCase().includes(q.toLowerCase())) return false;
        if (filter === "checked-in") return r.checkedIn;
        if (filter !== "all" && r.status !== filter) return false;
        return true;
      });
  }, [eventRsvps, members, q, filter]);

  const eligibleMembers = useMemo(
    () => members.filter((m) => !eventRsvps.some((r) => r.memberId === m.id)),
    [members, eventRsvps]
  );

  if (!event) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <Button variant="ghost" size="sm" onClick={() => nav("/events")}><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back</Button>
        <EmptyState icon={Inbox} title="Event not found" description="It may have been deleted." />
      </div>
    );
  }

  const pct = Math.round((event.registered / event.capacity) * 100);
  const allOnPage = rows.map((x) => x.r.id);
  const allChecked = allOnPage.length > 0 && allOnPage.every((id) => selected.has(id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) allOnPage.forEach((id) => next.delete(id));
      else allOnPage.forEach((id) => next.add(id));
      return next;
    });
  };
  const toggleOne = (rid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(rid) ? next.delete(rid) : next.add(rid);
      return next;
    });
  };

  const exportCsv = () => {
    const lines = ["Name,Membership,Company,Status,Checked-in,Plus-one,Dietary"];
    rows.forEach(({ m, r }) => m && lines.push(`"${m.name}",${m.membershipNo},"${m.company}",${r.status},${r.checkedIn ? "Yes" : "No"},${r.plusOne ? "Yes" : "No"},"${r.dietary ?? ""}"`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${event.title.replace(/\s/g, "_")}_roster.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Roster exported", { description: `${rows.length} attendees · CSV` });
  };

  const runBulk = () => {
    if (!bulkConfirm) return;
    bulkRsvpAction(Array.from(selected), bulkConfirm);
    setSelected(new Set());
    setBulkConfirm(null);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <Link to="/events" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-3">
        <ArrowLeft className="h-3 w-3" /> Back to events
      </Link>

      <PageHeader
        title={event.title}
        description={`${event.type} · ${event.location} · ${fmtDateTime(event.date)}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export roster
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={() => toast("Check-in mode", { description: "Open this URL on the door iPad. Demo only." })}>
              <QrCode className="h-3.5 w-3.5 mr-1.5" /> Door check-in
            </Button>
            <Button size="sm" className="h-9" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add RSVP
            </Button>
          </>
        }
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
        {[
          { l: "Capacity", v: `${event.registered}/${event.capacity}`, sub: `${pct}% booked` },
          { l: "Going", v: counts.going, sub: "Confirmed", color: "text-[hsl(var(--success))]" },
          { l: "Maybe", v: counts.maybe, sub: "Soft yes" },
          { l: "Declined", v: counts.declined, sub: "Won't attend", color: "text-muted-foreground" },
          { l: "Waitlisted", v: counts.waitlisted, sub: "Capacity reached" },
          { l: "Checked-in", v: counts.checkedIn, sub: event.status === "Past" ? "Final" : "On door", color: "text-primary" },
        ].map((s) => (
          <div key={s.l} className="ejb-card p-3">
            <div className="ejb-eyebrow">{s.l}</div>
            <div className={`text-xl font-bold num tracking-tight mt-1 ${s.color ?? ""}`}>{s.v}</div>
            <div className="text-[11px] text-muted-foreground">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="ejb-card p-4 mb-5 flex flex-wrap gap-4 items-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {fmtDateTime(event.date)}</span>
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {event.location}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {event.registered} / {event.capacity}</span>
        <StatusChip variant={event.status === "Published" ? "paid" : event.status === "Past" ? "neutral" : "pending"} label={event.status} />
        <p className="basis-full text-foreground/80 text-xs">{event.description}</p>
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[["roster", `Roster · ${eventRsvps.length}`], ["details", "Event details"], ["comms", "Communications"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roster">
          {/* Filter bar */}
          <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search attendee, company, M-#…" className="pl-8 h-8" />
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5 flex-wrap">
              {(["all", ...STATUSES, "checked-in"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`h-7 px-2.5 text-xs rounded ${filter === f ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">{rows.length} shown</span>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="ejb-card p-3 mb-3 flex items-center gap-3 bg-primary/5 border-primary/30 animate-fade-in">
              <span className="text-sm font-medium num">{selected.size} selected</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" className="h-8" onClick={() => setBulkConfirm("check-in")}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Check-in
                </Button>
                <Button size="sm" variant="outline" className="h-8" onClick={() => setBulkConfirm("waitlist")}>Move to waitlist</Button>
                <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30" onClick={() => setBulkConfirm("remove")}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelected(new Set())}>Clear</Button>
              </div>
            </div>
          )}

          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="w-8"><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                  <th>Attendee</th><th>Company</th><th>Status</th><th>+1</th><th>Dietary</th><th>Check-in</th><th>RSVP'd</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ r, m }) => m && (
                  <tr key={r.id} className="hover:bg-secondary/40">
                    <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleOne(r.id)} /></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                        <div>
                          <div className="font-medium text-sm">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground num">{m.membershipNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{m.company}</td>
                    <td>
                      <select
                        value={r.status}
                        onChange={(e) => setRsvpStatus(r.id, e.target.value as RsvpStatus)}
                        className="h-7 text-xs bg-card border border-border rounded px-2"
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="text-xs">{r.plusOne ? "Yes" : "—"}</td>
                    <td className="text-xs text-muted-foreground">{r.dietary ?? "—"}</td>
                    <td>
                      <button
                        onClick={() => toggleCheckIn(r.id)}
                        className={`h-7 px-2.5 text-xs rounded inline-flex items-center gap-1 ${r.checkedIn ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                      >
                        <CheckCircle2 className="h-3 w-3" /> {r.checkedIn ? "Checked-in" : "Check in"}
                      </button>
                    </td>
                    <td className="num text-xs text-muted-foreground">{r.rsvpDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="p-6"><EmptyState icon={Inbox} title="No attendees match" description="Clear search or change filters." compact /></div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="ejb-card p-5 text-sm space-y-3">
            <h3 className="font-semibold">Event details</h3>
            <p className="text-muted-foreground">{event.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><div className="ejb-eyebrow">Type</div><div>{event.type}</div></div>
              <div><div className="ejb-eyebrow">Cost</div><div>{event.cost ? `EGP ${event.cost.toLocaleString()}` : "Free"}</div></div>
              <div><div className="ejb-eyebrow">Capacity</div><div>{event.capacity}</div></div>
              <div><div className="ejb-eyebrow">Status</div><div>{event.status}</div></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comms">
          <div className="ejb-card p-5 text-sm space-y-3">
            <h3 className="font-semibold">Send to roster</h3>
            <p className="text-xs text-muted-foreground">Push or email the {counts.going + counts.maybe} confirmed/maybe attendees.</p>
            <textarea className="w-full h-24 px-3 py-2 border border-border rounded-md bg-card text-sm" placeholder="Message body…" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.success("Reminder queued", { description: `${counts.going + counts.maybe} attendees` })}>Send email</Button>
              <Button size="sm" onClick={() => toast.success("Push sent", { description: `${counts.going + counts.maybe} devices` })}>Send push</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add RSVP modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add RSVP</DialogTitle>
            <DialogDescription>Manually add a member to {event.title}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="ejb-eyebrow">Member</label>
              <select value={pickMember} onChange={(e) => setPickMember(e.target.value)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                <option value="">Pick a member…</option>
                {eligibleMembers.slice(0, 60).map((m) => <option key={m.id} value={m.id}>{m.name} · {m.company}</option>)}
              </select>
            </div>
            <div>
              <label className="ejb-eyebrow">Status</label>
              <select value={pickStatus} onChange={(e) => setPickStatus(e.target.value as RsvpStatus)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card text-sm">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!pickMember} onClick={() => { addRsvp(id, pickMember, pickStatus); setPickMember(""); setAddOpen(false); }}>Add RSVP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk confirm */}
      <Dialog open={!!bulkConfirm} onOpenChange={(o) => !o && setBulkConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm bulk action</DialogTitle>
            <DialogDescription>
              {bulkConfirm === "remove" && `Remove ${selected.size} attendees from this event?`}
              {bulkConfirm === "waitlist" && `Move ${selected.size} attendees to waitlist?`}
              {bulkConfirm === "check-in" && `Mark ${selected.size} attendees as checked-in?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirm(null)}>Cancel</Button>
            <Button variant={bulkConfirm === "remove" ? "destructive" : "default"} onClick={runBulk}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
