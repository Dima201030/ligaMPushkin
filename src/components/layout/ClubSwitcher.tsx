"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { fetchClubs, type LeagueClub } from "@/lib/api/clubs";
import { CLUB_COOKIE, clubPath, DEFAULT_CLUB_SLUG, normalizeClubSlug } from "@/lib/club/tenant";
import { cn } from "@/lib/utils";

function readCookieSlug(): string {
  if (typeof document === "undefined") return DEFAULT_CLUB_SLUG;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CLUB_COOKIE}=`));
  return normalizeClubSlug(match?.slice(CLUB_COOKIE.length + 1)) || DEFAULT_CLUB_SLUG;
}

export function ClubSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [clubs, setClubs] = useState<LeagueClub[]>([]);
  const [activeSlug, setActiveSlug] = useState(DEFAULT_CLUB_SLUG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setActiveSlug(readCookieSlug());
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetchClubs()
      .then((list) => {
        if (!cancelled) {
          setClubs(list);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = clubs.find((club) => club.slug === activeSlug) ?? null;
  const label = active?.name || (loaded ? "Клуб" : "…");

  // Single-club install: show name, no menu noise.
  if (loaded && clubs.length <= 1) {
    return (
      <span
        className={cn(
          "max-w-[11rem] truncate text-[0.66rem] uppercase tracking-[0.16em] text-ink-muted",
          className,
        )}
        title={active?.city || undefined}
      >
        {label}
      </span>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="max-w-[12rem] truncate text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink-muted hover:text-ink"
      >
        {label}
      </button>
      {open && (
        <ul
          id={menuId}
          role="listbox"
          className="absolute right-0 z-50 mt-2 min-w-[14rem] border border-line bg-canvas py-1 shadow-sm"
        >
          {clubs.map((club) => {
            const selected = club.slug === activeSlug;
            return (
              <li key={club.id} role="option" aria-selected={selected}>
                <Link
                  href={clubPath(club.slug, pathname)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-left text-[0.8rem] leading-snug hover:bg-line/40",
                    selected ? "text-ink" : "text-ink-muted",
                  )}
                >
                  <span className="block font-medium text-ink">{club.name}</span>
                  {club.city ? (
                    <span className="mt-0.5 block text-[0.68rem] text-ink-faint">{club.city}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
          <li className="border-t border-line">
            <Link
              href="/clubs"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
            >
              Все клубы
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
