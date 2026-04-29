import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { StatusChip, variantForMemberStatus, variantForPayment } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { getCommittee } from "@/data/mock";
import { useDemoStore } from "@/store/demo";
import { useGlobalSearch } from "@/context/SearchContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search, Download, Mail, Plus, ChevronDown, MoreHorizontal, Bookmark,
  SearchX, ArrowUp, ArrowDown, X, Tag,
} from "lucide-react";
import { toast } from "sonner";

type SortKey = "name" | "membershipNo" | "company" | "joined" | "lastContacted";

const BUILT_IN_VIEWS = [
  { name: "All members", statusFilter: "All", payFilter: "All", q: "" },
  { name: "Unpaid this cycle", statusFilter: "All", payFilter: "Unpaid", q: "" },
  { name: "New 2026", statusFilter: "Active", payFilter: "All", q: "" },
  { name: "Lapsed last 12 months", statusFilter: "Lapsed", payFilter: "All", q: "" },
  { name: "Tech committee", statusFilter: "All", payFilter: "All", q: "" },
  { name: "Lapsed unpaid", statusFilter: "Lapsed", payFilter: "Unpaid", q: "" },
];

export default function Members() {
  const members = useDemoStore((s) => s.members);
  const addMember = useDemoStore((s) => s.addMember);
  const customViews = useDemoStore((s) => s.savedViews);
  const addSavedView = useDemoStore((s) => s.addSavedView);

  const { query: globalQ, setQuery: setGlobalQ } = useGlobalSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get("view") ?? "All members";
  const initialBulk = searchParams.get("bulk") === "1";

  const allViews = useMemo(() => [...BUILT_IN_VIEWS, ...customViews.map((v) => ({ name: v.name, statusFilter: v.statusFilter, payFilter: v.payFilter, q: v.q }))], [customViews]);

  const [activeView, setActiveView] = useState(initialView);
  const initial = allViews.find((v) => v.name === initialView) ?? allViews[0];

  const [statusFilter, setStatusFilter] = useState<string>(initial.statusFilter);
  const [payFilter, setPayFilter] = useState<string>(initial.payFilter);
  const [localQ, setLocalQ] = useState(initial.q);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selected, setSelected] = useState<Set<string>>(initialBulk ? new Set() : new Set());

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | { label: string; description: string; onConfirm: () => void }>(null);

  const q = (globalQ || localQ).trim();

  const applyView = (v: typeof allViews[number]) => {
    setActiveView(v.name);
    setStatusFilter(v.statusFilter);
    setPayFilter(v.payFilter);
    setLocalQ(v.q);
    setGlobalQ("");
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    let arr = members.filter((m) => {
      if (q && !`${m.name} ${m.company} ${m.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (statusFilter !== "All" && m.status !== statusFilter) return false;
      if (payFilter !== "All" && m.paymentStatus !== payFilter) return false;
      if (activeView === "Tech committee" && !m.committees.some((c) => c.id === "c-tech")) return false;
      if (activeView === "New 2026" && new Date(m.joinedDate).getFullYear() !== 2026) return false;
      return true;
    });
    arr = [...arr].sort((a, b) => {
      const get = (m: typeof a) =>
        sortKey === "name" ? m.name :
        sortKey === "membershipNo" ? m.membershipNo :
        sortKey === "company" ? m.company :
        sortKey === "joined" ? m.joinedDate :
        (m.lastContacted ?? "");
      const av = String(get(a)).toLowerCase(), bv = String(get(b)).toLowerCase();
      if (av === bv) return 0;
      return (av < bv ? -1 : 1) * (sortDir === "asc" ? 1 : -1);
    });
    return arr;
  }, [members, q, statusFilter, payFilter, activeView, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="flex items-center gap-1 hover:text-foreground">
      {label}
      {sortKey === k && (sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </button>
  );

  const allChecked = filtered.length > 0 && filtered.every((m) => selected.has(m.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(filtered.map((m) => m.id)));
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const askBulk = (label: string, description: string) => {
    setConfirmAction({
      label, description,
      onConfirm: () => {
        toast.success(`${label} - done`, { description: `Applied to ${selected.size} member(s).` });
        setSelected(new Set());
        setConfirmAction(null);
      },
    });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
      <PageHeader
        title="Members"
        description={`${filtered.length} of ${members.length} shown · curates the mobile app's Network directory`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9" onClick={() => toast.success("Export queued", { description: "CSV will download shortly." })}>
              <Download className="h-3.5 w-3.5 mr-1.5" /> Export
            </Button>
            <Button variant="outline" size="sm" className="h-9" onClick={() => askBulk("Bulk email", `Send an email to all ${filtered.length} filtered members?`)}>
              <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
            </Button>
            <Button size="sm" className="h-9" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add member
            </Button>
          </>
        }
      />

      {/* Saved views */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {allViews.map((v) => {
          const count = members.filter((m) => {
            if (v.statusFilter !== "All" && m.status !== v.statusFilter) return false;
            if (v.payFilter !== "All" && m.paymentStatus !== v.payFilter) return false;
            if (v.name === "Tech committee" && !m.committees.some((c) => c.id === "c-tech")) return false;
            if (v.name === "New 2026" && new Date(m.joinedDate).getFullYear() !== 2026) return false;
            return true;
          }).length;
          const active = activeView === v.name;
          return (
            <button
              key={v.name}
              onClick={() => applyView(v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 h-7 rounded-md border whitespace-nowrap ${
                active ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border hover:bg-secondary"
              }`}
            >
              <Bookmark className="h-3 w-3" />
              <span className="font-medium">{v.name}</span>
              <span className="text-muted-foreground num">{count}</span>
            </button>
          );
        })}
        <button onClick={() => setSaveViewOpen(true)} className="text-xs px-2 h-7 rounded-md text-muted-foreground hover:text-foreground">+ Save view</button>
      </div>

      {/* Filter bar */}
      <div className="ejb-card p-3 mb-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={localQ} onChange={(e) => setLocalQ(e.target.value)} placeholder="Search name, company, email…" className="pl-8 h-8" />
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
          Areas of Focus <ChevronDown className="h-3 w-3" />
        </button>
        <button className="text-xs h-8 px-2.5 rounded-md border border-border bg-card hover:bg-secondary flex items-center gap-1">
          City <ChevronDown className="h-3 w-3" />
        </button>
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} members</span>
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="ejb-card p-2.5 mb-3 flex items-center gap-2 bg-primary/5 border-primary/30 animate-fade-in sticky top-14 z-10">
          <span className="text-sm font-medium px-2">{selected.size} selected</span>
          <div className="h-5 w-px bg-border" />
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => askBulk("Email selected", `Compose and send an email to ${selected.size} selected member(s)?`)}>
            <Mail className="h-3 w-3 mr-1" /> Email selected
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => askBulk("Add to committee", `Add ${selected.size} member(s) to a committee?`)}>
            Add to committee
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => askBulk("Send dues reminder", `Send a dues reminder to ${selected.size} member(s)?`)}>
            Send dues reminder
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => askBulk("Tag", `Apply a tag to ${selected.size} member(s)?`)}>
            <Tag className="h-3 w-3 mr-1" /> Tag
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => askBulk("Export selected", `Download a CSV of ${selected.size} selected member(s)?`)}>
            <Download className="h-3 w-3 mr-1" /> Export
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setSelected(new Set())}>
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="ejb-card overflow-hidden">
        <table className="w-full data-table">
          <thead className="bg-secondary/50">
            <tr>
              <th className="w-8"><input type="checkbox" className="rounded" checked={allChecked} onChange={toggleAll} /></th>
              <th><SortHead k="name" label="Member" /></th>
              <th><SortHead k="membershipNo" label="Membership #" /></th>
              <th><SortHead k="company" label="Company / Position" /></th>
              <th>Committees</th>
              <th>Areas of Focus</th>
              <th>Status</th>
              <th>Payment</th>
              <th><SortHead k="joined" label="Joined" /></th>
              <th><SortHead k="lastContacted" label="Last contacted" /></th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className={`hover:bg-secondary/40 ${selected.has(m.id) ? "bg-primary/5" : ""}`}>
                <td><input type="checkbox" className="rounded" checked={selected.has(m.id)} onChange={() => toggleOne(m.id)} /></td>
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
                <td>
                  <div className="flex flex-wrap gap-1">
                    {m.areasOfFocus.slice(0, 2).map((a) => (
                      <StatusChip key={a} variant="info" label={a} />
                    ))}
                  </div>
                </td>
                <td><StatusChip variant={variantForMemberStatus(m.status)} label={m.status} dot /></td>
                <td><StatusChip variant={variantForPayment(m.paymentStatus)} label={m.paymentStatus === "Paid" ? "Paid 26/27" : m.paymentStatus} /></td>
                <td className="num text-xs text-muted-foreground">{new Date(m.joinedDate).getFullYear()}</td>
                <td className="num text-xs text-muted-foreground">{m.lastContacted}</td>
                <td>
                  <Link to={`/members/${m.id}`} className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
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
                <Button size="sm" variant="outline" onClick={() => { setLocalQ(""); setGlobalQ(""); setStatusFilter("All"); setPayFilter("All"); }}>
                  Reset filters
                </Button>
              }
            />
          </div>
        )}
        <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-secondary/30 text-xs">
          <span className="text-muted-foreground">Showing 1-{filtered.length} of {members.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Prev</Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Next</Button>
          </div>
        </div>
      </div>

      {/* Add member modal */}
      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onSave={(m) => { addMember(m); setAddOpen(false); }} />

      {/* Save view modal */}
      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save current view</DialogTitle>
            <DialogDescription>Save filters as a one-click view (this session only).</DialogDescription>
          </DialogHeader>
          <SaveViewBody onSave={(name) => {
            addSavedView({ name, statusFilter, payFilter, q: localQ });
            setSaveViewOpen(false);
          }} />
        </DialogContent>
      </Dialog>

      {/* Bulk confirm */}
      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.label}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmAction?.onConfirm()}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SaveViewBody({ onSave }: { onSave: (name: string) => void }) {
  const [name, setName] = useState("My filtered view");
  return (
    <>
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="View name" />
      <DialogFooter>
        <Button onClick={() => name.trim() && onSave(name.trim())}>Save view</Button>
      </DialogFooter>
    </>
  );
}

// ---------------- Add member multi-step ----------------
function AddMemberDialog({ open, onOpenChange, onSave }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  onSave: (m: any) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", email: "", phone: "+20 ", company: "", position: "", city: "Cairo",
    areasOfFocus: [] as string[], committees: [] as string[],
  });

  const reset = () => { setStep(1); setForm({ name: "", email: "", phone: "+20 ", company: "", position: "", city: "Cairo", areasOfFocus: [], committees: [] }); };
  const close = (o: boolean) => { onOpenChange(o); if (!o) reset(); };

  const AOF = ["Strategy", "Operations", "Finance", "Real Estate", "Tech", "Healthcare", "Education", "Energy", "Media"];
  const CMTS = [
    { id: "c-tech", label: "Consulting & Technology" },
    { id: "c-fin",  label: "Finance, Investment & Law" },
    { id: "c-real", label: "Construction & Real Estate" },
    { id: "c-energy", label: "Industry & Energy" },
  ];

  const toggle = (key: "areasOfFocus" | "committees", v: string) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));
  };

  const submit = () => {
    onSave({
      name: form.name, email: form.email || `${form.name.toLowerCase().replace(/\s/g, ".")}@example.com`,
      phone: form.phone, company: form.company || "Independent", position: form.position || "Founder",
      city: form.city, status: "Active", paymentStatus: "Unpaid",
      committees: form.committees.map((id) => ({ id, role: "Member" as const })),
      joinedDate: new Date().toISOString().slice(0, 10),
      areasOfFocus: form.areasOfFocus, productsServices: [],
      avatarHue: Math.floor(Math.random() * 360),
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add member · Step {step} of 4</DialogTitle>
          <DialogDescription>
            {step === 1 && "Basic info"}
            {step === 2 && "Areas of Focus"}
            {step === 3 && "Committees"}
            {step === 4 && "Review and save"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 my-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />)}
        </div>

        {step === 1 && (
          <div className="space-y-3">
            <Input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              <Input placeholder="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </div>
            <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {AOF.map((a) => (
              <button key={a} onClick={() => toggle("areasOfFocus", a)} className={`text-xs px-3 h-8 rounded-full border ${form.areasOfFocus.includes(a) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>{a}</button>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-2">
            {CMTS.map((c) => (
              <label key={c.id} className="flex items-center gap-2 p-3 rounded-md border border-border cursor-pointer hover:bg-secondary/40">
                <input type="checkbox" checked={form.committees.includes(c.id)} onChange={() => toggle("committees", c.id)} />
                <span className="text-sm">{c.label}</span>
              </label>
            ))}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-2 text-sm">
            <div><b>Name:</b> {form.name || "—"}</div>
            <div><b>Email:</b> {form.email || "auto-generated"}</div>
            <div><b>Company:</b> {form.company || "—"} · {form.position || "—"}</div>
            <div><b>City:</b> {form.city}</div>
            <div><b>Areas of Focus:</b> {form.areasOfFocus.join(", ") || "none"}</div>
            <div><b>Committees:</b> {form.committees.length || "none"}</div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 4 && <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !form.name.trim()}>Next</Button>}
          {step === 4 && <Button onClick={submit} disabled={!form.name.trim()}>Save member</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
