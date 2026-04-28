import { useState, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { AUDIT } from "@/data/mock";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPES = ["all", "create", "update", "delete", "publish", "payment", "stage", "auth"] as const;

const TYPE_COLOR: Record<string, string> = {
  create: "chip-paid",
  update: "chip-info",
  delete: "chip-unpaid",
  publish: "chip-brand",
  payment: "chip-paid",
  stage: "chip-pending",
  auth: "chip-neutral",
};

export default function AuditLog() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<typeof TYPES[number]>("all");

  const rows = useMemo(() => AUDIT.filter((a) => {
    if (type !== "all" && a.type !== type) return false;
    if (q && !`${a.actor} ${a.action} ${a.entity}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, type]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <PageHeader
        title="Audit log"
        description="Every admin action is recorded immutably"
        actions={<Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export CSV</Button>}
      />

      <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search actor, entity, action…" className="pl-8 h-8" />
        </div>
        <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5 overflow-x-auto">
          {TYPES.map((t) => (
            <button key={t} onClick={() => setType(t)} className={`h-7 px-2.5 text-xs rounded capitalize whitespace-nowrap ${type === t ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground num">{rows.length} entries</span>
      </div>

      <div className="ejb-card divide-y divide-border">
        {rows.map((a) => (
          <div key={a.id} className="grid grid-cols-[auto_1fr_auto] gap-3 p-4 hover:bg-secondary/40">
            <Avatar name={a.actor} hue={a.hue} size="sm" square />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{a.actor}</span>
                <span className="text-[10px] text-muted-foreground">{a.role}</span>
                <span className={`chip ${TYPE_COLOR[a.type]}`}>{a.type}</span>
              </div>
              <div className="text-sm mt-0.5">
                <span className="text-muted-foreground">{a.action}</span> · <span className="font-medium">{a.entity}</span>
              </div>
              {(a.before || a.after) && (
                <div className="mt-1.5 text-[11px] flex items-center gap-2">
                  {a.before && <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--chip-unpaid-bg))] text-[hsl(var(--chip-unpaid-fg))] line-through">{a.before}</span>}
                  {a.before && a.after && <span className="text-muted-foreground">→</span>}
                  {a.after && <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--chip-paid-bg))] text-[hsl(var(--chip-paid-fg))]">{a.after}</span>}
                </div>
              )}
            </div>
            <div className="text-right text-[11px] text-muted-foreground whitespace-nowrap">
              <div>{a.ts}</div>
              <div className="num">{a.ip}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
