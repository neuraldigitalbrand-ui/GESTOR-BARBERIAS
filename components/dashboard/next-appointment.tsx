import { Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

interface NextAppointmentCardProps {
  leadName: string;
  serviceName: string;
  durationMinutes: number;
  startAt: string;
  endAt: string;
}

export function NextAppointmentCard({
  leadName,
  serviceName,
  durationMinutes,
  startAt,
  endAt,
}: NextAppointmentCardProps) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const dateLabel = format(start, "EEEE d 'de' MMMM", { locale: es });
  const timeLabel = `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`;
  const countdown = formatDistanceToNow(start, { addSuffix: true, locale: es });

  return (
    <div className="bg-surface rounded-xl border border-white/[0.06] p-6 hover:border-white/[0.10] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-text-2">
          <Clock className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.14em]">Próximo turno</span>
        </div>
        <span className="text-[11px] text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
          {countdown}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <Avatar name={leadName} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="text-base font-semibold text-text-1 truncate">
            {leadName}
          </div>
          <div className="text-xs text-text-2 mt-0.5">
            {serviceName} · {durationMinutes} min
          </div>
          <div className="text-xs text-text-3 mt-2 capitalize">{dateLabel}</div>
          <div className="text-xl font-mono font-semibold text-brand mt-1">
            {timeLabel}
          </div>
        </div>
      </div>

      <Link
        href="/agenda"
        className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-text-2 hover:text-text-1 group"
      >
        <span>Ver en agenda</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
