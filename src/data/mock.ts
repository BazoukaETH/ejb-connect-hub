// Centralized mock data + types for EJB admin dashboard.
// In-memory only; resets on refresh. Keep deterministic for screenshots.

export type MemberStatus = "Active" | "Pending Payment" | "Lapsed" | "Suspended" | "Alumni";
export type PaymentStatus = "Paid" | "Unpaid" | "Partial" | "Waived";
export type CommitteeRole = "Chair" | "Vice Chair" | "Secretary" | "Member";
export type AdminRole = "Super Admin" | "Finance" | "Membership Officer" | "Comms" | "Employee" | "Board";

export interface Member {
  id: string;
  membershipNo: string;
  name: string;
  nameAr?: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  city: string;
  status: MemberStatus;
  paymentStatus: PaymentStatus;
  committees: { id: string; role: CommitteeRole }[];
  joinedDate: string;
  lastContacted?: string;
  referredBy?: string;
  about?: string;
  areasOfFocus: string[];
  productsServices: string[];
  linkedin?: string;
  avatarHue: number; // for deterministic avatar gradient
}

export interface Committee {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  memberCount: number;
  chairId: string;
  lastActivity: string;
  category?: string;
}

export interface Applicant {
  id: string;
  name: string;
  company: string;
  position: string;
  source: string;
  stage: "Lead" | "Prospect" | "Referred" | "Applicant" | "Pending Payment";
  daysInStage: number;
  appliedDate: string;
  referredBy?: string;
  avatarHue: number;
}

export interface EjbEvent {
  id: string;
  title: string;
  type: "Conference" | "Workshop" | "Sohour" | "Networking" | "Board meeting";
  date: string;
  endDate?: string;
  location: string;
  capacity: number;
  registered: number;
  status: "Draft" | "Published" | "Past" | "Cancelled";
  description: string;
  cost: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  category: string;
  audience: string;
  status: "Draft" | "Scheduled" | "Published" | "Archived";
  publishedAt?: string;
  scheduledFor?: string;
  author: string;
  reach?: { sent: number; total: number };
  openRate?: number;
}

export interface Partner {
  id: string;
  name: string;
  tier: "Platinum" | "Gold" | "Silver" | "Community";
  active: boolean;
  website: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contractStart: string;
  contractEnd: string;
  value: number;
  paymentStatus: "Invoiced" | "Paid" | "Outstanding";
  order: number;
}

export interface Payment {
  id: string;
  memberId: string;
  cycle: string;
  amount: number;
  date: string;
  method: "Bank transfer" | "Cash" | "Cheque" | "Card";
  reference: string;
  recordedBy: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastLogin: string;
  active: boolean;
  avatarHue: number;
}

export interface Activity {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  timestamp: string;
  type: "payment" | "stage" | "announcement" | "event" | "note" | "member";
}

// ---------- Constants ----------

export const CYCLE = "2026 / 2027";
export const CYCLE_DUE_AMOUNT = 15000;
export const CYCLE_CLOSE = "31 Jul 2026";
export const TOTAL_MEMBERS = 500;
export const PAID_COUNT = 372;
export const UNPAID_COUNT = 128;

export const COMMITTEES: Committee[] = [
  { id: "c-agri", name: "Agriculture & Food Processing", nameAr: "الزراعة وتصنيع الأغذية", description: "Industry challenges, supply chain, exports.", memberCount: 47, chairId: "m-002", lastActivity: "2 days ago", category: "Industry" },
  { id: "c-real", name: "Construction & Real Estate", nameAr: "البناء والعقارات", description: "Urban development, regulation, project finance.", memberCount: 68, chairId: "m-005", lastActivity: "1 day ago" },
  { id: "c-edu", name: "Education & Training", nameAr: "التعليم والتدريب", description: "Talent pipeline and corporate learning.", memberCount: 39, chairId: "m-008", lastActivity: "5 days ago" },
  { id: "c-energy", name: "Industry & Energy", nameAr: "الصناعة والطاقة", description: "Manufacturing, energy transition, exports.", memberCount: 54, chairId: "m-011", lastActivity: "3 hours ago" },
  { id: "c-fin", name: "Finance, Investment & Law", nameAr: "التمويل والاستثمار والقانون", description: "Capital markets, M&A, regulatory.", memberCount: 72, chairId: "m-014", lastActivity: "yesterday" },
  { id: "c-health", name: "Healthcare & Pharmaceuticals", nameAr: "الصحة والأدوية", description: "Health systems, pharma, medtech.", memberCount: 31, chairId: "m-017", lastActivity: "4 days ago" },
  { id: "c-tech", name: "Consulting & Technology", nameAr: "الاستشارات والتكنولوجيا", description: "Digital transformation, IT services.", memberCount: 58, chairId: "m-020", lastActivity: "1 hour ago" },
  { id: "c-tour", name: "Tourism & Hospitality", nameAr: "السياحة والضيافة", description: "Tourism recovery, hospitality investment.", memberCount: 35, chairId: "m-023", lastActivity: "6 days ago" },
  { id: "c-media", name: "Media & Communications", nameAr: "الإعلام والاتصالات", description: "Media policy, communications strategy.", memberCount: 28, chairId: "m-026", lastActivity: "2 days ago" },
];

export const AREAS_OF_FOCUS = ["Strategy", "Operations", "Finance", "Real Estate", "Construction", "Banking", "Tech", "Healthcare", "Education", "Energy", "Media", "Family Business"];
export const PRODUCTS_SERVICES = ["Legal advisory", "Banking products", "ERP implementation", "Construction services", "Real estate brokerage", "Investment advisory", "Marketing services", "IT consulting", "HR services", "Audit & tax"];

const FIRST_NAMES = ["Ahmed", "Mohamed", "Mona", "Nour", "Tarek", "Yasmin", "Hassan", "Amira", "Khaled", "Salma", "Omar", "Heba", "Karim", "Dina", "Sherif", "Rania", "Hossam", "Laila", "Youssef", "Farida", "Mostafa", "Hala", "Ayman", "Marwa", "Bassem", "Nadia", "Sameh", "Reem", "Ihab", "Soha"];
const LAST_NAMES = ["Hassan", "Mostafa", "El-Sayed", "Hegazy", "Fawzy", "Abdel Aziz", "Allam", "Ghoneim", "Sharif", "Mansour", "Nazmi", "Ezz", "Said", "Khalil", "Tantawy", "Saleh", "Badr", "Diab", "Naguib", "Ezzat"];
const COMPANIES = ["Orascom Construction", "EFG Hermes", "Hassan Allam Holding", "Commercial International Bank", "Talaat Moustafa Group", "Banque Misr", "LOGIC Consulting", "Elsewedy Electric", "Juhayna", "Edita Food Industries", "Mountain View", "SODIC", "Palm Hills Developments", "Raya Holding", "MM Group", "Ghabbour Auto", "Eastern Company", "Telecom Egypt", "Vodafone Egypt", "Orange Egypt"];
const CITIES = ["Cairo", "Giza", "Alexandria", "New Cairo", "6th of October", "Sheikh Zayed"];
const POSITIONS = ["Chief Executive Officer", "Founder", "Managing Director", "Chairman", "Board Member", "Chief Financial Officer", "Chief Operating Officer", "Vice President", "Partner", "General Manager"];

function rng(seed: number) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
const rand = rng(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];

function makeMembers(): Member[] {
  const arr: Member[] = [];
  for (let i = 1; i <= 60; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const name = `${first} ${last}`;
    const company = pick(COMPANIES);
    const isPaid = i <= 44; // ~74% paid
    const status: MemberStatus = i > 50 ? "Lapsed" : i > 47 ? "Pending Payment" : "Active";
    const numCommittees = 1 + Math.floor(rand() * 2);
    const committees: { id: string; role: CommitteeRole }[] = [];
    const used = new Set<string>();
    for (let k = 0; k < numCommittees; k++) {
      const c = pick(COMMITTEES);
      if (used.has(c.id)) continue;
      used.add(c.id);
      committees.push({ id: c.id, role: k === 0 && i % 9 === 0 ? "Chair" : "Member" });
    }
    arr.push({
      id: `m-${String(i).padStart(3, "0")}`,
      membershipNo: `M-${String(i).padStart(4, "0")}`,
      name,
      nameAr: i % 11 === 0 ? "أحمد حسن" : undefined,
      email: `${first.toLowerCase()}.${last.toLowerCase().replace(/\s/g, "")}@${company.split(" ")[0].toLowerCase()}.com`,
      phone: `+20 10${Math.floor(10000000 + rand() * 89999999)}`,
      company,
      position: pick(POSITIONS),
      city: pick(CITIES),
      status,
      paymentStatus: status === "Lapsed" ? "Unpaid" : isPaid ? "Paid" : "Unpaid",
      committees,
      joinedDate: `${2018 + Math.floor(rand() * 8)}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-15`,
      lastContacted: `2026-04-${String(1 + Math.floor(rand() * 27)).padStart(2, "0")}`,
      about: `${pick(POSITIONS)} at ${company}. Active in ${pick(AREAS_OF_FOCUS)} and ${pick(AREAS_OF_FOCUS)}.`,
      areasOfFocus: [pick(AREAS_OF_FOCUS), pick(AREAS_OF_FOCUS)],
      productsServices: [pick(PRODUCTS_SERVICES)],
      linkedin: `linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase().replace(/\s/g, "")}`,
      avatarHue: (i * 47) % 360,
      referredBy: i > 3 ? `M-${String(1 + Math.floor(rand() * 20)).padStart(4, "0")}` : undefined,
    });
  }
  return arr;
}

export const MEMBERS: Member[] = makeMembers();

export const APPLICANTS: Applicant[] = [
  { id: "a-1", name: "Karim Ezzat", company: "Misr Capital", position: "Managing Partner", source: "Referred", stage: "Lead", daysInStage: 4, appliedDate: "2026-04-24", referredBy: "Ahmed Hassan", avatarHue: 30 },
  { id: "a-2", name: "Hala Naguib", company: "Pyramids Hospitality", position: "CEO", source: "Cold inbound", stage: "Lead", daysInStage: 9, appliedDate: "2026-04-19", avatarHue: 60 },
  { id: "a-3", name: "Bassem Sharif", company: "Nile Logistics", position: "Founder", source: "Event", stage: "Prospect", daysInStage: 12, appliedDate: "2026-04-16", avatarHue: 90 },
  { id: "a-4", name: "Reem Mansour", company: "Cairo Medtech", position: "Co-founder", source: "Referred", stage: "Prospect", daysInStage: 18, appliedDate: "2026-04-10", referredBy: "Mona Allam", avatarHue: 120 },
  { id: "a-5", name: "Sameh Tantawy", company: "Delta Foods", position: "Chairman", source: "Referred", stage: "Referred", daysInStage: 6, appliedDate: "2026-04-22", referredBy: "Tarek Mostafa", avatarHue: 150 },
  { id: "a-6", name: "Nadia Saleh", company: "Alex Marine", position: "CFO", source: "Cold inbound", stage: "Applicant", daysInStage: 11, appliedDate: "2026-04-17", avatarHue: 180 },
  { id: "a-7", name: "Ihab Diab", company: "Sphinx Tech", position: "CEO", source: "Referred", stage: "Applicant", daysInStage: 22, appliedDate: "2026-04-06", referredBy: "Yasmin Allam", avatarHue: 210 },
  { id: "a-8", name: "Soha Badr", company: "Heliopolis Real Estate", position: "Partner", source: "Event", stage: "Pending Payment", daysInStage: 5, appliedDate: "2026-04-23", avatarHue: 240 },
  { id: "a-9", name: "Ayman Khalil", company: "Cairo FinServ", position: "Founder", source: "Referred", stage: "Pending Payment", daysInStage: 8, appliedDate: "2026-04-20", referredBy: "Hassan Allam", avatarHue: 270 },
];

export const EVENTS: EjbEvent[] = [
  {
    id: "e-1", title: "Annual EJB Sohour", type: "Sohour",
    date: "2026-03-05T20:00:00", location: "Four Seasons Nile Plaza, Cairo",
    capacity: 200, registered: 167, status: "Past",
    description: "Annual gathering during Ramadan for EJB members and partners.",
    cost: 0,
  },
  {
    id: "e-2", title: "Annual Business Summit 2026", type: "Conference",
    date: "2026-05-15T09:00:00", endDate: "2026-05-15T18:00:00",
    location: "Grand Nile Tower, Cairo",
    capacity: 350, registered: 247, status: "Published",
    description: "Flagship summit on Egypt's economic outlook and private sector priorities.",
    cost: 2500,
  },
  {
    id: "e-3", title: "Technology Innovation Workshop", type: "Workshop",
    date: "2026-05-08T14:00:00", endDate: "2026-05-08T17:00:00",
    location: "Smart Village, Giza",
    capacity: 60, registered: 41, status: "Published",
    description: "Hands-on session on AI adoption for mid-market enterprises.",
    cost: 0,
  },
  {
    id: "e-4", title: "Board Strategy Offsite", type: "Board meeting",
    date: "2026-06-02T09:00:00", location: "Marriott Mena House, Giza",
    capacity: 24, registered: 19, status: "Draft",
    description: "Closed-door board session on FY27 strategy.",
    cost: 0,
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "an-1", title: "Last Call: EJB x CIF 2026 Registrations Close Friday",
    body: "Members who plan to attend the Cairo International Forum representing EJB must register by Friday 2 May. Limited delegate slots remain.",
    priority: "Urgent", category: "Event", audience: "All members",
    status: "Published", publishedAt: "2026-04-26T10:30:00",
    author: "Mona Allam", reach: { sent: 500, total: 500 }, openRate: 71,
  },
  {
    id: "an-2", title: "New Member Benefit: CIB Premium Banking Tier",
    body: "EJB members are now eligible for fast-track access to CIB's Premium Banking tier. See benefit details in the Hub.",
    priority: "High", category: "Member benefit", audience: "Paid only",
    status: "Published", publishedAt: "2026-04-22T09:00:00",
    author: "Nour Hegazy", reach: { sent: 372, total: 372 }, openRate: 58,
  },
  {
    id: "an-3", title: "Quarterly Financial Briefing — Recording Available",
    body: "The Q1 briefing recording and slides are now in the Documents library under Member Briefings.",
    priority: "Medium", category: "General", audience: "All members",
    status: "Published", publishedAt: "2026-04-15T11:00:00",
    author: "Tarek Mostafa", reach: { sent: 500, total: 500 }, openRate: 44,
  },
  {
    id: "an-4", title: "Reminder: Update Your Profile and Areas of Focus",
    body: "Please review your profile to make sure your Areas of Focus and Products & Services are current. This drives the directory search.",
    priority: "Medium", category: "General", audience: "All members",
    status: "Scheduled", scheduledFor: "2026-05-02T09:00:00",
    author: "Yasmin Allam",
  },
];

export const PARTNERS: Partner[] = [
  { id: "p-1", name: "Commercial International Bank", tier: "Platinum", active: true, website: "cibeg.com", description: "Banking partner.", contactName: "Hassan Mansour", contactEmail: "h.mansour@cibeg.com", contractStart: "2026-01-01", contractEnd: "2026-12-31", value: 500000, paymentStatus: "Paid", order: 1 },
  { id: "p-2", name: "EFG Hermes", tier: "Gold", active: true, website: "efghermes.com", description: "Investment partner.", contactName: "Dina Sharif", contactEmail: "d.sharif@efghermes.com", contractStart: "2026-01-01", contractEnd: "2026-12-31", value: 350000, paymentStatus: "Paid", order: 2 },
  { id: "p-3", name: "Orascom Construction", tier: "Gold", active: true, website: "orascom.com", description: "Infrastructure partner.", contactName: "Khaled Hegazy", contactEmail: "k.hegazy@orascom.com", contractStart: "2026-01-01", contractEnd: "2026-12-31", value: 300000, paymentStatus: "Invoiced", order: 3 },
  { id: "p-4", name: "Vodafone Egypt", tier: "Silver", active: true, website: "vodafone.com.eg", description: "Connectivity partner.", contactName: "Reem Said", contactEmail: "r.said@vodafone.com.eg", contractStart: "2026-01-01", contractEnd: "2026-12-31", value: 150000, paymentStatus: "Paid", order: 4 },
  { id: "p-5", name: "Hassan Allam Holding", tier: "Silver", active: true, website: "hassanallam.com", description: "Construction partner.", contactName: "Sherif Allam", contactEmail: "s.allam@hassanallam.com", contractStart: "2026-01-01", contractEnd: "2026-12-31", value: 150000, paymentStatus: "Outstanding", order: 5 },
];

export const ADMIN_TEAM: AdminUser[] = [
  { id: "u-1", name: "Mona Allam", email: "mona@ejb.org.eg", role: "Super Admin", lastLogin: "2 min ago", active: true, avatarHue: 220 },
  { id: "u-2", name: "Nour Hegazy", email: "nour@ejb.org.eg", role: "Finance", lastLogin: "1 hour ago", active: true, avatarHue: 140 },
  { id: "u-3", name: "Yasmin Allam", email: "yasmin@ejb.org.eg", role: "Membership Officer", lastLogin: "3 hours ago", active: true, avatarHue: 320 },
  { id: "u-4", name: "Tarek Mostafa", email: "tarek@ejb.org.eg", role: "Comms", lastLogin: "yesterday", active: true, avatarHue: 30 },
  { id: "u-5", name: "Karim Said", email: "karim@ejb.org.eg", role: "Employee", lastLogin: "4 days ago", active: true, avatarHue: 200 },
];

export const RECENT_ACTIVITY: Activity[] = [
  { id: "act-1", actorId: "u-1", actorName: "Mona", action: "moved Ahmed Hassan to Active Member", timestamp: "12 min ago", type: "stage" },
  { id: "act-2", actorId: "u-2", actorName: "Nour", action: "recorded EGP 15,000 payment from Tarek Mostafa", timestamp: "1 hour ago", type: "payment" },
  { id: "act-3", actorId: "u-4", actorName: "Tarek", action: "published announcement: Last Call: EJB x CIF 2026", timestamp: "2 hours ago", type: "announcement" },
  { id: "act-4", actorId: "u-3", actorName: "Yasmin", action: "added Karim Ezzat to applicants pipeline", timestamp: "3 hours ago", type: "member" },
  { id: "act-5", actorId: "u-2", actorName: "Nour", action: "recorded EGP 15,000 payment from Hala Saleh", timestamp: "4 hours ago", type: "payment" },
  { id: "act-6", actorId: "u-1", actorName: "Mona", action: "approved Reem Mansour application", timestamp: "yesterday", type: "stage" },
  { id: "act-7", actorId: "u-4", actorName: "Tarek", action: "added 12 RSVPs to Annual Business Summit", timestamp: "yesterday", type: "event" },
  { id: "act-8", actorId: "u-3", actorName: "Yasmin", action: "added note to Bassem Sharif", timestamp: "2 days ago", type: "note" },
  { id: "act-9", actorId: "u-2", actorName: "Nour", action: "recorded EGP 7,500 partial payment from Soha Badr", timestamp: "2 days ago", type: "payment" },
  { id: "act-10", actorId: "u-1", actorName: "Mona", action: "updated Tech committee chair to Karim Said", timestamp: "3 days ago", type: "stage" },
];

export const DOCUMENTS = [
  { id: "d-1", name: "EJB Bylaws 2024.pdf", category: "Governance", size: "1.2 MB", uploadedBy: "Mona Allam", uploadedAt: "2024-01-15", visibility: "All members", downloads: 412 },
  { id: "d-2", name: "Code of Conduct.pdf", category: "Governance", size: "480 KB", uploadedBy: "Mona Allam", uploadedAt: "2024-02-02", visibility: "All members", downloads: 387 },
  { id: "d-3", name: "Membership Charter.pdf", category: "Governance", size: "640 KB", uploadedBy: "Yasmin Allam", uploadedAt: "2024-03-10", visibility: "All members", downloads: 290 },
  { id: "d-4", name: "CIB Premium Banking Benefit.pdf", category: "Member benefit", size: "320 KB", uploadedBy: "Nour Hegazy", uploadedAt: "2026-04-22", visibility: "Paid only", downloads: 184 },
  { id: "d-5", name: "Vodafone Business Offer.pdf", category: "Member benefit", size: "280 KB", uploadedBy: "Tarek Mostafa", uploadedAt: "2026-03-18", visibility: "Paid only", downloads: 142 },
  { id: "d-6", name: "EJB Annual Report 2025.pdf", category: "Reports", size: "8.4 MB", uploadedBy: "Mona Allam", uploadedAt: "2026-02-01", visibility: "All members", downloads: 318 },
];

export const RESOURCES = [
  { id: "r-1", name: "Egyptian Tax Authority Portal", type: "link", url: "eta.gov.eg" },
  { id: "r-2", name: "FRA Investor Guidelines.pdf", type: "PDF", size: "2.1 MB" },
  { id: "r-3", name: "Doing Business in Egypt 2026.pdf", type: "PDF", size: "5.6 MB" },
  { id: "r-4", name: "Onboarding Welcome Video", type: "Video", duration: "4:21" },
  { id: "r-5", name: "Suez Canal Economic Zone", type: "link", url: "sczone.eg" },
  { id: "r-6", name: "EJB Member Directory App (iOS)", type: "link", url: "apps.apple.com/ejb" },
  { id: "r-7", name: "Capital Markets Reference Sheet.pdf", type: "PDF", size: "780 KB" },
  { id: "r-8", name: "GAFI Investment Map", type: "link", url: "gafi.gov.eg" },
  { id: "r-9", name: "Standard NDA Template.docx", type: "DOCX", size: "92 KB" },
  { id: "r-10", name: "ESG Reporting Primer.pdf", type: "PDF", size: "1.8 MB" },
  { id: "r-11", name: "EJB Logo Pack.zip", type: "Archive", size: "12 MB" },
  { id: "r-12", name: "Brand Book 2024.pdf", type: "PDF", size: "6.2 MB" },
];

// ---------- Helpers ----------

export function fmtEGP(n: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M EGP`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K EGP`;
  }
  return `EGP ${n.toLocaleString("en-US")}`;
}

export function fmtDate(iso: string) {
  const d = new Date(iso);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getDate()).padStart(2,"0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso);
  const t = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${fmtDate(iso)} · ${t}`;
}

export function getCommittee(id: string) {
  return COMMITTEES.find(c => c.id === id);
}

export function getMember(id: string) {
  return MEMBERS.find(m => m.id === id);
}

// Cumulative weekly collections for cycle progress chart (in EGP, millions)
export const CYCLE_WEEKLY = [
  { week: "W1", value: 0.4 }, { week: "W2", value: 0.9 }, { week: "W3", value: 1.6 },
  { week: "W4", value: 2.4 }, { week: "W5", value: 3.2 }, { week: "W6", value: 4.1 },
  { week: "W7", value: 4.8 }, { week: "W8", value: 5.58 },
];

export const PIPELINE_STAGES = [
  { name: "Lead", count: 14 },
  { name: "Prospect", count: 11 },
  { name: "Referred", count: 8 },
  { name: "Applicant", count: 9 },
  { name: "Pending Payment", count: 5 },
  { name: "Active", count: 412 },
];

// ---------- Extended fixtures ----------

export interface OnboardingTask {
  memberId: string;
  memberName: string;
  company: string;
  hue: number;
  joinedDays: number;
  steps: { profile: boolean; payment: boolean; intro: boolean; firstEvent: boolean };
  owner: string;
}

export const ONBOARDING: OnboardingTask[] = [
  { memberId: "m-061", memberName: "Karim Ezzat", company: "Misr Capital", hue: 30, joinedDays: 2, steps: { profile: true, payment: true, intro: false, firstEvent: false }, owner: "Yasmin" },
  { memberId: "m-062", memberName: "Reem Mansour", company: "Cairo Medtech", hue: 120, joinedDays: 5, steps: { profile: true, payment: true, intro: true, firstEvent: false }, owner: "Yasmin" },
  { memberId: "m-063", memberName: "Soha Badr", company: "Heliopolis RE", hue: 240, joinedDays: 8, steps: { profile: true, payment: false, intro: false, firstEvent: false }, owner: "Nour" },
  { memberId: "m-064", memberName: "Ayman Khalil", company: "Cairo FinServ", hue: 270, joinedDays: 11, steps: { profile: false, payment: false, intro: false, firstEvent: false }, owner: "Yasmin" },
  { memberId: "m-065", memberName: "Hala Naguib", company: "Pyramids Hospitality", hue: 60, joinedDays: 14, steps: { profile: true, payment: true, intro: true, firstEvent: true }, owner: "Mona" },
  { memberId: "m-066", memberName: "Bassem Sharif", company: "Nile Logistics", hue: 90, joinedDays: 17, steps: { profile: true, payment: false, intro: true, firstEvent: false }, owner: "Yasmin" },
];

export interface Expense {
  id: string;
  date: string;
  vendor: string;
  category: "Events" | "Office" | "Marketing" | "Travel" | "Software" | "Professional fees";
  amount: number;
  status: "Pending" | "Paid" | "Reimbursed";
  approver: string;
  reference: string;
}

export const EXPENSES: Expense[] = [
  { id: "x-1", date: "2026-04-26", vendor: "Four Seasons Nile Plaza", category: "Events", amount: 380000, status: "Paid", approver: "Mona", reference: "INV-2026-0421" },
  { id: "x-2", date: "2026-04-22", vendor: "Smart Village Conference Hall", category: "Events", amount: 84000, status: "Paid", approver: "Mona", reference: "INV-2026-0418" },
  { id: "x-3", date: "2026-04-19", vendor: "Allam & Co Legal Advisory", category: "Professional fees", amount: 75000, status: "Paid", approver: "Mona", reference: "INV-04-19" },
  { id: "x-4", date: "2026-04-15", vendor: "Adobe Creative Cloud", category: "Software", amount: 18400, status: "Paid", approver: "Tarek", reference: "INV-AD-0415" },
  { id: "x-5", date: "2026-04-12", vendor: "Cairo Marriott (Board offsite)", category: "Travel", amount: 142000, status: "Pending", approver: "Mona", reference: "INV-CM-0412" },
  { id: "x-6", date: "2026-04-08", vendor: "Print House", category: "Marketing", amount: 22500, status: "Paid", approver: "Tarek", reference: "INV-PH-04" },
  { id: "x-7", date: "2026-04-04", vendor: "Office Lease (Q2)", category: "Office", amount: 240000, status: "Paid", approver: "Nour", reference: "RNT-Q2" },
  { id: "x-8", date: "2026-03-28", vendor: "Networking dinner — Sohour", category: "Events", amount: 96000, status: "Reimbursed", approver: "Mona", reference: "EXP-SOH-03" },
];

export const EXPENSE_BUDGET = {
  total: 7_200_000,
  used: 4_380_000,
  byCategory: [
    { name: "Events", value: 2_140_000, budget: 3_000_000 },
    { name: "Office", value: 720_000, budget: 1_200_000 },
    { name: "Professional fees", value: 540_000, budget: 900_000 },
    { name: "Marketing", value: 380_000, budget: 700_000 },
    { name: "Travel", value: 360_000, budget: 800_000 },
    { name: "Software", value: 240_000, budget: 600_000 },
  ],
};

export interface MemberNote {
  id: string;
  memberId: string;
  author: string;
  hue: number;
  body: string;
  ts: string;
  pinned?: boolean;
}

export const MEMBER_NOTES: MemberNote[] = [
  { id: "n-1", memberId: "m-001", author: "Mona Allam", hue: 220, body: "Confirmed attendance to Annual Summit. Wants intro to Hassan Allam re: PPP project.", ts: "2 days ago", pinned: true },
  { id: "n-2", memberId: "m-001", author: "Yasmin Allam", hue: 320, body: "Updated phone number after WhatsApp confirmation.", ts: "1 week ago" },
  { id: "n-3", memberId: "m-001", author: "Nour Hegazy", hue: 140, body: "Payment received via bank transfer. Receipt sent.", ts: "2 weeks ago" },
];

export interface CommsLog {
  id: string;
  memberId: string;
  channel: "Email" | "SMS" | "WhatsApp" | "Phone" | "In-app";
  direction: "out" | "in";
  subject: string;
  ts: string;
  by: string;
}

export const MEMBER_COMMS: CommsLog[] = [
  { id: "co-1", memberId: "m-001", channel: "Email", direction: "out", subject: "Receipt for 2026/27 dues", ts: "2 days ago", by: "Nour" },
  { id: "co-2", memberId: "m-001", channel: "WhatsApp", direction: "out", subject: "Reminder: cycle closes 31 Jul", ts: "5 days ago", by: "Yasmin" },
  { id: "co-3", memberId: "m-001", channel: "Email", direction: "in", subject: "Re: Annual Summit RSVP confirmation", ts: "1 week ago", by: "—" },
  { id: "co-4", memberId: "m-001", channel: "Phone", direction: "out", subject: "Welcome call — onboarding", ts: "3 weeks ago", by: "Mona" },
];

export interface AuditEntry {
  id: string;
  actor: string;
  hue: number;
  role: AdminRole;
  action: string;
  entity: string;
  before?: string;
  after?: string;
  ts: string;
  ip: string;
  type: "create" | "update" | "delete" | "publish" | "payment" | "stage" | "auth";
}

export const AUDIT: AuditEntry[] = [
  { id: "au-1", actor: "Nour Hegazy", hue: 140, role: "Finance", type: "payment", action: "Recorded payment", entity: "Tarek Mostafa · M-0023", before: "Unpaid", after: "Paid · EGP 15,000", ts: "12 min ago", ip: "156.193.44.12" },
  { id: "au-2", actor: "Yasmin Allam", hue: 320, role: "Membership Officer", type: "stage", action: "Moved applicant", entity: "Reem Mansour", before: "Applicant", after: "Pending Payment", ts: "1 hour ago", ip: "156.193.44.12" },
  { id: "au-3", actor: "Tarek Mostafa", hue: 30, role: "Comms", type: "publish", action: "Published announcement", entity: "Last Call: EJB x CIF 2026", ts: "2 hours ago", ip: "41.34.221.5" },
  { id: "au-4", actor: "Mona Allam", hue: 220, role: "Super Admin", type: "update", action: "Updated committee chair", entity: "Consulting & Technology", before: "Karim Said", after: "Yasmin Allam", ts: "3 hours ago", ip: "156.193.44.12" },
  { id: "au-5", actor: "Nour Hegazy", hue: 140, role: "Finance", type: "payment", action: "Recorded partial payment", entity: "Soha Badr · M-0044", before: "Unpaid", after: "Partial · EGP 7,500", ts: "yesterday", ip: "156.193.44.12" },
  { id: "au-6", actor: "Mona Allam", hue: 220, role: "Super Admin", type: "create", action: "Added member", entity: "Karim Ezzat · M-0061", ts: "yesterday", ip: "156.193.44.12" },
  { id: "au-7", actor: "Tarek Mostafa", hue: 30, role: "Comms", type: "update", action: "Reordered partners strip", entity: "App content", before: "CIB · EFG · Orascom", after: "CIB · Orascom · EFG", ts: "2 days ago", ip: "41.34.221.5" },
  { id: "au-8", actor: "Yasmin Allam", hue: 320, role: "Membership Officer", type: "update", action: "Edited member profile", entity: "Hassan Allam · M-0005", ts: "2 days ago", ip: "156.193.44.12" },
  { id: "au-9", actor: "Mona Allam", hue: 220, role: "Super Admin", type: "auth", action: "Signed in", entity: "Web · Chrome / macOS", ts: "3 days ago", ip: "156.193.44.12" },
  { id: "au-10", actor: "Karim Said", hue: 200, role: "Employee", type: "update", action: "Uploaded document", entity: "CIB Premium Banking Benefit.pdf", ts: "3 days ago", ip: "156.193.44.12" },
  { id: "au-11", actor: "Mona Allam", hue: 220, role: "Super Admin", type: "delete", action: "Removed taxonomy term", entity: "Areas of Focus → 'Misc'", ts: "4 days ago", ip: "156.193.44.12" },
  { id: "au-12", actor: "Nour Hegazy", hue: 140, role: "Finance", type: "publish", action: "Closed cycle", entity: "Cycle 2025/2026 · 91% paid", ts: "5 days ago", ip: "156.193.44.12" },
];

// Per-member quick stats helper
export function memberStats(memberId: string) {
  const idx = parseInt(memberId.replace(/\D/g, ""), 10) || 1;
  return {
    eventsAttended: 4 + (idx % 7),
    referrals: idx % 4,
    chatMessages: 12 + (idx * 3) % 80,
    documentsRead: 6 + (idx * 2) % 30,
  };
}

export const FINANCIAL_SNAPSHOT = {
  cashBalance: 8_700_000,
  reserve: 6_200_000,
  ytdIncome: 7_120_000,
  ytdExpenses: 4_380_000,
  monthly: [
    { m: "Jan", inc: 0.6, exp: 0.4 }, { m: "Feb", inc: 0.8, exp: 0.5 },
    { m: "Mar", inc: 1.1, exp: 0.6 }, { m: "Apr", inc: 1.4, exp: 0.7 },
    { m: "May", inc: 0.9, exp: 0.5 }, { m: "Jun", inc: 0.7, exp: 0.4 },
    { m: "Jul", inc: 1.6, exp: 0.5 }, { m: "Aug", inc: 0.0, exp: 0.4 },
  ],
};
