import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForMemberStatus } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { COMMITTEES, DOCUMENTS, fmtDate, getCommittee } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import {
  Users, Calendar, Megaphone, ExternalLink, FileText, Plus, Pencil,
  TrendingUp, MessageSquare, Send,
} from "lucide-react";
import { toast } from "sonner";

// The committee assigned to the previewed Committee Heads user.
const MY_COMMITTEE_ID = "c-health";
const MY_CHAIR_NAME = "Laila El-Sayed";

interface DemoMeeting {
  id: string;
  date: string;
  location: string;
  agenda: string;
  attendance?: number;
  minutes?: string;
  status: "Past" | "Upcoming";
}

const SEED_MEETINGS: DemoMeeting[] = [
  { id: "mt-1", date: "2026-05-20T17:00:00", location: "EJB HQ, Cairo", agenda: "1. Pharma price review · 2. Healthcare investment policy · 3. New member intros", status: "Upcoming" },
  { id: "mt-2", date: "2026-04-15T17:00:00", location: "EJB HQ, Cairo", agenda: "Q1 review, regulator updates, FY27 priorities.", attendance: 22, minutes: "Discussion on health insurance reform; agreed to draft position paper by 30 May.", status: "Past" },
  { id: "mt-3", date: "2026-03-11T17:00:00", location: "Four Seasons Nile Plaza", agenda: "Joint session with Industry & Energy committee.", attendance: 27, minutes: "Cross-committee initiative on local pharma manufacturing endorsed.", status: "Past" },
];

export default function MyCommittee() {
  const committee = useMemo(() => getCommittee(MY_COMMITTEE_ID) ?? COMMITTEES[0], []);
  const members = useDemoStore((s) => s.members);
  const announcements = useDemoStore((s) => s.announcements);

  const myMembers = useMemo(
    () => members.filter((m) => m.committees.some((c) => c.id === committee.id)),
    [members, committee.id]
  );

  // Only announcements scoped to this committee (heuristic for demo)
  const myAnnouncements = useMemo(
    () => announcements.filter((a) =>
      a.audienceSpec?.committeeId === committee.id ||
      a.audience?.toLowerCase().includes(committee.name.toLowerCase())
    ),
    [announcements, committee]
  );

  const upcoming = SEED_MEETINGS.find((m) => m.status === "Upcoming")!;
  const lastPast = SEED_MEETINGS.find((m) => m.status === "Past")!;
  const lastAnnouncement = announcements[0];

  const [meetings, setMeetings] = useState<DemoMeeting[]>(SEED_MEETINGS);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const [agendaDraft, setAgendaDraft] = useState(upcoming.agenda);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [newMeeting, setNewMeeting] = useState({ date: "", location: "", agenda: "" });

  const saveAgenda = () => {
    setMeetings((prev) => prev.map((m) => m.id === upcoming.id ? { ...m, agenda: agendaDraft } : m));
    setAgendaOpen(false);
    toast.success("Agenda updated", { description: "Members will see the new agenda in the app." });
  };

  const scheduleMeeting = () => {
    if (!newMeeting.date || !newMeeting.location) {
      toast.error("Date and location are required.");
      return;
    }
    const m: DemoMeeting = {
      id: `mt-${Date.now()}`,
      date: newMeeting.date, location: newMeeting.location,
      agenda: newMeeting.agenda || "Agenda TBD", status: "Upcoming",
    };
    setMeetings((prev) => [m, ...prev]);
    setScheduleOpen(false);
    setNewMeeting({ date: "", location: "", agenda: "" });
    toast.success("Meeting scheduled", { description: `${m.location} · ${fmtDate(m.date)}` });
  };

  const lastActive30d = Math.max(5, Math.round(myMembers.length * 0.78));

  return (
    <div className="p-6 max-w-[1500px] mx-auto animate-fade-in">
      <PageHeader
        title="My Committee"
        description={`Workspace for the ${committee.name} chair`}
      />

      {/* Header strip */}
      <div className="ejb-card p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {committee.name.charAt(0)}
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">{committee.name}</div>
              <div className="text-sm text-muted-foreground" dir="rtl">{committee.nameAr}</div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Chair · <span className="font-medium text-foreground">{MY_CHAIR_NAME}</span></span>
                <span>{myMembers.length} members</span>
                <span>Last meeting · {fmtDate(lastPast.date)}</span>
                <span>Next meeting · {fmtDate(upcoming.date)}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <a href={`https://ejb.org.eg/committees/${committee.id}`} target="_blank" rel="noreferrer">
              Public page <ExternalLink className="h-3 w-3 ml-1.5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Three primary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Committee health</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <dl className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Active (last 30d)</dt>
              <dd className="font-semibold num">{lastActive30d} / {myMembers.length}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Attendance at last meeting</dt>
              <dd className="font-semibold num">{lastPast.attendance} ({Math.round((lastPast.attendance! / myMembers.length) * 100)}%)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Messages this month</dt>
              <dd className="font-semibold num">142</dd>
            </div>
          </dl>
        </div>

        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Next meeting</h3>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-sm font-semibold">{fmtDate(upcoming.date)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{upcoming.location}</div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{upcoming.agenda}</p>
          <Button size="sm" variant="outline" className="h-7 text-xs mt-3" onClick={() => { setAgendaDraft(upcoming.agenda); setAgendaOpen(true); }}>
            <Pencil className="h-3 w-3 mr-1.5" /> Edit agenda
          </Button>
        </div>

        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Recent announcement</h3>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </div>
          {lastAnnouncement ? (
            <>
              <div className="text-sm font-semibold line-clamp-2">{lastAnnouncement.title}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {lastAnnouncement.publishedAt ? fmtDate(lastAnnouncement.publishedAt) : "Scheduled"} ·
                {" "}{lastAnnouncement.openRate ?? 0}% open rate
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No announcements yet.</p>
          )}
          <Button asChild size="sm" variant="outline" className="h-7 text-xs mt-3">
            <Link to="/announcements"><Plus className="h-3 w-3 mr-1.5" /> Post new</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1">
          {[["members","Members"],["meetings","Meetings"],["announcements","Announcements"],["library","Library"]].map(([v,l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50"><tr><th>Member</th><th>Company</th><th>Role</th><th>Status</th><th>Last active</th><th></th></tr></thead>
              <tbody>
                {myMembers.map((m) => {
                  const cm = m.committees.find((c) => c.id === committee.id)!;
                  return (
                    <tr key={m.id} className="hover:bg-secondary/40">
                      <td>
                        <Link to={`/members/${m.id}`} className="flex items-center gap-2.5">
                          <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                          <span className="font-medium text-sm">{m.name}</span>
                        </Link>
                      </td>
                      <td className="text-xs text-muted-foreground">{m.company}</td>
                      <td className="text-xs">{cm.role}</td>
                      <td><StatusChip variant={variantForMemberStatus(m.status)} label={m.status} dot /></td>
                      <td className="text-xs text-muted-foreground">{m.lastContacted ?? "-"}</td>
                      <td className="text-right">
                        <Button asChild size="sm" variant="ghost" className="h-7 text-xs">
                          <Link to={`/announcements?to=${m.id}`}>
                            <Send className="h-3 w-3 mr-1.5" /> Send message
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {myMembers.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-xs text-muted-foreground py-8">No members assigned to this committee yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="meetings" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button size="sm" className="h-8 text-xs" onClick={() => setScheduleOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Schedule new meeting
            </Button>
          </div>
          <div className="space-y-2">
            {meetings.map((m) => (
              <div key={m.id} className="ejb-card p-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{fmtDate(m.date)}</span>
                    <StatusChip variant={m.status === "Past" ? "neutral" : "info"} label={m.status} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.location}</div>
                  <p className="text-xs mt-2">{m.agenda}</p>
                  {m.minutes && <p className="text-[11px] text-muted-foreground mt-1.5"><span className="font-medium text-foreground">Minutes:</span> {m.minutes}</p>}
                </div>
                {m.attendance !== undefined && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Attendance</div>
                    <div className="text-lg font-bold num">{m.attendance}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button asChild size="sm" className="h-8 text-xs">
              <Link to={`/announcements?committee=${committee.id}`}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New announcement
              </Link>
            </Button>
          </div>
          {myAnnouncements.length === 0 ? (
            <div className="ejb-card p-8 text-center text-xs text-muted-foreground">
              No committee-scoped announcements yet. Use "New announcement" to post one to your members.
            </div>
          ) : (
            <div className="space-y-2">
              {myAnnouncements.map((a) => (
                <div key={a.id} className="ejb-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-sm">{a.title}</div>
                    <StatusChip variant="info" label={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                  <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-3">
                    <span>{a.publishedAt ? fmtDate(a.publishedAt) : "Scheduled"}</span>
                    {a.openRate !== undefined && <span>{a.openRate}% opened</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          <div className="text-[11px] text-muted-foreground mb-2">Documents tagged to {committee.name} plus the global Library (read-only).</div>
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50"><tr><th>Name</th><th>Category</th><th>Size</th><th>Uploaded</th><th>Downloads</th></tr></thead>
              <tbody>
                {DOCUMENTS.map((d) => (
                  <tr key={d.id}>
                    <td><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-destructive" /><span className="font-medium text-sm">{d.name}</span></div></td>
                    <td className="text-xs">{d.category}</td>
                    <td className="text-xs num text-muted-foreground">{d.size}</td>
                    <td className="text-xs text-muted-foreground">{d.uploadedAt}</td>
                    <td className="text-xs num text-muted-foreground">{d.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit agenda dialog */}
      <Dialog open={agendaOpen} onOpenChange={setAgendaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit agenda</DialogTitle>
            <DialogDescription>{fmtDate(upcoming.date)} · {upcoming.location}</DialogDescription>
          </DialogHeader>
          <Textarea rows={6} value={agendaDraft} onChange={(e) => setAgendaDraft(e.target.value)} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAgendaOpen(false)}>Cancel</Button>
            <Button onClick={saveAgenda}>Save agenda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule meeting dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule new meeting</DialogTitle>
            <DialogDescription>Members will be notified once published.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Date & time</Label>
              <Input type="datetime-local" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Location</Label>
              <Input value={newMeeting.location} onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })} placeholder="EJB HQ, Cairo" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Agenda preview</Label>
              <Textarea rows={4} value={newMeeting.agenda} onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })} placeholder="Topics to cover…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={scheduleMeeting}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
