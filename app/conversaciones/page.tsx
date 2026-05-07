import { createClient } from "@/lib/supabase/server";
import { ConversationList } from "@/components/conversaciones/conversation-list";
import { PlatformIcon, platformLabel, ALL_PLATFORMS } from "@/components/platform-icon";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchParams {
  platform?: string;
}

export default async function ConversacionesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { platform } = await searchParams;
  const activePlatform = platform ?? null;

  const supabase = await createClient();

  let query = supabase
    .from("conversations")
    .select("id, platform, last_message_at, unread_count, leads(name)")
    .order("last_message_at", { ascending: false });

  if (activePlatform) {
    query = query.eq("platform", activePlatform);
  }

  const { data: convs } = await query;

  // Fetch last message per conversation
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

  const conversations = (convs ?? []).map((c) => ({
    id: c.id,
    platform: c.platform,
    last_message_at: c.last_message_at,
    unread_count: c.unread_count,
    leads: Array.isArray(c.leads) ? c.leads[0] ?? null : c.leads,
    last_message: lastMessages[c.id] ?? null,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Conversaciones</h1>
          <p className="text-sm text-muted-foreground">
            {conversations.length}{" "}
            {conversations.length === 1 ? "conversación" : "conversaciones"}
            {activePlatform ? ` en ${platformLabel(activePlatform)}` : " en total"}
          </p>
        </div>
      </div>

      {/* Platform filter chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/conversaciones"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
            !activePlatform
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted"
          )}
        >
          Todas
        </Link>
        {ALL_PLATFORMS.map((p) => (
          <Link
            key={p}
            href={`/conversaciones?platform=${p}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              activePlatform === p
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-muted"
            )}
          >
            <PlatformIcon platform={p} size={14} />
            {platformLabel(p)}
          </Link>
        ))}
      </div>

      {/* List */}
      <ConversationList conversations={conversations} activePlatform={activePlatform} />
    </div>
  );
}
