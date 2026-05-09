import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  warning?: boolean;
}

export function MetricCard({
  label,
  value,
  description,
  icon,
  highlight,
  warning,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface rounded-xl p-6 border transition-all duration-200 group",
        highlight
          ? "border-brand/20 shadow-gold-glow hover:border-brand/30"
          : "border-white/[0.06] hover:border-white/[0.10] hover:shadow-card-hover"
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-text-2">
          {label}
        </span>
        <span
          className={cn(
            highlight
              ? "text-brand"
              : "text-text-3 group-hover:text-text-2 transition-colors"
          )}
        >
          {icon}
        </span>
      </div>
      <div
        className={cn(
          "text-3xl font-bold font-mono mt-3 tracking-tight",
          highlight ? "text-brand" : warning ? "text-warning" : "text-text-1"
        )}
      >
        {value}
      </div>
      <div className="text-xs text-text-3 mt-1">{description}</div>
    </div>
  );
}
