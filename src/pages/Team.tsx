import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { ADMIN_TEAM } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus, ShieldCheck } from "lucide-react";

const ROLE_PERMS: Record<string, string[]> = {
  "Chairman": ["Read-only across all", "Boardroom view", "Cash & Investments", "Strategic KPIs"],
  "Board Members": ["Read-only across all", "Boardroom view", "Decisions queue", "Financial snapshot"],
  "Committee Heads": ["Read-only dashboard", "Write inside own committee", "Committee members & meetings", "Committee announcements"],
  "EJB Admin": ["Full write access", "Manage admins", "Close cycle", "Audit log"],
  "Finance": ["Write: Payments, Expenses, Sponsors", "Read elsewhere", "Cycle close", "Reconciliation"],
};

export default function Team() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto animate-fade-in">
      <PageHeader title="Team" description={`${ADMIN_TEAM.length} admins · roles drive what each user can see and do`}
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Invite admin</Button>} />

      <div className="ejb-card overflow-hidden mb-5">
        <table className="w-full data-table">
          <thead className="bg-secondary/50"><tr><th>Member</th><th>Email</th><th>Role</th><th>Last login</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {ADMIN_TEAM.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/40">
                <td><div className="flex items-center gap-2.5"><Avatar name={u.name} hue={u.avatarHue} size="sm" /><span className="font-medium text-sm">{u.name}</span></div></td>
                <td className="text-xs text-muted-foreground">{u.email}</td>
                <td><StatusChip variant="brand" label={u.role} /></td>
                <td className="text-xs text-muted-foreground">{u.lastLogin}</td>
                <td><StatusChip variant={u.active ? "paid" : "neutral"} label={u.active ? "Active" : "Disabled"} dot /></td>
                <td className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Roles & permissions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(ROLE_PERMS).map(([role, perms]) => (
          <div key={role} className="ejb-card p-4">
            <div className="font-semibold text-sm">{role}</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {perms.map((p) => <li key={p} className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary" /> {p}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
