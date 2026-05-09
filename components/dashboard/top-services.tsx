import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopServicesProps {
  services: { name: string; count: number }[];
}

export function TopServices({ services }: TopServicesProps) {
  return (
    <div className="bg-surface rounded-xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-text-2">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.14em]">Top servicios</span>
        </div>
        <span className="text-[10px] text-text-3">Último mes</span>
      </div>
      {services.length === 0 ? (
        <p className="text-sm text-text-3">Sin datos</p>
      ) : (
        <ul>
          {services.map((s, i) => (
            <li
              key={s.name}
              className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-text-3 font-mono text-xs w-4">
                  #{i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    i === 0 ? "text-brand font-medium" : "text-text-1"
                  )}
                >
                  {s.name}
                </span>
              </div>
              <span className="text-xs text-text-2">{s.count} turnos</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
