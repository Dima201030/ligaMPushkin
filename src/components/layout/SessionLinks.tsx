"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCurrentUser, isOrganizerRole, logoutAccount, type LeagueUser } from "@/lib/api/auth";

export function SessionLinks({ compact = false }: { compact?: boolean }) {
  const [user, setUser] = useState<LeagueUser | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchCurrentUser()
      .then((next) => {
        if (alive) setUser(next);
      })
      .catch(() => {
        if (alive) setUser(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (user === undefined) {
    return (
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
        …
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-60"
      >
        Войти
      </Link>
    );
  }

  const cabinetHref = isOrganizerRole(user.role) ? "/organizer" : "/cabinet";
  const label = isOrganizerRole(user.role) ? "Организатор" : "Кабинет";

  return (
    <div className={compact ? "flex items-center gap-3" : "flex flex-col items-end gap-1.5"}>
      <Link
        href={cabinetHref}
        className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-60"
      >
        {label}
      </Link>
      <button
        type="button"
        className="text-[0.58rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-ink"
        onClick={async () => {
          await logoutAccount();
          setUser(null);
          window.location.href = "/";
        }}
      >
        Выйти
      </button>
    </div>
  );
}
