"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavProps {
  weekOffset: number;
  weekLabel: string;
}

export function WeekNav({ weekOffset, weekLabel }: WeekNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const go = (delta: number) => {
    const next = weekOffset + delta;
    router.push(next === 0 ? pathname : `${pathname}?week=${next}`);
  };

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={() => go(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[200px] text-center text-sm font-medium capitalize">
        {weekLabel}
      </span>
      <Button variant="outline" size="icon" onClick={() => go(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
