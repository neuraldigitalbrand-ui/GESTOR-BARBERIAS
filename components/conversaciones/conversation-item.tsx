"use client";

import { Avatar } from "@/components/ui/avatar";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}

export function ConversationItem({ conv, active, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left py-3 px-5 flex items-start gap-3 transition-colors relative",
        active ? "bg-brand/[0.06]" : "hover:bg-surface"
      )}
    >
      {active && (
        <span className="absolute right-0 top-2 bottom-2 w-[2px] bg-brand rounded-l" />
      )}
      <Avatar name={conv.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text-1 truncate">{conv.name}</span>
          <span className="text-[11px] text-text-3 shrink-0">{conv.time}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PlatformIcon platform={conv.platform} size={11} />
          <p className="text-xs text-text-2 truncate">{conv.preview}</p>
        </div>
      </div>
      {conv.unread > 0 && (
        <span className="ml-1 mt-1 min-w-[20px] h-[18px] px-1.5 rounded-full bg-brand text-text-on-gold text-[10px] font-bold flex items-center justify-center shrink-0">
          {conv.unread}
        </span>
      )}
    </button>
  );
}
