import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "ejb-grid-bg rounded-[var(--radius-lg)] border border-dashed border-border flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-6" : "py-14 px-8",
        className,
      )}
    >
      <div className="h-11 w-11 rounded-xl bg-card border border-border flex items-center justify-center mb-3 shadow-sm">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
