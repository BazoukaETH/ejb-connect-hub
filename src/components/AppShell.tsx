import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search, ChevronRight } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Input } from "@/components/ui/input";
import { RoleProvider, useRole } from "@/context/RoleContext";
import { SearchProvider, useGlobalSearch } from "@/context/SearchContext";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { NotificationsBell } from "@/components/NotificationsBell";

const labels: Record<string, string> = {
  "": "Cockpit", members: "Members", applicants: "Applicants & Prospects",
  onboarding: "Onboarding Queue", team: "Team", payments: "Revenue", revenue: "Revenue",
  partners: "Partners & Sponsors", expenses: "Expenses", committees: "Committees",
  events: "Events", announcements: "Announcements", documents: "Documents",
  resources: "Resources", templates: "Templates", "app-content": "App Content",
  chat: "Chat Moderation", taxonomies: "Taxonomies", audit: "Audit Log",
  settings: "Settings", boardroom: "Boardroom", decisions: "Decisions queue",
  strategic: "Strategic KPIs", treasury: "Cash & Investments",
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return <span className="text-sm font-medium">Cockpit</span>;
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
            {isLast ? <span className="font-medium text-foreground">{label}</span>
              : <Link to={url} className="text-muted-foreground hover:text-foreground">{label}</Link>}
          </span>
        );
      })}
    </nav>
  );
}

function GlobalSearchBar() {
  const { query, setQuery } = useGlobalSearch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const placeholder = pathname.startsWith("/members") ? "Filter members on this page…"
    : pathname.startsWith("/applicants") ? "Filter applicants…"
    : pathname.startsWith("/events") ? "Filter events…"
    : pathname.startsWith("/payments") || pathname.startsWith("/revenue") ? "Filter revenue…"
    : pathname.startsWith("/partners") ? "Filter partners…"
    : pathname.startsWith("/announcements") ? "Filter announcements…"
    : "Search members, payments, events…";

  return (
    <div className="flex-1 max-w-md mx-auto relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && query.trim()) navigate(`/members`);
        }}
        placeholder={placeholder}
        className="pl-8 h-9 bg-secondary border-transparent focus-visible:bg-card"
      />
      <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded">⌘K</kbd>
    </div>
  );
}

function ShellInner() {
  const { role } = useRole();
  const personas: Record<string, { name: string; hue: number }> = {
    "EJB Admin":       { name: "Mona Allam",    hue: 220 },
    "Finance":         { name: "Nour Hegazy",   hue: 140 },
    "Committee Heads": { name: "Ahmed Hassan",  hue: 180 },
    "Board Members":   { name: "Hussein Osman", hue: 250 },
    "Chairman":        { name: "Omar El Sherif",hue: 260 },
  };
  const persona = personas[role];

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card/60 backdrop-blur px-4 sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden md:block"><Breadcrumbs /></div>
            <GlobalSearchBar />
            <RoleSwitcher />
            <NotificationsBell />
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Avatar name={persona.name} hue={persona.hue} size="sm" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">{persona.name}</span>
                <span className="text-[10px] text-muted-foreground">{role}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function AppShell() {
  return (
    <RoleProvider>
      <SearchProvider>
        <ShellInner />
      </SearchProvider>
    </RoleProvider>
  );
}
