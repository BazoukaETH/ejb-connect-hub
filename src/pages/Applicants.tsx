import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { Applicant } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  DndContext, DragEndEvent, PointerSensor, useSensor, useSensors,
  useDraggable, useDroppable, DragOverlay, DragStartEvent,
} from "@dnd-kit/core";
import {
  Plus, LayoutGrid, List, AlertTriangle, ArrowRight, ArrowLeft,
  UserPlus, Mail, Phone, Linkedin, Building2, Flame, CheckCircle2, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const STAGES: Applicant["stage"][] = ["Leads", "Applied", "Referred", "Accepted", "Pending Payment"];
const STAGE_HINTS: Record<Applicant["stage"], string> = {
  "Leads": "No leads here yet. Drag a card in or click Add applicant.",
  "Applied": "Submitted application form. Awaiting board decision.",
  "Referred": "Endorsed by an existing EJB member.",
  "Accepted": "Approved by the board. Awaiting first cycle dues.",
  "Pending Payment": "Approved. Recording payment activates the member.",
};

function ApplicantCard({ a, onOpen, dragging }: { a: Applicant; onOpen: () => void; dragging?: boolean }) {
  const stale = a.daysInStage > 14;
  const veryStale = a.daysInStage > 30;
  return (
    <div
      onClick={onOpen}
      className={`ejb-card ejb-card-hover w-full text-left p-3 cursor-pointer animate-fade-in ${veryStale ? "ring-1 ring-destructive/40" : ""} ${dragging ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={a.name} hue={a.avatarHue} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{a.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{a.company}</div>
          <div className="text-[10px] text-muted-foreground mt-1 truncate">{a.position}</div>
        </div>
        {veryStale && <Flame className="h-3.5 w-3.5 text-destructive shrink-0" aria-label="Stalled >30 days" />}
      </div>
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
        <span className="text-[10px] text-muted-foreground truncate">
          {a.referredBy ? `via ${a.referredBy}` : a.source}
        </span>
        <span className={`text-[10px] flex items-center gap-1 num font-medium ${veryStale ? "text-destructive" : stale ? "text-[hsl(var(--ejb-amber))]" : "text-muted-foreground"}`}>
          {(stale || veryStale) && <AlertTriangle className="h-2.5 w-2.5" />}
          {a.daysInStage}d
        </span>
      </div>
    </div>
  );
}

function DraggableCard({ a, onOpen }: { a: Applicant; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: a.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      <ApplicantCard a={a} onOpen={onOpen} dragging={isDragging} />
    </div>
  );
}

function StageColumn({ stage, items, onOpen }: { stage: Applicant["stage"]; items: Applicant[]; onOpen: (a: Applicant) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const overWip = items.length > 10;
  return (
    <div ref={setNodeRef} className={`bg-secondary/50 rounded-lg p-2.5 min-h-[440px] flex flex-col transition-colors ${isOver ? "bg-primary/10 ring-2 ring-primary/40" : ""}`}>
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider">{stage}</h3>
          <span className="text-xs text-muted-foreground num">{items.length}</span>
        </div>
        {overWip && <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--ejb-amber))]" aria-label="Over WIP limit" />}
      </div>
      <div className="space-y-2 flex-1">
        {items.length === 0 ? (
          <EmptyState icon={UserPlus} title="No one here yet" description={STAGE_HINTS[stage]} compact className="!py-6 !px-3" />
        ) : items.map((a) => <DraggableCard key={a.id} a={a} onOpen={() => onOpen(a)} />)}
      </div>
    </div>
  );
}

export default function Applicants() {
  const items = useDemoStore((s) => s.applicants);
  const moveApplicantStage = useDemoStore((s) => s.moveApplicantStage);
  const removeApplicant = useDemoStore((s) => s.removeApplicant);
  const convertApplicant = useDemoStore((s) => s.convertApplicant);
  const addApplicant = useDemoStore((s) => s.addApplicant);
  const setApplicantApproval = useDemoStore((s) => s.setApplicantApproval);
  const recordApplicantPayment = useDemoStore((s) => s.recordApplicantPayment);
  const { query: globalQ } = useGlobalSearch();

  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [active, setActive] = useState<Applicant | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", company: "", position: "", source: "Cold inbound", stage: "Leads" as Applicant["stage"], referredBy: "" });
  const [confirmDelete, setConfirmDelete] = useState<Applicant | null>(null);
  const [approvalFor, setApprovalFor] = useState<Applicant | null>(null);
  const [approvalDraft, setApprovalDraft] = useState({ meetingDate: new Date().toISOString().slice(0, 10), decision: "Approved" as "Approved" | "Conditional" | "Deferred", minutesRef: "", notes: "" });
  const [payFor, setPayFor] = useState<Applicant | null>(null);
  const [payDraft, setPayDraft] = useState({ amount: 15000, method: "Bank transfer" as "Bank transfer" | "Cash" | "Cheque" | "Card", ref: "" });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filtered = useMemo(() => {
    if (!globalQ) return items;
    const q = globalQ.toLowerCase();
    return items.filter((a) => `${a.name} ${a.company} ${a.position}`.toLowerCase().includes(q));
  }, [items, globalQ]);

  const requestMove = (a: Applicant, next: Applicant["stage"]) => {
    if (next === a.stage) return;
    if (next === "Accepted") {
      setApprovalFor(a);
      setApprovalDraft({ meetingDate: new Date().toISOString().slice(0, 10), decision: "Approved", minutesRef: `BM-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`, notes: "" });
      return;
    }
    moveApplicantStage(a.id, next);
    setActive((p) => p && p.id === a.id ? { ...p, stage: next, daysInStage: 0 } : p);
    toast.success("Moved", { description: `${a.name} → ${next}` });
  };

  const move = (id: string, dir: 1 | -1) => {
    const a = items.find((x) => x.id === id);
    if (!a) return;
    const i = STAGES.indexOf(a.stage);
    const next = STAGES[Math.max(0, Math.min(STAGES.length - 1, i + dir))];
    requestMove(a, next);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const aId = String(e.active.id);
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    if (!STAGES.includes(overId as Applicant["stage"])) return;
    const a = items.find((x) => x.id === aId);
    if (!a || a.stage === overId) return;
    requestMove(a, overId as Applicant["stage"]);
  };

  const totals = useMemo(() => STAGES.map((s) => filtered.filter((a) => a.stage === s).length), [filtered]);

  const submitAdd = () => {
    if (!draft.name.trim() || !draft.company.trim()) return;
    addApplicant({ ...draft, referredBy: draft.referredBy || undefined });
    setAddOpen(false);
    setDraft({ name: "", company: "", position: "", source: "Cold inbound", stage: "Leads", referredBy: "" });
  };

  const draggingItem = activeDragId ? items.find((x) => x.id === activeDragId) : null;

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Applicants & Prospects"
        description={`${filtered.length} active in pipeline · drag cards between stages or use the side panel`}
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
            <Button size="sm" className="h-9" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add applicant</Button>
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
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveDragId(String(e.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveDragId(null)}
        >
          <div className="grid grid-cols-5 gap-3 min-w-[1200px] overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                items={filtered.filter((a) => a.stage === stage)}
                onOpen={setActive}
              />
            ))}
          </div>
          <DragOverlay>
            {draggingItem && <ApplicantCard a={draggingItem} onOpen={() => {}} />}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="ejb-card overflow-hidden">
          <table className="w-full data-table">
            <thead className="bg-secondary/50">
              <tr><th>Applicant</th><th>Company</th><th>Source</th><th>Stage</th><th>Days</th><th>Applied</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
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
                  <td><Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); setActive(a); }}>Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Side sheet */}
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

                <div className="space-y-2 pt-2 border-t border-border">
                  {active.stage === "Pending Payment" && (
                    <Button
                      size="sm"
                      className="w-full bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90 text-white"
                      onClick={() => {
                        convertApplicant(active.id);
                        toast.success("Converted to Member", { description: `${active.name} is now an active EJB member.` });
                        setActive(null);
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Convert to Member
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-destructive border-destructive/30" onClick={() => setConfirmDelete(active)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Reject
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => { move(active.id, 1); }}>Approve & advance</Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add applicant */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add applicant</DialogTitle>
            <DialogDescription>Add a new prospect to the pipeline.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div><label className="ejb-eyebrow">Full name</label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-9 mt-1" /></div>
            <div><label className="ejb-eyebrow">Company</label><Input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} className="h-9 mt-1" /></div>
            <div><label className="ejb-eyebrow">Position</label><Input value={draft.position} onChange={(e) => setDraft({ ...draft, position: e.target.value })} placeholder="Founder" className="h-9 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="ejb-eyebrow">Source</label>
                <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card">
                  <option>Cold inbound</option><option>Referred</option><option>Event</option>
                </select>
              </div>
              <div>
                <label className="ejb-eyebrow">Stage</label>
                <select value={draft.stage} onChange={(e) => setDraft({ ...draft, stage: e.target.value as Applicant["stage"] })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card">
                  {STAGES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {draft.source === "Referred" && (
              <div><label className="ejb-eyebrow">Referred by</label><Input value={draft.referredBy} onChange={(e) => setDraft({ ...draft, referredBy: e.target.value })} placeholder="Member name" className="h-9 mt-1" /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!draft.name.trim() || !draft.company.trim()} onClick={submitAdd}>Add to pipeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject confirm */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject applicant?</DialogTitle>
            <DialogDescription>{confirmDelete?.name} will be removed from the pipeline. This is a demo - data resets on refresh.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (confirmDelete) { removeApplicant(confirmDelete.id); toast.success("Applicant rejected", { description: confirmDelete.name }); }
              setConfirmDelete(null); setActive(null);
            }}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
