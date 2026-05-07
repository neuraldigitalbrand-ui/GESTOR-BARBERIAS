"use client";

import { useOptimistic, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PlatformIcon, platformLabel } from "@/components/platform-icon";
import { togglePlatformConnection } from "@/lib/actions/connections";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ConnectionCardProps {
  platform: string;
  displayName: string | null;
  isConnected: boolean;
  connectedAt: string | null;
}

export function ConnectionCard({
  platform,
  displayName,
  isConnected,
  connectedAt,
}: ConnectionCardProps) {
  const [optimisticConnected, setOptimisticConnected] = useOptimistic(isConnected);
  const [, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      setOptimisticConnected(checked);
      await togglePlatformConnection(platform);
    });
  };

  const connectedLabel = connectedAt
    ? format(new Date(connectedAt), "d 'de' MMMM 'de' yyyy", { locale: es })
    : null;

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="flex items-center gap-4">
          <PlatformIcon platform={platform} size={32} />
          <div>
            <p className="font-semibold">{platformLabel(platform)}</p>
            {displayName && (
              <p className="text-sm text-muted-foreground">{displayName}</p>
            )}
            {connectedLabel && (
              <p className="text-xs text-muted-foreground capitalize">
                Conectado el {connectedLabel}
              </p>
            )}
          </div>
        </div>
        <Switch
          checked={optimisticConnected}
          onCheckedChange={handleToggle}
        />
      </CardContent>
    </Card>
  );
}
