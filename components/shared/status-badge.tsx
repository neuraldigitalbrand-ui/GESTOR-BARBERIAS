import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

const STYLES: Record<
  AppointmentStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  confirmed:  { bg: "bg-info/10",         text: "text-info",        border: "border-info/20",        label: "Confirmado"  },
  completed:  { bg: "bg-success/10",      text: "text-success",     border: "border-success/20",     label: "Completado"  },
  pending:    { bg: "bg-warning/10",      text: "text-warning",     border: "border-warning/20",     label: "Pendiente"   },
  cancelled:  { bg: "bg-destructive/10",  text: "text-destructive", border: "border-destructive/20", label: "Cancelado"   },
  no_show:    { bg: "bg-white/5",         text: "text-text-2",      border: "border-white/[0.08]",   label: "No asistió"  },
};

export const STATUS_DOT_COLOR: Record<AppointmentStatus, string> = {
  confirmed: "#60A5FA",
  completed: "#4ADE80",
  pending:   "#FBBF24",
  cancelled: "#F87171",
  no_show:   "#7A7874",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider border",
        s.bg,
        s.text,
        s.border,
        className
      )}
    >
      {s.label}
    </span>
  );
}
