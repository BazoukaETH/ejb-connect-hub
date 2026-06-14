import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  hue?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  square?: boolean;
}

export function Avatar({ name, hue = 220, size = "md", className, square }: AvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-7 w-7 text-[11px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  };

  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-center font-medium text-white select-none",
        square ? "rounded-md" : "rounded-full",
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 65%, 55%), hsl(${(hue + 40) % 360}, 65%, 45%))`,
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
