"use client";

import { PlatformIcon } from "@/components/shared/platform-icon";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlatformChipProps {
  platform: Platform | "all";
  count: number;
  active: boolean;
  onClick: () => void;
}

const LABELS: Record<Platform | "all", string> = {
  all: "Todas",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  tiktok: "TikTok",
  google: "Google",
};

export function PlatformChip({ platform, count, active, onClick }: PlatformChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all border",
        active
          ? "bg-brand/10 border-brand/30 text-brand"
          : "bg-surface-raised border-white/[0.06] text-text-2 hover:bg-surface-hover hover:text-text-1"
      )}
    >
      {platform !== "all" && <PlatformIcon platform={platform as Platform} size={12} />}
      <span>{LABELS[platform]}</span>
      <span className={cn("text-[10px]", active ? "text-brand/70" : "text-text-3")}>
        {count}
      </span>
    </button>
  );
}
