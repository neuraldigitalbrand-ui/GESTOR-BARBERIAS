import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

export function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.from === "agent";
  return (
    <div className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
      <div className="max-w-[70%] flex flex-col gap-1">
        {isAgent && (
          <div className="text-[10px] text-text-3 flex items-center gap-1 px-1">
            <Bot className="w-2.5 h-2.5 text-brand" /> Agente IA
          </div>
        )}
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed border",
            isAgent
              ? "bg-brand/10 border-brand/20 text-text-1 rounded-2xl rounded-br-sm"
              : "bg-surface-raised border-white/[0.06] text-text-1 rounded-2xl rounded-bl-sm"
          )}
        >
          {message.text}
        </div>
        <div
          className={cn(
            "text-[10px] text-text-3 px-1",
            isAgent ? "text-right" : "text-left"
          )}
        >
          {message.time}
        </div>
      </div>
    </div>
  );
}
