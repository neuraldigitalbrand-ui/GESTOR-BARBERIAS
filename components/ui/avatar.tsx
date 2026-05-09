import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-surface-raised border border-white/[0.08] text-brand font-semibold flex items-center justify-center shrink-0",
        SIZES[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
