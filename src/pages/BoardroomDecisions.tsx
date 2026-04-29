import { PageHeader } from "@/components/PageHeader";
import { BOARD_DECISIONS, fmtEGP } from "@/data/mock";
import { StatusChip } from "@/components/StatusChip";
import { Button } from "@/components/ui/button";
import { Gavel, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";

const URG_COLOR = (u: string) =>
  u === "High" ? "unpaid" : u === "Medium" ? "pending" : "info";

export default function BoardroomDecisions() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <PageHeader
        title="Decisions queue"
        description={`${BOARD_DECISIONS.length} items awaiting board approval · review before next meeting`}
      />
      <div className="space-y-3">
        {BOARD_DECISIONS.map((d) => (
          <div key={d.id} className="ejb-card p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-md bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                <Gavel className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusChip variant="brand" label={d.type} />
                  <StatusChip variant={URG_COLOR(d.urgency) as any} label={`${d.urgency} urgency`} dot />
                  {d.amount && (
                    <span className="text-[11px] num font-semibold text-foreground">{fmtEGP(d.amount)}</span>
                  )}
                </div>
                <h3 className="text-sm font-semibold mt-2">{d.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Raised by {d.raisedBy} · {d.raisedAt}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button variant="outline" size="sm" className="h-8 text-xs"><MessageSquare className="h-3 w-3 mr-1" /> Discuss</Button>
                <Button variant="outline" size="sm" className="h-8 text-xs text-destructive border-destructive/30"><ThumbsDown className="h-3 w-3 mr-1" /> Reject</Button>
                <Button size="sm" className="h-8 text-xs"><ThumbsUp className="h-3 w-3 mr-1" /> Approve</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
