import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForPayment } from "@/components/StatusChip";
import { MEMBERS, CYCLE, CYCLE_DUE_AMOUNT, TOTAL_MEMBERS, PAID_COUNT, UNPAID_COUNT, fmtEGP, fmtDate } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Download, Plus, Lock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar } from "recharts";

const collected = PAID_COUNT * CYCLE_DUE_AMOUNT;
const expected = TOTAL_MEMBERS * CYCLE_DUE_AMOUNT;
const outstanding = UNPAID_COUNT * CYCLE_DUE_AMOUNT;

const TRANSACTIONS = [
  { id: "tx-1", member: "Tarek Mostafa", amount: 15000, method: "Bank transfer", date: "2026-04-28", recordedBy: "Nour", ref: "TRX-99821" },
  { id: "tx-2", member: "Hala Saleh", amount: 15000, method: "Bank transfer", date: "2026-04-28", recordedBy: "Nour", ref: "TRX-99820" },
  { id: "tx-3", member: "Yasmin Allam", amount: 15000, method: "Cheque", date: "2026-04-27", recordedBy: "Nour", ref: "CHQ-2455" },
  { id: "tx-4", member: "Soha Badr", amount: 7500, method: "Bank transfer", date: "2026-04-27", recordedBy: "Nour", ref: "TRX-99812" },
  { id: "tx-5", member: "Karim Said", amount: 15000, method: "Card", date: "2026-04-26", recordedBy: "Mona", ref: "CRD-77124" },
  { id: "tx-6", member: "Ahmed Hassan", amount: 15000, method: "Bank transfer", date: "2026-04-26", recordedBy: "Nour", ref: "TRX-99801" },
  { id: "tx-7", member: "Mona Ezzat", amount: 15000, method: "Cash", date: "2026-04-25", recordedBy: "Nour", ref: "CSH-0142" },
];

const MONTHLY = [
  { m: "Feb", v: 0.4 }, { m: "Mar", v: 0.9 }, { m: "Apr", v: 2.1 },
  { m: "May", v: 1.4 }, { m: "Jun", v: 0.6 }, { m: "Jul", v: 0.18 },
];

export default function Payments() {
  const [closeOpen, setCloseOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const paidPct = Math.round((PAID_COUNT / TOTAL_MEMBERS) * 100);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Payments & Dues"
        description="Annual dues collection and reconciliation"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
            <Button variant="outline" size="sm" className="h-9">Open new cycle</Button>
            <Button variant="outline" size="sm" className="h-9 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => setCloseOpen(true)}>
              <Lock className="h-3.5 w-3.5 mr-1.5" /> Close cycle
            </Button>
          </>
        }
      />

      {/* Cycle selector */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
        <div className="px-4 h-8 flex items-center bg-card border border-border rounded-md text-sm font-medium num">Cycle {CYCLE}</div>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
        {[
          { label: "Total expected", value: fmtEGP(expected, { compact: true }), sub: `${TOTAL_MEMBERS} members` },
          { label: "Collected", value: fmtEGP(collected, { compact: true }), sub: `${PAID_COUNT} paid`, color: "text-[hsl(var(--success))]" },
          { label: "Outstanding", value: fmtEGP(outstanding, { compact: true }), sub: `${UNPAID_COUNT} unpaid`, color: "text-destructive" },
          { label: "% paid", value: `${paidPct}%`, sub: "Last cycle 91%" },
          { label: "# paid", value: String(PAID_COUNT), sub: "Cycle to date" },
          { label: "# unpaid", value: String(UNPAID_COUNT), sub: "Reminder due" },
        ].map((s) => (
          <div key={s.label} className="ejb-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`text-xl font-bold num tracking-tight mt-1 ${s.color ?? ""}`}>{s.value}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
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
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr><th>Member</th><th>Membership #</th><th>Amount</th><th>Status</th><th>Paid on</th><th>Method</th><th></th></tr>
              </thead>
              <tbody>
                {MEMBERS.slice(0, 18).map((m, i) => {
                  const paid = i < 13;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                          <div><div className="font-medium text-sm">{m.name}</div><div className="text-[11px] text-muted-foreground">{m.company}</div></div>
                        </div>
                      </td>
                      <td className="num text-xs text-muted-foreground">{m.membershipNo}</td>
                      <td className="num">{fmtEGP(CYCLE_DUE_AMOUNT)}</td>
                      <td><StatusChip variant={paid ? "paid" : "unpaid"} label={paid ? "Paid" : "Unpaid"} dot /></td>
                      <td className="num text-xs text-muted-foreground">{paid ? "2026-06-12" : "—"}</td>
                      <td className="text-xs text-muted-foreground">{paid ? "Bank transfer" : "—"}</td>
                      <td>
                        {!paid && <Button size="sm" className="h-7 text-xs" onClick={() => setRecordOpen(true)}><Plus className="h-3 w-3 mr-1" /> Record</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                  <tr key={t.id}>
                    <td className="num text-xs text-muted-foreground">{t.date}</td>
                    <td className="font-medium text-sm">{t.member}</td>
                    <td className="num font-medium">{fmtEGP(t.amount)}</td>
                    <td className="text-xs">{t.method}</td>
                    <td className="num text-xs text-muted-foreground">{t.ref}</td>
                    <td className="text-xs">{t.recordedBy}</td>
                    <td><button className="text-xs text-primary hover:underline">Receipt</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          <div className="ejb-card p-5">
            <h3 className="text-sm font-semibold mb-3">Collections over the cycle (EGP, millions)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY}>
                  <XAxis dataKey="m" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record payment modal */}
      <Dialog open={recordOpen} onOpenChange={setRecordOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div><label className="text-xs text-muted-foreground">Amount (EGP)</label><input className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card num" defaultValue="15000" /></div>
            <div><label className="text-xs text-muted-foreground">Method</label>
              <select className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card"><option>Bank transfer</option><option>Cheque</option><option>Card</option><option>Cash</option></select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Date</label><input type="date" className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card" /></div>
              <div><label className="text-xs text-muted-foreground">Reference</label><input className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card" placeholder="TRX-…" /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Receipt</label><div className="mt-1 border border-dashed border-border rounded-md p-3 text-xs text-muted-foreground text-center">Drop file or click to upload</div></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setRecordOpen(false)}>Cancel</Button><Button onClick={() => setRecordOpen(false)}>Record payment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close cycle modal */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Close cycle {CYCLE}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-md bg-secondary p-3 text-xs space-y-1.5">
              <div className="flex justify-between"><span>Members paid</span><span className="font-medium num">{PAID_COUNT}</span></div>
              <div className="flex justify-between"><span>Members unpaid</span><span className="font-medium num">{UNPAID_COUNT}</span></div>
              <div className="flex justify-between"><span>Total collected</span><span className="font-medium num">{fmtEGP(collected)}</span></div>
              <div className="flex justify-between"><span>% paid</span><span className="font-medium num">{paidPct}%</span></div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>· Unpaid members will move to <strong>Lapsed</strong> automatically.</p>
              <p>· The next cycle (2027 / 2028) will open with EGP 15,000 dues.</p>
              <p>· This action is logged in the audit log and cannot be undone.</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type CLOSE CYCLE to confirm</label>
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full mt-1 h-9 px-3 border border-border rounded-md bg-card font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>Cancel</Button>
            <Button disabled={confirmText !== "CLOSE CYCLE"} variant="destructive" onClick={() => setCloseOpen(false)}>Close cycle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
