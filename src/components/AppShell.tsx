import { Outlet, useLocation, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, Bell, ChevronRight, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Input } from "@/components/ui/input";
import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const labels: Record<string, string> = {
  "": "Dashboard",
  members: "Members",
  applicants: "Applicants & Prospects",
  onboarding: "Onboarding Queue",
  team: "Team",
  payments: "Payments & Dues",
  partners: "Partners & Sponsors",
  expenses: "Expenses",
  committees: "Committees",
  events: "Events",
  announcements: "Announcements",
  documents: "Documents",
  resources: "Resources",
  templates: "Templates",
  "app-content": "App Content",
  chat: "Chat Moderation",
  taxonomies: "Taxonomies",
  audit: "Audit Log",
  settings: "Settings",
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) {
    return <span className="text-sm font-medium">Dashboard</span>;
  }
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-muted-foreground hover:text-foreground">EJB</Link>
      {parts.map((p, i) => {
        const url = "/" + parts.slice(0, i + 1).join("/");
        const isLast = i === parts.length - 1;
        const label = labels[p] ?? decodeURIComponent(p);
        return (
          <span key={url} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{label}</span>
            ) : (
              <Link to={url} className="text-muted-foreground hover:text-foreground">{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function AppShell() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoLabel, setDemoLabel] = useState("Action");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Find nearest interactive element
      const btn = target.closest<HTMLElement>(
        'button, [role="button"], [data-demo-clickable]'
      );
      if (!btn) return;

      // Skip if it's inside something that already handles it
      if (btn.closest("a")) return; // links navigate
      if (btn.hasAttribute("data-demo-skip")) return;
      if (btn.getAttribute("type") === "submit") return;
      if (btn.hasAttribute("data-state")) return; // radix triggers (dialog/popover/select/tabs/etc.)
      if (btn.closest("[data-radix-popper-content-wrapper]")) return;
      if (btn.closest('[role="dialog"]')) return;
      if (btn.closest('[role="menu"]')) return;
      if (btn.closest('[role="listbox"]')) return;
      if (btn.closest('[role="tablist"]')) return;
      if (btn.closest("[data-sidebar]")) return;
      if (btn.closest("nav")) return;
      if (btn.closest("form")) return;

      // Skip if React attached an onClick (heuristic: presence of onclick or react listener)
      // We can't introspect React listeners, so we rely on onclick attr OR check a marker.
      // Strategy: only intercept if button hasn't been marked as "wired".
      if (btn.hasAttribute("data-wired")) return;

      // Get a label
      const label =
        btn.getAttribute("aria-label") ||
        btn.textContent?.trim().replace(/\s+/g, " ").slice(0, 60) ||
        "Action";

      // Don't intercept icon-only utility buttons in header chrome
      if (btn.closest("header")) return;

      // Only intercept if no other handler ran in time — use a microtask deferral.
      // Simpler: always show, since user wants every press to open something.
      e.preventDefault();
      e.stopPropagation();
      setDemoLabel(label);
      setDemoOpen(true);
    };

    main.addEventListener("click", handler, true);
    return () => main.removeEventListener("click", handler, true);
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card/60 backdrop-blur px-4 sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden md:block">
              <Breadcrumbs />
            </div>
            <div className="flex-1 max-w-md mx-auto relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members, payments, events…"
                className="pl-8 h-9 bg-secondary border-transparent focus-visible:bg-card"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
            <button className="h-9 w-9 rounded-md hover:bg-secondary flex items-center justify-center relative" aria-label="Notifications">
              <Bell className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar name="Mona Allam" hue={220} size="sm" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">Mona Allam</span>
                <span className="text-[10px] text-muted-foreground">Super Admin</span>
              </div>
            </div>
          </header>
          <main ref={mainRef} className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-left">{demoLabel}</DialogTitle>
            <DialogDescription className="text-left">
              This is a prototype using mock data. In production, this action would open a full flow
              (form, drawer, or confirmation) and persist changes to the backend.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDemoOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDemoOpen(false);
                toast.success(`${demoLabel} — done`, {
                  description: "Demo action completed.",
                });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
