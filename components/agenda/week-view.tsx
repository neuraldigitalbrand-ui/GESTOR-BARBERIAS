import { AppointmentCard, type AppointmentDetail } from "./appointment-sheet";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DayColumn {
  date: Date;
  appointments: AppointmentDetail[];
}

interface WeekViewProps {
  columns: DayColumn[];
}

export function WeekView({ columns }: WeekViewProps) {
  return (
    <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
      {columns.map((col) => {
        const dayLabel = format(col.date, "EEE", { locale: es });
        const dateLabel = format(col.date, "d");
        const monthLabel = format(col.date, "MMM", { locale: es });
        const isToday =
          col.date.toDateString() === new Date().toDateString();

        return (
          <div key={col.date.toISOString()} className="space-y-2">
            {/* Day header */}
            <div className="text-center">
              <p
                className={
                  isToday
                    ? "text-xs font-bold capitalize text-primary"
                    : "text-xs font-medium capitalize text-muted-foreground"
                }
              >
                {dayLabel}
              </p>
              <p
                className={
                  isToday
                    ? "text-lg font-bold text-primary"
                    : "text-lg font-semibold"
                }
              >
                {dateLabel}
              </p>
              <p className="text-xs capitalize text-muted-foreground">{monthLabel}</p>
            </div>

            {/* Appointments */}
            <div className="space-y-1.5">
              {col.appointments.length === 0 ? (
                <p className="text-center text-[0.65rem] text-muted-foreground/50">—</p>
              ) : (
                col.appointments.map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
