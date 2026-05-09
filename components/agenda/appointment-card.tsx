"use client";

import type { AgendaAppointment } from "@/lib/types";
import { STATUS_DOT_COLOR } from "@/components/shared/status-badge";

const STATUS_BORDER: Record<AgendaAppointment["status"], string> = {
  confirmed:  "border-l-info",
  completed:  "border-l-success",
  pending:    "border-l-warning",
  cancelled:  "border-l-destructive",
  no_show:    "border-l-text-3",
};

interface AppointmentCardProps {
  appointment: AgendaAppointment;
  onClick: () => void;
}

export function AppointmentCard({ appointment: a, onClick }: AppointmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg p-2.5 bg-surface border border-white/[0.06] border-l-2 ${STATUS_BORDER[a.status]} hover:border-brand/30 hover:bg-surface-raised transition-all duration-150 ${a.status === "cancelled" ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] font-mono text-text-2">{a.time}</span>
        <span
          className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
          style={{ background: STATUS_DOT_COLOR[a.status] }}
        />
      </div>
      <div className="text-xs font-semibold text-text-1 truncate mt-0.5">
        {a.name}
      </div>
      <div className="text-[11px] text-text-3 truncate">{a.service}</div>
    </button>
  );
}
