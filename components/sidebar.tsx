"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  CalendarDays,
  Settings,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",      href: "/dashboard",       icon: LayoutDashboard },
  { label: "Agente IA",      href: "/agente",          icon: Bot             },
  { label: "Conversaciones", href: "/conversaciones",  icon: MessageSquare   },
  { label: "Agenda",         href: "/agenda",          icon: CalendarDays    },
  { label: "Configuración",  href: "/configuracion",   icon: Settings        },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <Scissors className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold">Barbería Capital</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t px-5 py-3">
        <p className="text-xs text-muted-foreground">Demo v1.0</p>
      </div>
    </aside>
  );
}
