import { Activity } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { Platform } from "@/lib/types";

interface ActivityItem {
  time: string;
  channel: Platform;
  name: string;
  action: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-surface rounded-xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-text-2">
          <Activity className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.14em]">Actividad reciente</span>
        </div>
        <span className="text-[10px] text-text-3">Hoy</span>
      </div>
      {activities.length === 0 ? (
        <p className="text-sm text-text-3">Sin actividad reciente</p>
      ) : (
        <ul className="space-y-3">
          {activities.map((e, i) => (
            <li key={i} className="flex items-start gap-3 py-1">
              <span className="text-[11px] font-mono text-text-3 w-10 mt-0.5 shrink-0">
                {e.time}
              </span>
              <span className="mt-0.5">
                <PlatformIcon platform={e.channel} size={12} />
              </span>
              <p className="text-sm text-text-1 leading-snug">
                <span className="font-medium">{e.name}</span>
                <span className="text-text-2"> {e.action}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
