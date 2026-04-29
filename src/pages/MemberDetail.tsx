import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForMemberStatus, variantForPayment } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { MEMBERS, getCommittee, fmtEGP, fmtDate, MEMBER_NOTES, MEMBER_COMMS, memberStats, CYCLE, memberTier } from "@/data/mock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Linkedin, Copy, MoreHorizontal, Download, Plus, Pin, MessageSquare, Files, ChevronDown, Crown, Check, Circle } from "lucide-react";

const PAYMENT_HISTORY = [
  { cycle: "2026 / 2027", amount: 15000, due: "2026-07-31", status: "Paid", date: "2026-06-12", method: "Bank transfer", ref: "TRX-99821" },
  { cycle: "2025 / 2026", amount: 15000, due: "2025-07-31", status: "Paid", date: "2025-06-30", method: "Bank transfer", ref: "TRX-87412" },
  { cycle: "2024 / 2025", amount: 15000, due: "2024-07-31", status: "Paid", date: "2024-07-04", method: "Cheque", ref: "CHQ-2310" },
  { cycle: "2023 / 2024", amount: 12500, due: "2023-07-31", status: "Partial", date: "2023-08-12", method: "Bank transfer", ref: "TRX-72109" },
  { cycle: "2022 / 2023", amount: 0, due: "2022-07-31", status: "Waived", date: "-", method: "-", ref: "-" },
];

const ACTIVITY = [
  { ts: "2 days ago", actor: "Nour", text: "recorded EGP 15,000 payment via Bank transfer", type: "payment" },
  { ts: "1 week ago", actor: "Mona", text: "added note: 'Confirmed attendance to Annual Summit.'", type: "note" },
  { ts: "2 weeks ago", actor: "Yasmin", text: "RSVP'd for Annual Business Summit 2026", type: "event" },
  { ts: "1 month ago", actor: "System", text: "moved to Active Member status", type: "stage" },
];

const FILES = [
  { name: "Signed application - 2018.pdf", size: "1.1 MB", date: "2018-04-12" },
  { name: "ID copy.pdf", size: "640 KB", date: "2018-04-12" },
  { name: "Receipt - 2026/27.pdf", size: "92 KB", date: "2026-06-12" },
  { name: "Receipt - 2025/26.pdf", size: "92 KB", date: "2025-06-30" },
];

export default function MemberDetail() {
  const { id } = useParams();
  const member = MEMBERS.find((m) => m.id === id) ?? MEMBERS[0];
  const stats = memberStats(member.id);
  const lifetime = PAYMENT_HISTORY.reduce((s, p) => s + p.amount, 0);
  const notes = MEMBER_NOTES.length ? MEMBER_NOTES : [];
  const comms = MEMBER_COMMS.length ? MEMBER_COMMS : [];
  const tier = memberTier(member.id);
  const TIMELINE = [
    { label: "Applied",    date: "12 Apr 2018", done: true },
    { label: "Approved",   date: "28 Apr 2018", done: true },
    { label: "First dues", date: "04 May 2018", done: true },
    { label: "Activated",  date: "04 May 2018", done: true },
    { label: `Renewed ${CYCLE}`, date: "12 Jun 2026", done: member.paymentStatus === "Paid", current: member.paymentStatus !== "Paid" },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="text-xs text-muted-foreground mb-2"><Link to="/members" className="hover:text-foreground">← Back to members</Link></div>
      <PageHeader
        title={member.name}
        description={`${member.position} · ${member.company}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Mail className="h-3.5 w-3.5 mr-1.5" /> Email</Button>
            <Button variant="outline" size="sm" className="h-9">Edit profile</Button>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        {/* Left rail */}
        <aside className="ejb-card p-5 h-fit space-y-4">
          <div className="flex flex-col items-center text-center">
            <Avatar name={member.name} hue={member.avatarHue} size="lg" className="!h-20 !w-20 !text-xl mb-3" />
            <div className="font-bold text-base">{member.name}</div>
            {member.nameAr && <div lang="ar" dir="rtl" className="text-sm text-muted-foreground">{member.nameAr}</div>}
            <div className="text-xs text-muted-foreground mt-1">{member.position}</div>
            <div className="text-xs font-medium">{member.company}</div>
            <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center">
              <StatusChip variant={variantForMemberStatus(member.status)} label={member.status} dot />
              <StatusChip variant={variantForPayment(member.paymentStatus)} label={member.paymentStatus === "Paid" ? `Paid ${CYCLE.split(" / ")[0].slice(2)}/${CYCLE.split(" / ")[1].slice(2)}` : member.paymentStatus} />
              {tier !== "Standard" && (
                <span className={`chip ${tier === "Founding" ? "chip-brand" : "chip-pending"}`}>
                  <Crown className="h-2.5 w-2.5 mr-1" /> {tier}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2.5 text-sm">
            <div className="flex items-center gap-2 group">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs truncate flex-1">{member.email}</span>
              <button className="opacity-0 group-hover:opacity-100"><Copy className="h-3 w-3 text-muted-foreground" /></button>
            </div>
            <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs num">{member.phone}</span></div>
            <div className="flex items-center gap-2"><Linkedin className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs truncate">{member.linkedin}</span></div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-xs">
            <div><div className="ejb-eyebrow">Membership #</div><div className="font-medium num mt-0.5">{member.membershipNo}</div></div>
            <div><div className="ejb-eyebrow">Joined</div><div className="font-medium mt-0.5">{fmtDate(member.joinedDate)}</div></div>
            <div><div className="ejb-eyebrow">City</div><div className="font-medium mt-0.5">{member.city}</div></div>
            <div><div className="ejb-eyebrow">Referred by</div><div className="font-medium num mt-0.5">{member.referredBy ?? "-"}</div></div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3 text-xs">
            <div><div className="ejb-eyebrow">Events attended</div><div className="text-base font-bold num mt-0.5">{stats.eventsAttended}</div></div>
            <div><div className="ejb-eyebrow">Referrals</div><div className="text-base font-bold num mt-0.5">{stats.referrals}</div></div>
            <div><div className="ejb-eyebrow">Chat msgs</div><div className="text-base font-bold num mt-0.5">{stats.chatMessages}</div></div>
            <div><div className="ejb-eyebrow">Lifetime dues</div><div className="text-sm font-bold num mt-0.5">{fmtEGP(lifetime, { compact: true })}</div></div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <Tabs defaultValue="overview">
            <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1">
              {[
                ["overview", "Overview"], ["payments", "Payments"], ["activity", "Activity"],
                ["notes", `Notes · ${notes.length}`], ["comms", `Comms · ${comms.length}`], ["files", `Files · ${FILES.length}`],
              ].map(([t, l]) => (
                <TabsTrigger key={t} value={t} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">
                  {l}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-5 space-y-5">
              <div className="ejb-card p-5">
                <h3 className="text-sm font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">{member.about}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="ejb-card p-4">
                  <h3 className="ejb-eyebrow mb-2">Areas of Focus</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {member.areasOfFocus.map((a) => <StatusChip key={a} variant="brand" label={a} />)}
                  </div>
                </div>
                <div className="ejb-card p-4">
                  <h3 className="ejb-eyebrow mb-2">Products & Services</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {member.productsServices.map((a) => <StatusChip key={a} variant="info" label={a} />)}
                  </div>
                </div>
              </div>
              <div className="ejb-card p-4">
                <h3 className="ejb-eyebrow mb-3">Committees</h3>
                <div className="space-y-2">
                  {member.committees.map((c) => {
                    const cc = getCommittee(c.id);
                    if (!cc) return null;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                        <div>
                          <div className="text-sm font-medium">{cc.name}</div>
                          <div className="text-[11px] text-muted-foreground" lang="ar" dir="rtl">{cc.nameAr}</div>
                        </div>
                        <StatusChip variant={c.role === "Chair" ? "brand" : "neutral"} label={c.role} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payments" className="mt-5">
              <div className="ejb-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="ejb-eyebrow">Lifetime dues paid</div>
                    <div className="text-2xl font-bold num tracking-tight">{fmtEGP(lifetime)}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Across {PAYMENT_HISTORY.filter(p => p.amount > 0).length} cycles</div>
                  </div>
                  <Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Record payment</Button>
                </div>
                <table className="w-full data-table">
                  <thead className="bg-secondary/50"><tr><th>Cycle</th><th>Amount</th><th>Due</th><th>Status</th><th>Paid on</th><th>Method</th><th>Reference</th><th></th></tr></thead>
                  <tbody>
                    {PAYMENT_HISTORY.map((p) => {
                      const dot = p.status === "Paid" ? "bg-[hsl(142_71%_35%)]" : p.status === "Partial" ? "bg-[hsl(38_92%_45%)]" : p.status === "Waived" ? "bg-muted-foreground" : "bg-destructive";
                      return (
                        <tr key={p.cycle}>
                          <td className="font-medium num">{p.cycle}</td>
                          <td className="num">{p.amount ? fmtEGP(p.amount) : "-"}</td>
                          <td className="num text-muted-foreground">{p.due}</td>
                          <td><span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${dot}`} /><span className="text-xs">{p.status}</span></span></td>
                          <td className="num text-muted-foreground">{p.date}</td>
                          <td className="text-muted-foreground">{p.method}</td>
                          <td className="num text-muted-foreground">{p.ref}</td>
                          <td><button className="text-xs text-primary hover:underline"><Download className="h-3 w-3 inline" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              <div className="ejb-card p-5 space-y-3">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                    <Avatar name={a.actor} hue={(a.actor.charCodeAt(0) * 47) % 360} size="sm" square />
                    <div className="flex-1">
                      <div className="text-sm"><span className="font-medium">{a.actor}</span> <span className="text-muted-foreground">{a.text}</span></div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{a.ts}</div>
                    </div>
                    <span className="chip chip-neutral">{a.type}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-5">
              <div className="ejb-card p-5">
                <textarea placeholder="Add a note. Use @ to mention an admin." className="w-full h-20 text-sm border border-border rounded-md p-3 bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex justify-end mt-2"><Button size="sm">Save note</Button></div>
                <div className="mt-5 space-y-3">
                  {notes.map((n) => (
                    <div key={n.id} className="border border-border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Avatar name={n.author} hue={n.hue} size="xs" square />
                        <span className="text-xs font-medium">{n.author}</span>
                        <span className="text-[10px] text-muted-foreground">{n.ts}</span>
                        {n.pinned && <span className="ml-auto chip chip-brand"><Pin className="h-2.5 w-2.5 mr-1" /> Pinned</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comms" className="mt-5">
              <div className="ejb-card overflow-hidden">
                <table className="w-full data-table">
                  <thead className="bg-secondary/50"><tr><th>When</th><th>Channel</th><th>Direction</th><th>Subject</th><th>By</th></tr></thead>
                  <tbody>
                    {comms.map((c) => (
                      <tr key={c.id}>
                        <td className="text-xs text-muted-foreground">{c.ts}</td>
                        <td><StatusChip variant="info" label={c.channel} /></td>
                        <td className="text-xs">{c.direction === "out" ? "→ Out" : "← In"}</td>
                        <td className="text-sm">{c.subject}</td>
                        <td className="text-xs text-muted-foreground">{c.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="files" className="mt-5">
              {FILES.length === 0 ? (
                <EmptyState icon={Files} title="No files attached" description="Signed applications, ID copies, and receipts will appear here." />
              ) : (
                <div className="ejb-card divide-y divide-border">
                  {FILES.map((f) => (
                    <div key={f.name} className="flex items-center gap-3 p-3 hover:bg-secondary/40">
                      <Files className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{f.name}</div>
                        <div className="text-[11px] text-muted-foreground num">{f.size} · {f.date}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs"><Download className="h-3 w-3 mr-1" /> Download</Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
