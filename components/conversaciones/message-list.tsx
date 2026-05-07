"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Message {
  id: string;
  sender: string;
  content: string;
  sent_at: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Sin mensajes</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((msg) => {
        const isAgent = msg.sender === "agent";
        const timeLabel = format(new Date(msg.sent_at), "HH:mm", { locale: es });

        return (
          <div
            key={msg.id}
            className={cn("flex", isAgent ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                isAgent
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground"
              )}
            >
              <p>{msg.content}</p>
              <p
                className={cn(
                  "mt-1 text-right text-[0.65rem]",
                  isAgent ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {timeLabel}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
