import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import {
  SPONSOR_PIPELINE, SponsorStage, fmtEGP, Partner,
  SponsorPackage, SponsorTier, MEMBER_BASE_VALUE,
} from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Plus, GripVertical, Calendar, User, ExternalLink, Mail, FileText, History, RotateCw } from "lucide-react";
import { toast } from "sonner";

const tierColor = (t: string) => t === "Platinum" ? "neutral" : t === "Gold" ? "pending" : t === "Silver" ? "info" : "brand";
const STAGES: SponsorStage[] = ["Prospect", "Pitched", "Negotiating", "Contracted", "Live", "Renewal due"];
const TIERS: SponsorTier[] = ["Platinum", "Gold", "Silver", "Bronze"];
const PACKAGES: SponsorPackage[] = ["Annual", "Sohour", "Event-specific", "Custom"];

export default function Partners() {
  const partners = useDemoStore((s) => s.partners);
  const historicalPartners = useDemoStore((s) => s.historicalPartners);
  const addPartner = useDemoStore((s) => s.addPartner);
  const updatePartner = useDemoStore((s) => s.updatePartner);
  const reorderPartners = useDemoStore((s) => s.reorderPartners);
  const addReEngagement = useDemoStore((s) => s.addReEngagement);
  const { query: globalQ } = useGlobalSearch();

  const [active, setActive] = useState<Partner | null>(null);
  const [historical, setHistorical] = useState<Partner | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [proposalFor, setProposalFor] = useState<Partner | null>(null);
  const [reEngageFor, setReEngageFor] = useState<Partner | null>(null);
  const [reDraft, setReDraft] = useState({ owner: "Mona Allam", status: "Pitched" as const, notes: "" });

  const [draft, setDraft] = useState({
    name: "", tier: "Silver" as SponsorTier, website: "",
    contactName: "", contactEmail: "", value: 150000, description: "",
    packages: ["Annual"] as SponsorPackage[],
  });

  const [packageFilter, setPackageFilter] = useState<SponsorPackage[]>([]);
  const [tierFilter, setTierFilter] = useState<SponsorTier | "All">("All");
  const [dragging, setDragging] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = partners;
    if (globalQ) {
      const q = globalQ.toLowerCase();
      list = list.filter((p) => `${p.name} ${p.tier} ${p.contactName}`.toLowerCase().includes(q));
    }
    if (tierFilter !== "All") list = list.filter((p) => p.tier === tierFilter);
    if (packageFilter.length > 0) {
      list = list.filter((p) => (p.packages ?? []).some((pk) => packageFilter.includes(pk)));
    }
    return list;
  }, [partners, globalQ, tierFilter, packageFilter]);

  const totalPipeline = SPONSOR_PIPELINE.reduce((s, d) => s + d.value, 0);
  const liveValue = partners.filter((p) => p.active).reduce((s, p) => s + p.value, 0);
  const renewalValue = SPONSOR_PIPELINE.filter((d) => d.stage === "Renewal due").reduce((s, d) => s + d.value, 0);

  const tierCounts = TIERS.map((t) => ({ tier: t, count: partners.filter((p) => p.tier === t).length, value: partners.filter((p) => p.tier === t).reduce((s, p) => s + p.value, 0) }));

  const togglePackageFilter = (pk: SponsorPackage) => {
    setPackageFilter((cur) => cur.includes(pk) ? cur.filter((x) => x !== pk) : [...cur, pk]);
  };

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
    setDraft({ name: "", tier: "Silver", website: "", contactName: "", contactEmail: "", value: 150000, description: "", packages: ["Annual"] });
  };

  const submitReEngage = () => {
    if (!reEngageFor) return;
    addReEngagement(reEngageFor.id, {
      date: new Date().toISOString().slice(0, 10),
      owner: reDraft.owner,
      status: reDraft.status,
      notes: reDraft.notes || `${reDraft.status} outreach logged.`,
    });
    setReEngageFor(null);
    setReDraft({ owner: "Mona Allam", status: "Pitched", notes: "" });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Partners & Sponsors" description="Tag with package + tier · drag to reorder app home strip"
        actions={<Button size="sm" className="h-9" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5 mr-1.5" /> Add partner</Button>} />

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Active partners</div><div className="text-xl font-bold num mt-1">{partners.filter(p => p.active).length}</div><div className="text-[11px] text-muted-foreground">{historicalPartners.length} historical</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Live revenue</div><div className="text-xl font-bold num mt-1 text-[hsl(var(--success))]">{fmtEGP(liveValue, { compact: true })}</div><div className="text-[11px] text-muted-foreground">contracted this year</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Pipeline value</div><div className="text-xl font-bold num mt-1">{fmtEGP(totalPipeline, { compact: true })}</div><div className="text-[11px] text-muted-foreground">{SPONSOR_PIPELINE.length} deals</div></div>
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Renewals due</div><div className="text-xl font-bold num mt-1 text-[hsl(var(--ejb-amber))]">{fmtEGP(renewalValue, { compact: true })}</div><div className="text-[11px] text-muted-foreground">next 90 days</div></div>
      </div>

      {/* Tier breakdown chips */}
      <div className="ejb-card p-3 mb-4 flex items-center gap-3 flex-wrap">
        <span className="ejb-eyebrow">Tier mix</span>
        {tierCounts.map((t) => (
          <button key={t.tier} onClick={() => setTierFilter(tierFilter === t.tier ? "All" : t.tier)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs transition ${tierFilter === t.tier ? "border-primary bg-primary/10" : "border-border hover:bg-secondary/60"}`}>
            <StatusChip variant={tierColor(t.tier) as any} label={t.tier} />
            <span className="num text-muted-foreground">{t.count} · {fmtEGP(t.value, { compact: true })}</span>
          </button>
        ))}
        {tierFilter !== "All" && <button onClick={() => setTierFilter("All")} className="text-[11px] text-primary hover:underline">Clear</button>}
        <span className="mx-2 text-border">|</span>
        <span className="ejb-eyebrow">Packages</span>
        {PACKAGES.map((pk) => (
          <button key={pk} onClick={() => togglePackageFilter(pk)} className={`px-2.5 py-1 rounded-md border text-xs transition ${packageFilter.includes(pk) ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-secondary/60"}`}>
            {pk}
          </button>
        ))}
        {packageFilter.length > 0 && <button onClick={() => setPackageFilter([])} className="text-[11px] text-primary hover:underline">Clear</button>}
      </div>

      <Tabs defaultValue="active">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-1 mb-4">
          {[["active", "Active partners"], ["pipeline", "Sponsor pipeline"], ["historical", `Historical · ${historicalPartners.length}`]].map(([v, l]) => (
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
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <StatusChip variant={tierColor(p.tier) as any} label={p.tier} />
                      <StatusChip variant={p.active ? "paid" : "neutral"} label={p.active ? "Active" : "Inactive"} dot />
                      {(p.packages ?? []).map((pk) => (
                        <span key={pk} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{pk}</span>
                      ))}
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
            {filtered.length === 0 && (
              <div className="col-span-full ejb-card p-8 text-center text-sm text-muted-foreground">
                No partners match these filters.
              </div>
            )}
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

        <TabsContent value="historical">
          <div className="ejb-card p-3 mb-3 text-xs text-muted-foreground flex items-center gap-2">
            <History className="h-3.5 w-3.5" />
            Former sponsors. Use re-engagement actions to log outreach attempts and track win-back pipeline.
          </div>
          <div className="ejb-card overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-secondary/50">
                <tr>
                  <th>Sponsor</th><th>Last tier</th><th>Years sponsored</th>
                  <th>Last package</th><th>Lifetime value</th><th>Last contact</th>
                  <th>Re-engagement log</th><th></th>
                </tr>
              </thead>
              <tbody>
                {historicalPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td>
                      <button onClick={() => setHistorical(p)} className="text-left hover:underline">
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.contactName}</div>
                      </button>
                    </td>
                    <td><StatusChip variant={tierColor(p.lastTier ?? p.tier) as any} label={p.lastTier ?? p.tier} /></td>
                    <td className="text-xs num text-muted-foreground">{(p.yearsSponsored ?? []).join(", ")}</td>
                    <td className="text-xs">{p.lastPackage ?? "-"}</td>
                    <td className="num">{fmtEGP(p.lifetimeValue ?? 0, { compact: true })}</td>
                    <td className="num text-xs text-muted-foreground">{p.lastContact ?? "-"}</td>
                    <td className="text-xs num text-muted-foreground">{(p.reEngagements?.length ?? 0)} entries</td>
                    <td>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setReEngageFor(p)}>
                          <RotateCw className="h-3 w-3 mr-1" /> Re-engage
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setProposalFor(p)}>
                          <FileText className="h-3 w-3 mr-1" /> Proposal
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Active partner drawer */}
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
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <StatusChip variant={tierColor(active.tier) as any} label={active.tier} />
                      <StatusChip variant={active.active ? "paid" : "neutral"} label={active.active ? "Active" : "Inactive"} dot />
                    </div>
                  </div>
                </div>
              </SheetHeader>
              <div className="p-5 space-y-4 text-sm">
                <div>
                  <div className="ejb-eyebrow mb-1.5">Packages</div>
                  <div className="flex flex-wrap gap-1.5">
                    {PACKAGES.map((pk) => {
                      const on = (active.packages ?? []).includes(pk);
                      return (
                        <button key={pk} onClick={() => updatePartner(active.id, { packages: on ? (active.packages ?? []).filter((x) => x !== pk) : [...(active.packages ?? []), pk] })} className={`px-2.5 py-1 rounded-md border text-xs transition ${on ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-secondary/60 text-muted-foreground"}`}>
                          {pk}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="ejb-eyebrow mb-1.5">Tier</div>
                  <select value={active.tier} onChange={(e) => updatePartner(active.id, { tier: e.target.value as SponsorTier })} className="w-full h-9 px-3 border border-border rounded-md bg-card text-sm">
                    {TIERS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
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
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.success("Email drafted", { description: active.contactEmail })}>
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setProposalFor(active)}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Proposal
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => toast("Renewal flow opened", { description: "Demo only." })}>Renew</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Historical drawer with re-engagement log */}
      <Sheet open={!!historical} onOpenChange={(o) => !o && setHistorical(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
          {historical && (
            <>
              <SheetHeader className="p-5 pb-4 border-b border-border">
                <SheetTitle>{historical.name}</SheetTitle>
                <SheetDescription>Historical sponsor · last active {historical.lastContact ?? "-"}</SheetDescription>
              </SheetHeader>
              <div className="p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><div className="text-muted-foreground">Last tier</div><div><StatusChip variant={tierColor(historical.lastTier ?? "Silver") as any} label={historical.lastTier ?? "Silver"} /></div></div>
                  <div><div className="text-muted-foreground">Last package</div><div className="font-medium">{historical.lastPackage}</div></div>
                  <div><div className="text-muted-foreground">Years sponsored</div><div className="num">{(historical.yearsSponsored ?? []).join(", ")}</div></div>
                  <div><div className="text-muted-foreground">Lifetime value</div><div className="num font-medium">{fmtEGP(historical.lifetimeValue ?? 0)}</div></div>
                </div>
                <div>
                  <div className="ejb-eyebrow mb-2">Re-engagement log</div>
                  {(historical.reEngagements?.length ?? 0) === 0 ? (
                    <div className="text-xs text-muted-foreground italic p-3 border border-dashed border-border rounded-md text-center">No outreach logged yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {historical.reEngagements!.map((e) => (
                        <div key={e.id} className="border border-border rounded-md p-2.5 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <StatusChip variant={e.status === "Won-back" ? "paid" : e.status === "Lost" ? "unpaid" : "pending"} label={e.status} />
                            <span className="num text-muted-foreground">{e.date}</span>
                          </div>
                          <div className="text-muted-foreground">{e.notes}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">by {e.owner}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setReEngageFor(historical); }}>
                    <RotateCw className="h-3.5 w-3.5 mr-1.5" /> Log re-engagement
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => setProposalFor(historical)}>
                    <FileText className="h-3.5 w-3.5 mr-1.5" /> Generate proposal
                  </Button>
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
                <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value as SponsorTier })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card">
                  {TIERS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="ejb-eyebrow">Value (EGP)</label>
                <input type="number" value={draft.value} onChange={(e) => setDraft({ ...draft, value: parseInt(e.target.value) || 0 })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card num" />
              </div>
            </div>
            <div>
              <label className="ejb-eyebrow">Packages</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PACKAGES.map((pk) => {
                  const on = draft.packages.includes(pk);
                  return (
                    <button key={pk} type="button" onClick={() => setDraft({ ...draft, packages: on ? draft.packages.filter((x) => x !== pk) : [...draft.packages, pk] })} className={`px-2.5 py-1 rounded-md border text-xs ${on ? "border-primary bg-primary/10 text-primary font-medium" : "border-border text-muted-foreground"}`}>
                      {pk}
                    </button>
                  );
                })}
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

      {/* Re-engagement modal */}
      <Dialog open={!!reEngageFor} onOpenChange={(o) => { if (!o) { setReEngageFor(null); setReDraft({ owner: "Mona Allam", status: "Pitched", notes: "" }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log re-engagement</DialogTitle>
            <DialogDescription>{reEngageFor?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="ejb-eyebrow">Owner</label>
                <Input value={reDraft.owner} onChange={(e) => setReDraft({ ...reDraft, owner: e.target.value })} className="h-9 mt-1" />
              </div>
              <div>
                <label className="ejb-eyebrow">Status</label>
                <select value={reDraft.status} onChange={(e) => setReDraft({ ...reDraft, status: e.target.value as any })} className="w-full h-9 mt-1 px-3 border border-border rounded-md bg-card">
                  <option>Pitched</option><option>Negotiating</option><option>Won-back</option><option>Lost</option>
                </select>
              </div>
            </div>
            <div>
              <label className="ejb-eyebrow">Notes</label>
              <textarea value={reDraft.notes} onChange={(e) => setReDraft({ ...reDraft, notes: e.target.value })} className="w-full h-20 mt-1 px-3 py-2 border border-border rounded-md bg-card text-sm" placeholder="Outreach summary, next steps…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReEngageFor(null)}>Cancel</Button>
            <Button onClick={submitReEngage}>Save entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sponsorship proposal generator */}
      <Dialog open={!!proposalFor} onOpenChange={(o) => !o && setProposalFor(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Sponsorship proposal</DialogTitle>
            <DialogDescription>For {proposalFor?.name} · auto-built from member-base value</DialogDescription>
          </DialogHeader>
          {proposalFor && (
            <div className="space-y-4 text-sm">
              <div className="rounded-md border border-border bg-secondary/30 p-4">
                <div className="ejb-eyebrow mb-2">Member-base value</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><div className="text-muted-foreground">Total members</div><div className="font-bold num text-base">{MEMBER_BASE_VALUE.totalMembers}</div></div>
                  <div><div className="text-muted-foreground">Seniority</div><div className="font-medium">{MEMBER_BASE_VALUE.avgSeniority}</div></div>
                  <div><div className="text-muted-foreground">Combined revenue</div><div className="font-bold num text-base">{fmtEGP(MEMBER_BASE_VALUE.estimatedCombinedRevenue, { compact: true })}</div></div>
                  <div><div className="text-muted-foreground">Avg event reach</div><div className="font-bold num text-base">{MEMBER_BASE_VALUE.avgEventAttendance}</div></div>
                </div>
              </div>
              <div>
                <div className="ejb-eyebrow mb-2">Industry breakdown</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {MEMBER_BASE_VALUE.industryBreakdown.map((b) => (
                    <div key={b.industry} className="flex items-center gap-2 text-xs">
                      <div className="flex-1 truncate">{b.industry}</div>
                      <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(b.count / MEMBER_BASE_VALUE.totalMembers) * 100}%` }} />
                      </div>
                      <div className="num text-muted-foreground w-8 text-right">{b.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-border p-4">
                <div className="ejb-eyebrow mb-2">Recommended package</div>
                <div className="flex items-center gap-2 mb-2">
                  <StatusChip variant={tierColor(proposalFor.lastTier ?? proposalFor.tier) as any} label={proposalFor.lastTier ?? proposalFor.tier} />
                  <span className="text-xs text-muted-foreground">based on previous engagement</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Suggested annual value: <strong className="text-foreground num">{fmtEGP(proposalFor.lifetimeValue ? Math.round(proposalFor.lifetimeValue / Math.max(1, (proposalFor.yearsSponsored?.length ?? 1))) : proposalFor.value || 200000)}</strong>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProposalFor(null)}>Close</Button>
            <Button onClick={() => { toast.success("Proposal generated", { description: `PDF drafted for ${proposalFor?.name}.` }); setProposalFor(null); }}>
              <FileText className="h-3.5 w-3.5 mr-1.5" /> Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
