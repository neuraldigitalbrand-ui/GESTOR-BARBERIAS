"use client";

import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { PlatformIcon } from "@/components/shared/platform-icon";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({ conv, active, onClick, onDelete }: ConversationItemProps) {
  return (
    <div
      className={cn(
        "w-full text-left py-3 px-5 flex items-start gap-3 transition-colors relative group cursor-pointer",
        active ? "bg-brand/[0.06]" : "hover:bg-surface"
      )}
      onClick={onClick}
    >
      {active && (
        <span className="absolute right-0 top-2 bottom-2 w-[2px] bg-brand rounded-l" />
      )}
      <Avatar name={conv.name} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-text-1 truncate">{conv.name}</span>
          <span className="text-[11px] text-text-3 shrink-0 group-hover:hidden">{conv.time}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
            className="hidden group-hover:flex w-6 h-6 items-center justify-center rounded text-text-3 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
    </div>
  );
}
