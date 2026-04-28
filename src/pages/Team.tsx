import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip } from "@/components/StatusChip";
import { ADMIN_TEAM } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Team() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader title="Team" description="Admin users and their permissions"
        actions={<Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Invite admin</Button>} />
      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50"><tr><th>Member</th><th>Email</th><th>Role</th><th>Last login</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {ADMIN_TEAM.map((u) => (
              <tr key={u.id}>
                <td><div className="flex items-center gap-2.5"><Avatar name={u.name} hue={u.avatarHue} size="sm" /><span className="font-medium text-sm">{u.name}</span></div></td>
                <td className="text-xs text-muted-foreground">{u.email}</td>
                <td><StatusChip variant="brand" label={u.role} /></td>
                <td className="text-xs text-muted-foreground">{u.lastLogin}</td>
                <td><StatusChip variant={u.active ? "paid" : "neutral"} label={u.active ? "Active" : "Disabled"} dot /></td>
                <td><Button variant="ghost" size="sm" className="h-7 text-xs">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
