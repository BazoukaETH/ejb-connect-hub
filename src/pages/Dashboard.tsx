import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import {
  TOTAL_MEMBERS, PAID_COUNT, UNPAID_COUNT, CYCLE, CYCLE_CLOSE,
  CYCLE_WEEKLY, PIPELINE_STAGES, RECENT_ACTIVITY, FINANCIAL_SNAPSHOT,
  ACTIVE_MEMBERS, MEMBER_CAP, fmtEGP,
} from "@/data/mock";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Users, BadgeCheck,
  AlertCircle, FileSearch, CalendarDays, Handshake, RefreshCw, Pencil, Megaphone,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { useRole } from "@/context/RoleContext";

const collected = PAID_COUNT * 15000;
const outstanding = UNPAID_COUNT * 15000;
const expected = TOTAL_MEMBERS * 15000;
const paidPct = Math.round((PAID_COUNT / TOTAL_MEMBERS) * 100);

interface KPIProps {
  label: string; value: string; sub: string;
  trend?: { dir: "up" | "down" | "neutral"; text: string };
  href: string; icon: any; highlight?: boolean;
}

function KPI({ label, value, sub, trend, href, icon: Icon, highlight }: KPIProps) {
  return (
    <Link to={href} className="ejb-card ejb-card-hover p-4 group flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">{label}</span>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="flex items-baseline gap-2 num">
        <span className="text-[28px] font-bold leading-none tracking-tight">{value}</span>
        {highlight && <span className="h-2 w-2 rounded-full bg-[hsl(var(--ejb-neon-yellow))] -translate-y-2" />}
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
  return (
    <div className="space-y-2">
      {PIPELINE_STAGES.map((s, i) => {
        const w = Math.max(8, (s.count / max) * 100);
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
        <div className="flex-1 h-7 bg-[hsl(var(--ejb-neon-green)/0.45)] rounded-md flex items-center px-2 text-[11px] font-semibold text-foreground/90">
          <span className="num">{ACTIVE_MEMBERS} / {MEMBER_CAP}</span>
        </div>
        <span className="w-12 text-right text-muted-foreground num">{Math.round((ACTIVE_MEMBERS / MEMBER_CAP) * 100)}%</span>
      </div>
    </div>
  );
}

const ACTIVITY_FILTERS = [
  ["all","All"],["payment","Payments"],["stage","Members"],["announcement","Announcements"],["event","Events"],["note","Notes"],
] as const;

export default function Dashboard() {
  const { can, role } = useRole();
  const [period, setPeriod] = useState<"cycle" | "ytd" | "12m">("cycle");
  const [activityFilter, setActivityFilter] = useState<string>("all");

  const filteredActivity = activityFilter === "all"
    ? RECENT_ACTIVITY
    : RECENT_ACTIVITY.filter((a) => a.type === activityFilter);

  const attentionCount = 7;
  const urgentCount = 2;

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title={role === "Chairman" || role === "Board" ? "Cockpit (operations view)" : "Cockpit"}
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
            <button data-demo-skip className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground" aria-label="Refresh data">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-muted-foreground hidden md:inline">2 min ago</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-5">
        <KPI label="Active members" value={`${ACTIVE_MEMBERS}`} sub={`of ${MEMBER_CAP} cap`} trend={{ dir: "up", text: "+8 vs last cycle" }} href="/members" icon={Users} />
        <KPI label="% paid this cycle" value={`${paidPct}%`} sub={`${PAID_COUNT} of ${TOTAL_MEMBERS}`} trend={{ dir: "up", text: fmtEGP(collected, { compact: true }) }} href="/payments" icon={BadgeCheck} />
        <KPI label="Outstanding dues" value={fmtEGP(outstanding, { compact: true })} sub={`${UNPAID_COUNT} unpaid`} trend={{ dir: "neutral", text: `Closes ${CYCLE_CLOSE}` }} href="/payments?filter=unpaid" icon={AlertCircle} highlight />
        <KPI label="Pending applications" value="9" sub="Oldest: 12 days" trend={{ dir: "down", text: "-3 wk over wk" }} href="/applicants" icon={FileSearch} />
        <KPI label="Upcoming events" value="3" sub="Next 30 days" trend={{ dir: "up", text: "147 RSVPs" }} href="/events" icon={CalendarDays} />
        <KPI label="Sponsor revenue" value="1.4M EGP" sub="5 active deals" trend={{ dir: "up", text: "+12% YoY" }} href="/partners" icon={Handshake} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <div className="ejb-card lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-tight">Needs your attention today</h2>
            <span className="text-xs flex items-center gap-1.5">
              <span className="text-muted-foreground num">{attentionCount} items</span>
              {urgentCount > 0 && <span className="chip chip-unpaid num">{urgentCount} urgent</span>}
            </span>
          </div>
          <div className="divide-y divide-border/60">
            <AttentionItem icon={AlertCircle} count={12} text="members lapsed >30 days, no payment" action="Send reminders" href="/payments" severity="danger" />
            <AttentionItem icon={Wallet} count={1} text="partners with outstanding payment (Hassan Allam)" action="Open partners" href="/partners" severity="danger" />
            <AttentionItem icon={FileSearch} count={9} text="applicants awaiting decision" action="View pipeline" href="/applicants" severity="info" />
            <AttentionItem icon={CalendarDays} count={3} text="events this week need final headcount" action="Open roster" href="/events" severity="warn" />
            <AttentionItem icon={Megaphone} count={5} text="announcements scheduled in next 7 days" action="Review queue" href="/announcements" severity="info" />
            <AttentionItem icon={Users} count={8} text="members missing About / Areas of Focus / photo" action="Send completion" href="/members" severity="warn" />
            <AttentionItem icon={Handshake} count={1} text="sponsorship renewal in <30 days (Vodafone)" action="Open partner" href="/partners" severity="warn" />
          </div>
        </div>

        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Cycle progress</h2>
            <span className="text-[11px] text-muted-foreground">Last cycle 91%</span>
          </div>
          <div className="num">
            <div className="flex items-baseline justify-between">
              <span className="text-[28px] font-bold tracking-tight">{paidPct}%</span>
              <span className="text-xs text-muted-foreground">{fmtEGP(collected, { compact: true })} of {fmtEGP(expected, { compact: true })}</span>
            </div>
          </div>
          <div className="h-2.5 mt-2 mb-1 rounded-full overflow-hidden flex bg-secondary">
            <div className="h-full" style={{ width: `${paidPct}%`, background: "hsl(var(--success))" }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
            <span>{PAID_COUNT} paid</span>
            <span>{UNPAID_COUNT} unpaid</span>
          </div>
          <div className="h-24 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={CYCLE_WEEKLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid hsl(var(--border))", borderRadius: 6 }}
                  formatter={(v: number) => [`${v}M EGP`, "Cumulative"]}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground">Cumulative collections by week (this cycle).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <div className="ejb-card lg:col-span-2 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Pipeline</h2>
            <Link to="/applicants" className="text-xs text-primary hover:underline">Open Kanban →</Link>
          </div>
          <Funnel />
        </div>

        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
          </div>
          <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1" data-demo-skip>
            {ACTIVITY_FILTERS.map(([v, l]) => (
              <button key={v} onClick={() => setActivityFilter(v)} className={`text-[10px] px-2 h-6 rounded-md whitespace-nowrap ${activityFilter === v ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-secondary"}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="space-y-2.5 max-h-[280px] overflow-auto pr-1">
            {filteredActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-2.5 text-xs">
                <Avatar name={a.actorName} hue={(a.actorName.charCodeAt(0) * 47) % 360} size="xs" square />
                <div className="flex-1 min-w-0 leading-snug">
                  <span className="font-medium">{a.actorName}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">· {a.type}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{a.timestamp}</div>
                </div>
              </div>
            ))}
            {filteredActivity.length === 0 && (
              <div className="text-[11px] text-muted-foreground text-center py-6">No activity in this category.</div>
            )}
          </div>
        </div>
      </div>

      {can("view:financialSnapshot") && (
        <div className="ejb-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Financial snapshot</h2>
            <span className="text-[11px] text-muted-foreground">YTD · Finance / Board / Chairman only</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Cash position</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold num tracking-tight">{fmtEGP(FINANCIAL_SNAPSHOT.cashBalance, { compact: true })}</span>
                <button className="h-6 w-6 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground" aria-label="Update balance">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Main account · updated 2 days ago</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">YTD income</div>
              <div className="text-2xl font-bold num tracking-tight">{fmtEGP(FINANCIAL_SNAPSHOT.ytdIncome, { compact: true })}</div>
              <div className="text-[11px] text-[hsl(var(--success))] num">+18% vs last year</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">YTD expenses</div>
              <div className="text-2xl font-bold num tracking-tight">{fmtEGP(FINANCIAL_SNAPSHOT.ytdExpenses, { compact: true })}</div>
              <div className="text-[11px] text-muted-foreground num">61% of budget</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Reserve / investable</div>
              <div className="text-2xl font-bold num tracking-tight">{fmtEGP(FINANCIAL_SNAPSHOT.reserve, { compact: true })}</div>
              <div className="text-[11px] text-muted-foreground">For board investment review</div>
            </div>
          </div>
          <div className="h-28 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FINANCIAL_SNAPSHOT.monthly} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, padding: "4px 8px", border: "1px solid hsl(var(--border))", borderRadius: 6 }} />
                <Bar dataKey="inc" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="exp" fill="hsl(var(--ejb-gray))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> Income</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[hsl(var(--ejb-gray))]" /> Expenses</span>
            <span className="ml-auto">EGP, millions</span>
          </div>
        </div>
      )}
    </div>
  );
}
