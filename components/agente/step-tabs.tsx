"use client";

import { cn } from "@/lib/utils";

interface StepTabsProps {
  steps: string[];
  active: number;
  onSelect: (i: number) => void;
}

export function StepTabs({ steps, active, onSelect }: StepTabsProps) {
  return (
    <div
      className="bg-surface border border-white/[0.06] rounded-xl p-1 grid"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {steps.map((s, i) => (
        <button
          key={s}
          onClick={() => onSelect(i)}
          className={cn(
            "h-9 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
            i === active
              ? "bg-brand/10 text-brand"
              : i < active
              ? "text-text-1 hover:bg-surface-raised"
              : "text-text-2 hover:bg-surface-raised"
          )}
        >
          <span
            className={cn(
              "w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center",
              i === active
                ? "bg-brand text-text-on-gold"
                : i < active
                ? "bg-success/20 text-success"
                : "bg-white/[0.06] text-text-2"
            )}
          >
            {i + 1}
          </span>
          <span className="hidden md:inline">{s}</span>
        </button>
      ))}
    </div>
  );
}
