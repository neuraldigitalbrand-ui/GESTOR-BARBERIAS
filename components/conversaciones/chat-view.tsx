"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bot, Lock, MoreHorizontal, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PlatformIcon, platformLabel } from "@/components/shared/platform-icon";
import { MessageBubble } from "@/components/conversaciones/message-bubble";
import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message } from "@/lib/types";
import { format, isToday, isYesterday } from "date-fns";

function msgDate(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return "today";
  if (isYesterday(d)) return "yesterday";
  return format(d, "dd/MM/yyyy");
}

export function ChatView({ conversation }: { conversation: Conversation }) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(conversation.messages.length);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const supabase = createClient();

    async function fetchMessages() {
      const { data } = await supabase
        .from("messages")
        .select("id, sender, content, sent_at")
        .eq("conversation_id", conversation.id)
        .order("sent_at", { ascending: true });

      if (!data || data.length === 0) return; // nunca limpiar mensajes existentes

      const fetched: Message[] = data.map((m) => ({
        from: m.sender === "agent" ? "agent" : "lead",
        text: m.content,
        time: format(new Date(m.sent_at), "HH:mm"),
        date: msgDate(m.sent_at),
      }));

      // Solo actualizar si hay más mensajes que antes
      if (fetched.length > lastCountRef.current) {
        lastCountRef.current = fetched.length;
        setMessages(fetched);
      } else if (lastCountRef.current === 0 && fetched.length > 0) {
        // Caso inicial: server no trajo mensajes pero client sí
        lastCountRef.current = fetched.length;
        setMessages(fetched);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);

    // Realtime
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const m = payload.new as {
            id: string;
            sender: string;
            content: string;
            sent_at: string;
          };
          const newMsg: Message = {
            from: m.sender === "agent" ? "agent" : "lead",
            text: m.content,
            time: format(new Date(m.sent_at), "HH:mm"),
            date: msgDate(m.sent_at),
          };
          setMessages((prev) => {
            lastCountRef.current = prev.length + 1;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  const groups = messages.reduce<Record<string, Message[]>>(
    (acc, m) => {
      (acc[m.date] = acc[m.date] || []).push(m);
      return acc;
    },
    {}
  );

  const dateLabel = (k: string) =>
    k === "today" ? "Hoy" : k === "yesterday" ? "Ayer" : k;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="h-[60px] border-b border-white/[0.06] px-5 flex items-center gap-3 bg-surface/30 backdrop-blur-sm shrink-0">
        <Avatar name={conversation.name} size="sm" />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-text-1">{conversation.name}</div>
          <div className="text-[11px] text-text-2 flex items-center gap-1.5 mt-0.5">
            <PlatformIcon platform={conversation.platform} size={10} />
            {platformLabel(conversation.platform)} · {conversation.handle}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg hover:bg-surface-raised text-text-2 hover:text-text-1 flex items-center justify-center transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-surface-raised text-text-2 hover:text-text-1 flex items-center justify-center transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-none">
        {Object.entries(groups).map(([date, msgs]) => (
          <div key={date} className="space-y-3">
            <div className="text-[11px] text-text-3 text-center py-2 uppercase tracking-wider">
              {dateLabel(date)}
            </div>
            {msgs.map((m, i) => (
              <MessageBubble key={i} message={m} />
            ))}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-text-3">Sin mensajes</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="h-[64px] border-t border-white/[0.06] px-5 flex items-center gap-3 bg-surface/30 backdrop-blur-sm shrink-0">
        <Bot className="w-4 h-4 text-brand shrink-0" />
        <div className="flex-1 h-9 rounded-lg bg-bg border border-white/[0.06] px-3 flex items-center text-sm text-text-3 italic select-none">
          El agente responde automáticamente
        </div>
        <Lock className="w-3.5 h-3.5 text-text-3 shrink-0" />
      </div>
    </div>
  );
}
