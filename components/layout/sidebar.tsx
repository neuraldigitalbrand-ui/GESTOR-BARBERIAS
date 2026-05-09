"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scissors,
  LayoutDashboard,
  Bot,
  MessageSquare,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agente", label: "Agente IA", icon: Bot },
  { href: "/conversaciones", label: "Conversaciones", icon: MessageSquare },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] shrink-0 bg-surface border-r border-white/[0.06] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center">
          <Scissors className="w-4 h-4 text-brand" strokeWidth={2.2} />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold text-text-1 tracking-tight">
            BarberOS
          </div>
          <div className="text-[11px] text-text-3">Panel de gestión</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-5 px-3 space-y-0.5">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.14em] text-text-3">
          Workspace
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative h-9 px-3 rounded-lg flex items-center gap-3 text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-text-2 hover:bg-surface-raised hover:text-text-1"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-brand rounded-r" />
              )}
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 pb-5">
        <div className="border-t border-white/[0.06] pt-4 flex items-center gap-3">
          <div className="w-[30px] h-[30px] rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand text-xs font-semibold shrink-0">
            BC
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <div className="text-[13px] text-text-1 truncate">
              Barbería Capital
            </div>
            <div className="text-[11px] text-text-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse-dot" />
              Plan Pro
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Cerrar sesión"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-3 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
