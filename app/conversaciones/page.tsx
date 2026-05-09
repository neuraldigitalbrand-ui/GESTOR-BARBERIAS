import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { MessageSquare } from "lucide-react";
import { ConversacionesClient } from "./conversaciones-client";
import type { Conversation, Platform } from "@/lib/types";
import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

function timeLabel(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Ayer";
  return format(d, "d MMM", { locale: es });
}

export default async function ConversacionesPage() {
  const supabase = await createClient();

  const { data: convs } = await supabase
    .from("conversations")
    .select("id, platform, last_message_at, unread_count, leads(name, phone)")
    .order("last_message_at", { ascending: false });

  const conversationIds = (convs ?? []).map((c) => c.id);
  const lastMessages: Record<string, string> = {};

  if (conversationIds.length > 0) {
    const { data: msgs } = await supabase
      .from("messages")
      .select("conversation_id, content, sent_at")
      .in("conversation_id", conversationIds)
      .order("sent_at", { ascending: false });

    for (const msg of msgs ?? []) {
      if (!lastMessages[msg.conversation_id]) {
        lastMessages[msg.conversation_id] = msg.content;
      }
    }
  }

  const conversations: Conversation[] = (convs ?? []).map((c) => {
    const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
    return {
      id: c.id,
      name: lead?.name ?? "Cliente",
      platform: c.platform as Platform,
      handle: lead?.phone ?? `#${c.id.slice(0, 6)}`,
      unread: c.unread_count ?? 0,
      time: timeLabel(c.last_message_at),
      preview: lastMessages[c.id] ?? "Sin mensajes",
      messages: [],
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MessageSquare className="w-5 h-5" />}
        title="Conversaciones"
        subtitle={`${conversations.length} ${conversations.length === 1 ? "conversación" : "conversaciones"}`}
      />
      <ConversacionesClient conversations={conversations} />
    </div>
  );
}
