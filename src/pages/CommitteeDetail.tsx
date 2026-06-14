import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForMemberStatus } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { getCommittee, getMember } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Search, UserMinus, Crown, Users, SearchX } from "lucide-react";

export default function CommitteeDetail() {
  const { id = "" } = useParams();
  const committee = getCommittee(id);

  const members = useDemoStore((s) => s.members);
  const addMemberToCommittee = useDemoStore((s) => s.addMemberToCommittee);
  const removeMemberFromCommittee = useDemoStore((s) => s.removeMemberFromCommittee);

  const [addOpen, setAddOpen] = useState(false);
  const [addQuery, setAddQuery] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<null | { id: string; name: string }>(null);

  const committeeMembers = useMemo(
    () => members.filter((m) => m.committees.some((c) => c.id === id)),
    [members, id],
  );

  const candidates = useMemo(() => {
    const q = addQuery.trim().toLowerCase();
    return members
      .filter((m) => !m.committees.some((c) => c.id === id))
      .filter((m) => !q || `${m.name} ${m.company} ${m.email}`.toLowerCase().includes(q))
      .slice(0, 30);
  }, [members, id, addQuery]);

  if (!committee) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto">
        <EmptyState icon={SearchX} title="Committee not found" description="This committee no longer exists." />
        <Link to="/committees" className="text-primary text-sm mt-4 inline-block">&larr; Back to committees</Link>
      </div>
    );
  }

  const chair = getMember(committee.chairId);

  const roleInCommittee = (memberId: string) =>
    members.find((m) => m.id === memberId)?.committees.find((c) => c.id === id)?.role ?? "Member";

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <Link to="/committees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="h-4 w-4" /> Committees
      </Link>

      <PageHeader
        title={committee.name}
        description={committee.description}
        actions={
          <Button size="sm" className="h-9" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add member
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Committee summary */}
        <aside className="ejb-card p-4 h-fit">
          <p lang="ar" dir="rtl" className="text-sm text-muted-foreground">{committee.nameAr}</p>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Chair</div>
            {chair ? (
              <div className="flex items-center gap-2">
                <Avatar name={chair.name} hue={chair.avatarHue} size="sm" />
                <div>
                  <div className="text-sm font-medium flex items-center gap-1">{chair.name} <Crown className="h-3 w-3 text-primary" /></div>
                  <div className="text-[10px] text-muted-foreground">{chair.company}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Not assigned</div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm"><span className="font-bold num">{committeeMembers.length}</span> members</span>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">Last activity {committee.lastActivity}</div>
        </aside>

        {/* Members list */}
        <section>
          <div className="ejb-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {committeeMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-2.5">
                      <Link to={`/members/${m.id}`} className="flex items-center gap-2 group">
                        <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                        <div>
                          <div className="font-medium group-hover:text-primary">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground">{m.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{roleInCommittee(m.id)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{m.company}</td>
                    <td className="px-4 py-2.5"><StatusChip variant={variantForMemberStatus(m.status)} label={m.status} /></td>
                    <td className="px-4 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => setConfirmRemove({ id: m.id, name: m.name })}
                      >
                        <UserMinus className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {committeeMembers.length === 0 && (
              <div className="p-8">
                <EmptyState icon={Users} title="No members yet" description="Add members to this committee to get started." />
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add member to {committee.name}</DialogTitle>
            <DialogDescription>Pick a member from the directory to add to this committee.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={addQuery} onChange={(e) => setAddQuery(e.target.value)} placeholder="Search members..." className="pl-8" />
          </div>
          <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-border">
            {candidates.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{m.company}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => addMemberToCommittee(id, m.id)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>
            ))}
            {candidates.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">No matching members.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from committee?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRemove?.name} will be removed from {committee.name}. Their member record stays in the directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmRemove) removeMemberFromCommittee(id, confirmRemove.id);
                setConfirmRemove(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
