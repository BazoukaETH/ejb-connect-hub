import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import {
  TOTAL_MEMBERS, PAID_COUNT, CYCLE, CYCLE_CLOSE,
  PIPELINE_STAGES, ACTIVE_MEMBERS, MEMBER_CAP, fmtEGP,
} from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Users, BadgeCheck,
  AlertCircle, FileSearch, CalendarDays, Handshake, RefreshCw, Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useRole } from "@/context/RoleContext";

const paidPct = Math.round((PAID_COUNT / TOTAL_MEMBERS) * 100);

interface KPIProps {
  label: string; value: string; sub: string;
  trend?: { dir: "up" | "down" | "neutral"; text: string };
  href: string; icon: any;
}

function KPI({ label, value, sub, trend, href, icon: Icon }: KPIProps) {
  return (
    <Link to={href} className="ejb-card ejb-card-hover p-4 group flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex items-baseline gap-2 num">
        <span className="text-[28px] font-bold leading-none tracking-tight">{value}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground truncate">{sub}</span>
        {trend && (
          <span className={
            trend.dir === "up" ? "text-[hsl(var(--success))] flex items-center gap-0.5" :
            trend.dir === "down" ? "text-destructive flex items-center gap-0.5" :
            "text-muted-foreground flex items-center gap-0.5"
          }>
            {trend.dir === "up" && <ArrowUpRight className="h-3 w-3" />}
            {trend.dir === "down" && <ArrowDownRight className="h-3 w-3" />}
            {trend.text}
          </span>
        )}
      </div>
    </Link>
  );
}

function AttentionItem({ icon: Icon, count, text, action, href, severity = "info" }: {
  icon: any; count: number; text: string; action: string; href: string; severity?: "info" | "warn" | "danger";
}) {
  const sevBg = severity === "danger" ? "bg-[hsl(var(--chip-unpaid-bg))] text-[hsl(var(--chip-unpaid-fg))]"
    : severity === "warn" ? "bg-[hsl(var(--chip-pending-bg))] text-[hsl(var(--chip-pending-fg))]"
    : "bg-accent text-accent-foreground";
  return (
    <div className="flex items-center gap-3 py-3 px-3 hover:bg-secondary/60 rounded-md group">
      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${sevBg}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold num">{count}</span>
          <span className="text-sm text-foreground truncate">{text}</span>
        </div>
      </div>
      <Button asChild variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-accent">
        <Link to={href}>{action} <ArrowRight className="h-3 w-3 ml-1" /></Link>
      </Button>
    </div>
  );
}

function Funnel() {
  const max = Math.max(...PIPELINE_STAGES.map(s => s.count));
  const activePct = Math.min(100, Math.round((ACTIVE_MEMBERS / MEMBER_CAP) * 100));
  return (
    <div className="space-y-2">
      {PIPELINE_STAGES.map((s, i) => {
        const w = Math.max(8, Math.min(100, (s.count / max) * 100));
        const conv = i > 0 ? Math.round((s.count / PIPELINE_STAGES[i - 1].count) * 100) : null;
        return (
          <div key={s.name} className="flex items-center gap-3 text-xs">
            <span className="w-32 text-muted-foreground truncate">{s.name}</span>
            <div className="flex-1 h-7 bg-secondary rounded-md overflow-hidden relative">
              <div
                className="h-full rounded-md flex items-center px-2 text-[11px] font-medium text-primary-foreground"
                style={{ width: `${w}%`, background: `hsl(232 85% ${75 - i * 4}%)` }}
              >
                <span className="num">{s.count.toLocaleString()}</span>
              </div>
            </div>
            <span className="w-12 text-right text-muted-foreground num">
              {conv !== null ? `${conv}%` : "-"}
            </span>
          </div>
        );
      })}
      <div className="flex items-center gap-3 text-xs pt-2 mt-2 border-t border-border">
        <span className="w-32 font-medium">Active members</span>
        <div className="flex-1 h-7 bg-secondary rounded-md overflow-hidden relative">
          <div
            className="h-full rounded-md flex items-center px-2 text-[11px] font-semibold text-foreground/90"
            style={{ width: `${activePct}%`, background: "hsl(var(--ejb-neon-green) / 0.55)" }}
          >
            <span className="num">{ACTIVE_MEMBERS} / {MEMBER_CAP} active</span>
          </div>
        </div>
        <span className="w-12 text-right text-muted-foreground num">{activePct}%</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { role } = useRole();
  const [period, setPeriod] = useState<"cycle" | "ytd" | "12m">("cycle");
  const lastRefreshed = useDemoStore((s) => s.lastRefreshed);
  const kpiNudge = useDemoStore((s) => s.kpiNudge);
  const refresh = useDemoStore((s) => s.refreshCockpit);

  const periodMul = period === "cycle" ? 1 : period === "ytd" ? 1.4 : 2.1;
  const adj = (n: number) => Math.round(n * kpiNudge * periodMul);
  const refreshedAgo = (() => {
    try { return formatDistanceToNow(lastRefreshed, { addSuffix: true }); } catch { return "just now"; }
  })();

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title={role === "Chairman" || role === "Board Members" ? "Cockpit (operations view)" : "Cockpit"}
        description={`Cycle ${CYCLE} · closes ${CYCLE_CLOSE}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary rounded-md p-0.5 text-xs" data-demo-skip>
              {(["cycle","ytd","12m"] as const).map((v) => (
                <button key={v} onClick={() => setPeriod(v)} className={`h-7 px-2.5 rounded ${period === v ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
                  {v === "cycle" ? "This cycle" : v === "ytd" ? "YTD" : "Last 12m"}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground hidden md:inline">Last refreshed {refreshedAgo}</span>
            <button onClick={refresh} className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground" aria-label="Refresh data" title="Refresh data">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <KPI label="Active members" value={`${adj(ACTIVE_MEMBERS)}`} sub={`of ${MEMBER_CAP} cap`} trend={{ dir: "up", text: "+8 vs last cycle" }} href="/members" icon={Users} />
        <KPI label="% paid this cycle" value={`${Math.min(100, Math.round(paidPct * kpiNudge))}%`} sub={`${adj(PAID_COUNT)} of ${TOTAL_MEMBERS}`} trend={{ dir: "up", text: "+6 pts" }} href="/payments" icon={BadgeCheck} />
        <KPI label="Sponsor revenue" value={fmtEGP(adj(1400000), { compact: true })} sub="This cycle · 5 active deals" trend={{ dir: "up", text: "+12% YoY" }} href="/partners" icon={Handshake} />
        <KPI label="Upcoming events" value={`${adj(3)}`} sub="Next 30 days" trend={{ dir: "up", text: "147 RSVPs" }} href="/events" icon={CalendarDays} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <div className="ejb-card lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-tight">Needs your attention today</h2>
            <span className="text-xs flex items-center gap-1.5">
              <span className="text-muted-foreground num">4 items</span>
              <span className="chip chip-unpaid num">2 urgent</span>
            </span>
          </div>
          <div className="divide-y divide-border/60">
            <AttentionItem icon={AlertCircle} count={12} text="members lapsed >30 days, no payment" action="Send reminders" href="/members?view=Lapsed%20unpaid&bulk=1" severity="danger" />
            <AttentionItem icon={Wallet} count={1} text="partner with outstanding payment (Hassan Allam)" action="Open partners" href="/partners" severity="danger" />
            <AttentionItem icon={FileSearch} count={9} text="applicants awaiting decision" action="View pipeline" href="/applicants" severity="info" />
            <AttentionItem icon={CalendarDays} count={3} text="events this week need final headcount" action="Open roster" href="/events" severity="warn" />
          </div>
        </div>

        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Pipeline</h2>
            <Link to="/applicants" className="text-xs text-primary hover:underline">Open Kanban →</Link>
          </div>
          <Funnel />
        </div>
      </div>
    </div>
  );
}
