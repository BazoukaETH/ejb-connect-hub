import { createContext, useContext, useState, ReactNode } from "react";

export type ViewerRole =
  | "Super Admin"
  | "Finance"
  | "Membership Officer"
  | "Comms"
  | "Employee"
  | "Board"
  | "Chairman"
  | "Committee Chair";

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
  | "view:chatModeration"
  | "close:cycle";

const MATRIX: Record<ViewerRole, Capability[]> = {
  "Super Admin": [
    "view:financialSnapshot","view:notes","view:expenses","view:audit",
    "view:boardroom","view:chairmanOnly","edit:any","edit:announcements",
    "edit:payments","edit:members","view:chatModeration","close:cycle",
  ],
  "Finance": [
    "view:financialSnapshot","view:expenses","view:audit",
    "edit:payments","close:cycle",
  ],
  "Membership Officer": [
    "view:notes","edit:members",
  ],
  "Comms": [
    "edit:announcements","view:chatModeration",
  ],
  "Employee": [],
  "Board": [
    "view:financialSnapshot","view:expenses","view:audit","view:boardroom",
  ],
  "Chairman": [
    "view:financialSnapshot","view:expenses","view:audit","view:boardroom","view:chairmanOnly",
  ],
  "Committee Chair": [
    "view:chatModeration",
  ],
};

const Ctx = createContext<RoleCtx>({
  role: "Super Admin",
  setRole: () => {},
  can: () => true,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<ViewerRole>("Super Admin");
  const can = (c: Capability) => MATRIX[role]?.includes(c) ?? false;
  return <Ctx.Provider value={{ role, setRole, can }}>{children}</Ctx.Provider>;
}

export const useRole = () => useContext(Ctx);

export const ALL_ROLES: ViewerRole[] = [
  "Super Admin","Finance","Membership Officer","Comms","Employee",
  "Committee Chair","Board","Chairman",
];
