"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConversationItem } from "@/components/conversaciones/conversation-item";
import { PlatformChip } from "@/components/conversaciones/platform-chip";
import type { Conversation, Platform } from "@/lib/types";

const ALL_PLATFORMS: (Platform | "all")[] = [
  "all",
  "instagram",
  "whatsapp",
  "messenger",
  "tiktok",
  "google",
];

interface ConversacionesClientProps {
  conversations: Conversation[];
}

export function ConversacionesClient({ conversations }: ConversacionesClientProps) {
  const router = useRouter();
  const [activePlatform, setActivePlatform] = useState<Platform | "all">("all");

  const counts: Record<Platform | "all", number> = {
    all: conversations.length,
    instagram: conversations.filter((c) => c.platform === "instagram").length,
    whatsapp: conversations.filter((c) => c.platform === "whatsapp").length,
    messenger: conversations.filter((c) => c.platform === "messenger").length,
    tiktok: conversations.filter((c) => c.platform === "tiktok").length,
    google: conversations.filter((c) => c.platform === "google").length,
  };

  const filtered =
    activePlatform === "all"
      ? conversations
      : conversations.filter((c) => c.platform === activePlatform);

  return (
    <div>
      {/* Platform filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
        {ALL_PLATFORMS.filter((p) => p === "all" || counts[p] > 0).map((p) => (
          <PlatformChip
            key={p}
            platform={p}
            count={counts[p]}
            active={activePlatform === p}
            onClick={() => setActivePlatform(p)}
          />
        ))}
      </div>

      {/* Conversation list */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/[0.08] p-12">
          <p className="text-sm text-text-3">No hay conversaciones</p>
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {filtered.map((conv) => (
            <ConversationItem
              key={conv.id}
              conv={conv}
              active={false}
              onClick={() => router.push(`/conversaciones/${conv.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
