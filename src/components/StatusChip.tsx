import { cn } from "@/lib/utils";

type Variant = "paid" | "unpaid" | "pending" | "info" | "neutral" | "brand";

const map: Record<Variant, string> = {
  paid: "chip-paid",
  unpaid: "chip-unpaid",
  pending: "chip-pending",
  info: "chip-info",
  neutral: "chip-neutral",
  brand: "chip-brand",
};

const dotMap: Record<Variant, string> = {
  paid: "bg-[hsl(142_71%_35%)]",
  unpaid: "bg-[hsl(0_63%_50%)]",
  pending: "bg-[hsl(38_92%_45%)]",
  info: "bg-[hsl(195_60%_38%)]",
  neutral: "bg-muted-foreground",
  brand: "bg-primary",
};

export function StatusChip({
  variant = "neutral",
  label,
  dot,
  className,
}: {
  variant?: Variant;
  label: string;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("chip", map[variant], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotMap[variant])} />}
      {label}
    </span>
  );
}

export function variantForMemberStatus(s: string): Variant {
  if (s === "Active") return "paid";
  if (s === "Pending Payment") return "pending";
  if (s === "Lapsed") return "unpaid";
  if (s === "Suspended") return "unpaid";
  if (s === "Alumni") return "neutral";
  return "neutral";
}

export function variantForPayment(s: string): Variant {
  if (s === "Paid") return "paid";
  if (s === "Unpaid") return "unpaid";
  if (s === "Partial") return "pending";
  if (s === "Waived") return "neutral";
  return "neutral";
}

export function variantForPriority(p: string): Variant {
  if (p === "Urgent") return "unpaid";
  if (p === "High") return "pending";
  if (p === "Medium") return "info";
  return "neutral";
}
