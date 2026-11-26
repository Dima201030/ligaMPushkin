"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  canAccessOrganizer,
  fetchSession,
  logoutAccount,
  type MeSession,
} from "@/lib/api/auth";

export function SessionLinks({ compact = false }: { compact?: boolean }) {
  const [session, setSession] = useState<MeSession | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    fetchSession()
      .then((next) => {
        if (alive) setSession(next);
      })
      .catch(() => {
        if (alive) setSession(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (session === undefined) {
    return (
      <span className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
        …
      </span>
    );
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="text-[0.66rem] font-medium uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-60"
      >
        Войти
      </Link>
    );
  }

  const organizer = canAccessOrganizer(session);
  const cabinetHref = organizer ? "/organizer" : "/cabinet";
  const label = organizer ? "Организатор" : "Кабинет";

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
          setSession(null);
          window.location.href = "/";
        }}
      >
        Выйти
      </button>
    </div>
  );
}
