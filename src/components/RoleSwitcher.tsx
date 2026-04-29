import { useRole, ALL_ROLES } from "@/context/RoleContext";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Eye, Check } from "lucide-react";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          data-demo-skip
          className="h-7 pl-1.5 pr-2 rounded-md border border-dashed border-border text-[11px] flex items-center gap-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Preview as role"
        >
          <Eye className="h-3 w-3" />
          <span className="hidden sm:inline">Preview as</span>
          <span className="font-medium text-foreground">{role}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Preview as role
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ALL_ROLES.map((r) => (
          <DropdownMenuItem key={r} onClick={() => setRole(r)} className="text-xs">
            <span className="flex-1">{r}</span>
            {r === role && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-[10px] text-muted-foreground leading-snug">
          Members do not have admin access. Chairman, Board Members, and Committee Heads are read-only previews of what the leadership tier sees.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
