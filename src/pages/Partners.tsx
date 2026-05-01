import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { SPONSOR_PIPELINE, SponsorStage, fmtEGP, Partner } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, GripVertical, Calendar, User, ExternalLink, Mail } from "lucide-react";
import { toast } from "sonner";

const tierColor = (t: string) => t === "Platinum" ? "neutral" : t === "Gold" ? "pending" : t === "Silver" ? "info" : "brand";
const STAGES: SponsorStage[] = ["Prospect", "Pitched", "Negotiating", "Contracted", "Live", "Renewal due"];
const TIERS: Partner["tier"][] = ["Platinum", "Gold", "Silver", "Bronze"];

export default function Partners() {
  const partners = useDemoStore((s) => s.partners);
  const addPartner = useDemoStore((s) => s.addPartner);
  const reorderPartners = useDemoStore((s) => s.reorderPartners);
  const { query: globalQ } = useGlobalSearch();

  const [active, setActive] = useState<Partner | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "", tier: "Silver" as Partner["tier"], website: "",
    contactName: "", contactEmail: "", value: 150000, description: "",
  });
  const [dragging, setDragging] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!globalQ) return partners;
    const q = globalQ.toLowerCase();
    return partners.filter((p) => `${p.name} ${p.tier} ${p.contactName}`.toLowerCase().includes(q));
  }, [partners, globalQ]);

  const totalPipeline = SPONSOR_PIPELINE.reduce((s, d) => s + d.value, 0);
  const liveValue = SPONSOR_PIPELINE.filter(d => d.stage === "Live").reduce((s, d) => s + d.value, 0);
  const renewalValue = SPONSOR_PIPELINE.filter(d => d.stage === "Renewal due").reduce((s, d) => s + d.value, 0);

  const onDragStart = (e: React.DragEvent, id: string) => { setDragging(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    const ids = partners.map((p) => p.id);
    const from = ids.indexOf(dragging);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderPartners(ids);
    setDragging(null);
    toast.success("Reordered", { description: "App home strip order updated." });
  };

  const submit = () => {
    if (!draft.name.trim()) return;
    addPartner({ ...draft });
    setAddOpen(false);
    setDraft({ name: "", tier: "Silver", website: "", contactName: "", contactEmail: "", value: 150000, description: "" });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Partners & Sponsors" description="Drag cards to reorder the strip on the app home screen"
        actions={<Button size="sm" className="h-9" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add partner</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Active partners</div><div className="text-xl font-bold num mt-1">{partners.filter(p => p.active).length}</div><div className="text-[11px] text-muted-foreground">on app home</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Pipeline value</div><div className="text-xl font-bold num mt-1">{fmtEGP(totalPipeline, { compact: true })}</div><div className="text-[11px] text-muted-foreground">{SPONSOR_PIPELINE.length} deals</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Live revenue</div><div className="text-xl font-bold num mt-1 text-[hsl(var(--success))]">{fmtEGP(liveValue, { compact: true })}</div><div className="text-[11px] text-muted-foreground">contracted this year</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Renewals due</div><div className="text-xl font-bold num mt-1 text-[hsl(var(--ejb-amber))]">{fmtEGP(renewalValue, { compact: true })}</div><div className="text-[11px] text-muted-foreground">next 90 days</div></div>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[["active", "Active partners"], ["pipeline", "Sponsor pipeline"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-3 py-2 text-sm shadow-none">{l}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => onDragStart(e, p.id)}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, p.id)}
                onClick={() => setActive(p)}
                className={`ejb-card p-4 ejb-card-hover cursor-pointer ${dragging === p.id ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <button className="text-muted-foreground cursor-grab pt-1" onClick={(e) => e.stopPropagation()}><GripVertical className="h-4 w-4" /></button>
                  <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center font-bold text-lg shrink-0">{p.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.website}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <StatusChip variant={tierColor(p.tier) as any} label={p.tier} />
                      <StatusChip variant={p.active ? "paid" : "neutral"} label={p.active ? "Active" : "Inactive"} dot />
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-[11px]">
                  <div><div className="text-muted-foreground">Value</div><div className="font-medium num">{fmtEGP(p.value, { compact: true })}</div></div>
                  <div><div className="text-muted-foreground">Payment</div><div><StatusChip variant={p.paymentStatus === "Paid" ? "paid" : p.paymentStatus === "Outstanding" ? "unpaid" : "pending"} label={p.paymentStatus} /></div></div>
                  <div className="col-span-2"><div className="text-muted-foreground">Contract</div><div className="font-medium num">{p.contractStart} → {p.contractEnd}</div></div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="grid grid-cols-6 gap-3 min-w-[1200px] overflow-x-auto pb-4">
            {STAGES.map((stage) => {
              const items = SPONSOR_PIPELINE.filter(d => d.stage === stage);
              const total = items.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage} className="bg-secondary/50 rounded-lg p-2.5 min-h-[400px] flex flex-col">
                  <div className="mb-2.5 px-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider">{stage}</h3>
                      <span className="text-xs text-muted-foreground num">{items.length}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground num mt-0.5">{fmtEGP(total, { compact: true })}</div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {items.map((d) => (
                      <div key={d.id} className="ejb-card ejb-card-hover p-2.5">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="text-xs font-semibold truncate">{d.name}</div>
                          <StatusChip variant={tierColor(d.tier) as any} label={d.tier[0]} />
                        </div>
                        <div className="text-[11px] text-muted-foreground num mt-1">{fmtEGP(d.value, { compact: true })}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {d.owner}</span>
                          <span className="num">{d.daysInStage}d</span>
                        </div>
                        {d.renewalDate && (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[hsl(var(--ejb-amber))] num">
                            <Calendar className="h-2.5 w-2.5" /> Renews {d.renewalDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Drawer */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto">
          {active && (
            <>
              <SheetHeader className="p-5 pb-4 border-b border-border">
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 rounded-md bg-secondary flex items-center justify-center font-bold text-2xl shrink-0">{active.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base">{active.name}</SheetTitle>
                    <SheetDescription className="text-xs">{active.description}</SheetDescription>
                    <div className="flex items-center gap-1.5 mt-2">
                      <StatusChip variant={tierColor(active.tier) as any} label={active.tier} />
                      <StatusChip variant={active.active ? "paid" : "neutral"} label={active.active ? "Active" : "Inactive"} dot />
                    </div>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-5 space-y-4 text-sm">
                <div>
                  <div className="ejb-eyebrow mb-1.5">Contract</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><div className="text-muted-foreground">Value</div><div className="font-medium num">{fmtEGP(active.value)}</div></div>
                    <div><div className="text-muted-foreground">Payment</div><div><StatusChip variant={active.paymentStatus === "Paid" ? "paid" : active.paymentStatus === "Outstanding" ? "unpaid" : "pending"} label={active.paymentStatus} /></div></div>
                    <div className="col-span-2"><div className="text-muted-foreground">Period</div><div className="num">{active.contractStart} → {active.contractEnd}</div></div>
                  </div>
                </div>
                <div>
                  <div className="ejb-eyebrow mb-1.5">Contact</div>
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2"><User className="h-3 w-3 text-muted-foreground" /> {active.contactName}</div>
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-muted-foreground" /> {active.contactEmail}</div>
                    <div className="flex items-center gap-2"><ExternalLink className="h-3 w-3 text-muted-foreground" /> {active.website}</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Email drafted", { description: active.contactEmail })}>
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Email contact
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => toast("Renewal flow opened", { description: "Demo only." })}>Renew contract</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add partner */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add partner</DialogTitle>
            <DialogDescription>New partners appear on the app home strip immediately.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div><label className="ejb-eyebrow">Name</label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="h-9 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="ejb-eyebrow">Tier</label>
                <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value as Partner["tier"] })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card">
                  {TIERS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="ejb-eyebrow">Value (EGP)</label>
                <input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: parseInt(e.target.value) || 0 })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card num" />
              </div>
            </div>
            <div><label className="ejb-eyebrow">Website</label><Input value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} placeholder="example.com" className="h-9 mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="ejb-eyebrow">Contact name</label><Input value={draft.contactName} onChange={(e) => setDraft({ ...draft, contactName: e.target.value })} className="h-9 mt-1" /></div>
              <div><label className="ejb-eyebrow">Contact email</label><Input value={draft.contactEmail} onChange={(e) => setDraft({ ...draft, contactEmail: e.target.value })} className="h-9 mt-1" /></div>
            </div>
            <div><label className="ejb-eyebrow">Description</label><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="w-full h-16 mt-1 px-3 py-2 border border-border rounded-md bg-card text-sm" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button disabled={!draft.name.trim()} onClick={submit}>Add partner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
