import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { APPLICANTS, Applicant } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Plus, LayoutGrid, List, AlertTriangle, ArrowRight, ArrowLeft,
  UserPlus, Mail, Phone, Linkedin, Building2,
} from "lucide-react";

const STAGES: Applicant["stage"][] = ["Lead", "Prospect", "Referred", "Applicant", "Pending Payment"];
const STAGE_HINTS: Record<Applicant["stage"], string> = {
  "Lead": "No leads here yet. Members can refer prospects through the mobile app.",
  "Prospect": "Move qualified leads here after a first conversation.",
  "Referred": "Endorsed by an existing EJB member.",
  "Applicant": "Submitted application form. Awaiting board decision.",
  "Pending Payment": "Approved. Awaiting first cycle dues to activate.",
};

export default function Applicants() {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [items, setItems] = useState(APPLICANTS);
  const [active, setActive] = useState<Applicant | null>(null);

  const move = (id: string, dir: 1 | -1) => {
    setItems((prev) => prev.map((a) => {
      if (a.id !== id) return a;
      const i = STAGES.indexOf(a.stage);
      const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, i + dir))];
      return { ...a, stage: next, daysInStage: 0 };
    }));
    setActive((a) => a && a.id === id ? { ...a, stage: STAGES[Math.max(0, Math.min(STAGES.length - 1, STAGES.indexOf(a.stage) + dir))], daysInStage: 0 } : a);
  };

  const totals = useMemo(() => STAGES.map((s) => items.filter((a) => a.stage === s).length), [items]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Applicants & Prospects"
        description={`${items.length} active in pipeline · conversion last 90d: 41% lead → active`}
        actions={
          <>
            <div className="flex items-center bg-secondary rounded-md p-0.5">
              <button onClick={() => setView("kanban")} className={`h-7 px-2 rounded text-xs flex items-center gap-1 ${view === "kanban" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
                <LayoutGrid className="h-3 w-3" /> Kanban
              </button>
              <button onClick={() => setView("table")} className={`h-7 px-2 rounded text-xs flex items-center gap-1 ${view === "table" ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
                <List className="h-3 w-3" /> Table
              </button>
            </div>
            <Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add applicant</Button>
          </>
        }
      />

      {/* Stage summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {STAGES.map((s, i) => (
          <div key={s} className="ejb-card p-3">
            <div className="ejb-eyebrow truncate">{s}</div>
            <div className="text-xl font-bold num tracking-tight mt-1">{totals[i]}</div>
            <div className="text-[11px] text-muted-foreground">
              {i === 0 ? "Top of funnel" : `${Math.round((totals[i] / Math.max(1, totals[i - 1])) * 100)}% from prev`}
            </div>
          </div>
        ))}
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-5 gap-3 min-w-[1200px] overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageItems = items.filter((a) => a.stage === stage);
            const overWip = stageItems.length > 10;
            return (
              <div key={stage} className="bg-secondary/50 rounded-lg p-2.5 min-h-[440px] flex flex-col">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{stage}</h3>
                    <span className="text-xs text-muted-foreground num">{stageItems.length}</span>
                  </div>
                  {overWip && <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--ejb-amber))]" aria-label="Over WIP limit" />}
                </div>
                <div className="space-y-2 flex-1">
                  {stageItems.length === 0 ? (
                    <EmptyState icon={UserPlus} title="No one here yet" description={STAGE_HINTS[stage]} compact className="!py-6 !px-3" />
                  ) : stageItems.map((a) => {
                    const stale = a.daysInStage > 14;
                    return (
                      <button
                        key={a.id}
                        onClick={() => setActive(a)}
                        className="ejb-card ejb-card-hover w-full text-left p-3 cursor-pointer animate-fade-in"
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar name={a.name} hue={a.avatarHue} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium truncate">{a.name}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{a.company}</div>
                            <div className="text-[10px] text-muted-foreground mt-1 truncate">{a.position}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                          <span className="text-[10px] text-muted-foreground truncate">
                            {a.referredBy ? `via ${a.referredBy}` : a.source}
                          </span>
                          <span className={`text-[10px] flex items-center gap-1 num ${stale ? "text-[hsl(var(--ejb-amber))]" : "text-muted-foreground"}`}>
                            {stale && <AlertTriangle className="h-2.5 w-2.5" />}
                            {a.daysInStage}d
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ejb-card overflow-hidden">
          <table className="w-full data-table">
            <thead className="bg-secondary/50">
              <tr><th>Applicant</th><th>Company</th><th>Source</th><th>Stage</th><th>Days</th><th>Applied</th><th></th></tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-secondary/40 cursor-pointer" onClick={() => setActive(a)}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={a.name} hue={a.avatarHue} size="sm" />
                      <div><div className="font-medium text-sm">{a.name}</div><div className="text-[11px] text-muted-foreground">{a.position}</div></div>
                    </div>
                  </td>
                  <td className="text-sm">{a.company}</td>
                  <td className="text-xs text-muted-foreground">{a.referredBy ? `via ${a.referredBy}` : a.source}</td>
                  <td><StatusChip variant="info" label={a.stage} /></td>
                  <td className="num text-xs">{a.daysInStage}d</td>
                  <td className="num text-xs text-muted-foreground">{a.appliedDate}</td>
                  <td><Button variant="ghost" size="sm" className="h-7 text-xs">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto">
          {active && (
            <>
              <SheetHeader className="p-5 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <Avatar name={active.name} hue={active.avatarHue} size="lg" />
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base">{active.name}</SheetTitle>
                    <SheetDescription className="text-xs">{active.position} · {active.company}</SheetDescription>
                    <div className="flex items-center gap-1.5 mt-2">
                      <StatusChip variant="info" label={active.stage} />
                      <span className="text-[10px] text-muted-foreground num">{active.daysInStage}d in stage</span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-5 space-y-5">
                <div>
                  <div className="ejb-eyebrow mb-2">Stage</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8" disabled={STAGES.indexOf(active.stage) === 0} onClick={() => move(active.id, -1)}>
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
                    </Button>
                    <Button size="sm" className="h-8" disabled={STAGES.indexOf(active.stage) === STAGES.length - 1} onClick={() => move(active.id, 1)}>
                      Move to next <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    {STAGES.map((s, i) => {
                      const idx = STAGES.indexOf(active.stage);
                      return <div key={s} className={`flex-1 h-1 rounded-full ${i <= idx ? "bg-primary" : "bg-secondary"}`} />;
                    })}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span>{active.company}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs">{active.name.toLowerCase().replace(/\s/g, ".")}@{active.company.split(" ")[0].toLowerCase()}.com</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs num">+20 100 000 0000</span></div>
                  <div className="flex items-center gap-2"><Linkedin className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs">linkedin.com/in/{active.name.toLowerCase().replace(/\s/g, "-")}</span></div>
                </div>

                <div>
                  <div className="ejb-eyebrow mb-2">Source</div>
                  <div className="text-sm">
                    {active.referredBy ? <>Referred by <strong>{active.referredBy}</strong></> : active.source}
                  </div>
                </div>

                <div>
                  <div className="ejb-eyebrow mb-2">Notes</div>
                  <textarea placeholder="Add a note about this applicant…" className="w-full h-20 text-sm border border-border rounded-md p-2.5 bg-secondary/40 focus:outline-none focus:ring-2 focus:ring-ring" />
                  <div className="flex justify-end mt-2"><Button size="sm" variant="outline">Save note</Button></div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1">Reject</Button>
                  <Button size="sm" className="flex-1">Approve & invoice</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
