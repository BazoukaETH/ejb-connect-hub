import { PageHeader } from "@/components/PageHeader";
import { BOARDROOM_KPIS, fmtEGP } from "@/data/mock";
import { Landmark, TrendingUp, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/StatusChip";

const ACCOUNTS = [
  { bank: "CIB - Main current", balance: 2_500_000, type: "Current",      apr: 0,    notes: "Day-to-day operations" },
  { bank: "CIB - Time deposit", balance: 4_000_000, type: "Time deposit", apr: 18.5, notes: "6-month, matures Oct 2026" },
  { bank: "EFG - Money market", balance: 1_200_000, type: "Money market", apr: 14.2, notes: "Liquid, T+1" },
  { bank: "Banque Misr - USD",  balance: 1_000_000, type: "USD reserve",  apr: 4.5,  notes: "Hedge against EGP depreciation" },
];

const PROPOSALS = [
  { id: "tp-1", title: "Reallocate EGP 1.5M from current to 6-month CIB time deposit", expectedReturn: "EGP 138,750 over 6 months at 18.5% APR", status: "Pending board" },
  { id: "tp-2", title: "Open USD 100K position in CIB structured note", expectedReturn: "Capital protected, 6.5% target USD return", status: "Awaiting Finance review" },
];

export default function BoardroomTreasury() {
  const total = ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const k = BOARDROOM_KPIS;

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <PageHeader
        title="Cash & Investments"
        description="Reserves, time deposits, and treasury proposals · chairman-only view"
        actions={<Button size="sm" variant="outline" className="h-9"><FileText className="h-3.5 w-3.5 mr-1.5" /> Treasury report</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="ejb-card p-4">
          <div className="ejb-eyebrow">Total managed</div>
          <div className="text-2xl font-bold num tracking-tight mt-1">{fmtEGP(total, { compact: true })}</div>
          <div className="text-[11px] text-muted-foreground">Across {ACCOUNTS.length} accounts</div>
        </div>
        <div className="ejb-card p-4">
          <div className="ejb-eyebrow">Reserve target</div>
          <div className="text-2xl font-bold num tracking-tight mt-1">1.50x</div>
          <div className="text-[11px] text-muted-foreground">Annual operating burn</div>
        </div>
        <div className="ejb-card p-4">
          <div className="ejb-eyebrow">Reserve actual</div>
          <div className="text-2xl font-bold num tracking-tight mt-1 text-[hsl(var(--ejb-amber))]">1.17x</div>
          <div className="text-[11px] text-muted-foreground">Below target by 0.33x</div>
        </div>
        <div className="ejb-card p-4">
          <div className="ejb-eyebrow">Blended APR</div>
          <div className="text-2xl font-bold num tracking-tight mt-1">15.4%</div>
          <div className="text-[11px] text-muted-foreground">Weighted by balance</div>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Landmark className="h-4 w-4" /> Accounts</h2>
      <div className="ejb-card overflow-hidden mb-5">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr><th>Account</th><th>Type</th><th>Balance</th><th>APR</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {ACCOUNTS.map((a) => (
              <tr key={a.bank}>
                <td className="font-medium text-sm">{a.bank}</td>
                <td><StatusChip variant="info" label={a.type} /></td>
                <td className="num font-semibold">{fmtEGP(a.balance)}</td>
                <td className="num text-xs">{a.apr ? `${a.apr}%` : "-"}</td>
                <td className="text-xs text-muted-foreground">{a.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Treasury proposals</h2>
      <div className="space-y-3">
        {PROPOSALS.map((p) => (
          <div key={p.id} className="ejb-card p-4 flex items-start gap-3">
            <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{p.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.expectedReturn}</div>
              <div className="mt-2"><StatusChip variant="pending" label={p.status} /></div>
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs">Open brief</Button>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-6">
        Numbers shown are mock. Production view pulls live balances from CIB and EFG via reconciliation feed
        and shows {fmtEGP(k.cashPosition, { compact: true })} cash position and {fmtEGP(k.reserve, { compact: true })} reserve.
      </p>
    </div>
  );
}
