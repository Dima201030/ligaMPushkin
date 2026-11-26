"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Mail } from "lucide-react";
import { confirmEmailToken } from "@/lib/api/auth";

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "ok"; email?: string }
  | { kind: "error"; message: string };

export function ConfirmEmailForm({ token }: { token: string }) {
  const [state, setState] = useState<State>(
    token ? { kind: "working" } : { kind: "error", message: "В ссылке нет токена подтверждения" },
  );

  useEffect(() => {
    if (!token) return;
    let alive = true;
    confirmEmailToken(token)
      .then((result) => {
        if (!alive) return;
        if (result.ok) {
          setState({ kind: "ok", email: result.email });
          return;
        }
        setState({ kind: "error", message: result.error });
      })
      .catch(() => {
        if (alive) {
          setState({
            kind: "error",
            message: "Не удалось связаться с сервером платформы",
          });
        }
      });
    return () => {
      alive = false;
    };
  }, [token]);

  if (state.kind === "working" || state.kind === "idle") {
    return (
      <div>
        <p className="eyebrow">Email</p>
        <h1 className="mt-3 text-3xl text-navy">Подтверждаем адрес</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Проверяем ссылку из письма…
        </p>
      </div>
    );
  }

  if (state.kind === "ok") {
    return (
      <div>
        <span className="grid size-14 place-items-center rounded-full bg-positive-soft text-positive">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl text-navy">Email подтверждён</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          {state.email
            ? `Адрес ${state.email} подтверждён. Можно пользоваться кабинетом и записываться на турниры.`
            : "Адрес подтверждён. Можно пользоваться кабинетом и записываться на турниры."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/cabinet" className="btn btn-primary">
            В кабинет
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-full bg-warning-soft text-warning">
        <Mail className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl text-navy">Ссылка не сработала</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{state.message}</p>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Запросите новое письмо в кабинете или на странице входа, если вход
        ещё недоступен.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <Link href="/cabinet" className="btn btn-primary">
          В кабинет
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Ко входу
        </Link>
      </div>
    </div>
  );
}
