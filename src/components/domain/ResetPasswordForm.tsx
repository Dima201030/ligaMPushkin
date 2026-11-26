"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPasswordWithToken } from "@/lib/api/auth";

type State =
  | { kind: "idle" }
  | { kind: "working" }
  | { kind: "ok" }
  | { kind: "error"; message: string };

export function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<State>(
    token ? { kind: "idle" } : { kind: "error", message: "В ссылке нет токена сброса" },
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setState({ kind: "error", message: "В ссылке нет токена сброса" });
      return;
    }

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 8) {
      setState({ kind: "error", message: "Пароль должен быть не короче 8 символов" });
      return;
    }
    if (password !== confirm) {
      setState({ kind: "error", message: "Пароли не совпадают" });
      return;
    }

    setState({ kind: "working" });
    try {
      const result = await resetPasswordWithToken(token, password);
      if (result.ok) {
        setState({ kind: "ok" });
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

  if (state.kind === "ok") {
    return (
      <div>
        <span className="grid size-14 place-items-center rounded-full bg-positive-soft text-positive">
          <Check className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl text-navy">Пароль обновлён</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          Можно войти с новым паролем. Старые сессии завершены.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/login" className="btn btn-primary">
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <span className="grid size-14 place-items-center rounded-full bg-warning-soft text-warning">
          <KeyRound className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl text-navy">Ссылка неполная</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          В адресе нет токена сброса. Запросите новое письмо на странице «Забыли пароль?».
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/forgot-password" className="btn btn-primary">
            Запросить ссылку
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Ко входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Пароль</p>
      <h1 className="mt-3 text-3xl text-navy">Новый пароль</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Придумайте пароль не короче 8 символов.
      </p>

      <form className="mt-8 grid gap-4" onSubmit={handleSubmit} noValidate>
        <label>
          <span className="field-label">Новый пароль</span>
          <span className="relative block">
            <input
              className="field pr-10"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              minLength={8}
              disabled={state.kind === "working"}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-faint hover:text-ink"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </span>
        </label>

        <label>
          <span className="field-label">Повторите пароль</span>
          <input
            className="field"
            type={showPassword ? "text" : "password"}
            name="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            minLength={8}
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
            "Сохраняем…"
          ) : (
            <>
              Сохранить пароль
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-xs text-ink-muted">
        Ссылка устарела?{" "}
        <Link href="/forgot-password" className="font-semibold text-accent hover:underline">
          Запросить новую
        </Link>
      </p>
    </div>
  );
}
