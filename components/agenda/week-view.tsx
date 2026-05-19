"use client";

import { useState } from "react";
import { AppointmentCard } from "./appointment-card";
import { AppointmentSheet } from "./appointment-sheet";
import type { AgendaAppointment, AppointmentStatus } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DayColumn {
  dateStr: string;
  appointments: AgendaAppointment[];
}

interface WeekViewProps {
  columns: DayColumn[];
}

export function WeekView({ columns: initialColumns }: WeekViewProps) {
  const [columns, setColumns] = useState<DayColumn[]>(initialColumns);
  const [selected, setSelected] = useState<AgendaAppointment | null>(null);

  function handleStatusChange(id: string, status: AppointmentStatus) {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        appointments: col.appointments.map((apt) =>
          apt.id === id ? { ...apt, status } : apt
        ),
      }))
    );
    // Update selected too so the sheet reflects the change
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {columns.map((col) => {
          const date = new Date(col.dateStr);
          const dayLabel = format(date, "EEE", { locale: es });
          const dateLabel = format(date, "d");
          const monthLabel = format(date, "MMM", { locale: es });
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div key={col.dateStr} className="space-y-2">
              <div className="text-center">
                <p className={cn("text-[11px] font-medium capitalize", isToday ? "text-brand" : "text-text-3")}>
                  {dayLabel}
                </p>
                <p className={cn("text-lg font-bold", isToday ? "text-brand" : "text-text-1")}>
                  {dateLabel}
                </p>
                <p className="text-[10px] capitalize text-text-3">{monthLabel}</p>
              </div>
              <div className="space-y-1.5">
                {col.appointments.length === 0 ? (
                  <p className="text-center text-[10px] text-text-3/40">—</p>
                ) : (
                  col.appointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} onClick={() => setSelected(apt)} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <AppointmentSheet
          appointment={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
