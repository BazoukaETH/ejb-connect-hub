import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForMemberStatus, variantForPayment } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { MEMBERS, COMMITTEES, getCommittee } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Mail, Plus, ChevronDown, MoreHorizontal, Bookmark, SearchX } from "lucide-react";

const SAVED_VIEWS = [
  { name: "All members", count: 60, active: true },
  { name: "Unpaid this cycle", count: 16 },
  { name: "New 2026", count: 9 },
  { name: "Lapsed last 12 months", count: 10 },
  { name: "Tech committee", count: 14 },
];

export default function Members() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [payFilter, setPayFilter] = useState<string>("All");

  const filtered = useMemo(() => MEMBERS.filter((m) => {
    if (q && !`${m.name} ${m.company} ${m.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (statusFilter !== "All" && m.status !== statusFilter) return false;
    if (payFilter !== "All" && m.paymentStatus !== payFilter) return false;
    return true;
  }), [q, statusFilter, payFilter]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Members"
        description={`${MEMBERS.length} of 500 shown · curates the mobile app's Network directory`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="h-3.5 w-3.5 mr-1.5" /> Export</Button>
            <Button variant="outline" size="sm" className="h-9"><Mail className="h-3.5 w-3.5 mr-1.5" /> Email</Button>
            <Button size="sm" className="h-9"><Plus className="h-3.5 w-3.5 mr-1.5" /> Add member</Button>
          </>
        }
      />

      {/* Saved views */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {SAVED_VIEWS.map((v) => (
          <button
            key={v.name}
            className={`flex items-center gap-1.5 text-xs px-2.5 h-7 rounded-md border whitespace-nowrap ${
              v.active ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border hover:bg-secondary"
            }`}
          >
            <Bookmark className="h-3 w-3" />
            <span className="font-medium">{v.name}</span>
            <span className="text-muted-foreground num">{v.count}</span>
          </button>
        ))}
        <button className="text-xs px-2 h-7 rounded-md text-muted-foreground hover:text-foreground">+ Save view</button>
      </div>

      {/* Filter bar */}
      <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email…" className="pl-8 h-8" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border border-border bg-card">
          <option>All</option><option>Active</option><option>Pending Payment</option><option>Lapsed</option><option>Suspended</option><option>Alumni</option>
        </select>
        <select value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className="h-8 px-2 text-xs rounded-md border border-border bg-card">
          <option>All</option><option>Paid</option><option>Unpaid</option><option>Partial</option><option>Waived</option>
        </select>
        <button className="text-xs h-8 px-2.5 rounded-md border border-border bg-card hover:bg-secondary flex items-center gap-1">
          Committee <ChevronDown className="h-3 w-3" />
        </button>
        <button className="text-xs h-8 px-2.5 rounded-md border border-border bg-card hover:bg-secondary flex items-center gap-1">
          City <ChevronDown className="h-3 w-3" />
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} members</span>
      </div>

      {/* Table */}
      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr>
              <th className="w-8"><input type="checkbox" className="rounded" /></th>
              <th>Member</th>
              <th>Membership #</th>
              <th>Company / Position</th>
              <th>Committee</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Joined</th>
              <th>Last contacted</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/40">
                <td><input type="checkbox" className="rounded" /></td>
                <td>
                  <Link to={`/members/${m.id}`} className="flex items-center gap-2.5 group">
                    <Avatar name={m.name} hue={m.avatarHue} size="sm" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm group-hover:text-primary truncate">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                    </div>
                  </Link>
                </td>
                <td className="num text-xs text-muted-foreground">{m.membershipNo}</td>
                <td>
                  <div className="text-sm font-medium truncate max-w-[180px]">{m.company}</div>
                  <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">{m.position}</div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {m.committees.slice(0, 2).map((c) => {
                      const cc = getCommittee(c.id);
                      return cc && <StatusChip key={c.id} variant="brand" label={cc.name.split(" ")[0]} />;
                    })}
                  </div>
                </td>
                <td><StatusChip variant={variantForMemberStatus(m.status)} label={m.status} dot /></td>
                <td><StatusChip variant={variantForPayment(m.paymentStatus)} label={m.paymentStatus === "Paid" ? "Paid 26/27" : m.paymentStatus} /></td>
                <td className="num text-xs text-muted-foreground">{new Date(m.joinedDate).getFullYear()}</td>
                <td className="num text-xs text-muted-foreground">{m.lastContacted}</td>
                <td>
                  <button className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-6">
            <EmptyState
              icon={SearchX}
              title="No members match these filters"
              description="Try clearing the search or relaxing the status / payment filter."
              compact
              action={
                <Button size="sm" variant="outline" onClick={() => { setQ(""); setStatusFilter("All"); setPayFilter("All"); }}>
                  Reset filters
                </Button>
              }
            />
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-secondary/30 text-xs">
          <span className="text-muted-foreground">Showing 1-{filtered.length} of 500</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs">Prev</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
