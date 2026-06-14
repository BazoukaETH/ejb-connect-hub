import { createContext, useContext, useState, ReactNode } from "react";

export type ViewerRole =
  | "EJB Staff (Lite)"
  | "EJB Admin"
  | "Finance"
  | "Committee Heads"
  | "Board Members"
  | "Chairman";

interface RoleCtx {
  role: ViewerRole;
  setRole: (r: ViewerRole) => void;
  can: (capability: Capability) => boolean;
}

export type Capability =
  | "view:financialSnapshot"
  | "view:notes"
  | "view:expenses"
  | "view:audit"
  | "view:boardroom"
  | "view:chairmanOnly"
  | "edit:any"
  | "edit:announcements"
  | "edit:payments"
  | "edit:members"
  | "edit:committeeScoped"
  | "view:chatModeration"
  | "close:cycle";

const MATRIX: Record<ViewerRole, Capability[]> = {
  // Lite v1 launch role: the 7 hand-over sections only.
  "EJB Staff (Lite)": [
    "view:notes","edit:announcements","edit:payments","edit:members","edit:committeeScoped",
  ],
  // Full write access across all screens
  "EJB Admin": [
    "view:financialSnapshot","view:notes","view:expenses","view:audit",
    "view:boardroom","edit:any","edit:announcements",
    "edit:payments","edit:members","edit:committeeScoped",
    "view:chatModeration","close:cycle",
  ],
  // Full write on Payments, Expenses, Partners financials; read-only elsewhere
  "Finance": [
    "view:financialSnapshot","view:expenses","view:audit",
    "edit:payments","close:cycle",
  ],
  // Read-only across the dashboard, write within their own committee
  "Committee Heads": [
    "edit:committeeScoped","view:chatModeration",
  ],
  // Read-only across everything + Boardroom
  "Board Members": [
    "view:financialSnapshot","view:expenses","view:audit","view:boardroom","view:notes",
  ],
  // Read-only across everything + Boardroom + Chairman-only sections
  "Chairman": [
    "view:financialSnapshot","view:expenses","view:audit",
    "view:boardroom","view:chairmanOnly","view:notes",
  ],
};

const Ctx = createContext<RoleCtx>({
  role: "EJB Admin",
  setRole: () => {},
  can: () => true,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ViewerRole>("EJB Staff (Lite)");
  const can = (c: Capability) => MATRIX[role]?.includes(c) ?? false;
  return <Ctx.Provider value={{ role, setRole, can }}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);

export const ALL_ROLES: ViewerRole[] = [
  "EJB Staff (Lite)",
  "Chairman",
  "Board Members",
  "Committee Heads",
  "EJB Admin",
  "Finance",
];
