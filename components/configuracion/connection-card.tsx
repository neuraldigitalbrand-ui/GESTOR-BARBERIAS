"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { toast } from "@/components/shared/toast-provider";
import { togglePlatformConnection } from "@/lib/actions/connections";
import type { PlatformConnection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConnectionCardProps {
  connection: PlatformConnection;
}

export function ConnectionCard({ connection: c }: ConnectionCardProps) {
  const [optimisticConnected, setOptimisticConnected] = useOptimistic(c.connected);
  const [, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !optimisticConnected;
    startTransition(async () => {
      setOptimisticConnected(next);
      try {
        await togglePlatformConnection(c.id);
        toast.success(next ? `${c.name} conectado` : `${c.name} desconectado`);
      } catch {
        setOptimisticConnected(!next);
        toast.error("Error al cambiar la conexión");
      }
    });
  };

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border p-6 transition-all duration-200 hover:border-white/[0.10]",
        optimisticConnected ? "border-white/[0.10]" : "border-white/[0.06]"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-center">
          <PlatformIcon platform={c.id} size={22} />
        </div>
        <Switch checked={optimisticConnected} onCheckedChange={handleToggle} />
      </div>

      <h3 className="text-base font-semibold text-text-1 mt-4">{c.name}</h3>
      <div className="text-sm text-text-2 mt-0.5 font-mono">{c.display}</div>

      <p className="text-xs text-text-3 mt-2 leading-relaxed">{c.description}</p>

      {c.metrics && optimisticConnected && (
        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-3">Volumen</div>
            <div className="text-xs text-text-1 font-medium mt-1">{c.metrics.msgs}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-text-3">Estado</div>
            <div className="text-xs text-text-1 font-medium mt-1">{c.metrics.resp}</div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              optimisticConnected ? "bg-success animate-pulse-dot" : "bg-text-3"
            )}
          />
          <span className={optimisticConnected ? "text-success" : "text-text-3"}>
            {optimisticConnected ? "Conectado" : "Desconectado"}
          </span>
        </div>
        {c.since && optimisticConnected && (
          <span className="text-[10px] text-text-3">Desde {c.since}</span>
        )}
      </div>
    </div>
  );
}
