import { PageHeader } from "@/components/PageHeader";
import { StatusChip } from "@/components/StatusChip";
import { PARTNERS, fmtEGP } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";

const tierColor = (t: string) => t === "Platinum" ? "neutral" : t === "Gold" ? "pending" : t === "Silver" ? "info" : "brand";

export default function Partners() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Partners & Sponsors" description="Drives the Partners strip on the app home screen"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add partner</Button>} />

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
    </div>
  );
}
