import { useState } from "react";
import { Bell, AlertCircle, Clock, Info, CheckCircle2 } from "lucide-react";
import { useDemoStore } from "@/store/demo";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const ICON: Record<string, any> = {
  danger: AlertCircle, warn: Clock, info: Info, neutral: CheckCircle2,
};
const TONE: Record<string, string> = {
  danger:  "text-destructive bg-destructive/10",
  warn:    "text-[hsl(var(--ejb-amber))] bg-[hsl(var(--ejb-amber)/0.15)]",
  info:    "text-primary bg-primary/10",
  neutral: "text-muted-foreground bg-secondary",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const notifications = useDemoStore((s) => s.notifications);
  const markAllRead = useDemoStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="h-9 w-9 rounded-md hover:bg-secondary flex items-center justify-center relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold flex items-center justify-center num">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">Mark all read</button>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.map((n) => {
            const Icon = ICON[n.type];
            return (
              <button
                key={n.id}
                onClick={() => { setOpen(false); navigate(n.href); }}
                className={cn(
                  "w-full text-left flex gap-2.5 px-3 py-2.5 hover:bg-secondary/60 border-b border-border/60 last:border-0",
                  n.unread && "bg-accent/30",
                )}
              >
                <div className={cn("h-7 w-7 rounded-md flex items-center justify-center shrink-0", TONE[n.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium leading-snug">{n.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{n.sub}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{n.ts}</div>
                </div>
                {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="px-3 py-2 border-t border-border bg-secondary/40">
          <button onClick={() => { setOpen(false); navigate("/audit"); }} className="text-[11px] text-primary hover:underline">
            View all activity →
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
