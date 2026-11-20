"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CLUB } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { ClubSwitcher } from "./ClubSwitcher";
import { Logo } from "./Logo";
import { SessionLinks } from "./SessionLinks";

const NAV = [
  { href: "/tournaments", label: "Турниры" },
  { href: "/rating", label: "Рейтинг" },
  { href: "/players", label: "Игроки" },
  { href: "/news", label: "Новости" },
  { href: "/archive", label: "Архив" },
  { href: "/club", label: "Клуб" },
];

function isActive(pathname: string, href: string) {
  if (href === "/club") return ["/club", "/rules", "/contacts"].some((path) => pathname.startsWith(path));
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-40">
      <div className="page-shell flex items-start justify-between gap-8 py-6 md:py-7">
        <Logo />

        <nav className="hidden items-center gap-7 pt-1 lg:flex" aria-label="Основная навигация">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link text-[0.66rem] font-medium uppercase tracking-[0.16em]",
                  active ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden flex-col items-end gap-1.5 pt-1 lg:flex">
          <div className="flex items-center gap-3">
            <ClubSwitcher />
            <span className="text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted">
              Сезон {CLUB.season}
            </span>
          </div>
          <SessionLinks />
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ClubSwitcher />
          <SessionLinks compact />
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            Меню
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 flex flex-col bg-canvas px-5 pb-8 pt-6"
        >
          <div className="flex items-start justify-between">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-ink"
            >
              Закрыть
            </button>
          </div>

          <nav className="mt-14 flex flex-1 flex-col gap-1" aria-label="Мобильная навигация">
            {[
              { href: "/", label: "Главная" },
              ...NAV,
              { href: "/clubs", label: "Клубы" },
              { href: "/cabinet", label: "Кабинет" },
              { href: "/login", label: "Войти" },
            ].map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-line py-3.5"
              >
                <span className="w-6 shrink-0 text-[0.58rem] tabular-nums text-ink-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="display text-[2rem] leading-none">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 grid gap-1 text-[0.62rem] uppercase tracking-[0.14em] text-ink-muted">
            <span>{CLUB.address}</span>
            <span>{CLUB.hours}</span>
            <a href={`tel:${CLUB.phoneBookings.replace(/\D/g, "")}`} className="text-ink">
              {CLUB.phoneBookings}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
