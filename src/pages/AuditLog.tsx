import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { RECENT_ACTIVITY } from "@/data/mock";

export default function AuditLog() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto animate-fade-in">
      <PageHeader title="Audit log" description="Every admin action, immutable" />
      <div className="ejb-card divide-y divide-border">
        {[...RECENT_ACTIVITY, ...RECENT_ACTIVITY].map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5">
            <Avatar name={a.actorName} hue={(a.actorName.charCodeAt(0) * 47) % 360} size="sm" square />
            <div className="flex-1">
              <div className="text-sm"><span className="font-medium">{a.actorName}</span> <span className="text-muted-foreground">{a.action}</span></div>
              <div className="text-[11px] text-muted-foreground mt-0.5 flex gap-3"><span>{a.timestamp}</span><span className="chip chip-neutral">{a.type}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
