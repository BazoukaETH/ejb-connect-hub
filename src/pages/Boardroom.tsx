import { PageHeader } from "@/components/PageHeader";
import { Link } from "react-router-dom";
import {
  BOARDROOM_KPIS, NEXT_90_DAYS, TOP_LAPSED, BOARD_RISKS, BOARD_WINS,
  STRATEGIC_KPIS, BOARD_DECISIONS, fmtEGP,
} from "@/data/mock";
import { Crown, Printer, AlertTriangle, Sparkles, Calendar, Gavel, Target, Landmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";

function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ejb-card p-4">
      <div className="ejb-eyebrow">{label}</div>
      <div className="text-2xl font-bold tracking-tight num mt-1">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Boardroom() {
  const { role, can } = useRole();
  const k = BOARDROOM_KPIS;
  const reserveRatio = (k.reserve / (k.burnRate * 12)).toFixed(2);

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <PageHeader
        title="Boardroom"
        description={`Quarterly snapshot for the board · viewing as ${role}`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Printer className="h-3.5 w-3.5 mr-1.5" /> Printable PDF</Button>
            <span className="text-[11px] text-muted-foreground hidden md:inline">Read-only · refreshed nightly</span>
          </>
        }
      />

      <div className="bg-gradient-to-br from-[hsl(var(--ejb-blue)/0.06)] to-transparent border border-[hsl(var(--ejb-blue)/0.2)] rounded-[var(--radius-lg)] p-4 mb-5 flex items-start gap-3">
        <Crown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-foreground/80">
          This view is intended for the chairman and board members. The operations team works from the Cockpit.
          All edits are disabled here. Use the navigation to drill into Decisions queue, Strategic KPIs, and Cash & Investments.
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-2">Cycle KPIs</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPI label="Cash position"     value={fmtEGP(k.cashPosition, { compact: true })} sub="Main + reserve" />
        <KPI label="Reserve / investable" value={fmtEGP(k.reserve, { compact: true })}   sub={`${reserveRatio}x annual burn · target 1.5x`} />
        <KPI label="YTD member dues"   value={fmtEGP(k.ytdMemberDues, { compact: true })} sub={`Retention ${k.retentionRate}%`} />
        <KPI label="YTD sponsor revenue" value={fmtEGP(k.ytdSponsorRev, { compact: true })} sub="vs target 2.0M" />
        <KPI label="Net new members"   value={`${k.netNewMembers}`} sub="vs target 50" />
        <KPI label="Avg event turnout" value={`${k.avgEventTurnout}%`} sub="Last 6 months" />
        <KPI label="Monthly burn"      value={fmtEGP(k.burnRate, { compact: true })} sub="3-month average" />
        <KPI label="Cycle paid"        value="74%" sub="vs 91% at close last year" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Link to="/boardroom/decisions" className="ejb-card ejb-card-hover p-4 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <Gavel className="h-4 w-4 text-primary" />
            <span className="chip chip-pending">{BOARD_DECISIONS.length} pending</span>
          </div>
          <h3 className="text-sm font-semibold mt-1">Decisions queue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Applications, sponsorships, treasury moves, and governance items needing board approval.</p>
          <span className="text-xs text-primary mt-3 flex items-center gap-1">Open queue <ArrowRight className="h-3 w-3" /></span>
        </Link>
        <Link to="/boardroom/strategic" className="ejb-card ejb-card-hover p-4 flex flex-col">
          <Target className="h-4 w-4 text-primary mb-1" />
          <h3 className="text-sm font-semibold mt-1">Strategic KPIs</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Annual targets set by the board: growth, retention, sponsorship, attendance.</p>
          <span className="text-xs text-primary mt-3 flex items-center gap-1">View progress <ArrowRight className="h-3 w-3" /></span>
        </Link>
        {can("view:chairmanOnly") && (
          <Link to="/boardroom/treasury" className="ejb-card ejb-card-hover p-4 flex flex-col">
            <Landmark className="h-4 w-4 text-primary mb-1" />
            <h3 className="text-sm font-semibold mt-1">Cash & Investments</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Reserves, time deposits, investment proposals from finance.</p>
            <span className="text-xs text-primary mt-3 flex items-center gap-1">Open <ArrowRight className="h-3 w-3" /></span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <div className="ejb-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Top risks
          </h3>
          <ul className="space-y-2.5">
            {BOARD_RISKS.map((r) => (
              <li key={r.text} className="flex items-start gap-2 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${r.severity === "high" ? "bg-destructive" : "bg-[hsl(var(--ejb-amber))]"}`} />
                <span className="text-foreground/90">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ejb-card p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[hsl(142_71%_35%)]" /> Top wins
          </h3>
          <ul className="space-y-2.5">
            {BOARD_WINS.map((w) => (
              <li key={w.text} className="flex items-start gap-2 text-xs">
                <span className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 bg-[hsl(var(--ejb-neon-green))]" />
                <span className="text-foreground/90">{w.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="ejb-card p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" /> Next 90 days
          </h3>
          <div className="divide-y divide-border/60">
            {NEXT_90_DAYS.map((e) => (
              <div key={e.date + e.title} className="flex items-center gap-3 py-2.5 text-xs">
                <span className="num font-semibold w-20">{e.date}</span>
                <span className="chip chip-neutral w-24 justify-center">{e.type}</span>
                <span className="flex-1 font-medium truncate">{e.title}</span>
                <span className="text-muted-foreground hidden md:inline">{e.notes}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ejb-card p-4">
          <h3 className="text-sm font-semibold mb-3">Top 10 lapsed</h3>
          <div className="divide-y divide-border/60">
            {TOP_LAPSED.map((m) => (
              <div key={m.name} className="flex items-center justify-between py-2 text-xs">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{m.company} · last paid {m.lastPaid}</div>
                </div>
                <span className="num text-destructive font-medium">{fmtEGP(m.amount, { compact: true })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
