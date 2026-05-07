import { createClient } from "@/lib/supabase/server";
import { ConnectionCard } from "@/components/configuracion/connection-card";
import { Settings } from "lucide-react";

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from("social_connections")
    .select("id, platform, is_connected, display_name, connected_at")
    .order("platform", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-sm text-muted-foreground">
            Gestioná las conexiones con plataformas externas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(connections ?? []).map((conn) => (
          <ConnectionCard
            key={conn.id}
            platform={conn.platform}
            displayName={conn.display_name}
            isConnected={conn.is_connected}
            connectedAt={conn.connected_at}
          />
        ))}
      </div>

      {(connections ?? []).length === 0 && (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
          <p className="text-sm text-muted-foreground">No hay plataformas configuradas</p>
        </div>
      )}
    </div>
  );
}
