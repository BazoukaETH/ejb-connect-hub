import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { EXPENSES, EXPENSE_BUDGET, fmtEGP } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

export default function Expenses() {
  const usedPct = Math.round((EXPENSE_BUDGET.used / EXPENSE_BUDGET.total) * 100);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Expenses"
        description="Operational spend, vendor invoices, and budget pacing"
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
            <Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Log expense</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <div className="ejb-card p-4 lg:col-span-2">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="ejb-eyebrow">Budget used (YTD)</div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold num tracking-tight">{fmtEGP(EXPENSE_BUDGET.used, { compact: true })}</span>
                <span className="text-xs text-muted-foreground num">of {fmtEGP(EXPENSE_BUDGET.total, { compact: true })} ({usedPct}%)</span>
              </div>
            </div>
            <span className="text-[11px] text-[hsl(var(--success))]">On pace</span>
          </div>
          <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${usedPct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXPENSE_BUDGET.byCategory.map((c) => {
              const pct = Math.round((c.value / c.budget) * 100);
              const danger = pct > 85;
              return (
                <div key={c.name}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium truncate">{c.name}</span>
                    <span className={`num ${danger ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${danger ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 num">{fmtEGP(c.value, { compact: true })} / {fmtEGP(c.budget, { compact: true })}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ejb-card p-4">
          <div className="ejb-eyebrow">Pending approvals</div>
          <div className="text-3xl font-bold num tracking-tight mt-1">1</div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting Amany Fikry approval</p>
          <Button size="sm" variant="outline" className="mt-3 h-8 text-xs">Review queue</Button>
        </div>
      </div>

      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr><th>Date</th><th>Vendor</th><th>Category</th><th>Amount</th><th>Status</th><th>Approver</th><th>Reference</th><th></th></tr>
          </thead>
          <tbody>
            {EXPENSES.map((e) => (
              <tr key={e.id} className="hover:bg-secondary/40">
                <td className="num text-xs text-muted-foreground">{e.date}</td>
                <td className="font-medium text-sm">{e.vendor}</td>
                <td><StatusChip variant="brand" label={e.category} /></td>
                <td className="num font-medium">{fmtEGP(e.amount)}</td>
                <td><StatusChip variant={e.status === "Paid" ? "paid" : e.status === "Pending" ? "pending" : "info"} label={e.status} dot /></td>
                <td className="text-xs">{e.approver}</td>
                <td className="num text-xs text-muted-foreground">{e.reference}</td>
                <td><button className="text-xs text-primary hover:underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
