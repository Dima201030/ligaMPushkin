"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Menu,
  Network,
  Newspaper,
  Trophy,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { Avatar } from "@/components/ui/Avatar";

const GROUPS = [
  {
    label: "Управление",
    items: [
      { href: "/organizer", label: "Обзор", icon: LayoutDashboard, exact: true },
      { href: "/organizer/applications", label: "Заявки игроков", icon: UserCheck },
      { href: "/organizer/tournaments", label: "Турниры", icon: Trophy },
      { href: "/organizer/matches", label: "Матчи и счёт", icon: CalendarDays },
      { href: "/organizer/bracket", label: "Генератор сеток", icon: Network },
    ],
  },
  {
    label: "База",
    items: [
      { href: "/organizer/players", label: "Игроки", icon: Users },
      { href: "/organizer/ratings", label: "Рейтинг", icon: BarChart3 },
      { href: "/organizer/content", label: "Контент", icon: Newspaper },
    ],
  },
];

const BADGES: Record<string, string> = {
  "/organizer/applications": "new",
  "/organizer/bracket": "new",
};

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContent({
  onNavigate,
  organizerName,
  organizerEmail,
}: {
  onNavigate?: () => void;
  organizerName: string;
  organizerEmail: string;
}) {
  const pathname = usePathname();
  const [firstName = "Орг", lastName = ""] = organizerName.split(" ");

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo variant="light" />
      </div>

      <div className="mb-6 mt-6 border-t border-white/12 px-5 pt-5">
        <p className="text-[0.56rem] uppercase tracking-[0.16em] text-sky/80">Организатор</p>
        <p className="mt-2 text-xs text-white/70">Сезон 2026 · платформа</p>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-5 pb-6" aria-label="Навигация организатора">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-[0.56rem] uppercase tracking-[0.16em] text-white/35">
              {group.label}
            </p>
            <ul>
              {group.items.map((item) => {
                const active = isActive(pathname, item.href, item.exact);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-2.5 border-l py-2.5 pl-3 pr-1 text-[0.76rem] transition-colors",
                        active
                          ? "border-sky text-white"
                          : "border-white/10 text-white/55 hover:border-white/40 hover:text-white",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active ? "text-sky" : "text-white/35")} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {BADGES[item.href] && (
                        <span className="text-[0.5rem] uppercase tracking-[0.14em] text-sky">
                          {BADGES[item.href]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/12 px-5 py-5">
        <div className="flex items-center gap-3">
          <Avatar firstName={firstName} lastName={lastName || firstName} size="sm" tone="navy" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">{organizerName}</p>
            <p className="truncate text-[0.58rem] uppercase tracking-[0.12em] text-white/40">{organizerEmail}</p>
          </div>
        </div>
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-4 flex items-center justify-between text-[0.6rem] uppercase tracking-[0.14em] text-white/45 transition-colors hover:text-white"
        >
          На публичный сайт
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export function OrganizerNav({
  organizerName,
  organizerEmail,
}: {
  organizerName: string;
  organizerEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-canvas px-4 lg:hidden print:hidden">
        <Logo compact />
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setOpen(true)}
          aria-label="Открыть меню организатора"
        >
          <Menu className="size-4" aria-hidden="true" />
          Меню
        </button>
      </div>

      <aside className="sticky top-0 hidden h-screen bg-navy lg:block print:hidden">
        <SidebarContent organizerName={organizerName} organizerEmail={organizerEmail} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Меню организатора">
          <button
            type="button"
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[286px] bg-navy shadow-modal">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
            >
              <X className="size-4" />
            </button>
            <SidebarContent
              onNavigate={() => setOpen(false)}
              organizerName={organizerName}
              organizerEmail={organizerEmail}
            />
          </div>
        </div>
      )}
    </>
  );
}
