import { DollarSign, TrendingUp } from "lucide-react";
import { formatPriceUYU } from "@/lib/utils";

interface WeekBar {
  d: string;
  v: number;
  today?: boolean;
  future?: boolean;
}

interface RevenueCardProps {
  revenue: number;
  weekBars: WeekBar[];
}

export function RevenueCard({ revenue, weekBars }: RevenueCardProps) {
  const BAR_MAX_PX = 48; // altura máxima de barra en px

  return (
    <div className="md:col-span-2 bg-gradient-to-br from-surface to-[#1a1612] rounded-2xl p-7 border border-brand/20 shadow-gold-glow relative overflow-hidden">
      {/* Shine */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between relative">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-brand">
              Ingresos estimados
            </span>
            <span className="text-[10px] text-text-3">· semana</span>
          </div>
          <div className="text-5xl font-bold font-mono text-brand mt-3 tracking-tight">
            {formatPriceUYU(revenue)}
          </div>
          <div className="text-xs text-text-2 mt-2 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3 text-success" />
            <span className="text-success font-medium">en curso</span>
            <span className="text-text-3">· semana actual</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-brand" />
        </div>
      </div>

      {/* Daily bars — altura fija en px para que el porcentaje funcione */}
      <div className="mt-6 relative">
        {/* Barra area: altura fija */}
        <div className="flex items-end gap-2" style={{ height: `${BAR_MAX_PX}px` }}>
          {weekBars.map((b, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm transition-all duration-500 ${
                b.future
                  ? "bg-white/[0.05] border border-white/[0.04]"
                  : b.today
                  ? "bg-brand"
                  : "bg-brand/40"
              }`}
              style={{ height: `${Math.max(b.v * BAR_MAX_PX, 3)}px` }}
            />
          ))}
        </div>
        {/* Fila de labels separada */}
        <div className="flex gap-2 mt-2">
          {weekBars.map((b, i) => (
            <span
              key={i}
              className={`flex-1 text-center text-[9px] uppercase tracking-wide ${
                b.today ? "text-brand font-semibold" : "text-text-3"
              }`}
            >
              {b.d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
