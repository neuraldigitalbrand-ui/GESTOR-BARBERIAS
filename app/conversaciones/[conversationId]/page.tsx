import { createClient } from "@/lib/supabase/server";
import { MessageList } from "@/components/conversaciones/message-list";
import { PlatformIcon, platformLabel } from "@/components/platform-icon";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Input } from "@/components/ui/input";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, platform, leads(name)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender, content, sent_at")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  const leadName = Array.isArray(conv.leads)
    ? (conv.leads[0]?.name ?? "Cliente")
    : (conv.leads?.name ?? "Cliente");

  const messages = (msgs ?? []).map((m) => ({
    id: m.id,
    sender: m.sender,
    content: m.content,
    sent_at: m.sent_at,
  }));

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <Link
          href="/conversaciones"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex flex-1 items-center gap-2">
          <span className="font-semibold">{leadName}</span>
          <PlatformIcon platform={conv.platform} size={16} />
          <span className="text-sm text-muted-foreground">{platformLabel(conv.platform)}</span>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Footer — read-only input */}
      <div className="shrink-0 border-t px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            disabled
            placeholder="Las respuestas las maneja el agente IA"
            className="flex-1 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
