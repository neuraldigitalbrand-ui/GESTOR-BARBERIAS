import { createClient } from "@/lib/supabase/server";
import { ChatView } from "@/components/conversaciones/chat-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Conversation, Platform, Message } from "@/lib/types";
import { format, isToday, isYesterday } from "date-fns";

function msgDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "today";
  if (isYesterday(d)) return "yesterday";
  return format(d, "dd/MM/yyyy");
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id, platform, leads(name, phone)")
    .eq("id", conversationId)
    .maybeSingle();

  if (!conv) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("id, sender, content, sent_at")
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  const lead = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads;
  const leadName = lead?.name ?? "Cliente";
  const leadHandle = lead?.phone ?? `#${conv.id.slice(0, 6)}`;

  const messages: Message[] = (msgs ?? []).map((m) => ({
    from: m.sender === "agent" ? "agent" : "lead",
    text: m.content,
    time: format(new Date(m.sent_at), "HH:mm"),
    date: msgDate(m.sent_at),
  }));

  const conversation: Conversation = {
    id: conv.id,
    name: leadName,
    platform: conv.platform as Platform,
    handle: leadHandle,
    unread: 0,
    time: "",
    preview: "",
    messages,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.06]">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/conversaciones">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <ChatView conversation={conversation} />
      </div>
    </div>
  );
}
