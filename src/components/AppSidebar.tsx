import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, ShieldCheck, Wallet,
  Handshake, Receipt, UsersRound, Calendar, Megaphone, FileText, BookOpen,
  FileCode2, Smartphone, MessageSquare, Tags, History, Settings, Crown,
  Gavel, Target, Landmark, Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole } from "@/context/RoleContext";

type Item = { title: string; url: string; icon: any; syncs?: boolean; unpublished?: boolean; cap?: string };
type Group = { label: string; items: Item[]; cap?: string };

const groups: Group[] = [
  {
    label: "Boardroom",
    cap: "view:boardroom",
    items: [
      { title: "Boardroom",       url: "/boardroom",            icon: Crown },
      { title: "Decisions queue", url: "/boardroom/decisions",  icon: Gavel },
      { title: "Strategic KPIs",  url: "/boardroom/strategic",  icon: Target },
      { title: "Cash & Investments", url: "/boardroom/treasury", icon: Landmark, cap: "view:chairmanOnly" },
    ],
  },
  {
    label: "People",
    items: [
      { title: "Cockpit", url: "/", icon: LayoutDashboard },
      { title: "Members", url: "/members", icon: Users, syncs: true },
      { title: "Applicants & Prospects", url: "/applicants", icon: UserPlus },
      { title: "Onboarding Queue", url: "/onboarding", icon: ClipboardList },
      { title: "Team", url: "/team", icon: ShieldCheck },
    ],
  },
  {
    label: "Money",
    items: [
      { title: "Revenue", url: "/payments", icon: Wallet },
      { title: "Partners & Sponsors", url: "/partners", icon: Handshake, syncs: true, unpublished: true },
      { title: "Expenses", url: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Programmes",
    items: [
      { title: "Committees", url: "/committees", icon: UsersRound, syncs: true },
      { title: "Events", url: "/events", icon: Calendar, syncs: true },
      { title: "Announcements", url: "/announcements", icon: Megaphone, syncs: true, unpublished: true },
    ],
  },
  {
    label: "Library",
    items: [
      { title: "Documents", url: "/documents", icon: FileText, syncs: true },
      { title: "Resources", url: "/resources", icon: BookOpen, syncs: true },
      { title: "Templates", url: "/templates", icon: FileCode2 },
    ],
  },
  {
    label: "App",
    items: [
      { title: "App Content", url: "/app-content", icon: Smartphone, syncs: true },
      { title: "Chat Moderation", url: "/chat", icon: MessageSquare },
      { title: "Taxonomies", url: "/taxonomies", icon: Tags },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Audit Log", url: "/audit", icon: History },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

const COMMITTEE_HEAD_GROUPS: Group[] = [
  {
    label: "Committee",
    items: [
      { title: "My Committee", url: "/my-committee", icon: Briefcase },
      { title: "Directory",    url: "/members",      icon: Users },
      { title: "Events",       url: "/events",       icon: Calendar },
      { title: "Library",      url: "/documents",    icon: FileText },
      { title: "Announcements",url: "/announcements",icon: Megaphone },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { can, role } = useRole();
  const isActive = (url: string) => (url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/"));

  const activeGroups = role === "Committee Heads" ? COMMITTEE_HEAD_GROUPS : groups;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "hsl(var(--ejb-blue))" }}
            aria-label="EJB emblem"
          >
            E
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-bold tracking-tight">EJB</span>
              <span className="text-[10px] text-muted-foreground -mt-0.5">Admin Console</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 pt-1">
        {activeGroups.map((g) => {
          // Hide whole group if no capability
          if (g.cap && !can(g.cap as any)) return null;
          // Filter items by capability
          const visibleItems = g.items.filter((i) => !i.cap || can(i.cap as any));
          if (visibleItems.length === 0) return null;
          return (
            <SidebarGroup key={g.label} className="py-1">
              {!collapsed && (
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-3 py-1 flex items-center gap-1.5">
                  {g.label}
                  {g.label === "Boardroom" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--ejb-neon-yellow))]" />
                  )}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const active = isActive(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} className="h-8">
                          <NavLink
                            to={item.url}
                            end={item.url === "/" || item.url === "/boardroom"}
                            className={cn(
                              "flex items-center gap-2 px-2 rounded-md text-[13px]",
                              active
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                            )}
                          >
                            <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                            {!collapsed && (
                              <>
                                <span className="flex-1 truncate">{item.title}</span>
                                {item.syncs && item.unpublished && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Unpublished changes" />
                                )}
                              </>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
        {!collapsed && (
          <div className="mt-auto px-3 py-2 text-[10px] text-muted-foreground border-t border-sidebar-border/60">
            Viewing as <span className="font-semibold text-foreground">{role}</span>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
