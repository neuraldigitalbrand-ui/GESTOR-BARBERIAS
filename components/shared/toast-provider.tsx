"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Toast = { id: number; type: "success" | "error"; message: string };

let listeners: ((t: Toast) => void)[] = [];
let counter = 0;

export const toast = {
  success: (message: string) =>
    listeners.forEach((l) => l({ id: ++counter, type: "success", message })),
  error: (message: string) =>
    listeners.forEach((l) => l({ id: ++counter, type: "error", message })),
};

export function ToastProvider() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    const onPush = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(
        () => setItems((prev) => prev.filter((x) => x.id !== t.id)),
        3000
      );
    };
    listeners.push(onPush);
    return () => {
      listeners = listeners.filter((l) => l !== onPush);
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto bg-surface border rounded-xl px-4 py-3 shadow-elevated flex items-center gap-3 min-w-[260px] animate-fade-in",
            t.type === "success" ? "border-success/30" : "border-destructive/30"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-success" />
          ) : (
            <XCircle className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm text-text-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
