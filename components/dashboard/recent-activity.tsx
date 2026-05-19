import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { Platform } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityItem {
  id: string;
  name: string;
  platform: Platform;
  preview: string;
  time: string;
  unread: number;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="bg-surface rounded-2xl border border-white/[0.06] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-wider text-text-3 font-medium">
          Actividad reciente
        </h3>
        <Link
          href="/conversaciones"
          className="text-[11px] text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
        >
          Ver todas
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-3 py-4 text-center">
          Sin actividad reciente
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/conversaciones/${item.id}`}
              className="flex items-center gap-3 rounded-xl p-3 hover:bg-surface-raised transition-colors group"
            >
              {/* Avatar + platform dot */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-surface-raised border border-white/[0.06] flex items-center justify-center text-xs font-semibold text-text-1">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-bg flex items-center justify-center">
                  <PlatformIcon platform={item.platform} size={10} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-text-1 truncate">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-text-3 shrink-0">{item.time}</span>
                </div>
                <p className="text-xs text-text-3 truncate mt-0.5">{item.preview}</p>
              </div>

              {/* Unread badge */}
              {item.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-bg">{item.unread}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
