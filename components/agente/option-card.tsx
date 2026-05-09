"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  Icon: LucideIcon;
  name: string;
  desc: string;
}

export function OptionCard({ selected, onClick, Icon, name, desc }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-4 flex items-start gap-3 transition-all duration-150",
        selected
          ? "border-brand/40 bg-brand/[0.06] shadow-gold-glow"
          : "border-white/[0.06] bg-surface hover:border-white/[0.12] hover:bg-surface-raised"
      )}
    >
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-brand/15 text-brand" : "bg-white/[0.04] text-text-2"
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", selected ? "text-brand" : "text-text-1")}>
            {name}
          </span>
          {selected && (
            <span className="text-[10px] text-brand">✓ Seleccionado</span>
          )}
        </div>
        <p className="text-xs text-text-2 mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
}
