"use client";

import { useEffect } from "react";
import { X, Phone, Mail, Clock, CalendarDays, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon";
import { formatPriceUYU } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AgendaAppointment } from "@/lib/types";

interface AppointmentSheetProps {
  appointment: AgendaAppointment;
  onClose: () => void;
}

export function AppointmentSheet({ appointment: a, onClose }: AppointmentSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const start = new Date(a.startAt);
  const dateLabel = format(start, "EEE d MMM", { locale: es });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative w-full max-w-[440px] h-full bg-surface border-l border-white/[0.06] shadow-elevated overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-start justify-between mb-4">
            <Avatar name={a.name} size="lg" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-surface-raised text-text-2 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-text-1">{a.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={a.status} />
            <span className="text-sm text-text-2">· {a.service}</span>
          </div>
        </div>

        <div className="p-6 space-y-7">
          {/* Cliente */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-text-3 mb-3">
              Cliente
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <InfoRow
                icon={<Phone className="w-3.5 h-3.5" />}
                label="Teléfono"
                value={a.phone ?? "—"}
              />
              <InfoRow
                icon={<Mail className="w-3.5 h-3.5" />}
                label="Email"
                value={a.email ?? "—"}
              />
              <InfoRow
                icon={<PlatformIcon platform={a.platform} size={14} />}
                label="Plataforma"
                value={platformLabel(a.platform)}
              />
            </div>
          </section>

          {/* Turno */}
          <section>
            <div className="text-[11px] uppercase tracking-wider text-text-3 mb-3">
              Turno actual
            </div>
            <div className="bg-bg rounded-xl border border-white/[0.06] p-4 space-y-3">
              <div className="text-base font-semibold text-text-1">{a.service}</div>
              <div className="flex items-center gap-3 text-sm text-text-2">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="capitalize">{dateLabel}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {a.time}
                </span>
              </div>
              <div className="flex items-end justify-between pt-2 border-t border-white/[0.06]">
                <div>
                  <div className="text-2xl font-bold font-mono text-brand">
                    {formatPriceUYU(a.price)}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-surface-raised border border-white/[0.06] text-[10px] text-text-2">
                    {a.duration} min
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-3.5 h-3.5" /> Conversación
                </Button>
              </div>
            </div>
          </section>

          {/* Acciones */}
          <section className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              Reprogramar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/20 hover:bg-destructive/5"
            >
              Cancelar turno
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg border border-white/[0.04]">
      <span className="text-text-3">{icon}</span>
      <div className="flex-1 flex items-center justify-between gap-3">
        <span className="text-xs text-text-2">{label}</span>
        <span className="text-xs text-text-1 font-medium truncate">{value}</span>
      </div>
    </div>
  );
}
