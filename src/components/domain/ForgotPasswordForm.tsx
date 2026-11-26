"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { requestPasswordReset } from "@/lib/api/auth";

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "sent"; message: string }
  | { kind: "error"; message: string };

export function ForgotPasswordForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    if (!email) {
      setState({ kind: "error", message: "Укажите email" });
      return;
    }

    setState({ kind: "working" });
    try {
      const result = await requestPasswordReset(email);
      if (result.ok) {
        setState({ kind: "sent", message: result.message });
        return;
      }
      setState({ kind: "error", message: result.error });
    } catch {
      setState({
        kind: "error",
        message: "Не удалось связаться с сервером платформы",
      });
    }
  }

  if (state.kind === "sent") {
    return (
      <div>
        <span className="grid size-14 place-items-center rounded-full bg-positive-soft text-positive">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl text-navy">Проверьте почту</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{state.message}</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Ссылка действует около часа. Если письма нет — загляните в «Спам».
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login" className="btn btn-primary">
            Ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Пароль</p>
      <h1 className="mt-3 text-3xl text-navy">Сброс пароля</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Укажите email аккаунта — пришлём ссылку для нового пароля.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
        <label>
          <span className="field-label">Email</span>
          <input
            className="field"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            disabled={state.kind === "working"}
          />
        </label>

        {state.kind === "error" && (
          <p role="alert" className="rounded-md bg-negative-soft px-3 py-2 text-xs font-medium text-negative">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary mt-1 w-full"
          disabled={state.kind === "working"}
        >
          {state.kind === "working" ? (
            "Отправляем…"
          ) : (
            <>
              Отправить ссылку
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-muted">
        <Mail className="size-3.5 shrink-0" aria-hidden="true" />
        Вспомнили пароль?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
