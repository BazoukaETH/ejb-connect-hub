import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { PARTNERS, SPONSOR_PIPELINE, SponsorStage, fmtEGP } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, GripVertical, Calendar, User } from "lucide-react";

const tierColor = (t: string) => t === "Platinum" ? "neutral" : t === "Gold" ? "pending" : t === "Silver" ? "info" : "brand";
const STAGES: SponsorStage[] = ["Prospect", "Pitched", "Negotiating", "Contracted", "Live", "Renewal due"];

export default function Partners() {
  const totalPipeline = SPONSOR_PIPELINE.reduce((s, d) => s + d.value, 0);
  const liveValue = SPONSOR_PIPELINE.filter(d => d.stage === "Live").reduce((s, d) => s + d.value, 0);
  const renewalValue = SPONSOR_PIPELINE.filter(d => d.stage === "Renewal due").reduce((s, d) => s + d.value, 0);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Partners & Sponsors" description="Drives the Partners strip on the app home screen"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add partner</Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="ejb-card p-3"><div className="ejb-eyebrow">Active partners</div><div className="text-xl font-bold num mt-1">{PARTNERS.filter(p => p.active).length}</div><div className="text-[11px] text-muted-foreground">on app home</div></div>
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
            {PARTNERS.map((p) => (
              <div key={p.id} className="ejb-card p-4 ejb-card-hover">
                <div className="flex items-start gap-3">
                  <button className="text-muted-foreground cursor-grab pt-1"><GripVertical className="h-4 w-4" /></button>
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
    </div>
  );
}
