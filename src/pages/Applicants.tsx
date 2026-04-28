import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { APPLICANTS, Applicant } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, AlertTriangle } from "lucide-react";

const STAGES: Applicant["stage"][] = ["Lead", "Prospect", "Referred", "Applicant", "Pending Payment"];

export default function Applicants() {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Applicants & Prospects"
        description="Pipeline from lead through to active member"
        actions={
          <>
            <div className="flex items-center bg-secondary rounded-md p-0.5">
              <button onClick={() => setView("kanban")} className={`h-7 px-2 rounded text-xs flex items-center gap-1 ${view === "kanban" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                <LayoutGrid className="h-3 w-3" /> Kanban
              </button>
              <button onClick={() => setView("table")} className={`h-7 px-2 rounded text-xs flex items-center gap-1 ${view === "table" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
                <List className="h-3 w-3" /> Table
              </button>
            </div>
            <Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add applicant</Button>
          </>
        }
      />

      {view === "kanban" ? (
        <div className="grid grid-cols-5 gap-3 min-w-[1200px] overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const items = APPLICANTS.filter((a) => a.stage === stage);
            const overWip = items.length > 10;
            return (
              <div key={stage} className="bg-secondary/50 rounded-lg p-2.5 min-h-[400px]">
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider">{stage}</h3>
                    <span className="text-xs text-muted-foreground num">{items.length}</span>
                  </div>
                  {overWip && <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--ejb-amber))]" />}
                </div>
                <div className="space-y-2">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground text-center py-6 px-2">
                      No leads here yet. Members can refer prospects through the mobile app.
                    </div>
                  ) : items.map((a) => {
                    const stale = a.daysInStage > 14;
                    return (
                      <div key={a.id} className="ejb-card p-3 hover:shadow-md cursor-grab">
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
                          <span className={`text-[10px] flex items-center gap-1 ${stale ? "text-[hsl(var(--ejb-amber))]" : "text-muted-foreground"} num`}>
                            {stale && <AlertTriangle className="h-2.5 w-2.5" />}
                            {a.daysInStage}d
                          </span>
                        </div>
                      </div>
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
              {APPLICANTS.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={a.name} hue={a.avatarHue} size="sm" />
                      <div><div className="font-medium text-sm">{a.name}</div><div className="text-[11px] text-muted-foreground">{a.position}</div></div>
                    </div>
                  </td>
                  <td className="text-sm">{a.company}</td>
                  <td className="text-xs text-muted-foreground">{a.referredBy ? `via ${a.referredBy}` : a.source}</td>
                  <td><span className="chip chip-info">{a.stage}</span></td>
                  <td className="num text-xs">{a.daysInStage}d</td>
                  <td className="num text-xs text-muted-foreground">{a.appliedDate}</td>
                  <td><Button variant="ghost" size="sm" className="h-7 text-xs">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
