import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import {
  MEMBERS, CYCLE, CYCLE_DUE_AMOUNT, CYCLE_CLOSE,
  TOTAL_MEMBERS, PAID_COUNT, UNPAID_COUNT, fmtEGP, CYCLE_WEEKLY,
} from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  ChevronLeft, ChevronRight, Download, Plus, Lock, Search,
  AlertTriangle, CheckCircle2, Mail, Receipt, Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { toast } from "@/hooks/use-toast";

const collected = PAID_COUNT * CYCLE_DUE_AMOUNT;
const expected = TOTAL_MEMBERS * CYCLE_DUE_AMOUNT;
const outstanding = UNPAID_COUNT * CYCLE_DUE_AMOUNT;

const TRANSACTIONS = [
  { id: "tx-1", member: "Tarek Mostafa", amount: 15000, method: "Bank transfer", date: "2026-04-28 14:22", recordedBy: "Nour", ref: "TRX-99821" },
  { id: "tx-2", member: "Hala Saleh",    amount: 15000, method: "Bank transfer", date: "2026-04-28 11:08", recordedBy: "Nour", ref: "TRX-99820" },
  { id: "tx-3", member: "Yasmin Allam",  amount: 15000, method: "Cheque",        date: "2026-04-27 16:40", recordedBy: "Nour", ref: "CHQ-2455" },
  { id: "tx-4", member: "Soha Badr",     amount:  7500, method: "Bank transfer", date: "2026-04-27 09:55", recordedBy: "Nour", ref: "TRX-99812" },
  { id: "tx-5", member: "Karim Said",    amount: 15000, method: "Card",          date: "2026-04-26 17:12", recordedBy: "Mona",  ref: "CRD-77124" },
  { id: "tx-6", member: "Ahmed Hassan",  amount: 15000, method: "Bank transfer", date: "2026-04-26 13:00", recordedBy: "Nour", ref: "TRX-99801" },
  { id: "tx-7", member: "Mona Ezzat",    amount: 15000, method: "Cash",          date: "2026-04-25 10:35", recordedBy: "Nour", ref: "CSH-0142" },
];

const MONTHLY = [
  { m: "Feb", v: 0.4 }, { m: "Mar", v: 0.9 }, { m: "Apr", v: 2.1 },
  { m: "May", v: 1.4 }, { m: "Jun", v: 0.6 }, { m: "Jul", v: 0.18 },
];

export default function Payments() {
  const [closeOpen, setCloseOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [nextDues, setNextDues] = useState(15000);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");

  const paidPct = Math.round((PAID_COUNT / TOTAL_MEMBERS) * 100);
  const daysLeft = 94;

  const rows = useMemo(() => {
    return MEMBERS.slice(0, 28).map((m, i) => ({
      member: m,
      paid: i < 21,
      paidOn: i < 21 ? "2026-06-12" : null,
      method: i < 21 ? "Bank transfer" : null,
      reminder: i >= 21 && i % 2 === 0 ? "Sent 3 days ago" : null,
      daysOverdue: i >= 21 ? 4 + (i - 21) * 3 : 0,
    })).filter((r) => {
      if (q && !`${r.member.name} ${r.member.company} ${r.member.membershipNo}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "paid" && !r.paid) return false;
      if (filter === "unpaid" && r.paid) return false;
      return true;
    });
  }, [q, filter]);

  const handleClose = () => {
    setCloseOpen(false);
    setConfirmText("");
    toast({ title: "Cycle closed", description: `${UNPAID_COUNT} members moved to Lapsed. New cycle opened.` });
  };

  const handleRecord = () => {
    setRecordOpen(false);
    toast({ title: "Payment recorded", description: `EGP 15,000 logged for ${activeMember ?? "member"}.` });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Payments & Dues"
        description={`Cycle ${CYCLE} · closes ${CYCLE_CLOSE} · ${daysLeft} days left`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
            <Button variant="outline" size="sm" className="h-9"><Mail className="h-3.5 w-3.5 mr-1.5" /> Send reminders ({UNPAID_COUNT})</Button>
            <Button variant="outline" size="sm" className="h-9 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setCloseOpen(true)}>
              <Lock className="h-3.5 w-3.5 mr-1.5" /> Close cycle
            </Button>
          </>
        }
      />

      {/* Cycle selector + summary strip */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
        <div className="px-4 h-8 flex items-center bg-card border border-border rounded-md text-sm font-medium num">Cycle {CYCLE}</div>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled><ChevronRight className="h-4 w-4" /></Button>
        <span className="text-xs text-muted-foreground ml-2">Compare: 2025/26 · 2024/25</span>
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
          {[["member", "By Member"], ["payment", "By Payment"], ["month", "By Month"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="member" className="mt-4">
          <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search member, company, M-#…" className="pl-8 h-8" />
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
                        <Button size="sm" className="h-7 text-xs" onClick={() => { setActiveMember(r.member.name); setRecordOpen(true); }}>
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
                {TRANSACTIONS.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/40">
                    <td className="num text-xs text-muted-foreground">{t.date}</td>
                    <td className="font-medium text-sm">{t.member}</td>
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
