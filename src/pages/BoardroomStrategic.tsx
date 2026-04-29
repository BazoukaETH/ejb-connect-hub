import { PageHeader } from "@/components/PageHeader";
import { STRATEGIC_KPIS } from "@/data/mock";

export default function BoardroomStrategic() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <PageHeader
        title="Strategic KPIs"
        description="Annual targets approved by the board · FY26"
      />
      <div className="space-y-3">
        {STRATEGIC_KPIS.map((k) => {
          const onTrack = k.pct >= 95;
          const watch = k.pct >= 70 && k.pct < 95;
          const tone = onTrack ? "bg-[hsl(var(--ejb-neon-green))]" : watch ? "bg-[hsl(var(--ejb-amber))]" : "bg-destructive";
          const label = onTrack ? "On track" : watch ? "Watch" : "Behind";
          return (
            <div key={k.name} className="ejb-card p-4">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold">{k.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 num">
                    Actual {k.actual} {k.unit} · Target {k.target} {k.unit}
                  </div>
                </div>
                <span className={`chip ${onTrack ? "chip-paid" : watch ? "chip-pending" : "chip-unpaid"}`}>{label} · {k.pct}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${tone}`} style={{ width: `${Math.min(100, k.pct)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
