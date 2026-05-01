// Single in-session Zustand store driving every interactive flow in the demo.
// No persistence - resets on refresh. Pure local state, dummy data only.

import { create } from "zustand";
import {
  MEMBERS as SEED_MEMBERS,
  APPLICANTS as SEED_APPLICANTS,
  EVENTS as SEED_EVENTS,
  ANNOUNCEMENTS as SEED_ANNOUNCEMENTS,
  PARTNERS as SEED_PARTNERS,
  HISTORICAL_PARTNERS as SEED_HISTORICAL_PARTNERS,
  ADMIN_TEAM as SEED_ADMIN_TEAM,
  AREAS_OF_FOCUS,
  PRODUCTS_SERVICES,
  type Member,
  type Applicant,
  type EjbEvent,
  type Announcement,
  type Partner,
  type AdminUser,
  type BoardApproval,
  type ReEngagement,
  type SponsorPackage,
  type SponsorTier,
  type SponsorStatus,
} from "@/data/mock";

// ---------------- RSVP ----------------

export type RsvpStatus = "Going" | "Maybe" | "Declined" | "Waitlisted" | "No response";
export interface Rsvp {
  id: string;
  eventId: string;
  memberId: string;
  status: RsvpStatus;
  rsvpDate: string;
  dietary?: string;
  plusOne: boolean;
  checkedIn: boolean;
  notes?: string;
}

const DIETS = ["None", "Vegetarian", "Halal", "Gluten-free", "Vegan"];

function seedRsvps(): Rsvp[] {
  const out: Rsvp[] = [];
  for (const ev of SEED_EVENTS) {
    const target = Math.min(SEED_MEMBERS.length, ev.registered + 25);
    const shuffled = [...SEED_MEMBERS].sort((a, b) =>
      ((a.id + ev.id).charCodeAt(2) - (b.id + ev.id).charCodeAt(2))
    );
    const slice = shuffled.slice(0, target);
    slice.forEach((m, i) => {
      const r = i / slice.length;
      let status: RsvpStatus =
        r < 0.62 ? "Going" :
        r < 0.78 ? "Maybe" :
        r < 0.86 ? "Declined" :
        r < 0.93 ? "Waitlisted" : "No response";
      if (ev.status === "Past") status = r < 0.78 ? "Going" : "Declined";
      out.push({
        id: `r-${ev.id}-${m.id}`,
        eventId: ev.id,
        memberId: m.id,
        status,
        rsvpDate: `2026-04-${String(1 + (i % 27)).padStart(2, "0")}`,
        dietary: DIETS[i % DIETS.length],
        plusOne: i % 7 === 0,
        checkedIn: ev.status === "Past" && status === "Going" && i % 4 !== 0,
        notes: i % 11 === 0 ? "VIP guest - reserve front table" : undefined,
      });
    });
  }
  return out;
}

// ---------------- Notifications ----------------

export interface DemoNotification {
  id: string;
  type: "danger" | "warn" | "info" | "neutral";
  title: string;
  sub: string;
  ts: string;
  href: string;
  unread: boolean;
}

const SEED_NOTIFICATIONS: DemoNotification[] = [
  { id: "n-1", type: "danger", title: "12 members lapsed >30 days",                     sub: "No payment for 2026/27 cycle",          ts: "5 min ago",   href: "/members?view=lapsed-unpaid",  unread: true },
  { id: "n-2", type: "danger", title: "Hassan Allam Holding sponsorship outstanding",   sub: "EGP 150,000 invoiced 47 days ago",      ts: "1 hour ago",  href: "/partners",                    unread: true },
  { id: "n-3", type: "warn",   title: "9 applicants awaiting board decision",           sub: "Oldest: Karim Ezzat - 22 days in stage", ts: "2 hours ago", href: "/applicants",                  unread: true },
  { id: "n-4", type: "warn",   title: "Vodafone sponsorship renewal in 28 days",        sub: "EGP 150,000 - decision needed",         ts: "3 hours ago", href: "/partners",                    unread: true },
  { id: "n-5", type: "info",   title: "Announcement scheduled for tomorrow 09:00",       sub: "Reminder: Update Your Profile",         ts: "yesterday",   href: "/announcements",               unread: false },
  { id: "n-6", type: "info",   title: "Annual Business Summit needs final headcount",    sub: "247 RSVPs · close roster Friday",       ts: "yesterday",   href: "/events",                      unread: false },
  { id: "n-7", type: "neutral",title: "Cycle 2025/26 audit log archived",                sub: "Backup created · 91% paid",             ts: "2 days ago",  href: "/audit",                       unread: false },
];

// ---------------- Toasts (passthrough to sonner) ----------------
import { toast } from "sonner";

// ---------------- Applicant utils ----------------
function nextApplicantId(items: Applicant[]) {
  const max = items.reduce((m, a) => Math.max(m, parseInt(a.id.replace(/\D/g, ""), 10) || 0), 0);
  return `a-${max + 1}`;
}
function nextMemberId(items: Member[]) {
  const max = items.reduce((m, x) => Math.max(m, parseInt(x.id.replace(/\D/g, ""), 10) || 0), 0);
  return `m-${String(max + 1).padStart(3, "0")}`;
}

// ---------------- Cycles ----------------
export const CYCLES = ["2026 / 2027", "2025 / 2026", "2024 / 2025"] as const;
export type CycleName = typeof CYCLES[number];

export interface Tx {
  id: string;
  cycle: CycleName;
  memberId: string;
  memberName: string;
  amount: number;
  method: "Bank transfer" | "Cash" | "Cheque" | "Card";
  date: string;
  ref: string;
  recordedBy: string;
}

const SEED_TX: Tx[] = [
  { id: "tx-1", cycle: "2026 / 2027", memberId: "m-001", memberName: "Tarek Mostafa", amount: 15000, method: "Bank transfer", date: "2026-04-28 14:22", ref: "TRX-99821", recordedBy: "Nour" },
  { id: "tx-2", cycle: "2026 / 2027", memberId: "m-002", memberName: "Hala Saleh",    amount: 15000, method: "Bank transfer", date: "2026-04-28 11:08", ref: "TRX-99820", recordedBy: "Nour" },
  { id: "tx-3", cycle: "2026 / 2027", memberId: "m-003", memberName: "Yasmin Allam",  amount: 15000, method: "Cheque",        date: "2026-04-27 16:40", ref: "CHQ-2455",  recordedBy: "Nour" },
  { id: "tx-4", cycle: "2026 / 2027", memberId: "m-004", memberName: "Soha Badr",     amount:  7500, method: "Bank transfer", date: "2026-04-27 09:55", ref: "TRX-99812", recordedBy: "Nour" },
  { id: "tx-5", cycle: "2026 / 2027", memberId: "m-005", memberName: "Karim Said",    amount: 15000, method: "Card",          date: "2026-04-26 17:12", ref: "CRD-77124", recordedBy: "Mona" },
  { id: "tx-6", cycle: "2026 / 2027", memberId: "m-006", memberName: "Ahmed Hassan",  amount: 15000, method: "Bank transfer", date: "2026-04-26 13:00", ref: "TRX-99801", recordedBy: "Nour" },
  { id: "tx-7", cycle: "2025 / 2026", memberId: "m-001", memberName: "Tarek Mostafa", amount: 15000, method: "Bank transfer", date: "2025-06-30 10:00", ref: "TRX-87412", recordedBy: "Nour" },
  { id: "tx-8", cycle: "2025 / 2026", memberId: "m-002", memberName: "Hala Saleh",    amount: 15000, method: "Bank transfer", date: "2025-07-04 09:00", ref: "TRX-87413", recordedBy: "Nour" },
  { id: "tx-9", cycle: "2024 / 2025", memberId: "m-001", memberName: "Tarek Mostafa", amount: 15000, method: "Cheque",        date: "2024-07-04 12:00", ref: "CHQ-2310",  recordedBy: "Nour" },
];

// ---------------- Saved views ----------------
export interface SavedView { name: string; statusFilter: string; payFilter: string; q: string; }

// ---------------- Notes / per-member ----------------
export interface DemoNote { id: string; memberId: string; author: string; hue: number; body: string; ts: string; pinned?: boolean; }

// ---------------- Tags ----------------
export interface TagBucket { key: string; label: string; items: string[]; }

const TAG_SEED: TagBucket[] = [
  { key: "aof", label: "Areas of Focus", items: [...AREAS_OF_FOCUS] },
  { key: "ps",  label: "Products & Services", items: [...PRODUCTS_SERVICES] },
  { key: "dir", label: "Directory chips", items: ["All", "Leadership", "Finance", "Operations", "Tech", "Real Estate"] },
  { key: "cat", label: "Announcement categories", items: ["General", "Event", "Member benefit", "Policy", "Press", "Partner news"] },
  { key: "evt", label: "Event types", items: ["Conference", "Workshop", "Sohour", "Networking", "Board meeting"] },
];

// ---------------- App content ----------------
export interface AppContentSection { key: string; lastPublishedTs: string; en: { title: string; desc: string }; ar: { title: string; desc: string }; }

const APP_CONTENT_SEED: AppContentSection[] = [
  { key: "tiles",     lastPublishedTs: "2 days ago", en: { title: "Home tiles", desc: "Find a Member · Committees · Announcements · Documents" }, ar: { title: "أزرار الصفحة الرئيسية", desc: "بحث الأعضاء · اللجان · الإعلانات · المستندات" } },
  { key: "greeting",  lastPublishedTs: "5 days ago", en: { title: "Home greeting", desc: "Hi, {first name}! · Welcome subtitle" }, ar: { title: "تحية الصفحة الرئيسية", desc: "أهلاً، {الاسم الأول}!" } },
  { key: "feat-ev",   lastPublishedTs: "1 day ago",  en: { title: "Featured event", desc: "Annual Business Summit 2026 - pinned" }, ar: { title: "الفعالية المميزة", desc: "قمة الأعمال السنوية 2026 - مثبّت" } },
  { key: "feat-an",   lastPublishedTs: "3 days ago", en: { title: "Featured announcement", desc: "Last Call: EJB x CIF 2026 - pinned" }, ar: { title: "الإعلان المميز", desc: "آخر مهلة: EJB × CIF 2026 - مثبّت" } },
  { key: "partners",  lastPublishedTs: "1 week ago", en: { title: "Partners strip", desc: "5 active partners - Platinum to Silver" }, ar: { title: "شريط الشركاء", desc: "5 شركاء نشطون من البلاتيني إلى الفضي" } },
  { key: "nav",       lastPublishedTs: "2 weeks ago",en: { title: "Bottom nav labels", desc: "Home · Network · Updates · Hub · Profile" }, ar: { title: "تسميات الشريط السفلي", desc: "الرئيسية · الشبكة · المستجدات · المركز · الملف" } },
];

// ---------------- Store ----------------
interface DemoState {
  // Data collections
  members: Member[];
  applicants: Applicant[];
  events: EjbEvent[];
  announcements: Announcement[];
  partners: Partner[];
  historicalPartners: Partner[];
  team: AdminUser[];
  rsvps: Rsvp[];
  transactions: Tx[];
  notifications: DemoNotification[];
  notes: DemoNote[];
  tagBuckets: TagBucket[];
  appContent: AppContentSection[];
  savedViews: SavedView[];
  selectedCycle: CycleName;
  cyclesOpen: Record<CycleName, boolean>;
  lastRefreshed: number;
  kpiNudge: number; // ±2% factor

  // Members
  addMember: (m: Omit<Member, "id" | "membershipNo">) => Member;
  // Applicants
  addApplicant: (a: Partial<Applicant> & { name: string; company: string }) => Applicant;
  moveApplicantStage: (id: string, stage: Applicant["stage"]) => void;
  setApplicantApproval: (id: string, approval: BoardApproval) => void;
  removeApplicant: (id: string) => void;
  convertApplicant: (id: string) => void;
  // Events
  addEvent: (e: Partial<EjbEvent> & { title: string }) => EjbEvent;
  // RSVPs
  addRsvp: (eventId: string, memberId: string, status: RsvpStatus) => void;
  setRsvpStatus: (id: string, status: RsvpStatus) => void;
  toggleCheckIn: (id: string) => void;
  bulkRsvpAction: (ids: string[], action: "check-in" | "waitlist" | "remove") => void;
  // Announcements
  addAnnouncement: (a: Partial<Announcement> & { title: string; body: string }) => Announcement;
  // Partners
  addPartner: (p: Partial<Partner> & { name: string }) => Partner;
  updatePartner: (id: string, patch: Partial<Partner>) => void;
  reorderPartners: (orderedIds: string[]) => void;
  addReEngagement: (partnerId: string, entry: Omit<ReEngagement, "id">) => void;
  // Team
  addTeamMember: (u: Partial<AdminUser> & { name: string; email: string; role: AdminUser["role"] }) => AdminUser;
  // Payments / cycles
  recordPayment: (memberId: string, amount: number, method: Tx["method"], ref: string) => void;
  recordApplicantPayment: (applicantId: string, amount: number, method: Tx["method"], ref: string) => void;
  closeCycle: () => void;
  openNextCycle: () => void;
  setSelectedCycle: (c: CycleName) => void;
  // Notes
  addNote: (memberId: string, body: string, author?: string) => void;
  // Notifications
  markAllNotificationsRead: () => void;
  // Tags
  addTag: (bucketKey: string, label: string) => void;
  renameTag: (bucketKey: string, oldLabel: string, newLabel: string) => void;
  mergeTag: (bucketKey: string, sourceLabel: string, targetLabel: string) => void;
  // App content
  publishAppSection: (key: string) => void;
  updateAppSection: (key: string, lang: "en" | "ar", patch: { title?: string; desc?: string }) => void;
  // Saved views
  addSavedView: (v: SavedView) => void;
  // Cockpit
  refreshCockpit: () => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  members: SEED_MEMBERS,
  applicants: SEED_APPLICANTS,
  events: SEED_EVENTS,
  announcements: SEED_ANNOUNCEMENTS,
  partners: SEED_PARTNERS,
  historicalPartners: SEED_HISTORICAL_PARTNERS,
  team: SEED_ADMIN_TEAM,
  rsvps: seedRsvps(),
  transactions: SEED_TX,
  notifications: SEED_NOTIFICATIONS,
  notes: [],
  tagBuckets: TAG_SEED,
  appContent: APP_CONTENT_SEED,
  savedViews: [],
  selectedCycle: "2026 / 2027",
  cyclesOpen: { "2026 / 2027": true, "2025 / 2026": false, "2024 / 2025": false },
  lastRefreshed: Date.now(),
  kpiNudge: 1,

  addMember: (m) => {
    const id = nextMemberId(get().members);
    const num = parseInt(id.replace(/\D/g, ""), 10);
    const member: Member = {
      id,
      membershipNo: `M-${String(num).padStart(4, "0")}`,
      ...m,
    };
    set((s) => ({ members: [member, ...s.members] }));
    toast.success("Member added", { description: `${member.name} (${member.membershipNo}) is now in the directory.` });
    return member;
  },

  addApplicant: (a) => {
    const id = nextApplicantId(get().applicants);
    const applicant: Applicant = {
      id, name: a.name, company: a.company,
      position: a.position ?? "Founder", source: a.source ?? "Cold inbound",
      stage: a.stage ?? "Leads", daysInStage: 0, appliedDate: new Date().toISOString().slice(0, 10),
      referredBy: a.referredBy, avatarHue: a.avatarHue ?? Math.floor(Math.random() * 360),
    };
    set((s) => ({ applicants: [applicant, ...s.applicants] }));
    toast.success("Applicant added", { description: `${applicant.name} added to ${applicant.stage}.` });
    return applicant;
  },

  moveApplicantStage: (id, stage) => {
    set((s) => ({ applicants: s.applicants.map((a) => a.id === id ? { ...a, stage, daysInStage: 0 } : a) }));
  },

  setApplicantApproval: (id, approval) => {
    set((s) => ({
      applicants: s.applicants.map((a) =>
        a.id === id ? { ...a, stage: "Accepted", daysInStage: 0, boardApproval: approval } : a
      ),
    }));
    toast.success("Board decision recorded", { description: `${approval.decision} · ${approval.minutesRef}` });
  },

  removeApplicant: (id) => {
    set((s) => ({ applicants: s.applicants.filter((a) => a.id !== id) }));
  },

  convertApplicant: (id) => {
    const a = get().applicants.find((x) => x.id === id);
    if (!a) return;
    get().addMember({
      name: a.name, email: `${a.name.toLowerCase().replace(/\s/g, ".")}@${a.company.split(" ")[0].toLowerCase()}.com`,
      phone: "+20 100 000 0000", company: a.company, position: a.position, city: "Cairo",
      status: "Active", paymentStatus: "Paid", committees: [],
      joinedDate: new Date().toISOString().slice(0, 10), areasOfFocus: ["Strategy"],
      productsServices: [], avatarHue: a.avatarHue,
    });
    set((s) => ({ applicants: s.applicants.filter((x) => x.id !== id) }));
  },

  addEvent: (e) => {
    const id = `e-${get().events.length + 1}-${Date.now()}`;
    const ev: EjbEvent = {
      id, title: e.title, type: e.type ?? "Networking",
      date: e.date ?? new Date().toISOString(), location: e.location ?? "TBD",
      capacity: e.capacity ?? 100, registered: 0, status: e.status ?? "Draft",
      description: e.description ?? "", cost: e.cost ?? 0,
    };
    set((s) => ({ events: [ev, ...s.events] }));
    toast.success("Event created", { description: `${ev.title} saved as ${ev.status}.` });
    return ev;
  },

  addRsvp: (eventId, memberId, status) => {
    const exists = get().rsvps.find((r) => r.eventId === eventId && r.memberId === memberId);
    if (exists) {
      get().setRsvpStatus(exists.id, status);
      return;
    }
    const r: Rsvp = {
      id: `r-${eventId}-${memberId}-${Date.now()}`,
      eventId, memberId, status,
      rsvpDate: new Date().toISOString().slice(0, 10),
      plusOne: false, checkedIn: false,
    };
    set((s) => ({
      rsvps: [r, ...s.rsvps],
      events: s.events.map((e) => e.id === eventId && status === "Going" ? { ...e, registered: e.registered + 1 } : e),
    }));
    const m = get().members.find((mm) => mm.id === memberId);
    toast.success("RSVP added", { description: `${m?.name ?? "Member"} - ${status}` });
  },

  setRsvpStatus: (id, status) => {
    set((s) => ({ rsvps: s.rsvps.map((r) => r.id === id ? { ...r, status } : r) }));
  },

  toggleCheckIn: (id) => {
    set((s) => ({ rsvps: s.rsvps.map((r) => r.id === id ? { ...r, checkedIn: !r.checkedIn } : r) }));
  },

  bulkRsvpAction: (ids, action) => {
    set((s) => ({
      rsvps: action === "remove"
        ? s.rsvps.filter((r) => !ids.includes(r.id))
        : s.rsvps.map((r) => !ids.includes(r.id) ? r :
            action === "check-in" ? { ...r, checkedIn: true } :
            action === "waitlist" ? { ...r, status: "Waitlisted" as RsvpStatus } : r),
    }));
    const labels = { "check-in": "Checked-in", waitlist: "Moved to waitlist", remove: "Removed" };
    toast.success(labels[action], { description: `${ids.length} attendee(s) updated.` });
  },

  addAnnouncement: (a) => {
    const id = `an-${Date.now()}`;
    const an: Announcement = {
      id, title: a.title, body: a.body,
      priority: a.priority ?? "Medium", category: a.category ?? "General",
      audience: a.audience ?? "All members", status: a.status ?? "Published",
      publishedAt: a.status === "Scheduled" ? undefined : new Date().toISOString(),
      scheduledFor: a.scheduledFor, author: a.author ?? "Mona Allam",
      reach: a.status === "Published" ? { sent: 500, total: 500 } : undefined,
      openRate: a.status === "Published" ? 0 : undefined,
    };
    set((s) => ({ announcements: [an, ...s.announcements] }));
    return an;
  },

  addPartner: (p) => {
    const id = `p-${Date.now()}`;
    const partner: Partner = {
      id, name: p.name, tier: p.tier ?? "Silver", active: p.active ?? true,
      website: p.website ?? `${p.name.toLowerCase().replace(/\s/g, "")}.com`,
      description: p.description ?? "Partner.",
      contactName: p.contactName ?? "TBD", contactEmail: p.contactEmail ?? "tbd@example.com",
      contractStart: p.contractStart ?? "2026-01-01", contractEnd: p.contractEnd ?? "2026-12-31",
      value: p.value ?? 100000, paymentStatus: p.paymentStatus ?? "Invoiced",
      order: get().partners.length + 1,
    };
    set((s) => ({ partners: [partner, ...s.partners] }));
    toast.success("Partner added", { description: `${partner.name} - ${partner.tier} tier.` });
    return partner;
  },

  reorderPartners: (orderedIds) => {
    set((s) => {
      const map = new Map(s.partners.map((p) => [p.id, p]));
      const next = orderedIds.map((id, i) => ({ ...(map.get(id)!), order: i + 1 })).filter(Boolean);
      return { partners: next };
    });
  },

  addTeamMember: (u) => {
    const id = `u-${get().team.length + 1}-${Date.now()}`;
    const tm: AdminUser = {
      id, name: u.name, email: u.email, role: u.role,
      lastLogin: "Invited - never", active: true,
      avatarHue: u.avatarHue ?? Math.floor(Math.random() * 360),
    };
    set((s) => ({ team: [tm, ...s.team] }));
    toast.success("Invite sent", { description: `${tm.email} - role: ${tm.role}.` });
    return tm;
  },

  recordPayment: (memberId, amount, method, ref) => {
    const m = get().members.find((mm) => mm.id === memberId);
    const tx: Tx = {
      id: `tx-${Date.now()}`, cycle: get().selectedCycle,
      memberId, memberName: m?.name ?? "Member", amount, method,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      ref, recordedBy: "Nour",
    };
    set((s) => ({ transactions: [tx, ...s.transactions] }));
    toast.success("Payment recorded", { description: `EGP ${amount.toLocaleString()} from ${tx.memberName} via ${method}.` });
  },

  closeCycle: () => {
    const cur = get().selectedCycle;
    set((s) => ({ cyclesOpen: { ...s.cyclesOpen, [cur]: false } }));
    toast.success("Cycle closed", { description: `${cur} locked. Unpaid members moved to Lapsed.` });
  },

  openNextCycle: () => {
    set((s) => ({ cyclesOpen: { ...s.cyclesOpen, [s.selectedCycle]: true } }));
    toast.success("Cycle opened", { description: `${get().selectedCycle} is now accepting payments.` });
  },

  setSelectedCycle: (c) => set({ selectedCycle: c }),

  addNote: (memberId, body, author = "Mona Allam") => {
    const note: DemoNote = { id: `note-${Date.now()}`, memberId, author, hue: 220, body, ts: "Just now" };
    set((s) => ({ notes: [note, ...s.notes] }));
    toast.success("Note saved");
  },

  markAllNotificationsRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, unread: false })) }));
    toast.success("Notifications marked as read");
  },

  addTag: (bucketKey, label) => {
    set((s) => ({
      tagBuckets: s.tagBuckets.map((b) =>
        b.key === bucketKey && !b.items.includes(label) ? { ...b, items: [label, ...b.items] } : b
      ),
    }));
    toast.success("Tag added", { description: label });
  },

  renameTag: (bucketKey, oldLabel, newLabel) => {
    set((s) => ({
      tagBuckets: s.tagBuckets.map((b) =>
        b.key === bucketKey ? { ...b, items: b.items.map((t) => t === oldLabel ? newLabel : t) } : b
      ),
    }));
    toast.success("Tag renamed", { description: `${oldLabel} → ${newLabel}` });
  },

  mergeTag: (bucketKey, sourceLabel, targetLabel) => {
    set((s) => ({
      tagBuckets: s.tagBuckets.map((b) =>
        b.key === bucketKey ? { ...b, items: b.items.filter((t) => t !== sourceLabel) } : b
      ),
    }));
    toast.success("Tags merged", { description: `${sourceLabel} → ${targetLabel}` });
  },

  publishAppSection: (key) => {
    set((s) => ({
      appContent: s.appContent.map((sec) => sec.key === key ? { ...sec, lastPublishedTs: "Just now" } : sec),
    }));
    toast.success("Published to app", { description: "Members will see the change within 60 seconds." });
  },

  updateAppSection: (key, lang, patch) => {
    set((s) => ({
      appContent: s.appContent.map((sec) =>
        sec.key === key ? { ...sec, [lang]: { ...sec[lang], ...patch } } : sec
      ),
    }));
  },

  addSavedView: (v) => {
    set((s) => ({ savedViews: [...s.savedViews, v] }));
    toast.success("View saved", { description: v.name });
  },

  refreshCockpit: () => {
    const nudge = 0.98 + Math.random() * 0.04;
    set({ lastRefreshed: Date.now(), kpiNudge: nudge });
    toast.success("Refreshed", { description: "Live numbers updated." });
  },
}));

// Helper to compute RSVP counts for an event
export function rsvpCounts(rsvps: Rsvp[], eventId: string) {
  const filtered = rsvps.filter((r) => r.eventId === eventId);
  return {
    total: filtered.length,
    going: filtered.filter((r) => r.status === "Going").length,
    maybe: filtered.filter((r) => r.status === "Maybe").length,
    declined: filtered.filter((r) => r.status === "Declined").length,
    waitlisted: filtered.filter((r) => r.status === "Waitlisted").length,
    noResponse: filtered.filter((r) => r.status === "No response").length,
    checkedIn: filtered.filter((r) => r.checkedIn).length,
  };
}
