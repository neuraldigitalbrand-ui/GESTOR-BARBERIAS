import { createClient } from "@/lib/supabase/server";
import { ConnectionCard } from "@/components/configuracion/connection-card";
import { AccountInfo } from "@/components/configuracion/account-info";
import { PageHeader } from "@/components/shared/page-header";
import { Settings } from "lucide-react";
import type { PlatformConnection, Platform } from "@/lib/types";

const PLATFORM_META: Record<string, { name: string; description: string; display: string }> = {
  instagram: {
    name: "Instagram",
    display: "@barberia.capital",
    description: "Responde automáticamente los mensajes directos de Instagram.",
  },
  whatsapp: {
    name: "WhatsApp",
    display: "+598 9X XXX XXX",
    description: "Gestiona conversaciones de WhatsApp Business con el agente IA.",
  },
  messenger: {
    name: "Messenger",
    display: "Barbería Capital",
    description: "Atiende mensajes de Facebook Messenger de manera automática.",
  },
  tiktok: {
    name: "TikTok",
    display: "@barberia.capital",
    description: "Responde DMs de TikTok e interactúa con nuevos seguidores.",
  },
  google: {
    name: "Google",
    display: "Barbería Capital · Montevideo",
    description: "Gestiona reseñas y mensajes de Google Business.",
  },
};

export default async function ConfiguracionPage() {
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from("social_connections")
    .select("id, platform, is_connected, display_name, connected_at")
    .order("platform", { ascending: true });

  const platformConnections: PlatformConnection[] = (connections ?? [])
    .filter((c) => PLATFORM_META[c.platform])
    .map((c) => {
      const meta = PLATFORM_META[c.platform];
      const sinceDate = c.connected_at
        ? new Date(c.connected_at).toLocaleDateString("es-UY", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null;

      return {
        id: c.platform as Platform,
        name: meta.name,
        display: c.display_name ?? meta.display,
        connected: c.is_connected,
        since: sinceDate,
        description: meta.description,
        metrics: c.is_connected
          ? { msgs: "— mensajes", resp: "Activo" }
          : null,
      };
    });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Settings className="w-5 h-5" />}
        title="Configuración"
        subtitle="Gestioná las conexiones con plataformas externas"
      />

      <AccountInfo />

      <div className="space-y-2">
        <h2 className="text-[11px] uppercase tracking-wider text-text-3 px-0.5">
          Plataformas conectadas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {platformConnections.map((conn) => (
            <ConnectionCard key={conn.id} connection={conn} />
          ))}
        </div>
      </div>

      {platformConnections.length === 0 && (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
          <p className="text-sm text-text-3">No hay plataformas configuradas</p>
        </div>
      )}
    </div>
  );
}
