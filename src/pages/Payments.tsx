import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import {
  CYCLE_DUE_AMOUNT, CYCLE_CLOSE,
  TOTAL_MEMBERS, PAID_COUNT, UNPAID_COUNT, fmtEGP, CYCLE_WEEKLY,
  AGING_BUCKETS,
} from "@/data/mock";
import { useDemoStore, CYCLES, CycleName, Tx } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Download, Plus, Lock, Search,
  AlertTriangle, CheckCircle2, Mail, Receipt, Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { toast } from "sonner";

const collected = PAID_COUNT * CYCLE_DUE_AMOUNT;
const expected = TOTAL_MEMBERS * CYCLE_DUE_AMOUNT;
const outstanding = UNPAID_COUNT * CYCLE_DUE_AMOUNT;

const MONTHLY = [
  { m: "Feb", v: 0.4 }, { m: "Mar", v: 0.9 }, { m: "Apr", v: 2.1 },
  { m: "May", v: 1.4 }, { m: "Jun", v: 0.6 }, { m: "Jul", v: 0.18 },
];

export default function Payments() {
  const members = useDemoStore((s) => s.members);
  const transactions = useDemoStore((s) => s.transactions);
  const selectedCycle = useDemoStore((s) => s.selectedCycle);
  const setSelectedCycle = useDemoStore((s) => s.setSelectedCycle);
  const cyclesOpen = useDemoStore((s) => s.cyclesOpen);
  const recordPayment = useDemoStore((s) => s.recordPayment);
  const closeCycle = useDemoStore((s) => s.closeCycle);
  const { query: globalQ } = useGlobalSearch();

  const [closeOpen, setCloseOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [nextDues, setNextDues] = useState(15000);
  const [localQ, setLocalQ] = useState("");
  const q = globalQ || localQ;
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [recordDraft, setRecordDraft] = useState({ amount: 15000, method: "Bank transfer" as Tx["method"], ref: "", date: "2026-04-28" });

  const paidPct = Math.round((PAID_COUNT / TOTAL_MEMBERS) * 100);
  const daysLeft = 94;
  const isCycleOpen = cyclesOpen[selectedCycle];

  const cycleIdx = CYCLES.indexOf(selectedCycle);

  const rows = useMemo(() => {
    return members.slice(0, 28).map((m, i) => {
      const tx = transactions.find((t) => t.cycle === selectedCycle && t.memberId === m.id);
      const paid = !!tx || (selectedCycle === "2026 / 2027" && i < 21);
      return {
        member: m,
        paid,
        paidOn: tx?.date ?? (paid ? "2026-06-12" : null),
        method: tx?.method ?? (paid ? "Bank transfer" : null),
        reminder: !paid && i % 2 === 0 ? "Sent 3 days ago" : null,
        daysOverdue: paid ? 0 : 4 + (i - 21) * 3,
      };
    }).filter((r) => {
      if (q && !`${r.member.name} ${r.member.company} ${r.member.membershipNo}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "paid" && !r.paid) return false;
      if (filter === "unpaid" && r.paid) return false;
      return true;
    });
  }, [members, transactions, selectedCycle, q, filter]);

  const handleClose = () => {
    closeCycle();
    setCloseOpen(false);
    setConfirmText("");
  };

  const handleRecord = () => {
    if (!activeMemberId) return;
    recordPayment(activeMemberId, recordDraft.amount, recordDraft.method, recordDraft.ref || `TRX-${Date.now()}`);
    setRecordOpen(false);
    setActiveMemberId(null);
  };

  const openRecord = (memberId: string) => {
    setActiveMemberId(memberId);
    setRecordDraft({ amount: 15000, method: "Bank transfer", ref: "", date: new Date().toISOString().slice(0, 10) });
    setRecordOpen(true);
  };

  const activeMember = members.find((m) => m.id === activeMemberId);


  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Payments & Dues"
        description={`Cycle ${selectedCycle} · ${isCycleOpen ? `closes ${CYCLE_CLOSE} · ${daysLeft} days left` : "closed"}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
            <Button variant="outline" size="sm" className="h-9"><Mail className="h-3.5 w-3.5 mr-1.5" /> Send reminders ({UNPAID_COUNT})</Button>
            <Button variant="outline" size="sm" className="h-9 border-destructive/30 text-destructive hover:bg-destructive/10" disabled={!isCycleOpen} onClick={() => setCloseOpen(true)}>
              <Lock className="h-3.5 w-3.5 mr-1.5" /> {isCycleOpen ? "Close cycle" : "Cycle closed"}
            </Button>
          </>
        }
      />

      {/* Cycle selector + summary strip */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={cycleIdx === CYCLES.length - 1} onClick={() => setSelectedCycle(CYCLES[Math.min(CYCLES.length - 1, cycleIdx + 1)])}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="px-4 h-8 flex items-center bg-card border border-border rounded-md text-sm font-medium num">
          Cycle {selectedCycle} {!isCycleOpen && <span className="ml-2 text-[10px] uppercase tracking-wider text-muted-foreground">closed</span>}
        </div>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={cycleIdx === 0} onClick={() => setSelectedCycle(CYCLES[Math.max(0, cycleIdx - 1)])}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground ml-2">Use ← → to compare cycles</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        {[
          { label: "Total expected", value: fmtEGP(expected, { compact: true }), sub: `${TOTAL_MEMBERS} members × ${fmtEGP(CYCLE_DUE_AMOUNT, { compact: true })}` },
          { label: "Collected", value: fmtEGP(collected, { compact: true }), sub: `${PAID_COUNT} paid`, color: "text-[hsl(var(--success))]" },
          { label: "Outstanding", value: fmtEGP(outstanding, { compact: true }), sub: `${UNPAID_COUNT} unpaid`, color: "text-destructive" },
          { label: "% paid", value: `${paidPct}%`, sub: "Last cycle 91%" },
          { label: "Avg days to pay", value: "11d", sub: "From invoice issued" },
          { label: "Reminder open rate", value: "63%", sub: "Last batch · email" },
        ].map((s) => (
          <div key={s.label} className="ejb-card p-3 hover:shadow-md transition-shadow">
            <div className="ejb-eyebrow">{s.label}</div>
            <div className={`text-xl font-bold num tracking-tight mt-1 ${s.color ?? ""}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar with milestones */}
      <div className="ejb-card p-4 mb-5">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="ejb-eyebrow">Cycle progress</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold num tracking-tight">{paidPct}%</span>
              <span className="text-xs text-muted-foreground num">{fmtEGP(collected, { compact: true })} of {fmtEGP(expected, { compact: true })}</span>
            </div>
          </div>
          <div className="text-right text-[11px] text-muted-foreground">
            <div>Target by close: <span className="font-medium text-foreground num">95%</span></div>
            <div className="num">{daysLeft} days remaining</div>
          </div>
        </div>
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--success))] to-[hsl(142_71%_45%)] transition-[width] duration-500" style={{ width: `${paidPct}%` }} />
          <div className="absolute inset-y-0" style={{ left: "70%" }}>
            <div className="h-full w-px bg-foreground/30" />
          </div>
          <div className="absolute inset-y-0" style={{ left: "95%" }}>
            <div className="h-full w-px bg-foreground/40" />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 num">
          <span>0%</span><span style={{ marginLeft: "62%" }}>Comfort 70%</span><span>Target 95%</span>
        </div>
        <div className="h-20 mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CYCLE_WEEKLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid hsl(var(--border))", borderRadius: 6 }} formatter={(v: number) => [`${v}M EGP`, "Cumulative"]} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="member">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1">
          {[["member", "By Member"], ["payment", "By Payment"], ["method", "By Method"], ["aging", "Aging"], ["month", "By Month"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="member" className="mt-4">
          <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search member, company, M-#…" className="pl-8 h-8" />
            </div>
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              {(["all", "paid", "unpaid"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`h-7 px-2.5 text-xs rounded capitalize ${filter === f ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">{rows.length} members</span>
          </div>

          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="w-8"><input type="checkbox" /></th>
                  <th>Member</th><th>Membership #</th><th>Amount</th><th>Status</th><th>Paid on</th><th>Method</th><th>Reminder</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.member.id} className="hover:bg-secondary/40">
                    <td><input type="checkbox" /></td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.member.name} hue={r.member.avatarHue} size="sm" />
                        <div><div className="font-medium text-sm">{r.member.name}</div><div className="text-[11px] text-muted-foreground">{r.member.company}</div></div>
                      </div>
                    </td>
                    <td className="num text-xs text-muted-foreground">{r.member.membershipNo}</td>
                    <td className="num">{fmtEGP(CYCLE_DUE_AMOUNT)}</td>
                    <td>
                      {r.paid ? <StatusChip variant="paid" label="Paid" dot /> :
                        r.daysOverdue > 30 ? <StatusChip variant="unpaid" label={`${r.daysOverdue}d overdue`} dot /> :
                        <StatusChip variant="pending" label={`${r.daysOverdue}d unpaid`} dot />}
                    </td>
                    <td className="num text-xs text-muted-foreground">{r.paidOn ?? "-"}</td>
                    <td className="text-xs text-muted-foreground">{r.method ?? "-"}</td>
                    <td className="text-[11px] text-muted-foreground">{r.reminder ?? (r.paid ? "-" : "Not sent")}</td>
                    <td>
                      {!r.paid && (
                        <Button size="sm" className="h-7 text-xs" disabled={!isCycleOpen} onClick={() => openRecord(r.member.id)}>
                          <Plus className="h-3 w-3 mr-1" /> Record
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length === 0 && (
              <div className="p-6"><EmptyState icon={Inbox} title="No members match these filters" description="Try clearing the search or switching the Paid / Unpaid filter." compact /></div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr><th>Date</th><th>Member</th><th>Amount</th><th>Method</th><th>Reference</th><th>Recorded by</th><th></th></tr>
              </thead>
              <tbody>
                {transactions.filter((t) => t.cycle === selectedCycle).map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/40">
                    <td className="num text-xs text-muted-foreground">{t.date}</td>
                    <td className="font-medium text-sm">{t.memberName}</td>
                    <td className="num font-medium">{fmtEGP(t.amount)}{t.amount < CYCLE_DUE_AMOUNT && <span className="ml-1.5 chip chip-pending">Partial</span>}</td>
                    <td className="text-xs">{t.method}</td>
                    <td className="num text-xs text-muted-foreground">{t.ref}</td>
                    <td className="text-xs">{t.recordedBy}</td>
                    <td><button className="text-xs text-primary hover:underline inline-flex items-center gap-1"><Receipt className="h-3 w-3" /> Receipt</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="method" className="mt-4">
          {(() => {
            const methods = [
              { name: "Bank transfer", count: 5, total: 67500, share: 71 },
              { name: "Card",          count: 1, total: 15000, share: 16 },
              { name: "Cheque",        count: 1, total: 15000, share: 16 },
              { name: "Cash",          count: 1, total: 15000, share: 16 },
            ];
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ejb-card p-5">
                  <h3 className="text-sm font-semibold mb-1">Collections by method (this cycle)</h3>
                  <p className="text-xs text-muted-foreground mb-4">Share of total collected</p>
                  <div className="space-y-3">
                    {methods.map((m) => (
                      <div key={m.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-muted-foreground num">{fmtEGP(m.total)} · {m.share}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${m.share}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ejb-card p-5">
                  <h3 className="text-sm font-semibold mb-1">Reconciliation status</h3>
                  <p className="text-xs text-muted-foreground mb-4">CIB / EFG bank feeds</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div><div className="font-medium">CIB Operating Account</div><div className="text-[11px] text-muted-foreground num">Last sync 14 min ago</div></div>
                      <StatusChip variant="paid" label="In sync" dot />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div><div className="font-medium">EFG Hermes Reserve</div><div className="text-[11px] text-muted-foreground num">Last sync 2 hours ago</div></div>
                      <StatusChip variant="paid" label="In sync" dot />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-md border border-border">
                      <div><div className="font-medium">Cash & Cheque ledger</div><div className="text-[11px] text-muted-foreground">2 cheques pending clearance</div></div>
                      <StatusChip variant="pending" label="Review" dot />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4 h-9">Open reconciliation workspace</Button>
                </div>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="aging" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {AGING_BUCKETS.map((b, i) => {
              const tone = i === 0 ? "text-foreground" : i === 1 ? "text-[hsl(var(--ejb-amber))]" : "text-destructive";
              const bar = i === 0 ? "bg-primary" : i === 1 ? "bg-[hsl(var(--ejb-amber))]" : "bg-destructive";
              return (
                <div key={b.bucket} className="ejb-card p-4">
                  <div className="ejb-eyebrow">{b.bucket}</div>
                  <div className={`text-2xl font-bold num tracking-tight mt-1 ${tone}`}>{b.count}</div>
                  <div className="text-[11px] text-muted-foreground num">{fmtEGP(b.amount, { compact: true })} outstanding</div>
                  <div className="mt-2.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${bar}`} style={{ width: `${(b.count / 50) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ejb-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">Members 60+ days overdue</h3>
                <p className="text-xs text-muted-foreground">Recommended for personal follow-up or board escalation</p>
              </div>
              <Button size="sm" variant="outline" className="h-8"><Mail className="h-3.5 w-3.5 mr-1.5" /> Send escalation batch</Button>
            </div>
            <table className="w-full data-table">
              <thead className="bg-secondary/50"><tr><th>Member</th><th>Company</th><th>Days overdue</th><th>Amount</th><th>Last reminder</th><th></th></tr></thead>
              <tbody>
                {MEMBERS.slice(48, 58).map((m, i) => (
                  <tr key={m.id} className="hover:bg-secondary/40">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                        <div className="font-medium text-sm">{m.name}</div>
                      </div>
                    </td>
                    <td className="text-xs text-muted-foreground">{m.company}</td>
                    <td><StatusChip variant="unpaid" label={`${62 + i * 3}d`} dot /></td>
                    <td className="num">{fmtEGP(15000)}</td>
                    <td className="text-xs text-muted-foreground">{i % 3 === 0 ? "Not sent" : `${5 + i}d ago`}</td>
                    <td><Button variant="ghost" size="sm" className="h-7 text-xs">Open</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <div className="ejb-card p-5">
            <h3 className="text-sm font-semibold mb-1">Collections by month (cycle to date)</h3>
            <p className="text-xs text-muted-foreground mb-4">EGP, millions</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid hsl(var(--border))", borderRadius: 6 }} formatter={(v: number) => [`${v}M EGP`, "Collected"]} />
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record payment modal */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record payment</DialogTitle>
            <DialogDescription>{activeMember ? `For ${activeMember} · Cycle ${CYCLE}` : `Cycle ${CYCLE}`}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Amount (EGP)</label>
              <input className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card num" defaultValue="15000" />
              <div className="text-[11px] text-muted-foreground mt-1">Full cycle dues: {fmtEGP(CYCLE_DUE_AMOUNT)}</div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Method</label>
              <select className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card">
                <option>Bank transfer</option><option>Cheque</option><option>Card</option><option>Cash</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Date</label>
                <input type="date" defaultValue="2026-04-28" className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Reference</label>
                <input className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card" placeholder="TRX-…" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Receipt (optional)</label>
              <div className="mt-1 border border-dashed border-border rounded-md p-3 text-xs text-muted-foreground text-center hover:bg-secondary/40 cursor-pointer">
                Drop file or click to upload
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Email receipt to member</label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button onClick={handleRecord}>Record payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close cycle modal */}
      <Dialog open={closeOpen} onOpenChange={(o) => { setCloseOpen(o); if (!o) setConfirmText(""); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-destructive" /> Close cycle {CYCLE}
            </DialogTitle>
            <DialogDescription>Lock collections, lapse unpaid members, open the next cycle.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="rounded-md border border-border p-3 bg-secondary/40 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Members paid</span><span className="font-medium num">{PAID_COUNT}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Members unpaid</span><span className="font-medium num text-destructive">{UNPAID_COUNT}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total collected</span><span className="font-medium num">{fmtEGP(collected)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">% paid</span><span className="font-medium num">{paidPct}%</span></div>
            </div>

            <div className="rounded-md border border-border p-3 space-y-2 text-xs">
              <div className="font-semibold text-sm flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--success))]" /> What happens next</div>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside marker:text-border">
                <li><strong className="text-foreground num">{UNPAID_COUNT}</strong> unpaid members → <strong className="text-foreground">Lapsed</strong>, hidden from the app directory.</li>
                <li>New cycle <strong className="text-foreground num">2027 / 2028</strong> opens immediately with the dues amount below.</li>
                <li>Action is logged in the audit trail and cannot be undone.</li>
              </ul>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Next cycle dues (EGP)</label>
              <input type="number" value={nextDues} onChange={(e) => setNextDues(parseInt(e.target.value, 10) || 0)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card num" />
            </div>

            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
              <div className="flex items-start gap-2 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-destructive">This cannot be undone.</div>
                  <div className="text-muted-foreground mt-0.5">Type <code className="font-mono bg-card px-1 py-0.5 rounded border border-border">CLOSE CYCLE</code> below to confirm.</div>
                </div>
              </div>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full mt-2 h-9 px-3 border border-border rounded-md bg-card font-mono text-sm" placeholder="CLOSE CYCLE" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button>
            <Button disabled={confirmText !== "CLOSE CYCLE"} variant="destructive" onClick={handleClose}>Close cycle {CYCLE}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
